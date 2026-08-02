package com.spacecat.wear.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.http.GET

interface Ll2Api {
    // detailed mode: vidURLs (canlı yayın linkleri) + webcast_live yalnızca bu modda geliyor.
    @GET("launches/upcoming/?mode=detailed&limit=8")
    suspend fun upcomingLaunches(): LaunchListResponse
}

@Serializable
data class LaunchListResponse(
    val results: List<LaunchDto> = emptyList(),
)

@Serializable
data class LaunchDto(
    val id: String,
    val name: String,
    val net: String? = null,
    @SerialName("window_start") val windowStart: String? = null,
    @SerialName("window_end") val windowEnd: String? = null,
    val status: StatusDto? = null,
    @SerialName("launch_service_provider") val provider: AgencyDto? = null,
    val rocket: RocketDto? = null,
    val mission: MissionDto? = null,
    val pad: PadDto? = null,
    @SerialName("webcast_live") val webcastLive: Boolean? = null,
    val vidURLs: List<VidUrlDto>? = null,
    val probability: Int? = null,
    @SerialName("weather_concerns") val weatherConcerns: String? = null,
    @SerialName("agency_launch_attempt_count") val agencyLaunchCount: Int? = null,
    @SerialName("pad_launch_attempt_count") val padLaunchCount: Int? = null,
    val image: ImageDto? = null,
    val timeline: List<TimelineEventDto>? = null,
    val failreason: String? = null,
)

@Serializable
data class TimelineEventDto(
    val type: TimelineTypeDto? = null,
    @SerialName("relative_time") val relativeTime: String? = null,
    val description: String? = null,
)

@Serializable
data class TimelineTypeDto(
    val name: String? = null,
    val abbrev: String? = null,
)

@Serializable
data class ImageDto(
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("thumbnail_url") val thumbnailUrl: String? = null,
)

@Serializable
data class VidUrlDto(
    // Düşük priority = daha öncelikli (ajansın resmi yayını genelde 1).
    val priority: Int? = null,
    val title: String? = null,
    val url: String? = null,
    val live: Boolean? = null,
)

@Serializable
data class StatusDto(
    val name: String? = null,
    val abbrev: String? = null,
)

@Serializable
data class AgencyDto(
    val name: String? = null,
    val abbrev: String? = null,
    @SerialName("successful_launches") val successfulLaunches: Int? = null,
    @SerialName("total_launch_count") val totalLaunchCount: Int? = null,
    val logo: ImageDto? = null,
    val type: AgencyTypeDto? = null,
)

@Serializable
data class AgencyTypeDto(
    val name: String? = null,
)

@Serializable
data class RocketDto(
    val configuration: RocketConfigDto? = null,
)

@Serializable
data class RocketConfigDto(
    @SerialName("full_name") val fullName: String? = null,
)

@Serializable
data class MissionDto(
    val description: String? = null,
    val orbit: OrbitDto? = null,
)

@Serializable
data class OrbitDto(
    val name: String? = null,
    val abbrev: String? = null,
)

@Serializable
data class PadDto(
    val name: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val location: LocationDto? = null,
)

@Serializable
data class LocationDto(
    val name: String? = null,
)
