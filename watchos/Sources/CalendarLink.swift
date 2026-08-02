import Foundation

/// Fırlatma için Google Calendar "şablon" URL'i. Web linki olduğundan
/// Handoff ile iPhone'da açılır; kullanıcı olayı takvimine kaydeder.
enum CalendarLink {

    private static let allowed: CharacterSet = {
        var set = CharacterSet.alphanumerics
        set.insert(charactersIn: "-._~")
        return set
    }()

    private static func enc(_ s: String) -> String {
        s.addingPercentEncoding(withAllowedCharacters: allowed) ?? s
    }

    static func forLaunch(_ launch: Launch) -> String {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyyMMdd'T'HHmmss'Z'"
        fmt.timeZone = TimeZone(identifier: "UTC")
        let start = fmt.string(from: launch.net)
        let end = fmt.string(from: launch.net.addingTimeInterval(3600))
        let text = enc("🚀 \(launch.name)")
        let vehicle = launch.rocketFullName.isEmpty ? launch.vehicle : launch.rocketFullName
        let details = enc("\(vehicle) · \(launch.location) · via Space Cat")
        let location = enc(launch.location)
        return "https://calendar.google.com/calendar/render?action=TEMPLATE"
            + "&text=\(text)&dates=\(start)/\(end)&details=\(details)&location=\(location)"
    }
}
