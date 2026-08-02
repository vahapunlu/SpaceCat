package com.spacecat.wear.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme

val TerminalGreen = Color(0xFF00E68A)
val TerminalAmber = Color(0xFFFFB86C)
val TerminalRed = Color(0xFFFF5C57)
val TerminalGrey = Color(0xFF9AA5B1)
val DeepSpace = Color(0xFF0B0F14)

private val SpaceCatColors = Colors(
    primary = TerminalGreen,
    secondary = TerminalAmber,
    background = Color.Black,
    surface = DeepSpace,
    error = TerminalRed,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = Color.White,
    onSurface = Color.White,
)

@Composable
fun SpaceCatTheme(content: @Composable () -> Unit) {
    MaterialTheme(colors = SpaceCatColors, content = content)
}
