export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoSectionItem {
  title: string;
  content: string;
}

export interface PageSeoItem {
  slug: string;
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  h2s: string[];
  intro: string;
  sections: SeoSectionItem[];
  faq: SeoFaqItem[];
  tabId: string;
}

export const BASE_SITE_URL = 'https://instantmeteo.instantmeteofr.workers.dev';

export const SEO_PAGES_MAP: Record<string, PageSeoItem> = {
  '/': {
    slug: 'home',
    path: '/',
    canonicalUrl: `${BASE_SITE_URL}/`,
    title: 'Instant Météo France - Météo Direct, Température & Radar Pluie HD',
    description: 'Instant Météo (InstantMétéo) : Prévisions météo en direct pour la France et 35 000 communes. Température temps réel, radar pluie HD, vigilances et néphologie.',
    keywords: 'instant météo, instantmeteo, météo france, température temps réel, radar pluie direct, météo 35000 communes, prévisions directes',
    h1: 'Instant Météo France - Portail Météorologique de Précision en Temps Réel',
    h2s: [
      'Température en Direct & Données Thermo-Hygrométriques de Précision',
      'Radar Pluie & Précipitations Haute Définition ARAMIS',
      'Vigilance Météo-France Officielle sur 12 Risques Majeurs',
      'Observatoires Thématiques : Montagne, Littoral, Sécheresse & Crues'
    ],
    intro: 'Instant Météo est la plateforme météorologique indépendante dédiée au suivi hyper-local et temps réel des conditions atmosphériques en France métropolitaine et outre-mer. Conçue pour offrir aux citoyens, agriculteurs, randonneurs et professionnels une information météo certifiée sans délai, notre infrastructure combine les modèles haute résolution AROME et ARPEGE de Météo-France, le modèle européen ECMWF IFS, le réseau radar Doppler national ARAMIS et les flux hydrométriques officiels.',
    sections: [
      {
        title: 'Précision hyper-locale pour 35 000 communes françaises',
        content: 'Chaque commune de France bénéficie d\'une fiche d\'observation complète intégrant température sous abri à 2 m, ressenti au vent (wind chill), indice humidex, hygrométrie relative, point de rosée, vitesse et rafales de vent à 10 m, pression atmosphérique ramenée au niveau de la mer et ensoleillement horaire. Les comparaisons aux normales climatiques de référence 1991-2020 permettent de visualiser immédiatement les anomalies thermiques locales.'
      },
      {
        title: 'Technologie de réconciliation radar et recalibrage instantané',
        content: 'Contrairement aux bulletins statiques traditionnels, Instant Météo utilise un moteur algorithmique de réconciliation continue : dès qu\'un écho de précipitation est repéré par les radars Doppler, le statut météorologique est actualisé instantanément pour éviter tout décalage entre la réalité perçue et les prévisions numériques.'
      },
      {
        title: 'Modules spécialisés et sécurité civile',
        content: 'Retrouvez nos onglets thématiques dédiés : nivologie et bulletins BERA pour la montagne, marées SHOM et SST pour le littoral, météo des forêts et restrictions d\'eau VigiEau pour la sécheresse, ainsi que les jauges de débit Vigicrues et les cartes de néphologie verticale de 0 à 12 000 mètres.'
      }
    ],
    faq: [
      {
        question: 'Qu\'est-ce qui distingue Instant Météo des autres applications météo ?',
        answer: 'Instant Météo combine en direct les données ouvertes de Météo-France (AROME à 1,3 km de maille), le modèle mondial ECMWF, les radars Doppler ARAMIS et les stations de référence du réseau national. Les données sont actualisées à haute fréquence (toutes les 1 à 3 minutes pour le radar) avec réconciliation continue pour éviter les fausses annonces de ciel couvert en cas d\'averse active.'
      },
      {
        question: 'Comment sont calculées les températures ressenties ?',
        answer: 'Nous calculons l\'indice de refroidissement éolien (Wind Chill de Steadman) pour les températures inférieures ou égales à 10°C exposées au vent, et l\'indice Humidex canadien combinant chaleur et pression de vapeur d\'eau pour les températures chaudes supérieures à 20°C.'
      },
      {
        question: 'Les alertes et vigilances sont-elles officielles ?',
        answer: 'Oui, notre matrice départementale de vigilance est branchée en temps réel sur les flux officiels de Météo-France et du SCHAPI (Vigicrues). Elle surveille les 12 phénomènes réglementaires avec mise à jour automatisée 24h/24.'
      },
      {
        question: 'Puis-je consulter la météo de n\'importe quelle commune de France ?',
        answer: 'Absolument. Notre moteur de géocodage couvre les 34 965 communes de métropole et des départements d\'outre-mer avec prise en compte du relief altimétrique et des microclimats locaux.'
      }
    ],
    tabId: 'realtime'
  },
  '/direct': {
    slug: 'direct',
    path: '/direct',
    canonicalUrl: `${BASE_SITE_URL}/direct`,
    title: 'Météo en Direct & Température Temps Réel France - Instant Météo',
    description: 'Météo en direct pour 35 000 communes de France : température temps réel, humidité, pression barométrique, vent et ressenti thermique calculés à la minute.',
    keywords: 'météo direct, météo en direct, température temps réel, météo direct france, ressenti vent, humidité en direct, pression atmosphérique',
    h1: 'Météo en Direct & Température en Temps Réel sur toute la France',
    h2s: [
      'Relevés Thermo-Hygrométriques et Barométriques Instantanés',
      'Comparaison aux Normales Climatiques Officielles (1991-2020)',
      'Trajectoire du Soleil, Ensoleillement et Éphéméride du Jour',
      'Diagnostics Climatiques et Microclimatiques par Commune'
    ],
    intro: 'La page Météo en Direct d\'Instant Météo offre une radiographie complète et immédiate de l\'atmosphère locale. À partir des capteurs météorologiques de surface et des réanalyses numériques, chaque mesure physique est restituée avec exactitude : température sous abri normalisé OMM, vitesse moyenne du vent et rafales maximales, hygrométrie, point de rosée et pression barométrique.',
    sections: [
      {
        title: 'Analyse thermique et anomalies par rapport aux normales',
        content: 'Chaque relevé thermique est confronté en temps réel aux moyennes de saison établies sur la période trentenaire de référence 1991-2020 par Météo-France. L\'écart thermique calculé (anomalie positive ou négative) informe immédiatement sur le caractère exceptionnellement chaud, frais ou conforme de la journée en cours.'
      },
      {
        title: 'Suivi de la pluie dans l\'heure et dynamique atmosphérique',
        content: 'Le bloc de pluie dans l\'heure découpe les 60 prochaines minutes par pas de 5 minutes. Ce service de nowcasting basé sur les échos radar Doppler permet d\'anticiper le début, l\'intensité maximale et la fin exacte d\'une averse ou d\'un orage passager.'
      },
      {
        title: 'Éphéméride astronomique et rayonnement',
        content: 'Consultez les heures exactes de lever, culmination et coucher du soleil, la durée du jour, le rayonnement global en W/m² et l\'indice UV calculé selon l\'épaisseur de la couche d\'ozone et la couverture nuageuse instantanée.'
      }
    ],
    faq: [
      {
        question: 'À quelle fréquence les données en direct sont-elles rafraîchies ?',
        answer: 'Les données d\'observation et de modélisation sont interrogées et recalculées toutes les 3 minutes. En cas de passage pluvieux détecté au radar, une régénération haute intensité est déclenchée pour garantir un statut temps réel ultra-fidèle.'
      },
      {
        question: 'Pourquoi la température ressentie diffère-t-elle de la température sous abri ?',
        answer: 'La température sous abri mesure la chaleur réelle de l\'air à 2 mètres du sol sans rayonnement direct du soleil. La température ressentie simule la perte ou l\'accumulation thermique du corps humain sous l\'effet combiné de la vitesse du vent (wind chill) ou de l\'humidité relative (humidex).'
      },
      {
        question: 'Comment est mesurée la qualité de l\'air affichée ?',
        answer: 'L\'indice AQI affiché synthétise les concentrations de particules fines (PM2.5, PM10), de dioxyde d\'azote (NO2) et d\'ozone (O3) issues du programme européen Copernicus Atmosphere Monitoring Service (CAMS).'
      },
      {
        question: 'Que signifie l\'anomalie thermique en degrés ?',
        answer: 'L\'anomalie représente l\'écart entre la température actuelle observée et la moyenne statistique trentenaire (1991-2020) calculée pour ce même jour et cette même heure sur la station météo de référence la plus proche.'
      }
    ],
    tabId: 'realtime'
  },
  '/radar': {
    slug: 'radar',
    path: '/radar',
    canonicalUrl: `${BASE_SITE_URL}/radar`,
    title: 'Radar Pluie HD en Direct & Précipitations ARAMIS - Instant Météo',
    description: 'Radar de pluie en direct haute définition sur la France : suivi des averses, orages et chutes de neige en temps réel. Échos Doppler ARAMIS toutes les 5 minutes.',
    keywords: 'radar pluie, radar pluie hd, radar météo direct, radar précipitations france, suivi orages direct, radar aramis, carte pluie temps réel',
    h1: 'Radar Pluie HD & Carte des Précipitations en Direct sur la France',
    h2s: [
      'Réseau Radar Doppler ARAMIS et Télédétection des Précipitations',
      'Échelle d\'Intensité Pluviométrique en mm/h et Réflectivité dBZ',
      'Différenciation Pluie, Neige, Grésil et Grêle',
      'Historique Récent et Projection d\'Averses à Court Terme'
    ],
    intro: 'Le radar des précipitations d\'Instant Météo diffuse la mosaïque nationale haute résolution du réseau ARAMIS (Application Radar à la Météorologie Infra-Synoptique) de Météo-France. Composé de plus de 33 radars Doppler et polarimétriques répartis sur le territoire métropolitain, ce système permet d\'observer chaque cellule pluvieuse, ligne de grains ou système orageux avec une précision kilométrique.',
    sections: [
      {
        title: 'Fonctionnement physique du radar météorologique Doppler',
        content: 'Les radars émettent des micro-ondes électromagnétiques qui sont rétrodiffusées par les hydrométéores (gouttes de pluie, flocons de neige, grêlons). La puissance du signal réfléchi, mesurée en réflectivité logarithmique (dBZ), est convertie en intensité de précipitation instantanée (mm/h) grâce aux relations de Marshall-Palmer.'
      },
      {
        title: 'Double polarisation et identification des types de précipitations',
        content: 'Grâce à l\'émission d\'ondes selon deux polarisations orthogonales (horizontale et verticale), nos radars identifient la forme géométrique des particules en suspension, permettant de distinguer avec certitude la pluie liquide, la neige humide, le grésil et les grêlons au sein des cumulonimbus.'
      },
      {
        title: 'Animation fluide et suivi des trajectoires pluvieuses',
        content: 'L\'interface cartographique interactive permet de remonter l\'historique des 2 dernières heures et de projeter la cinématique d\'advection des nuages pluvieux pour savoir avec précision quand une zone d\'averses touchera votre position géographique.'
      }
    ],
    faq: [
      {
        question: 'Comment interpréter les couleurs sur le radar de pluie ?',
        answer: 'Les teintes bleues correspondent aux pluies très faibles à fines bruines (0,1 à 1 mm/h). Le vert et jaune indiquent une pluie modérée continue (2 à 10 mm/h). L\'orange et le rouge signalent de fortes averses (10 à 30 mm/h). Le pourpre et le blanc marquent des précipitations torrentielles ou orages de grêle intenses (> 50 mm/h).'
      },
      {
        question: 'Pourquoi le radar montre-t-il parfois de la pluie alors qu\'il ne pleut pas au sol ?',
        answer: 'Ce phénomène naturel s\'appelle la "virga". Il se produit lorsque les gouttes de pluie détectées en altitude par le faisceau radar s\'évaporent dans une couche d\'air sec sous-jacente avant d\'atteindre la surface du sol.'
      },
      {
        question: 'À quelle fréquence les images radar sont-elles renouvelées ?',
        answer: 'La mosaïque radar nationale est régénérée toutes les 5 minutes, assurant un suivi quasi instantané des perturbations et des lignes orageuses en déplacement.'
      },
      {
        question: 'Le radar détecte-t-il les chutes de neige en plaine et en montagne ?',
        answer: 'Oui, la réflectivité de la neige est détectée et représentée avec une palette colorimétrique spécifique, prenant en compte le masque orographique en zone de montagne.'
      }
    ],
    tabId: 'radar'
  },
  '/vigilances': {
    slug: 'vigilances',
    path: '/vigilances',
    canonicalUrl: `${BASE_SITE_URL}/vigilances`,
    title: 'Vigilance Météo France en Direct & Alertes 12 Risques - Instant Météo',
    description: 'Carte officielle de vigilance météorologique Météo-France actualisée en direct. Suivez les alertes sur les 12 phénomènes : orages, vent violent, crues, neige.',
    keywords: 'vigilance météo, vigilance météo france, alerte météo direct, carte vigilance, vigilance orange, vigilance rouge, orages, vent violent, inondation',
    h1: 'Carte Officielle de Vigilance Météorologique Météo-France en Direct',
    h2s: [
      'Matrice Nationale des 101 Départements Métropolitains et Outre-Mer',
      'Surveillance des 12 Phénomènes Réglementaires de Sécurité Civile',
      'Signification des Niveaux de Vigilance : Vert, Jaune, Orange et Rouge',
      'Consignes Officielles de Sécurité et Prévention des Risques'
    ],
    intro: 'La carte de vigilance météorologique d\'Instant Météo restitue le dispositif officiel créé par Météo-France en partenariat avec la Direction Générale de la Sécurité Civile et de la Gestion des Crises (DGSCGC). Destinée à avertir les populations et les services de secours de l\'imminence d\'un phénomène dangereux, elle est réactualisée au minimum deux fois par jour (à 6h et 16h) et en continu lors d\'épisodes critiques.',
    sections: [
      {
        title: 'Les 12 phénomènes météorologiques sous surveillance réglementaire',
        content: 'Le système surveille exhaustivement : vent violent, pluie-inondation, orages, inondations (crues des cours d\'eau pilotées par le SCHAPI), neige-verglas, canicule, grand froid, vagues-submersion, avalanches en montagne, feux de forêts, cyclone en outre-mer et sécheresse hydrologique.'
      },
      {
        title: 'Grille d\'interprétation des 4 niveaux de couleur',
        content: 'Vert : pas de vigilance particulière requise. Jaune : soyez attentif lors d\'activités exposées ou en bord de cours d\'eau. Orange : soyez très vigilant, des phénomènes dangereux sont prévus avec impacts significatifs sur les transports et réseaux. Rouge : vigilance absolue, phénomènes d\'une intensité exceptionnelle menaçant la sécurité des personnes.'
      },
      {
        title: 'Détail par département et heure d\'échéance',
        content: 'Chaque fiche départementale détaille les heures exactes de début et fin prévues pour chaque phénomène, le pic d\'intensité modélisé (rafales maximales, hauteurs d\'eau cumulées, épaisseur de neige) et les bulletins de suivi commentés par les prévisionnistes nationaux.'
      }
    ],
    faq: [
      {
        question: 'Qui décide du passage d\'un département en vigilance Orange ou Rouge ?',
        answer: 'La décision est prise collégialement par les prévisionnistes du Centre National de Prévision de Météo-France, en étroite concertation avec les préfets de zone et le Centre Opérationnel de Gestion Interministérielle des Crises (COGIC).'
      },
      {
        question: 'Quelle est la différence entre une alerte et une vigilance ?',
        answer: 'La vigilance informe 24h à 48h à l\'avance du risque potentiel pour permettre l\'anticipation des secours et des mairies. L\'alerte (ou plan ORSEC) est la phase opérationnelle déclenchée par les autorités préfectorales lorsque le phénomène se concrétise.'
      },
      {
        question: 'Où consulter les consignes de sécurité en cas de vigilance Orange ?',
        answer: 'Directement dans notre interface : limitez vos déplacements, ne vous engagez pas sur une voie immergée, abritez les objets sensibles au vent et tenez-vous informé des évolutions via nos bulletins temps réel.'
      },
      {
        question: 'À quelle heure la carte de vigilance est-elle mise à jour ?',
        answer: 'Elle est mise à jour systématiquement à 06h00 et 16h00, et immédiatement en cours de journée si l\'aggravation d\'une situation météorologique l\'exige.'
      }
    ],
    tabId: 'vigilance'
  },
  '/nuages': {
    slug: 'nuages',
    path: '/nuages',
    canonicalUrl: `${BASE_SITE_URL}/nuages`,
    title: 'Observatoire des Nuages 48h & Néphologie Verticale - Instant Météo',
    description: 'Sondage atmosphérique vertical de 0 à 12 000 m, classification OMM des nuages, base et sommet des couches, risque de givrage et nébulosité 48h.',
    keywords: 'nuages météo, néphologie, sondage atmosphérique, base des nuages, plafond nuageux, cirrus, stratus, cumulonimbus, givrage aviation',
    h1: 'Observatoire des Nuages & Coupe Verticale de l\'Atmosphère sur 48h',
    h2s: [
      'Sondage Atmosphérique Numérique de 0 à 12 000 Mètres d\'Altitude',
      'Classification Internationale des 10 Genres de Nuages (OMM)',
      'Couche Limite, Plafond Nuageux et Base des Couches Réelles',
      'Indices Aéronautiques : Givrage, Turbulences et Visibilité Verticale'
    ],
    intro: 'L\'Observatoire de Néphologie d\'Instant Météo propose une exploration verticale tridimensionnelle de la colonne d\'air au-dessus de votre position géographique. Utilisant les champs de pression, température, humidité spécifique et vitesse verticale du vent issus des modèles haute précision, ce module reconstitue fidèlement la structure nuageuse étage par étage.',
    sections: [
      {
        title: 'Les trois étages de la troposphère et leurs hydrométéores',
        content: 'L\'atmosphère est segmentée en trois étages fondamentaux : l\'étage inférieur (0 à 2 000 m) abritant stratus, stratocumulus et brouillards ; l\'étage moyen (2 000 à 7 000 m) avec altocumulus et altostratus ; et l\'étage supérieur (au-delà de 7 000 m) composé de cristaux de glace formant cirrus, cirrostratus et cirrocumulus.'
      },
      {
        title: 'Nuages à extension verticale et orages',
        content: 'Le modèle surveille l\'indice CAPE (Énergie Potentielle de Convection Disponible) et le soulèvement adiabatique pour quantifier le développement vertical des cumulus congestus et cumulonimbus capables d\'engendrer foudre, rafales descendantes et précipitations diluviennes.'
      },
      {
        title: 'Indicateurs de sécurité aéronautique et outdoor',
        content: 'Visualisez instantanément la base réelle des nuages (cloud base LCL), le niveau de condensation par ascendance, la hauteur du plafond nuageux (BKN/OVC) et les strates critiques sujettes au givrage d\'aéronefs ou aux bancs de brouillard givrant.'
      }
    ],
    faq: [
      {
        question: 'Comment est calculée la base des nuages (plafond nuageux) ?',
        answer: 'La hauteur de la base des nuages est déterminée par le niveau de condensation par ascendance (LCL), calculé à partir de la température et de l\'humidité au sol via la formule empirique d\'Espy et les équations thermo-dynamiques de Clausius-Clapeyron.'
      },
      {
        question: 'Quels sont les 10 genres principaux de nuages surveillés ?',
        answer: 'Cirrus (Ci), Cirrocumulus (Cc), Cirrostratus (Cs), Altocumulus (Ac), Altostratus (As), Nimbostratus (Ns), Stratocumulus (Sc), Stratus (St), Cumulus (Cu) et Cumulonimbus (Cb).'
      },
      {
        question: 'Qu\'est-ce que le risque de givrage en altitude ?',
        answer: 'Le givrage survient lorsque de l\'eau liquide surfondue (maintenue liquide à température négative entre 0°C et -20°C) entre en contact avec une surface solide comme l\'aile d\'un avion ou le sommet d\'une crête de montagne, formant instantanément du givre dur.'
      },
      {
        question: 'À qui s\'adresse l\'observatoire de néphologie ?',
        answer: 'Ce module est indispensable pour les pilotes d\'avion et d\'ULM, les parapentistes, les guides de haute montagne, les photographes du ciel et les astronomes cherchant des créneaux de ciel dégagé.'
      }
    ],
    tabId: 'cloudNephology'
  },
  '/14-jours': {
    slug: '14-jours',
    path: '/14-jours',
    canonicalUrl: `${BASE_SITE_URL}/14-jours`,
    title: 'Prévisions Météo à 14 Jours & Scénarios Probabilistes - Instant Météo',
    description: 'Prévisions météo fiables à 14 jours sur la France : scénarios d\'ensemble multi-modèles (ECMWF, GFS, ICON), probabilités de pluie et indices de confiance.',
    keywords: 'météo 14 jours, prévisions météo 14 jours, tendance 15 jours, modèles météo ensemble, ecmwf 14 jours, probabilité pluie 14 jours',
    h1: 'Prévisions Météo à 14 Jours & Analyse d\'Ensemble Multi-Modèles',
    h2s: [
      'Méthode des Ensembles Probabilistes (EPS / GEFS / ICON-EPS)',
      'Indices de Confiance Météorologique de J+1 à J+14',
      'Scénarios Thermiques : Médiane, Percentiles 10/90 et Écarts Types',
      'Probabilités de Précipitations, Régimes de Temps et Blocages'
    ],
    intro: 'Au-delà de l\'échéance déterministe de 5 à 7 jours, l\'état de l\'atmosphère devient sensible aux conditions initiales (théorie du chaos). Instant Météo déploie une approche probabiliste d\'ensemble comparant plus de 50 scénarios numériques issus des supercalculateurs européens (ECMWF) et américains (NOAA GFS) pour dégager des tendances robustes jusqu\'à 14 jours.',
    sections: [
      {
        title: 'Pourquoi privilégier les prévisions d\'ensemble à 14 jours ?',
        content: 'Une prévision déterministe unique au-delà de 7 jours donne une fausse impression de précision. L\'analyse d\'ensemble exécute des dizaines de simulations avec de légères variations initiales : lorsque les courbes convergent, l\'indice de confiance est maximal ; lorsqu\'elles divergent, les scénarios alternatifs sont clairement exposés.'
      },
      {
        title: 'Régimes de temps synoptiques et indices de blocage',
        content: 'Nos algorithmes classent la circulation atmosphérique nord-atlantique selon 4 grands régimes : Régime d\'Ouest dépressionnaire (NAO+), Blocage Scandinave anticyclonique, Crête Atlantique (Atlantic Ridge) et Dorsale Méditerranéenne, anticipant ainsi les vagues de chaleur ou les coulées polaires.'
      },
      {
        title: 'Intervalles de confiance pour la planification de vos activités',
        content: 'Visualisez sous forme de tubes de probabilités l\'évolution attendue des températures minimales et maximales, la probabilité journalière de précipitations supérieures à 1 mm et à 10 mm, ainsi que les risques de gel tardif ou d\'épisodes caniculaires.'
      }
    ],
    faq: [
      {
        question: 'Quel est le taux de fiabilité d\'une prévision météo à 14 jours ?',
        answer: 'La fiabilité globale d\'une tendance synoptique à 14 jours oscille entre 60% et 75% selon la stabilité du régime de temps en place. En situation de blocage anticyclonique durable, la prévisibilité est excellente ; en flux d\'ouest ondulant, les incertitudes sur le timing des perturbations augmentent.'
      },
      {
        question: 'Comment est calculé l\'indice de confiance (sur 5) ?',
        answer: 'L\'indice de confiance reflète la dispersion statistique des 50 membres de l\'ensemble ECMWF. Un écart-type faible entre tous les membres donne 5/5 (très forte confiance), tandis qu\'un éclatement des scénarios donne 1/5 (faible confiance).'
      },
      {
        question: 'Quels modèles numériques mondiaux sont comparés ?',
        answer: 'Nous comparons en permanence l\'Européen ECMWF IFS, l\'Américain NOAA GFS, l\'Allemand DWD ICON et le Canadien CMC GEM.'
      },
      {
        question: 'À quelle fréquence les calculs à 14 jours sont-ils actualisés ?',
        answer: 'Les ensembles météo mondiaux sont réinitialisés quatre fois par jour (runs 00z, 06z, 12z et 18z) et intégrés automatiquement sur notre plateforme.'
      }
    ],
    tabId: 'scenarios14d'
  },
  '/montagne': {
    slug: 'montagne',
    path: '/montagne',
    canonicalUrl: `${BASE_SITE_URL}/montagne`,
    title: 'Météo Montagne & Nivologie (Bulletins BERA) - Instant Météo',
    description: 'Météo des massifs de montagne en direct : risque d\'avalanche BERA de 1 à 5, relevés des balises Nivôse, isotherme 0°C et limite pluie-neige.',
    keywords: 'météo montagne, bera météo france, risque avalanche, nivologie, balise nivose, isotherme 0, alpes, pyrenees, limite pluie neige',
    h1: 'Météo Montagne, Nivologie & Bulletins d\'Estimation du Risque d\'Avalanche',
    h2s: [
      'Bulletins Officiels BERA Météo-France par Massif Alpin et Pyrénéen',
      'Échelle Européenne du Risque d\'Avalanche de 1 (Faible) à 5 (Très Fort)',
      'Réseau des Balises Nivôse et Hauteurs de Neige de Haute Altitude',
      'Simulateur d\'Isotherme 0°C, Limite Pluie-Neige et Gradient Thermique'
    ],
    intro: 'Le portail Météo Montagne d\'Instant Météo regroupe l\'ensemble des données de sécurité nivologique et météorologique pour les professionnels et amateurs de montagne. Couvrant les Alpes du Nord, les Alpes du Sud, les Pyrénées, le Massif Central, les Vosges, le Jura et la Corse, ce module centralise les bulletins officiels BERA et les stations automatiques Nivôse.',
    sections: [
      {
        title: 'Décryptage du Bulletin d\'Estimation du Risque d\'Avalanche (BERA)',
        content: 'Émis quotidiennement par les centres départementaux de Météo-France durant la saison nivologique, le BERA quantifie la stabilité du manteau neigeux selon l\'échelle européenne normalisée (1-Faible, 2-Limité, 3-Marqué, 4-Fort, 5-Très Fort). Il précise la localisation des plaques à vent, les versants les plus dangereux et les altitudes critiques.'
      },
      {
        title: 'Balises Nivôse de haute altitude',
        content: 'Implantées entre 1 800 et 3 000 mètres d\'altitude en zones isolées d\'altitude, les balises Nivôse mesurent en temps réel l\'épaisseur totale du manteau neigeux par capteur ultrason, la température de la neige, la vitesse du vent sur les crêtes et le cumul de neige fraîche sur 24 heures.'
      },
      {
        title: 'Calculateur d\'isotherme 0°C et limite pluie-neige',
        content: 'Notre simulateur interactif modélise en continu l\'altitude exacte à laquelle la température de l\'air atteint 0°C (isotherme zéro), ainsi que la limite pluie-neige théorique (souvent située 200 à 300 mètres sous l\'isotherme par effet de refroidissement adiabatique de la fonte).'
      }
    ],
    faq: [
      {
        question: 'À quelle heure les bulletins d\'avalanche BERA sont-ils publiés ?',
        answer: 'Les bulletins BERA sont rédigés par les nivologues de Météo-France et publiés chaque après-midi à 16h00 pour le lendemain, avec actualisation matinale si les conditions ont évolué durant la nuit.'
      },
      {
        question: 'Pourquoi le niveau 3 (Marqué) est-il le plus accidentogène ?',
        answer: 'Statistiquement, la majorité des accidents mortels d\'avalanche surviennent au niveau 3. La neige y semble praticable, mais la présence de couches fragiles enfouies rend le déclenchement de plaques particulièrement facile sous le poids d\'un seul skieur ou randonneur.'
      },
      {
        question: 'Quelle est la différence entre isotherme 0°C et limite pluie-neige ?',
        answer: 'L\'isotherme 0°C est l\'altitude dans l\'atmosphère où la température de l\'air ambiant vaut 0°C. Les flocons de neige ne fondent pas instantanément en passant cette altitude : ils peuvent persister sous forme solide sur 200 à 400 mètres de chute supplémentaire, définissant la limite pluie-neige.'
      },
      {
        question: 'Quels équipements sont obligatoires en montagne hors des pistes balisées ?',
        answer: 'Le triptyque DVA (Détecteur de Victimes d\'Avalanche), pelle métallique et sonde rigide est indispensable et non négociable, complété idéalement d\'un sac airbag.'
      }
    ],
    tabId: 'mountain'
  },
  '/plages': {
    slug: 'plages',
    path: '/plages',
    canonicalUrl: `${BASE_SITE_URL}/plages`,
    title: 'Météo des Plages, Marées SHOM & Température de Mer - Instant Météo',
    description: 'Météo du littoral et des plages de France : horaires et coefficients des marées SHOM, température de l\'eau en direct, hauteur de houle et pavillons.',
    keywords: 'météo des plages, marées shom, température mer, météo mer littoral, coefficient marée, hauteur houle, drapeau baignade, baines',
    h1: 'Météo des Plages, Annuaire des Marées SHOM & Température de l\'Eau',
    h2s: [
      'Annuaire Officiel des Marées SHOM : Horaires PM/BM et Coefficients',
      'Température de Surface de la Mer (SST) par Télédétection Satellitaire',
      'État de la Mer, Hauteur Significative de Houle et Période',
      'Sécurité Balnéaire : Drapeaux de Baignade et Prévention des Baïnes'
    ],
    intro: 'Le service Météo des Plages d\'Instant Météo couvre les 5 500 kilomètres de côtes de la Manche, de l\'Océan Atlantique et de la Mer Méditerranée. Combinant les calculs astronomiques officiels du Service Hydrographique et Océanographique de la Marine (SHOM), les observations satellitaires Copernicus et les modèles de vagues Wavewatch III, il fournit toutes les clés pour une sortie côtière en toute sécurité.',
    sections: [
      {
        title: 'Horaires et coefficients de marée certifiés SHOM',
        content: 'Accédez en direct aux heures exactes de Pleine Mer (PM) et Basse Mer (BM), aux hauteurs d\'eau prévues en mètres par rapport au zéro hydrographique et aux coefficients de marée (de 20 pour les mortes-eaux à 120 pour les vives-eaux d\'équinoxe).'
      },
      {
        title: 'Mesure de la température de l\'eau en temps réel',
        content: 'Les températures marines de surface (SST - Sea Surface Temperature) sont issues des radiomètres spatiaux infrarouges de la flotte Sentinel et des bouées océanographiques côtières du réseau Météo-France, actualisées quotidiennement.'
      },
      {
        title: 'Houle, vagues et courants d\'arrachement (baïnes)',
        content: 'Surveillez la hauteur significative des vagues, la période de la houle (en secondes), sa provenance et les alertes spécifiques au phénomène de baïnes et courants de retour sur les côtes de Nouvelle-Aquitaine et de Bretagne.'
      }
    ],
    faq: [
      {
        question: 'Comment est calculé le coefficient de marée ?',
        answer: 'Le coefficient de marée (utilisé principalement sur les côtes françaises de l\'Atlantique et de la Manche) compare l\'amplitude de la marée du jour à l\'amplitude moyenne d\'une marée de vive-eau moyenne à Brest (amplitude étalon de 6,10 mètres, coefficient 100).'
      },
      {
        question: 'Que signifient les couleurs des drapeaux de baignade ?',
        answer: 'Vert : baignade surveillée et sans danger apparent. Jaune : baignade surveillée avec danger limité ou marqué (vagues, courant). Rouge : baignade interdite. Violet : pollution de l\'eau ou présence d\'espèces aquatiques dangereuses (méduses).'
      },
      {
        question: 'Qu\'est-ce qu\'une baïne et comment s\'en échapper ?',
        answer: 'Une baïne est une cuvette d\'eau creusée dans le sable sur le littoral atlantique. À marée montante, l\'eau s\'évacue vers le large par un chenal en créant un violent courant d\'arrachement. Si vous êtes pris, ne luttez jamais à contre-courant : laissez-vous flotter et nagez parallèlement à la plage pour sortir du chenal.'
      },
      {
        question: 'Y a-t-il des marées en Mer Méditerranée ?',
        answer: 'Oui, mais le marnage (différence entre marée haute et marée basse) est très faible en Méditerranée (généralement entre 20 et 40 centimètres), en raison de la configuration fermée du bassin relié à l\'océan par le seul détroit de Gibraltar.'
      }
    ],
    tabId: 'beaches'
  },
  '/secheresse-incendie': {
    slug: 'secheresse-incendie',
    path: '/secheresse-incendie',
    canonicalUrl: `${BASE_SITE_URL}/secheresse-incendie`,
    title: 'Vigilance Sécheresse VigiEau & Météo des Forêts - Instant Météo',
    description: 'Suivi officiel de la sécheresse et du risque incendie : arrêtés préfectoraux de restriction d\'eau VigiEau, Indice Forêt Météo (IFM) et feux NASA FIRMS.',
    keywords: 'vigilance sécheresse, vigieau, restriction eau, météo des forêts, risque incendie forêt, indice forêt météo, ifm météo france, feux nasa firms',
    h1: 'Vigilance Sécheresse VigiEau & Météo des Forêts / Risque Incendie',
    h2s: [
      'Dispositif National de Restriction d\'Usage de l\'Eau VigiEau',
      'Météo des Forêts Officielle et Indice Forêt Météo (IFM)',
      'Détection Satellitaire des Anomalies Thermiques NASA FIRMS',
      'Humidité des Sols, Bilan Hydrique et Arrêtés Préfectoraux'
    ],
    intro: 'La plateforme Sécheresse et Risque Incendie d\'Instant Météo regroupe les données critiques liées aux stress hydriques et feux de végétation sur le territoire métropolitain. Connecté aux bases gouvernementales VigiEau du Ministère de la Transition Écologique, aux prévisions de la Météo des Forêts de Météo-France et aux satellites de télédétection thermique de la NASA, ce tableau de bord offre une vision transparente des crises climatiques.',
    sections: [
      {
        title: 'Les 4 seuils réglementaires de restriction d\'eau VigiEau',
        content: 'Vigilance (sensibilisation aux écogestes), Alerte (interdiction d\'arrosage des pelouses et massifs en journée, réduction des prélèvements agricoles de 30%), Alerte Renforcée (interdiction accrue de lavage de véhicules, arrosage fortement restreint) et Crise (arrêts totaux des prélèvements non prioritaires pour réserver l\'eau potable et la santé).'
      },
      {
        title: 'L\'Indice Forêt Météo (IFM) et la Météo des Forêts',
        content: 'Lancée par Météo-France durant la saison estivale, la Météo des Forêts évalue le danger de feu sur une échelle à 4 niveaux (Faible, Modéré, Élevé, Très Élevé). Elle intègre l\'Indice Forêt Météo (IFM / FWI canadien) qui combine sécheresse des litières de sol (FFMC), vitesse du vent et humidité relative de l\'air.'
      },
      {
        title: 'Surveillance spatiale NASA FIRMS en continu',
        content: 'Les capteurs satellitaires MODIS et VIIRS détectent les anomalies thermiques de surface en orbite polaire et géostationnaire, signalant les foyers d\'incendie actifs et les points chauds sur le territoire.'
      }
    ],
    faq: [
      {
        question: 'Comment savoir si ma commune est soumise à un arrêté sécheresse ?',
        answer: 'En consultant notre module ou le portail officiel VigiEau avec votre code postal ou commune, vous accédez directement aux règles précises applicables à votre adresse selon l\'arrêté préfectoral en vigueur.'
      },
      {
        question: 'Quels comportements sont interdits en niveau Alerte Renforcée ?',
        answer: 'L\'arrosage des jardins potagers est interdit entre 09h et 20h, l\'arrosage des pelouses est totalement interdit, le remplissage des piscines privées est prohibé, tout comme le lavage des véhicules à domicile.'
      },
      {
        question: 'Comment Météo-France calcule-t-elle l\'Indice Forêt Météo (IFM) ?',
        answer: 'L\'IFM est calculé quotidiennement à partir de quatre variables météorologiques mesurées à 12h UTC : la température, l\'humidité relative de l\'air, la vitesse du vent et les précipitations cumulées sur les dernières 24 heures.'
      },
      {
        question: '9 feux sur 10 sont-ils d\'origine humaine ?',
        answer: 'Oui, selon les statistiques de la Sécurité Civile, 90% des départs de feux de forêt en France sont d\'origine anthropique (imprudence lors de barbecues, mégots jetés, travaux d\'outillage avec étincelles ou malveillance).'
      }
    ],
    tabId: 'droughtFire'
  },
  '/cours-d-eau': {
    slug: 'cours-d-eau',
    path: '/cours-d-eau',
    canonicalUrl: `${BASE_SITE_URL}/cours-d-eau`,
    title: 'Vigie Cours d\'Eau, Hauteurs & Crues Vigicrues - Instant Météo',
    description: 'Surveillance hydrologique des rivières et fleuves de France en direct : débits instantanés (m³/s), hauteurs d\'eau Vigicrues, niveaux de crue et crues historiques.',
    keywords: 'vigie cours d eau, vigicrues, hauteur eau riviere, debit m3s, crue inondation, schapi, station hydrometrique, crues historiques',
    h1: 'Vigie Cours d\'Eau, Niveaux des Rivières & Prévention des Crues Vigicrues',
    h2s: [
      'Réseau National des Stations Limnimétriques et Hydrométriques Hub\'Eau',
      'Hauteurs d\'Eau Instantanées (m) et Débits Mesurés en Temps Réel (m³/s)',
      'Vigilance Crues SCHAPI : Niveaux Vert, Jaune, Orange et Rouge',
      'Comparaisons aux Seuils Historiques et Débordements Notables'
    ],
    intro: 'L\'observatoire Vigie Cours d\'Eau d\'Instant Météo restitue les données hydrologiques du réseau public Vigicrues, piloté par le Service Central d\'Hydrométéorologie et d\'Appui à la Prévision des Inondations (SCHAPI). Grâce à plus de 3 000 stations limnimétriques automatiques réparties sur les bassins versants français (Seine, Loire, Garonne, Rhône, Rhin, fleuves côtiers), suivez l\'onde de crue minute par minute.',
    sections: [
      {
        title: 'Mesures limnimétriques et débitmétriques haute fréquence',
        content: 'Chaque station enregistre en continu la hauteur d\'eau (en mètres par rapport au zéro d\'échelle locale) par sonde radar ou capteur piézorésistif, et calcule le débit instantané (en mètres cubes par seconde m³/s) via les courbes de tarage hydrauliques officielles.'
      },
      {
        title: 'Niveaux de vigilance crues et dynamique d\'inondation',
        content: 'Vert : situation normale. Jaune : risque de crue génératrice de débordements localisés et montée rapide des eaux. Orange : risque de crue majeure avec débordements importants impactant les zones urbanisées et les axes de communication. Rouge : risque de crue exceptionnelle menaçant directement la sécurité des biens et des personnes.'
      },
      {
        title: 'Historique des grandes crues et repères patrimoniaux',
        content: 'Confrontez la hauteur d\'eau observée aux plus grands événements hydrologiques enregistrés sur la même station (crues centennales de 1910, crues majeures de 1982, 2003, 2016 ou 2021).'
      }
    ],
    faq: [
      {
        question: 'Quelle est la différence entre une crue lente et une crue éclair cévenole ?',
        answer: 'Une crue lente survient sur de grands bassins de plaine (Seine, Loire) après des semaines de pluies continues, avec une montée des eaux prévisible sur plusieurs jours. Une crue éclair (épisodes cévenols ou méditerranéens) frappe de petits bassins pentus en quelques heures seulement avec une violence extrême.'
      },
      {
        question: 'Comment sont établies les prévisions de hauteur d\'eau de Vigicrues ?',
        answer: 'Les prévisionnistes utilisent des modèles de propagation hydraulique alimentés par les cumuls de pluie observés au radar et les prévisions pluviométriques à très court terme du modèle AROME.'
      },
      {
        question: 'Que faire en cas de vigilance Crue Orange ou Rouge dans ma commune ?',
        answer: 'Ne descendez sous aucun prétexte dans les sous-sols ou parkings souterrains, éloignez-vous impérativement des berges et des ponts, ne vous engagez jamais à pied ou en voiture sur une voie inondée (30 cm d\'eau suffisent à emporter un véhicule) et montez dans les étages supérieurs.'
      },
      {
        question: 'D\'où proviennent les données hydrométriques affichées ?',
        answer: 'Les données proviennent directement des serveurs ouverts Hub\'Eau et du réseau national de surveillance des cours d\'eau Vigicrues géré par le Ministère de la Transition Écologique.'
      }
    ],
    tabId: 'watercourses'
  },
  '/cartes-thematiques': {
    slug: 'cartes-thematiques',
    path: '/cartes-thematiques',
    canonicalUrl: `${BASE_SITE_URL}/cartes-thematiques`,
    title: 'Cartes Météo Thématiques & Environnementales - Instant Météo',
    description: 'Cartes météo thématiques haute résolution : qualité de l\'air AQI, indice UV, températures marines SST, anomalies climatiques et modélisation des vents.',
    keywords: 'cartes météo thématiques, carte qualité air, carte uv france, carte sst température mer, carte vent france, anomalies thermiques',
    h1: 'Cartes Météorologiques Thématiques & Environnementales Interactives',
    h2s: [
      'Qualité de l\'Air et Dispersion des Particules Fines (Copernicus CAMS)',
      'Rayonnement Ultraviolet Solaire et Indice UV Maximal du Jour',
      'Température de Surface des Mers (SST) et Bassins Océaniques',
      'Champ de Vent Synoptique, Rafales et Lignes de Convergence'
    ],
    intro: 'L\'espace Cartes Thématiques d\'Instant Météo réunit la cartographie environnementale avancée pour comprendre l\'ensemble des dynamiques terrestres et marines. Grâce aux visualisations vectorielles interactives, observez la circulation des masses d\'air, les panaches de pollution particulaire, le rayonnement UV et les gradients thermiques marins.',
    sections: [
      {
        title: 'Indice de qualité de l\'air et composition atmosphérique',
        content: 'Suivez la concentration de particules en suspension PM2.5 et PM10, le dioxyde d\'azote (NO2), le dioxyde de soufre (SO2) et l\'ozone troposphérique (O3) en liaison avec les alertes préfectorales de pic de pollution.'
      },
      {
        title: 'Cartographie de l\'indice UV et photo-protection',
        content: 'Visualisez la répartition spatiale de l\'indice UV international (échelle de 1 à 11+) calculé pour le midi solaire, tenant compte de l\'angle zénithal du soleil, de la couche d\'ozone stratosphérique et de l\'albédo du sol.'
      },
      {
        title: 'Météorologie marine et température des mers',
        content: 'Analysez les anomalies thermiques marines, le phénomène de remontée d\'eau froide (upwelling) sur les côtes méditerranéennes sous l\'effet du mistral et de la tramontane, et les courants de surface.'
      }
    ],
    faq: [
      {
        question: 'À quelle fréquence les cartes thématiques sont-elles actualisées ?',
        answer: 'Les cartes de vent et de pluie sont renouvelées toutes les 15 minutes, les cartes de qualité de l\'air toutes les heures, et les cartes de température marine SST une fois par jour à l\'issue des passes satellitaires nocturnes.'
      },
      {
        question: 'À partir de quel indice UV la protection solaire devient-elle indispensable ?',
        answer: 'Dès l\'indice UV 3 (niveau modéré), l\'Organisation Mondiale de la Santé recommande le port de lunettes solaires avec filtre UV, l\'application de crème solaire et le port d\'un chapeau, particulièrement pour les enfants.'
      },
      {
        question: 'Comment fonctionne la modélisation des vents sur les cartes ?',
        answer: 'Le champ vectoriel des vents (flèches et particules en mouvement) représente la vitesse et la direction du vent à 10 mètres de hauteur calculées par le modèle météorologique AROME de Météo-France.'
      },
      {
        question: 'Peut-on superposer le radar des précipitations avec la carte des vents ?',
        answer: 'Oui, notre moteur cartographique permet l\'activation simultanée des calques de précipitations, de vent, de pression isobarique et de nébulosité.'
      }
    ],
    tabId: 'radar'
  },
  '/sports': {
    slug: 'sports',
    path: '/sports',
    canonicalUrl: `${BASE_SITE_URL}/sports`,
    title: 'Météo Sportive & Calculateur d\'Itinéraire Trajet - Instant Météo',
    description: 'Indices de confort météo pour vos activités sportives (running, vélo, rando, nautisme) et calculateur météo étape par étape le long de vos trajets.',
    keywords: 'météo sportive, météo vélo, météo running, météo randonnée, météo trajet itinéraire, indice confort sport, vent vélo',
    h1: 'Météo Sportive & Calculateur de Conditions le Long d\'un Trajet',
    h2s: [
      'Indices de Confort Météo par Discipline (Cyclisme, Course à Pied, Randonnée)',
      'Calculateur Météo d\'Itinéraire Routier et Pédestre Pas à Pas',
      'Sensibilité au Vent, Rafales Latérales et Pression Aérodynamique',
      'Créneaux Optimaux de Sortie Outdoor et Évitement des Averses'
    ],
    intro: 'Que vous soyez cycliste préparant une sortie de 100 km, coureur à pied cherchant la fraîcheur matinale ou voyageur sur les autoroutes françaises, la Météo Sportive et Trajet d\'Instant Météo calcule précisément l\'impact des éléments sur votre parcours. Notre algorithme évalue le stress thermique, le risque d\'aquaplanage et la composante du vent (vent de face, dos ou latéral).',
    sections: [
      {
        title: 'Calculateur météo le long de votre itinéraire étape par étape',
        content: 'Saisissez votre point de départ, votre destination et votre heure de départ : notre moteur découpe votre itinéraire et calcule la météo exacte (température, pluie, vent, visibilité) à chaque point de passage selon votre vitesse moyenne de progression estimée.'
      },
      {
        title: 'Indices d\'aptitude sportive par discipline',
        content: 'Chaque sport possède sa propre sensibilité : le cyclisme est fortement pénalisé par le vent et la chaussée mouillée ; le trail et la randonnée dépendent des orages et du froid d\'altitude ; les sports nautiques exigent une analyse pointue de la force et direction des rafales.'
      },
      {
        title: 'Optimisation de vos fenêtres d\'entraînement',
        content: 'Notre système passe au crible les 48 prochaines heures pour identifier les meilleures fenêtres horaires sans pluie, avec température optimale (entre 12°C et 20°C pour la course à pied) et vent faible.'
      }
    ],
    faq: [
      {
        question: 'Comment fonctionne le calculateur météo d\'itinéraire ?',
        answer: 'Il interroge l\'API de routage cartographique pour calculer votre tracé, puis géolocalise chaque tronçon pour extraire la prévision météo à l\'heure exacte où vous vous trouverez sur chaque portion du trajet.'
      },
      {
        question: 'Comment est calculé le vent pour les cyclistes ?',
        answer: 'L\'algorithme projette le vecteur vent sur le cap de déplacement de votre vélo pour calculer la composante exacte de vent de face (qui augmente la résistance aérodynamique) ou de vent latéral (danger d\'écart de trajectoire).'
      },
      {
        question: 'Quels sports sont pris en compte dans les indices ?',
        answer: 'Course à pied / running, cyclisme sur route, gravel / VTT, randonnée pédestre et trail, golf, tennis extérieur et sports nautiques (voile, paddle, kayak).'
      },
      {
        question: 'Le système signale-t-il les risques d\'aquaplanage sur autoroute ?',
        answer: 'Oui, si des intensités de précipitation supérieures à 15 mm/h sont modélisées sur votre trajet autoroutier, une alerte spécifique d\'aquaplanage et de réduction de vitesse recommandée est générée.'
      }
    ],
    tabId: 'sportsActivities'
  },
  '/bulletins': {
    slug: 'bulletins',
    path: '/bulletins',
    canonicalUrl: `${BASE_SITE_URL}/bulletins`,
    title: 'Bulletins Prévisions Rédigés J+1 à J+7 & 4 Semaines - Instant Météo',
    description: 'Bulletins météorologiques complets rédigés par nos experts pour votre commune, département et échelle nationale. Analyses synoptiques de J+1 à 4 semaines.',
    keywords: 'bulletin météo rédigé, prévisions écrites météo, analyse synoptique, bulletin départemental, tendance 4 semaines, situation générale france',
    h1: 'Bulletins Météorologiques Rédigés : Commune, Département & France',
    h2s: [
      'Synthèse Synoptique Nationale et Analyse des Centres d\'Action',
      'Bulletins Textuels Détaillés de J+1 à J+7 par Département',
      'Tendances Climatologiques à 4 Semaines et Anomalies Moyennes',
      'Commentaires d\'Experts sur l\'Évolution des Masses d\'Air'
    ],
    intro: 'Les chiffres et les pictogrammes ne remplacent pas une véritable analyse textuelle structurée. Les bulletins d\'Instant Météo décrivent avec précision l\'évolution synoptique globale, le positionnement des anticyclones et des dépressions, les passages frontaux (front chaud, front froid, occlusion) et leurs conséquences concrètes sur chaque région.',
    sections: [
      {
        title: 'Le bulletin départemental quotidien rédigé',
        content: 'Chaque matin et chaque soir, un bulletin complet détaille la chronologie de la journée : conditions du matin, évolution de l\'après-midi, risques d\'ondées vespérales, températures minimales et maximales attendues, ainsi que la fiabilité de la prévision.'
      },
      {
        title: 'Tendance synoptique nationale à moyenne échéance',
        content: 'Suivez le comportement du courant-jet (jet stream), les advections d\'air subtropical saharien ou polaire maritime, et l\'organisation des ondulations planétaires de Rossby qui gouvernent la météo européenne.'
      },
      {
        title: 'Perspectives climatologiques à 4 semaines',
        content: 'Basées sur les modèles mensuels du Centre Européen (ECMWF Extended), nos analyses à 4 semaines projettent les anomalies probables de température et de précipitations pour anticiper la gestion agricole et énergétique.'
      }
    ],
    faq: [
      {
        question: 'À quelle heure les bulletins rédigés sont-ils mis à jour ?',
        answer: 'Les bulletins quotidiens sont rédigés et mis à jour deux fois par jour (vers 06h30 et 17h30), et les tendances hebdomadaires sont renouvelées chaque lundi et jeudi soir.'
      },
      {
        question: 'Comment est élaborée l\'analyse synoptique ?',
        answer: 'Elle s\'appuie sur la lecture experte des cartes de géopotentiel à 500 hPa, de température de la masse d\'air à 850 hPa (environ 1 500 m d\'altitude) et des champs de pression de surface.'
      },
      {
        question: 'Les bulletins couvrent-ils les départements d\'outre-mer ?',
        answer: 'Oui, des synthèses régulières intègrent les spécificités cycloniques et de mousson des zones Antilles-Guyane et Océan Indien.'
      },
      {
        question: 'Peut-on recevoir les bulletins météo par notification ?',
        answer: 'Oui, vous pouvez activer les alertes de synthèse quotidienne dans vos préférences de notification sur l\'application.'
      }
    ],
    tabId: 'bulletin'
  },
  '/archives': {
    slug: 'archives',
    path: '/archives',
    canonicalUrl: `${BASE_SITE_URL}/archives`,
    title: 'Archives Météo Journalières & Historique depuis 2000 - Instant Météo',
    description: 'Consultez l\'historique météo complet pour toute date passée depuis 2000 : températures relevées, précipitations, ensoleillement et records climatiques.',
    keywords: 'archives météo, historique météo france, météo date passée, météo hier, archives température, records météo historiques, climatologie passée',
    h1: 'Archives Météorologiques Journalières & Historique des Données depuis 2000',
    h2s: [
      'Recherche Rétrospective par Date et Commune de France',
      'Températures Minimales (Tn), Maximales (Tx) et Moyennes Réelles',
      'Cumuls Pluviométriques Enregistrés et Événements Remarquables',
      'Comparaison avec les Records Historiques Absolus de la Station'
    ],
    intro: 'Quel temps faisait-il le jour de votre naissance, lors de votre mariage ou pendant la canicule historique de 2003 ? Le module Archives Météo d\'Instant Météo donne accès à plus de deux décennies d\'observations météorologiques numérisées et validées pour l\'ensemble des stations du réseau national français.',
    sections: [
      {
        title: 'Exploration historique intuitive par calendrier',
        content: 'Sélectionnez n\'importe quelle date depuis le 1er janvier 2000 pour retrouver instantanément la météo observée : température minimale de l\'aube, température maximale de l\'après-midi, cumul de pluie en 24h, rafale maximale de vent et temps sensible dominant.'
      },
      {
        title: 'Validation des données et réanalyses météorologiques ERA5',
        content: 'Pour les communes ne disposant pas d\'une station physique continue, nous utilisons les réanalyses atmosphériques à haute résolution ERA5-Land du programme Copernicus, garantissant une précision spatiale de 9 kilomètres sur toute la France.'
      },
      {
        title: 'Statistiques climatologiques et records de station',
        content: 'Comparez la journée consultée aux records absolus de chaleur ou de froid jamais enregistrés sur la station locale, ainsi qu\'au climat moyen observé sur le mois correspondant.'
      }
    ],
    faq: [
      {
        question: 'Jusqu\'à quelle date remontent les archives météo disponibles ?',
        answer: 'Nos archives couvrent l\'ensemble de la période allant du 1er janvier 2000 jusqu\'à hier, avec une profondeur statistique de référence remontant à 1950 pour les records de température absolus des grandes stations.'
      },
      {
        question: 'Ces relevés historiques peuvent-ils servir pour une déclaration d\'assurance ?',
        answer: 'Nos données permettent de vérifier avec certitude la survenue d\'un événement (vent violent, fortes pluies, gel). Pour un dossier d\'indemnisation officiel d\'assurance, un certificat officiel d\'intempéries Météo-France peut être requis juridiquement.'
      },
      {
        question: 'Les archives incluent-elles les chutes de neige ?',
        answer: 'Oui, les hauteurs de neige fraîche et la présence de neige au sol sont consignées dans nos registres hivernaux historiques.'
      },
      {
        question: 'Comment sont corrigées les données manquantes sur les petites communes ?',
        answer: 'Grâce à l\'interpolation spatiale krigée et aux réanalyses atmosphériques ERA5 qui reconstituent l\'atmosphère avec les lois de la physique pour chaque kilomètre carré.'
      }
    ],
    tabId: 'weatherArchive'
  },
  '/monde-catastrophes': {
    slug: 'monde-catastrophes',
    path: '/monde-catastrophes',
    canonicalUrl: `${BASE_SITE_URL}/monde-catastrophes`,
    title: 'Météo Monde, Tornades & Catastrophes Naturelles 24h - Instant Météo',
    description: 'Suivi mondial des phénomènes météo extrêmes en direct : cyclones, typhons, tornades, inondations historiques et canicules record dans le monde entier.',
    keywords: 'météo monde, cyclones en direct, suivi tornades usa, catastrophes naturelles météo, canicule mondiale, typhons direct, noaa spc',
    h1: 'Observatoire Météorologique Mondial des Catastrophes & Phénomènes Extrêmes',
    h2s: [
      'Suivi en Temps Réel des Bassins Cycloniques Mondiaux (Ouragans & Typhons)',
      'Détection des Épisodes de Tornades et Orages Supercellulaires (NOAA SPC)',
      'Anomalies Thermiques Planétaires et Records Mondiaux de Température',
      'Bilans et Analyses Validés par les Agences Internationales de Référence'
    ],
    intro: 'L\'Observatoire International d\'Instant Météo scrute en permanence les événements météorologiques violents à l\'échelle du globe. Alimenté par le National Hurricane Center (NHC), le Storm Prediction Center (SPC) de la NOAA, le Joint Typhoon Warning Center (JTWC) et l\'Organisation Météorologique Mondiale (OMM), ce module offre une fenêtre temps réel sur les furies de l\'atmosphère planétaire.',
    sections: [
      {
        title: 'Traque des cyclones tropicaux, ouragans et typhons',
        content: 'Visualisez les trajectoires prévues par les modèles globaux, les catégories sur l\'échelle de Saffir-Simpson (1 à 5), la pression centrale minimale en hectopascals (hPa), les vents maximaux soutenus et les marées de tempête générées sur les zones côtières.'
      },
      {
        title: 'Surveillance des tornades et supercellules géantes',
        content: 'Suivez les corridors de tornades (Tornado Alley américaine, plaines d\'Amérique du Sud, Europe) avec les alertes officielles PDS (Particularly Dangerous Situation) et les rapports de dégâts sur l\'échelle de Fujita améliorée (EF0 à EF5).'
      },
      {
        title: 'Veille sur les vagues de chaleur et de froid polaires extrêmes',
        content: 'Consultez les températures extrêmes mesurées sur les stations mondiales : des +54°C dans la Vallée de la Mort ou au Moyen-Orient aux -60°C en Sibérie et sur le plateau antarctique, avec mise en contexte du réchauffement climatique global.'
      }
    ],
    faq: [
      {
        question: 'Quelle est la différence entre un cyclone, un ouragan et un typhon ?',
        answer: 'Ce sont physiquement les mêmes phénomènes : des cyclones tropicaux intenses. Le nom varie selon la région géographique : "ouragan" dans l\'Atlantique Nord et le Pacifique Nord-Est, "typhon" dans le Pacifique Nord-Ouest, et "cyclone" dans l\'Océan Indien et le Pacifique Sud.'
      },
      {
        question: 'Comment une tornade est-elle classée sur l\'échelle de Fujita (EF) ?',
        answer: 'La classification (de EF0 à EF5) ne se fait pas pendant la tornade mais a posteriori, par l\'analyse méticuleuse des dégâts structurels causés aux habitations et à la végétation par les enquêteurs météo sur le terrain.'
      },
      {
        question: 'Quelles sont les agences météorologiques internationales partenaires ?',
        answer: 'Nous agrégeons les données certifiées du National Weather Service (NWS / NOAA), de Météo-France Outre-Mer, de l\'agence japonaise JMA, du Bureau of Meteorology australien (BOM) et du Met Office britannique.'
      },
      {
        question: 'À quelle fréquence les bulletins cycloniques mondiaux sont-ils mis à jour ?',
        answer: 'Toutes les 6 heures en situation nominale, et toutes les 3 heures lorsqu\'un système cyclonique s\'approche à moins de 48h des côtes habitées.'
      }
    ],
    tabId: 'worldDisasters'
  },
  '/climat': {
    slug: 'climat',
    path: '/climat',
    canonicalUrl: `${BASE_SITE_URL}/climat`,
    title: 'Évolution du Climat & Tendances Saisonnières 8 Mois - Instant Météo',
    description: 'Comprendre le changement climatique local et les tendances saisonnières à 8 mois en France. Analyse des anomalies, cycles ENSO et réchauffement.',
    keywords: 'évolution climat, changement climatique france, tendances saisonnières 8 mois, el nino la nina, réchauffement climatique local, normales 1991-2020',
    h1: 'Évolution du Climat, Tendances Saisonnières à 8 Mois & Indices Globaux',
    h2s: [
      'Projections Climatiques Saisonnières à 8 Mois (Copernicus C3S / ECMWF SEAS5)',
      'Oscillations Océan-Atmosphère : El Niño / La Niña (ENSO) et NAO',
      'Trajectoire du Réchauffement Climatique Observé dans votre Commune',
      'Bilan Pluviométrique Annuel et Évaporation des Sols'
    ],
    intro: 'Le laboratoire climatique d\'Instant Météo met en perspective la météo quotidienne avec les grandes dynamiques du système Terre. À travers les prévisions saisonnières étendues sur 8 mois et les données de référence du GIEC et de Météo-France, découvrez comment évolue le climat de votre terroir sous l\'effet du dérèglement climatique global.',
    sections: [
      {
        title: 'Prévisions saisonnières multi-modèles sur 8 mois',
        content: 'Les modèles saisonniers (ECMWF SEAS5, Météo-France Système 8, NCEP CFSv2) ne prévoient pas le temps d\'un jour précis, mais calculent si les prochains mois seront globalement plus chauds, plus froids, plus secs ou plus humides que les normales trentenaires de référence.'
      },
      {
        title: 'L\'empreinte locale du réchauffement climatique',
        content: 'Visualisez l\'évolution des températures moyennes annuelles, l\'augmentation du nombre de jours de fortes chaleurs (> 30°C) et de nuits tropicales (> 20°C), ainsi que la diminution spectaculaire des jours de gelée blanche depuis 1960 dans votre département.'
      },
      {
        title: 'Oscillations climatiques majeures : ENSO, NAO et QBO',
        content: 'Suivez les téléconnexions atmosphériques à grande échelle : les phases El Niño ou La Niña dans le Pacifique équatorial, et l\'Oscillation Nord-Atlantique (NAO) qui pilote la trajectoire des tempêtes hivernales vers l\'Europe.'
      }
    ],
    faq: [
      {
        question: 'Comment une prévision saisonnière à 8 mois est-elle possible ?',
        answer: 'L\'atmosphère est couplée aux océans qui possèdent une inertie thermique colossale. La température des eaux de surface océaniques (Pacifique, Atlantique) influence la position durable des centres de haute et basse pression pendant plusieurs mois.'
      },
      {
        question: 'Qu\'est-ce que l\'Oscillation Nord-Atlantique (NAO) ?',
        answer: 'La NAO mesure la différence de pression entre l\'Anticyclone des Açores et la Dépression d\'Islande. En phase positive (NAO+), les perturbations pluvieuses et douces balayent l\'Europe du Nord ; en phase négative (NAO-), le flux d\'ouest ralentit, favorisant les vagues de froid ou la pluie en Méditerranée.'
      },
      {
        question: 'Comment sont définies les normales climatiques 1991-2020 ?',
        answer: 'Selon les normes de l\'OMM, les normales représentent la moyenne arithmétique calculée sur 30 ans consécutifs. La période 1991-2020 est la référence officielle actuelle, plus chaude de +0,4°C à +0,9°C que la précédente période 1981-2010.'
      },
      {
        question: 'Le réchauffement climatique est-il uniforme sur toute la France ?',
        answer: 'Non. En France métropolitaine, le réchauffement est plus marqué à l\'intérieur des terres, dans l\'Est et en haute montagne alpine qu\'en bordure de l\'Océan Atlantique qui amortit temporairement la hausse des températures.'
      }
    ],
    tabId: 'eightMonths'
  },
  '/communaute': {
    slug: 'communaute',
    path: '/communaute',
    canonicalUrl: `${BASE_SITE_URL}/communaute`,
    title: 'Salon Météo & Observatoire Citoyen Collaboratif - Instant Météo',
    description: 'Partagez vos relevés du ciel en direct avec la communauté Instant Météo : signalements météo géolocalisés, échanges entre passionnés et photos météo.',
    keywords: 'communauté météo, salon météo, forum météo france, signalements citoyens météo, observatoire météo collaboratif, passionnés météo',
    h1: 'Salon de Discussion Météorologique & Observatoire Citoyen Collaboratif',
    h2s: [
      'Signalements Météo Citoyens Géolocalisés en Temps Réel',
      'Salon d\'Échange Direct entre Passionnés et Observateurs Locaux',
      'Validation Communautaire des Phénomènes Rares et Violents',
      'Défis Météorologiques et Badges d\'Expertise Climatique'
    ],
    intro: 'La météorologie est avant tout une passion collective de terrain. Le salon communautaire d\'Instant Météo rassemble des milliers d\'observateurs bénévoles, chasseurs d\'orages, agriculteurs et amateurs éclairés qui partagent leurs constats en direct pour enrichir la précision des modèles.',
    sections: [
      {
        title: 'Signalements météo citoyens instantanés',
        content: 'Postez en un clic ce que vous observez depuis votre fenêtre : orage en cours, averse de grêle, neige qui commence à tenir au sol, nappe de brouillard épais ou coup de vent violent. Les autres utilisateurs confirment le signalement en temps réel.'
      },
      {
        title: 'Salons de discussion par thématique et région',
        content: 'Échangez sur les prévisions des prochains jours, partagez vos photos de nuages exceptionnels (mammatus, arcus, arc-en-ciel, parhélies) et confrontez les sorties des modèles numériques dans le respect de notre charte bienveillante.'
      },
      {
        title: 'Système de ligue et réputation participative',
        content: 'Chaque signalement validé, chaque observation régulière et chaque défi météo réussi vous rapporte des points de sentinelle météorologique, débloquant des titres honorifiques d\'Apprenti Météo à Grand Maître Cumulonimbus.'
      }
    ],
    faq: [
      {
        question: 'Comment poster un signalement météo sur la carte ?',
        answer: 'Cliquez sur l\'icône de signalement météo, choisissez le pictogramme correspondant au phénomène observé (soleil, pluie modérée, grêle, neige, orage), ajustez la température si nécessaire et validez : votre repère apparaît instantanément sur la carte nationale.'
      },
      {
        question: 'Comment sont modérés les messages du salon ?',
        answer: 'Nos administrateurs et modérateurs veillent en permanence au respect de la courtoisie et de la pertinence des échanges. Les comportements abusifs ou propos haineux sont immédiatement sanctionnés par un bannissement du compte.'
      },
      {
        question: 'Mes coordonnées GPS exactes sont-elles divulguées ?',
        answer: 'Non, pour protéger la vie privée des utilisateurs, les coordonnées géographiques sont automatiquement associées au centre de la commune ou floutées à l\'échelle du quartier.'
      },
      {
        question: 'Puis-je synchroniser mes points et badges entre mon téléphone et mon PC ?',
        answer: 'Oui, votre profil joueur et vos statistiques se synchronisent instantanément via notre base de données sécurisée dès que vous renseignez votre pseudo.'
      }
    ],
    tabId: 'discussionGroup'
  },
  '/competition': {
    slug: 'competition',
    path: '/competition',
    canonicalUrl: `${BASE_SITE_URL}/competition`,
    title: 'Ligue Météo & Défi des Prévisionnistes - Instant Météo',
    description: 'Participez à la Ligue Météo Instant Météo : gagnez des points d\'observation, accumulez les séries de flammes (streaks) et grimpez dans le classement.',
    keywords: 'jeu météo, ligue météo, points prévision, classement météo, badges météo, quiz météo france, défi météo',
    h1: 'Ligue des Sentinelles Météo & Classement National des Observateurs',
    h2s: [
      'Classement National en Temps Réel et Top des Observateurs',
      'Séries Quotidiennes (Streaks) et Multiplicateurs de Score',
      'Collection des 10 Badges Thématiques Météorologiques',
      'Synchronisation Multi-Plateformes Téléphone & Ordinateur'
    ],
    intro: 'Transformez votre intérêt pour le ciel en un jeu stimulant et éducatif. La Ligue des Sentinelles Météo récompense la régularité et la pertinence de vos observations quotidiennes à travers un système de points, de flammes de fidélité et de classements régionaux et nationaux.',
    sections: [
      {
        title: 'Mécanique des points et multiplicateurs de série',
        content: 'Chaque consultation quotidienne, chaque observation de phénomène météo et chaque exploration d\'une nouvelle commune vous attribue des points d\'expérience. Maintenez votre série de jours consécutifs (streak) pour multiplier vos gains.'
      },
      {
        title: 'Collectionnez les 10 badges de maîtrise météorologique',
        content: 'Débloquez les trophées exclusifs : Soleil Radieux, Chasseur de Pluie, Maître des Orages, Sentinelle des Neiges, Résistant au Gel, Percepteur de Brouillard, Vigie des Tempêtes, Dompteur de Canicule, Explorateur d\'Altitude et Veilleur Nocturne.'
      },
      {
        title: 'Une compétition saine et éducative',
        content: 'L\'objectif de la ligue est d\'encourager l\'apprentissage des sciences atmosphériques et l\'observation attentive de la nature qui nous entoure.'
      }
    ],
    faq: [
      {
        question: 'Comment accumuler des points dans la ligue météo ?',
        answer: 'Vous gagnez des points en consultant l\'application quotidiennement (+15 pts), en partageant un signalement météo (+30 pts), en explorant de nouvelles communes (+10 pts) et en maintenant votre série de visites actives.'
      },
      {
        question: 'Que se passe-t-il si je manque un jour de visite ?',
        answer: 'Votre compteur de jours consécutifs (flammes / streak) est réinitialisé à 1 jour, mais votre total de points cumulés et vos badges déjà débloqués restent définitivement acquis.'
      },
      {
        question: 'Les classements sont-ils mis à jour en temps réel ?',
        answer: 'Oui, le classement TOP mondial et national est synchronisé instantanément sur notre serveur central dès qu\'un utilisateur marque de nouveaux points.'
      },
      {
        question: 'Comment puis-je devenir Grand Maître Cumulonimbus ?',
        answer: 'Ce titre suprême est automatiquement décerné aux sentinelles météo ayant accumulé plus de 3 000 points d\'expérience et validé l\'ensemble des 10 badges d\'observation.'
      }
    ],
    tabId: 'competitive'
  }
};

