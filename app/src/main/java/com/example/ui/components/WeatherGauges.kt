package com.example.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.ExtremeCrimson
import com.example.ui.theme.FrostCyan
import com.example.ui.theme.HeatCoral
import com.example.ui.theme.NormalEmerald
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateCard
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.WarmAmber
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun ThermalAnomalyGauge(
    anomaly: Double,
    modifier: Modifier = Modifier
) {
    val animatedAnomaly = remember { Animatable(0f) }

    LaunchedEffect(anomaly) {
        animatedAnomaly.animateTo(
            targetValue = anomaly.toFloat().coerceIn(-8f, 8f),
            animationSpec = tween(durationMillis = 1000, easing = FastOutSlowInEasing)
        )
    }

    val gaugeColor = when {
        anomaly >= 4.0 -> ExtremeCrimson
        anomaly >= 2.0 -> HeatCoral
        anomaly >= 0.8 -> WarmAmber
        anomaly >= -0.8 -> NormalEmerald
        anomaly >= -3.0 -> FrostCyan
        else -> Color(0xFF3B82F6)
    }

    Box(
        modifier = modifier
            .size(160.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize().padding(12.dp)) {
            val strokeWidth = 14.dp.toPx()
            val diameter = size.minDimension - strokeWidth
            val topLeft = Offset((size.width - diameter) / 2, (size.height - diameter) / 2)
            val arcSize = Size(diameter, diameter)

            // Background track (240 degrees arc)
            drawArc(
                color = SlateBorder,
                startAngle = 150f,
                sweepAngle = 240f,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )

            // Zero normal tick marker at the top center (270 degrees)
            val radius = diameter / 2
            val center = Offset(size.width / 2, size.height / 2)
            val zeroAngleRad = Math.toRadians(270.0)
            val tickStart = Offset(
                (center.x + (radius - 12.dp.toPx()) * cos(zeroAngleRad)).toFloat(),
                (center.y + (radius - 12.dp.toPx()) * sin(zeroAngleRad)).toFloat()
            )
            val tickEnd = Offset(
                (center.x + (radius + 12.dp.toPx()) * cos(zeroAngleRad)).toFloat(),
                (center.y + (radius + 12.dp.toPx()) * sin(zeroAngleRad)).toFloat()
            )
            drawLine(
                color = NormalEmerald.copy(alpha = 0.8f),
                start = tickStart,
                end = tickEnd,
                strokeWidth = 3.dp.toPx(),
                cap = StrokeCap.Round
            )

            // Sweep from center (270°) to anomaly position
            // 270° corresponds to 0°C anomaly. -8°C is 150° (-120° sweep), +8°C is 390° (+120° sweep)
            val sweep = (animatedAnomaly.value / 8f) * 120f
            if (sweep >= 0) {
                drawArc(
                    brush = Brush.sweepGradient(
                        0.5f to NormalEmerald,
                        0.75f to gaugeColor,
                        center = center
                    ),
                    startAngle = 270f,
                    sweepAngle = sweep.coerceAtLeast(1f),
                    useCenter = false,
                    topLeft = topLeft,
                    size = arcSize,
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
            } else {
                drawArc(
                    brush = Brush.sweepGradient(
                        0.25f to gaugeColor,
                        0.5f to NormalEmerald,
                        center = center
                    ),
                    startAngle = 270f + sweep,
                    sweepAngle = -sweep.coerceAtMost(-1f),
                    useCenter = false,
                    topLeft = topLeft,
                    size = arcSize,
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
            }
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            val sign = if (anomaly >= 0) "+" else ""
            Text(
                text = "$sign${String.format("%.1f", anomaly)}°C",
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                color = gaugeColor
            )
            Text(
                text = "vs Normales",
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextSecondary
            )
            Text(
                text = "1991-2020",
                fontSize = 10.sp,
                color = TextMuted
            )
        }
    }
}

@Composable
fun WindCompassDial(
    windSpeed: Double,
    windDirection: Double,
    windGusts: Double,
    modifier: Modifier = Modifier
) {
    val cardinal = when (((windDirection + 22.5) % 360 / 45).toInt()) {
        0 -> "N"
        1 -> "NE"
        2 -> "E"
        3 -> "SE"
        4 -> "S"
        5 -> "SO"
        6 -> "O"
        7 -> "NO"
        else -> "N"
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(SlateCard, RoundedCornerShape(16.dp))
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Box(
            modifier = Modifier.size(72.dp),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val center = Offset(size.width / 2, size.height / 2)
                val radius = size.minDimension / 2 - 4.dp.toPx()

                // Dial circle
                drawCircle(
                    color = SlateBorder,
                    radius = radius,
                    center = center,
                    style = Stroke(width = 2.dp.toPx())
                )

                // Cardinal marks (N, E, S, W ticks)
                for (angle in 0 until 360 step 45) {
                    val rad = Math.toRadians(angle.toDouble())
                    val innerR = if (angle % 90 == 0) radius - 8.dp.toPx() else radius - 4.dp.toPx()
                    val p1 = Offset((center.x + innerR * sin(rad)).toFloat(), (center.y - innerR * cos(rad)).toFloat())
                    val p2 = Offset((center.x + radius * sin(rad)).toFloat(), (center.y - radius * cos(rad)).toFloat())
                    drawLine(
                        color = if (angle == 0) ExtremeCrimson else TextMuted,
                        start = p1,
                        end = p2,
                        strokeWidth = if (angle % 90 == 0) 2.dp.toPx() else 1.dp.toPx()
                    )
                }

                // Wind Direction Arrow (pointing to where wind is going)
                val arrowAngleRad = Math.toRadians(windDirection)
                val arrowTip = Offset(
                    (center.x + (radius - 10.dp.toPx()) * sin(arrowAngleRad)).toFloat(),
                    (center.y - (radius - 10.dp.toPx()) * cos(arrowAngleRad)).toFloat()
                )
                val arrowBase = Offset(
                    (center.x - (radius - 14.dp.toPx()) * sin(arrowAngleRad)).toFloat(),
                    (center.y + (radius - 14.dp.toPx()) * cos(arrowAngleRad)).toFloat()
                )
                drawLine(
                    color = FrostCyan,
                    start = arrowBase,
                    end = arrowTip,
                    strokeWidth = 3.5.dp.toPx(),
                    cap = StrokeCap.Round
                )
                drawCircle(color = FrostCyan, radius = 4.dp.toPx(), center = arrowTip)
            }
            Text(
                text = cardinal,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }

        Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = "${windSpeed.toInt()}",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary
                )
                Text(
                    text = " km/h",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextSecondary,
                    modifier = Modifier.padding(bottom = 3.dp)
                )
            }
            Text(
                text = "Vent moyen (${windDirection.toInt()}° $cardinal)",
                fontSize = 12.sp,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "Rafales max : ${windGusts.toInt()} km/h",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (windGusts > 60) ExtremeCrimson else WarmAmber
            )
        }
    }
}
