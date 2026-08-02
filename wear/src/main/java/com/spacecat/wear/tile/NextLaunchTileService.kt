package com.spacecat.wear.tile

import androidx.concurrent.futures.CallbackToFutureAdapter
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.degrees
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.DimensionBuilders.sp
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.protolayout.TypeBuilders
import androidx.wear.protolayout.expression.DynamicBuilders.DynamicInstant
import androidx.wear.protolayout.expression.DynamicBuilders.DynamicInt32
import androidx.wear.protolayout.expression.DynamicBuilders.DynamicString
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.google.common.util.concurrent.ListenableFuture
import com.spacecat.wear.data.LaunchRepository
import com.spacecat.wear.data.model.Launch
import com.spacecat.wear.util.formatCountdownShort
import java.time.Instant
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

private const val RESOURCES_VERSION = "1"

private const val COLOR_GREEN = 0xFF00E68A.toInt()
private const val COLOR_GREEN_DIM = 0xFF14331F.toInt()
private const val COLOR_AMBER = 0xFFFFB86C.toInt()
private const val COLOR_RED = 0xFFFF5C57.toInt()
private const val COLOR_WHITE = 0xFFFFFFFF.toInt()
private const val COLOR_GREY = 0xFF9AA5B1.toInt()
private const val COLOR_BLACK = 0xFF000000.toInt()

private const val DAY_MILLIS = 24 * 60 * 60 * 1000L

class NextLaunchTileService : TileService() {

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(serviceJob + Dispatchers.IO)

