import WidgetKit
import SwiftUI

// MARK: - Timeline

struct LaunchEntry: TimelineEntry, Codable {
    let date: Date
    let mission: String
    let vehicle: String
    let net: Date
    let status: String
    let agency: String
    let signalAvailable: Bool
    // GO ihtimali (Dalga 9): 0..100, veri yoksa -1.
    var probability: Int = -1

    static let sample = LaunchEntry(
        date: .now,
        mission: "Starlink G12-34",
        vehicle: "Falcon 9",
        net: .now.addingTimeInterval(4 * 3600 + 42 * 60),
        status: "Go",
        agency: "SpX",
        signalAvailable: true,
        probability: 80
    )

    static let unavailable = LaunchEntry(
        date: .now,
        mission: "UPLINK UNAVAILABLE",
        vehicle: "",
        net: .now,
        status: "NO SIGNAL",
        agency: "",
        signalAvailable: false,
        probability: -1
    )
}

struct LaunchProvider: TimelineProvider {
    func placeholder(in context: Context) -> LaunchEntry { .sample }

    func getSnapshot(in context: Context, completion: @escaping (LaunchEntry) -> Void) {
        completion(.sample)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<LaunchEntry>) -> Void) {
        Task {
            let entry: LaunchEntry
            do {
                entry = try await fetchNextLaunch()
                saveCache(entry)
            } catch {
                entry = loadCache() ?? .unavailable
            }
            // 30 dakikada bir tazele; sayaç metni zaten sistemce canlı işler
            let timeline = Timeline(
                entries: [entry],
                policy: .after(Date().addingTimeInterval(30 * 60))
            )
            completion(timeline)
        }
    }

    private func fetchNextLaunch() async throws -> LaunchEntry {
        #if DEBUG
        let base = "https://lldev.thespacedevs.com/2.3.0"
        #else
        let base = "https://ll.thespacedevs.com/2.3.0"
        #endif
        // detailed mode: GO ihtimali (probability) yalnız bu modda gelir (Dalga 9).
        let url = URL(string: "\(base)/launches/upcoming/?mode=detailed&limit=5")!
        var request = URLRequest(url: url)
        request.timeoutInterval = 12
        let (data, networkResponse) = try await URLSession.shared.data(for: request)
        guard let http = networkResponse as? HTTPURLResponse, (200...299).contains(http.statusCode)
        else { throw URLError(.badServerResponse) }

        struct ListResponse: Decodable { let results: [Item] }
        struct Item: Decodable {
            let name: String
            let net: String?
            let status: Status?
            let launch_service_provider: Agency?
            let probability: Int?
            struct Status: Decodable { let abbrev: String? }
            struct Agency: Decodable { let abbrev: String?; let name: String? }
        }

        let response = try JSONDecoder().decode(ListResponse.self, from: data)
        let iso = ISO8601DateFormatter()
        let cutoff = Date().addingTimeInterval(-3600)
        guard let next = response.results
            .compactMap({ item -> (Item, Date)? in
                guard let s = item.net, let d = iso.date(from: s), d > cutoff else { return nil }
                return (item, d)
            })
            .min(by: { $0.1 < $1.1 })
        else { throw URLError(.resourceUnavailable) }

        let (item, net) = next
        let parts = item.name.components(separatedBy: " | ")
        return LaunchEntry(
            date: .now,
            mission: parts.count > 1 ? parts[1] : item.name,
            vehicle: parts.first ?? "",
            net: net,
            status: item.status?.abbrev ?? "TBD",
            agency: item.launch_service_provider?.abbrev ?? item.launch_service_provider?.name ?? "",
            signalAvailable: true,
            probability: item.probability ?? -1
        )
    }

    private struct CachedEntry: Codable {
        let savedAt: Date
        let entry: LaunchEntry
    }

    private var cacheKey: String { "spacecat_widget_launch_v1" }

    private func saveCache(_ entry: LaunchEntry) {
        guard let data = try? JSONEncoder().encode(CachedEntry(savedAt: .now, entry: entry))
        else { return }
        UserDefaults.standard.set(data, forKey: cacheKey)
    }

    private func loadCache() -> LaunchEntry? {
        guard let data = UserDefaults.standard.data(forKey: cacheKey),
              let cached = try? JSONDecoder().decode(CachedEntry.self, from: data),
              Date().timeIntervalSince(cached.savedAt) < 6 * 3600,
              cached.entry.net > Date().addingTimeInterval(-3600)
        else { return nil }
        return cached.entry
    }
}

