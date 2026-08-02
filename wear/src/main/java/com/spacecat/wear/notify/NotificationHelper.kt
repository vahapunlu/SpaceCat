package com.spacecat.wear.notify

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.spacecat.wear.R
import com.spacecat.wear.ui.MainActivity

object NotificationHelper {

    const val CHANNEL_IMMINENT = "imminent" // T-10, GO — titreşimli, yüksek öncelik
    const val CHANNEL_UPDATES = "updates"   // erteleme, durum — sessiz bilgi

    fun ensureChannels(context: Context) {
        val nm = context.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(
                CHANNEL_IMMINENT,
                "Imminent launches",
                NotificationManager.IMPORTANCE_HIGH,
            ).apply { description = "T-10 minutes and GO alerts" }
        )
        nm.createNotificationChannel(
            NotificationChannel(
                CHANNEL_UPDATES,
                "Schedule updates",
                NotificationManager.IMPORTANCE_DEFAULT,
            ).apply { description = "Delays and status changes" }
        )
    }

    fun notify(
        context: Context,
        channel: String,
        title: String,
        text: String,
        notificationId: Int,
    ) {
        if (
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        ensureChannels(context)

        val tap = PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        val notification = NotificationCompat.Builder(context, channel)
            .setSmallIcon(R.drawable.ic_notif)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setContentIntent(tap)
            .setAutoCancel(true)
            .setPriority(
                if (channel == CHANNEL_IMMINENT) NotificationCompat.PRIORITY_HIGH
                else NotificationCompat.PRIORITY_DEFAULT
            )
            .build()

        NotificationManagerCompat.from(context).notify(notificationId, notification)
    }
}