/**
 * Normalise un chemin d'URL pour retrouver l'objet SEO correspondant
 */
export function getSeoDataForPath(rawPath: string): PageSeoItem {
  let clean = (rawPath || '/').split('?')[0].split('#')[0].trim();
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  if (!clean) clean = '/';

  // Alias courants et redirections d'anciennes pages supprimées vers les pages actives équivalentes
  const ALIASES: Record<string, string> = {
    '/previsions': '/14-jours',
    '/previsions-14-jours': '/14-jours',
    '/previsions-meteo': '/14-jours',
    '/radar-pluie': '/radar',
    '/radar-precipitations': '/radar',
    '/alerte': '/vigilances',
    '/alertes': '/vigilances',
    '/vigilance': '/vigilances',
    '/meteo-direct': '/direct',
    '/temps-reel': '/direct',
    '/meteo-montagne': '/montagne',
    '/meteo-des-plages': '/plages',
    '/vigi-secheresse-incendie': '/secheresse-incendie',
    '/secheresse': '/secheresse-incendie',
    '/incendie': '/secheresse-incendie',
    '/vigie-cours-d-eau': '/cours-d-eau',
    '/cours-deau': '/cours-d-eau',
    '/inondations': '/cours-d-eau',
    '/cartes': '/cartes-thematiques',
    '/meteo-sport': '/sports',
    '/tendances': '/14-jours',
    '/tendances-saisonnieres': '/climat',
    '/8-mois': '/climat',
    '/nephologie': '/nuages',
    '/forum': '/communaute',
    '/discussion': '/communaute',
    '/salon': '/communaute',
    '/ligue': '/competition',
    // Redirection des anciennes pages supprimées
    '/webcams': '/direct',
    '/webcam': '/direct',
    '/modeles': '/nuages',
    '/modele': '/nuages',
    '/modeles-meteo': '/nuages'
  };

  const targetPath = ALIASES[clean] || clean;
  if (SEO_PAGES_MAP[targetPath]) {
    return SEO_PAGES_MAP[targetPath];
  }

  // Si le chemin n'est pas répertorié statiquement, générer dynamiquement son objet SEO
  // avec sa PROPRE URL canonique (et JAMAIS celle de la page d'accueil '/')
  const cleanTitle = targetPath
    .replace(/^\//, '')
    .replace(/[-_/]/g, ' ')
    .trim();
  const formattedTitle = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Page Météo';

  return {
    slug: targetPath.replace(/^\//, '').replace(/[/_]/g, '-') || 'page',
    path: targetPath,
    canonicalUrl: `${BASE_SITE_URL}${targetPath}`,
    title: `${formattedTitle} - Instant Météo France`,
    description: `Consultez ${cleanTitle || 'la météo'} en direct sur Instant Météo : prévisions de précision, température temps réel et radar précipitations HD.`,
    keywords: `instant météo, instantmeteo, ${cleanTitle}, météo france, prévisions en direct, température temps réel, radar pluie`,
    h1: `Instant Météo - ${formattedTitle}`,
    h2s: [
      'Données Atmosphériques & Conditions Météo en Direct',
      'Radar Précipitations Doppler Haute Définition',
      'Vigilances Météo-France & Bulletins Experts'
    ],
    intro: `Bienvenue sur l'observatoire Instant Météo dédié à ${cleanTitle || 'la météo en France'}. Retrouvez l'ensemble des mesures en temps réel et des analyses prévisionnelles.`,
    sections: [
      {
        title: 'Précision hyper-locale',
        content: 'Instant Météo agrège les observations directes des stations synoptiques, le réseau radar ARAMIS et les sorties des modèles numériques haute résolution.'
      }
    ],
    faq: [
      {
        question: 'Comment consulter la météo de ma commune ?',
        answer: 'Utilisez la barre de recherche ou activez la géolocalisation pour afficher immédiatement les prévisions de votre secteur.'
      }
    ],
    tabId: 'realtime'
  };
}

/**
 * Mappe un identifiant d'onglet React (NavTabId) vers son chemin d'URL canonique
 */
export function getPathForTabId(tabId: string, currentPath?: string): string {
  if (tabId === 'realtime') {
    const p = currentPath !== undefined ? currentPath : (typeof window !== 'undefined' ? window.location.pathname : '');
    if (p === '/direct') return '/direct';
    if (p === '/') return '/';
    return '/direct';
  }

  const MAP: Record<string, string> = {
    realtime: '/direct',
    cloudNephology: '/nuages',
    vigilance: '/vigilances',
    scenarios14d: '/14-jours',
    radar: '/radar',
    mountain: '/montagne',
    beaches: '/plages',
    droughtFire: '/secheresse-incendie',
    watercourses: '/cours-d-eau',
    eightMonths: '/climat',
    historicalTrends: '/climat',
    sportsActivities: '/sports',
    worldDisasters: '/monde-catastrophes',
    weatherArchive: '/archives',
    bulletin: '/bulletins',
    competitive: '/competition',
    discussionGroup: '/communaute',
    communityReports: '/communaute'
  };

  return MAP[tabId] || '/direct';
}

/**
 * Mappe un chemin d'URL vers son identifiant d'onglet React (NavTabId)
 */
export function getTabIdForPath(rawPath: string): string {
  const page = getSeoDataForPath(rawPath);
  return page.tabId || 'realtime';
}

/**
 * Génère le bloc JSON-LD Schema.org complet pour la page
 */
export function generatePageJsonLd(page: PageSeoItem): string {
  const isHome = page.path === '/';

  const graph: any[] = [
    {
      '@type': 'WebPage',
      '@id': `${page.canonicalUrl}#webpage`,
      url: page.canonicalUrl,
      name: page.title,
      description: page.description,
      inLanguage: 'fr-FR',
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${BASE_SITE_URL}/#website`,
        url: `${BASE_SITE_URL}/`,
        name: 'Instant Météo',
        publisher: {
          '@type': 'Organization',
          name: 'Instant Météo',
          url: `${BASE_SITE_URL}/`,
          logo: `${BASE_SITE_URL}/icon-512.png`
        }
      }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${page.canonicalUrl}#breadcrumb`,
      itemListElement: isHome
        ? [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Accueil',
              item: `${BASE_SITE_URL}/`
            }
          ]
        : [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Accueil',
              item: `${BASE_SITE_URL}/`
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: page.h1,
              item: page.canonicalUrl
            }
          ]
    }
  ];

  if (isHome) {
    graph.push({
      '@type': 'WebSite',
      '@id': `${BASE_SITE_URL}/#website`,
      url: `${BASE_SITE_URL}/`,
      name: 'Instant Météo',
      alternateName: ['InstantMétéo', 'Instant Meteo', 'InstantMeteo', 'Instant Météo France'],
      description: page.description,
      inLanguage: 'fr-FR',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_SITE_URL}/?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    });

    graph.push({
      '@type': 'WebApplication',
      '@id': `${BASE_SITE_URL}/#app`,
      name: 'Instant Météo',
      url: `${BASE_SITE_URL}/`,
      applicationCategory: 'WeatherApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      description: page.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR'
      }
    });
  }

  // Si la page contient une FAQ, injecter le type FAQPage pour rich snippets Google
  if (page.faq && page.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${page.canonicalUrl}#faq`,
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    });
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph
  }, null, 2);
}

