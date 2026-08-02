package com.spacecat.wear.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.http.GET

/** Spaceflight News API v4 — LL2 ile aynı ekip (The Space Devs), ücretsiz. */
interface SnapiApi {
    @GET("articles/?limit=5&ordering=-published_at")
    suspend fun latestArticles(): ArticleListResponse
}

@Serializable
data class ArticleListResponse(
    val results: List<ArticleDto> = emptyList(),
)

@Serializable
data class ArticleDto(
    val id: Long,
    val title: String,
    @SerialName("news_site") val newsSite: String? = null,
    val summary: String? = null,
    @SerialName("published_at") val publishedAt: String? = null,
)
