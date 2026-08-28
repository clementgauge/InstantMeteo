package com.example.data.local

import com.example.data.model.LocationPoint
import com.example.data.model.MonthlyNormal
import com.example.data.model.StationClimateNormals
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

object FrenchStationsData {

    val REFERENCE_STATIONS = listOf(
        LocationPoint(
            name = "Paris-Montsouris",
            department = "75 - Paris",
            region = "Île-de-France",
            latitude = 48.8217,
            longitude = 2.3378,
            altitude = 75.0,
            climateZone = "Océanique dégradé / Îlot de chaleur urbain",
            allTimeRecordMax = 42.6,
            allTimeRecordMin = -23.9,
            allTimeRecordRain24h = 104.2
        ),
        LocationPoint(
            name = "Marseille-Marignane",
            department = "13 - Bouches-du-Rhône",
            region = "Provence-Alpes-Côte d'Azur",
            latitude = 43.4378,
            longitude = 5.2161,
            altitude = 36.0,
            climateZone = "Méditerranéen franc (Mistral)",
            allTimeRecordMax = 40.2,
            allTimeRecordMin = -16.8,
            allTimeRecordRain24h = 196.4
        ),
        LocationPoint(
            name = "Lyon-Bron",
            department = "69 - Rhône",
            region = "Auvergne-Rhône-Alpes",
            latitude = 45.7275,
            longitude = 4.9442,
            altitude = 201.0,
            climateZone = "Semi-continental à influences méridionales",
            allTimeRecordMax = 41.4,
            allTimeRecordMin = -24.6,
            allTimeRecordRain24h = 106.0
        ),
        LocationPoint(
            name = "Toulouse-Blagnac",
            department = "31 - Haute-Garonne",
            region = "Occitanie",
            latitude = 43.6294,
            longitude = 1.3789,
            altitude = 151.0,
            climateZone = "Océanique altéré / Aquitain chaud",
            allTimeRecordMax = 42.4,
            allTimeRecordMin = -19.2,
            allTimeRecordRain24h = 82.7
        ),
        LocationPoint(
            name = "Nice-Côte d'Azur",
            department = "06 - Alpes-Maritimes",
            region = "Provence-Alpes-Côte d'Azur",
            latitude = 43.6653,
            longitude = 7.2150,
            altitude = 4.0,
            climateZone = "Méditerranéen maritime doux",
            allTimeRecordMax = 37.7,
            allTimeRecordMin = -7.2,
            allTimeRecordRain24h = 191.0
        ),
        LocationPoint(
            name = "Nantes-Atlantique",
            department = "44 - Loire-Atlantique",
            region = "Pays de la Loire",
            latitude = 47.1531,
            longitude = -1.6078,
            altitude = 26.0,
            climateZone = "Océanique franc tempéré",
            allTimeRecordMax = 42.0,
            allTimeRecordMin = -15.6,
            allTimeRecordRain24h = 94.9
        ),
        LocationPoint(
            name = "Strasbourg-Entzheim",
            department = "67 - Bas-Rhin",
            region = "Grand Est",
            latitude = 48.5494,
            longitude = 7.6369,
            altitude = 153.0,
            climateZone = "Semi-continental d'abri rhénan",
            allTimeRecordMax = 38.9,
            allTimeRecordMin = -23.6,
            allTimeRecordRain24h = 68.4
        ),
        LocationPoint(
            name = "Bordeaux-Mérignac",
            department = "33 - Gironde",
            region = "Nouvelle-Aquitaine",
            latitude = 44.8283,
            longitude = -0.6914,
            altitude = 47.0,
            climateZone = "Océanique aquitain humide et chaud",
            allTimeRecordMax = 41.2,
            allTimeRecordMin = -16.4,
            allTimeRecordRain24h = 100.8
        ),
        LocationPoint(
            name = "Lille-Lesquin",
            department = "59 - Nord",
            region = "Hauts-de-France",
            latitude = 50.5619,
            longitude = 3.0894,
            altitude = 47.0,
            climateZone = "Océanique tempéré septentrional",
            allTimeRecordMax = 41.5,
            allTimeRecordMin = -19.5,
            allTimeRecordRain24h = 63.8
        ),
        LocationPoint(
            name = "Rennes-Saint-Jacques",
            department = "35 - Ille-et-Vilaine",
            region = "Bretagne",
            latitude = 48.0686,
            longitude = -1.7289,
            altitude = 36.0,
            climateZone = "Océanique breton d'abri",
            allTimeRecordMax = 40.5,
            allTimeRecordMin = -14.7,
            allTimeRecordRain24h = 75.0
        ),
        LocationPoint(
            name = "Brest-Guipavas",
            department = "29 - Finistère",
            region = "Bretagne",
            latitude = 48.4442,
            longitude = -4.4128,
            altitude = 99.0,
            climateZone = "Hyper-océanique venteux et arrosé",
            allTimeRecordMax = 39.3,
            allTimeRecordMin = -14.0,
            allTimeRecordRain24h = 82.6
        ),
        LocationPoint(
            name = "Montpellier-Fréjorgues",
            department = "34 - Hérault",
            region = "Occitanie",
            latitude = 43.5764,
            longitude = 3.9631,
            altitude = 3.0,
            climateZone = "Méditerranéen / Épisodes Cévenols",
            allTimeRecordMax = 43.5,
            allTimeRecordMin = -17.8,
            allTimeRecordRain24h = 299.5
        ),
        LocationPoint(
            name = "Clermont-Ferrand-Aulnat",
            department = "63 - Puy-de-Dôme",
            region = "Auvergne-Rhône-Alpes",
            latitude = 45.7867,
            longitude = 3.1650,
            altitude = 331.0,
            climateZone = "Semi-continental d'abri / Massif Central",
            allTimeRecordMax = 40.9,
            allTimeRecordMin = -29.0,
            allTimeRecordRain24h = 101.4
        ),
        LocationPoint(
            name = "Dijon-Longvic",
            department = "21 - Côte-d'Or",
            region = "Bourgogne-Franche-Comté",
            latitude = 47.2678,
            longitude = 5.0883,
            altitude = 221.0,
            climateZone = "Semi-continental bourguignon",
            allTimeRecordMax = 39.5,
            allTimeRecordMin = -22.0,
            allTimeRecordRain24h = 92.5
        ),
        LocationPoint(
            name = "Perpignan-Rivesaltes",
            department = "66 - Pyrénées-Orientales",
            region = "Occitanie",
            latitude = 42.7408,
            longitude = 2.8719,
            altitude = 44.0,
            climateZone = "Méditerranéen roussillonnais / Tramontane",
            allTimeRecordMax = 42.4,
            allTimeRecordMin = -11.0,
            allTimeRecordRain24h = 222.0
        ),
        LocationPoint(
            name = "Biarritz-Pays Basque",
            department = "64 - Pyrénées-Atlantiques",
            region = "Nouvelle-Aquitaine",
            latitude = 43.4683,
            longitude = -1.5233,
            altitude = 71.0,
            climateZone = "Océanique basque très arrosé",
            allTimeRecordMax = 42.9,
            allTimeRecordMin = -12.7,
            allTimeRecordRain24h = 145.0
        ),
        LocationPoint(
            name = "Chamonix-Mont-Blanc",
            department = "74 - Haute-Savoie",
            region = "Auvergne-Rhône-Alpes",
            latitude = 45.9237,
            longitude = 6.8694,
            altitude = 1042.0,
            climateZone = "Montagnard alpin intra-massif",
            allTimeRecordMax = 37.2,
            allTimeRecordMin = -31.4,
            allTimeRecordRain24h = 120.0
        ),
        LocationPoint(
            name = "Ajaccio-Campo dell'Oro",
            department = "2A - Corse-du-Sud",
            region = "Corse",
            latitude = 41.9181,
            longitude = 8.7981,
            altitude = 5.0,
            climateZone = "Méditerranéen insulaire maritime",
            allTimeRecordMax = 40.3,
            allTimeRecordMin = -8.1,
            allTimeRecordRain24h = 148.0
        ),
        LocationPoint(
            name = "Bastia-Poretta",
            department = "2B - Haute-Corse",
            region = "Corse",
            latitude = 42.5528,
            longitude = 9.4839,
            altitude = 10.0,
            climateZone = "Méditerranéen insulaire / Effet de Foehn",
            allTimeRecordMax = 41.0,
            allTimeRecordMin = -5.0,
            allTimeRecordRain24h = 205.0
        ),
        LocationPoint(
            name = "Rouen-Boos",
            department = "76 - Seine-Maritime",
            region = "Normandie",
            latitude = 49.3842,
            longitude = 1.1831,
            altitude = 156.0,
            climateZone = "Océanique normand humide",
            allTimeRecordMax = 41.3,
            allTimeRecordMin = -17.1,
            allTimeRecordRain24h = 68.0
        ),
        LocationPoint(
            name = "Nancy-Essey",
            department = "54 - Meurthe-et-Moselle",
            region = "Grand Est",
            latitude = 48.6925,
            longitude = 6.2308,
            altitude = 212.0,
            climateZone = "Semi-continental lorrain",
            allTimeRecordMax = 40.1,
            allTimeRecordMin = -24.8,
            allTimeRecordRain24h = 103.0
        ),
        LocationPoint(
            name = "Tours-Val de Loire",
            department = "37 - Indre-et-Loire",
            region = "Centre-Val de Loire",
            latitude = 47.4447,
            longitude = 0.7275,
            altitude = 108.0,
            climateZone = "Océanique dégradé ligérien",
            allTimeRecordMax = 40.8,
            allTimeRecordMin = -18.5,
            allTimeRecordRain24h = 67.0
        ),
        LocationPoint(
            name = "Limoges-Bellegarde",
            department = "87 - Haute-Vienne",
            region = "Nouvelle-Aquitaine",
            latitude = 45.8611,
            longitude = 1.1794,
            altitude = 402.0,
            climateZone = "Océanique de piémont / Limousin",
            allTimeRecordMax = 37.9,
            allTimeRecordMin = -19.2,
            allTimeRecordRain24h = 86.4
        ),
        LocationPoint(
            name = "Caen-Carpiquet",
            department = "14 - Calvados",
            region = "Normandie",
            latitude = 49.1800,
            longitude = -0.4500,
            altitude = 78.0,
            climateZone = "Océanique normand doux",
            allTimeRecordMax = 40.1,
            allTimeRecordMin = -19.6,
            allTimeRecordRain24h = 71.2
        ),
        LocationPoint(
            name = "Pointe-à-Pitre",
            department = "971 - Guadeloupe",
            region = "Outre-Mer",
            latitude = 16.2650,
            longitude = -61.5283,
            altitude = 11.0,
            climateZone = "Tropical maritime à cyclones",
            allTimeRecordMax = 35.8,
            allTimeRecordMin = 13.5,
            allTimeRecordRain24h = 422.0
        ),
        LocationPoint(
            name = "Saint-Denis-Gillot",
            department = "974 - La Réunion",
            region = "Outre-Mer",
            latitude = -20.8872,
            longitude = 55.5103,
            altitude = 20.0,
            climateZone = "Tropical humide océanique / Alizés",
            allTimeRecordMax = 36.9,
            allTimeRecordMin = 12.8,
            allTimeRecordRain24h = 1144.0
        )
    )

    fun findNearestStation(lat: Double, lon: Double): LocationPoint {
        var closest = REFERENCE_STATIONS.first()
        var minDistance = Double.MAX_VALUE

        for (st in REFERENCE_STATIONS) {
            val d = distanceHaversine(lat, lon, st.latitude, st.longitude)
            if (d < minDistance) {
                minDistance = d
                closest = st
            }
        }
        return closest
    }

    fun distanceHaversine(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val r = 6371.0 // Rayon Terre en km
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2) * sin(dLon / 2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return r * c
    }
}
