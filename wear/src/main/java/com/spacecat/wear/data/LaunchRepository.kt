package com.spacecat.wear.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.spacecat.wear.BuildConfig
import com.spacecat.wear.data.model.Launch
import com.spacecat.wear.data.model.LaunchMilestone
import com.spacecat.wear.data.model.LaunchMilestoneCode
import com.spacecat.wear.data.remote.Ll2Api
import com.spacecat.wear.notify.LaunchNotifier
import com.spacecat.wear.util.PhoneLauncher
import java.time.Instant
import java.time.Duration
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

private val Context.launchStore by preferencesDataStore(name = "launch_cache")

class LaunchRepository private constructor(private val appContext: Context) {

    private val json = Json { ignoreUnknownKeys = true }

    private val api: Ll2Api = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(
            OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()
        )
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(Ll2Api::class.java)

    fun launches(): Flow<List<Launch>> = appContext.launchStore.data.map { prefs ->
        prefs[KEY_LAUNCHES]
            ?.let {
                runCatching { json.decodeFromString<List<Launch>>(it) }
                    .onFailure { e -> android.util.Log.e("SpaceCat", "cache decode failed", e) }
                    .getOrNull()
            }
            ?: emptyList()
    }

    // Fırlatma anından sonraki 1 saat boyunca da "sıradaki" sayılır (LIFTOFF ekranı için).
    suspend fun nextLaunch(): Launch? {
        val cutoff = System.currentTimeMillis() - RECENT_GRACE_MILLIS
        return launches().first().firstOrNull { it.netMillis > cutoff }
    }

