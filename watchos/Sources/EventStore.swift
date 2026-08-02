import SwiftUI

/// LL2 uzay olayı: spacewalk, docking, tutulma, flyby vb. (fırlatma dışı içerik).
struct SpaceEvent: Identifiable, Codable {
    let id: Int
    let name: String
    let type: String
    let date: Date
    let location: String
    let description: String

    var dateLabel: String { date.formatted(.dateTime.day().month().hour().minute()) }
}

@MainActor
final class EventStore: ObservableObject {
    @Published var events: [SpaceEvent] = []

    #if DEBUG
    private static let baseURL = "https://lldev.thespacedevs.com/2.3.0"
    #else
    private static let baseURL = "https://ll.thespacedevs.com/2.3.0"
    #endif
    private static let cacheKey = "events_cache_v1"

    init() { loadCache() }

    func refresh() async {
        struct Response: Decodable { let results: [Item] }
        struct Item: Decodable {
            let id: Int
            let name: String
            let type: EventType?
            let date: String?
            let location: String?
            let description: String?
        }
        struct EventType: Decodable { let name: String? }

        guard let url = URL(string: "\(Self.baseURL)/events/upcoming/?limit=5") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(Response.self, from: data)
            let iso = ISO8601DateFormatter()
            events = response.results.map {
                SpaceEvent(
                    id: $0.id,
                    name: $0.name,
                    type: $0.type?.name ?? "",
                    date: $0.date.flatMap { iso.date(from: $0) } ?? .now,
                    location: $0.location ?? "",
                    description: $0.description ?? ""
                )
            }
            if let data = try? JSONEncoder().encode(events) {
                UserDefaults.standard.set(data, forKey: Self.cacheKey)
            }
        } catch {
            // Olaylar ikincil — hata sessizce önbelleğe düşer
        }
    }

    private func loadCache() {
        guard let data = UserDefaults.standard.data(forKey: Self.cacheKey),
              let list = try? JSONDecoder().decode([SpaceEvent].self, from: data)
        else { return }
        events = list
    }
}

struct EventRow: View {
    let event: SpaceEvent

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(event.name)
                .font(.system(size: 12, weight: .medium))
                .lineLimit(2)
            Text(event.type.isEmpty ? event.dateLabel : "\(event.type) · \(event.dateLabel)")
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Terminal.amber)
                .lineLimit(1)
        }
    }
}

struct EventDetailView: View {
    let event: SpaceEvent

    var body: some View {
        ScrollView {
            VStack(spacing: 6) {
                Text("🛰 EVENT")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .kerning(2)
                    .foregroundStyle(Terminal.green)
                Text(event.name)
                    .font(.headline)
                    .multilineTextAlignment(.center)
                Text(event.type.isEmpty ? event.dateLabel : "\(event.type) · \(event.dateLabel)")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Terminal.amber)
                    .multilineTextAlignment(.center)
                if !event.location.isEmpty {
                    Text(event.location)
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Terminal.green)
                        .multilineTextAlignment(.center)
                }
                if !event.description.isEmpty {
                    Text(event.description)
                        .font(.system(size: 11))
                        .foregroundStyle(Terminal.grey)
                        .padding(.top, 4)
                }
            }
            .padding(.horizontal, 4)
        }
    }
}
