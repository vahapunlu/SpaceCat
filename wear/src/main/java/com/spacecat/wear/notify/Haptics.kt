package com.spacecat.wear.notify

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

/** Kalkış anı için belirgin, yükselen bir titreşim deseni. */
object Haptics {

    @Suppress("DEPRECATION")
    private fun vibrator(context: Context): Vibrator =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager)
                .defaultVibrator
        } else {
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

    /** "Liftoff buzz": kısa-kısa-uzun, hızlanan bir kalkış hissi. */
    fun liftoff(context: Context) {
        val vib = vibrator(context)
        if (!vib.hasVibrator()) return
        // timings: bekle, titre, bekle, titre, ... son uzun darbe
        val timings = longArrayOf(0, 120, 80, 120, 80, 400)
        val amplitudes = intArrayOf(0, 160, 0, 200, 0, 255)
        vib.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
    }
}
