package com.spacecat.wear.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import com.spacecat.wear.data.IssRepository
import com.spacecat.wear.data.model.IssState
import com.spacecat.wear.ui.theme.TerminalAmber
import com.spacecat.wear.ui.theme.TerminalGreen
import com.spacecat.wear.ui.theme.TerminalGrey
import kotlinx.coroutines.delay

@Composable
fun IssScreen() {
    val repo = remember { IssRepository.get() }
    var iss by remember { mutableStateOf<IssState?>(null) }

    // Ekran açıkken 5 sn'de bir canlı konum tazele.
    LaunchedEffect(Unit) {
        while (true) {
            iss = repo.current() ?: iss
            delay(5_000)
        }
    }

    val listState = rememberScalingLazyListState()
    Scaffold(
        timeText = { TimeText() },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) },
    ) {
        ScalingLazyColumn(state = listState, modifier = Modifier.wearViewport()) {
            item {
                Text(
                    text = "🛰 ISS NOW",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp,
                    color = TerminalGreen,
                )
            }
            val state = iss
            if (state == null) {
                item {
                    Text(
                        text = "> locating…",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = TerminalGrey,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .roundSafeWidth(0.78f)
                            .padding(top = 10.dp),
                    )
                }
            } else {
                item {
                    Text(
                        text = state.coordLabel,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TerminalAmber,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .roundSafeWidth(0.76f)
                            .padding(vertical = 6.dp),
                    )
                }
                item {
                    Column(
                        modifier = Modifier
                            .roundSafeWidth(0.76f)
                            .padding(start = 18.dp, end = 18.dp, top = 4.dp),
                    ) {
                        IssRow("ALT", "${state.altitudeKm} km")
                        IssRow("VEL", "${"%,d".format(state.velocityKmh)} km/h")
                        if (state.visibility.isNotEmpty()) {
                            IssRow("SUN", state.visibility.uppercase())
                        }
                    }
                }
                item {
                    Text(
                        text = "· live · 5s refresh",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = TerminalGrey,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .roundSafeWidth(0.76f)
                            .padding(top = 8.dp, bottom = 12.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun IssRow(label: String, value: String) {
    androidx.compose.foundation.layout.Row(modifier = Modifier.padding(vertical = 1.dp)) {
        Text(
            text = label.padEnd(5),
            fontFamily = FontFamily.Monospace,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = TerminalGreen,
        )
        Text(
            text = value,
            fontFamily = FontFamily.Monospace,
            fontSize = 12.sp,
            color = androidx.wear.compose.material.MaterialTheme.colors.onSurface,
        )
    }
}
