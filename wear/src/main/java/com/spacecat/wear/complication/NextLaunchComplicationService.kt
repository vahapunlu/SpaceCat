package com.spacecat.wear.complication

import android.app.PendingIntent
import android.content.Intent
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.CountDownTimeReference
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.NoDataComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.data.TimeDifferenceComplicationText
import androidx.wear.watchface.complications.data.TimeDifferenceStyle
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.spacecat.wear.data.LaunchRepository
import com.spacecat.wear.data.model.Launch
import com.spacecat.wear.ui.MainActivity
import java.time.Instant

class NextLaunchComplicationService : SuspendingComplicationDataSourceService() {

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        val launch = LaunchRepository.get(this).nextLaunch()
            ?: return NoDataComplicationData()
        return when (request.complicationType) {
            ComplicationType.SHORT_TEXT -> shortText(launch)
            ComplicationType.LONG_TEXT -> longText(launch)
            ComplicationType.RANGED_VALUE -> rangedValue(launch)
            else -> null
        }
    }

    override fun getPreviewData(type: ComplicationType): ComplicationData? = when (type) {
        ComplicationType.SHORT_TEXT ->
            ShortTextComplicationData.Builder(
                PlainComplicationText.Builder("T-42m").build(),
                PlainComplicationText.Builder("Launch countdown").build(),
            )
                .setTitle(PlainComplicationText.Builder("SpX").build())
                .build()

        ComplicationType.LONG_TEXT ->
            LongTextComplicationData.Builder(
                PlainComplicationText.Builder("Starlink G12-34 · T-42m").build(),
                PlainComplicationText.Builder("Launch countdown").build(),
            ).build()

        ComplicationType.RANGED_VALUE ->
            RangedValueComplicationData.Builder(
                value = 23.3f,
                min = 0f,
                max = 24f,
                contentDescription = PlainComplicationText.Builder("Launch countdown").build(),
            )
                .setText(PlainComplicationText.Builder("T-42m").build())
                .setTitle(PlainComplicationText.Builder("SpX").build())
                .build()

        else -> null
    }

    private fun shortText(launch: Launch): ComplicationData =
        ShortTextComplicationData.Builder(
            countdownText(launch),
            PlainComplicationText.Builder("Time to ${launch.mission}").build(),
        )
            .setTitle(
                PlainComplicationText.Builder(launch.agencyAbbrev ?: "NEXT").build()
            )
            .setTapAction(openAppIntent())
            .build()

    private fun longText(launch: Launch): ComplicationData =
        LongTextComplicationData.Builder(
            countdownText(launch),
            PlainComplicationText.Builder("Time to ${launch.mission}").build(),
        )
            .setTitle(PlainComplicationText.Builder(launch.mission).build())
            .setTapAction(openAppIntent())
            .build()

    /**
     * Saat yüzünde dolan yay: T-24 saatte boş, fırlatma anında dolu.
     * Yay değeri statik (sistem periyodik günceller) ama metin canlı sayaçtır.
     */
    private fun rangedValue(launch: Launch): ComplicationData {
        val remaining = launch.netMillis - System.currentTimeMillis()
        val hoursLeft = (remaining / 3_600_000f).coerceIn(0f, 24f)
        return RangedValueComplicationData.Builder(
            value = 24f - hoursLeft,
            min = 0f,
            max = 24f,
            contentDescription = PlainComplicationText.Builder("Time to ${launch.mission}").build(),
        )
            .setText(countdownText(launch))
            .setTitle(
                PlainComplicationText.Builder(launch.agencyAbbrev ?: "NEXT").build()
            )
            .setTapAction(openAppIntent())
            .build()
    }

    private fun countdownText(launch: Launch): TimeDifferenceComplicationText =
        TimeDifferenceComplicationText.Builder(
            TimeDifferenceStyle.SHORT_DUAL_UNIT,
            CountDownTimeReference(Instant.ofEpochMilli(launch.netMillis)),
        ).build()

    private fun openAppIntent(): PendingIntent {
        val intent = Intent(this, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }
}
