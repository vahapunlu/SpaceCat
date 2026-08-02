import SwiftUI
import WatchKit

struct DetailView: View {
    let launch: Launch

    @EnvironmentObject private var favorites: FavoritesStore
    @State private var handoffWebcast = false
    @State private var handoffCalendar = false
    @State private var weather: PadWeather?

    var body: some View {
        ScrollView {
            VStack(spacing: 4) {
                if !launch.imageUrl.isEmpty, let url = URL(string: launch.imageUrl) {
                    // Görseller çoğu kez kare/dikey — kırpmadan Fit ile ortala.
                    AsyncImage(url: url) { image in
                        image.resizable().aspectRatio(contentMode: .fit)
                    } placeholder: {
                        Color.clear
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 104)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .padding(.bottom, 2)
                }

                Text("MISSION FILE")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .kerning(2)
                    .foregroundStyle(Terminal.green)

                Text(launch.mission)
                    .font(.headline)
                    .multilineTextAlignment(.center)

                CountdownText(net: launch.net)

                MissionMilestoneView(launch: launch)

                HStack(spacing: 5) {
                    StatusChip(abbrev: launch.statusAbbrev)
                    Text(launch.statusName.isEmpty ? launch.statusAbbrev : launch.statusName)
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Terminal.statusColor(launch.statusAbbrev))
                        .lineLimit(1)
                }

                if !launch.agencyLogoUrl.isEmpty || !launch.agencyType.isEmpty {
                    agencyBadge
                }

                if launch.hasWebcast {
                    webcastButton
                }

                if launch.net > .now {
                    calendarButton
                }

                if let abbrev = launch.agencyAbbrev, !abbrev.isEmpty {
                    favoriteButton(abbrev)
                }

                VStack(alignment: .leading, spacing: 2) {
                    TelemetryRow(label: "VEHICLE", value: launch.rocketFullName.isEmpty ? launch.vehicle : launch.rocketFullName)
                    TelemetryRow(label: "AGENCY", value: launch.agencyAbbrev ?? launch.agency)
                    if launch.hasProbability {
                        TelemetryRow(label: "GO ODDS", value: "\(launch.probability)%",
                                     valueColor: Terminal.probabilityColor(launch.probability))
                    }
                    TelemetryRow(label: "ORBIT", value: launch.orbit)
                    TelemetryRow(label: "PAD", value: launch.pad)
                    TelemetryRow(label: "SITE", value: launch.location)
                    TelemetryRow(label: "NET", value: launch.net.formatted(.dateTime.day().month().hour().minute()))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.top, 8)

                if launch.hasStats {
                    statsPanel
                }

                if launch.hasPadCoords {
                    padWeatherPanel
                }

                if !launch.weatherConcerns.isEmpty {
                    Text("⚠ \(launch.weatherConcerns)")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Terminal.amber)
                        .multilineTextAlignment(.center)
                        .padding(.top, 6)
                }

                if !launch.missionDescription.isEmpty {
                    Text(launch.missionDescription)
                        .font(.system(size: 11))
                        .foregroundStyle(Terminal.grey)
                        .padding(.top, 8)
                }
            }
            .padding(.horizontal, 4)
        }
        // Handoff: iPhone'da yayını Safari'de açmayı önerir (companion app gerekmez).
        .userActivity("com.spacecat.terminal.webcast", isActive: handoffWebcast) { activity in
            if let url = safeWebcastURL(launch.webcastUrl) {
                activity.webpageURL = url
                activity.isEligibleForHandoff = true
                activity.title = launch.webcastTitle.isEmpty ? "Watch webcast" : launch.webcastTitle
            }
        }
        // Handoff: iPhone'da Google Calendar olay taslağını açar.
        .userActivity("com.spacecat.terminal.calendar", isActive: handoffCalendar) { activity in
            if let url = URL(string: CalendarLink.forLaunch(launch)) {
                activity.webpageURL = url
                activity.isEligibleForHandoff = true
                activity.title = "Add to calendar"
            }
        }
        .task(id: launch.id) {
            if launch.hasPadCoords {
                weather = await WeatherService.shared.forPad(lat: launch.padLat, lng: launch.padLng)
            }
        }
    }

    private var webcastButton: some View {
        Button {
            handoffWebcast = true
            WKInterfaceDevice.current().play(.click)
        } label: {
            Text(launch.webcastLive ? "🔴 LIVE — WATCH" : "▶ WEBCAST")
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundStyle(.black)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
                .background(launch.webcastLive ? Terminal.red : Terminal.green,
                            in: RoundedRectangle(cornerRadius: 20))
        }
        .buttonStyle(.plain)
        .padding(.vertical, 4)
    }

    private var agencyBadge: some View {
        HStack(spacing: 6) {
            if !launch.agencyLogoUrl.isEmpty, let url = URL(string: launch.agencyLogoUrl) {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFit()
                } placeholder: {
                    Color.clear
                }
                .frame(maxWidth: 96, maxHeight: 20)
                .clipped()
            }
            if !launch.agencyType.isEmpty {
                Text(launch.agencyType.uppercased())
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(Terminal.grey)
                    .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 2)
    }

    private var calendarButton: some View {
        Button {
            handoffCalendar = true
            WKInterfaceDevice.current().play(.click)
        } label: {
            Text("📅 ADD TO CALENDAR")
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
                .background(Color.gray.opacity(0.28), in: RoundedRectangle(cornerRadius: 20))
        }
        .buttonStyle(.plain)
        .padding(.vertical, 2)
    }

    /// Favori ajans yıldızı (Dalga 9) — bu görevin ajansını favorilere ekler/çıkarır.
    private func favoriteButton(_ abbrev: String) -> some View {
        let isFav = favorites.isFavorite(abbrev)
        return Button {
            favorites.toggle(abbrev)
            WKInterfaceDevice.current().play(.click)
        } label: {
            Text(isFav ? "★ FAVORITE · \(abbrev)" : "☆ FOLLOW · \(abbrev)")
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundStyle(isFav ? .black : Terminal.amber)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
                .background(
                    isFav ? AnyShapeStyle(Terminal.amber) : AnyShapeStyle(Color.gray.opacity(0.28)),
                    in: RoundedRectangle(cornerRadius: 20)
                )
        }
        .buttonStyle(.plain)
        .padding(.vertical, 2)
    }

    private var statsPanel: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("STATS")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .kerning(2)
                .foregroundStyle(Terminal.green)
            if launch.agencyLaunchCount > 0 {
                TelemetryRow(label: "AGY FLT", value: "#\(launch.agencyLaunchCount)")
            }
            if launch.padLaunchCount > 0 {
                TelemetryRow(label: "PAD FLT", value: "#\(launch.padLaunchCount)")
            }
            if launch.providerTotal > 0 {
                TelemetryRow(label: "RECORD", value: "\(launch.providerSuccess)/\(launch.providerTotal) ok")
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }

    private var padWeatherPanel: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("PAD WX")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .kerning(2)
                .foregroundStyle(Terminal.green)
            if let wx = weather {
                Text("\(wx.emoji) \(wx.tempC)°C · \(wx.condition)")
                    .font(.system(size: 11, design: .monospaced))
                    .lineLimit(1)
                TelemetryRow(label: "WIND", value: "\(wx.windKmh) km/h (gust \(wx.gustsKmh))")
                if wx.windConcern {
                    Text("⚠ high wind")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(Terminal.red)
                }
                TelemetryRow(label: "CLOUD", value: "\(wx.cloudPct)%")
                if wx.precipMm > 0 {
                    TelemetryRow(label: "PRECIP", value: "\(wx.precipMm) mm")
                }
            } else {
                Text("> reading…")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Terminal.grey)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }
}

