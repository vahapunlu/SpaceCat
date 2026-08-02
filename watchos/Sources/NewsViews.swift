import SwiftUI

struct NewsRow: View {
    let article: NewsArticle

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(article.title)
                .font(.system(size: 12, weight: .medium))
                .lineLimit(2)
            Text("\(article.site) · \(article.relativeTime)")
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Terminal.amber)
                .lineLimit(1)
        }
    }
}

struct NewsDetailView: View {
    let article: NewsArticle

    var body: some View {
        ScrollView {
            VStack(spacing: 6) {
                Text("WIRE")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .kerning(2)
                    .foregroundStyle(Terminal.green)
                Text(article.title)
                    .font(.headline)
                    .multilineTextAlignment(.center)
                Text("\(article.site) · \(article.relativeTime)")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Terminal.amber)
                if !article.summary.isEmpty {
                    Text(article.summary)
                        .font(.system(size: 11))
                        .foregroundStyle(Terminal.grey)
                        .padding(.top, 4)
                }
            }
            .padding(.horizontal, 4)
        }
    }
}
