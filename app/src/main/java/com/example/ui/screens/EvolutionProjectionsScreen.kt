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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Agriculture
import androidx.compose.material.icons.filled.DownhillSkiing
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.WaterDamage
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.repository.CompleteLocationAnalysis
import com.example.ui.components.ClimateProjectionsSection
import com.example.ui.components.DailyExtendedForecastList
import com.example.ui.components.HistoricalWarmingStripesChart
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
fun EvolutionProjectionsScreen(
    data: CompleteLocationAnalysis,
    modifier: Modifier = Modifier
) {
    val location = data.location
    val anomaly = data.anomalyAnalysis

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DeepNavy)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Column {
            Text(
                text = "Évolution Temporelle & Projections GIEC",
                fontSize = 20.sp,
                fontWeight = FontWeight.Black,
                color = TextPrimary
            )
            Text(
                text = "Trajectoire météo 10 jours et modélisations climatiques 1950 - 2100",
                fontSize = 12.sp,
                color = TextSecondary
            )
        }

        // 10-Day Forecast List with Anomaly Bars
        DailyExtendedForecastList(
            daily = data.dailyData,
            normalTMean = anomaly.normalTMean
        )

        // Historical Warming Stripes (1950 - 2026)
        HistoricalWarmingStripesChart(series = data.historicalSeries)

        // Key Climatic Evolution Stats Card
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(SlateCard, RoundedCornerShape(16.dp))
                .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .background(HeatCoral.copy(alpha = 0.15f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.TrendingUp,
                        contentDescription = null,
                        tint = HeatCoral,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Column {
                    Text(
                        text = "Évolution Observée en France depuis 1900",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Données combinées Météo-France & Copernicus",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                EvolutionStatItem(
                    label = "Réchauffement moyen",
                    value = "+1.9°C",
                    sub = "(+0.36°C / décennie)",
                    color = ExtremeCrimson
                )
                EvolutionStatItem(
                    label = "Journées Caniculaires",
                    value = "x3.5",
                    sub = "par rapport à 1970",
                    color = HeatCoral
                )
                EvolutionStatItem(
                    label = "Jours de Gel",
                    value = "-16 jours",
                    sub = "par an en moyenne",
                    color = FrostCyan
                )
            }
        }

        // IPCC / DRIAS Scenarios Section (SSP1-2.6, SSP2-4.5, SSP5-8.5)
        ClimateProjectionsSection(scenarios = data.climateProjections)

        // Sector Impacts Breakdown
        Text(
            text = "Impacts Sectoriels pour la Région ${location.region}",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )

        SectorImpactCard(
            icon = Icons.Default.Agriculture,
            title = "Agriculture & Viticulture",
            description = "Avancement de la phénologie des cultures de 15 à 25 jours. Augmentation de la vulnérabilité au gel tardif après débourrement précoce et tension sur l'irrigation.",
            color = NormalEmerald
        )

        SectorImpactCard(
            icon = Icons.Default.WaterDamage,
            title = "Ressources en Eau & Étiages",
            description = "Baisse des débits d'étiage estivaux de -20% à -40% sur les bassins versants français. Intensification ponctuelle des épisodes méditerranéens / cévenols.",
            color = ElectricBlue
        )

        SectorImpactCard(
            icon = Icons.Default.DownhillSkiing,
            title = "Montagne & Enneigement",
            description = "Remontée de l'isotherme 0°C et réduction de la couverture neigeuse sous 1800m d'altitude. Recul rapide des glaciers alpins (-70% de masse d'ici 2050).",
            color = FrostCyan
        )

        SectorImpactCard(
            icon = Icons.Default.LocalFireDepartment,
            title = "Extension de la Zone de Risque Feux",
            description = "Propagation du risque feux de forêt vers le Centre, les Pays de la Loire et le Bassin Parisien dès l'horizon 2040.",
            color = WarmAmber
        )

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun EvolutionStatItem(
    label: String,
    value: String,
    sub: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Text(text = label, fontSize = 11.sp, color = TextSecondary)
        Spacer(modifier = Modifier.height(2.dp))
        Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Black, color = color)
        Text(text = sub, fontSize = 10.sp, color = TextMuted)
    }
}

@Composable
fun SectorImpactCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCard, RoundedCornerShape(14.dp))
            .border(1.dp, SlateBorder, RoundedCornerShape(14.dp))
            .padding(14.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(34.dp)
                .background(color.copy(alpha = 0.15f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
        }
        Spacer(modifier = Modifier.padding(horizontal = 6.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            Spacer(modifier = Modifier.height(3.dp))
            Text(text = description, fontSize = 12.sp, lineHeight = 16.sp, color = TextSecondary)
        }
    }
}
