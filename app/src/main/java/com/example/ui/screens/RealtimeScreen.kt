package com.example.ui.screens

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Compress
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Opacity
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.repository.CompleteLocationAnalysis
import com.example.ui.components.AnomalyHeaderBadge
import com.example.ui.components.ExtremePhenomenaAlertSection
import com.example.ui.components.HourlyForecastChart
import com.example.ui.components.RecordComparisonCard
import com.example.ui.components.ThermalAnomalyGauge
import com.example.ui.components.WindCompassDial
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.ExtremeCrimson
import com.example.ui.theme.FrostCyan
import com.example.ui.theme.HeatCoral
import com.example.ui.theme.NormalEmerald
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SlateCardHighlight
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.WarmAmber

@Composable
fun RealtimeScreen(
    data: CompleteLocationAnalysis,
    isFahrenheit: Boolean,
    modifier: Modifier = Modifier
) {
    val weather = data.weatherDisplay
    val anomaly = data.anomalyAnalysis
    val location = data.location

    val tempDisplay = if (isFahrenheit) {
        String.format("%.1f°F", weather.temperature * 9 / 5 + 32)
    } else {
        String.format("%.1f°C", weather.temperature)
    }

    val apparentDisplay = if (isFahrenheit) {
        String.format("%.1f°F", weather.apparentTemperature * 9 / 5 + 32)
    } else {
        String.format("%.1f°C", weather.apparentTemperature)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DeepNavy)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Location & Coordinates Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = ElectricBlue,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = location.name,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary
                    )
                }
                Text(
                    text = "${location.department} • ${location.region}",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
                Text(
                    text = "${String.format("%.3f", location.latitude)}°N, ${String.format("%.3f", location.longitude)}°E • Alt ${location.altitude.toInt()}m",
                    fontSize = 11.sp,
                    color = TextMuted
                )
            }

            Box(
                modifier = Modifier
                    .background(SlateCardHighlight, RoundedCornerShape(12.dp))
                    .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "TEMPS RÉEL",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    color = NormalEmerald
                )
            }
        }

        // Anomaly Status Header Badge
        AnomalyHeaderBadge(
            severity = anomaly.severity,
            anomalyValue = anomaly.thermalAnomaly
        )

        // Main Weather Hero Box
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SlateCard, RoundedCornerShape(20.dp))
                .border(1.dp, SlateBorder, RoundedCornerShape(20.dp))
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = weather.weatherIcon,
                    fontSize = 44.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = tempDisplay,
                    fontSize = 42.sp,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary
                )
                Text(
                    text = weather.weatherDescription,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Ressenti $apparentDisplay",
                    fontSize = 12.sp,
                    color = TextMuted
                )
            }

            // Anomaly Dial Gauge
            ThermalAnomalyGauge(
                anomaly = anomaly.thermalAnomaly
            )
        }

        // Extreme Phenomenon Alerts (Heatwave, Drought, Frost, Wildfires)
        ExtremePhenomenaAlertSection(anomaly = anomaly)

        // Wind Compass & Gusts Dial
        WindCompassDial(
            windSpeed = weather.windSpeed,
            windDirection = weather.windDirection,
            windGusts = weather.windGusts
        )

        // Meteorological Metrics Grid
        Text(
            text = "Paramètres Atmosphériques de Précision",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricCard(
                icon = Icons.Default.Opacity,
                title = "Humidité",
                value = "${weather.humidity}%",
                subtitle = "Pt Rosée ${String.format("%.1f", weather.dewPoint)}°C",
                iconColor = FrostCyan,
                modifier = Modifier.weight(1f)
            )
            MetricCard(
                icon = Icons.Default.Compress,
                title = "Pression",
                value = "${weather.pressure.toInt()} hPa",
                subtitle = if (weather.pressure > 1015) "Anticyclonique" else "Dépressionnaire",
                iconColor = ElectricBlue,
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricCard(
                icon = Icons.Default.WbSunny,
                title = "Indice UV",
                value = "${weather.uvIndex}",
                subtitle = if (weather.uvIndex > 6) "Protection requise" else "Modéré",
                iconColor = WarmAmber,
                modifier = Modifier.weight(1f)
            )
            MetricCard(
                icon = Icons.Default.Cloud,
                title = "Nébulosité",
                value = "${weather.cloudCover}%",
                subtitle = "Couverture ciel",
                iconColor = TextSecondary,
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricCard(
                icon = Icons.Default.Air,
                title = "Qualité de l'Air",
                value = "AQI ${weather.airQualityIndex}",
                subtitle = weather.airQualityLabel,
                iconColor = if (weather.airQualityIndex <= 40) NormalEmerald else WarmAmber,
                modifier = Modifier.weight(1f)
            )
            MetricCard(
                icon = Icons.Default.Speed,
                title = "Risque Feux (IFM)",
                value = "${anomaly.fireRiskValue}/100",
                subtitle = anomaly.fireRisk.label,
                iconColor = if (anomaly.fireRiskValue >= 30) ExtremeCrimson else NormalEmerald,
                modifier = Modifier.weight(1f)
            )
        }

        // All-Time Historical Record Benchmark
        RecordComparisonCard(
            currentTemp = weather.temperature,
            allTimeRecord = location.allTimeRecordMax,
            allTimeRecordDate = anomaly.allTimeRecordHighDate
        )

        // 24-Hour Hourly Timeline
        HourlyForecastChart(hourly = data.hourlyData)

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun MetricCard(
    icon: ImageVector,
    title: String,
    value: String,
    subtitle: String,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .background(SlateCard, RoundedCornerShape(16.dp))
            .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextSecondary
            )
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .background(iconColor.copy(alpha = 0.15f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = value,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black,
            color = TextPrimary
        )
        Text(
            text = subtitle,
            fontSize = 11.sp,
            color = TextMuted
        )
    }
}
