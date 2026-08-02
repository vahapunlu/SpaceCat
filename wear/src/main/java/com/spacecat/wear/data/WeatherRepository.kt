package com.spacecat.wear.data

import com.spacecat.wear.data.model.PadWeather
import com.spacecat.wear.data.remote.OpenMeteoApi
import java.util.concurrent.TimeUnit
import kotlin.math.roundToInt
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

/**
 * Pad hava durumu — Open-Meteo (ücretsiz, anahtarsız). Bellekte 30 dk cache
 * (aynı pad'i tekrar tekrar sorgulamamak için); periyodik senkrona bindirilmez,
 * yalnız detay ekranı açıldığında talep üzerine çekilir.
 */
class WeatherRepository private constructor() {

    private val json = Json { ignoreUnknownKeys = true }

    private val api: OpenMeteoApi = Retrofit.Builder()
        .baseUrl("https://api.open-meteo.com/")
        .client(
            OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(20, TimeUnit.SECONDS)
                .build()
        )
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(OpenMeteoApi::class.java)

    private data class Cached(val at: Long, val weather: PadWeather)

    private val cache = HashMap<String, Cached>()

    /** Pad için havayı döndürür; hata/koordinatsızlıkta null. */
    suspend fun forPad(lat: Double, lng: Double): PadWeather? {
        if (lat == 0.0 && lng == 0.0) return null
        val key = "%.2f,%.2f".format(lat, lng)
        val now = System.currentTimeMillis()
        cache[key]?.let { if (now - it.at < TTL_MILLIS) return it.weather }

        val cur = runCatching { api.current(lat, lng).current }.getOrNull() ?: return null
        val weather = PadWeather(
            tempC = (cur.temp ?: return null).roundToInt(),
            windKmh = (cur.wind ?: 0.0).roundToInt(),
            gustsKmh = (cur.gusts ?: 0.0).roundToInt(),
            cloudPct = cur.cloud ?: 0,
            precipMm = cur.precipitation ?: 0.0,
            code = cur.code ?: -1,
        )
        cache[key] = Cached(now, weather)
        return weather
    }

    companion object {
        private val TTL_MILLIS = TimeUnit.MINUTES.toMillis(30)

        @Volatile
        private var instance: WeatherRepository? = null

        fun get(): WeatherRepository =
            instance ?: synchronized(this) {
                instance ?: WeatherRepository().also { instance = it }
            }
    }
}
