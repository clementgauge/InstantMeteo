export interface FrenchRegionData {
  id: string;
  name: string;
  shortName: string;
  center: [number, number]; // [lat, lon]
  zoom: number;
  bounds: [[number, number], [number, number]]; // [[minLat, minLon], [maxLat, maxLon]]
  prefecture: string;
  highestSummit: {
    name: string;
    altitude: number;
  };
  departments: string[];
  climateDescription: string;
  color: string; // Tailwind / Hex color
  bgGradient: string;
}

export const FRENCH_REGIONS: FrenchRegionData[] = [
  {
    id: "auvergne-rhone-alpes",
    name: "Auvergne-Rhône-Alpes",
    shortName: "AURA",
    center: [45.55, 4.95],
    zoom: 7,
    bounds: [[44.10, 2.05], [46.80, 7.20]],
    prefecture: "Lyon",
    highestSummit: {
      name: "Mont Blanc",
      altitude: 4809
    },
    departments: ["01 - Ain", "03 - Allier", "07 - Ardèche", "15 - Cantal", "26 - Drôme", "38 - Isère", "42 - Loire", "43 - Haute-Loire", "63 - Puy-de-Dôme", "69 - Rhône / Lyon", "73 - Savoie", "74 - Haute-Savoie"],
    climateDescription: "Varié : montagnard alpin aux sommets, semi-continental en plaine, méditerranéen au sud (Drôme/Ardèche).",
    color: "#3b82f6",
    bgGradient: "from-blue-600 to-indigo-900"
  },
  {
    id: "bourgogne-franche-comte",
    name: "Bourgogne-Franche-Comté",
    shortName: "BFC",
    center: [47.25, 4.90],
    zoom: 7,
    bounds: [[46.15, 2.80], [48.45, 7.10]],
    prefecture: "Dijon",
    highestSummit: {
      name: "Crêt Pela (Jura)",
      altitude: 1495
    },
    departments: ["21 - Côte-d'Or", "25 - Doubs", "39 - Jura", "58 - Nièvre", "70 - Haute-Saône", "71 - Saône-et-Loire", "89 - Yonne", "90 - Territoire de Belfort"],
    climateDescription: "Semi-continental avec hivers rigoureux et étés chauds et orageux ; montagnard sur le massif du Jura.",
    color: "#8b5cf6",
    bgGradient: "from-purple-600 to-indigo-950"
  },
  {
    id: "bretagne",
    name: "Bretagne",
    shortName: "Bretagne",
    center: [48.15, -2.85],
    zoom: 8,
    bounds: [[47.20, -4.95], [48.95, -1.00]],
    prefecture: "Rennes",
    highestSummit: {
      name: "Roc'h Ruz (Monts d'Arrée)",
      altitude: 385
    },
    departments: ["22 - Côtes-d'Armor", "29 - Finistère", "35 - Ille-et-Vilaine", "56 - Morbihan"],
    climateDescription: "Océanique franc tempéré et venteux, faibles amplitudes thermiques, passages perturbés atlantiques réguliers.",
    color: "#06b6d4",
    bgGradient: "from-cyan-600 to-blue-950"
  },
  {
    id: "centre-val-de-loire",
    name: "Centre-Val de Loire",
    shortName: "Centre",
    center: [47.60, 1.70],
    zoom: 8,
    bounds: [[46.30, 0.05], [48.95, 3.15]],
    prefecture: "Orléans",
    highestSummit: {
      name: "Le Magnoux",
      altitude: 504
    },
    departments: ["18 - Cher", "28 - Eure-et-Loir", "36 - Indre", "37 - Indre-et-Loire", "41 - Loir-et-Cher", "45 - Loiret"],
    climateDescription: "Océanique dégradé à tonalité continentale modérée, val de Loire tempéré et agricole.",
    color: "#10b981",
    bgGradient: "from-emerald-600 to-teal-950"
  },
  {
    id: "corse",
    name: "Corse",
    shortName: "Corse",
    center: [42.15, 9.10],
    zoom: 8,
    bounds: [[41.30, 8.50], [43.10, 9.60]],
    prefecture: "Ajaccio",
    highestSummit: {
      name: "Monte Cinto",
      altitude: 2706
    },
    departments: ["2A - Corse-du-Sud", "2B - Haute-Corse"],
    climateDescription: "Méditerranéen insulaire contrasté : littoral chaud et ensoleillé, intérieur montagneux et enneigé l'hiver.",
    color: "#f59e0b",
    bgGradient: "from-amber-600 to-orange-950"
  },
  {
    id: "grand-est",
    name: "Grand Est",
    shortName: "Grand Est",
    center: [48.70, 5.50],
    zoom: 7,
    bounds: [[47.40, 3.35], [50.20, 8.30]],
    prefecture: "Strasbourg",
    highestSummit: {
      name: "Grand Ballon (Vosges)",
      altitude: 1424
    },
    departments: ["08 - Ardennes", "10 - Aube", "51 - Marne", "52 - Haute-Marne", "54 - Meurthe-et-Moselle", "55 - Meuse", "57 - Moselle", "67 - Bas-Rhin", "68 - Haut-Rhin", "88 - Vosges"],
    climateDescription: "Semi-continental marqué : hivers froids avec gelées fréquentes, étés chauds, effet de foehn en plaine d'Alsace.",
    color: "#ec4899",
    bgGradient: "from-pink-600 to-rose-950"
  },
  {
    id: "hauts-de-france",
    name: "Hauts-de-France",
    shortName: "Hauts-de-France",
    center: [50.10, 2.80],
    zoom: 8,
    bounds: [[48.80, 1.30], [51.15, 4.30]],
    prefecture: "Lille",
    highestSummit: {
      name: "Site de Watten / Anor",
      altitude: 271
    },
    departments: ["02 - Aisne", "59 - Nord", "60 - Oise", "62 - Pas-de-Calais", "80 - Somme"],
    climateDescription: "Océanique tempéré au littoral (Mer du Nord/Manche), dégradé vers l'intérieur avec nébulosité fréquente.",
    color: "#6366f1",
    bgGradient: "from-indigo-600 to-slate-950"
  },
  {
    id: "ile-de-france",
    name: "Île-de-France",
    shortName: "Île-de-France",
    center: [48.70, 2.45],
    zoom: 9,
    bounds: [[48.10, 1.40], [49.25, 3.60]],
    prefecture: "Paris",
    highestSummit: {
      name: "Butte de Montmélian",
      altitude: 216
    },
    departments: ["75 - Paris", "77 - Seine-et-Marne", "78 - Yvelines", "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis", "94 - Val-de-Marne", "95 - Val-d'Oise"],
    climateDescription: "Océanique altéré avec fort îlot de chaleur urbain parisien (nuits douces, contrastes jour/nuit atténués).",
    color: "#38bdf8",
    bgGradient: "from-sky-500 to-blue-950"
  },
  {
    id: "normandie",
    name: "Normandie",
    shortName: "Normandie",
    center: [49.10, 0.15],
    zoom: 8,
    bounds: [[48.30, -1.95], [50.10, 1.85]],
    prefecture: "Rouen",
    highestSummit: {
      name: "Signal d'Écouves",
      altitude: 413
    },
    departments: ["14 - Calvados", "27 - Eure", "50 - Manche", "61 - Orne", "76 - Seine-Maritime"],
    climateDescription: "Océanique humide et doux, influence maritime directe de la Manche, précipitations réparties sur l'année.",
    color: "#14b8a6",
    bgGradient: "from-teal-500 to-slate-950"
  },
  {
    id: "nouvelle-aquitaine",
    name: "Nouvelle-Aquitaine",
    shortName: "Nouvelle-Aquitaine",
    center: [45.30, 0.20],
    zoom: 7,
    bounds: [[42.75, -1.85], [47.20, 2.65]],
    prefecture: "Bordeaux",
    highestSummit: {
      name: "Pic Palas (Pyrénées)",
      altitude: 2974
    },
    departments: ["16 - Charente", "17 - Charente-Maritime", "19 - Corrèze", "23 - Creuse", "24 - Dordogne", "33 - Gironde", "40 - Landes", "47 - Lot-et-Garonne", "64 - Pyrénées-Atlantiques", "79 - Deux-Sèvres", "86 - Vienne", "87 - Haute-Vienne"],
    climateDescription: "Océanique aquitain doux et ensoleillé, montagnard pyrénéen au sud, continentalisé sur le plateau de Millevaches.",
    color: "#eab308",
    bgGradient: "from-yellow-500 to-amber-950"
  },
  {
    id: "occitanie",
    name: "Occitanie",
    shortName: "Occitanie",
    center: [43.65, 2.30],
    zoom: 7,
    bounds: [[42.30, -0.35], [45.05, 4.90]],
    prefecture: "Toulouse",
    highestSummit: {
      name: "Pic de Vignemale (Pyrénées)",
      altitude: 3298
    },
    departments: ["09 - Ariège", "11 - Aude", "12 - Aveyron", "30 - Gard", "31 - Haute-Garonne", "32 - Gers", "34 - Hérault", "46 - Lot", "48 - Lozère", "65 - Hautes-Pyrénées", "66 - Pyrénées-Orientales", "81 - Tarn", "82 - Tarn-et-Garonne"],
    climateDescription: "Méditerranéen sur le littoral (Tramontane), océanique atténué à l'ouest (Vent d'Autan), montagnard pyrénéen et cévenol.",
    color: "#f97316",
    bgGradient: "from-orange-500 to-red-950"
  },
  {
    id: "pays-de-la-loire",
    name: "Pays de la Loire",
    shortName: "Pays de la Loire",
    center: [47.50, -0.65],
    zoom: 8,
    bounds: [[46.20, -2.60], [48.60, 0.90]],
    prefecture: "Nantes",
    highestSummit: {
      name: "Mont des Avaloirs",
      altitude: 416
    },
    departments: ["44 - Loire-Atlantique", "49 - Maine-et-Loire", "53 - Mayenne", "72 - Sarthe", "85 - Vendée"],
    climateDescription: "Océanique franc tempéré, douceur angevine réputée, ensoleillement remarquable sur la côte vendéenne.",
    color: "#0ea5e9",
    bgGradient: "from-sky-500 to-indigo-950"
  },
  {
    id: "provence-alpes-cote-d-azur",
    name: "Provence-Alpes-Côte d'Azur",
    shortName: "PACA",
    center: [43.95, 6.10],
    zoom: 8,
    bounds: [[42.95, 4.20], [45.15, 7.80]],
    prefecture: "Marseille",
    highestSummit: {
      name: "Barre des Écrins",
      altitude: 4102
    },
    departments: ["04 - Alpes-de-Haute-Provence", "05 - Hautes-Alpes", "06 - Alpes-Maritimes", "13 - Bouches-du-Rhône", "83 - Var", "84 - Vaucluse"],
    climateDescription: "Méditerranéen ensoleillé (>2800h/an), Mistral violent en vallée du Rhône, montagnard alpin dans les Alpes du Sud.",
    color: "#ef4444",
    bgGradient: "from-red-500 to-rose-950"
  }
];

