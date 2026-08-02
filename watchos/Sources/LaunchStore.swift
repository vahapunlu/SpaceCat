import Foundation
import WidgetKit

private let allowedWebcastHosts: Set<String> = [
    "youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be",
    "x.com", "www.x.com", "twitter.com", "www.twitter.com",
    "bilibili.com", "www.bilibili.com", "live.bilibili.com", "b23.tv",
]

func safeWebcastURL(_ value: String) -> URL? {
    guard let components = URLComponents(string: value),
          components.scheme?.lowercased() == "https",
          let host = components.host?.lowercased(),
          allowedWebcastHosts.contains(host),
          components.user == nil,
          components.password == nil,
          components.port == nil || components.port == 443
    else { return nil }
    return components.url
}

@MainActor
final class LaunchStore: ObservableObject {
    @Published var launches: [Launch] = []
    @Published var isLoading = false

    #if DEBUG
    private static let baseURL = "https://lldev.thespacedevs.com/2.3.0"
    #else
    private static let baseURL = "https://ll.thespacedevs.com/2.3.0"
    #endif

    private static let cacheKey = "launches_cache_v1"

    init() {
        loadCache()
    }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let parsed = try await Self.fetchLaunches()
            let old = launches
            launches = parsed
            saveCache(parsed)
            NotificationManager.onRefresh(old: old, new: parsed)
            WidgetCenter.shared.reloadAllTimelines()
        } catch {
            // Ağ hatasında önbellek gösterilmeye devam eder
        }
    }

    /// LL2'den sıradaki fırlatmaları çeker (uygulama + arka plan senkronu ortak yolu)
    static func fetchLaunches() async throws -> [Launch] {
        // detailed mode: vidURLs (canlı yayın) + webcast_live yalnızca bu modda gelir.
        guard let url = URL(string: "\(baseURL)/launches/upcoming/?mode=detailed&limit=8")
        else { throw URLError(.badURL) }
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(LaunchListResponse.self, from: data)
        let iso = ISO8601DateFormatter()
        return response.results.compactMap { dto -> Launch? in
                guard let netString = dto.net, let net = iso.date(from: netString) else { return nil }
                // En yüksek öncelikli (en küçük priority) geçerli URL'li yayını seç.
                let webcast = (dto.vidURLs ?? [])
                    .filter { safeWebcastURL($0.url ?? "") != nil }
                    .min { ($0.priority ?? .max) < ($1.priority ?? .max) }
                let milestones = (dto.timeline ?? []).compactMap(normalizeMilestone)
                    .reduce(into: [LaunchMilestone]()) { result, event in
                        if !result.contains(where: { $0.secondsFromT0 == event.secondsFromT0 && $0.code == event.code }) {
                            result.append(event)
                        }
                    }
                    .sorted { $0.secondsFromT0 < $1.secondsFromT0 }
                return Launch(
                    id: dto.id,
                    name: dto.name,
                    net: net,
                    statusAbbrev: dto.status?.abbrev ?? "TBD",
                    statusName: dto.status?.name ?? "",
                    agency: dto.launch_service_provider?.name ?? "",
                    agencyAbbrev: dto.launch_service_provider?.abbrev,
                    pad: dto.pad?.name ?? "",
                    location: dto.pad?.location?.name ?? "",
                    missionDescription: dto.mission?.description ?? "",
                    orbit: dto.mission?.orbit?.abbrev ?? dto.mission?.orbit?.name ?? "",
                    rocketFullName: dto.rocket?.configuration?.full_name ?? "",
                    webcastLive: dto.webcast_live ?? false,
                    webcastUrl: webcast?.url ?? "",
                    webcastTitle: webcast?.title ?? "",
                    probability: dto.probability ?? -1,
                    weatherConcerns: dto.weather_concerns ?? "",
                    padLat: dto.pad?.latitude ?? 0,
                    padLng: dto.pad?.longitude ?? 0,
                    agencyLaunchCount: dto.agency_launch_attempt_count ?? 0,
                    padLaunchCount: dto.pad_launch_attempt_count ?? 0,
                    providerSuccess: dto.launch_service_provider?.successful_launches ?? 0,
                    providerTotal: dto.launch_service_provider?.total_launch_count ?? 0,
                    imageUrl: dto.image?.thumbnail_url ?? dto.image?.image_url ?? "",
                    agencyLogoUrl: dto.launch_service_provider?.logo?.image_url ?? dto.launch_service_provider?.logo?.thumbnail_url ?? "",
                    agencyType: dto.launch_service_provider?.type?.name ?? "",
                    milestones: milestones,
                    failureReason: String((dto.failreason ?? "").prefix(280))
                )
        }.sorted { $0.net < $1.net }
    }

    private static func normalizeMilestone(_ event: TimelineEventDTO) -> LaunchMilestone? {
        guard let seconds = relativeSeconds(event.relative_time) else { return nil }
        let raw = event.type?.abbrev ?? event.type?.name ?? event.description ?? ""
        let lower = raw.lowercased()
        let code: LaunchMilestoneCode?
        switch true {
        case lower.contains("payload") || lower.contains("deploy"): code = .payloadDeployment
        case lower.contains("landing") && lower.contains("burn"): code = .landingBurn
        case lower.contains("landing") || lower.contains("touchdown"): code = .landing
        case lower.contains("entry") && lower.contains("burn"): code = .entryBurn
        case lower.contains("boostback"): code = .boostbackBurn
        case lower.contains("fairing"): code = .fairingSeparation
        case lower.contains("stage separation") || lower.contains("stage sep"): code = .stageSeparation
        case lower.contains("meco") || lower.contains("main engine cutoff"): code = .meco
        case lower.contains("seco") || lower.contains("second stage engine cutoff"): code = .upperStageCutoff
        case lower.contains("ses") || lower.contains("second stage engine start"): code = .upperStageStart
        case lower.contains("max-q") || lower.contains("max q"): code = .maxQ
        case lower.contains("liftoff") || lower.contains("lift-off"): code = .liftoff
        case lower.contains("ignition"): code = .ignition
        case lower.contains("orbit") || lower.contains("insertion"): code = .orbitInsertion
        default: code = nil
        }
        guard let code else { return nil }
        return LaunchMilestone(secondsFromT0: seconds, code: code,
                               label: String(raw.replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression).prefix(48)).uppercased())
    }

    private static func relativeSeconds(_ value: String?) -> Int? {
        guard let value else { return nil }
        let pattern = #"^(-)?P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$"#
        guard let regex = try? NSRegularExpression(pattern: pattern),
              let match = regex.firstMatch(in: value, range: NSRange(value.startIndex..., in: value))
        else { return nil }
        func number(_ group: Int) -> Int {
            let range = match.range(at: group)
            guard range.location != NSNotFound, let swiftRange = Range(range, in: value) else { return 0 }
            return Int(value[swiftRange]) ?? 0
        }
        let seconds = number(2) * 86_400 + number(3) * 3_600 + number(4) * 60 + number(5)
        let signed = match.range(at: 1).location == NSNotFound ? seconds : -seconds
        return abs(signed) <= 604_800 ? signed : nil
    }

    /// Bir saatten eski fırlatmaları düşürülmüş liste
    var upcoming: [Launch] {
        let cutoff = Date().addingTimeInterval(-3600)
        return launches.filter { $0.net > cutoff }
    }

    private func saveCache(_ list: [Launch]) {
        if let data = try? JSONEncoder().encode(list) {
            UserDefaults.standard.set(data, forKey: Self.cacheKey)
        }
    }

    private func loadCache() {
        launches = Self.cachedLaunches()
    }

    static func cachedLaunches() -> [Launch] {
        guard let data = UserDefaults.standard.data(forKey: cacheKey),
              let list = try? JSONDecoder().decode([Launch].self, from: data)
        else { return [] }
        return list
    }
}
