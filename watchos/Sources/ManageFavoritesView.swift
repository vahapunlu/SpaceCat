import SwiftUI

/// Favori yönetim ekranı (Dalga 10b) — cache'li fırlatmalardaki ajanslar (+ hâlihazırda
/// favori olanlar) listelenir, toggle ile toplu işaretlenir. Detaydaki tekil yıldıza
/// alternatif toplu görünüm.
struct ManageFavoritesView: View {
    @EnvironmentObject private var favorites: FavoritesStore
    // init'te önbelleği okur — ayrı bir ağ isteği yapmaz.
    @StateObject private var store = LaunchStore()

    // Ajans listesi: sıradaki fırlatmalardaki + mevcut favoriler (upcoming'de olmayan
    // favoriler de görünsün ki kaldırılabilsinler). Kısaltmaya göre alfabetik.
    private var agencies: [(abbrev: String, name: String)] {
        var map: [String: String] = [:]
        for launch in store.upcoming {
            if let abbrev = launch.agencyAbbrev, !abbrev.isEmpty {
                if map[abbrev] == nil { map[abbrev] = launch.agency.isEmpty ? abbrev : launch.agency }
            }
        }
        for abbrev in favorites.agencies where map[abbrev] == nil {
            map[abbrev] = abbrev
        }
        return map.map { (abbrev: $0.key, name: $0.value) }.sorted { $0.abbrev < $1.abbrev }
    }

    var body: some View {
        List {
            Section {
                if agencies.isEmpty {
                    Text("> NO AGENCIES YET\nOpen a mission to follow one")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Terminal.grey)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .listRowBackground(Color.clear)
                } else {
                    ForEach(agencies, id: \.abbrev) { agency in
                        Toggle(isOn: Binding(
                            get: { favorites.isFavorite(agency.abbrev) },
                            set: { _ in favorites.toggle(agency.abbrev) }
                        )) {
                            VStack(alignment: .leading, spacing: 0) {
                                Text(agency.abbrev)
                                    .font(.system(size: 13, weight: .medium, design: .monospaced))
                                    .lineLimit(1)
                                if agency.name != agency.abbrev {
                                    Text(agency.name)
                                        .font(.system(size: 10, design: .monospaced))
                                        .foregroundStyle(Terminal.grey)
                                        .lineLimit(1)
                                }
                            }
                        }
                        .tint(Terminal.green)
                    }
                }
            } header: {
                Text("★ FAVORITES")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .kerning(2)
                    .foregroundStyle(Terminal.green)
            }
        }
    }
}
