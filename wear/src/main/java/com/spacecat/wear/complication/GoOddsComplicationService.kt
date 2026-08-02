package com.spacecat.wear.complication

import android.app.PendingIntent
import android.content.Intent
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.NoDataComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.spacecat.wear.data.LaunchRepository
import com.spacecat.wear.data.model.Launch
import com.spacecat.wear.ui.MainActivity

/**
 * GO ODDS complication (Dalga 9) — bir sonraki fırlatmanın LL2 "GO ihtimali"ni
 * kadran yüzeyine yansıtır. İhtimal verisi yoksa (probability < 0) boş döner,
 * böylece kadran başka bir complication'a düşebilir.
 */
class GoOddsComplicationService : SuspendingComplicationDataSourceService() {

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        val launch = LaunchRepository.get(this).nextLaunch()
        if (launch == null || !launch.hasProbability) return NoDataComplicationData()
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
                PlainComplicationText.Builder("80%").build(),
                PlainComplicationText.Builder("Launch GO odds").build(),
            )
                .setTitle(PlainComplicationText.Builder("GO").build())
                .build()

        ComplicationType.LONG_TEXT ->
            LongTextComplicationData.Builder(
                PlainComplicationText.Builder("GO 80% · Starlink G12-34").build(),
                PlainComplicationText.Builder("Launch GO odds").build(),
            ).build()

        ComplicationType.RANGED_VALUE ->
            RangedValueComplicationData.Builder(
                value = 80f,
                min = 0f,
                max = 100f,
                contentDescription = PlainComplicationText.Builder("Launch GO odds").build(),
            )
                .setText(PlainComplicationText.Builder("80%").build())
                .setTitle(PlainComplicationText.Builder("GO").build())
                .build()

        else -> null
    }

    private fun shortText(launch: Launch): ComplicationData =
        ShortTextComplicationData.Builder(
            PlainComplicationText.Builder("${launch.probability}%").build(),
            PlainComplicationText.Builder("GO odds for ${launch.mission}").build(),
        )
            .setTitle(PlainComplicationText.Builder("GO").build())
            .setTapAction(openAppIntent())
            .build()

    private fun longText(launch: Launch): ComplicationData =
        LongTextComplicationData.Builder(
            PlainComplicationText.Builder("GO ${launch.probability}% · ${launch.mission}").build(),
            PlainComplicationText.Builder("GO odds for ${launch.mission}").build(),
        )
            .setTitle(PlainComplicationText.Builder("GO ODDS").build())
            .setTapAction(openAppIntent())
            .build()

    private fun rangedValue(launch: Launch): ComplicationData =
        RangedValueComplicationData.Builder(
            value = launch.probability.toFloat(),
            min = 0f,
            max = 100f,
            contentDescription = PlainComplicationText.Builder("GO odds for ${launch.mission}").build(),
        )
            .setText(PlainComplicationText.Builder("${launch.probability}%").build())
            .setTitle(PlainComplicationText.Builder("GO").build())
            .setTapAction(openAppIntent())
            .build()

    private fun openAppIntent(): PendingIntent {
        val intent = Intent(this, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return PendingIntent.getActivity(
            this,
            1,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }
}
