import SwiftUI
import WatchKit

struct SettingsView: View {
    @AppStorage("alertT10") private var t10 = true
    @AppStorage("alertT60") private var t60 = false
    @AppStorage("alertStatus") private var statusChange = true
    @AppStorage("alertDelays") private var delays = true
    @AppStorage("alertLiftoff") private var liftoff = true
    @AppStorage("alertResults") private var results = true
    @AppStorage("favoritesOnly") private var favoritesOnly = false

    var body: some View {
        List {
            Section {
                toggle("T-10 min", $t10)
                toggle("T-1 hour", $t60)
                toggle("GO / HOLD", $statusChange)
                toggle("Delays", $delays)
                toggle("Liftoff buzz", $liftoff)
                toggle("Launch result", $results)
            } header: {
                Text("ALERTS")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .kerning(2)
                    .foregroundStyle(Terminal.green)
            }
            Section {
                toggle("Favorites only", $favoritesOnly)
                NavigationLink {
                    ManageFavoritesView()
                } label: {
                    Text("Manage favorites")
                        .font(.system(size: 13, design: .monospaced))
                }
            } header: {
                Text("FILTER")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .kerning(2)
                    .foregroundStyle(Terminal.green)
            } footer: {
                Text("Limits the launch list and alerts to your favorite agencies.")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(Terminal.grey)
            }
            Section {
                Button {
                    WKInterfaceDevice.current().play(.notification)
                    NotificationManager.fire(
                        id: "test",
                        title: "🚀 LIFTOFF",
                        body: "Test — Starlink G12-34"
                    )
                } label: {
                    Text("Test alert")
                        .font(.system(size: 13, design: .monospaced))
                }
            }
        }
        .onChange(of: t10) { _, _ in NotificationManager.preferencesChanged() }
        .onChange(of: t60) { _, _ in NotificationManager.preferencesChanged() }
        .onChange(of: liftoff) { _, _ in NotificationManager.preferencesChanged() }
        .onChange(of: favoritesOnly) { _, _ in NotificationManager.preferencesChanged() }
    }

    private func toggle(_ label: String, _ binding: Binding<Bool>) -> some View {
        Toggle(isOn: binding) {
            Text(label)
                .font(.system(size: 13, design: .monospaced))
        }
        .tint(Terminal.green)
    }
}
