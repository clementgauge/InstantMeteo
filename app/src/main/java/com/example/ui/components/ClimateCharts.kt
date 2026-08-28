package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ClimateProjectionScenario
import com.example.data.model.DailyData
import com.example.data.model.HistoricalClimatePoint
import com.example.data.model.HourlyData
import com.example.data.model.MonthlyNormal
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
import com.example.ui.theme.WarmingBlue
import com.example.ui.theme.WarmingDarkRed
import com.example.ui.theme.WarmingLightBlue
import com.example.ui.theme.WarmingNeutral
import com.example.ui.theme.WarmingOrange
import com.example.ui.theme.WarmingRed

@Composable
fun HourlyForecastChart(
    hourly: HourlyData?,
    modifier: Modifier = Modifier
) {
    if (hourly?.time == null || hourly.temperature_2m == null) return

    val count = hourly.time.size.coerceAtMost(24)
    val temps = hourly.temperature_2m.take(count)
    val times = hourly.time.take(count)
    val rainProbs = hourly.precipitation_probability?.take(count) ?: List(count) { 0.0 }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCard, RoundedCornerShape(16.dp))
            .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Évolution Temporelle 24 Heures",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "T°C & Probabilité Pluie",
                fontSize = 11.sp,
                color = TextSecondary
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            for (i in 0 until count) {
                val rawTime = times[i]
                val hourLabel = if (rawTime.contains("T")) {
                    rawTime.substringAfter("T").substring(0, 5)
                } else "$i:00"

                val t = temps[i]
                val p = rainProbs[i].toInt()

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.width(48.dp)
                ) {
                    Text(
                        text = hourLabel,
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "${t.toInt()}°",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (t >= 25) HeatCoral else if (t <= 5) FrostCyan else TextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    // Rain prob pill
                    Box(
                        modifier = Modifier
                            .background(
                                if (p > 30) ElectricBlue.copy(alpha = 0.2f) else SlateBorder.copy(alpha = 0.3f),
                                RoundedCornerShape(8.dp)
                            )
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "$p%",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (p > 30) ElectricBlue else TextMuted
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DailyExtendedForecastList(
    daily: DailyData?,
    normalTMean: Double,
    modifier: Modifier = Modifier
) {
    if (daily?.time == null || daily.temperature_2m_max == null || daily.temperature_2m_min == null) return

    val daysCount = daily.time.size.coerceAtMost(10)

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCard, RoundedCornerShape(16.dp))
            .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Text(
            text = "Évolution Prévisionnelle 10 Jours & Anomalies",
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Écart thermique calculé par rapport aux normales 1991-2020",
            fontSize = 11.sp,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(14.dp))

        for (i in 0 until daysCount) {
            val date = daily.time[i]
            val maxT = daily.temperature_2m_max[i]
            val minT = daily.temperature_2m_min[i]
            val meanT = (maxT + minT) / 2.0
            val dayAnomaly = meanT - normalTMean
            val rainSum = daily.precipitation_sum?.getOrNull(i) ?: 0.0

            val sign = if (dayAnomaly >= 0) "+" else ""
            val anomalyColor = when {
                dayAnomaly >= 4.0 -> ExtremeCrimson
                dayAnomaly >= 1.5 -> HeatCoral
                dayAnomaly >= -1.0 -> NormalEmerald
                else -> FrostCyan
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 7.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.width(90.dp)) {
                    Text(
                        text = formatDateLabel(date, i),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                    Text(
                        text = if (rainSum > 0.5) "${String.format("%.1f", rainSum)} mm" else "Sec",
                        fontSize = 11.sp,
                        color = if (rainSum > 5.0) ElectricBlue else TextMuted
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = "${minT.toInt()}°",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = FrostCyan
                    )

                    // Temperature Range Mini Bar
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .background(SlateBorder, RoundedCornerShape(3.dp))
                    ) {
                        val barFraction = ((maxT - minT) / 25.0).toFloat().coerceIn(0.1f, 1.0f)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(barFraction)
                                .height(6.dp)
                                .background(
                                    Brush.horizontalGradient(listOf(FrostCyan, HeatCoral)),
                                    RoundedCornerShape(3.dp)
                                )
                        )
                    }

                    Text(
                        text = "${maxT.toInt()}°",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = HeatCoral
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Box(
                    modifier = Modifier
                        .background(anomalyColor.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                        .padding(horizontal = 7.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "$sign${String.format("%.1f", dayAnomaly)}°C",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = anomalyColor
                    )
                }
            }
        }
    }
}

@Composable
fun ClimatogramChart(
    normals: List<MonthlyNormal>,
    currentMonth: Int,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCard, RoundedCornerShape(16.dp))
            .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Climatogramme Officiel 1991-2020",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Précipitations (mm) & T°C",
                fontSize = 11.sp,
                color = TextSecondary
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            normals.forEach { month ->
                val isCurrent = month.month == currentMonth
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .width(44.dp)
                        .background(
                            if (isCurrent) SlateCardHighlight else Color.Transparent,
                            RoundedCornerShape(8.dp)
                        )
                        .padding(vertical = 4.dp)
                ) {
                    Text(
                        text = "${month.precipitationMm.toInt()}mm",
                        fontSize = 9.sp,
                        color = ElectricBlue
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    // Rainfall Bar (Height proportional to precipitation)
                    Box(
                        modifier = Modifier
                            .width(14.dp)
                            .height((month.precipitationMm * 0.55).dp.coerceIn(12.dp, 75.dp))
                            .background(ElectricBlue.copy(alpha = if (isCurrent) 0.9f else 0.5f), RoundedCornerShape(4.dp))
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "${month.tMean.toInt()}°",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isCurrent) WarmAmber else TextPrimary
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = month.monthName.take(3),
                        fontSize = 10.sp,
                        fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                        color = if (isCurrent) TextPrimary else TextMuted
                    )
                }
            }
        }
    }
}

