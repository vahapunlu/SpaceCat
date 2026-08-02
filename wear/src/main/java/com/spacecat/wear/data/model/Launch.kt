package com.spacecat.wear.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Launch(
    val id: String,
    val name: String,
    val netMillis: Long,
    val statusAbbrev: String = "TBD",
    val statusName: String = "",
    val agency: String = "",
    val agencyAbbrev: String? = null,
    val pad: String = "",
    val location: String = "",
    // Detay ekranı alanları — eski önbellek kayıtları için varsayılanlı.
    val missionDescription: String = "",
    val orbit: String = "",
    val rocketFullName: String = "",
    val windowStartMillis: Long = 0,
    val windowEndMillis: Long = 0,
    // Canlı yayın (LL2 detailed): en yüksek öncelikli webcast linki.
    val webcastLive: Boolean = false,
    val webcastUrl: String = "",
    val webcastTitle: String = "",
    // Hava & GO ihtimali (Dalga 3). probability: 0..100, yoksa -1.
    val probability: Int = -1,
    val weatherConcerns: String = "",
    val padLat: Double = 0.0,
    val padLng: Double = 0.0,
    // Fırlatma istatistiği (Dalga 4).
    val agencyLaunchCount: Int = 0,
    val padLaunchCount: Int = 0,
    val providerSuccess: Int = 0,
    val providerTotal: Int = 0,
    // Görev/roket görseli (Dalga 5) — thumbnail öncelikli.
    val imageUrl: String = "",
    // Ajans markası (Dalga 8).
    val agencyLogoUrl: String = "",
    val agencyType: String = "",
    // LL2 planned timeline. This is a schedule contract, never live telemetry.
    val milestones: List<LaunchMilestone> = emptyList(),
    val failureReason: String = "",
) {
    val hasStats: Boolean get() = agencyLaunchCount > 0 || providerTotal > 0
    val hasWebcast: Boolean get() = webcastUrl.isNotEmpty()
    val hasProbability: Boolean get() = probability in 0..100
    val hasPadCoords: Boolean get() = padLat != 0.0 || padLng != 0.0
    // LL2 isim formatı: "Falcon 9 Block 5 | Starlink Group 12-34"
    val vehicle: String get() = name.substringBefore(" | ").trim()
    val mission: String get() = name.substringAfter(" | ", missingDelimiterValue = name).trim()
}
