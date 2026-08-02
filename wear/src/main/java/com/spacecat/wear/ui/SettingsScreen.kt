package com.spacecat.wear.ui

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Switch
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.ToggleChip
import androidx.wear.compose.material.ToggleChipDefaults
import com.spacecat.wear.data.AlertSettings
import com.spacecat.wear.data.SettingsRepository
import com.spacecat.wear.notify.NotificationHelper
import com.spacecat.wear.ui.theme.TerminalGreen
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(onManageFavorites: () -> Unit = {}) {
    val context = LocalContext.current
    val repo = remember { SettingsRepository.get(context) }
    val settingsFlow = remember(repo) { repo.settings() }
    val settings by settingsFlow.collectAsState(initial = AlertSettings())
    val scope = rememberCoroutineScope()

    val listState = rememberScalingLazyListState()
    Scaffold(
        timeText = { TimeText() },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) },
    ) {
        ScalingLazyColumn(state = listState, modifier = Modifier.wearViewport()) {
            item {
                Text(
                    text = "ALERTS",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    letterSpacing = 2.sp,
                    color = TerminalGreen,
                )
            }
            item {
                AlertToggle("T-10 min", settings.t10) {
                    scope.launch { repo.setT10(it) }
                }
            }
            item {
                AlertToggle("T-1 hour", settings.t60) {
                    scope.launch { repo.setT60(it) }
                }
            }
            item {
                AlertToggle("GO / HOLD", settings.statusChange) {
                    scope.launch { repo.setStatusChange(it) }
                }
            }
            item {
                AlertToggle("Delays", settings.delays) {
                    scope.launch { repo.setDelays(it) }
                }
            }
            item {
                AlertToggle("Liftoff buzz", settings.liftoff) {
                    scope.launch { repo.setLiftoff(it) }
                }
            }
            item {
                AlertToggle("Launch result", settings.results) {
                    scope.launch { repo.setResults(it) }
                }
            }
            item {
                Text(
                    text = "FILTER",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    letterSpacing = 2.sp,
                    color = TerminalGreen,
                )
            }
            item {
                AlertToggle("Favorites only", settings.favoritesOnly) {
                    scope.launch { repo.setFavoritesOnly(it) }
                }
            }
            item {
                androidx.wear.compose.material.Chip(
                    onClick = onManageFavorites,
                    label = {
                        Text(
                            text = "★ Manage favorites",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 13.sp,
                        )
                    },
                    colors = androidx.wear.compose.material.ChipDefaults.secondaryChipColors(),
                    modifier = Modifier.roundSafeWidth(0.80f),
                )
            }
            item {
                Text(
                    text = "Limits list + alerts to favorites",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    color = com.spacecat.wear.ui.theme.TerminalGrey,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    modifier = Modifier.roundSafeWidth(0.80f),
                )
            }
            item {
                androidx.wear.compose.material.Chip(
                    onClick = {
                        com.spacecat.wear.notify.Haptics.liftoff(context)
                        NotificationHelper.notify(
                            context = context,
                            channel = NotificationHelper.CHANNEL_IMMINENT,
                            title = "🚀 LIFTOFF",
                            text = "Test — Starlink G12-34",
                            notificationId = 9999,
                        )
                    },
                    label = {
                        Text(
                            text = "Test alert",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 13.sp,
                        )
                    },
                    colors = androidx.wear.compose.material.ChipDefaults.secondaryChipColors(),
                    modifier = Modifier.roundSafeWidth(0.80f),
                )
            }
        }
    }
}

@Composable
private fun AlertToggle(label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    ToggleChip(
        checked = checked,
        onCheckedChange = onChange,
        label = {
            Text(text = label, fontFamily = FontFamily.Monospace, fontSize = 13.sp)
        },
        toggleControl = {
            Switch(checked = checked)
        },
        modifier = Modifier.roundSafeWidth(0.80f),
    )
}
