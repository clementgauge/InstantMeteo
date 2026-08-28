package com.example.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

data class LocationPoint(
    val name: String,
    val department: String,
    val region: String,
    val latitude: Double,
    val longitude: Double,
    val altitude: Double = 0.0,
    val climateZone: String = "Océanique",
    val isCustomPoint: Boolean = false,
    val allTimeRecordMax: Double = 40.0,
    val allTimeRecordMin: Double = -15.0,
    val allTimeRecordRain24h: Double = 80.0
)

@JsonClass(generateAdapter = true)
data class GeocodingResponse(
    val results: List<GeocodingResult>? = null
)

@JsonClass(generateAdapter = true)
data class GeocodingResult(
    val id: Long? = null,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val elevation: Double? = null,
    val country: String? = null,
    val admin1: String? = null,
    val admin2: String? = null,
    val country_code: String? = null
)

@JsonClass(generateAdapter = true)
data class OpenMeteoResponse(
    val latitude: Double,
    val longitude: Double,
    val elevation: Double? = null,
    val timezone: String? = null,
    val current: CurrentUnitsAndValues? = null,
    val hourly: HourlyData? = null,
    val daily: DailyData? = null
)

@JsonClass(generateAdapter = true)
data class CurrentUnitsAndValues(
    val time: String? = null,
    val interval: Int? = null,
    val temperature_2m: Double? = null,
    val relative_humidity_2m: Double? = null,
    val apparent_temperature: Double? = null,
    val is_day: Int? = null,
    val precipitation: Double? = null,
    val rain: Double? = null,
    val showers: Double? = null,
    val snowfall: Double? = null,
    val weather_code: Int? = null,
    val cloud_cover: Double? = null,
    val pressure_msl: Double? = null,
    val surface_pressure: Double? = null,
    val wind_speed_10m: Double? = null,
    val wind_direction_10m: Double? = null,
    val wind_gusts_10m: Double? = null,
    val uv_index: Double? = null
)

@JsonClass(generateAdapter = true)
data class HourlyData(
    val time: List<String>? = null,
    val temperature_2m: List<Double>? = null,
    val relative_humidity_2m: List<Double>? = null,
    val dew_point_2m: List<Double>? = null,
    val apparent_temperature: List<Double>? = null,
    val precipitation_probability: List<Double>? = null,
    val precipitation: List<Double>? = null,
    val rain: List<Double>? = null,
    val weather_code: List<Int>? = null,
    val pressure_msl: List<Double>? = null,
    val cloud_cover: List<Double>? = null,
    val wind_speed_10m: List<Double>? = null,
    val wind_gusts_10m: List<Double>? = null,
    val uv_index: List<Double>? = null,
    val soil_temperature_0cm: List<Double>? = null,
    val soil_moisture_0_to_1cm: List<Double>? = null
)

@JsonClass(generateAdapter = true)
data class DailyData(
    val time: List<String>? = null,
    val weather_code: List<Int>? = null,
    val temperature_2m_max: List<Double>? = null,
    val temperature_2m_min: List<Double>? = null,
    val apparent_temperature_max: List<Double>? = null,
    val apparent_temperature_min: List<Double>? = null,
    val sunrise: List<String>? = null,
    val sunset: List<String>? = null,
    val uv_index_max: List<Double>? = null,
    val precipitation_sum: List<Double>? = null,
    val rain_sum: List<Double>? = null,
    val showers_sum: List<Double>? = null,
    val snowfall_sum: List<Double>? = null,
    val precipitation_hours: List<Double>? = null,
    val precipitation_probability_max: List<Double>? = null,
    val wind_speed_10m_max: List<Double>? = null,
    val wind_gusts_10m_max: List<Double>? = null,
    val wind_direction_10m_dominant: List<Double>? = null,
    val et0_fao_evapotranspiration: List<Double>? = null
)

@JsonClass(generateAdapter = true)
data class AirQualityResponse(
    val latitude: Double? = null,
    val longitude: Double? = null,
    val current: AirQualityCurrent? = null
)

@JsonClass(generateAdapter = true)
data class AirQualityCurrent(
    val time: String? = null,
    val european_aqi: Double? = null,
    val pm10: Double? = null,
    val pm2_5: Double? = null,
    val carbon_monoxide: Double? = null,
    val nitrogen_dioxide: Double? = null,
    val sulphur_dioxide: Double? = null,
    val ozone: Double? = null,
    val uv_index: Double? = null
)

data class WeatherDisplay(
    val temperature: Double,
    val apparentTemperature: Double,
    val humidity: Int,
    val pressure: Double,
    val windSpeed: Double,
    val windDirection: Double,
    val windGusts: Double,
    val precipitation: Double,
    val cloudCover: Int,
    val uvIndex: Double,
    val weatherCode: Int,
    val weatherDescription: String,
    val weatherIcon: String,
    val isDay: Boolean,
    val dewPoint: Double,
    val airQualityIndex: Int = 25,
    val airQualityLabel: String = "Bon"
)
