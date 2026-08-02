import SwiftUI

/// ISS'in anlık durumu (wheretheiss.at).
struct IssState {
    let lat: Double
    let lng: Double
    let altitudeKm: Int
    let velocityKmh: Int
    let visibility: String

    var coordLabel: String {
        let ns = lat >= 0 ? "N" : "S"
        let ew = lng >= 0 ? "E" : "W"
        return String(format: "%.1f°%@ %.1f°%@", abs(lat), ns, abs(lng), ew)
    }
}

@MainActor
final class IssStore: ObservableObject {
    @Published var iss: IssState?

    func refresh() async {
        struct Item: Decodable {
            let latitude: Double?
            let longitude: Double?
            let altitude: Double?
            let velocity: Double?
            let visibility: String?
        }
        guard let url = URL(string: "https://api.wheretheiss.at/v1/satellites/25544") else { return }
        guard let (data, _) = try? await URLSession.shared.data(from: url),
              let item = try? JSONDecoder().decode(Item.self, from: data),
              let lat = item.latitude, let lng = item.longitude
        else { return }
        iss = IssState(
            lat: lat,
            lng: lng,
            altitudeKm: Int((item.altitude ?? 0).rounded()),
            velocityKmh: Int((item.velocity ?? 0).rounded()),
            visibility: item.visibility ?? ""
        )
    }
}

struct IssView: View {
    @StateObject private var store = IssStore()

    var body: some View {
        ScrollView {
            VStack(spacing: 4) {
                Text("🛰 ISS NOW")
                    .font(.system(size: 13, weight: .bold, design: .monospaced))
                    .kerning(2)
                    .foregroundStyle(Terminal.green)

                if let s = store.iss {
                    Text(s.coordLabel)
                        .font(.system(size: 18, weight: .bold, design: .monospaced))
                        .foregroundStyle(Terminal.amber)
                        .padding(.vertical, 6)
                    VStack(alignment: .leading, spacing: 2) {
                        issRow("ALT", "\(s.altitudeKm) km")
                        issRow("VEL", "\(s.velocityKmh.formatted()) km/h")
                        if !s.visibility.isEmpty {
                            issRow("SUN", s.visibility.uppercased())
                        }
                    }
                    Text("· live · 5s refresh")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(Terminal.grey)
                        .padding(.top, 8)
                } else {
                    Text("> locating…")
                        .font(.system(size: 12, design: .monospaced))
                        .foregroundStyle(Terminal.grey)
                        .padding(.top, 10)
                }
            }
            .padding(.horizontal, 6)
        }
        .task {
            while !Task.isCancelled {
                await store.refresh()
                try? await Task.sleep(for: .seconds(5))
            }
        }
    }

    private func issRow(_ label: String, _ value: String) -> some View {
        HStack(spacing: 6) {
            Text(label)
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundStyle(Terminal.green)
                .frame(width: 42, alignment: .leading)
            Text(value)
                .font(.system(size: 12, design: .monospaced))
        }
    }
}
