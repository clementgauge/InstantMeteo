package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val ObservatoryDarkColorScheme = darkColorScheme(
    primary = ElectricBlue,
    onPrimary = DeepNavy,
    primaryContainer = SlateCardHighlight,
    onPrimaryContainer = TextPrimary,
    secondary = AccentTeal,
    onSecondary = DeepNavy,
    secondaryContainer = SlateCard,
    onSecondaryContainer = TextPrimary,
    tertiary = WarmAmber,
    onTertiary = DeepNavy,
    background = DeepNavy,
    onBackground = TextPrimary,
    surface = SlateCard,
    onSurface = TextPrimary,
    surfaceVariant = SlateCardHighlight,
    onSurfaceVariant = TextSecondary,
    outline = SlateBorder
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true, // Default to sleek observatory theme
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = ObservatoryDarkColorScheme,
        typography = Typography,
        content = content
    )
}
