package com.example.data.model

data class MonthlyNormal(
    val month: Int, // 1 to 12
    val monthName: String,
    val tMin: Double,
    val tMax: Double,
    val tMean: Double,
    val precipitationMm: Double,
    val sunshineHours: Double,
    val frostDays: Double,
    val hotDaysAbove25: Double
)

data class StationClimateNormals(
    val stationId: String,
    val name: String,
    val department: String,
    val period: String = "1991-2020",
    val monthly: List<MonthlyNormal>,
    val annualTMean: Double,
    val annualPrecipitation: Double,
    val heatwaveThresholdMax: Double,
    val heatwaveThresholdMin: Double
)

enum class AnomalySeverity(val label: String, val colorHex: Long) {
    RECORD_COLD("Record de froid", 0xFF1D3557),
    EXTREME_COLD("Anomalie froide sévère", 0xFF457B9D),
    COLD("Frais / Déficitaire", 0xFF64B5F6),
    NORMAL("Conforme aux normales 1991-2020", 0xFF2A9D8F),
    WARM("Doux / Chaud", 0xFFF4A261),
    HOT("Forte anomalie chaude", 0xFFE76F51),
    EXTREME_HEAT("Chaleur exceptionnelle / Canicule", 0xFFD62828),
    RECORD_HEAT("Record absolu de chaleur", 0xFF9B111E)
}

enum class DroughtIndexLevel(val label: String, val colorHex: Long) {
    VERY_WET("Humidité excessive / Rangs de crue", 0xFF0077B6),
    MODERATELY_WET("Légèrement humide", 0xFF0096C7),
    NORMAL("Humidité des sols normale", 0xFF2A9D8F),
    MILD_DROUGHT("Vigilance sécheresse modérée", 0xFFE9C46A),
    SEVERE_DROUGHT("Sécheresse des sols sévère", 0xFFF4A261),
    EXTREME_DROUGHT("Sécheresse historique critique", 0xFFE63946)
}

enum class FireRiskLevel(val label: String, val colorHex: Long) {
    LOW("Risque Feux Faible", 0xFF2A9D8F),
    MODERATE("Risque Feux Modéré", 0xFFE9C46A),
    HIGH("Risque Feux Élevé (IFM > 25)", 0xFFF4A261),
    VERY_HIGH("Risque Très Élevé (IFM > 40)", 0xFFE76F51),
    EXTREME("Danger Feux Extrême (IFM > 60)", 0xFFD00000)
}

data class ClimateAnomalyAnalysis(
    val referenceStation: String,
    val currentDayOfYear: Int,
    val currentMonth: Int,
    val normalTMean: Double,
    val normalTMax: Double,
    val normalTMin: Double,
    val currentTMean: Double,
    val currentTMax: Double,
    val currentTMin: Double,
    val thermalAnomaly: Double, // currentTMean - normalTMean
    val maxThermalAnomaly: Double, // currentTMax - normalTMax
    val minThermalAnomaly: Double, // currentTMin - normalTMin
    val severity: AnomalySeverity,
    val monthlyPrecipitationToDate: Double,
    val normalMonthlyPrecipitation: Double,
    val precipitationAnomalyPct: Double, // e.g. -45% or +60%
    val droughtLevel: DroughtIndexLevel,
    val spiValue: Double, // Standardized Precipitation Index (-3.0 to +3.0)
    val soilMoistureAnomalyPct: Double,
    val fireRisk: FireRiskLevel,
    val fireRiskValue: Int, // 0 to 100
    val isTropicalNight: Boolean, // Tmin >= 20°C
    val isHeatwaveDay: Boolean,
    val heatwaveAlertLevel: String, // "Vert", "Jaune", "Orange", "Rouge"
    val springLateFrostRisk: Boolean,
    val allTimeRecordHigh: Double,
    val allTimeRecordHighDate: String,
    val diffFromAllTimeRecord: Double,
    val returnPeriodEstimate: String, // e.g. "Événement centennal (1/100 ans)" ou "Récurrent (1/2 ans)"
    val anthropogenicWarmingContribution: Double // e.g. +1.9°C due to global warming
)

data class HistoricalClimatePoint(
    val year: Int,
    val annualMeanTemp: Double,
    val anomalyVs1961_1990: Double,
    val heatwaveDays: Int,
    val frostDays: Int,
    val annualPrecipitationMm: Double
)

data class ClimateProjectionScenario(
    val scenarioCode: String, // "SSP1-2.6", "SSP2-4.5", "SSP5-8.5"
    val scenarioName: String,
    val horizon: Int, // 2030, 2050, 2100
    val projectedTempIncrease: Double, // °C
    val extraTropicalNightsPerYear: Int,
    val extraHeatwaveDaysPerYear: Int,
    val summerPrecipitationChangePct: Int, // e.g. -25%
    val winterPrecipitationChangePct: Int, // e.g. +12%
    val droughtFrequencyMultiplier: Double, // e.g. x3.2
    val agriculturalImpactSummary: String
)

data class AiClimateDiagnostic(
    val atmosphericPattern: String,
    val anomalyAttribution: String,
    val returnPeriod: String,
    val vulnerabilityAssessment: String,
    val agriculturalAndWaterImpact: String,
    val climateChangeTrend: String,
    val rawExpertReport: String
)