// MARK: - Görünümler

struct NextLaunchWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: LaunchEntry

    private var statusColor: Color {
        switch entry.status.lowercased() {
        case "go": return Color(red: 0, green: 0.902, blue: 0.541)
        case "hold": return Color(red: 1, green: 0.361, blue: 0.341)
        default: return Color(red: 1, green: 0.722, blue: 0.424)
        }
    }
    private let amber = Color(red: 1, green: 0.722, blue: 0.424)
    private let green = Color(red: 0, green: 0.902, blue: 0.541)

    /// T-24 saatte dolan ilerleme (0 = uzak, 1 = fırlatma anı)
    private var progress: Double {
        let remaining = entry.net.timeIntervalSinceNow
        guard remaining > 0 else { return 1 }
        return max(0, min(1, 1 - remaining / 86_400))
    }

    var body: some View {
        if !entry.signalAvailable {
            UnavailableWidgetView(family: family)
        } else {
            switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 1) {
                Text("NEXT LAUNCH")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .kerning(1)
                    .foregroundStyle(green)
                Text(entry.mission)
                    .font(.system(size: 13, weight: .semibold))
                    .lineLimit(1)
                HStack(spacing: 4) {
                    if entry.net > Date() {
                        HStack(spacing: 0) {
                            Text("T-")
                            Text(timerInterval: Date()...entry.net, countsDown: true)
                        }
                        .font(.system(size: 14, weight: .bold, design: .monospaced))
                        .foregroundStyle(amber)
                    } else {
                        Text("LIFTOFF")
                            .font(.system(size: 14, weight: .bold, design: .monospaced))
                            .foregroundStyle(amber)
                    }
                    Text(entry.status.uppercased())
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .foregroundStyle(.black)
                        .padding(.horizontal, 4)
                        .background(statusColor, in: RoundedRectangle(cornerRadius: 3))
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

        case .accessoryCircular:
            Gauge(value: progress) {
                Text("T-")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
            } currentValueLabel: {
                if entry.net > Date() {
                    Text(timerInterval: Date()...entry.net, countsDown: true,
                         showsHours: false)
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .minimumScaleFactor(0.5)
                } else {
                    Text("🚀")
                }
            }
            .gaugeStyle(.accessoryCircular)
            .tint(green)

        case .accessoryCorner:
            Text(entry.net > Date() ? shortCountdown : "LIFTOFF")
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundStyle(amber)
                .widgetCurvesContent()
                .widgetLabel {
                    Gauge(value: progress) { Text(entry.mission) }
                        .tint(green)
                }

        case .accessoryInline:
            if entry.net > Date() {
                Text("🚀 \(shortCountdown) · \(entry.mission)")
            } else {
                Text("🚀 LIFTOFF · \(entry.mission)")
            }

        default:
            Text(entry.mission)
            }
        }
    }

    private var shortCountdown: String {
        let remaining = max(0, Int(entry.net.timeIntervalSinceNow))
        let d = remaining / 86_400
        let h = (remaining % 86_400) / 3_600
        let m = (remaining % 3_600) / 60
        if d > 0 { return "T-\(d)d \(h)h" }
        if h > 0 { return "T-\(h)h \(m)m" }
        return "T-\(m)m"
    }
}

private struct UnavailableWidgetView: View {
    let family: WidgetFamily
    private let amber = Color(red: 1, green: 0.722, blue: 0.424)