private struct MissionMilestoneView: View {
    let launch: Launch

    var body: some View {
        TimelineView(.periodic(from: .now, by: 5)) { context in
            if let label = label(at: context.date) {
                Text(label)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(label.contains("FAIL") || label.contains("ANOMALY") ? Terminal.red : Terminal.green)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(maxWidth: 150)
            }
        }
    }

    private func label(at date: Date) -> String? {
        let status = "\(launch.statusAbbrev) \(launch.statusName)".lowercased()
        if status.contains("partial") && status.contains("fail") { return "PARTIAL FAILURE · SOURCE REPORTED" }
        if status.contains("fail") { return "MISSION ANOMALY · SOURCE REPORTED" }
        if status.contains("payload") || status.contains("deployed") { return "PAYLOAD DEPLOYED · SOURCE" }
        guard status.contains("flight"), !launch.milestones.isEmpty else { return nil }
        let elapsed = Int(date.timeIntervalSince(launch.net))
        let current = launch.milestones.last { $0.secondsFromT0 <= elapsed }
        let next = launch.milestones.first { $0.secondsFromT0 > elapsed }
        if let current, let next { return "\(current.label) · NEXT \(next.label)" }
        if let current { return "\(current.label) · RESULT PENDING" }
        if let next { return "NEXT \(next.label)" }
        return "SOURCE TIMELINE PENDING"
    }
}

struct TelemetryRow: View {
    let label: String
    let value: String
    var valueColor: Color = .white

    var body: some View {
        if !value.isEmpty {
            HStack(alignment: .top, spacing: 6) {
                Text(label)
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundStyle(Terminal.green)
                    .frame(width: 56, alignment: .leading)
                Text(value)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(valueColor)
                    .lineLimit(2)
            }
        }
    }
}
