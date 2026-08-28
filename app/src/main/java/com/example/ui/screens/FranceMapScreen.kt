package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.FrenchStationsData
import com.example.data.model.GeocodingResult
import com.example.data.model.LocationPoint
import com.example.ui.components.FranceMapCanvas
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.ElectricBlue
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
fun FranceMapScreen(
    currentLocation: LocationPoint,
    searchQuery: String,
    searchResults: List<GeocodingResult>,
    isSearching: Boolean,
    mapLayer: String,
    isOverseasVisible: Boolean,
    onSearchQueryChanged: (String) -> Unit,
    onSearchResultSelected: (GeocodingResult) -> Unit,
    onPointSelected: (Double, Double, String?) -> Unit,
    onStationSelected: (LocationPoint) -> Unit,
    onLayerSelected: (String) -> Unit,
    onToggleOverseas: () -> Unit,
    modifier: Modifier = Modifier
) {
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
                text = "Observatoire Cartographique de France",
                fontSize = 20.sp,
                fontWeight = FontWeight.Black,
                color = TextPrimary
            )
            Text(
                text = "Sélectionnez un point précis sur la carte ou recherchez une commune",
                fontSize = 12.sp,
                color = TextSecondary
            )
        }

        // Search Bar for French Communes & GPS Points
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchQueryChanged,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Rechercher une commune, un col, un cap...", color = TextMuted, fontSize = 13.sp) },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = null,
                    tint = ElectricBlue
                )
            },
            trailingIcon = {
                if (isSearching) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp,
                        color = ElectricBlue
                    )
                } else if (searchQuery.isNotBlank()) {
                    IconButton(onClick = { onSearchQueryChanged("") }) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Effacer", tint = TextMuted)
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = SlateCard,
                unfocusedContainerColor = SlateCard,
                focusedBorderColor = ElectricBlue,
                unfocusedBorderColor = SlateBorder,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            )
        )

        // Autocomplete Results Dropdown List
        if (searchResults.isNotEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SlateCardHighlight, RoundedCornerShape(14.dp))
                    .border(1.dp, ElectricBlue.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
                    .padding(8.dp)
            ) {
                Text(
                    text = "Résultats géographiques (${searchResults.size})",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = ElectricBlue,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
                searchResults.forEach { result ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSearchResultSelected(result) }
                            .padding(horizontal = 8.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = ElectricBlue,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = result.name,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                            val admin = listOfNotNull(result.admin2, result.admin1, result.country).joinToString(", ")
                            Text(
                                text = admin,
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                        Text(
                            text = "${String.format("%.2f", result.latitude)}°N, ${String.format("%.2f", result.longitude)}°E",
                            fontSize = 10.sp,
                            color = TextMuted
                        )
                    }
                }
            }
        }

        // Interactive Vector Map Canvas
        FranceMapCanvas(
            selectedLocation = currentLocation,
            mapLayer = mapLayer,
            onPointSelected = onPointSelected,
            onStationSelected = onStationSelected,
            onLayerSelected = onLayerSelected
        )

        // Predefined French Synoptic Stations Carousel
        Text(
            text = "Stations Synoptiques de Référence",
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            FrenchStationsData.REFERENCE_STATIONS.take(15).forEach { station ->
                val isSelected = station.name == currentLocation.name
                StationBadgeCard(
                    station = station,
                    isSelected = isSelected,
                    onClick = { onStationSelected(station) }
                )
            }
        }

        // Overseas Territories (DOM-TOM) Section
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Territoires d'Outre-Mer (DOM-TOM)",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            FilterChip(
                selected = isOverseasVisible,
                onClick = onToggleOverseas,
                label = { Text(if (isOverseasVisible) "Masquer" else "Afficher", fontSize = 11.sp) },
                leadingIcon = {
                    Icon(imageVector = Icons.Default.Public, contentDescription = null, modifier = Modifier.size(14.dp))
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = ElectricBlue.copy(alpha = 0.2f),
                    selectedLabelColor = ElectricBlue
                )
            )
        }

        if (isOverseasVisible) {
            val overseas = FrenchStationsData.REFERENCE_STATIONS.filter { it.region == "Outre-Mer" }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                overseas.forEach { station ->
                    val isSelected = station.name == currentLocation.name
                    StationBadgeCard(
                        station = station,
                        isSelected = isSelected,
                        onClick = { onStationSelected(station) }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun StationBadgeCard(
    station: LocationPoint,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .width(140.dp)
            .background(if (isSelected) SlateCardHighlight else SlateCard, RoundedCornerShape(14.dp))
            .border(
                1.dp,
                if (isSelected) ElectricBlue else SlateBorder,
                RoundedCornerShape(14.dp)
            )
            .clickable(onClick = onClick)
            .padding(12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(if (isSelected) ElectricBlue else TextMuted, CircleShape)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = station.name.substringBefore("-"),
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                maxLines = 1
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = station.department,
            fontSize = 10.sp,
            color = TextSecondary,
            maxLines = 1
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "Record: ${String.format("%.1f", station.allTimeRecordMax)}°C",
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = HeatCoral
        )
    }
}
