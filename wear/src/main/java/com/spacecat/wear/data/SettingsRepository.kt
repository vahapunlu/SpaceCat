package com.spacecat.wear.data

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.spacecat.wear.notify.AlarmScheduler
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.settingsStore by preferencesDataStore(name = "settings")

data class AlertSettings(
    val t10: Boolean = true,        // T-10 dk uyarısı
    val t60: Boolean = false,       // T-1 saat uyarısı
    val statusChange: Boolean = true, // GO / HOLD geçişleri
    val delays: Boolean = true,     // NET kaymaları
    val liftoff: Boolean = true,    // T-0 kalkış titreşimi + LIFTOFF
    val results: Boolean = true,    // Fırlatma sonucu: Success / Failure
    val favoritesOnly: Boolean = false, // Listeyi yalnız favori ajanslara süz (Dalga 9)
)

class SettingsRepository private constructor(private val appContext: Context) {

    fun settings(): Flow<AlertSettings> = appContext.settingsStore.data.map { prefs ->
        AlertSettings(
            t10 = prefs[KEY_T10] ?: true,
            t60 = prefs[KEY_T60] ?: false,
            statusChange = prefs[KEY_STATUS] ?: true,
            delays = prefs[KEY_DELAYS] ?: true,
            liftoff = prefs[KEY_LIFTOFF] ?: true,
            results = prefs[KEY_RESULTS] ?: true,
            favoritesOnly = prefs[KEY_FAV_ONLY] ?: false,
        )
    }

    suspend fun current(): AlertSettings = settings().first()

    suspend fun setT10(value: Boolean) {
        appContext.settingsStore.edit { it[KEY_T10] = value }
        rescheduleCountdownAlarms()
    }
    suspend fun setT60(value: Boolean) {
        appContext.settingsStore.edit { it[KEY_T60] = value }
        rescheduleCountdownAlarms()
    }
    suspend fun setStatusChange(value: Boolean) =
        appContext.settingsStore.edit { it[KEY_STATUS] = value }
    suspend fun setDelays(value: Boolean) = appContext.settingsStore.edit { it[KEY_DELAYS] = value }
    suspend fun setLiftoff(value: Boolean) {
        appContext.settingsStore.edit { it[KEY_LIFTOFF] = value }
        rescheduleCountdownAlarms()
    }
    suspend fun setResults(value: Boolean) = appContext.settingsStore.edit { it[KEY_RESULTS] = value }
    suspend fun setFavoritesOnly(value: Boolean) {
        appContext.settingsStore.edit { it[KEY_FAV_ONLY] = value }
        rescheduleCountdownAlarms()
    }

    // Favori ajanslar (Dalga 9) — ajans kısaltmalarının kümesi. Boşsa "hepsi".
    fun favorites(): Flow<Set<String>> =
        appContext.settingsStore.data.map { it[KEY_FAVORITES] ?: emptySet() }

    suspend fun currentFavorites(): Set<String> = favorites().first()

    /** Ajans favori↔favori-değil arası geçiş yapar; boş kısaltmayı yok sayar. */
    suspend fun toggleFavorite(agencyAbbrev: String) {
        if (agencyAbbrev.isBlank()) return
        appContext.settingsStore.edit { prefs ->
            val current = prefs[KEY_FAVORITES] ?: emptySet()
            prefs[KEY_FAVORITES] =
                if (agencyAbbrev in current) current - agencyAbbrev else current + agencyAbbrev
        }
        rescheduleCountdownAlarms()
    }

    /** Tercih değiştiği anda eski T-60/T-10/T-0 alarmlarını iptal eder veya yeniler. */
    private suspend fun rescheduleCountdownAlarms() {
        val settings = current()
        val favorites = currentFavorites()
        val filterActive = settings.favoritesOnly && favorites.isNotEmpty()
        val now = System.currentTimeMillis()
        val next = LaunchRepository.get(appContext).launches().first()
            .asSequence()
            .filter { it.netMillis > now }
            .filter {
                !filterActive || (it.agencyAbbrev != null && it.agencyAbbrev in favorites)
            }
            .minByOrNull { it.netMillis }
        AlarmScheduler.reschedule(appContext, next, settings)
    }

    companion object {
        private val KEY_T10 = booleanPreferencesKey("alert_t10")
        private val KEY_T60 = booleanPreferencesKey("alert_t60")
        private val KEY_STATUS = booleanPreferencesKey("alert_status")
        private val KEY_DELAYS = booleanPreferencesKey("alert_delays")
        private val KEY_LIFTOFF = booleanPreferencesKey("alert_liftoff")
        private val KEY_RESULTS = booleanPreferencesKey("alert_results")
        private val KEY_FAV_ONLY = booleanPreferencesKey("favorites_only")
        private val KEY_FAVORITES = stringSetPreferencesKey("favorite_agencies")

        @Volatile
        private var instance: SettingsRepository? = null

        fun get(context: Context): SettingsRepository =
            instance ?: synchronized(this) {
                instance ?: SettingsRepository(context.applicationContext).also { instance = it }
            }
    }
}
