package com.spacecat.wear.notify

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * AlarmScheduler'ın kurduğu T-10 / T-60 alarmlarını bildirime çevirir.
 * Kalan süre tetik anında yeniden hesaplanır; alarm geç tetiklenirse
 * metin yine de doğru olur.
 */
class LaunchAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val mission = intent.getStringExtra(EXTRA_MISSION) ?: return
        val net = intent.getLongExtra(EXTRA_NET, 0)
        val launchId = intent.getStringExtra(EXTRA_LAUNCH_ID) ?: return
        val liftoff = intent.getBooleanExtra(EXTRA_LIFTOFF, false)

        if (liftoff) {
            // T-0: bileği titret + kalkış bildirimi.
            Haptics.liftoff(context)
            NotificationHelper.notify(
                context = context,
                channel = NotificationHelper.CHANNEL_IMMINENT,
                title = "🚀 LIFTOFF",
                text = mission,
                notificationId = launchId.hashCode() + 3,
            )
            return
        }

        val minutesLeft = ((net - System.currentTimeMillis()) / 60_000).coerceAtLeast(0)
        val title = if (minutesLeft <= 15) "🚀 T-$minutesLeft min" else "🚀 T-${minutesLeft / 60}h ${minutesLeft % 60}m"

        NotificationHelper.notify(
            context = context,
            channel = NotificationHelper.CHANNEL_IMMINENT,
            title = title,
            text = mission,
            notificationId = launchId.hashCode(),
        )
    }

    companion object {
        const val EXTRA_MISSION = "mission"
        const val EXTRA_NET = "net"
        const val EXTRA_LAUNCH_ID = "launch_id"
        const val EXTRA_LIFTOFF = "liftoff"
    }
}
