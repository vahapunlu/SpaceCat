package com.spacecat.wear.data.model

import kotlinx.serialization.Serializable

@Serializable
data class NewsArticle(
    val id: Long,
    val title: String,
    val site: String = "",
    val summary: String = "",
    val publishedMillis: Long = 0,
)