    override fun onTileRequest(
        requestParams: RequestBuilders.TileRequest,
    ): ListenableFuture<TileBuilders.Tile> =
        CallbackToFutureAdapter.getFuture { completer ->
            serviceScope.launch {
                try {
                    val launch = LaunchRepository.get(this@NextLaunchTileService).nextLaunch()
                    completer.set(buildTile(launch))
                } catch (e: Exception) {
                    completer.setException(e)
                }
            }
            "NextLaunchTileRequest"
        }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest,
    ): ListenableFuture<ResourceBuilders.Resources> =
        CallbackToFutureAdapter.getFuture { completer ->
            completer.set(
                ResourceBuilders.Resources.Builder()
                    .setVersion(RESOURCES_VERSION)
                    .build()
            )
            "NextLaunchTileResources"
        }

    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
    }

    private fun buildTile(launch: Launch?): TileBuilders.Tile =
        TileBuilders.Tile.Builder()
            .setResourcesVersion(RESOURCES_VERSION)
            .setFreshnessIntervalMillis(60_000)
            .setTileTimeline(
                TimelineBuilders.Timeline.Builder()
                    .addTimelineEntry(
                        TimelineBuilders.TimelineEntry.Builder()
                            .setLayout(
                                LayoutElementBuilders.Layout.Builder()
                                    .setRoot(tileLayout(launch))
                                    .build()
                            )
                            .build()
                    )
                    .build()
            )
            .build()

    private fun tileLayout(launch: Launch?): LayoutElementBuilders.LayoutElement {
        val openApp = ModifiersBuilders.Clickable.Builder()
            .setId("open_app")
            .setOnClick(
                ActionBuilders.LaunchAction.Builder()
                    .setAndroidActivity(
                        ActionBuilders.AndroidActivity.Builder()
                            .setPackageName(packageName)
                            .setClassName("com.spacecat.wear.ui.MainActivity")
                            .build()
                    )
                    .build()
            )
            .build()

        val box = LayoutElementBuilders.Box.Builder()
            .setWidth(expand())
            .setHeight(expand())
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setClickable(openApp)
                    .build()
            )

        if (launch == null) {
            return box
                .addContent(fullRing(COLOR_GREEN_DIM))
                .addContent(
                    column()
                        .addContent(text("SPACE CAT", 13f, COLOR_GREEN, letterSpacing = 0.15f))
                        .addContent(spacer(6f))
                        .addContent(text("AWAITING TELEMETRY", 11f, COLOR_GREY))
                        .build()
                )
                .build()
        }

        val remaining = launch.netMillis - System.currentTimeMillis()
        val liftedOff = remaining <= 0

        // Halka: T-24s'ten itibaren dolmaya başlar; fırlatma anında tamamlanır.
        val progress = when {
            liftedOff -> 1f
            remaining >= DAY_MILLIS -> 0f
            else -> 1f - remaining.toFloat() / DAY_MILLIS
        }

        val column = column()
            .addContent(text("NEXT LAUNCH", 11f, COLOR_GREEN, letterSpacing = 0.2f))
            .addContent(spacer(4f))
            .addContent(text(launch.mission, 14f, COLOR_WHITE, maxLines = 2))
            .addContent(spacer(6f))
            .addContent(countdownElement(launch.netMillis, remaining))
            .addContent(spacer(8f))
            .addContent(statusRow(launch))

        // GO ODDS (Dalga 9): LL2 fırlatma ihtimali varsa kadran yüzeyine yansıt.
        if (launch.hasProbability) {
            column
                .addContent(spacer(4f))
                .addContent(
                    text(
                        "GO ODDS ${launch.probability}%",
                        11f,
                        goOddsColor(launch.probability),
                        bold = true,
                        letterSpacing = 0.1f,
                    )
                )
        }

        return box
            .addContent(fullRing(COLOR_GREEN_DIM))
            .addContent(progressRing(progress, if (liftedOff) COLOR_AMBER else COLOR_GREEN))
            .addContent(column.build())
            .build()
    }

    /** T-24 saatten yakınsa canlı (saniye saniye işleyen) sayaç, uzaksa statik kısa format. */
    private fun countdownElement(netMillis: Long, remaining: Long): LayoutElementBuilders.Text {
        val style = LayoutElementBuilders.FontStyle.Builder()
            .setSize(sp(24f))
            .setColor(argb(COLOR_AMBER))
            .setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
            .build()

        if (remaining <= 0) {
            return LayoutElementBuilders.Text.Builder()
                .setText("LIFTOFF")
                .setFontStyle(style)
                .build()
        }
        if (remaining >= DAY_MILLIS) {
            return LayoutElementBuilders.Text.Builder()
                .setText(formatCountdownShort(remaining))
                .setFontStyle(style)
                .build()
        }

        val target = DynamicInstant.withSecondsPrecision(Instant.ofEpochMilli(netMillis))
        val untilLaunch = DynamicInstant.platformTimeWithSecondsPrecision().durationUntil(target)
        val twoDigits = DynamicInt32.IntFormatter.Builder()
            .setMinIntegerDigits(2)
            .build()
        val live = DynamicString.constant("T-")
            .concat(untilLaunch.hoursPart.format(twoDigits))
            .concat(DynamicString.constant(":"))
            .concat(untilLaunch.minutesPart.format(twoDigits))
            .concat(DynamicString.constant(":"))
            .concat(untilLaunch.secondsPart.format(twoDigits))

        return LayoutElementBuilders.Text.Builder()
            .setText(
                TypeBuilders.StringProp.Builder("T---:--:--")
                    .setDynamicValue(live)
                    .build()
            )
            .setLayoutConstraintsForDynamicText(
                TypeBuilders.StringLayoutConstraint.Builder("T-88:88:88")
                    .setAlignment(LayoutElementBuilders.TEXT_ALIGN_CENTER)
                    .build()
            )
            .setFontStyle(style)
            .build()
    }

    private fun statusRow(launch: Launch): LayoutElementBuilders.Row {
        val chipColor = when (launch.statusAbbrev.lowercase()) {
            "go" -> COLOR_GREEN
            "hold" -> COLOR_RED
            else -> COLOR_AMBER
        }
        val chip = LayoutElementBuilders.Box.Builder()
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setBackground(
                        ModifiersBuilders.Background.Builder()
                            .setColor(argb(chipColor))
                            .setCorner(
                                ModifiersBuilders.Corner.Builder()
                                    .setRadius(dp(8f))
                                    .build()
                            )
                            .build()
                    )
                    .setPadding(
                        ModifiersBuilders.Padding.Builder()
                            .setStart(dp(8f))
                            .setEnd(dp(8f))
                            .setTop(dp(2f))
                            .setBottom(dp(2f))
                            .build()
                    )
                    .build()
            )
            .addContent(
                LayoutElementBuilders.Text.Builder()
                    .setText(launch.statusAbbrev.uppercase())
                    .setFontStyle(
                        LayoutElementBuilders.FontStyle.Builder()
                            .setSize(sp(11f))
                            .setColor(argb(COLOR_BLACK))
                            .setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
                            .build()
                    )
                    .build()
            )
            .build()

        return LayoutElementBuilders.Row.Builder()
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .addContent(chip)
            .addContent(
                LayoutElementBuilders.Spacer.Builder().setWidth(dp(6f)).build()
            )
            .addContent(
                text(launch.agencyAbbrev ?: launch.agency, 11f, COLOR_GREY)
            )
            .build()
    }

    /** GO ihtimali rengi: yüksek=yeşil, orta=amber, düşük=kırmızı. */
    private fun goOddsColor(pct: Int): Int = when {
        pct >= 70 -> COLOR_GREEN
        pct >= 40 -> COLOR_AMBER
        else -> COLOR_RED
    }

    private fun fullRing(color: Int): LayoutElementBuilders.Arc =
        ring(360f, color)

    private fun progressRing(progress: Float, color: Int): LayoutElementBuilders.Arc =
        ring(360f * progress.coerceIn(0f, 1f), color)

    private fun ring(sweepDegrees: Float, color: Int): LayoutElementBuilders.Arc =
        LayoutElementBuilders.Arc.Builder()
            .setAnchorAngle(degrees(0f))
            .setAnchorType(LayoutElementBuilders.ARC_ANCHOR_START)
            .addContent(
                LayoutElementBuilders.ArcLine.Builder()
                    .setLength(degrees(sweepDegrees))
                    .setThickness(dp(3f))
                    .setColor(argb(color))
                    .build()
            )
            .build()

    private fun column(): LayoutElementBuilders.Column.Builder =
        LayoutElementBuilders.Column.Builder()
            .setWidth(expand())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setPadding(
                        ModifiersBuilders.Padding.Builder()
                            .setStart(dp(24f))
                            .setEnd(dp(24f))
                            .build()
                    )
                    .build()
            )

    private fun text(
        value: String,
        sizeSp: Float,
        color: Int,
        bold: Boolean = false,
        maxLines: Int = 1,
        letterSpacing: Float = 0f,
    ): LayoutElementBuilders.Text =
        LayoutElementBuilders.Text.Builder()
            .setText(value)
            .setMaxLines(maxLines)
            .setFontStyle(
                LayoutElementBuilders.FontStyle.Builder()
                    .setSize(sp(sizeSp))
                    .setColor(argb(color))
                    .apply {
                        if (bold) setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
                        if (letterSpacing > 0f) {
                            setLetterSpacing(
                                androidx.wear.protolayout.DimensionBuilders.em(letterSpacing)
                            )
                        }
                    }
                    .build()
            )
            .build()

    private fun spacer(heightDp: Float): LayoutElementBuilders.Spacer =
        LayoutElementBuilders.Spacer.Builder()
            .setHeight(dp(heightDp))
            .build()
}
