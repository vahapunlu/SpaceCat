package com.spacecat.wear.notify

import android.content.Context
import com.spacecat.wear.data.SettingsRepository
import com.spacecat.wear.data.model.Launch
import com.spacecat.wear.ui.formatNet

/**
 * Fark tespit motoru: her senkronda eski ve yeni fırlatma listelerini
 * karşılaştırır; yalnız GEÇİŞLERDE bildirim üretir (doğal dedup —
 * önbellek güncellendiği için aynı geçiş ikinci kez görülmez).
 * Ufuk: 48 saat — uzak gelecekteki değişimlerle bilek meşgul edilmez.
 */
object LaunchNotifier {

    private const val HORIZON_MILLIS = 48 * 60 * 60 * 1000L
    private const val DELAY_THRESHOLD_MILLIS = 5 * 60 * 1000L

    suspend fun onDataRefreshed(context: Context, old: List<Launch>, new: List<Launch>) {
        val repo = SettingsRepository.get(context)
        val settings = repo.current()
        val favorites = repo.currentFavorites()
        val now = System.currentTimeMillis()
        val oldById = old.associateBy { it.id }

        // Favori süzme (Dalga 10c): "favorites only" açık ve en az bir favori varsa,
        // yalnız favori ajansların uyarıları gelir — liste ile aynı semantik.
        val filterActive = settings.favoritesOnly && favorites.isNotEmpty()
        fun isAllowed(launch: Launch): Boolean =
            !filterActive || (launch.agencyAbbrev != null && launch.agencyAbbrev in favorites)

        for (launch in new) {
            if (launch.netMillis - now > HORIZON_MILLIS) continue
            if (!isAllowed(launch)) continue
            val prev = oldById[launch.id] ?: continue

            // GO / HOLD geçişleri
            if (settings.statusChange && launch.statusAbbrev != prev.statusAbbrev) {
                when (launch.statusAbbrev.lowercase()) {
                    "go" -> NotificationHelper.notify(
                        context, NotificationHelper.CHANNEL_IMMINENT,
                        "🟢 GO — ${launch.mission}",
                        "${launch.vehicle} · ${formatNet(launch.netMillis)}",
                        launch.id.hashCode() + 1,
                    )
                    "hold" -> NotificationHelper.notify(
                        context, NotificationHelper.CHANNEL_UPDATES,
                        "🔴 HOLD — ${launch.mission}",
                        "Countdown holding · was ${formatNet(launch.netMillis)}",
                        launch.id.hashCode() + 1,
                    )
                }
            }

            // Fırlatma sonucu / uçuş durumu geçişleri (In Flight → Success/Failure)
            if (settings.results && launch.statusAbbrev != prev.statusAbbrev) {
                val resultId = launch.id.hashCode() + 4
                when (launch.statusAbbrev.lowercase()) {
                    "in flight" -> NotificationHelper.notify(
                        context, NotificationHelper.CHANNEL_IMMINENT,
                        "🚀 IN FLIGHT — ${launch.mission}",
                        launch.vehicle, resultId,
                    )
                    "success" -> NotificationHelper.notify(
                        context, NotificationHelper.CHANNEL_IMMINENT,
                        "✅ SUCCESS — ${launch.mission}",
                        "${launch.vehicle} · ${launch.statusName}", resultId,
                    )
                    "failure" -> NotificationHelper.notify(
                        context, NotificationHelper.CHANNEL_IMMINENT,
                        "❌ FAILURE — ${launch.mission}",
                        "${launch.vehicle} · ${launch.statusName}", resultId,
                    )
                    "partial failure" -> NotificationHelper.notify(
                        context, NotificationHelper.CHANNEL_IMMINENT,
                        "⚠️ PARTIAL — ${launch.mission}",
                        "${launch.vehicle} · ${launch.statusName}", resultId,
                    )
                }
            }

            // Erteleme / öne alma (NET kayması)
            val slip = launch.netMillis - prev.netMillis
            if (settings.delays && kotlin.math.abs(slip) >= DELAY_THRESHOLD_MILLIS) {
                val title = if (slip > 0) "⏳ Delayed — ${launch.mission}"
                else "⚡ Moved up — ${launch.mission}"
                NotificationHelper.notify(
                    context, NotificationHelper.CHANNEL_UPDATES,
                    title,
                    "New T-0: ${formatNet(launch.netMillis)}",
                    launch.id.hashCode() + 2,
                )
            }
        }

        // Sıradaki fırlatma için T-10 / T-60 alarmlarını tazele.
        // Favori süzme açıksa geri sayım alarmları da sıradaki FAVORİ fırlatmaya kurulur.
        val next = new
            .filter { it.netMillis > now && isAllowed(it) }
            .minByOrNull { it.netMillis }
        AlarmScheduler.reschedule(context, next, settings)
    }
}
