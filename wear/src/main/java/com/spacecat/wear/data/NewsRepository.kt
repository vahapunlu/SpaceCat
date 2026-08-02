package com.spacecat.wear.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.spacecat.wear.data.model.NewsArticle
import com.spacecat.wear.data.remote.SnapiApi
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

private val Context.newsStore by preferencesDataStore(name = "news_cache")

class NewsRepository private constructor(private val appContext: Context) {

    private val json = Json { ignoreUnknownKeys = true }

    private val api: SnapiApi = Retrofit.Builder()
        .baseUrl("https://api.spaceflightnewsapi.net/v4/")
        .client(
            OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()
        )
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(SnapiApi::class.java)

    fun articles(): Flow<List<NewsArticle>> = appContext.newsStore.data.map { prefs ->
        prefs[KEY_ARTICLES]
            ?.let { cached ->
                runCatching { json.decodeFromString<List<NewsArticle>>(cached) }
                    .onFailure { e -> android.util.Log.e("SpaceCat", "news decode failed", e) }
                    .getOrNull()
            }
            ?: emptyList()
    }

    suspend fun refresh() {
        val fetched = api.latestArticles().results.map { dto ->
            NewsArticle(
                id = dto.id,
                title = dto.title,
                site = dto.newsSite ?: "",
                summary = dto.summary ?: "",
                publishedMillis = dto.publishedAt
                    ?.let { runCatching { Instant.parse(it).toEpochMilli() }.getOrNull() }
                    ?: 0,
            )
        }
        appContext.newsStore.edit { prefs ->
            prefs[KEY_ARTICLES] = json.encodeToString(fetched)
        }
    }

    companion object {
        private val KEY_ARTICLES = stringPreferencesKey("articles_json")

        @Volatile
        private var instance: NewsRepository? = null

        fun get(context: Context): NewsRepository =
            instance ?: synchronized(this) {
                instance ?: NewsRepository(context.applicationContext).also { instance = it }
            }
    }
}
