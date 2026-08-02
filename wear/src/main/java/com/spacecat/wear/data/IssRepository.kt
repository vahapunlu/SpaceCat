package com.spacecat.wear.data

import com.spacecat.wear.data.model.IssState
import com.spacecat.wear.data.remote.IssApi
import java.util.concurrent.TimeUnit
import kotlin.math.roundToInt
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

/** ISS canlı konumu — cache yok (veri saniyede değişir), her çağrıda taze çekilir. */
class IssRepository private constructor() {

    private val json = Json { ignoreUnknownKeys = true }

    private val api: IssApi = Retrofit.Builder()
        .baseUrl("https://api.wheretheiss.at/")
        .client(
            OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .build()
        )
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(IssApi::class.java)

    suspend fun current(): IssState? {
        val dto = runCatching { api.current() }.getOrNull() ?: return null
        val lat = dto.latitude ?: return null
        val lng = dto.longitude ?: return null
        return IssState(
            lat = lat,
            lng = lng,
            altitudeKm = (dto.altitude ?: 0.0).roundToInt(),
            velocityKmh = (dto.velocity ?: 0.0).roundToInt(),
            visibility = dto.visibility ?: "",
        )
    }

    companion object {
        @Volatile
        private var instance: IssRepository? = null

        fun get(): IssRepository =
            instance ?: synchronized(this) {
                instance ?: IssRepository().also { instance = it }
            }
    }
}