    var body: some View {
        switch family {
        case .accessoryCircular:
            ZStack {
                Circle().stroke(amber.opacity(0.45), lineWidth: 3)
                Text("NO\nSIG")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(amber)
            }
        case .accessoryInline:
            Text("⌁ SPACE CAT · NO SIGNAL")
        case .accessoryCorner:
            Text("NO SIG")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundStyle(amber)
                .widgetCurvesContent()
        default:
            VStack(alignment: .leading, spacing: 2) {
                Text("UPLINK LOST")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .kerning(1)
                    .foregroundStyle(amber)
                Text("LAST GOOD SIGNAL EXPIRED")
                    .font(.system(size: 9, design: .monospaced))
                    .foregroundStyle(.gray)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

// MARK: - GO ODDS görünümü (Dalga 9)

struct GoOddsWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: LaunchEntry

    private let green = Color(red: 0, green: 0.902, blue: 0.541)
    private let amber = Color(red: 1, green: 0.722, blue: 0.424)
    private let red = Color(red: 1, green: 0.361, blue: 0.341)

    private var hasOdds: Bool { (0...100).contains(entry.probability) }

    private var oddsColor: Color {
        switch entry.probability {
        case 70...: return green
        case 40...: return amber
        default: return red
        }
    }

    /// Gauge dolumu: 0..1. Veri yoksa boş.
    private var fraction: Double {
        hasOdds ? Double(entry.probability) / 100 : 0
    }

    var body: some View {
        if !entry.signalAvailable {
            UnavailableWidgetView(family: family)
        } else {
            switch family {
        case .accessoryCircular:
            Gauge(value: fraction) {
                Text("GO")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
            } currentValueLabel: {
                Text(hasOdds ? "\(entry.probability)" : "—")
                    .font(.system(size: 13, weight: .bold, design: .monospaced))
                    .minimumScaleFactor(0.5)
            }
            .gaugeStyle(.accessoryCircular)
            .tint(oddsColor)

        case .accessoryInline:
            Text(hasOdds ? "🚀 GO odds \(entry.probability)%" : "🚀 GO odds —")

        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 1) {
                Text("GO ODDS")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .kerning(1)
                    .foregroundStyle(green)
                Text(entry.mission)
                    .font(.system(size: 12, weight: .semibold))
                    .lineLimit(1)
                Text(hasOdds ? "\(entry.probability)%" : "— no data")
                    .font(.system(size: 16, weight: .bold, design: .monospaced))
                    .foregroundStyle(hasOdds ? oddsColor : .gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

        case .accessoryCorner:
            Text(hasOdds ? "\(entry.probability)%" : "—")
                .font(.system(size: 14, weight: .bold, design: .monospaced))
                .foregroundStyle(oddsColor)
                .widgetCurvesContent()
                .widgetLabel {
                    Gauge(value: fraction) { Text("GO \(entry.mission)") }
                        .tint(oddsColor)
                }

        default:
            Text(hasOdds ? "GO \(entry.probability)%" : "GO —")
            }
        }
    }
}

// MARK: - Widget tanımı

@main
struct SpaceCatWidgets: WidgetBundle {
    var body: some Widget {
        NextLaunchWidget()
        GoOddsWidget()
    }
}

struct GoOddsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "GoOdds", provider: LaunchProvider()) { entry in
            GoOddsWidgetView(entry: entry)
                .containerBackground(.black, for: .widget)
        }
        .configurationDisplayName("GO Odds")
        .description("Launch weather GO probability for the next rocket launch.")
        .supportedFamilies([
            .accessoryRectangular,
            .accessoryCircular,
            .accessoryCorner,
            .accessoryInline,
        ])
    }
}

struct NextLaunchWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NextLaunch", provider: LaunchProvider()) { entry in
            NextLaunchWidgetView(entry: entry)
                .containerBackground(.black, for: .widget)
        }
        .configurationDisplayName("Next Launch")
        .description("Live countdown to the next rocket launch.")
        .supportedFamilies([
            .accessoryRectangular,
            .accessoryCircular,
            .accessoryCorner,
            .accessoryInline,
        ])
    }
}
