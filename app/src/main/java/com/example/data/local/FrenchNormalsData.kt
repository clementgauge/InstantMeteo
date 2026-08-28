package com.example.data.local

import com.example.data.model.ClimateProjectionScenario
import com.example.data.model.HistoricalClimatePoint
import com.example.data.model.MonthlyNormal
import com.example.data.model.StationClimateNormals
import java.util.Calendar

object FrenchNormalsData {

    private val MONTH_NAMES = listOf(
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    )

    // Climatological normals 1991-2020 for Paris-Montsouris
    val PARIS_NORMALS = StationClimateNormals(
        stationId = "75056001",
        name = "Paris-Montsouris",
        department = "75 - Paris",
        annualTMean = 12.8,
        annualPrecipitation = 634.3,
        heatwaveThresholdMax = 31.0,
        heatwaveThresholdMin = 21.0,
        monthly = listOf(
            MonthlyNormal(1, "Janvier", 2.8, 7.6, 5.2, 47.6, 62.5, 7.8, 0.0),
            MonthlyNormal(2, "Février", 2.8, 8.8, 5.8, 41.8, 79.2, 7.1, 0.0),
            MonthlyNormal(3, "Mars", 5.3, 12.8, 9.1, 45.2, 128.9, 2.3, 0.2),
            MonthlyNormal(4, "Avril", 7.3, 16.6, 12.0, 43.1, 166.0, 0.3, 2.0),
            MonthlyNormal(5, "Mai", 10.9, 20.2, 15.6, 60.5, 193.8, 0.0, 6.7),
            MonthlyNormal(6, "Juin", 14.1, 23.4, 18.8, 51.4, 202.1, 0.0, 11.5),
            MonthlyNormal(7, "Juillet", 16.2, 25.8, 21.0, 58.9, 212.2, 0.0, 17.1),
            MonthlyNormal(8, "Août", 16.0, 25.6, 20.8, 52.7, 212.1, 0.0, 16.5),
            MonthlyNormal(9, "Septembre", 13.0, 21.8, 17.4, 49.3, 167.9, 0.0, 8.4),
            MonthlyNormal(10, "Octobre", 9.8, 16.7, 13.3, 53.7, 117.8, 0.1, 1.2),
            MonthlyNormal(11, "Novembre", 6.0, 11.3, 8.7, 51.1, 67.7, 2.0, 0.0),
            MonthlyNormal(12, "Décembre", 3.4, 8.1, 5.8, 59.0, 51.4, 6.5, 0.0)
        )
    )

    // Climatological normals 1991-2020 for Marseille-Marignane
    val MARSEILLE_NORMALS = StationClimateNormals(
        stationId = "13054001",
        name = "Marseille-Marignane",
        department = "13 - Bouches-du-Rhône",
        annualTMean = 15.9,
        annualPrecipitation = 532.3,
        heatwaveThresholdMax = 35.0,
        heatwaveThresholdMin = 24.0,
        monthly = listOf(
            MonthlyNormal(1, "Janvier", 3.0, 11.8, 7.4, 48.0, 150.0, 6.9, 0.0),
            MonthlyNormal(2, "Février", 3.4, 12.9, 8.2, 31.4, 175.5, 5.2, 0.0),
            MonthlyNormal(3, "Mars", 6.0, 16.2, 11.1, 30.4, 237.5, 1.2, 0.3),
            MonthlyNormal(4, "Avril", 8.9, 19.0, 14.0, 54.0, 247.7, 0.1, 2.8),
            MonthlyNormal(5, "Mai", 12.8, 23.3, 18.1, 41.1, 292.0, 0.0, 11.4),
            MonthlyNormal(6, "Juin", 16.8, 27.9, 22.4, 25.3, 329.0, 0.0, 23.7),
            MonthlyNormal(7, "Juillet", 19.3, 30.8, 25.1, 10.6, 369.0, 0.0, 29.5),
            MonthlyNormal(8, "Août", 19.3, 30.7, 25.0, 24.6, 327.4, 0.0, 29.1),
            MonthlyNormal(9, "Septembre", 15.6, 26.2, 20.9, 64.1, 258.4, 0.0, 20.1),
            MonthlyNormal(10, "Octobre", 11.9, 21.1, 16.5, 73.8, 177.1, 0.0, 4.3),
            MonthlyNormal(11, "Novembre", 7.2, 15.6, 11.4, 76.9, 152.3, 1.3, 0.0),
            MonthlyNormal(12, "Décembre", 3.8, 12.4, 8.1, 52.1, 137.6, 5.0, 0.0)
        )
    )

