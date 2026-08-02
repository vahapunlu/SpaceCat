import Foundation

/// Pad'in anlık havası (Open-Meteo'dan türetilmiş, ekran için hazır).
struct PadWeather {
    let tempC: Int
    let windKmh: Int
    let gustsKmh: Int
    let cloudPct: Int
    let precipMm: Double
    let code: Int

    var condition: String { Self.wmoLabel(code) }
    var emoji: String { Self.wmoEmoji(code) }
    /// Rüzgar fırlatmaların en sık scrub nedeni — kaba bir uyarı bayrağı.
    var windConcern: Bool { gustsKmh >= 40 }

    static func wmoLabel(_ code: Int) -> String {
        switch code {
        case 0: return "Clear"
        case 1: return "Mainly clear"
        case 2: return "Partly cloudy"
        case 3: return "Overcast"
        case 45, 48: return "Fog"
        case 51, 53, 55: return "Drizzle"
        case 56, 57: return "Freezing drizzle"
        case 61, 63, 65: return "Rain"
        case 66, 67: return "Freezing rain"
        case 71, 73, 75, 77: return "Snow"
        case 80, 81, 82: return "Showers"
        case 85, 86: return "Snow showers"
        case 95: return "Thunderstorm"
        case 96, 99: return "Thunderstorm, hail"
        default: return "—"
        }
    }

    static func wmoEmoji(_ code: Int) -> String {
        switch code {
        case 0: return "☀️"
        case 1: return "🌤️"
        case 2: return "⛅"
        case 3: return "☁️"
        case 45, 48: return "🌫️"
        case 51, 53, 55, 56, 57: return "🌦️"
        case 61, 63, 65, 66, 67, 80, 81, 82: return "🌧️"
        case 71, 73, 75, 77, 85, 86: return "🌨️"
        case 95, 96, 99: return "⛈️"
        default: return "🛰️"
        }
    }
}

// MARK: - Open-Meteo DTO

private struct OpenMeteoResponse: Decodable {
    let current: OpenMeteoCurrent?
}

private struct OpenMeteoCurrent: Decodable {
    let temperature_2m: Double?
    let wind_speed_10m: Double?
    let wind_gusts_10m: Double?
    let cloud_cover: Int?
    let precipitation: Double?
    let weather_code: Int?
}

/// Pad hava durumu — Open-Meteo (ücretsiz, anahtarsız). 30 dk bellek cache;
/// yalnız detay ekranı açılınca talep üzerine çekilir (senkrona bindirilmez).
actor WeatherService {
    static let shared = WeatherService()

    private struct Cached { let at: Date; let weather: PadWeather }
    private var cache: [String: Cached] = [:]
    private let ttl: TimeInterval = 30 * 60

    func forPad(lat: Double, lng: Double) async -> PadWeather? {
        if lat == 0 && lng == 0 { return nil }
        let key = String(format: "%.2f,%.2f", lat, lng)
        if let c = cache[key], Date().timeIntervalSince(c.at) < ttl { return c.weather }

        var comps = URLComponents(string: "https://api.open-meteo.com/v1/forecast")!
        comps.queryItems = [
            .init(name: "latitude", value: String(lat)),
            .init(name: "longitude", value: String(lng)),
            .init(name: "current", value: "temperature_2m,wind_speed_10m,wind_gusts_10m,cloud_cover,precipitation,weather_code"),
            .init(name: "wind_speed_unit", value: "kmh"),
        ]
        guard let url = comps.url,
              let (data, _) = try? await URLSession.shared.data(from: url),
              let cur = (try? JSONDecoder().decode(OpenMeteoResponse.self, from: data))?.current,
              let temp = cur.temperature_2m
        else { return nil }

        let weather = PadWeather(
            tempC: Int(temp.rounded()),
            windKmh: Int((cur.wind_speed_10m ?? 0).rounded()),
            gustsKmh: Int((cur.wind_gusts_10m ?? 0).rounded()),
            cloudPct: cur.cloud_cover ?? 0,
            precipMm: cur.precipitation ?? 0,
            code: cur.weather_code ?? -1
        )
        cache[key] = Cached(at: Date(), weather: weather)
        return weather
    }
}
