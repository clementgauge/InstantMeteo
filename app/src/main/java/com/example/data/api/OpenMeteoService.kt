package com.example.data.api

import com.example.data.model.AirQualityResponse
import com.example.data.model.GeocodingResponse
import com.example.data.model.OpenMeteoResponse
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

interface OpenMeteoApi {

    @GET("https://api.open-meteo.com/v1/forecast")
    suspend fun getForecast(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("current") current: String = "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index",
        @Query("hourly") hourly: String = "temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,pressure_msl,cloud_cover,wind_speed_10m,wind_gusts_10m,uv_index,soil_temperature_0cm,soil_moisture_0_to_1cm",
        @Query("daily") daily: String = "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,et0_fao_evapotranspiration",
        @Query("timezone") timezone: String = "auto",
        @Query("forecast_days") forecastDays: Int = 14
    ): OpenMeteoResponse

    @GET("https://geocoding-api.open-meteo.com/v1/search")
    suspend fun searchLocations(
        @Query("name") query: String,
        @Query("count") count: Int = 10,
        @Query("language") language: String = "fr",
        @Query("format") format: String = "json",
        @Query("country_code") countryCode: String = "FR"
    ): GeocodingResponse

    @GET("https://air-quality-api.open-meteo.com/v1/air-quality")
    suspend fun getAirQuality(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("current") current: String = "european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index"
    ): AirQualityResponse
}

object NetworkClient {
    private val moshi: Moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.NONE
        })
        .build()

    val api: OpenMeteoApi by lazy {
        Retrofit.Builder()
            .baseUrl("https://api.open-meteo.com/")
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(OpenMeteoApi::class.java)
    }
}
