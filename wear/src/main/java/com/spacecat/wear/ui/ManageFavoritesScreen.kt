package com.spacecat.wear.ui

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Switch
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.ToggleChip
import com.spacecat.wear.data.LaunchRepository
import com.spacecat.wear.data.SettingsRepository
import com.spacecat.wear.ui.theme.TerminalGreen
import com.spacecat.wear.ui.theme.TerminalGrey
import kotlinx.coroutines.launch

/**
 * Favori yönetim ekranı (Dalga 10b) — cache'li fırlatmalardaki ajanslar (+ hâlihazırda
 * favori olanlar) listelenir, yıldız toggle ile toplu işaretlenir. Detaydaki tekil
 * yıldıza alternatif toplu görünüm.
 */
@Composable
fun ManageFavoritesScreen() {
    val context = LocalContext.current
    val launchRepo = remember { LaunchRepository.get(context) }
    val settingsRepo = remember { SettingsRepository.get(context) }
    val launches by remember(launchRepo) { launchRepo.launches() }
        .collectAsState(initial = emptyList())
    val favorites by remember(settingsRepo) { settingsRepo.favorites() }
        .collectAsState(initial = emptySet())
    val scope = rememberCoroutineScope()

    // Ajans listesi: sıradaki fırlatmalardaki + mevcut favoriler (upcoming'de olmayan
    // favoriler de görünsün ki kaldırılabilsinler). Kısaltmaya göre alfabetik.
    val agencies = remember(launches, favorites) {
        val map = linkedMapOf<String, String>()
        launches.forEach { launch ->
            val abbrev = launch.agencyAbbrev?.takeIf { it.isNotBlank() } ?: return@forEach
            map.putIfAbsent(abbrev, launch.agency.ifEmpty { abbrev })
        }
        favorites.forEach { map.putIfAbsent(it, it) }
        map.entries.sortedBy { it.key }
    }

    val listState = rememberScalingLazyListState()
    Scaffold(
        timeText = { TimeText() },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) },
    ) {
        ScalingLazyColumn(state = listState, modifier = Modifier.wearViewport()) {
            item {
                Text(
                    text = "★ FAVORITES",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    letterSpacing = 2.sp,
                    color = TerminalGreen,
                )
            }
            if (agencies.isEmpty()) {
                item {
                    Text(
                        text = "> NO AGENCIES YET\nOpen a mission to follow one",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = TerminalGrey,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.roundSafeWidth(0.80f),
                    )
                }
            } else {
                items(agencies) { entry ->
                    val abbrev = entry.key
                    val name = entry.value
                    val checked = abbrev in favorites
                    ToggleChip(
                        checked = checked,
                        onCheckedChange = { scope.launch { settingsRepo.toggleFavorite(abbrev) } },
                        label = {
                            Text(
                                text = abbrev,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 13.sp,
                                maxLines = 1,
                            )
                        },
                        secondaryLabel = {
                            Text(
                                text = name,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 10.sp,
                                color = TerminalGrey,
                                maxLines = 1,
                            )
                        },
                        toggleControl = { Switch(checked = checked) },
                        modifier = Modifier.roundSafeWidth(0.80f),
                    )
                }
            }
        }
    }
}
