package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.components.DossierExportDialog
import com.example.ui.screens.AiDiagnosticScreen
import com.example.ui.screens.ClimateAnomaliesScreen
import com.example.ui.screens.EvolutionProjectionsScreen
import com.example.ui.screens.FranceMapScreen
import com.example.ui.screens.RealtimeScreen
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.ExtremeCrimson
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.NormalEmerald
import com.example.ui.theme.PurpleAtmosphere
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SlateCardHighlight
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.WarmAmber
import com.example.ui.viewmodel.WeatherUiState
import com.example.ui.viewmodel.WeatherViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                ClimaFranceApp()
            }
        }
    }
}

data class NavTabItem(
    val title: String,
    val icon: ImageVector,
    val badgeCount: Int = 0
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClimaFranceApp(viewModel: WeatherViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsState()
    var showExportDialog by remember { mutableStateOf(false) }

    val navTabs = listOf(
        NavTabItem("Temps Réel", Icons.Default.Thermostat),
        NavTabItem("Anomalies", Icons.Default.BarChart),
        NavTabItem("Évolution", Icons.Default.Timeline),
        NavTabItem("Carte France", Icons.Default.Map),
        NavTabItem("Climatologue IA", Icons.Default.AutoAwesome)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .background(ElectricBlue.copy(alpha = 0.2f), CircleShape)
                                .border(1.dp, ElectricBlue, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Thermostat,
                                contentDescription = null,
                                tint = ElectricBlue,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "CLIMAFRANCE",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp,
                                color = TextPrimary
                            )
                            Text(
                                text = state.currentLocation.name.take(18),
                                fontSize = 11.sp,
                                color = ElectricBlue
                            )
                        }
                    }
                },
                actions = {
                    // Unit toggle (°C / °F)
                    IconButton(onClick = { viewModel.toggleTemperatureUnit() }) {
                        Text(
                            text = if (state.isFahrenheit) "°F" else "°C",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = ElectricBlue
                        )
                    }

                    // Export report button
                    if (state.weatherState is WeatherUiState.Success) {
                        IconButton(onClick = { showExportDialog = true }) {
                            Icon(
                                imageVector = Icons.Default.Description,
                                contentDescription = "Exporter Bulletin",
                                tint = TextPrimary
                            )
                        }
                    }

                    // Refresh button
                    IconButton(onClick = { viewModel.refreshCurrentData() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Actualiser",
                            tint = TextPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DeepNavy,
                    titleContentColor = TextPrimary
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = SlateCard,
                contentColor = TextPrimary,
                tonalElevation = 8.dp
            ) {
                navTabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = state.selectedTab == index,
                        onClick = { viewModel.selectTab(index) },
                        icon = {
                            Icon(
                                imageVector = tab.icon,
                                contentDescription = tab.title,
                                modifier = Modifier.size(22.dp)
                            )
                        },
                        label = {
                            Text(
                                text = tab.title,
                                fontSize = 10.sp,
                                fontWeight = if (state.selectedTab == index) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = DeepNavy,
                            selectedTextColor = ElectricBlue,
                            indicatorColor = ElectricBlue,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted
                        )
                    )
                }
            }
        },
        containerColor = DeepNavy
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (val weatherState = state.weatherState) {
                is WeatherUiState.Loading -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(48.dp),
                            color = ElectricBlue,
                            strokeWidth = 3.dp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Extraction des paramètres météo & calcul d'anomalies...",
                            fontSize = 13.sp,
                            color = TextSecondary
                        )
                        Text(
                            text = "${state.currentLocation.name} (${state.currentLocation.department})",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = ElectricBlue
                        )
                    }
                }
                is WeatherUiState.Error -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = ExtremeCrimson,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Erreur de chargement",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = weatherState.message,
                            fontSize = 13.sp,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { viewModel.refreshCurrentData() },
                            colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue)
                        ) {
                            Text(text = "Réessayer", color = DeepNavy, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                is WeatherUiState.Success -> {
                    val analysis = weatherState.data
                    when (state.selectedTab) {
                        0 -> RealtimeScreen(
                            data = analysis,
                            isFahrenheit = state.isFahrenheit
                        )
                        1 -> ClimateAnomaliesScreen(
                            data = analysis
                        )
                        2 -> EvolutionProjectionsScreen(
                            data = analysis
                        )
                        3 -> FranceMapScreen(
                            currentLocation = state.currentLocation,
                            searchQuery = state.searchQuery,
                            searchResults = state.searchResults,
                            isSearching = state.isSearching,
                            mapLayer = state.mapLayer,
                            isOverseasVisible = state.isOverseasVisible,
                            onSearchQueryChanged = viewModel::onSearchQueryChanged,
                            onSearchResultSelected = viewModel::selectSearchResult,
                            onPointSelected = viewModel::selectCoordinates,
                            onStationSelected = viewModel::selectStation,
                            onLayerSelected = viewModel::setMapLayer,
                            onToggleOverseas = viewModel::toggleOverseas
                        )
                        4 -> AiDiagnosticScreen(
                            data = analysis,
                            chatMessages = state.expertChatMessages,
                            isExpertResponding = state.isExpertResponding,
                            onAskQuestion = viewModel::askExpertQuestion
                        )
                    }

                    if (showExportDialog) {
                        DossierExportDialog(
                            data = analysis,
                            onDismiss = { showExportDialog = false }
                        )
                    }
                }
            }
        }
    }
}
