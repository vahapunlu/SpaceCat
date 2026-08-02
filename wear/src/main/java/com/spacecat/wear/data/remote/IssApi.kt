package com.spacecat.wear.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.GET

/** wheretheiss.at — ISS anlık konumu (ücretsiz, anahtarsız). */
interface IssApi {
    @GET("v1/satellites/25544")
    suspend fun current(): IssDto
}

@Serializable
data class IssDto(
    val latitude: Double? = null,
    val longitude: Double? = null,
    val altitude: Double? = null,
    val velocity: Double? = null,
    val visibility: String? = null,
)
