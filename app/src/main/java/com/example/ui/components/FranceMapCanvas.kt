package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.FrenchStationsData
import com.example.data.model.LocationPoint
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

// Bounding box for Metropolitan France + Corsica
// Latitudes: 41.3°N (South Corsica) to 51.1°N (Dunkerque)
// Longitudes: -5.2°E (Brest/Ouessant) to 9.6°E (Bastia)
const val MIN_LAT = 41.3
const val MAX_LAT = 51.2
const val MIN_LON = -5.4
const val MAX_LON = 9.8

@Composable
fun FranceMapCanvas(
    selectedLocation: LocationPoint,
    mapLayer: String, // "TEMPERATURE", "ANOMALY", "PRECIPITATION", "FIRE_RISK"
    onPointSelected: (Double, Double, String?) -> Unit,
    onStationSelected: (LocationPoint) -> Unit,
    onLayerSelected: (String) -> Unit,
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
            Column {
                Text(
                    text = "Carte de Précision France & Points Météo",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "Touchez n'importe quel point précis ou station",
                    fontSize = 11.sp,
                    color = TextSecondary
                )
            }

            Box(
                modifier = Modifier
                    .background(ElectricBlue.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "${FrenchStationsData.REFERENCE_STATIONS.size} Stations Réf.",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = ElectricBlue
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Layer selection chips
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            FilterChip(
                selected = mapLayer == "TEMPERATURE",
                onClick = { onLayerSelected("TEMPERATURE") },
                label = { Text("T°C", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = HeatCoral.copy(alpha = 0.2f),
                    selectedLabelColor = HeatCoral
                )
            )
            FilterChip(
                selected = mapLayer == "ANOMALY",
                onClick = { onLayerSelected("ANOMALY") },
                label = { Text("Anomalies", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = ExtremeCrimson.copy(alpha = 0.2f),
                    selectedLabelColor = ExtremeCrimson
                )
            )
            FilterChip(
                selected = mapLayer == "PRECIPITATION",
                onClick = { onLayerSelected("PRECIPITATION") },
                label = { Text("Pluie", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = ElectricBlue.copy(alpha = 0.2f),
                    selectedLabelColor = ElectricBlue
                )
            )
            FilterChip(
                selected = mapLayer == "FIRE_RISK",
                onClick = { onLayerSelected("FIRE_RISK") },
                label = { Text("Risque Feux", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = WarmAmber.copy(alpha = 0.2f),
                    selectedLabelColor = WarmAmber
                )
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Interactive Map Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1.05f)
                .background(DeepNavy, RoundedCornerShape(12.dp))
                .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
        ) {
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .pointerInput(Unit) {
                        detectTapGestures { offset ->
                            val mapW = size.width
                            val mapH = size.height

                            val lon = MIN_LON + (offset.x / mapW) * (MAX_LON - MIN_LON)
                            val lat = MAX_LAT - (offset.y / mapH) * (MAX_LAT - MIN_LAT)

                            // Check if tapped near an existing station (< 28 pixels)
                            val tappedStation = FrenchStationsData.REFERENCE_STATIONS.find { st ->
                                val stX = ((st.longitude - MIN_LON) / (MAX_LON - MIN_LON) * mapW).toFloat()
                                val stY = ((MAX_LAT - st.latitude) / (MAX_LAT - MIN_LAT) * mapH).toFloat()
                                val dist = Math.hypot((offset.x - stX).toDouble(), (offset.y - stY).toDouble())
                                dist < 28
                            }

                            if (tappedStation != null) {
                                onStationSelected(tappedStation)
                            } else {
                                onPointSelected(lat, lon, null)
                            }
                        }
                    }
            ) {
                val mapW = size.width
                val mapH = size.height

                fun lonToX(lon: Double) = ((lon - MIN_LON) / (MAX_LON - MIN_LON) * mapW).toFloat()
                fun latToY(lat: Double) = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT) * mapH).toFloat()

                // Draw simplified Hexagon / France Outline & Coastal Polygon
                val franceCoast = listOf(
                    Pair(51.05, 2.37), // Dunkerque
                    Pair(50.95, 1.85), // Calais
                    Pair(50.10, 1.50), // Baie de Somme
                    Pair(49.70, 0.20), // Étretat
                    Pair(49.40, -0.40), // Ouistreham
                    Pair(49.65, -1.60), // Cherbourg
                    Pair(48.65, -1.50), // Mont-Saint-Michel
                    Pair(48.70, -3.50), // Perros-Guirec
                    Pair(48.45, -4.75), // Pointe de Corsen / Le Conquet
                    Pair(48.05, -4.70), // Pointe du Raz
                    Pair(47.55, -3.00), // Quiberon
                    Pair(47.20, -2.30), // Guérande / Pornic
                    Pair(46.50, -1.80), // Les Sables-d'Olonne
                    Pair(46.15, -1.15), // La Rochelle
                    Pair(45.55, -1.05), // Royan
                    Pair(44.65, -1.25), // Arcachon / Dune du Pilat
                    Pair(43.50, -1.55), // Biarritz
                    Pair(43.35, -1.75), // Hendaye (Frontière Espagne)
                    // Pyrénées
                    Pair(42.80, 0.00), // Gavarnie
                    Pair(42.45, 2.80), // Cerbère (Frontière Méditerranée)
                    // Méditerranée
                    Pair(43.10, 3.10), // Narbonne
                    Pair(43.55, 4.20), // Le Grau-du-Roi
                    Pair(43.30, 5.35), // Marseille
                    Pair(43.10, 6.00), // Toulon / Hyères
                    Pair(43.55, 7.00), // Cannes
                    Pair(43.70, 7.25), // Nice
                    Pair(43.78, 7.50), // Menton (Frontière Italie)
                    // Alpes & Jura
                    Pair(44.30, 6.90), // Mercantour
                    Pair(45.20, 6.90), // Vanoise
                    Pair(45.95, 6.85), // Chamonix Mont-Blanc
                    Pair(46.40, 6.10), // Léman / Saint-Gingolph
                    Pair(47.50, 7.20), // Bâle / Jura alsacien
                    // Alsace & Vosges & Nord-Est
                    Pair(48.60, 7.75), // Strasbourg / Rhin
                    Pair(49.05, 8.20), // Lauterbourg
                    Pair(49.50, 6.00), // Thionville
                    Pair(49.95, 4.80), // Givet / Pointe des Ardennes
                    Pair(50.40, 3.80), // Maubeuge
                    Pair(51.05, 2.37)  // Dunkerque (fermeture)
                )

                // Fill Hexagone land background
                val path = Path()
                franceCoast.forEachIndexed { idx, point ->
                    val x = lonToX(point.second)
                    val y = latToY(point.first)
                    if (idx == 0) path.moveTo(x, y) else path.lineTo(x, y)
                }
                path.close()

                // Draw landmass with subtle gradient
                drawPath(
                    path = path,
                    brush = Brush.radialGradient(
                        colors = listOf(SlateCardHighlight, SlateCard),
                        center = Offset(lonToX(2.5), latToY(46.5)),
                        radius = mapW * 0.6f
                    )
                )
                drawPath(
                    path = path,
                    color = SlateBorder,
                    style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                )

                // Draw Corsica Island
                val corsicaCoast = listOf(
                    Pair(43.00, 9.40), // Cap Corse
                    Pair(42.60, 9.45), // Bastia
                    Pair(41.90, 9.40), // Aléria
                    Pair(41.40, 9.15), // Bonifacio
                    Pair(41.90, 8.70), // Ajaccio
                    Pair(42.55, 8.75), // Calvi
                    Pair(43.00, 9.40)
                )
                val corsicaPath = Path()
                corsicaCoast.forEachIndexed { idx, point ->
                    val x = lonToX(point.second)
                    val y = latToY(point.first)
                    if (idx == 0) corsicaPath.moveTo(x, y) else corsicaPath.lineTo(x, y)
                }
                corsicaPath.close()
                drawPath(path = corsicaPath, color = SlateCardHighlight)
                drawPath(path = corsicaPath, color = SlateBorder, style = Stroke(width = 1.5.dp.toPx()))

                // Draw Grid & Lat/Lon reference axes
                drawLine(
                    color = SlateBorder.copy(alpha = 0.4f),
                    start = Offset(0f, latToY(45.0)),
                    end = Offset(mapW, latToY(45.0)),
                    strokeWidth = 1.dp.toPx()
                )
                drawLine(
                    color = SlateBorder.copy(alpha = 0.4f),
                    start = Offset(lonToX(2.0), 0f),
                    end = Offset(lonToX(2.0), mapH),
                    strokeWidth = 1.dp.toPx()
                )

                // Draw Reference Station markers
                FrenchStationsData.REFERENCE_STATIONS.forEach { station ->
                    val sx = lonToX(station.longitude)
                    val sy = latToY(station.latitude)
                    val isSelected = (station.name == selectedLocation.name)

                    val markerColor = when (mapLayer) {
                        "TEMPERATURE" -> {
                            val estT = 18.0 + (50.0 - station.latitude) * 0.8
                            if (estT > 25) ExtremeCrimson else if (estT > 20) HeatCoral else NormalEmerald
                        }
                        "ANOMALY" -> {
                            val anom = (station.latitude * 3.7) % 5.0 - 1.0
                            if (anom > 3.0) ExtremeCrimson else if (anom > 1.0) HeatCoral else NormalEmerald
                        }
                        "PRECIPITATION" -> {
                            if (station.name.contains("Brest") || station.name.contains("Biarritz")) ElectricBlue else FrostCyan
                        }
                        else -> {
                            if (station.name.contains("Marseille") || station.name.contains("Perpignan")) ExtremeCrimson else WarmAmber
                        }
                    }

                    if (isSelected) {
                        drawCircle(
                            color = ElectricBlue.copy(alpha = 0.35f),
                            radius = 16.dp.toPx(),
                            center = Offset(sx, sy)
                        )
                        drawCircle(
                            color = Color.White,
                            radius = 7.dp.toPx(),
                            center = Offset(sx, sy)
                        )
                    }

                    drawCircle(
                        color = markerColor,
                        radius = if (isSelected) 5.dp.toPx() else 4.dp.toPx(),
                        center = Offset(sx, sy)
                    )
                }

                // If user selected a custom point (not pre-defined station)
                if (selectedLocation.isCustomPoint) {
                    val cx = lonToX(selectedLocation.longitude)
                    val cy = latToY(selectedLocation.latitude)

                    drawCircle(
                        color = ElectricBlue.copy(alpha = 0.4f),
                        radius = 18.dp.toPx(),
                        center = Offset(cx, cy)
                    )
                    drawCircle(
                        color = ElectricBlue,
                        radius = 6.dp.toPx(),
                        center = Offset(cx, cy)
                    )
                }
            }

            // Top overlay badge of selected point
            Box(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(10.dp)
                    .background(SlateCard.copy(alpha = 0.9f), RoundedCornerShape(10.dp))
                    .border(1.dp, SlateBorder, RoundedCornerShape(10.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = ElectricBlue,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Column {
                        Text(
                            text = selectedLocation.name,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "${String.format("%.2f", selectedLocation.latitude)}°N, ${String.format("%.2f", selectedLocation.longitude)}°E • Alt ${selectedLocation.altitude.toInt()}m",
                            fontSize = 10.sp,
                            color = TextSecondary
                        )
                    }
                }
            }
        }
    }
}
