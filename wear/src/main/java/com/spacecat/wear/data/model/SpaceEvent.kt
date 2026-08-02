package com.spacecat.wear.data.model

import kotlinx.serialization.Serializable

/** LL2 uzay olayı: spacewalk, docking, tutulma, flyby vb. (fırlatma dışı içerik). */
@Serializable
data class SpaceEvent(
    val id: Int,
    val name: String,
    val type: String = "",
    val dateMillis: Long = 0,
    val location: String = "",
    val description: String = "",
)
