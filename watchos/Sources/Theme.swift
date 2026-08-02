import SwiftUI

enum Terminal {
    static let green = Color(red: 0, green: 0.902, blue: 0.541)      // #00E68A
    static let amber = Color(red: 1, green: 0.722, blue: 0.424)      // #FFB86C
    static let red = Color(red: 1, green: 0.361, blue: 0.341)        // #FF5C57
    static let grey = Color(red: 0.604, green: 0.647, blue: 0.694)   // #9AA5B1

    static func statusColor(_ abbrev: String) -> Color {
        switch abbrev.lowercased() {
        case "go", "success": return green
        case "hold", "failure", "partial failure": return red
        default: return amber // TBD / TBC / In Flight
        }
    }

    /// GO ihtimali rengi: yüksek=yeşil, orta=amber, düşük=kırmızı.
    static func probabilityColor(_ pct: Int) -> Color {
        switch pct {
        case 70...: return green
        case 40...: return amber
        default: return red
        }
    }
}
