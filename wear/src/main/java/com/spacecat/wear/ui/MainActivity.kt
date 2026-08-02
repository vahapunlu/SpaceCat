package com.spacecat.wear.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.CardDefaults
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.spacecat.wear.data.LaunchRepository
import com.spacecat.wear.data.model.Launch
import com.spacecat.wear.ui.theme.DeepSpace
import com.spacecat.wear.ui.theme.SpaceCatTheme
import com.spacecat.wear.ui.theme.TerminalAmber
import com.spacecat.wear.ui.theme.TerminalGreen
import com.spacecat.wear.ui.theme.TerminalGrey

private const val RECENT_GRACE_MILLIS = 60 * 60 * 1000L

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Branded launch: siyah zeminde ikon (Wear kalite kuralı).
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setContent {
            SpaceCatTheme {
                SpaceCatNav()
            }
        }
    }
}

@Composable
fun SpaceCatNav() {
    NotificationPermissionRequest()
    val navController = rememberSwipeDismissableNavController()
    SwipeDismissableNavHost(navController = navController, startDestination = "list") {
        composable("list") {
            LaunchListScreen(
                onOpen = { launch -> navController.navigate("detail/${launch.id}") },
                onOpenNews = { article -> navController.navigate("news/${article.id}") },
                onOpenEvent = { event -> navController.navigate("event/${event.id}") },
                onOpenIss = { navController.navigate("iss") },
                onOpenSettings = { navController.navigate("settings") },
                onOpenAbout = { navController.navigate("about") },
            )
        }
        composable("detail/{id}") { backStackEntry ->
            DetailRoute(backStackEntry.arguments?.getString("id"))
        }
        composable("news/{id}") { backStackEntry ->
            NewsRoute(backStackEntry.arguments?.getString("id"))
        }
        composable("event/{id}") { backStackEntry ->
            EventRoute(backStackEntry.arguments?.getString("id"))
        }
        composable("iss") { IssScreen() }
        composable("settings") {
            SettingsScreen(onManageFavorites = { navController.navigate("managefav") })
        }
        composable("managefav") { ManageFavoritesScreen() }
        composable("about") { AboutScreen() }
    }
}

@Composable
private fun NewsRoute(id: String?) {
    val articles = rememberArticles()
    NewsDetailScreen(articles.firstOrNull { it.id.toString() == id })
}

@Composable
private fun EventRoute(id: String?) {
    val events = rememberEvents()
    EventDetailScreen(events.firstOrNull { it.id.toString() == id })
}

/** Uzay olayları akışını ekranın kendi recomposition kapsamında toplar. */
@Composable
private fun rememberEvents(): List<com.spacecat.wear.data.model.SpaceEvent> {
    val context = LocalContext.current
    val repo = remember { com.spacecat.wear.data.EventRepository.get(context) }
    val flow = remember(repo) { repo.events() }
    val events by flow.collectAsState(initial = emptyList())
    LaunchedEffect(Unit) {
        runCatching { repo.refresh() }
            .onFailure { android.util.Log.e("SpaceCat", "event refresh failed", it) }
    }
    return events
}

/** Haber akışını ekranın kendi recomposition kapsamında toplar. */
@Composable
private fun rememberArticles(): List<com.spacecat.wear.data.model.NewsArticle> {
    val context = LocalContext.current
    val repo = remember { com.spacecat.wear.data.NewsRepository.get(context) }
    val flow = remember(repo) { repo.articles() }
    val articles by flow.collectAsState(initial = emptyList())
    LaunchedEffect(Unit) {
        runCatching { repo.refresh() }
            .onFailure { android.util.Log.e("SpaceCat", "news refresh failed", it) }
    }
    return articles
}

@Composable
private fun NotificationPermissionRequest() {
    val context = LocalContext.current
    val launcher = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.RequestPermission()
    ) { /* reddedilirse bildirimler sessizce kapalı kalır */ }
    LaunchedEffect(Unit) {
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.TIRAMISU) {
            return@LaunchedEffect
        }
        val granted = androidx.core.content.ContextCompat.checkSelfPermission(
            context, android.Manifest.permission.POST_NOTIFICATIONS
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        if (!granted) launcher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
    }
}

