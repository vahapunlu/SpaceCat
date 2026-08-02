package com.spacecat.wear.sync

import android.content.ComponentName
import android.content.Context
import androidx.wear.tiles.TileService
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceUpdateRequester
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.spacecat.wear.complication.NextLaunchComplicationService
import com.spacecat.wear.data.EventRepository
import com.spacecat.wear.data.LaunchRepository
import com.spacecat.wear.data.NewsRepository
import com.spacecat.wear.tile.NextLaunchTileService
import java.util.concurrent.TimeUnit

class LaunchSyncWorker(context: Context, params: WorkerParameters) :
    CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            LaunchRepository.get(applicationContext).refresh()
            // Haber + olay akışı ikincil: başarısızlığı fırlatma senkronunu düşürmesin
            runCatching { NewsRepository.get(applicationContext).refresh() }
            runCatching { EventRepository.get(applicationContext).refresh() }

            TileService.getUpdater(applicationContext)
                .requestUpdate(NextLaunchTileService::class.java)
            ComplicationDataSourceUpdateRequester
                .create(
                    applicationContext,
                    ComponentName(applicationContext, NextLaunchComplicationService::class.java),
                )
                .requestUpdateAll()

            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        private const val UNIQUE_NAME = "launch-sync"

        fun schedule(context: Context) {
            val request = PeriodicWorkRequestBuilder<LaunchSyncWorker>(30, TimeUnit.MINUTES)
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                UNIQUE_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request,
            )
        }
    }
}
