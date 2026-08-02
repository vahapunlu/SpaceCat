package com.spacecat.wear

import android.app.Application
import com.spacecat.wear.sync.LaunchSyncWorker

class SpaceCatApp : Application() {
    override fun onCreate() {
        super.onCreate()
        LaunchSyncWorker.schedule(this)
    }
}
