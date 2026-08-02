package com.spacecat.wear.data.model

/** ISS'in anlık durumu (wheretheiss.at'ten türetilmiş). */
data class IssState(
    val lat: Double,
    val lng: Double,
    val altitudeKm: Int,
    val velocityKmh: Int,
    val visibility: String,
) {
    /** "28.6°N 116.5°W" biçiminde konum. */
    val coordLabel: String get() {
        val ns = if (lat >= 0) "N" else "S"
        val ew = if (lng >= 0) "E" else "W"
        return "%.1f°%s %.1f°%s".format(kotlin.math.abs(lat), ns, kotlin.math.abs(lng), ew)
    }
}
