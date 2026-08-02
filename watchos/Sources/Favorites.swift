import Foundation
import Combine

/// Favori ajanslar (Dalga 9) — ajans kısaltmalarının kümesi, UserDefaults'ta kalıcı.
/// Boşsa "hepsi" demektir. Süzme yalnız uygulama listesini etkiler; widget'a dokunmaz.
@MainActor
final class FavoritesStore: ObservableObject {
    @Published private(set) var agencies: Set<String>

    private static let key = "favoriteAgencies"

    init() {
        let stored = UserDefaults.standard.stringArray(forKey: Self.key) ?? []
        agencies = Set(stored)
    }

    func isFavorite(_ abbrev: String?) -> Bool {
        guard let abbrev, !abbrev.isEmpty else { return false }
        return agencies.contains(abbrev)
    }

    /// Ajansı favori↔favori-değil arası çevirir; boş kısaltmayı yok sayar.
    func toggle(_ abbrev: String?) {
        guard let abbrev, !abbrev.isEmpty else { return }
        if agencies.contains(abbrev) {
            agencies.remove(abbrev)
        } else {
            agencies.insert(abbrev)
        }
        UserDefaults.standard.set(Array(agencies), forKey: Self.key)
        NotificationManager.preferencesChanged()
    }
}
