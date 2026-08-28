package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.api.GeminiApiService
import com.example.data.local.FrenchStationsData
import com.example.data.model.GeocodingResult
import com.example.data.model.LocationPoint
import com.example.data.repository.CompleteLocationAnalysis
import com.example.data.repository.WeatherRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

sealed interface WeatherUiState {
    object Loading : WeatherUiState
    data class Success(val data: CompleteLocationAnalysis) : WeatherUiState
    data class Error(val message: String) : WeatherUiState
}

data class ExpertMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val sender: String, // "USER" or "EXPERT"
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)

data class AppUiState(
    val weatherState: WeatherUiState = WeatherUiState.Loading,
    val currentLocation: LocationPoint = FrenchStationsData.REFERENCE_STATIONS.first(),
    val selectedTab: Int = 0,
    val searchQuery: String = "",
    val searchResults: List<GeocodingResult> = emptyList(),
    val isSearching: Boolean = false,
    val expertChatMessages: List<ExpertMessage> = emptyList(),
    val isExpertResponding: Boolean = false,
    val isFahrenheit: Boolean = false,
    val mapLayer: String = "TEMPERATURE", // "TEMPERATURE", "ANOMALY", "PRECIPITATION", "FIRE_RISK"
    val isOverseasVisible: Boolean = false
)

class WeatherViewModel(
    private val repository: WeatherRepository = WeatherRepository(),
    private val geminiApi: GeminiApiService = GeminiApiService()
) : ViewModel() {

    private val _uiState = MutableStateFlow(AppUiState())
    val uiState: StateFlow<AppUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    init {
        loadDataForLocation(_uiState.value.currentLocation)
    }

    fun selectTab(tabIndex: Int) {
        _uiState.update { it.copy(selectedTab = tabIndex) }
    }

    fun setMapLayer(layer: String) {
        _uiState.update { it.copy(mapLayer = layer) }
    }

    fun toggleOverseas() {
        _uiState.update { it.copy(isOverseasVisible = !it.isOverseasVisible) }
    }

    fun toggleTemperatureUnit() {
        _uiState.update { it.copy(isFahrenheit = !it.isFahrenheit) }
    }

    fun selectStation(station: LocationPoint) {
        _uiState.update { it.copy(currentLocation = station, searchQuery = "", searchResults = emptyList()) }
        loadDataForLocation(station)
    }

    fun selectCoordinates(lat: Double, lon: Double, nameHint: String? = null) {
        val nearest = FrenchStationsData.findNearestStation(lat, lon)
        val name = nameHint ?: "Point précis (${String.format("%.2f", lat)}°N, ${String.format("%.2f", lon)}°E)"
        val customLoc = LocationPoint(
            name = name,
            department = nearest.department,
            region = nearest.region,
            latitude = lat,
            longitude = lon,
            altitude = nearest.altitude,
            climateZone = nearest.climateZone,
            isCustomPoint = true,
            allTimeRecordMax = nearest.allTimeRecordMax,
            allTimeRecordMin = nearest.allTimeRecordMin,
            allTimeRecordRain24h = nearest.allTimeRecordRain24h
        )
        _uiState.update { it.copy(currentLocation = customLoc, searchQuery = "", searchResults = emptyList()) }
        loadDataForLocation(customLoc)
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        searchJob?.cancel()
        if (query.length < 2) {
            _uiState.update { it.copy(searchResults = emptyList(), isSearching = false) }
            return
        }

        searchJob = viewModelScope.launch {
            _uiState.update { it.copy(isSearching = true) }
            delay(350)
            val results = repository.searchLocations(query)
            _uiState.update { it.copy(searchResults = results, isSearching = false) }
        }
    }

    fun selectSearchResult(result: GeocodingResult) {
        val nearest = FrenchStationsData.findNearestStation(result.latitude, result.longitude)
        val loc = LocationPoint(
            name = result.name,
            department = result.admin2 ?: nearest.department,
            region = result.admin1 ?: nearest.region,
            latitude = result.latitude,
            longitude = result.longitude,
            altitude = result.elevation ?: nearest.altitude,
            climateZone = nearest.climateZone,
            isCustomPoint = true,
            allTimeRecordMax = nearest.allTimeRecordMax,
            allTimeRecordMin = nearest.allTimeRecordMin,
            allTimeRecordRain24h = nearest.allTimeRecordRain24h
        )
        _uiState.update {
            it.copy(
                currentLocation = loc,
                searchQuery = "",
                searchResults = emptyList()
            )
        }
        loadDataForLocation(loc)
    }

    fun refreshCurrentData() {
        loadDataForLocation(_uiState.value.currentLocation)
    }

    private fun loadDataForLocation(location: LocationPoint) {
        viewModelScope.launch {
            _uiState.update { it.copy(weatherState = WeatherUiState.Loading) }
            val result = repository.getFullAnalysis(location)
            result.fold(
                onSuccess = { analysis ->
                    _uiState.update {
                        it.copy(
                            weatherState = WeatherUiState.Success(analysis),
                            expertChatMessages = listOf(
                                ExpertMessage(
                                    sender = "EXPERT",
                                    text = "Bonjour ! Je suis votre Climatologue & Météorologue IA pour ${location.name}. Analyse établie en temps réel avec les normales 1991-2020 et modèles Météo-France / ECMWF. Posez-moi vos questions sur les anomalies, l'historique ou les projections GIEC."
                                )
                            )
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(weatherState = WeatherUiState.Error(error.localizedMessage ?: "Erreur de chargement"))
                    }
                }
            )
        }
    }

    fun askExpertQuestion(question: String) {
        if (question.isBlank()) return
        val currentAnalysisState = _uiState.value.weatherState
        if (currentAnalysisState !is WeatherUiState.Success) return

        val userMsg = ExpertMessage(sender = "USER", text = question)
        _uiState.update {
            it.copy(
                expertChatMessages = it.expertChatMessages + userMsg,
                isExpertResponding = true
            )
        }

        viewModelScope.launch {
            val responseText = geminiApi.askExpertQuestion(
                question = question,
                location = currentAnalysisState.data.location,
                weather = currentAnalysisState.data.weatherDisplay,
                anomaly = currentAnalysisState.data.anomalyAnalysis
            )
            val aiMsg = ExpertMessage(sender = "EXPERT", text = responseText)
            _uiState.update {
                it.copy(
                    expertChatMessages = it.expertChatMessages + aiMsg,
                    isExpertResponding = false
                )
            }
        }
    }
}