export const OVERSEAS_REGIONS: FrenchRegionData[] = [
  {
    id: "guadeloupe",
    name: "Guadeloupe",
    shortName: "Guadeloupe",
    center: [16.25, -61.55],
    zoom: 10,
    bounds: [[15.80, -61.85], [16.55, -61.00]],
    prefecture: "Basse-Terre",
    highestSummit: {
      name: "La Soufrière",
      altitude: 1467
    },
    departments: ["971 - Guadeloupe"],
    climateDescription: "Tropical humide avec alizés marins, saison cyclonique de juillet à novembre.",
    color: "#10b981",
    bgGradient: "from-emerald-500 to-teal-950"
  },
  {
    id: "martinique",
    name: "Martinique",
    shortName: "Martinique",
    center: [14.65, -61.00],
    zoom: 10,
    bounds: [[14.35, -61.25], [14.90, -60.80]],
    prefecture: "Fort-de-France",
    highestSummit: {
      name: "Montagne Pelée",
      altitude: 1397
    },
    departments: ["972 - Martinique"],
    climateDescription: "Tropical maritime, tempéré par les alizés et relief volcanique générant de fortes pluies orographiques.",
    color: "#06b6d4",
    bgGradient: "from-cyan-500 to-blue-950"
  },
  {
    id: "la-reunion",
    name: "La Réunion",
    shortName: "La Réunion",
    center: [-21.12, 55.53],
    zoom: 10,
    bounds: [[-21.40, 55.20], [-20.85, 55.85]],
    prefecture: "Saint-Denis",
    highestSummit: {
      name: "Piton des Neiges",
      altitude: 3070
    },
    departments: ["974 - La Réunion"],
    climateDescription: "Tropical d'alizé avec microclimats extrêmes entre la côte au vent très arrosée et la côte sous le vent sèche.",
    color: "#f59e0b",
    bgGradient: "from-amber-500 to-orange-950"
  }
];
