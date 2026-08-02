package com.spacecat.wear.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
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
import com.spacecat.wear.BuildConfig
import com.spacecat.wear.ui.theme.TerminalAmber
import com.spacecat.wear.ui.theme.TerminalGreen
import com.spacecat.wear.ui.theme.TerminalGrey

/**
 * About / Félicette ekranı (Dalga 9) — uygulamanın hikâyesi, sürüm ve veri
 * kaynağı künyesi. İsim: `cat` Unix komutu + Félicette (1963, uzaya giden tek kedi).
 */
@Composable
fun AboutScreen() {
    val listState = rememberScalingLazyListState()
    Scaffold(
        timeText = { TimeText() },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) },
    ) {
        ScalingLazyColumn(state = listState, modifier = Modifier.wearViewport()) {
            item { Header("ⓘ ABOUT") }
            item {
                Text(
                    text = "SPACE CAT",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp,
                    color = TerminalGreen,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            item {
                Text(
                    text = "Launch Terminal",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = TerminalGrey,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            item {
                Paragraph(
                    "An agency-agnostic launch tracker for your wrist. " +
                        "Countdowns, live webcasts, pad weather and the ISS — " +
                        "no phone required.",
                )
            }

            item { SectionLabel("THE NAME") }
            item {
                Paragraph(
                    "`cat` is the Unix command that prints a file to your terminal. " +
                        "Félicette was the first — and only — cat in space, flown by " +
                        "France on 18 Oct 1963 and recovered alive. This terminal is " +
                        "named for both.",
                )
            }

            item { SectionLabel("DATA") }
            item { Credit("Launches & events", "The Space Devs · LL2") }
            item { Credit("Space news", "Spaceflight News API") }
            item { Credit("Pad weather", "Open-Meteo") }
            item { Credit("ISS position", "wheretheiss.at") }

            item { SectionLabel("BUILD") }
            item {
                Credit(
                    "Version",
                    "${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})",
                )
            }
            item {
                Text(
                    text = "🐈 Ad astra, Félicette.",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = TerminalAmber,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp, bottom = 20.dp),
                )
            }
        }
    }
}

@Composable
private fun Header(text: String) {
    Text(
        text = text,
        fontFamily = FontFamily.Monospace,
        fontSize = 11.sp,
        letterSpacing = 2.sp,
        color = TerminalGreen,
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text,
        fontFamily = FontFamily.Monospace,
        fontSize = 11.sp,
        letterSpacing = 2.sp,
        fontWeight = FontWeight.Bold,
        color = TerminalGreen,
        modifier = Modifier
            .roundSafeWidth(0.76f)
            .padding(top = 10.dp, bottom = 2.dp),
    )
}

@Composable
private fun Paragraph(text: String) {
    Text(
        text = text,
        fontFamily = FontFamily.Monospace,
        fontSize = 11.sp,
        color = TerminalGrey,
        textAlign = TextAlign.Center,
        modifier = Modifier
            .roundSafeNarrativeWidth()
            .padding(top = 6.dp, start = 8.dp, end = 8.dp),
    )
}

@Composable
private fun Credit(label: String, value: String) {
    Column(
        modifier = Modifier
            .roundSafeWidth(0.76f)
            .padding(vertical = 2.dp),
    ) {
        Text(
            text = label,
            fontFamily = FontFamily.Monospace,
            fontSize = 10.sp,
            color = TerminalGrey,
        )
        Text(
            text = value,
            fontFamily = FontFamily.Monospace,
            fontSize = 12.sp,
            color = TerminalAmber,
        )
    }
}
