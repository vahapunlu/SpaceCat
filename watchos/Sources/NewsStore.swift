import Foundation

struct NewsArticle: Identifiable, Codable {
    let id: Int
    let title: String
    let site: String
    let summary: String
    let published: Date

    var relativeTime: String {
        let minutes = max(0, Int(-published.timeIntervalSinceNow) / 60)
        if minutes < 60 { return "\(minutes)m" }
        if minutes < 1_440 { return "\(minutes / 60)h" }
        return "\(minutes / 1_440)d"
    }
}

@MainActor
final class NewsStore: ObservableObject {
    @Published var articles: [NewsArticle] = []

    private static let cacheKey = "news_cache_v1"

    init() {
        loadCache()
    }

    func refresh() async {
        struct Response: Decodable { let results: [Item] }
        struct Item: Decodable {
            let id: Int
            let title: String
            let news_site: String?
            let summary: String?
            let published_at: String?
        }
        guard let url = URL(
            string: "https://api.spaceflightnewsapi.net/v4/articles/?limit=5&ordering=-published_at"
        ) else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(Response.self, from: data)
            let iso = ISO8601DateFormatter()
            articles = response.results.map {
                NewsArticle(
                    id: $0.id,
                    title: $0.title,
                    site: $0.news_site ?? "",
                    summary: $0.summary ?? "",
                    published: $0.published_at.flatMap { iso.date(from: $0) } ?? .now
                )
            }
            if let data = try? JSONEncoder().encode(articles) {
                UserDefaults.standard.set(data, forKey: Self.cacheKey)
            }
        } catch {
            // Haber ikincil — hata sessizce önbelleğe düşer
        }
    }

    private func loadCache() {
        guard let data = UserDefaults.standard.data(forKey: Self.cacheKey),
              let list = try? JSONDecoder().decode([NewsArticle].self, from: data)
        else { return }
        articles = list
    }
}