    // Climatological normals 1991-2020 for Lyon-Bron
    val LYON_NORMALS = StationClimateNormals(
        stationId = "69029001",
        name = "Lyon-Bron",
        department = "69 - Rhône",
        annualTMean = 12.8,
        annualPrecipitation = 831.9,
        heatwaveThresholdMax = 34.0,
        heatwaveThresholdMin = 20.0,
        monthly = listOf(
            MonthlyNormal(1, "Janvier", 1.1, 6.9, 4.0, 49.9, 70.0, 10.6, 0.0),
            MonthlyNormal(2, "Février", 1.4, 8.9, 5.2, 41.6, 102.0, 9.1, 0.0),
            MonthlyNormal(3, "Mars", 4.2, 13.8, 9.0, 49.4, 174.0, 3.8, 0.5),
            MonthlyNormal(4, "Avril", 7.2, 17.4, 12.3, 65.8, 197.0, 0.6, 3.0),
            MonthlyNormal(5, "Mai", 11.2, 21.5, 16.4, 70.9, 224.0, 0.0, 8.9),
            MonthlyNormal(6, "Juin", 15.0, 25.6, 20.3, 67.2, 254.0, 0.0, 17.5),
            MonthlyNormal(7, "Juillet", 17.0, 28.2, 22.6, 65.7, 283.0, 0.0, 24.1),
            MonthlyNormal(8, "Août", 16.6, 28.0, 22.3, 62.0, 253.0, 0.0, 22.9),
            MonthlyNormal(9, "Septembre", 12.8, 23.1, 18.0, 77.3, 195.0, 0.0, 11.2),
            MonthlyNormal(10, "Octobre", 9.6, 17.7, 13.7, 97.4, 121.0, 0.3, 1.8),
            MonthlyNormal(11, "Novembre", 4.9, 11.1, 8.0, 82.8, 67.0, 3.8, 0.0),
            MonthlyNormal(12, "Décembre", 1.9, 7.5, 4.7, 61.9, 54.0, 8.8, 0.0)
        )
    )

    // Climatological normals 1991-2020 for Brest-Guipavas
    val BREST_NORMALS = StationClimateNormals(
        stationId = "29075001",
        name = "Brest-Guipavas",
        department = "29 - Finistère",
        annualTMean = 11.3,
        annualPrecipitation = 1209.8,
        heatwaveThresholdMax = 30.0,
        heatwaveThresholdMin = 18.0,
        monthly = listOf(
            MonthlyNormal(1, "Janvier", 4.6, 9.7, 7.2, 143.8, 61.0, 3.4, 0.0),
            MonthlyNormal(2, "Février", 4.3, 10.0, 7.2, 118.9, 81.0, 3.8, 0.0),
            MonthlyNormal(3, "Mars", 5.4, 12.3, 8.9, 82.2, 121.0, 1.3, 0.0),
            MonthlyNormal(4, "Avril", 6.8, 14.7, 10.8, 79.5, 166.0, 0.2, 0.2),
            MonthlyNormal(5, "Mai", 9.4, 17.6, 13.5, 71.7, 188.0, 0.0, 1.5),
            MonthlyNormal(6, "Juin", 12.1, 20.2, 16.2, 59.8, 183.0, 0.0, 4.0),
            MonthlyNormal(7, "Juillet", 13.9, 21.9, 17.9, 64.6, 180.0, 0.0, 6.2),
            MonthlyNormal(8, "Août", 13.9, 22.0, 18.0, 75.3, 172.0, 0.0, 6.5),
            MonthlyNormal(9, "Septembre", 12.1, 20.0, 16.1, 78.8, 159.0, 0.0, 2.8),
            MonthlyNormal(10, "Octobre", 10.2, 16.3, 13.3, 129.4, 106.0, 0.1, 0.1),
            MonthlyNormal(11, "Novembre", 7.3, 12.6, 10.0, 146.7, 71.0, 1.0, 0.0),
            MonthlyNormal(12, "Décembre", 5.1, 10.3, 7.7, 159.1, 57.0, 2.7, 0.0)
        )
    )