/**
 * Fırlatma akışını ekranın KENDİ recomposition kapsamında toplar.
 * (Nav grafiği dışında toplanan state, destinasyon lambda'sına güvenilir
 * biçimde yansımıyor — Galaxy Watch7'de canlı tekrarlanan bug.)
 */
@Composable
private fun rememberUpcomingLaunches(): List<Launch> {
    val context = LocalContext.current
    val repo = remember { LaunchRepository.get(context) }
    // remember: her recomposition'da yeni Flow örneği yaratılmasın.
    val launchesFlow = remember(repo) { repo.launches() }
    val allLaunches by launchesFlow.collectAsState(initial = emptyList())

    LaunchedEffect(Unit) {
        runCatching { repo.refresh() }
    }

    // Bir saatten eski fırlatmaları listeden düşür.
    return allLaunches.filter {
        it.netMillis > System.currentTimeMillis() - RECENT_GRACE_MILLIS
    }
}

@Composable
private fun DetailRoute(id: String?) {
    val launches = rememberUpcomingLaunches()
    DetailScreen(launches.firstOrNull { it.id == id })
}

@Composable
fun LaunchListScreen(
    onOpen: (Launch) -> Unit,
    onOpenNews: (com.spacecat.wear.data.model.NewsArticle) -> Unit,
    onOpenEvent: (com.spacecat.wear.data.model.SpaceEvent) -> Unit,
    onOpenIss: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenAbout: () -> Unit,
) {
    val allLaunches = rememberUpcomingLaunches()
    val articles = rememberArticles()
    val events = rememberEvents()

    // Favori süzme (Dalga 9): "favorites only" açık ve en az bir favori varsa
    // listeyi favori ajanslara indir; aksi halde tümünü göster (boş ekran olmasın).
    val context = LocalContext.current
    val settingsRepo = remember { com.spacecat.wear.data.SettingsRepository.get(context) }
    val favoritesOnly by remember(settingsRepo) { settingsRepo.settings() }
        .collectAsState(initial = com.spacecat.wear.data.AlertSettings())
    val favorites by remember(settingsRepo) { settingsRepo.favorites() }
        .collectAsState(initial = emptySet())
    val filterActive = favoritesOnly.favoritesOnly && favorites.isNotEmpty()
    val launches = if (filterActive) {
        allLaunches.filter { it.agencyAbbrev != null && it.agencyAbbrev in favorites }
    } else {
        allLaunches
    }

    val listState = rememberScalingLazyListState()
    Scaffold(
        timeText = { TimeText() },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) },
    ) {
        ScalingLazyColumn(state = listState, modifier = Modifier.wearViewport()) {
            item { TerminalHeader() }
            if (filterActive) {
                item {
                    Text(
                        text = "★ FAVORITES",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        letterSpacing = 2.sp,
                        color = TerminalAmber,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onOpenSettings() },
                    )
                }
            }
            if (allLaunches.isEmpty()) {
                item {
                    Text(
                        text = "> AWAITING TELEMETRY…",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = TerminalGreen,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 12.dp),
                    )
                }
            } else if (launches.isEmpty()) {
                // Favori süzgeç açık ama sıradaki fırlatmalarda favori ajans yok.
                item {
                    Text(
                        text = "> NO FAVORITE-AGENCY LAUNCHES UPCOMING",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = TerminalGrey,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp, start = 10.dp, end = 10.dp),
                    )
                }
            } else {
                item { NextLaunchCard(launches.first()) { onOpen(launches.first()) } }
                items(launches.drop(1)) { launch ->
                    UpcomingRow(launch) { onOpen(launch) }
                }
            }
            if (articles.isNotEmpty()) {
                item {
                    Text(
                        text = "📰 WIRE",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        letterSpacing = 2.sp,
                        color = TerminalGreen,
                        modifier = Modifier.padding(top = 12.dp, bottom = 2.dp),
                    )
                }
                items(articles) { article ->
                    NewsRow(article) { onOpenNews(article) }
                }
            }
            if (events.isNotEmpty()) {
                item {
                    Text(
                        text = "🛰 EVENTS",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        letterSpacing = 2.sp,
                        color = TerminalGreen,
                        modifier = Modifier.padding(top = 12.dp, bottom = 2.dp),
                    )
                }
                items(events) { event ->
                    EventRow(event) { onOpenEvent(event) }
                }
            }
            item {
                Text(
                    text = "🛰 ISS TRACKER",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    letterSpacing = 1.sp,
                    color = TerminalGreen,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp, bottom = 4.dp)
                        .clickable { onOpenIss() },
                )
            }
            item {
                Text(
                    text = "⚙ ALERTS",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    letterSpacing = 1.sp,
                    color = TerminalGreen,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp, bottom = 4.dp)
                        .clickable { onOpenSettings() },
                )
            }
            item {
                Text(
                    text = "ⓘ ABOUT",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    letterSpacing = 1.sp,
                    color = TerminalGreen,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp, bottom = 8.dp)
                        .clickable { onOpenAbout() },
                )
            }
        }
    }
}

