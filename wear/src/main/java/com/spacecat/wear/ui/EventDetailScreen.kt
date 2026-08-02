package com.spacecat.wear.ui

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import com.spacecat.wear.data.model.SpaceEvent
import com.spacecat.wear.ui.theme.TerminalAmber
import com.spacecat.wear.ui.theme.TerminalGreen
import com.spacecat.wear.ui.theme.TerminalGrey

@Composable
fun EventDetailScreen(event: SpaceEvent?) {
    val listState = rememberScalingLazyListState()
    Scaffold(
        timeText = { TimeText() },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) },
    ) {
        ScalingLazyColumn(state = listState, modifier = Modifier.wearViewport()) {
            if (event == null) {
                item {
                    Text(
                        text = "> EVENT NOT FOUND",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = TerminalGreen,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
                return@ScalingLazyColumn
            }
            item {
                Text(
                    text = "🛰 EVENT",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    letterSpacing = 2.sp,
                    color = TerminalGreen,
                )
            }
            item {
                Text(
                    text = event.name,
                    style = MaterialTheme.typography.title3,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .roundSafeWidth(0.76f)
                        .padding(horizontal = 10.dp),
                )
            }
            item {
                Text(
                    text = buildString {
                        if (event.type.isNotEmpty()) append("${event.type} · ")
                        append(formatNet(event.dateMillis))
                    },
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = TerminalAmber,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .roundSafeWidth(0.76f)
                        .padding(top = 2.dp),
                )
            }
            if (event.location.isNotEmpty()) {
                item {
                    Text(
                        text = event.location,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = TerminalGreen,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .roundSafeWidth(0.76f)
                            .padding(top = 2.dp),
                    )
                }
            }
            if (event.description.isNotEmpty()) {
                item {
                    Text(
                        text = event.description,
                        style = MaterialTheme.typography.caption2,
                        color = TerminalGrey,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .roundSafeNarrativeWidth()
                            .padding(top = 10.dp, start = 14.dp, end = 14.dp, bottom = 24.dp),
                    )
                }
            }
        }
    }
}