    // Climatological normals 1991-2020 for Strasbourg-Entzheim
    val STRASBOURG_NORMALS = StationClimateNormals(
        stationId = "67124001",
        name = "Strasbourg-Entzheim",
        department = "67 - Bas-Rhin",
        annualTMean = 11.1,
        annualPrecipitation = 665.3,
        heatwaveThresholdMax = 34.0,
        heatwaveThresholdMin = 19.0,
        monthly = listOf(
            MonthlyNormal(1, "Janvier", -0.8, 5.2, 2.2, 35.0, 55.0, 16.4, 0.0),
            MonthlyNormal(2, "Février", -0.6, 7.3, 3.4, 34.5, 84.0, 14.1, 0.0),
            MonthlyNormal(3, "Mars", 2.1, 12.3, 7.2, 42.8, 139.0, 8.0, 0.3),
            MonthlyNormal(4, "Avril", 5.4, 17.1, 11.3, 44.8, 180.0, 1.8, 2.7),
            MonthlyNormal(5, "Mai", 9.8, 21.1, 15.5, 73.5, 202.0, 0.0, 8.4),
            MonthlyNormal(6, "Juin", 13.4, 24.8, 19.1, 66.1, 224.0, 0.0, 15.6),
            MonthlyNormal(7, "Juillet", 15.2, 27.3, 21.3, 72.8, 240.0, 0.0, 21.8),
            MonthlyNormal(8, "Août", 14.6, 26.9, 20.8, 61.9, 224.0, 0.0, 20.3),
            MonthlyNormal(9, "Septembre", 10.7, 22.0, 16.4, 55.5, 168.0, 0.1, 8.5),
            MonthlyNormal(10, "Octobre", 7.1, 16.1, 11.6, 56.6, 95.0, 1.6, 0.8),
            MonthlyNormal(11, "Novembre", 2.8, 9.6, 6.2, 48.0, 48.0, 8.2, 0.0),
            MonthlyNormal(12, "Décembre", 0.3, 6.0, 3.2, 53.8, 43.0, 14.2, 0.0)
        )
    )

    fun getNormalsForStation(stationName: String, lat: Double, lon: Double): StationClimateNormals {
        return when {
            stationName.contains("Marseille", ignoreCase = true) ||
            stationName.contains("Nice", ignoreCase = true) ||
            stationName.contains("Toulon", ignoreCase = true) ||
            stationName.contains("Montpellier", ignoreCase = true) ||
            stationName.contains("Perpignan", ignoreCase = true) ||
            stationName.contains("Ajaccio", ignoreCase = true) ||
            stationName.contains("Bastia", ignoreCase = true) ||
            lat < 44.5 -> MARSEILLE_NORMALS

            stationName.contains("Brest", ignoreCase = true) ||
            stationName.contains("Rennes", ignoreCase = true) ||
            stationName.contains("Nantes", ignoreCase = true) ||
            stationName.contains("Caen", ignoreCase = true) ||
            stationName.contains("Rouen", ignoreCase = true) ||
            (lon < 0.0 && lat > 46.0) -> BREST_NORMALS

            stationName.contains("Lyon", ignoreCase = true) ||
            stationName.contains("Clermont", ignoreCase = true) ||
            stationName.contains("Chamonix", ignoreCase = true) ||
            stationName.contains("Saint-Étienne", ignoreCase = true) ||
            stationName.contains("Grenoble", ignoreCase = true) -> LYON_NORMALS

            stationName.contains("Strasbourg", ignoreCase = true) ||
            stationName.contains("Nancy", ignoreCase = true) ||
            stationName.contains("Metz", ignoreCase = true) ||
            stationName.contains("Dijon", ignoreCase = true) ||
            stationName.contains("Mulhouse", ignoreCase = true) ||
            lon > 5.5 -> STRASBOURG_NORMALS

            else -> PARIS_NORMALS
        }
    }