@Composable
fun HistoricalWarmingStripesChart(
    series: List<HistoricalClimatePoint>,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCard, RoundedCornerShape(16.dp))
            .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Text(
            text = "Warming Stripes & Réchauffement en France (1950 - 2026)",
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Anomalie annuelle de température moyenne par rapport à l'ère pré-industrielle",
            fontSize = 11.sp,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Stripes Canvas
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .background(DeepNavy, RoundedCornerShape(8.dp))
                .padding(2.dp)
        ) {
            Row(modifier = Modifier.fillMaxSize()) {
                series.forEach { point ->
                    val color = when {
                        point.anomalyVs1961_1990 >= 2.2 -> WarmingDarkRed
                        point.anomalyVs1961_1990 >= 1.5 -> WarmingRed
                        point.anomalyVs1961_1990 >= 0.6 -> WarmingOrange
                        point.anomalyVs1961_1990 >= -0.2 -> WarmingNeutral
                        point.anomalyVs1961_1990 >= -0.7 -> WarmingLightBlue
                        else -> WarmingBlue
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxSize()
                            .background(color)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = "1950 : 11.2°C (-0.7°C)", fontSize = 11.sp, color = FrostCyan)
            Text(text = "+1.9°C en France", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = HeatCoral)
            Text(text = "2026 : 14.5°C (+2.6°C)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ExtremeCrimson)
        }
    }
}

@Composable
fun ClimateProjectionsSection(
    scenarios: List<ClimateProjectionScenario>,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCard, RoundedCornerShape(16.dp))
            .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text(
            text = "Projections Climatiques GIEC / DRIAS pour la France",
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Impacts modélisés selon 3 scénarios socio-économiques à l'horizon 2050 / 2100",
            fontSize = 11.sp,
            color = TextSecondary
        )

        scenarios.forEach { sc ->
            val color = when (sc.scenarioCode) {
                "SSP1-2.6" -> NormalEmerald
                "SSP2-4.5" -> WarmAmber
                else -> ExtremeCrimson
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SlateCardHighlight, RoundedCornerShape(12.dp))
                    .border(1.dp, color.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                    .padding(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = sc.scenarioCode,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        color = color
                    )
                    Text(
                        text = "+${sc.projectedTempIncrease}°C d'ici ${sc.horizon}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = color
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = sc.scenarioName,
                    fontSize = 11.sp,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "Canicules / an", fontSize = 10.sp, color = TextMuted)
                        Text(text = "+${sc.extraHeatwaveDaysPerYear} jours", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    }
                    Column {
                        Text(text = "Nuits tropicales", fontSize = 10.sp, color = TextMuted)
                        Text(text = "+${sc.extraTropicalNightsPerYear} nuits", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    }
                    Column {
                        Text(text = "Pluie d'été", fontSize = 10.sp, color = TextMuted)
                        Text(text = "${sc.summerPrecipitationChangePct}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = ExtremeCrimson)
                    }
                    Column {
                        Text(text = "Sécheresses", fontSize = 10.sp, color = TextMuted)
                        Text(text = "x${sc.droughtFrequencyMultiplier}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WarmAmber)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = sc.agriculturalImpactSummary,
                    fontSize = 11.sp,
                    lineHeight = 15.sp,
                    color = TextSecondary
                )
            }
        }
    }
}

private fun formatDateLabel(dateStr: String, index: Int): String {
    return when (index) {
        0 -> "Aujourd'hui"
        1 -> "Demain"
        else -> {
            if (dateStr.length >= 10) {
                val parts = dateStr.split("-")
                if (parts.size == 3) "${parts[2]}/${parts[1]}" else dateStr
            } else dateStr
        }
    }
}
