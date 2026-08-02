package com.spacecat.wear.util

import java.util.Locale

fun formatCountdown(deltaMillis: Long): String {
    if (deltaMillis <= 0) return "LIFTOFF"
    val totalSeconds = deltaMillis / 1000
    val days = totalSeconds / 86_400
    val hours = (totalSeconds % 86_400) / 3_600
    val minutes = (totalSeconds % 3_600) / 60
    val seconds = totalSeconds % 60
    return if (days > 0) {
        String.format(Locale.US, "T-%dd %02d:%02d:%02d", days, hours, minutes, seconds)
    } else {
        String.format(Locale.US, "T-%02d:%02d:%02d", hours, minutes, seconds)
    }
}

fun formatCountdownShort(deltaMillis: Long): String {
    if (deltaMillis <= 0) return "LIFTOFF"
    val totalMinutes = deltaMillis / 60_000
    val days = totalMinutes / 1_440
    val hours = (totalMinutes % 1_440) / 60
    val minutes = totalMinutes % 60
    return when {
        days > 0 -> "T-${days}d ${hours}h"
        hours > 0 -> "T-${hours}h ${minutes}m"
        else -> "T-${minutes}m"
    }
}
