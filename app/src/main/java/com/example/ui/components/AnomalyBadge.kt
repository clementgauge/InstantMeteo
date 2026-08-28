package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDrop
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
import com.example.data.model.AnomalySeverity
import com.example.data.model.ClimateAnomalyAnalysis
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
fun AnomalyHeaderBadge(
    severity: AnomalySeverity,
    anomalyValue: Double,
    modifier: Modifier = Modifier
) {
    val sign = if (anomalyValue >= 0) "+" else ""
    val badgeColor = Color(severity.colorHex)

    Row(
        modifier = modifier
            .background(badgeColor.copy(alpha = 0.15f), RoundedCornerShape(20.dp))
            .border(1.dp, badgeColor.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
            .padding(horizontal = 14.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(badgeColor, CircleShape)
        )
        Text(
            text = "$sign${String.format("%.1f", anomalyValue)}°C • ${severity.label}",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
    }
}

@Composable
fun ExtremePhenomenaAlertSection(
    anomaly: ClimateAnomalyAnalysis,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Canicule & Vigilance Chaleur
        if (anomaly.isHeatwaveDay || anomaly.heatwaveAlertLevel != "Vert (Normal)") {
            AlertCard(
                icon = Icons.Default.LocalFireDepartment,
                title = "Vigilance Canicule : ${anomaly.heatwaveAlertLevel}",
                description = "Seuils bio-météorologiques dépassés (Tmax ${String.format("%.1f", anomaly.currentTMax)}°C / Tmin ${String.format("%.1f", anomaly.currentTMin)}°C). Risque pour personnes vulnérables.",
                accentColor = ExtremeCrimson
            )
        }

        // Nuit Tropicale
        if (anomaly.isTropicalNight) {
            AlertCard(
                icon = Icons.Default.Thermostat,
                title = "Nuit Tropicale Confirmée (Tmin ≥ 20°C)",
                description = "Température minimale nocturne ne descendant pas sous ${String.format("%.1f", anomaly.currentTMin)}°C, limitant le rafraîchissement des habitations.",
                accentColor = HeatCoral
            )
        }

        // Sécheresse / Bilan hydrique
        if (anomaly.spiValue <= -0.8 || anomaly.precipitationAnomalyPct < -30) {
            AlertCard(
                icon = Icons.Default.WaterDrop,
                title = "Déficit Hydrique : ${anomaly.droughtLevel.label}",
                description = "Anomalie de précipitations à ${String.format("%.0f", anomaly.precipitationAnomalyPct)}% par rapport aux normales. Indice SPI : ${String.format("%.2f", anomaly.spiValue)}.",
                accentColor = WarmAmber
            )
        }

        // Risque Incendies Forêt-Météo (IFM)
        if (anomaly.fireRiskValue >= 30) {
            AlertCard(
                icon = Icons.Default.LocalFireDepartment,
                title = "Alerte Risque Feux : ${anomaly.fireRisk.label}",
                description = "Indice Forêt-Météo à ${anomaly.fireRiskValue}/100 combinant température élevée, faible hygrométrie et vent.",
                accentColor = if (anomaly.fireRiskValue >= 50) ExtremeCrimson else HeatCoral
            )
        }

        // Gel tardif
        if (anomaly.springLateFrostRisk) {
            AlertCard(
                icon = Icons.Default.Warning,
                title = "Risque de Gel Tardif Végétatif",
                description = "Température frôlant ${String.format("%.1f", anomaly.currentTMin)}°C en période de débourrement de la vigne et des arboricultures.",
                accentColor = FrostCyan
            )
        }
    }
}

@Composable
fun AlertCard(
    icon: ImageVector,
    title: String,
    description: String,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCardHighlight, RoundedCornerShape(14.dp))
            .border(1.dp, accentColor.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
            .padding(14.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .background(accentColor.copy(alpha = 0.15f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = accentColor,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Spacer(modifier = Modifier.height(3.dp))
            Text(
                text = description,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                color = TextSecondary
            )
        }
    }
}

@Composable
fun RecordComparisonCard(
    currentTemp: Double,
    allTimeRecord: Double,
    allTimeRecordDate: String,
    modifier: Modifier = Modifier
) {
    val diff = allTimeRecord - currentTemp
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCard, RoundedCornerShape(16.dp))
            .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "Record Absolu Local : ${String.format("%.1f", allTimeRecord)}°C",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Établi lors de $allTimeRecordDate",
                fontSize = 11.sp,
                color = TextMuted
            )
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = if (diff <= 0) "RECORD BATTU !" else "-${String.format("%.1f", diff)}°C",
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                color = if (diff <= 2.0) ExtremeCrimson else WarmAmber
            )
            Text(
                text = if (diff <= 0) "Nouveau sommet" else "du record absolu",
                fontSize = 10.sp,
                color = TextSecondary
            )
        }
    }
}
