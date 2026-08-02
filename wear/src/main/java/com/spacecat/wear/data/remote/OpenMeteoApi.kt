package com.spacecat.wear.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.http.GET
import retrofit2.http.Query

/** Open-Meteo — ücretsiz, anahtarsız anlık hava (fırlatma pad'i için). */
interface OpenMeteoApi {
    @GET(
        "v1/forecast?current=temperature_2m,wind_speed_10m,wind_gusts_10m," +
            "cloud_cover,precipitation,weather_code&wind_speed_unit=kmh"
    )
    suspend fun current(
        @Query("latitude") lat: Double,
        @Query("longitude") lng: Double,
    ): OpenMeteoResponse
}

@Serializable
data class OpenMeteoResponse(
    val current: OpenMeteoCurrent? = null,
)

@Serializable
data class OpenMeteoCurrent(
    @SerialName("temperature_2m") val temp: Double? = null,
    @SerialName("wind_speed_10m") val wind: Double? = null,
    @SerialName("wind_gusts_10m") val gusts: Double? = null,
    @SerialName("cloud_cover") val cloud: Int? = null,
    val precipitation: Double? = null,
    @SerialName("weather_code") val code: Int? = null,
)