    // Historical Climate Series for France (Météo-France / Copernicus ERA5 1950 - 2026)
    val HISTORICAL_FRANCE_SERIES = listOf(
        HistoricalClimatePoint(1950, 11.2, -0.7, 2, 48, 860.0),
        HistoricalClimatePoint(1955, 10.9, -1.0, 1, 52, 790.0),
        HistoricalClimatePoint(1960, 11.4, -0.5, 2, 44, 910.0),
        HistoricalClimatePoint(1965, 10.8, -1.1, 0, 56, 940.0),
        HistoricalClimatePoint(1970, 11.1, -0.8, 1, 50, 830.0),
        HistoricalClimatePoint(1975, 11.5, -0.4, 4, 42, 780.0),
        HistoricalClimatePoint(1976, 12.1, 0.2, 14, 38, 620.0), // Grande sécheresse 76
        HistoricalClimatePoint(1980, 11.0, -0.9, 1, 53, 890.0),
        HistoricalClimatePoint(1985, 11.1, -0.8, 3, 58, 810.0), // Vague de froid 85
        HistoricalClimatePoint(1989, 12.6, 0.7, 9, 30, 680.0),
        HistoricalClimatePoint(1990, 12.8, 0.9, 11, 28, 710.0),
        HistoricalClimatePoint(1994, 12.9, 1.0, 12, 25, 870.0),
        HistoricalClimatePoint(1997, 12.7, 0.8, 10, 27, 750.0),
        HistoricalClimatePoint(2000, 12.8, 0.9, 8, 24, 980.0),
        HistoricalClimatePoint(2003, 13.5, 1.6, 22, 26, 670.0), // Canicule historique 2003
        HistoricalClimatePoint(2006, 13.1, 1.2, 14, 29, 790.0),
        HistoricalClimatePoint(2010, 11.9, 0.0, 5, 46, 810.0),
        HistoricalClimatePoint(2011, 13.6, 1.7, 10, 21, 710.0),
        HistoricalClimatePoint(2014, 13.8, 1.9, 7, 18, 930.0),
        HistoricalClimatePoint(2015, 13.6, 1.7, 17, 23, 700.0),
        HistoricalClimatePoint(2018, 13.9, 2.0, 18, 20, 840.0),
        HistoricalClimatePoint(2019, 13.7, 1.8, 20, 22, 790.0), // Record national 46.0°C
        HistoricalClimatePoint(2020, 14.1, 2.2, 16, 16, 820.0),
        HistoricalClimatePoint(2021, 13.2, 1.3, 6, 28, 880.0),
        HistoricalClimatePoint(2022, 14.5, 2.6, 33, 14, 590.0), // Année la plus chaude jamais enregistrée
        HistoricalClimatePoint(2023, 14.4, 2.5, 24, 15, 860.0),
        HistoricalClimatePoint(2024, 14.2, 2.3, 18, 17, 990.0),
        HistoricalClimatePoint(2025, 14.3, 2.4, 21, 15, 870.0),
        HistoricalClimatePoint(2026, 14.5, 2.6, 25, 13, 810.0)
    )

    // IPCC / DRIAS Projections for France
    val CLIMATE_PROJECTIONS = listOf(
        ClimateProjectionScenario(
            scenarioCode = "SSP1-2.6",
            scenarioName = "Atténuation Ambitieuse (Accord de Paris +1.5°C à +2°C)",
            horizon = 2050,
            projectedTempIncrease = 1.3,
            extraTropicalNightsPerYear = 6,
            extraHeatwaveDaysPerYear = 8,
            summerPrecipitationChangePct = -8,
            winterPrecipitationChangePct = +4,
            droughtFrequencyMultiplier = 1.4,
            agriculturalImpactSummary = "Pression hydrique estivale modérée, adaptation variétale requise."
        ),
        ClimateProjectionScenario(
            scenarioCode = "SSP2-4.5",
            scenarioName = "Trajectoire Intermédiaire (+2.7°C mondial / +3.5°C en France)",
            horizon = 2050,
            projectedTempIncrease = 2.2,
            extraTropicalNightsPerYear = 14,
            extraHeatwaveDaysPerYear = 18,
            summerPrecipitationChangePct = -18,
            winterPrecipitationChangePct = +8,
            droughtFrequencyMultiplier = 2.3,
            agriculturalImpactSummary = "Stress hydrique sévère régulier, baisse des rendements céréaliers d'été, vendanges avancées de 3 semaines."
        ),
        ClimateProjectionScenario(
            scenarioCode = "SSP5-8.5",
            scenarioName = "Hautes Émissions / Sans transition (+4.5°C à +5°C en France)",
            horizon = 2100,
            projectedTempIncrease = 4.8,
            extraTropicalNightsPerYear = 35,
            extraHeatwaveDaysPerYear = 45,
            summerPrecipitationChangePct = -35,
            winterPrecipitationChangePct = +18,
            droughtFrequencyMultiplier = 4.5,
            agriculturalImpactSummary = "Climat méditerranéen jusqu'à la Loire, disparition quasi-totale des glaciers alpins sous 3000m, crise d'étiage majeure."
        )
    )
}
