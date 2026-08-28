package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Description
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.repository.CompleteLocationAnalysis
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.ExtremeCrimson
import com.example.ui.theme.NormalEmerald
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SlateCardHighlight
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.WarmAmber

@Composable
fun DossierExportDialog(
    data: CompleteLocationAnalysis,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val loc = data.location
    val weather = data.weatherDisplay
    val anom = data.anomalyAnalysis
    val diag = data.aiDiagnostic

    val reportText = buildString {
        appendLine("=======================================================")
        appendLine("CLIMAFRANCE PRÉCISION • BULLETIN CLIMATIQUE & MÉTÉO")
        appendLine("=======================================================")
        appendLine("📍 POINT : ${loc.name} (${loc.department}, Région ${loc.region})")
        appendLine("🗺️ COORDONNÉES : ${String.format("%.4f", loc.latitude)}°N, ${String.format("%.4f", loc.longitude)}°E | Altitude : ${loc.altitude.toInt()}m")
        appendLine("🏔️ ZONE CLIMATIQUE : ${loc.climateZone}")
        appendLine("⏱️ DATE DU RELEVÉ : ${java.text.SimpleDateFormat("dd/MM/yyyy HH:mm", java.util.Locale.FRANCE).format(java.util.Date())}")
        appendLine("-------------------------------------------------------")
        appendLine("1. OBSERVATIONS EN TEMPS RÉEL")
        appendLine("• Température : ${weather.temperature}°C (Ressenti : ${weather.apparentTemperature}°C)")
        appendLine("• Conditions : ${weather.weatherDescription} (${weather.weatherIcon})")
        appendLine("• Humidité : ${weather.humidity}% | Point de rosée : ${String.format("%.1f", weather.dewPoint)}°C")
        appendLine("• Pression : ${weather.pressure.toInt()} hPa")
        appendLine("• Vent : ${weather.windSpeed.toInt()} km/h (Rafales : ${weather.windGusts.toInt()} km/h, Direction : ${weather.windDirection.toInt()}°)")
        appendLine("• Précipitations : ${weather.precipitation} mm/h | Nébulosité : ${weather.cloudCover}%")
        appendLine("• Indice UV : ${weather.uvIndex} | Qualité de l'air : AQI ${weather.airQualityIndex} (${weather.airQualityLabel})")
        appendLine("-------------------------------------------------------")
        appendLine("2. DIAGNOSTIC D'ANOMALIE (NORMALES 1991-2020)")
        appendLine("• Écart thermique instantané : ${if (anom.thermalAnomaly >= 0) "+" else ""}${String.format("%.1f", anom.thermalAnomaly)}°C (${anom.severity.label})")
        appendLine("• Normale de référence du mois : ${String.format("%.1f", anom.normalTMean)}°C (Tmax ${String.format("%.1f", anom.normalTMax)}°C, Tmin ${String.format("%.1f", anom.normalTMin)}°C)")
        appendLine("• Précipitations cumulées : Écart de ${String.format("%.1f", anom.precipitationAnomalyPct)}% (SPI : ${String.format("%.2f", anom.spiValue)} - ${anom.droughtLevel.label})")
        appendLine("• Indice Forêt-Météo (IFM) : ${anom.fireRiskValue}/100 (${anom.fireRisk.label})")
        appendLine("• Statut Canicule : ${if (anom.isHeatwaveDay) "OUI" else "NON"} | Nuit tropicale : ${if (anom.isTropicalNight) "OUI" else "NON"}")
        appendLine("• Record absolu local : ${String.format("%.1f", loc.allTimeRecordMax)}°C (Écart : -${String.format("%.1f", loc.allTimeRecordMax - weather.temperature)}°C)")
        appendLine("• Période de retour estimée : ${anom.returnPeriodEstimate}")
        if (diag != null) {
            appendLine("-------------------------------------------------------")
            appendLine("3. SYNTHÈSE SCIENTIFIQUE DE L'EXPERT CLIMATOLOGUE IA")
            appendLine("• Schéma synoptique : ${diag.atmosphericPattern}")
            appendLine("• Attribution GIEC : ${diag.anomalyAttribution}")
            appendLine("• Impacts agriculture & eau : ${diag.agriculturalAndWaterImpact}")
            appendLine("• Tendance horizon 2050 : ${diag.climateChangeTrend}")
        }
        appendLine("=======================================================")
        appendLine("Généré par ClimaFrance Précision • Données Météo-France / Open-Meteo")
    }

    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(SlateCard, RoundedCornerShape(20.dp))
                .border(1.dp, SlateBorder, RoundedCornerShape(20.dp))
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Description,
                        contentDescription = null,
                        tint = ElectricBlue,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Bulletin Scientifique",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }

                IconButton(onClick = onDismiss) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Fermer", tint = TextMuted)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(320.dp)
                    .background(DeepNavy, RoundedCornerShape(12.dp))
                    .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
                    .padding(12.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = reportText,
                    fontSize = 11.sp,
                    lineHeight = 15.sp,
                    fontFamily = FontFamily.Monospace,
                    color = TextSecondary
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    val clip = ClipData.newPlainText("Bulletin ClimaFrance", reportText)
                    clipboard.setPrimaryClip(clip)
                    Toast.makeText(context, "Bulletin copié dans le presse-papier !", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = ElectricBlue,
                    contentColor = DeepNavy
                )
            ) {
                Icon(imageVector = Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Copier le Bulletin d'Expert", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }
    }
}