/**
 * Génère le contenu HTML statique substantiel (H1, H2, paragraphes, sections et FAQ)
 * pour les moteurs de recherche et les navigateurs sans JavaScript.
 */
export function generateStaticHtmlContent(page: PageSeoItem): string {
  const sectionsHtml = page.sections
    .map(
      (s) => `
        <article style="margin-bottom: 24px; padding: 20px; background: #1e293b; border-radius: 12px; border: 1px solid #334155;">
          <h2 style="font-size: 1.25rem; font-weight: 700; color: #38bdf8; margin-bottom: 10px;">${escapeHtml(s.title)}</h2>
          <p style="font-size: 0.95rem; line-height: 1.6; color: #cbd5e1; margin: 0;">${escapeHtml(s.content)}</p>
        </article>`
    )
    .join('\n');

  const faqHtml = page.faq
    .map(
      (f, idx) => `
        <details style="margin-bottom: 14px; padding: 16px; background: #1e293b; border-radius: 10px; border: 1px solid #334155;" ${idx === 0 ? 'open' : ''}>
          <summary style="font-weight: 600; font-size: 1.05rem; color: #f1f5f9; cursor: pointer;">${escapeHtml(f.question)}</summary>
          <p style="margin-top: 12px; font-size: 0.95rem; line-height: 1.6; color: #94a3b8;">${escapeHtml(f.answer)}</p>
        </details>`
    )
    .join('\n');

  const internalLinks = Object.entries(SEO_PAGES_MAP)
    .filter(([path]) => path !== page.path && path !== '/')
    .map(
      ([path, item]) => `
        <li style="display: inline-block; margin: 4px 8px 4px 0;">
          <a href="${path}" style="color: #38bdf8; text-decoration: underline; font-size: 0.9rem;">${escapeHtml(item.h1.split(' - ')[0])}</a>
        </li>`
    )
    .join('\n');

  return `
    <header style="max-width: 1100px; margin: 0 auto 32px auto; padding: 28px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #334155;">
      <nav aria-label="Fil d'Ariane" style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;">
        <a href="/" style="color: #38bdf8; text-decoration: none;">Accueil Instant Météo</a> &gt; <span>${escapeHtml(page.h1.split(' - ')[0])}</span>
      </nav>

      <h1 style="font-size: 1.8rem; font-weight: 800; color: #f8fafc; margin-bottom: 16px; line-height: 1.3;">${escapeHtml(page.h1)}</h1>
      <p style="font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 24px;">${escapeHtml(page.intro)}</p>

      <section aria-labelledby="sections-explicatives" style="margin-bottom: 36px;">
        <h2 id="sections-explicatives" style="font-size: 1.4rem; font-weight: 700; color: #e2e8f0; margin-bottom: 18px; border-bottom: 2px solid #334155; padding-bottom: 8px;">Méthodologie Scientifique &amp; Données Publiques de Référence</h2>
        ${sectionsHtml}
      </section>

      <section aria-labelledby="faq-title" style="margin-bottom: 36px;">
        <h2 id="faq-title" style="font-size: 1.4rem; font-weight: 700; color: #e2e8f0; margin-bottom: 18px; border-bottom: 2px solid #334155; padding-bottom: 8px;">Foire Aux Questions (FAQ) - ${escapeHtml(page.h1.split(' - ')[0])}</h2>
        ${faqHtml}
      </section>

      <footer style="padding-top: 20px; border-top: 1px solid #334155;">
        <h3 style="font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-bottom: 12px;">Consulter les autres observatoires météorologiques :</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${internalLinks}
        </ul>
      </footer>
    </header>
  `.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
