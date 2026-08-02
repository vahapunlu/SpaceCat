package com.spacecat.wear.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.spacecat.wear.BuildConfig
import com.spacecat.wear.data.model.SpaceEvent
import com.spacecat.wear.data.remote.EventApi
import java.time.Instant
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

private val Context.eventStore by preferencesDataStore(name = "event_cache")

/** Uzay olayları (LL2 /event/). Ayrı DataStore cache; senkrona bindirilir. */
class EventRepository private constructor(private val appContext: Context) {

    private val json = Json { ignoreUnknownKeys = true }

    private val api: EventApi = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(
            OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()
        )
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(EventApi::class.java)

    fun events(): Flow<List<SpaceEvent>> = appContext.eventStore.data.map { prefs ->
        prefs[KEY_EVENTS]
            ?.let { cached ->
                runCatching { json.decodeFromString<List<SpaceEvent>>(cached) }
                    .onFailure { e -> android.util.Log.e("SpaceCat", "event decode failed", e) }
                    .getOrNull()
            }
            ?: emptyList()
    }

    suspend fun refresh() {
        val fetched = api.upcomingEvents().results.map { dto ->
            SpaceEvent(
                id = dto.id,
                name = dto.name,
                type = dto.type?.name ?: "",
                dateMillis = dto.date
                    ?.let { runCatching { Instant.parse(it).toEpochMilli() }.getOrNull() } ?: 0,
                location = dto.location ?: "",
                description = dto.description ?: "",
            )
        }
        appContext.eventStore.edit { prefs ->
            prefs[KEY_EVENTS] = json.encodeToString(fetched)
        }
    }

    companion object {
        private val BASE_URL =
            if (BuildConfig.DEBUG) "https://lldev.thespacedevs.com/2.3.0/"
            else "https://ll.thespacedevs.com/2.3.0/"

        private val KEY_EVENTS = stringPreferencesKey("events_json")

        @Volatile
        private var instance: EventRepository? = null

        fun get(context: Context): EventRepository =
            instance ?: synchronized(this) {
                instance ?: EventRepository(context.applicationContext).also { instance = it }
            }
    }
}
