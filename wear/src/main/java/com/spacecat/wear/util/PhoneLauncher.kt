package com.spacecat.wear.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.concurrent.futures.await
import androidx.wear.remote.interactions.RemoteActivityHelper
import java.util.concurrent.Executors

/**
 * Wear'da video izlemek doğru hamle değil; canlı yayını bağlı telefonun
 * tarayıcısında açar. [RemoteActivityHelper] sistem üzerinden çalışır —
 * kendi companion uygulamamıza gerek yok.
 */
object PhoneLauncher {

    private val mediaHosts = setOf(
        "youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be",
        "x.com", "www.x.com", "twitter.com", "www.twitter.com",
        "bilibili.com", "www.bilibili.com", "live.bilibili.com", "b23.tv",
    )
    private val allowedHosts = mediaHosts + "calendar.google.com"
    private val executor = Executors.newSingleThreadExecutor { runnable ->
        Thread(runnable, "spacecat-remote-activity").apply { isDaemon = true }
    }

    fun isAllowedWebcastUrl(url: String): Boolean =
        safeHttpsUri(url)?.host?.lowercase() in mediaHosts

    private fun safeHttpsUri(url: String): Uri? {
        val uri = runCatching { Uri.parse(url) }.getOrNull() ?: return null
        val host = uri.host?.lowercase() ?: return null
        return uri.takeIf {
            it.scheme.equals("https", ignoreCase = true) &&
                host in allowedHosts &&
                it.userInfo == null &&
                (it.port == -1 || it.port == 443)
        }
    }

    /**
     * Verilen URL'i telefonda açmayı dener. Bağlı telefon yoksa / hata olursa
     * kullanıcıya kısa bir uyarı gösterir.
     */
    suspend fun openOnPhone(context: Context, url: String) {
        val safeUri = safeHttpsUri(url)
        if (safeUri == null) {
            Toast.makeText(context, "Geçersiz bağlantı", Toast.LENGTH_SHORT).show()
            return
        }
        val intent = Intent(Intent.ACTION_VIEW)
            .addCategory(Intent.CATEGORY_BROWSABLE)
            .setData(safeUri)

        val helper = RemoteActivityHelper(context, executor)
        val result = runCatching {
            // targetNodeId = null → bağlı tüm düğümlere (telefon) gönder.
            helper.startRemoteActivity(intent, null).await()
        }
        val message =
            if (result.isSuccess) "▶ Telefonda açıldı"
            else "Bağlı telefon bulunamadı"
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
