package com.spacecat.wear.util

import com.spacecat.wear.data.model.Launch
import java.net.URLEncoder
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

/**
 * Fırlatma için Google Calendar "şablon" URL'i üretir. Bu bir web linki
 * olduğundan [PhoneLauncher] ile telefonda açılır — kullanıcı olayı tek
 * dokunuşla kendi takvimine kaydeder (companion app / izin gerekmez).
 */
object CalendarLink {

    private val utc: DateTimeFormatter =
        DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC)

    fun forLaunch(launch: Launch): String {
        val start = utc.format(Instant.ofEpochMilli(launch.netMillis))
        val end = utc.format(Instant.ofEpochMilli(launch.netMillis + 60 * 60 * 1000L))
        val text = enc("🚀 ${launch.name}")
        val details = enc(
            buildString {
                append(launch.rocketFullName.ifEmpty { launch.vehicle })
                if (launch.location.isNotEmpty()) append(" · ${launch.location}")
                append(" · via Space Cat")
            }
        )
        val location = enc(launch.location)
        return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
            "&text=$text&dates=$start/$end&details=$details&location=$location"
    }

    private fun enc(s: String): String = URLEncoder.encode(s, "UTF-8")
}
