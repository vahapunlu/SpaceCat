import SwiftUI

struct ContentView: View {
    @StateObject private var store = LaunchStore()
    @StateObject private var news = NewsStore()
    @StateObject private var eventsStore = EventStore()
    @StateObject private var favorites = FavoritesStore()
    @AppStorage("favoritesOnly") private var favoritesOnly = false

    // Mağaza ekran görüntüleri için deterministik ekran seçimi
    private var shotScreen: String? { ProcessInfo.processInfo.environment["SHOT_SCREEN"] }

    // Favori süzme (Dalga 9): "favorites only" açık ve en az bir favori varsa
    // listeyi favori ajanslara indir; aksi halde tümünü göster (boş ekran olmasın).
    private var filterActive: Bool { favoritesOnly && !favorites.agencies.isEmpty }
    private var visibleUpcoming: [Launch] {
        guard filterActive else { return store.upcoming }
        return store.upcoming.filter { favorites.isFavorite($0.agencyAbbrev) }
    }

    var body: some View {
        content
            .environmentObject(favorites)
            // Dış görünümde: branch değişse de senkron iptal olmaz.
            .task {
                await store.refresh()
                await news.refresh()
                await eventsStore.refresh()
            }
    }

    @ViewBuilder private var content: some View {
        if let screen = shotScreen, !store.upcoming.isEmpty {
            switch screen {
            case "detail":
                if let l = store.upcoming.first { DetailView(launch: l) }
            case "wire":
                if let a = news.articles.first { NewsDetailView(article: a) }
            case "event":
                if let e = eventsStore.events.first { EventDetailView(event: e) }
            case "iss":
                IssView()
            case "settings":
                SettingsView()
            case "managefav":
                ManageFavoritesView()
            case "about":
                AboutView()
            default:
                mainList
            }
        } else {
            mainList
        }
    }

    var mainList: some View {
        NavigationStack {
            List {
                if filterActive {
                    Text("★ FAVORITES")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .kerning(2)
                        .foregroundStyle(Terminal.amber)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .listRowBackground(Color.clear)
                }
                if store.upcoming.isEmpty {
                    Text("> AWAITING TELEMETRY…")
                        .font(.system(size: 13, design: .monospaced))
                        .foregroundStyle(Terminal.green)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .listRowBackground(Color.clear)
                } else if visibleUpcoming.isEmpty {
                    Text("> NO FAVORITE-AGENCY\nLAUNCHES UPCOMING")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Terminal.grey)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .listRowBackground(Color.clear)
                } else {
                    if let next = visibleUpcoming.first {
                        NavigationLink(value: next.id) {
                            HeroCard(launch: next)
                        }
                        .listRowBackground(
                            LinearGradient(
                                colors: [Color(red: 0.07, green: 0.15, blue: 0.11), .black.opacity(0.25)],
                                startPoint: .top, endPoint: .bottom
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        )
                    }
                    ForEach(visibleUpcoming.dropFirst()) { launch in
                        NavigationLink(value: launch.id) {
                            UpcomingRow(launch: launch)
                        }
                    }
                }
                if !news.articles.isEmpty {
                    Section {
                        ForEach(news.articles) { article in
                            NavigationLink {
                                NewsDetailView(article: article)
                            } label: {
                                NewsRow(article: article)
                            }
                        }
                    } header: {
                        Text("📰 WIRE")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .kerning(2)
                            .foregroundStyle(Terminal.green)
                    }
                }
                if !eventsStore.events.isEmpty {
                    Section {
                        ForEach(eventsStore.events) { event in
                            NavigationLink {
                                EventDetailView(event: event)
                            } label: {
                                EventRow(event: event)
                            }
                        }
                    } header: {
                        Text("🛰 EVENTS")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .kerning(2)
                            .foregroundStyle(Terminal.green)
                    }
                }
                NavigationLink {
                    IssView()
                } label: {
                    Text("🛰 ISS TRACKER")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                        .kerning(1)
                        .foregroundStyle(Terminal.green)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                .listRowBackground(Color.clear)
                NavigationLink {
                    SettingsView()
                } label: {
                    Text("⚙ ALERTS")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                        .kerning(1)
                        .foregroundStyle(Terminal.green)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                .listRowBackground(Color.clear)
                NavigationLink {
                    AboutView()
                } label: {
                    Text("ⓘ ABOUT")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                        .kerning(1)
                        .foregroundStyle(Terminal.green)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle {
                Text("SPACE CAT")
                    .font(.system(size: 14, weight: .bold, design: .monospaced))
                    .foregroundStyle(Terminal.green)
            }
            .navigationDestination(for: String.self) { id in
                if let launch = store.upcoming.first(where: { $0.id == id }) {
                    DetailView(launch: launch)
                }
            }
        }
    }
}

struct HeroCard: View {
    let launch: Launch

    var body: some View {
        VStack(alignment: .center, spacing: 3) {
            Text(launch.mission)
                .font(.headline)
                .lineLimit(2)
                .multilineTextAlignment(.center)

            CountdownText(net: launch.net, fontSize: 20)

            HStack(spacing: 5) {
                StatusChip(abbrev: launch.statusAbbrev)
                Text(launch.vehicle)
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Terminal.green)
                    .lineLimit(1)
            }
            Text(launch.location)
                .font(.system(size: 10))
                .foregroundStyle(Terminal.grey)
                .lineLimit(1)
            if launch.webcastLive {
                Text("🔴 LIVE")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundStyle(Terminal.red)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct UpcomingRow: View {
    let launch: Launch

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(launch.mission)
                .font(.system(size: 13, weight: .medium))
                .lineLimit(1)
            HStack(spacing: 0) {
                if let abbrev = launch.agencyAbbrev, !abbrev.isEmpty {
                    Text("\(abbrev) · ")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Terminal.green)
                }
                Text(launch.net, format: .dateTime.day().month().hour().minute())
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Terminal.amber)
                Text(" · \(launch.statusAbbrev.uppercased())")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Terminal.statusColor(launch.statusAbbrev))
            }
            .lineLimit(1)
        }
    }
}

/// Canlı geri sayım: sistem tarafından her saniye güncellenir, uygulama uyanmaz.
struct CountdownText: View {
    let net: Date
    var fontSize: CGFloat = 18

    var body: some View {
        if net > Date() {
            HStack(spacing: 0) {
                Text("T-")
                Text(timerInterval: Date()...net, countsDown: true)
            }
            .font(.system(size: fontSize, weight: .bold, design: .monospaced))
            .foregroundStyle(Terminal.amber)
        } else {
            Text("LIFTOFF")
                .font(.system(size: fontSize, weight: .bold, design: .monospaced))
                .foregroundStyle(Terminal.amber)
        }
    }
}

struct StatusChip: View {
    let abbrev: String

    var body: some View {
        Text(abbrev.uppercased())
            .font(.system(size: 10, weight: .bold, design: .monospaced))
            .foregroundStyle(.black)
            .padding(.horizontal, 6)
            .padding(.vertical, 1)
            .background(Terminal.statusColor(abbrev), in: RoundedRectangle(cornerRadius: 5))
    }
}
