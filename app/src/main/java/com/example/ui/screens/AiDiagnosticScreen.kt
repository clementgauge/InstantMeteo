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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Agriculture
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.repository.CompleteLocationAnalysis
import com.example.ui.theme.DeepNavy
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.ExtremeCrimson
import com.example.ui.theme.FrostCyan
import com.example.ui.theme.HeatCoral
import com.example.ui.theme.NormalEmerald
import com.example.ui.theme.PurpleAtmosphere
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SlateCardHighlight
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.WarmAmber
import com.example.ui.viewmodel.ExpertMessage

@Composable
fun AiDiagnosticScreen(
    data: CompleteLocationAnalysis,
    chatMessages: List<ExpertMessage>,
    isExpertResponding: Boolean,
    onAskQuestion: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val diag = data.aiDiagnostic
    val location = data.location
    var inputQuestion by remember { mutableStateOf("") }

    val quickQuestions = listOf(
        "Quelle est l'attribution au réchauffement climatique ?",
        "Y a-t-il un risque d'aggravation de la sécheresse ?",
        "Quels sont les records historiques de cette station ?",
        "Quelles sont les projections d'ici 2050 pour ce secteur ?"
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DeepNavy)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = PurpleAtmosphere,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Synthèse Climatologique IA",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary
                    )
                }
                Text(
                    text = "Analyse synoptique & attribution GIEC par Gemini AI",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }

            Box(
                modifier = Modifier
                    .background(PurpleAtmosphere.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                    .border(1.dp, PurpleAtmosphere.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "EXPERT GIEC",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    color = PurpleAtmosphere
                )
            }
        }

        if (diag != null) {
            // Atmospheric Synoptic Pattern
            AiStructuredCard(
                icon = Icons.Default.Timeline,
                title = "Configuration Synoptique & Dynamique Atmosphérique",
                content = diag.atmosphericPattern,
                color = ElectricBlue
            )

            // Climate Attribution (WWA / IPCC)
            AiStructuredCard(
                icon = Icons.Default.Public,
                title = "Attribution au Changement Climatique Anthropique",
                content = diag.anomalyAttribution,
                color = ExtremeCrimson
            )

            // Statistical Return Period
            AiStructuredCard(
                icon = Icons.Default.History,
                title = "Fréquence Observée & Période de Retour",
                content = diag.returnPeriod,
                color = WarmAmber
            )

            // Territorial Vulnerability & Water
            AiStructuredCard(
                icon = Icons.Default.Warning,
                title = "Vulnérabilité Locale & Bilan Hydrique",
                content = diag.vulnerabilityAssessment,
                color = HeatCoral
            )

            // Agricultural Impact
            AiStructuredCard(
                icon = Icons.Default.Agriculture,
                title = "Impacts sur l'Agriculture & Écosystèmes",
                content = diag.agriculturalAndWaterImpact,
                color = NormalEmerald
            )

            // Climate Trend horizon 2050
            AiStructuredCard(
                icon = Icons.Default.AutoAwesome,
                title = "Perspective d'Évolution Climat 2050",
                content = diag.climateChangeTrend,
                color = PurpleAtmosphere
            )
        }

        // Q&A Climatologist Section
        Text(
            text = "Dialogue Interactif avec le Climatologue IA",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )

        // Quick Suggestion Chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            quickQuestions.forEach { q ->
                Box(
                    modifier = Modifier
                        .background(SlateCardHighlight, RoundedCornerShape(20.dp))
                        .border(1.dp, SlateBorder, RoundedCornerShape(20.dp))
                        .clickable { onAskQuestion(q) }
                        .padding(horizontal = 12.dp, vertical = 7.dp)
                ) {
                    Text(text = q, fontSize = 11.sp, color = TextPrimary)
                }
            }
        }

        // Chat Message History
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(SlateCard, RoundedCornerShape(16.dp))
                .border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            chatMessages.forEach { msg ->
                val isUser = msg.sender == "USER"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(if (isUser) 0.85f else 0.95f)
                            .background(
                                if (isUser) ElectricBlue.copy(alpha = 0.2f) else SlateCardHighlight,
                                RoundedCornerShape(12.dp)
                            )
                            .border(
                                1.dp,
                                if (isUser) ElectricBlue.copy(alpha = 0.4f) else SlateBorder,
                                RoundedCornerShape(12.dp)
                            )
                            .padding(12.dp)
                    ) {
                        Column {
                            Text(
                                text = if (isUser) "Vous" else "Climatologue IA • ${location.name}",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isUser) ElectricBlue else PurpleAtmosphere
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = msg.text,
                                fontSize = 13.sp,
                                lineHeight = 18.sp,
                                color = TextPrimary
                            )
                        }
                    }
                }
            }

            if (isExpertResponding) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp,
                        color = PurpleAtmosphere
                    )
                    Text(
                        text = "Analyse scientifique en cours...",
                        fontSize = 12.sp,
                        color = PurpleAtmosphere
                    )
                }
            }

            // Input Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = inputQuestion,
                    onValueChange = { inputQuestion = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Posez votre question climatique...", fontSize = 12.sp, color = TextMuted) },
                    singleLine = false,
                    maxLines = 3,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = SlateCardHighlight,
                        unfocusedContainerColor = SlateCardHighlight,
                        focusedBorderColor = PurpleAtmosphere,
                        unfocusedBorderColor = SlateBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )

                IconButton(
                    onClick = {
                        if (inputQuestion.isNotBlank()) {
                            val q = inputQuestion
                            inputQuestion = ""
                            onAskQuestion(q)
                        }
                    },
                    modifier = Modifier
                        .size(44.dp)
                        .background(PurpleAtmosphere, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.Send,
                        contentDescription = "Envoyer",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun AiStructuredCard(
    icon: ImageVector,
    title: String,
    content: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCard, RoundedCornerShape(16.dp))
            .border(1.dp, color.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(color.copy(alpha = 0.15f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
            }
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = content,
            fontSize = 13.sp,
            lineHeight = 18.sp,
            color = TextSecondary
        )
    }
}
