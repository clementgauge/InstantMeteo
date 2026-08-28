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
import androidx.compose.material.icons.automirrored.filled.CompareArrows
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.FrenchNormalsData
import com.example.data.repository.CompleteLocationAnalysis
import com.example.ui.components.ClimatogramChart
import com.example.ui.components.ExtremePhenomenaAlertSection
import com.example.ui.components.RecordComparisonCard
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
fun ClimateAnomaliesScreen(
    data: CompleteLocationAnalysis,
    modifier: Modifier = Modifier
) {
    val anomaly = data.anomalyAnalysis
    val location = data.location
    val normals = FrenchNormalsData.getNormalsForStation(location.name, location.latitude, location.longitude)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DeepNavy)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Title Header
        Column {
            Text(
                text = "Diagnostic d'Anomalies Climatiques",
                fontSize = 20.sp,
                fontWeight = FontWeight.Black,
                color = TextPrimary
            )
            Text(
                text = "Comparaison aux normales officielles 1991-2020 de Météo-France",
                fontSize = 12.sp,
                color = TextSecondary
            )
        }

        // Hero Anomaly Card
        val sign = if (anomaly.thermalAnomaly >= 0) "+" else ""
        val anomColor = Color(anomaly.severity.colorHex)

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(SlateCard, RoundedCornerShape(20.dp))
                .border(1.dp, anomColor.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "ÉCART THERMIQUE GLOBAL",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextSecondary
                    )
                    Text(
                        text = "$sign${String.format("%.1f", anomaly.thermalAnomaly)}°C",
                        fontSize = 38.sp,
                        fontWeight = FontWeight.Black,
                        color = anomColor
                    )
                }

                Box(
                    modifier = Modifier
                        .background(anomColor.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = anomaly.severity.label,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = anomColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Thermal Breakdown Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                AnomalySubCard(
                    title = "T° Max Actuelle",
                    value = "${String.format("%.1f", anomaly.currentTMax)}°C",
                    normalValue = "Normale: ${String.format("%.1f", anomaly.normalTMax)}°C",
                    diff = "${if (anomaly.maxThermalAnomaly >= 0) "+" else ""}${String.format("%.1f", anomaly.maxThermalAnomaly)}°C",
                    diffColor = if (anomaly.maxThermalAnomaly >= 2.0) HeatCoral else NormalEmerald,
                    modifier = Modifier.weight(1f)
                )
                AnomalySubCard(
                    title = "T° Min Actuelle",
                    value = "${String.format("%.1f", anomaly.currentTMin)}°C",
                    normalValue = "Normale: ${String.format("%.1f", anomaly.normalTMin)}°C",
                    diff = "${if (anomaly.minThermalAnomaly >= 0) "+" else ""}${String.format("%.1f", anomaly.minThermalAnomaly)}°C",
                    diffColor = if (anomaly.minThermalAnomaly >= 2.0) HeatCoral else FrostCyan,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Extreme Phenomenon Alerts
        ExtremePhenomenaAlertSection(anomaly = anomaly)

        // Scientific Indicators Matrix (SPI, IFM, Return Period, Warming Contribution)
        Text(
            text = "Indicateurs Bioclimatiques & Rareté Statistique",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            IndicatorCard(
                icon = Icons.Default.WaterDrop,
                title = "Indice Sécheresse SPI",
                value = String.format("%.2f", anomaly.spiValue),
                status = anomaly.droughtLevel.label,
                color = if (anomaly.spiValue < -1.0) ExtremeCrimson else ElectricBlue,
                modifier = Modifier.weight(1f)
            )
            IndicatorCard(
                icon = Icons.Default.LocalFireDepartment,
                title = "Indice Forêt-Météo",
                value = "${anomaly.fireRiskValue}/100",
                status = anomaly.fireRisk.label,
                color = if (anomaly.fireRiskValue >= 30) HeatCoral else NormalEmerald,
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            IndicatorCard(
                icon = Icons.AutoMirrored.Filled.CompareArrows,
                title = "Période de Retour",
                value = anomaly.returnPeriodEstimate,
                status = "Fréquence statistique estimée",
                color = WarmAmber,
                modifier = Modifier.weight(1f)
            )
            IndicatorCard(
                icon = Icons.Default.Public,
                title = "Attribution GIEC",
                value = "+1.9°C",
                status = "Réchauffement anthropique France",
                color = ExtremeCrimson,
                modifier = Modifier.weight(1f)
            )
        }

        // Climatogram 1991-2020 Reference Chart
        ClimatogramChart(
            normals = normals.monthly,
            currentMonth = anomaly.currentMonth
        )

        // All-Time Records Benchmark
        RecordComparisonCard(
            currentTemp = data.weatherDisplay.temperature,
            allTimeRecord = location.allTimeRecordMax,
            allTimeRecordDate = anomaly.allTimeRecordHighDate
        )

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun AnomalySubCard(
    title: String,
    value: String,
    normalValue: String,
    diff: String,
    diffColor: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .background(SlateCardHighlight, RoundedCornerShape(12.dp))
            .padding(12.dp)
    ) {
        Text(text = title, fontSize = 11.sp, color = TextSecondary)
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Black, color = TextPrimary)
        Text(text = normalValue, fontSize = 10.sp, color = TextMuted)
        Spacer(modifier = Modifier.height(6.dp))
        Box(
            modifier = Modifier
                .background(diffColor.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Text(text = diff, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = diffColor)
        }
    }
}

@Composable
fun IndicatorCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    value: String,
    status: String,
    color: Color,
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
            Text(text = title, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
            Box(
                modifier = Modifier
                    .size(26.dp)
                    .background(color.copy(alpha = 0.15f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(14.dp))
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = value, fontSize = 16.sp, fontWeight = FontWeight.Black, color = TextPrimary)
        Text(text = status, fontSize = 11.sp, color = color, lineHeight = 14.sp)
    }
}
