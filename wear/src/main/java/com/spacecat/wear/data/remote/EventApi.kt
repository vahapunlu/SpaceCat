package com.spacecat.wear.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.GET

/** LL2 events — spacewalk, docking, tutulma, flyby vb. (fırlatmalarla aynı ekip). */
interface EventApi {
    @GET("events/upcoming/?limit=5")
    suspend fun upcomingEvents(): EventListResponse
}

@Serializable
data class EventListResponse(
    val results: List<EventDto> = emptyList(),
)

@Serializable
data class EventDto(
    val id: Int,
    val name: String,
    val type: EventTypeDto? = null,
    val date: String? = null,
    val location: String? = null,
    val description: String? = null,
)

@Serializable
data class EventTypeDto(
    val name: String? = null,
)
