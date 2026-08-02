package com.spacecat.wear.ui

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier

/**
 * Keeps rectangular content inside the usable chord of round Wear displays.
 * Long blocks use a narrower fraction because their top/bottom lines sit closer
 * to the circular edge than the block's vertical center.
 */
fun Modifier.roundSafeWidth(fraction: Float = 0.78f): Modifier =
    fillMaxWidth(fraction.coerceIn(0.60f, 0.86f))

fun Modifier.roundSafeNarrativeWidth(): Modifier = roundSafeWidth(0.70f)

fun Modifier.wearViewport(): Modifier = fillMaxSize()
