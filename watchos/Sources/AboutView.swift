import SwiftUI

/// About / Félicette ekranı (Dalga 9) — uygulamanın hikâyesi, sürüm ve veri
/// kaynağı künyesi. İsim: `cat` Unix komutu + Félicette (1963, uzaya giden tek kedi).
struct AboutView: View {
    private var version: String {
        let short = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(short) (\(build))"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 4) {
                Text("SPACE CAT")
                    .font(.system(size: 15, weight: .bold, design: .monospaced))
                    .kerning(2)
                    .foregroundStyle(Terminal.green)
                Text("Launch Terminal")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Terminal.grey)

                paragraph(
                    "An agency-agnostic launch tracker for your wrist. "
                        + "Countdowns, live webcasts, pad weather and the ISS — no phone required."
                )

                section("THE NAME")
                paragraph(
                    "`cat` is the Unix command that prints a file to your terminal. "
                        + "Félicette was the first — and only — cat in space, flown by France "
                        + "on 18 Oct 1963 and recovered alive. This terminal is named for both."
                )

                section("DATA")
                credit("Launches & events", "The Space Devs · LL2")
                credit("Space news", "Spaceflight News API")
                credit("Pad weather", "Open-Meteo")
                credit("ISS position", "wheretheiss.at")

                section("BUILD")
                credit("Version", version)

                Text("🐈 Ad astra, Félicette.")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Terminal.amber)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 12)
                    .padding(.bottom, 8)
            }
            .padding(.horizontal, 6)
        }
    }

    private func paragraph(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 11, design: .monospaced))
            .foregroundStyle(Terminal.grey)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
            .padding(.top, 6)
    }

    private func section(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 11, weight: .bold, design: .monospaced))
            .kerning(2)
            .foregroundStyle(Terminal.green)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 10)
    }

    private func credit(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(label)
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Terminal.grey)
            Text(value)
                .font(.system(size: 12, design: .monospaced))
                .foregroundStyle(Terminal.amber)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 2)
    }
}
