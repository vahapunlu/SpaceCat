package com.spacecat.wear.notify

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.spacecat.wear.data.AlertSettings
import com.spacecat.wear.data.model.Launch

/**
 * Sıradaki fırlatma için T-10 dk ve T-60 dk alarmlarını kurar.
 * Sabit requestCode'lar sayesinde her senkronda alarmlar yenisiyle
 * DEĞİŞTİRİLİR (birikme olmaz); NET kayarsa alarm otomatik kayar.
 */
object AlarmScheduler {

    private const val RC_T10 = 1010
    private const val RC_T60 = 1060
    private const val RC_T0 = 1000

    fun reschedule(context: Context, next: Launch?, settings: AlertSettings) {
        val am = context.getSystemService(AlarmManager::class.java)

        scheduleOrCancel(
            context, am, RC_T10,
            enabled = settings.t10,
            launch = next,
            leadMillis = 10 * 60_000L,
            windowMillis = 10 * 60_000L,
        )
        scheduleOrCancel(
            context, am, RC_T60,
            enabled = settings.t60,
            launch = next,
            leadMillis = 60 * 60_000L,
            windowMillis = 10 * 60_000L,
        )
        // T-0 kalkış: dar pencere (~60 sn) ki titreşim kalkışa yakın düşsün.
        scheduleOrCancel(
            context, am, RC_T0,
            enabled = settings.liftoff,
            launch = next,
            leadMillis = 0L,
            windowMillis = 60_000L,
            liftoff = true,
        )
    }

    private fun scheduleOrCancel(
        context: Context,
        am: AlarmManager,
        requestCode: Int,
        enabled: Boolean,
        launch: Launch?,
        leadMillis: Long,
        windowMillis: Long,
        liftoff: Boolean = false,
    ) {
        val triggerAt = launch?.let { it.netMillis - leadMillis }
        if (!enabled || launch == null || triggerAt == null ||
            triggerAt <= System.currentTimeMillis()
        ) {
            am.cancel(pendingIntent(context, requestCode, launch, liftoff))
            return
        }

        // İnexact alarm: tam alarm izni gerektirmez (Play politikasına uygun).
        val pi = pendingIntent(context, requestCode, launch, liftoff)
        am.setWindow(AlarmManager.RTC_WAKEUP, triggerAt, windowMillis, pi)
    }

    private fun pendingIntent(
        context: Context,
        requestCode: Int,
        launch: Launch?,
        liftoff: Boolean,
    ): PendingIntent {
        val intent = Intent(context, LaunchAlarmReceiver::class.java).apply {
            putExtra(LaunchAlarmReceiver.EXTRA_MISSION, launch?.mission ?: "")
            putExtra(LaunchAlarmReceiver.EXTRA_NET, launch?.netMillis ?: 0L)
            putExtra(LaunchAlarmReceiver.EXTRA_LAUNCH_ID, launch?.id ?: "")
            putExtra(LaunchAlarmReceiver.EXTRA_LIFTOFF, liftoff)
        }
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }
}
