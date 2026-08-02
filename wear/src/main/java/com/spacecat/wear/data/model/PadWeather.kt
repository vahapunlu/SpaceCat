package com.spacecat.wear.data.model

/** Pad'in anlık havası (Open-Meteo'dan türetilmiş, ekran için hazır). */
data class PadWeather(
    val tempC: Int,
    val windKmh: Int,
    val gustsKmh: Int,
    val cloudPct: Int,
    val precipMm: Double,
    val code: Int,
) {
    val condition: String get() = wmoLabel(code)
    val emoji: String get() = wmoEmoji(code)

    /** Rüzgar fırlatmaların en sık scrub nedeni — kaba bir uyarı bayrağı. */
    val windConcern: Boolean get() = gustsKmh >= 40
}

// WMO weather code → kısa etiket
private fun wmoLabel(code: Int): String = when (code) {
    0 -> "Clear"
    1 -> "Mainly clear"
    2 -> "Partly cloudy"
    3 -> "Overcast"
    45, 48 -> "Fog"
    51, 53, 55 -> "Drizzle"
    56, 57 -> "Freezing drizzle"
    61, 63, 65 -> "Rain"
    66, 67 -> "Freezing rain"
    71, 73, 75, 77 -> "Snow"
    80, 81, 82 -> "Showers"
    85, 86 -> "Snow showers"
    95 -> "Thunderstorm"
    96, 99 -> "Thunderstorm, hail"
    else -> "—"
}

private fun wmoEmoji(code: Int): String = when (code) {
    0 -> "☀️"
    1 -> "🌤️"
    2 -> "⛅"
    3 -> "☁️"
    45, 48 -> "🌫️"
    51, 53, 55, 56, 57 -> "🌦️"
    61, 63, 65, 66, 67, 80, 81, 82 -> "🌧️"
    71, 73, 75, 77, 85, 86 -> "🌨️"
    95, 96, 99 -> "⛈️"
    else -> "🛰️"
}
