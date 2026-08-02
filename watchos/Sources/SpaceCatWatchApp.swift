import SwiftUI
import WatchKit

@main
struct SpaceCatWatchApp: App {
    @WKApplicationDelegateAdaptor(AppDelegate.self) private var delegate
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onAppear {
                    // Deterministik ekran görüntüsü modunda izin istemeyi atla.
                    if ProcessInfo.processInfo.environment["SHOT_SCREEN"] == nil {
                        NotificationManager.requestAuthorization()
                    }
                }
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .background {
                AppDelegate.scheduleNextRefresh()
            }
        }
    }
}

final class AppDelegate: NSObject, WKApplicationDelegate {

    func applicationDidFinishLaunching() {
        Self.scheduleNextRefresh()
    }

    /// ~30 dk sonrasına arka plan senkronu iste (sistem bütçesine tabidir)
    static func scheduleNextRefresh() {
        WKApplication.shared().scheduleBackgroundRefresh(
            withPreferredDate: Date().addingTimeInterval(30 * 60),
            userInfo: nil
        ) { _ in }
    }

    func handle(_ backgroundTasks: Set<WKRefreshBackgroundTask>) {
        for task in backgroundTasks {
            if let refresh = task as? WKApplicationRefreshBackgroundTask {
                Task { @MainActor in
                    // LaunchStore init'te önbelleği yükler; refresh fark tespiti +
                    // bildirim + widget tazelemeyi kendisi yapar.
                    let store = LaunchStore()
                    await store.refresh()
                    Self.scheduleNextRefresh()
                    refresh.setTaskCompletedWithSnapshot(false)
                }
            } else {
                task.setTaskCompletedWithSnapshot(false)
            }
        }
    }
}
