package com.spacecat.wear.ui

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.Text
import com.spacecat.wear.data.model.Launch
import com.spacecat.wear.ui.theme.TerminalAmber
import com.spacecat.wear.ui.theme.TerminalGreen
import com.spacecat.wear.ui.theme.TerminalRed
import com.spacecat.wear.util.PhoneLauncher
import com.spacecat.wear.util.formatCountdown
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun CountdownText(netMillis: Long, fontSize: Int = 22) {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(netMillis) {
        while (true) {
            now = System.currentTimeMillis()
            delay(1_000)
        }
    }
    val remaining = netMillis - now
    val label = formatCountdown(remaining)

    if (remaining <= 0) {
        // LIFTOFF: nabız gibi atan amber
        val pulse = rememberInfiniteTransition(label = "liftoff")
        val pulseAlpha by pulse.animateFloat(
            initialValue = 1f,
            targetValue = 0.35f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 700),
                repeatMode = RepeatMode.Reverse,
            ),
            label = "liftoffAlpha",
        )
        Text(
            text = label,
            fontFamily = FontFamily.Monospace,
            fontSize = (fontSize + 2).sp,
            fontWeight = FontWeight.Bold,
            color = TerminalAmber,
            modifier = Modifier
                .padding(vertical = 4.dp)
                .alpha(pulseAlpha),
        )
    } else {
        Text(
            text = label,
            fontFamily = FontFamily.Monospace,
            fontSize = if (label.length > 11) (fontSize - 4).sp else fontSize.sp,
            fontWeight = FontWeight.Bold,
            color = TerminalAmber,
            maxLines = 1,
            modifier = Modifier.padding(vertical = 4.dp),
        )
    }
}

/**
 * Glanceable mission-event contract for Wear: source-planned milestones only,
 * no continuous trajectory and no telemetry claim.
 */
@Composable
fun MissionMilestoneText(launch: Launch) {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    val flightLike = launch.statusAbbrev.contains("flight", ignoreCase = true) ||
        launch.statusName.contains("flight", ignoreCase = true)
    LaunchedEffect(launch.id, flightLike) {
        while (flightLike) {
            now = System.currentTimeMillis()
            delay(5_000)
        }
    }
    val status = "${launch.statusAbbrev} ${launch.statusName}".lowercase()
    val label = when {
        "partial" in status && "fail" in status -> "PARTIAL FAILURE · SOURCE REPORTED"
        "fail" in status -> "MISSION ANOMALY · SOURCE REPORTED"
        "payload" in status || "deployed" in status -> "PAYLOAD DEPLOYED · SOURCE"
        flightLike && launch.milestones.isNotEmpty() -> {
            val elapsed = ((now - launch.netMillis) / 1_000).toInt()
            val current = launch.milestones.lastOrNull { it.secondsFromT0 <= elapsed }
            val next = launch.milestones.firstOrNull { it.secondsFromT0 > elapsed }
            when {
                current != null && next != null -> "${current.label} · NEXT ${next.label}"
                current != null -> "${current.label} · RESULT PENDING"
                next != null -> "NEXT ${next.label}"
                else -> "SOURCE TIMELINE PENDING"
            }
        }
        else -> return
    }
    Text(
        text = label,
        fontFamily = FontFamily.Monospace,
        fontSize = 10.sp,
        color = if ("FAIL" in label || "ANOMALY" in label) TerminalRed else TerminalGreen,
        maxLines = 2,
        modifier = Modifier.roundSafeWidth(0.74f).padding(vertical = 2.dp),
    )
}

/**
 * Canlı yayın chip'i — dokununca yayını bağlı telefonda açar.
 * Yayın linki yoksa hiçbir şey çizmez.
 */
@Composable
fun WebcastChip(launch: Launch) {
    if (!launch.hasWebcast) return
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val live = launch.webcastLive
    Chip(
        onClick = { scope.launch { PhoneLauncher.openOnPhone(context, launch.webcastUrl) } },
        label = {
            Text(
                text = if (live) "🔴 LIVE — WATCH" else "▶ WEBCAST",
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
            )
        },
        colors = ChipDefaults.primaryChipColors(
            backgroundColor = if (live) TerminalRed else TerminalGreen,
            contentColor = Color.Black,
        ),
        modifier = Modifier
            .roundSafeWidth(0.80f)
            .padding(horizontal = 8.dp, vertical = 4.dp),
    )
}

/** Takvime ekle chip'i — dokununca Google Calendar olayını telefonda açar. */
@Composable
fun CalendarChip(launch: Launch) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    Chip(
        onClick = {
            scope.launch {
                PhoneLauncher.openOnPhone(context, com.spacecat.wear.util.CalendarLink.forLaunch(launch))
            }
        },
        label = {
            Text(
                text = "📅 ADD TO CALENDAR",
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
            )
        },
        colors = ChipDefaults.secondaryChipColors(),
        modifier = Modifier
            .roundSafeWidth(0.80f)
            .padding(horizontal = 8.dp, vertical = 2.dp),
    )
}

/**
 * Favori ajans yıldızı (Dalga 9) — dokununca bu görevin ajansını favorilere
 * ekler/çıkarır. Ajans kısaltması yoksa hiçbir şey çizmez.
 */
@Composable
fun FavoriteAgencyChip(launch: Launch) {
    val abbrev = launch.agencyAbbrev?.takeIf { it.isNotBlank() } ?: return
    val context = LocalContext.current
    val repo = remember { com.spacecat.wear.data.SettingsRepository.get(context) }
    val favorites by remember(repo) { repo.favorites() }.collectAsState(initial = emptySet())
    val scope = rememberCoroutineScope()
    val isFav = abbrev in favorites
    Chip(
        onClick = { scope.launch { repo.toggleFavorite(abbrev) } },
        label = {
            Text(
                text = if (isFav) "★ FAVORITE · $abbrev" else "☆ FOLLOW · $abbrev",
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
            )
        },
        colors = if (isFav) {
            ChipDefaults.primaryChipColors(
                backgroundColor = TerminalAmber,
                contentColor = Color.Black,
            )
        } else {
            ChipDefaults.secondaryChipColors()
        },
        modifier = Modifier
            .roundSafeWidth(0.80f)
            .padding(horizontal = 8.dp, vertical = 2.dp),
    )
}

/** Küçük "🔴 LIVE" rozeti — liste kartında yayın canlıyken. */
@Composable
fun LiveBadge() {
    Text(
        text = "🔴 LIVE",
        fontFamily = FontFamily.Monospace,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = TerminalRed,
        modifier = Modifier.padding(top = 2.dp),
    )
}

@Composable
fun StatusChip(statusAbbrev: String) {
    Text(
        text = statusAbbrev.uppercase(),
        fontFamily = FontFamily.Monospace,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = Color.Black,
        modifier = Modifier
            .background(statusColor(statusAbbrev), RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 1.dp),
    )
}

fun statusColor(abbrev: String): Color = when (abbrev.lowercase()) {
    "go", "success", "deployed", "payload deployed" -> TerminalGreen
    "hold", "failure", "partial failure" -> TerminalRed
    else -> TerminalAmber // TBD / TBC / In Flight
}

private val netFormatter: DateTimeFormatter =
    DateTimeFormatter.ofPattern("d MMM HH:mm").withZone(ZoneId.systemDefault())

private val timeFormatter: DateTimeFormatter =
    DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.systemDefault())

fun formatNet(netMillis: Long): String =
    netFormatter.format(Instant.ofEpochMilli(netMillis))

fun formatTime(millis: Long): String =
    timeFormatter.format(Instant.ofEpochMilli(millis))
