package com.spacecat.wear.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
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
import com.spacecat.wear.data.WeatherRepository
import com.spacecat.wear.data.model.Launch
import com.spacecat.wear.data.model.PadWeather
import com.spacecat.wear.ui.theme.TerminalAmber
import com.spacecat.wear.ui.theme.TerminalGreen
import com.spacecat.wear.ui.theme.TerminalGrey
import com.spacecat.wear.ui.theme.TerminalRed

@Composable
fun DetailScreen(launch: Launch?) {
    val listState = rememberScalingLazyListState()
    Scaffold(
        timeText = { TimeText() },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) },
    ) {
        ScalingLazyColumn(state = listState, modifier = Modifier.wearViewport()) {
            if (launch == null) {
                item {
                    Text(
                        text = "> MISSION NOT FOUND",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = TerminalGreen,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
                return@ScalingLazyColumn
            }

            if (launch.imageUrl.isNotEmpty()) {
                item {
                    // Görseller çoğu kez kare/dikey — kırpmadan Fit ile ortala,
                    // logo/roket tam görünsün (kırpınca aşağı kayık duruyordu).
                    AsyncImage(
                        model = launch.imageUrl,
                        contentDescription = null,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .roundSafeWidth(0.76f)
                            .height(88.dp)
                            .clip(RoundedCornerShape(10.dp)),
                    )
                }
            }
            item {
                Text(
                    text = "MISSION FILE",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    letterSpacing = 2.sp,
                    color = TerminalGreen,
                )
            }
            item {
                Text(
                    text = launch.mission,
                    style = MaterialTheme.typography.title3,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .roundSafeWidth(0.76f)
                        .padding(horizontal = 8.dp),
                )
            }
            item { CountdownText(launch.netMillis, fontSize = 20) }
            item { MissionMilestoneText(launch) }
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    StatusChip(launch.statusAbbrev)
                    Text(
                        text = launch.statusName.ifEmpty { launch.statusAbbrev },
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = statusColor(launch.statusAbbrev),
                        modifier = Modifier.padding(start = 6.dp),
                        maxLines = 1,
                    )
                }
            }

            if (launch.agencyLogoUrl.isNotEmpty() || launch.agencyType.isNotEmpty()) {
                item {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier
                            .roundSafeWidth(0.78f)
                            .padding(top = 4.dp),
                    ) {
                        if (launch.agencyLogoUrl.isNotEmpty()) {
                            AsyncImage(
                                model = launch.agencyLogoUrl,
                                contentDescription = null,
                                contentScale = ContentScale.Fit,
                                modifier = Modifier
                                    .height(22.dp)
                                    .widthIn(max = 72.dp)
                                    .padding(end = 6.dp),
                            )
                        }
                        if (launch.agencyType.isNotEmpty()) {
                            Text(
                                text = launch.agencyType.uppercase(),
                                fontFamily = FontFamily.Monospace,
                                fontSize = 10.sp,
                                color = TerminalGrey,
                                maxLines = 1,
                            )
                        }
                    }
                }
            }

            if (launch.hasWebcast) {
                item { WebcastChip(launch) }
            }

            if (launch.netMillis > System.currentTimeMillis()) {
                item { CalendarChip(launch) }
            }

            if (!launch.agencyAbbrev.isNullOrBlank()) {
                item { FavoriteAgencyChip(launch) }
            }

            item {
                Column(
                    modifier = Modifier
                        .roundSafeWidth(0.76f)
                        .padding(top = 10.dp, start = 12.dp, end = 12.dp),
                ) {
                    TelemetryRow("VEHICLE", launch.rocketFullName.ifEmpty { launch.vehicle })
                    TelemetryRow("AGENCY", launch.agencyAbbrev ?: launch.agency)
                    if (launch.hasProbability) {
                        ColoredTelemetryRow(
                            "GO ODDS", "${launch.probability}%", probabilityColor(launch.probability),
                        )
                    }
                    if (launch.orbit.isNotEmpty()) TelemetryRow("ORBIT", launch.orbit)
                    TelemetryRow("PAD", launch.pad)
                    TelemetryRow("SITE", launch.location)
                    TelemetryRow("NET", formatNet(launch.netMillis))
                    if (launch.windowStartMillis > 0 && launch.windowEndMillis > launch.windowStartMillis) {
                        TelemetryRow(
                            "WINDOW",
                            "${formatTime(launch.windowStartMillis)} → ${formatTime(launch.windowEndMillis)}",
                        )
                    } else if (launch.windowStartMillis > 0) {
                        TelemetryRow("WINDOW", "INSTANTANEOUS")
                    }
                }
            }

            if (launch.hasStats) {
                item { StatsPanel(launch) }
            }

            if (launch.hasPadCoords) {
                item { PadWeatherPanel(launch) }
            }

            if (launch.weatherConcerns.isNotEmpty()) {
                item {
                    Text(
                        text = "⚠ ${launch.weatherConcerns}",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = TerminalAmber,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .roundSafeNarrativeWidth()
                            .padding(top = 6.dp, start = 14.dp, end = 14.dp),
                    )
                }
            }

            if (launch.missionDescription.isNotEmpty()) {
                item {
                    Text(
                        text = launch.missionDescription,
                        style = MaterialTheme.typography.caption2,
                        color = TerminalGrey,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .roundSafeNarrativeWidth()
                            .padding(top = 10.dp, start = 14.dp, end = 14.dp, bottom = 20.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun TelemetryRow(label: String, value: String) {
    if (value.isEmpty()) return
    ColoredTelemetryRow(label, value, MaterialTheme.colors.onSurface)
}

@Composable
private fun ColoredTelemetryRow(label: String, value: String, valueColor: Color) {
    if (value.isEmpty()) return
    Row(modifier = Modifier.padding(vertical = 1.dp)) {
        Text(
            text = label.padEnd(8),
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = TerminalGreen,
        )
        Text(
            text = value,
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            color = valueColor,
            maxLines = 2,
        )
    }
}

/** GO ihtimali rengi: yüksek=yeşil, orta=amber, düşük=kırmızı. */
private fun probabilityColor(pct: Int): Color = when {
    pct >= 70 -> TerminalGreen
    pct >= 40 -> TerminalAmber
    else -> TerminalRed
}

/** Fırlatma istatistiği — bu görevin ajans/pad sıra numarası + ajans siciline. */
@Composable
private fun StatsPanel(launch: Launch) {
    Column(
        modifier = Modifier
            .roundSafeWidth(0.76f)
            .padding(top = 10.dp, start = 12.dp, end = 12.dp),
    ) {
        Text(
            text = "STATS",
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            letterSpacing = 2.sp,
            color = TerminalGreen,
        )
        if (launch.agencyLaunchCount > 0) {
            TelemetryRow("AGY FLT", "#${launch.agencyLaunchCount}")
        }
        if (launch.padLaunchCount > 0) {
            TelemetryRow("PAD FLT", "#${launch.padLaunchCount}")
        }
        if (launch.providerTotal > 0) {
            TelemetryRow("RECORD", "${launch.providerSuccess}/${launch.providerTotal} ok")
        }
    }
}

/** Pad'in anlık havası — açılınca Open-Meteo'dan çekilir (30 dk cache). */
@Composable
private fun PadWeatherPanel(launch: Launch) {
    val repo = remember { WeatherRepository.get() }
    val weather by produceState<PadWeather?>(initialValue = null, launch.id) {
        value = runCatching { repo.forPad(launch.padLat, launch.padLng) }.getOrNull()
    }

    Column(
        modifier = Modifier
            .roundSafeWidth(0.76f)
            .padding(top = 10.dp, start = 12.dp, end = 12.dp),
    ) {
        Text(
            text = "PAD WX",
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            letterSpacing = 2.sp,
            color = TerminalGreen,
        )
        val wx = weather
        if (wx == null) {
            Text(
                text = "> reading…",
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp,
                color = TerminalGrey,
            )
        } else {
            Text(
                text = "${wx.emoji} ${wx.tempC}°C · ${wx.condition}",
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp,
                color = MaterialTheme.colors.onSurface,
                maxLines = 1,
            )
            TelemetryRow("WIND", "${wx.windKmh} km/h (gust ${wx.gustsKmh})")
            // Rüzgar en sık scrub nedeni — sert rüzgarı kırmızıyla vurgula.
            if (wx.windConcern) {
                Text(
                    text = "⚠ high wind",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    color = TerminalRed,
                )
            }
            TelemetryRow("CLOUD", "${wx.cloudPct}%")
            if (wx.precipMm > 0.0) TelemetryRow("PRECIP", "${wx.precipMm} mm")
        }
    }
}
