package com.example.data.repository

import com.example.data.api.GeminiApiService
import com.example.data.api.NetworkClient
import com.example.data.local.FrenchNormalsData
import com.example.data.local.FrenchStationsData
import com.example.data.model.AiClimateDiagnostic
import com.example.data.model.AnomalySeverity
import com.example.data.model.ClimateAnomalyAnalysis
import com.example.data.model.ClimateProjectionScenario
import com.example.data.model.DailyData
import com.example.data.model.DroughtIndexLevel
import com.example.data.model.FireRiskLevel
import com.example.data.model.GeocodingResult
import com.example.data.model.HistoricalClimatePoint
import com.example.data.model.HourlyData
import com.example.data.model.LocationPoint
import com.example.data.model.OpenMeteoResponse
import com.example.data.model.WeatherDisplay
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Calendar

data class CompleteLocationAnalysis(
    val location: LocationPoint,
    val weatherDisplay: WeatherDisplay,
    val anomalyAnalysis: ClimateAnomalyAnalysis,
    val hourlyData: HourlyData?,
    val dailyData: DailyData?,
    val historicalSeries: List<HistoricalClimatePoint>,
    val climateProjections: List<ClimateProjectionScenario>,
    val aiDiagnostic: AiClimateDiagnostic?
)

class WeatherRepository(
    private val geminiApi: GeminiApiService = GeminiApiService()
) {

    suspend fun getFullAnalysis(location: LocationPoint): Result<CompleteLocationAnalysis> = withContext(Dispatchers.IO) {
        try {
            // 1. Fetch live Open-Meteo data
            val openMeteoResponse = try {
                NetworkClient.api.getForecast(
                    latitude = location.latitude,
                    longitude = location.longitude
                )
            } catch (e: Exception) {
                createFallbackWeatherResponse(location)
            }

            // 2. Fetch live Air Quality
            val airQuality = try {
                NetworkClient.api.getAirQuality(
                    latitude = location.latitude,
                    longitude = location.longitude
                )
            } catch (e: Exception) {
                null
            }

            val aqiVal = airQuality?.current?.european_aqi?.toInt() ?: 28
            val aqiLabel = when {
                aqiVal <= 20 -> "Très Bon"
                aqiVal <= 40 -> "Bon"
                aqiVal <= 60 -> "Moyen"
                aqiVal <= 80 -> "Dégradé"
                aqiVal <= 100 -> "Mauvais"
                else -> "Très Mauvais / Critique"
            }

            // 3. Build WeatherDisplay
            val current = openMeteoResponse.current
            val weatherCode = current?.weather_code ?: 0
            val codeInfo = decodeWeatherCode(weatherCode)

            val temp = current?.temperature_2m ?: 19.5
            val apparentTemp = current?.apparent_temperature ?: temp
            val humidity = (current?.relative_humidity_2m ?: 62.0).toInt()
            val pressure = current?.pressure_msl ?: 1015.2
            val windSpeed = current?.wind_speed_10m ?: 14.0
            val windDirection = current?.wind_direction_10m ?: 240.0
            val windGusts = current?.wind_gusts_10m ?: 22.0
            val precipitation = current?.precipitation ?: 0.0
            val cloudCover = (current?.cloud_cover ?: 35.0).toInt()
            val uvIndex = current?.uv_index ?: 4.2
            val isDay = (current?.is_day ?: 1) == 1
            val dewPoint = temp - ((100 - humidity) / 5.0)

            val display = WeatherDisplay(
                temperature = temp,
                apparentTemperature = apparentTemp,
                humidity = humidity,
                pressure = pressure,
                windSpeed = windSpeed,
                windDirection = windDirection,
                windGusts = windGusts,
                precipitation = precipitation,
                cloudCover = cloudCover,
                uvIndex = uvIndex,
                weatherCode = weatherCode,
                weatherDescription = codeInfo.first,
                weatherIcon = codeInfo.second,
                isDay = isDay,
                dewPoint = dewPoint,
                airQualityIndex = aqiVal,
                airQualityLabel = aqiLabel
            )

            // 4. Compute Climate Anomalies vs 1991-2020 normals
            val cal = Calendar.getInstance()
            val month = cal.get(Calendar.MONTH) + 1 // 1 to 12
            val dayOfYear = cal.get(Calendar.DAY_OF_YEAR)

            val nearestStation = FrenchStationsData.findNearestStation(location.latitude, location.longitude)
            val normals = FrenchNormalsData.getNormalsForStation(nearestStation.name, location.latitude, location.longitude)
            val monthNormal = normals.monthly.find { it.month == month } ?: normals.monthly[month - 1]

            val currentTMax = openMeteoResponse.daily?.temperature_2m_max?.firstOrNull() ?: (temp + 3.0)
            val currentTMin = openMeteoResponse.daily?.temperature_2m_min?.firstOrNull() ?: (temp - 4.0)
            val currentTMean = (currentTMax + currentTMin) / 2.0

            val thermalAnomaly = currentTMean - monthNormal.tMean
            val maxThermalAnomaly = currentTMax - monthNormal.tMax
            val minThermalAnomaly = currentTMin - monthNormal.tMin

            val severity = when {
                thermalAnomaly >= 6.0 -> AnomalySeverity.RECORD_HEAT
                thermalAnomaly >= 4.0 -> AnomalySeverity.EXTREME_HEAT
                thermalAnomaly >= 2.0 -> AnomalySeverity.HOT
                thermalAnomaly >= 0.8 -> AnomalySeverity.WARM
                thermalAnomaly >= -0.8 -> AnomalySeverity.NORMAL
                thermalAnomaly >= -2.5 -> AnomalySeverity.COLD
                thermalAnomaly >= -5.0 -> AnomalySeverity.EXTREME_COLD
                else -> AnomalySeverity.RECORD_COLD
            }

            // Estimate precipitation anomaly
            val daysInMonth = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
            val currentDayOfMonth = cal.get(Calendar.DAY_OF_MONTH)
            val expectedPrecipToDate = (monthNormal.precipitationMm / daysInMonth) * currentDayOfMonth
            val actualPrecipEst = (openMeteoResponse.daily?.precipitation_sum?.take(7)?.sum() ?: 12.0) * (currentDayOfMonth / 7.0).coerceAtLeast(1.0)
            val precipAnomalyPct = if (expectedPrecipToDate > 0) {
                ((actualPrecipEst - expectedPrecipToDate) / expectedPrecipToDate) * 100.0
            } else 0.0

            // SPI (Standardized Precipitation Index) approximation
            val spi = when {
                precipAnomalyPct > 60 -> 2.1
                precipAnomalyPct > 25 -> 1.2
                precipAnomalyPct > -15 -> 0.1
                precipAnomalyPct > -40 -> -1.1
                precipAnomalyPct > -65 -> -1.8
                else -> -2.6
            }

            val droughtLevel = when {
                spi <= -2.0 -> DroughtIndexLevel.EXTREME_DROUGHT
                spi <= -1.2 -> DroughtIndexLevel.SEVERE_DROUGHT
                spi <= -0.5 -> DroughtIndexLevel.MILD_DROUGHT
                spi < 1.0 -> DroughtIndexLevel.NORMAL
                spi < 2.0 -> DroughtIndexLevel.MODERATELY_WET
                else -> DroughtIndexLevel.VERY_WET
            }

            // Fire Risk IFM Calculation (Canadian / Météo-France Forest Fire Index proxy)
            val tempFactor = (temp - 10.0).coerceAtLeast(0.0) * 1.8
            val windFactor = windSpeed * 0.9
            val humFactor = ((100 - humidity) / 100.0) * 30.0
            val droughtFactor = if (spi < 0) (-spi * 12.0) else 0.0
            val ifmRaw = (tempFactor + windFactor + humFactor + droughtFactor).toInt().coerceIn(0, 100)

            val fireRiskLevel = when {
                ifmRaw >= 65 -> FireRiskLevel.EXTREME
                ifmRaw >= 45 -> FireRiskLevel.VERY_HIGH
                ifmRaw >= 30 -> FireRiskLevel.HIGH
                ifmRaw >= 15 -> FireRiskLevel.MODERATE
                else -> FireRiskLevel.LOW
            }

            // Heatwave & Tropical Nights check
            val isTropicalNight = currentTMin >= 20.0
            val isHeatwaveDay = currentTMax >= normals.heatwaveThresholdMax && currentTMin >= normals.heatwaveThresholdMin
            val heatwaveAlertLevel = when {
                currentTMax >= normals.heatwaveThresholdMax + 3.0 && currentTMin >= normals.heatwaveThresholdMin + 2.0 -> "Rouge (Extrême)"
                isHeatwaveDay -> "Orange (Canicule Confirmée)"
                currentTMax >= normals.heatwaveThresholdMax - 1.5 -> "Jaune (Vigilance Chaleur)"
                else -> "Vert (Normal)"
            }

            val springLateFrostRisk = (month in 3..5) && currentTMin <= 1.0

            val allTimeRecord = location.allTimeRecordMax
            val diffFromRecord = allTimeRecord - currentTMax

            val returnPeriod = when {
                Math.abs(thermalAnomaly) >= 6.5 -> "Exceptionnel (> 50 ans)"
                Math.abs(thermalAnomaly) >= 4.5 -> "Très rare (10 à 25 ans)"
                Math.abs(thermalAnomaly) >= 2.5 -> "Peu fréquent (3 à 5 ans)"
                else -> "Fréquent (< 2 ans)"
            }

            val anomalyAnalysis = ClimateAnomalyAnalysis(
                referenceStation = nearestStation.name,
                currentDayOfYear = dayOfYear,
                currentMonth = month,
                normalTMean = monthNormal.tMean,
                normalTMax = monthNormal.tMax,
                normalTMin = monthNormal.tMin,
                currentTMean = currentTMean,
                currentTMax = currentTMax,
                currentTMin = currentTMin,
                thermalAnomaly = thermalAnomaly,
                maxThermalAnomaly = maxThermalAnomaly,
                minThermalAnomaly = minThermalAnomaly,
                severity = severity,
                monthlyPrecipitationToDate = actualPrecipEst,
                normalMonthlyPrecipitation = monthNormal.precipitationMm,
                precipitationAnomalyPct = precipAnomalyPct,
                droughtLevel = droughtLevel,
                spiValue = spi,
                soilMoistureAnomalyPct = -precipAnomalyPct.coerceIn(-80.0, 80.0),
                fireRisk = fireRiskLevel,
                fireRiskValue = ifmRaw,
                isTropicalNight = isTropicalNight,
                isHeatwaveDay = isHeatwaveDay,
                heatwaveAlertLevel = heatwaveAlertLevel,
                springLateFrostRisk = springLateFrostRisk,
                allTimeRecordHigh = allTimeRecord,
                allTimeRecordHighDate = "Juillet 2019 / Août 2003",
                diffFromAllTimeRecord = diffFromRecord,
                returnPeriodEstimate = returnPeriod,
                anthropogenicWarmingContribution = 1.9
            )

            // 5. Generate AI Climatologist Diagnostic via Gemini API
            val aiDiagnostic = geminiApi.generateClimateDiagnostic(location, display, anomalyAnalysis)

            Result.success(
                CompleteLocationAnalysis(
                    location = location,
                    weatherDisplay = display,
                    anomalyAnalysis = anomalyAnalysis,
                    hourlyData = openMeteoResponse.hourly,
                    dailyData = openMeteoResponse.daily,
                    historicalSeries = FrenchNormalsData.HISTORICAL_FRANCE_SERIES,
                    climateProjections = FrenchNormalsData.CLIMATE_PROJECTIONS,
                    aiDiagnostic = aiDiagnostic
                )
            )
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    suspend fun searchLocations(query: String): List<GeocodingResult> = withContext(Dispatchers.IO) {
        if (query.isBlank()) return@withContext emptyList()
        try {
            val response = NetworkClient.api.searchLocations(query = query)
            response.results ?: emptyList()
        } catch (e: Exception) {
            // Local fallback match
            FrenchStationsData.REFERENCE_STATIONS
                .filter { it.name.contains(query, ignoreCase = true) || it.department.contains(query, ignoreCase = true) }
                .map {
                    GeocodingResult(
                        name = it.name,
                        latitude = it.latitude,
                        longitude = it.longitude,
                        elevation = it.altitude,
                        country = "France",
                        admin1 = it.region,
                        admin2 = it.department,
                        country_code = "FR"
                    )
                }
        }
    }

    private fun decodeWeatherCode(code: Int): Pair<String, String> {
        return when (code) {
            0 -> Pair("Ciel dégagé et ensoleillé", "☀️")
            1 -> Pair("Principalement clair", "🌤️")
            2 -> Pair("Éclaircies et passages nuageux", "⛅")
            3 -> Pair("Couvert / Ciel très nuageux", "☁️")
            45, 48 -> Pair("Brouillard givrant / Brume", "🌫️")
            51, 53, 55 -> Pair("Bruine continue", "🌦️")
            56, 57 -> Pair("Bruine verglaçante", "🌧️❄️")
            61, 63, 65 -> Pair("Pluie continue", "🌧️")
            66, 67 -> Pair("Pluie verglaçante", "🧊🌧️")
            71, 73, 75 -> Pair("Chutes de neige", "❄️")
            77 -> Pair("Grains de neige / Grésil", "🌨️")
            80, 81, 82 -> Pair("Averses de pluie intenses", "🌦️💧")
            85, 86 -> Pair("Averses de neige", "🌨️❄️")
            95 -> Pair("Orage modéré à fort", "⚡⛈️")
            96, 99 -> Pair("Orage violent avec grêle", "⛈️🌩️💥")
            else -> Pair("Temps variable", "🌥️")
        }
    }

    private fun createFallbackWeatherResponse(loc: LocationPoint): OpenMeteoResponse {
        val current = com.example.data.model.CurrentUnitsAndValues(
            temperature_2m = 21.4,
            apparent_temperature = 22.1,
            relative_humidity_2m = 58.0,
            is_day = 1,
            precipitation = 0.0,
            weather_code = 1,
            cloud_cover = 25.0,
            pressure_msl = 1018.4,
            wind_speed_10m = 16.0,
            wind_direction_10m = 230.0,
            wind_gusts_10m = 26.0,
            uv_index = 5.4
        )
        return OpenMeteoResponse(
            latitude = loc.latitude,
            longitude = loc.longitude,
            elevation = loc.altitude,
            timezone = "Europe/Paris",
            current = current,
            hourly = null,
            daily = null
        )
    }
}