@Composable
private fun TerminalHeader() {
    val blink = rememberInfiniteTransition(label = "cursor")
    val cursorAlpha by blink.animateFloat(
        initialValue = 1f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 530),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "cursorAlpha",
    )
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = "SPACE CAT",
            fontFamily = FontFamily.Monospace,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 2.sp,
            color = TerminalGreen,
        )
        Text(
            text = "▮",
            fontFamily = FontFamily.Monospace,
            fontSize = 13.sp,
            color = TerminalGreen,
            modifier = Modifier.alpha(cursorAlpha),
        )
    }
}

@Composable
private fun NextLaunchCard(launch: Launch, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        backgroundPainter = CardDefaults.cardBackgroundPainter(
            startBackgroundColor = Color(0xFF12261B),
            endBackgroundColor = DeepSpace,
        ),
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = launch.mission,
                style = MaterialTheme.typography.title3,
                textAlign = TextAlign.Center,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            CountdownText(launch.netMillis)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 2.dp),
            ) {
                StatusChip(launch.statusAbbrev)
                Text(
                    text = launch.vehicle,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = TerminalGreen,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(start = 6.dp),
                )
            }
            Text(
                text = launch.location,
                style = MaterialTheme.typography.caption2,
                textAlign = TextAlign.Center,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.padding(top = 4.dp),
            )
            if (launch.webcastLive) {
                LiveBadge()
            }
        }
    }
}

@Composable
private fun NewsRow(
    article: com.spacecat.wear.data.model.NewsArticle,
    onClick: () -> Unit,
) {
    Card(onClick = onClick) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = article.title,
                style = MaterialTheme.typography.caption1,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = "${article.site} · ${relativeTime(article.publishedMillis)}",
                fontFamily = FontFamily.Monospace,
                fontSize = 10.sp,
                color = TerminalAmber,
                maxLines = 1,
            )
        }
    }
}

@Composable
private fun EventRow(
    event: com.spacecat.wear.data.model.SpaceEvent,
    onClick: () -> Unit,
) {
    Card(onClick = onClick) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = event.name,
                style = MaterialTheme.typography.caption1,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = buildString {
                    if (event.type.isNotEmpty()) append("${event.type} · ")
                    append(formatNet(event.dateMillis))
                },
                fontFamily = FontFamily.Monospace,
                fontSize = 10.sp,
                color = TerminalAmber,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun UpcomingRow(launch: Launch, onClick: () -> Unit) {
    Card(onClick = onClick) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = launch.mission,
                style = MaterialTheme.typography.caption1,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                launch.agencyAbbrev?.takeIf { it.isNotEmpty() }?.let { abbrev ->
                    Text(
                        text = "$abbrev · ",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = TerminalGreen,
                    )
                }
                Text(
                    text = formatNet(launch.netMillis),
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = TerminalAmber,
                )
                Text(
                    text = " · ${launch.statusAbbrev.uppercase()}",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = statusColor(launch.statusAbbrev),
                )
            }
        }
    }
}