    suspend fun refresh() {
        val old = launches().first()
        val fetched = api.upcomingLaunches().results.mapNotNull { dto ->
            val net = dto.net ?: return@mapNotNull null
            val netMillis = runCatching { Instant.parse(net).toEpochMilli() }.getOrNull()
                ?: return@mapNotNull null
            fun parseMillis(iso: String?): Long =
                iso?.let { runCatching { Instant.parse(it).toEpochMilli() }.getOrNull() } ?: 0
            // En yüksek öncelikli (en küçük priority) geçerli URL'li yayını seç.
            val webcast = dto.vidURLs
                ?.filter { PhoneLauncher.isAllowedWebcastUrl(it.url.orEmpty()) }
                ?.minByOrNull { it.priority ?: Int.MAX_VALUE }
            val milestones = dto.timeline.orEmpty().mapNotNull { event ->
                val seconds = runCatching {
                    Duration.parse(event.relativeTime ?: return@mapNotNull null).seconds.toInt()
                }.getOrNull() ?: return@mapNotNull null
                if (seconds !in -86_400..604_800) return@mapNotNull null
                val raw = event.type?.abbrev ?: event.type?.name ?: event.description.orEmpty()
                val lower = raw.lowercase()
                val code = when {
                    "payload" in lower || "deploy" in lower -> LaunchMilestoneCode.PAYLOAD_DEPLOYMENT
                    "landing" in lower && "burn" in lower -> LaunchMilestoneCode.LANDING_BURN
                    "landing" in lower || "touchdown" in lower -> LaunchMilestoneCode.LANDING
                    "entry" in lower && "burn" in lower -> LaunchMilestoneCode.ENTRY_BURN
                    "boostback" in lower -> LaunchMilestoneCode.BOOSTBACK_BURN
                    "fairing" in lower -> LaunchMilestoneCode.FAIRING_SEPARATION
                    "stage separation" in lower || "stage sep" in lower -> LaunchMilestoneCode.STAGE_SEPARATION
                    "meco" in lower || "main engine cutoff" in lower -> LaunchMilestoneCode.MECO
                    "seco" in lower || "second stage engine cutoff" in lower -> LaunchMilestoneCode.UPPER_STAGE_CUTOFF
                    "ses" in lower || "second stage engine start" in lower -> LaunchMilestoneCode.UPPER_STAGE_START
                    "max-q" in lower || "max q" in lower -> LaunchMilestoneCode.MAX_Q
                    "liftoff" in lower || "lift-off" in lower -> LaunchMilestoneCode.LIFTOFF
                    "ignition" in lower -> LaunchMilestoneCode.IGNITION
                    "orbit" in lower || "insertion" in lower -> LaunchMilestoneCode.ORBIT_INSERTION
                    else -> null
                } ?: return@mapNotNull null
                LaunchMilestone(seconds, code, raw.replace(Regex("\\s+"), " ").take(48).uppercase())
            }.distinctBy { it.secondsFromT0 to it.code }.sortedBy { it.secondsFromT0 }
            Launch(
                id = dto.id,
                name = dto.name,
                netMillis = netMillis,
                statusAbbrev = dto.status?.abbrev ?: "TBD",
                statusName = dto.status?.name ?: "",
                agency = dto.provider?.name ?: "",
                agencyAbbrev = dto.provider?.abbrev,
                pad = dto.pad?.name ?: "",
                location = dto.pad?.location?.name ?: "",
                missionDescription = dto.mission?.description ?: "",
                orbit = dto.mission?.orbit?.abbrev ?: dto.mission?.orbit?.name ?: "",
                rocketFullName = dto.rocket?.configuration?.fullName ?: "",
                windowStartMillis = parseMillis(dto.windowStart),
                windowEndMillis = parseMillis(dto.windowEnd),
                webcastLive = dto.webcastLive ?: false,
                webcastUrl = webcast?.url ?: "",
                webcastTitle = webcast?.title ?: "",
                probability = dto.probability ?: -1,
                weatherConcerns = dto.weatherConcerns ?: "",
                padLat = dto.pad?.latitude ?: 0.0,
                padLng = dto.pad?.longitude ?: 0.0,
                agencyLaunchCount = dto.agencyLaunchCount ?: 0,
                padLaunchCount = dto.padLaunchCount ?: 0,
                providerSuccess = dto.provider?.successfulLaunches ?: 0,
                providerTotal = dto.provider?.totalLaunchCount ?: 0,
                imageUrl = dto.image?.thumbnailUrl ?: dto.image?.imageUrl ?: "",
                // Logolar geniş wordmark — thumbnail kare kırpım verdiğinden tam image_url'i tercih et.
                agencyLogoUrl = dto.provider?.logo?.imageUrl ?: dto.provider?.logo?.thumbnailUrl ?: "",
                agencyType = dto.provider?.type?.name ?: "",
                milestones = milestones,
                failureReason = dto.failreason.orEmpty().take(280),
            )
        }.sortedBy { it.netMillis }

        appContext.launchStore.edit { prefs ->
            prefs[KEY_LAUNCHES] = json.encodeToString(fetched)
            prefs[KEY_LAST_SYNC] = System.currentTimeMillis()
        }

        // Fark tespiti + alarm tazeleme (bildirim sistemi)
        runCatching { LaunchNotifier.onDataRefreshed(appContext, old, fetched) }
    }

    companion object {
        // Geliştirmede lldev (bol istek hakkı, veri biraz bayat olabilir);
        // üretimde ll.thespacedevs.com (saatte ~15 istek limiti).
        private val BASE_URL =
            if (BuildConfig.DEBUG) "https://lldev.thespacedevs.com/2.3.0/"
            else "https://ll.thespacedevs.com/2.3.0/"

        private const val RECENT_GRACE_MILLIS = 60 * 60 * 1000L

        private val KEY_LAUNCHES = stringPreferencesKey("launches_json")
        private val KEY_LAST_SYNC = longPreferencesKey("last_sync_millis")

        @Volatile
        private var instance: LaunchRepository? = null

        fun get(context: Context): LaunchRepository =
            instance ?: synchronized(this) {
                instance ?: LaunchRepository(context.applicationContext).also { instance = it }
            }
    }
}
