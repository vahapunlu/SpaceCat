import Foundation
import UserNotifications
import WatchKit

/// Uyarı tercihleri (UserDefaults; SettingsView @AppStorage ile aynı anahtarlar)
enum AlertPrefs {
    static var t10: Bool { UserDefaults.standard.object(forKey: "alertT10") as? Bool ?? true }
    static var t60: Bool { UserDefaults.standard.object(forKey: "alertT60") as? Bool ?? false }
    static var statusChange: Bool { UserDefaults.standard.object(forKey: "alertStatus") as? Bool ?? true }
    static var delays: Bool { UserDefaults.standard.object(forKey: "alertDelays") as? Bool ?? true }
    static var liftoff: Bool { UserDefaults.standard.object(forKey: "alertLiftoff") as? Bool ?? true }
    static var results: Bool { UserDefaults.standard.object(forKey: "alertResults") as? Bool ?? true }
    // Favori süzme (Dalga 10c) — anahtarlar FavoritesStore/SettingsView ile ortak.
    static var favoritesOnly: Bool { UserDefaults.standard.object(forKey: "favoritesOnly") as? Bool ?? false }
    static var favoriteAgencies: Set<String> {
        Set(UserDefaults.standard.stringArray(forKey: "favoriteAgencies") ?? [])
    }
}

enum NotificationManager {
    private static let horizon: TimeInterval = 48 * 3600
    private static let delayThreshold: TimeInterval = 5 * 60

    static func requestAuthorization() {
        UNUserNotificationCenter.current()
            .requestAuthorization(options: [.alert, .sound]) { _, _ in }
    }

    /// Ayar/favori değişikliğini veri yenilemesini beklemeden bekleyen alarmlara uygular.
    @MainActor
    static func preferencesChanged() {
        let now = Date()
        let favorites = AlertPrefs.favoriteAgencies
        let filterActive = AlertPrefs.favoritesOnly && !favorites.isEmpty
        let next = LaunchStore.cachedLaunches()
            .filter { launch in
                guard launch.net > now else { return false }
                guard filterActive else { return true }
                guard let abbrev = launch.agencyAbbrev else { return false }
                return favorites.contains(abbrev)
            }
            .min { $0.net < $1.net }
        rescheduleCountdownAlarms(next: next)
    }

    /// Her senkronda: eski↔yeni fark tespiti + T-10/T-60 alarmlarının tazelenmesi.
    /// Doğal dedup — önbellek güncellendiği için aynı geçiş ikinci kez görülmez.
    static func onRefresh(old: [Launch], new: [Launch]) {
        let now = Date()
        let oldById = Dictionary(uniqueKeysWithValues: old.map { ($0.id, $0) })

        // Favori süzme (Dalga 10c): "favorites only" açık ve en az bir favori varsa,
        // yalnız favori ajansların uyarıları gelir — liste ile aynı semantik.
        let favorites = AlertPrefs.favoriteAgencies
        let filterActive = AlertPrefs.favoritesOnly && !favorites.isEmpty
        func isAllowed(_ launch: Launch) -> Bool {
            guard filterActive else { return true }
            guard let abbrev = launch.agencyAbbrev else { return false }
            return favorites.contains(abbrev)
        }

        for launch in new {
            guard launch.net.timeIntervalSince(now) < horizon,
                  isAllowed(launch),
                  let prev = oldById[launch.id] else { continue }

            if AlertPrefs.statusChange, launch.statusAbbrev != prev.statusAbbrev {
                switch launch.statusAbbrev.lowercased() {
                case "go":
                    fire(id: "\(launch.id)-status",
                         title: "🟢 GO — \(launch.mission)",
                         body: "\(launch.vehicle) · \(launch.net.formatted(.dateTime.day().month().hour().minute()))")
                case "hold":
                    fire(id: "\(launch.id)-status",
                         title: "🔴 HOLD — \(launch.mission)",
                         body: "Countdown holding")
                default: break
                }
            }

            // Fırlatma sonucu / uçuş durumu geçişleri (In Flight → Success/Failure)
            if AlertPrefs.results, launch.statusAbbrev != prev.statusAbbrev {
                switch launch.statusAbbrev.lowercased() {
                case "in flight":
                    fire(id: "\(launch.id)-result", title: "🚀 IN FLIGHT — \(launch.mission)", body: launch.vehicle)
                case "success":
                    fire(id: "\(launch.id)-result", title: "✅ SUCCESS — \(launch.mission)", body: "\(launch.vehicle) · \(launch.statusName)")
                    WKInterfaceDevice.current().play(.success)
                case "failure":
                    fire(id: "\(launch.id)-result", title: "❌ FAILURE — \(launch.mission)", body: "\(launch.vehicle) · \(launch.statusName)")
                    WKInterfaceDevice.current().play(.failure)
                case "partial failure":
                    fire(id: "\(launch.id)-result", title: "⚠️ PARTIAL — \(launch.mission)", body: "\(launch.vehicle) · \(launch.statusName)")
                default: break
                }
            }

            let slip = launch.net.timeIntervalSince(prev.net)
            if AlertPrefs.delays, abs(slip) >= delayThreshold {
                fire(id: "\(launch.id)-delay",
                     title: slip > 0 ? "⏳ Delayed — \(launch.mission)" : "⚡ Moved up — \(launch.mission)",
                     body: "New T-0: \(launch.net.formatted(.dateTime.day().month().hour().minute()))")
            }
        }

        // Favori süzme açıksa geri sayım alarmları da sıradaki FAVORİ fırlatmaya kurulur.
        rescheduleCountdownAlarms(
            next: new.filter { $0.net > now && isAllowed($0) }.min(by: { $0.net < $1.net })
        )
    }

    /// Sıradaki fırlatma için T-10 / T-60 yerel bildirimleri.
    /// Sabit kimlikler: her senkronda eskisi silinir, yenisi kurulur — birikme olmaz.
    static func rescheduleCountdownAlarms(next: Launch?) {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: ["t10", "t60", "t0"])
        guard let launch = next else { return }

        func schedule(id: String, lead: TimeInterval, title: String) {
            let fireDate = launch.net.addingTimeInterval(-lead)
            let interval = fireDate.timeIntervalSinceNow
            guard interval > 1 else { return }
            let content = UNMutableNotificationContent()
            content.title = title
            content.body = launch.mission
            content.sound = .default
            center.add(UNNotificationRequest(
                identifier: id,
                content: content,
                trigger: UNTimeIntervalNotificationTrigger(timeInterval: interval, repeats: false)
            ))
        }

        if AlertPrefs.t10 { schedule(id: "t10", lead: 10 * 60, title: "🚀 T-10 min") }
        if AlertPrefs.t60 { schedule(id: "t60", lead: 60 * 60, title: "🚀 T-1 hour") }
        // T-0 kalkış: watchOS bildirimi teslimde bileği titretir.
        if AlertPrefs.liftoff { schedule(id: "t0", lead: 0, title: "🚀 LIFTOFF") }
    }

    static func fire(id: String, title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        UNUserNotificationCenter.current().add(
            UNNotificationRequest(identifier: id, content: content, trigger: nil)
        )
    }
}
