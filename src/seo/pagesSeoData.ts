import {
  SEO_PAGES_MAP_EN,
  getSiteBrandForLocale,
  normalizeSupportedLocale,
  SupportedLocaleCode,
} from '../i18n/siteTranslations';

export const BASE_SITE_URL = 'https://instantmeteo.instantmeteofr.workers.dev';

/**
 * Règle Meta Robots unique et uniforme sur les 18 pages du site
 * (Autorise l'indexation complète Google sans directives contradictoires)
 */
export const UNIFIED_ROBOTS_DIRECTIVE = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

/**
 * Langues et variantes régionales prises en charge par l'application
 * Signalées à Google via les balises <link rel="alternate" hreflang="..."> et le Sitemap XML
 */
export const SUPPORTED_HREFLANG_LOCALES = [
  { hreflang: 'fr', param: '', label: 'Français' },
  { hreflang: 'fr-FR', param: '', label: 'Français (France)' },
  { hreflang: 'fr-BE', param: '', label: 'Français (Belgique)' },
  { hreflang: 'fr-CH', param: '', label: 'Français (Suisse)' },
  { hreflang: 'fr-CA', param: '', label: 'Français (Canada)' },
  { hreflang: 'en', param: '?hl=en', label: 'English' },
  { hreflang: 'en-US', param: '?hl=en', label: 'English (US)' },
  { hreflang: 'en-GB', param: '?hl=en', label: 'English (UK)' },
  { hreflang: 'en-CA', param: '?hl=en', label: 'English (Canada)' },
  { hreflang: 'en-AU', param: '?hl=en', label: 'English (Australia)' },
  { hreflang: 'de', param: '?hl=de', label: 'Deutsch' },
  { hreflang: 'es', param: '?hl=es', label: 'Español' },
  { hreflang: 'it', param: '?hl=it', label: 'Italiano' },
  { hreflang: 'pt', param: '?hl=pt', label: 'Português' },
  { hreflang: 'nl', param: '?hl=nl', label: 'Nederlands' },
  { hreflang: 'ar', param: '?hl=ar', label: 'العربية' },
  { hreflang: 'zh-CN', param: '?hl=zh-CN', label: '中文' },
  { hreflang: 'ja', param: '?hl=ja', label: '日本語' },
  { hreflang: 'ru', param: '?hl=ru', label: 'Русский' },
  { hreflang: 'uk', param: '?hl=uk', label: 'Українська' },
] as const;

export const SITEMAP_LANGUAGE_PARAMS: ReadonlyArray<{ code: SupportedLocaleCode; param: string }> = [
  { code: 'fr', param: '' },
  { code: 'en', param: '?hl=en' },
];

export const SITEMAP_HREFLANG_LOCALES = [
  { hreflang: 'fr', param: '' },
  { hreflang: 'en', param: '?hl=en' },
] as const;

export interface PageSeoSection {
  heading: string;
  body: string;
}

export interface PageSeoFaq {
  question: string;
  answer: string;
}

export interface PageSeoMetadata {
  slug: string;
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  h1: string;
  sectionTitle: string;
  breadcrumbName: string;
  tabId: string;
  introParagraph: string;
  sections: PageSeoSection[];
  faq: PageSeoFaq[];
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly';
  priority: string;
}

export type PageSeoItem = PageSeoMetadata;

export const SEO_PAGES_MAP: Record<string, PageSeoMetadata> = {
  '/': {
    slug: 'home',
    path: '/',
    canonicalUrl: `${BASE_SITE_URL}/`,
    title: 'Instant Météo France — Prévisions locales et suivi en temps réel',
    description:
      'Consultez la météo en France pour les 34 965 communes : observations actuelles, prévisions heure par heure, radar des pluies et suivi par département.',
    h1: 'Prévisions météo en France et suivi en temps réel',
    sectionTitle: 'Sources météorologiques et fonctionnement du portail',
    breadcrumbName: 'Accueil Météo France',
    tabId: 'realtime',
    changefreq: 'always',
    priority: '1.0',
    introParagraph:
      'Instant Météo France regroupe sur une interface claire les observations actuelles et les prévisions locales pour les 34 965 communes de France métropolitaine et d’Outre-mer. Recherchez votre ville ou utilisez la géolocalisation pour afficher immédiatement la température, le ressenti au vent, l’évolution heure par heure et la tendance des prochains jours.',
    sections: [
      {
        heading: 'D’où proviennent les données affichées sur le site ?',
        body: 'Cette page centrale réunit en un seul point les principales bases publiques : les modèles numériques AROME (maille fine 1,3 km) et ARPEGE de Météo-France, le modèle européen ECMWF (IFS 9 km), l’imagerie radar RainViewer, les relevés hydrologiques Vigicrues (SCHAPI), les prédictions de marées du SHOM, le suivi des nappes du BRGM, les données satellitaires NASA FIRMS / GIBS et les réanalyses climatiques Copernicus ERA5.',
      },
      {
        heading: 'Adaptation automatique au relief et à l’altitude de chaque commune',
        body: 'Contrairement à une prévision générale par grande agglomération, chaque fiche communale prend en compte l’altitude réelle de la mairie ou du sommet sélectionné. Le gradient thermique vertical et l’exposition aux vents dominants sont ainsi intégrés pour restituer un ressenti fidèle au terrain.',
      },
      {
        heading: 'Navigation rapide entre les outils spécialisés',
        body: 'Depuis l’accueil, vous pouvez basculer vers le radar interactif des précipitations, la carte des vigilances départementales, l’observatoire de la couverture nuageuse ou les bulletins spécialisés pour la montagne, le littoral et les cours d’eau.',
      },
    ],
    faq: [
      {
        question: 'Comment rechercher les prévisions météo de mon village ou de mon quartier ?',
        answer:
          'Utilisez la barre de recherche en haut de page en saisissant le nom de votre commune ou son code postal à 5 chiffres. Les 34 965 communes françaises ainsi que les principaux sommets et plages sont accessibles instantanément.',
      },
      {
        question: 'À quel rythme les observations sont-elles rafraîchies ?',
        answer:
          'Les relevés de température, de vent et de pression sont actualisés toutes les 10 à 15 minutes, tandis que l’imagerie radar suit le déplacement des averses par pas de 5 minutes.',
      },
      {
        question: 'L’accès aux cartes et aux prévisions nécessite-t-il un compte ?',
        answer:
          'Non, l’ensemble des cartes, des bulletins communaux et des outils de suivi est consultable librement et gratuitement, sans création de compte ni abonnement.',
      },
    ],
  },

  '/direct': {
    slug: 'direct',
    path: '/direct',
    canonicalUrl: `${BASE_SITE_URL}/direct`,
    title: 'Météo en direct par commune — Observations actuelles | Instant Météo',
    description:
      'Relevés météo en direct dans votre commune : température sous abri, température ressentie, rafales de vent, humidité, pression et risque d’averse dans l’heure.',
    h1: 'Observations météo en direct par commune',
    sectionTitle: 'Lecture des relevés actuels et du diagnostic heure par heure',
    breadcrumbName: 'Météo en Direct',
    tabId: 'realtime',
    changefreq: 'always',
    priority: '0.95',
    introParagraph:
      'La page Météo en Direct présente l’état immédiat de l’atmosphère au-dessus de votre commune. Elle met l’accent sur les paramètres mesurés à l’instant présent et sur l’évolution prévue au cours des 60 prochaines minutes, afin de vous aider à organiser vos déplacements ou vos activités extérieures.',
    sections: [
      {
        heading: 'Différence entre température sous abri et température ressentie',
        body: 'La température affichée correspond à une mesure standardisée à 2 mètres du sol sous abri ventilé. L’indice de ressenti combine cette valeur avec la vitesse du vent (refroidissement éolien en hiver) et le taux d’humidité relative (indice de chaleur lourde en été) pour refléter la sensation réelle sur le corps humain.',
      },
      {
        heading: 'Suivi de la pluie dans l’heure et évolution sur 48 heures',
        body: 'Le chronogramme horaire détaille minute par minute le passage éventuel d’une averse, la baisse du plafond nuageux, la rotation du vent et la variation de la pression atmosphérique au niveau de la mer (exprimée en hectopascals).',
      },
      {
        heading: 'Indices pratiques du quotidien : UV, point de rosée et visibilité',
        body: 'En complément du thermomètre, consultez le point de rosée pour anticiper la formation de brouillard matinal ou de gelée blanche, la distance de visibilité horizontale pour la conduite, ainsi que l’indice UV maximal de la journée.',
      },
    ],
    faq: [
      {
        question: 'Que signifie une baisse rapide de la pression atmosphérique en direct ?',
        answer:
          'Une chute de pression supérieure à 3 hPa en trois heures signale généralement l’approche d’un front perturbé, accompagnée d’un renforcement du vent et d’un risque accru de précipitations.',
      },
      {
        question: 'Comment savoir s’il va pleuvoir dans l’heure sur ma position ?',
        answer:
          'Le bandeau de prévision immédiate analyse le déplacement des cellules pluvieuses en amont de votre commune et indique l’heure estimée du début et de la fin des gouttes.',
      },
      {
        question: 'Pourquoi la température varie-t-elle entre le centre-ville et la périphérie ?',
        answer:
          'L’effet d’îlot de chaleur urbain retient la chaleur dans les zones densément bâties la nuit, tandis que les vallées rurales ou les secteurs boisés se refroidissent beaucoup plus rapidement par rayonnement nocturne.',
      },
    ],
  },

  '/radar': {
    slug: 'radar',
    path: '/radar',
    canonicalUrl: `${BASE_SITE_URL}/radar`,
    title: 'Radar des pluies en direct en France | Instant Météo',
    description:
      'Carte radar interactive des précipitations en direct : suivez le déplacement de la pluie, de la neige, des orages et des nuages en plein écran.',
    h1: 'Radar des précipitations en direct',
    sectionTitle: 'Fonctionnement du radar et lecture des échos de pluie',
    breadcrumbName: 'Radar Pluie en Direct',
    tabId: 'radar',
    changefreq: 'always',
    priority: '0.95',
    introParagraph:
      'Le radar interactif permet de visualiser sur une carte plein écran la position exacte des averses, des fronts pluvieux, des chutes de neige et des foyers orageux. Grâce au curseur temporel, vous pouvez observer la trajectoire passée des précipitations et leur déplacement prévu à court terme.',
    sections: [
      {
        heading: 'Code couleur de la réflectivité et intensité des pluies',
        body: 'L’échelle chromatique traduit la densité des gouttes d’eau ou des cristaux de glace dans l’atmosphère (exprimée en dBZ). Les teintes bleues et vertes indiquent des bruines ou des pluies faibles (1 à 3 mm/h), le jaune et l’orange correspondent à des averses soutenues (5 à 20 mm/h), tandis que le rouge et le violet signalent de fortes averses orageuses parfois mêlées de grêle.',
      },
      {
        heading: 'Sélection des calques : Pluie, Nuages, Températures et Orages',
        body: 'Le bandeau supérieur du radar vous permet d’afficher séparément les échos de pluie, la couverture nuageuse sans aucune zone noire, les températures des stations ou l’activité électrique des cellules orageuses.',
      },
      {
        heading: 'Mode grand écran verrouillé pour le suivi continu',
        body: 'Le bouton Grand Écran verrouille l’affichage exclusivement sur la carte radar afin d’offrir une navigation fluide au doigt ou à la souris, du niveau européen jusqu’à l’échelle de votre quartier.',
      },
    ],
    faq: [
      {
        question: 'Comment utiliser l’animation du radar pour anticiper une averse ?',
        answer:
          'Appuyez sur le bouton Lecture en bas de la carte : la barre de défilement fait avancer les images par pas de 5 à 10 minutes et révèle la vitesse ainsi que l’axe de déplacement du front pluvieux vers votre commune.',
      },
      {
        question: 'Quelle est la différence entre l’onglet Pluie et l’onglet Nuages sur le radar ?',
        answer:
          'L’onglet Pluie affiche uniquement les nuages qui produisent effectivement des précipitations détectées par écho radar, tandis que l’onglet Nuages montre l’ensemble du voile nuageux même lorsqu’il ne donne aucune goutte au sol.',
      },
      {
        question: 'Comment quitter le mode grand écran du radar ?',
        answer:
          'Cliquez sur le bouton Réduire en haut à droite de la carte ou appuyez simplement sur la touche Échap (Escape) de votre clavier.',
      },
    ],
  },

  '/vigilances': {
    slug: 'vigilances',
    path: '/vigilances',
    canonicalUrl: `${BASE_SITE_URL}/vigilances`,
    title: 'Vigilance météo par département en France | Instant Météo',
    description:
      'Carte des vigilances météo par département en France : suivi des niveaux vert, jaune, orange et rouge pour le vent, les orages, la pluie, la neige et la canicule.',
    h1: 'Carte de vigilance météo par département',
    sectionTitle: 'Comprendre les quatre niveaux de vigilance et les conseils de prudence',
    breadcrumbName: 'Vigilances Météo',
    tabId: 'vigilance',
    changefreq: 'always',
    priority: '0.95',
    introParagraph:
      'La page Vigilances Météo dresse l’état complet des risques météorologiques sur les 96 départements de France métropolitaine et en Outre-mer. Elle permet d’identifier d’un coup d’œil les départements placés sous surveillance particulière aujourd’hui et au cours des prochains jours.',
    sections: [
      {
        heading: 'Signification des couleurs Vert, Jaune, Orange et Rouge',
        body: 'Le niveau Vert indique l’absence de danger particulier. Le niveau Jaune invite à rester attentif lors d’activités exposées (randonnée, navigation, travaux extérieurs). Le niveau Orange signale des phénomènes dangereux nécessitant une grande prudence et la limitation des déplacements non essentiels. Le niveau Rouge correspond à un événement d’intensité exceptionnelle exigeant le respect absolu des consignes de sécurité.',
      },
      {
        heading: 'Les neuf aléas météorologiques surveillés',
        body: 'Chaque fiche départementale détaille séparément le risque lié au vent violent, aux orages, aux fortes pluies et inondations, aux crues des rivières, à la neige ou au verglas, aux vagues-submersion sur le littoral, aux avalanches en montagne, ainsi qu’aux épisodes de canicule ou de grand froid.',
      },
      {
        heading: 'Matrice prévisionnelle des risques sur plusieurs jours',
        body: 'En plus de la carte du jour, un tableau chronologique permet de repérer à l’avance les dégradations attendues sur votre département afin d’adapter vos trajets ou vos événements en extérieur.',
      },
    ],
    faq: [
      {
        question: 'Quels comportements adopter lorsque mon département passe en niveau orange ?',
        answer:
          'Mettez à l’abri les objets sensibles au vent, évitez les promenades en forêt ou près des cours d’eau, débranchez les appareils électriques sensibles en cas d’orage violent et reportez les déplacements routiers non indispensables.',
      },
      {
        question: 'Pourquoi un département voisin est-il en alerte et pas le mien ?',
        answer:
          'Les seuils de déclenchement tiennent compte de la topographie locale, de la saturation préalable des sols et de l’exposition aux vents dominants propres à chaque territoire départemental.',
      },
      {
        question: 'À quelle fréquence la carte de vigilance est-elle réévaluée ?',
        answer:
          'La carte est actualisée au minimum deux fois par jour (à 6 h et à 16 h), et à tout moment de la journée ou de la nuit dès qu’un phénomène évolue rapidement.',
      },
    ],
  },

  '/nuages': {
    slug: 'nuages',
    path: '/nuages',
    canonicalUrl: `${BASE_SITE_URL}/nuages`,
    title: 'Couverture nuageuse, sondage vertical et nébulosité | Instant Météo',
    description:
      'Suivez la couverture nuageuse (nébulosité) en France : sondage vertical de l’atmosphère, classification des nuages (bas, moyens, élevés), plafond nuageux et risque de givrage sur 48 heures.',
    h1: 'Couverture nuageuse, sondage vertical, classification des nuages et nébulosité',
    sectionTitle: 'Sondage vertical troposphérique, classification des nuages, givrage et nébulosité',
    breadcrumbName: 'Carte des Nuages',
    tabId: 'cloudNephology',
    changefreq: 'always',
    priority: '0.90',
    introParagraph:
      'L’observatoire des nuages et de la néphologie détaille la structure verticale de l’atmosphère au-dessus de votre commune. Grâce au sondage vertical troposphérique, à la classification internationale des nuages, à la détection du risque de givrage et au suivi de la nébulosité par étage (bas, moyen et élevé), anticipez avec précision la hauteur du plafond nuageux, l’épaisseur optique du voile et les fenêtres d’éclaircies sur 48 heures.',
    sections: [
      {
        heading: 'Sondage vertical de l’atmosphère et profil d’humidité (1000 hPa à 200 hPa)',
        body: 'Le sondage vertical analyse l’évolution de la température, du point de rosée et de l’humidité relative du sol jusqu’à 12 000 mètres d’altitude à travers les niveaux de pression standard. Il calcule automatiquement le niveau de condensation par ascendance (NCA / LCL), l’altitude de la base des nuages (plafond nuageux en mètres et en pieds), le sommet des couches nuageuses et les inversions thermiques.',
      },
      {
        heading: 'Classification des nuages (OMM) et nébulosité par étage d’altitude',
        body: 'La nébulosité exprime la fraction du ciel couverte par les nuages en pourcentage (0 à 100 %) et en octas (de 0/8 ciel dégagé à 8/8 ciel couvert). La classification des nuages distingue les 10 genres de l’Atlas international de l’OMM répartis sur trois étages : les nuages bas sous 2 000 mètres (stratus, stratocumulus, cumulus), les nuages de l’étage moyen entre 2 000 et 6 000 mètres (altocumulus, altostratus, nimbostratus), les nuages élevés de cristaux de glace au-dessus de 6 000 mètres (cirrus, cirrocumulus, cirrostratus) et les nuages convectifs à grand développement vertical (cumulonimbus).',
      },
      {
        heading: 'Risque de givrage en altitude, isotherme 0 °C et visibilité aéronautique',
        body: 'En croisant l’humidité saturée des couches nuageuses avec les températures négatives comprises entre 0 °C et -20 °C, l’observatoire repère les tranches d’altitude contenant de l’eau liquide surfondue responsable du givrage sur les aéronefs et les reliefs. Ce diagnostic de givrage, associé à la hauteur du plafond nuageux et à l’épaisseur optique, sécurise la préparation des vols à vue (VFR), du parapente et des courses en haute montagne.',
      },
    ],
    faq: [
      {
        question: 'Pourquoi fait-il beau malgré une nébulosité affichée à 70 % ?',
        answer:
          'Lorsqu’il s’agit uniquement de nuages élevés de type cirrus ou cirrostratus (au-dessus de 6 000 mètres), leur faible épaisseur optique laisse passer l’essentiel de l’ensoleillement, contrairement à une couche épaisse de stratus bas.',
      },
      {
        question: 'Comment le sondage vertical détecte-t-il le risque de givrage dans les nuages ?',
        answer:
          'Le givrage apparaît lorsque l’humidité relative dépasse 85 % dans une couche atmosphérique où la température est comprise entre 0 °C et -20 °C, signalant la présence de gouttelettes d’eau en surfusion prêtes à geler au moindre contact.',
      },
      {
        question: 'Quelle nébulosité faut-il pour observer les étoiles ou profiter d’éclaircies ?',
        answer:
          'Pour une observation astronomique optimale, privilégiez les créneaux nocturnes où la nébulosité des trois étages nuageux (bas, moyen et haut) est simultanément inférieure à 15 % (0 à 1 octa).',
      },
    ],
  },

  '/14-jours': {
    slug: '14-jours',
    path: '/14-jours',
    canonicalUrl: `${BASE_SITE_URL}/14-jours`,
    title: 'Prévisions météo à 14 jours en France | Instant Météo',
    description:
      'Tendances météo à 14 jours pour votre commune : évolution des températures minimales et maximales, probabilités de pluie et indice de confiance jour par jour.',
    h1: 'Tendances météo à 14 jours',
    sectionTitle: 'Comment interpréter une prévision météo à deux semaines',
    breadcrumbName: 'Prévisions 14 Jours',
    tabId: 'scenarios14d',
    changefreq: 'hourly',
    priority: '0.90',
    introParagraph:
      'Cette page présente l’évolution météorologique attendue sur deux semaines complètes dans votre commune. Au-delà du cinquième jour, l’atmosphère devient plus sensible aux petites variations : c’est pourquoi nos graphiques affichent à la fois le scénario médian et la fourchette des températures possibles.',
    sections: [
      {
        heading: 'Lecture du cône d’incertitude thermique',
        body: 'Sur le graphique à 14 jours, la courbe centrale représente l’évolution la plus probable, entourée d’une zone ombrée illustrant les scénarios plus doux ou plus frais. Plus cette zone est étroite, plus la situation atmosphérique est stable et prévisible.',
      },
      {
        heading: 'Indice de fiabilité quotidien exprimé en pourcentage',
        body: 'Chaque journée est accompagnée d’un score de confiance. Un indice supérieur à 80 % signale un régime bien établi (comme un anticyclone durable), tandis qu’un indice autour de 50 % indique une hésitation sur la trajectoire exacte d’une perturbation.',
      },
      {
        heading: 'Planification des travaux extérieurs, séjours et événements',
        body: 'Le récapitulatif quotidien synthétise les cumuls de pluie attendus, la force maximale du vent et l’écart par rapport aux températures habituelles de la saison pour vous aider à choisir les meilleures journées.',
      },
    ],
    faq: [
      {
        question: 'Jusqu’à quelle échéance une prévision météo reste-t-elle très précise ?',
        answer:
          'Les prévisions sont généralement très précises jusqu’à 5 jours pour les horaires de pluie et les températures, puis donnent une tendance fiable sur le régime de temps (doux, frais, sec ou humide) entre 6 et 14 jours.',
      },
      {
        question: 'Que signifie une probabilité de pluie de 60 % à 10 jours ?',
        answer:
          'Cela signifie que 6 simulations numériques sur 10 envisagent le passage d’une perturbation pluvieuse sur votre commune au cours de cette journée.',
      },
      {
        question: 'À quelle fréquence la tendance à 14 jours est-elle recalculée ?',
        answer:
          'Les scénarios sont mis à jour quatre fois par jour afin d’intégrer les dernières observations mondiales et d’affiner progressivement le cône d’incertitude.',
      },
    ],
  },

  '/montagne': {
    slug: 'montagne',
    path: '/montagne',
    canonicalUrl: `${BASE_SITE_URL}/montagne`,
    title: 'Météo des montagnes et enneigement des massifs | Instant Météo',
    description:
      'Météo montagne dans les Alpes, Pyrénées, Massif Central, Vosges, Jura et Corse : enneigement, limite pluie-neige, isotherme 0°C, vent sur les crêtes et avalanches.',
    h1: 'Météo en montagne et état de l’enneigement',
    sectionTitle: 'Paramètres d’altitude pour les stations de ski et la randonnée',
    breadcrumbName: 'Météo Montagne',
    tabId: 'mountain',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'L’espace Météo Montagne accompagne les randonneurs, alpinistes et skieurs à travers les sept grands massifs français : Alpes du Nord, Alpes du Sud, Pyrénées, Massif Central, Vosges, Jura et montagne Corse. Retrouvez les conditions par tranche d’altitude, du fond de vallée jusqu’aux plus hauts sommets.',
    sections: [
      {
        heading: 'Isotherme 0 °C et limite pluie-neige en temps réel',
        body: 'L’isotherme 0 °C indique l’altitude à laquelle la température de l’air libre atteint le point de congélation. Lors d’une chute de précipitations continues, les flocons de neige descendent généralement 200 à 400 mètres plus bas que cet isotherme par effet d’isothermie.',
      },
      {
        heading: 'Épaisseur du manteau neigeux et qualité de la neige',
        body: 'Pour chaque station et sommet, consultez la hauteur de neige au sol en bas et en haut des pistes, les cumuls de neige fraîche tombés ces dernières 24 heures, ainsi que l’évolution de la qualité du manteau (poudreuse, neige transformée de printemps ou croûte de regel).',
      },
      {
        heading: 'Stabilité du manteau et vent en haute altitude',
        body: 'Le vent fort sur les crêtes transporte d’importantes quantités de neige et forme des plaques à vent sous le vent des reliefs. Vérifiez systématiquement l’indice de risque d’avalanche (échelle de 1 à 5) et la vitesse des rafales à 3 000 mètres avant toute sortie hors-piste.',
      },
    ],
    faq: [
      {
        question: 'Comment évolue la température lorsque l’on monte en altitude ?',
        answer:
          'En atmosphère standard, la température baisse en moyenne de 0,65 °C tous les 100 mètres de dénivelé positif, sauf en hiver lors d’inversions thermiques où l’air froid s’accumule au fond des vallées.',
      },
      {
        question: 'Que signifie un risque d’avalanche de niveau 3 sur 5 ?',
        answer:
          'Le niveau 3 (risque marqué) indique que des avalanches peuvent être déclenchées par le passage d’un seul skieur ou randonneur sur de nombreuses pentes raides : une grande expérience nivologique est indispensable.',
      },
      {
        question: 'Pourquoi l’indice UV est-il beaucoup plus fort en montagne ?',
        answer:
          'L’intensité du rayonnement ultraviolet augmente d’environ 10 % tous les 1 000 mètres d’altitude, et la réverbération sur la neige fraîche peut réfléchir jusqu’à 85 % des rayons UV.',
      },
    ],
  },

  '/plages': {
    slug: 'plages',
    path: '/plages',
    canonicalUrl: `${BASE_SITE_URL}/plages`,
    title: 'Météo des plages, marées et température de l’eau | Instant Météo',
    description:
      'Météo du littoral et des plages de France : horaires et coefficients de marée, température de la mer, hauteur de la houle, vent côtier et indice UV.',
    h1: 'Météo du littoral, horaires des marées et baignade',
    sectionTitle: 'Informations marines pour la baignade et les sports nautiques',
    breadcrumbName: 'Météo des Plages',
    tabId: 'beaches',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'De la Manche à la Méditerranée en passant par la côte Atlantique et la Corse, la page Météo des Plages réunit toutes les données marines utiles pour préparer une journée au bord de l’eau, une session de surf ou une sortie en plaisance.',
    sections: [
      {
        heading: 'Horaires de pleine mer, basse mer et coefficients de marée',
        body: 'Consultez les heures exactes de marée haute et de marée basse ainsi que le coefficient du jour (de 20 à 120). Au-delà d’un coefficient de 90 (grandes marées), l’amplitude de marnage est importante et les courants de baïnes ou de chenaux se renforcent sensiblement.',
      },
      {
        heading: 'Température de l’eau de baignade et état du plan d’eau',
        body: 'Chaque fiche de plage affiche la température de surface de la mer, la hauteur significative des vagues en mètres, la période de la houle en secondes (essentielle pour les surfeurs) ainsi que l’orientation de la brise thermique côtière.',
      },
      {
        heading: 'Protection solaire et sécurité de la baignade',
        body: 'Un indicateur synthétique évalue les conditions de baignade selon l’agitation de la mer et la force du vent, complété par le suivi horaire de l’indice UV sur le sable.',
      },
    ],
    faq: [
      {
        question: 'Qu’est-ce qu’un courant de baïne sur la côte Atlantique ?',
        answer:
          'Une baïne est une cuvette naturelle creusée dans le sable qui se vide à marée descendante en créant un puissant courant tirant vers le large. Si vous êtes entraîné, ne nagez jamais à contre-courant mais parallèlement à la plage.',
      },
      {
        question: 'Pourquoi une houle de longue période (plus de 12 secondes) est-elle plus puissante ?',
        answer:
          'Une houle de longue période provient d’une dépression lointaine sur l’océan : elle transporte beaucoup plus d’énergie en profondeur et génère des séries de vagues plus hautes lorsqu’elle touche les bancs de sable côtiers.',
      },
      {
        question: 'Pourquoi fait-il souvent plus frais sur la plage qu’à 10 kilomètres dans les terres ?',
        answer:
          'En cours d’après-midi, le réchauffement rapide des terres crée une brise de mer qui ramène vers la plage l’air marin plus tempéré.',
      },
    ],
  },

  '/secheresse-incendie': {
    slug: 'secheresse-incendie',
    path: '/secheresse-incendie',
    canonicalUrl: `${BASE_SITE_URL}/secheresse-incendie`,
    title: 'État de la sécheresse et risque d’incendie en France | Instant Météo',
    description:
      'Suivi de la sécheresse des sols, du niveau des nappes phréatiques et du danger météorologique de feux de forêt par département en France.',
    h1: 'Suivi de la sécheresse et du risque feux de forêt',
    sectionTitle: 'Indicateurs d’humidité des sols, nappes souterraines et danger incendie',
    breadcrumbName: 'Sécheresse & Incendies',
    tabId: 'droughtFire',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'Cet observatoire environnemental suit l’état de la ressource en eau et la vulnérabilité de la végétation aux incendies sur le territoire français. Il distingue la sécheresse superficielle des sols agricoles, le niveau des réserves souterraines et le danger quotidien d’éclosion de feux.',
    sections: [
      {
        heading: 'Humidité des sols superficiels et bilan hydrique',
        body: 'Le bilan hydrique compare les pluies tombées au cours des dernières semaines à l’évapotranspiration des plantes sous l’effet de la chaleur et du vent. Il permet de mesurer le stress hydrique des cultures, des prairies et des jardins.',
      },
      {
        heading: 'Niveau des nappes phréatiques et restrictions d’usage de l’eau',
        body: 'Les réserves souterraines se rechargent principalement d’octobre à mars grâce aux pluies d’automne et d’hiver. En période d’étiage, quatre niveaux préfectoraux encadrent les usages de l’eau : vigilance, alerte, alerte renforcée et crise.',
      },
      {
        heading: 'Indice météorologique de danger de feux de forêt',
        body: 'La combinaison d’une végétation desséchée, d’une humidité de l’air inférieure à 30 %, de fortes chaleurs et d’un vent soutenu (comme le Mistral ou la Tramontane) favorise la propagation rapide des flammes. La carte signale les massifs forestiers les plus exposés.',
      },
    ],
    faq: [
      {
        question: 'Pourquoi une forte pluie d’orage en été ne recharge-t-elle pas les nappes phréatiques ?',
        answer:
          'En été, les sols secs et durcis favorisent le ruissellement rapide, et la végétation active absorbe la quasi-totalité de l’eau infiltrée dans les premiers décimètres du sol avant qu’elle n’atteigne la nappe en profondeur.',
      },
      {
        question: 'Quelles sont les règles d’arrosage en niveau d’alerte sécheresse ?',
        answer:
          'Dès le niveau d’alerte, l’arrosage des pelouses et des jardins potagers est généralement interdit aux heures les plus chaudes de la journée (souvent entre 11 h et 18 h), et totalement suspendu pour les espaces verts en niveau de crise.',
      },
      {
        question: 'Quels gestes permettent d’éviter les départs de feux en période sèche ?',
        answer:
          'Ne jetez jamais de mégot au sol ou par la fenêtre d’un véhicule, n’utilisez pas d’outils produisant des étincelles (débroussailleuse, disqueuse) à proximité d’herbes sèches et respectez les fermetures temporaires de massifs forestiers.',
      },
    ],
  },

  '/cours-d-eau': {
    slug: 'cours-d-eau',
    path: '/cours-d-eau',
    canonicalUrl: `${BASE_SITE_URL}/cours-d-eau`,
    title: 'Niveau des cours d’eau et suivi des crues | Instant Météo',
    description:
      'Surveillance hydrologique des fleuves et rivières de France : hauteur d’eau en mètres, débit en m³/s, tendance des niveaux et repères de crue.',
    h1: 'Hauteur des rivières et surveillance des crues',
    sectionTitle: 'Fonctionnement des stations hydrométriques et réaction des bassins versants',
    breadcrumbName: 'Cours d’Eau & Crues',
    tabId: 'watercourses',
    changefreq: 'always',
    priority: '0.85',
    introParagraph:
      'La page Cours d’Eau permet de suivre l’évolution du niveau des principaux fleuves, rivières et torrents français. Elle affiche la hauteur d’eau mesurée aux échelles limnimétriques, le débit estimé et la tendance immédiate (hausse, stabilité ou décrue).',
    sections: [
      {
        heading: 'Mesure de la hauteur d’eau (m) et du débit (m³/s)',
        body: 'Les capteurs installés le long des ponts et des berges mesurent en continu la hauteur de la surface libre de l’eau. Une courbe de tarage propre à chaque section de rivière convertit cette hauteur en débit, c’est-à-dire le volume d’eau qui s’écoule chaque seconde.',
      },
      {
        heading: 'Différence entre crue lente de plaine et crue éclair torrentielle',
        body: 'Les grands fleuves de plaine (Seine, Loire, Garonne, Rhône) réagissent progressivement sur plusieurs jours après de longues pluies hivernales. À l’inverse, les petits bassins versants escarpés (Cévennes, Alpes-Maritimes, Pyrénées, Corse) peuvent connaître une montée des eaux de plusieurs mètres en moins de deux heures lors d’orages stationnaires.',
      },
      {
        heading: 'Comparaison avec les crues historiques de référence',
        body: 'Chaque fiche hydrologique rappelle les niveaux atteints lors des crues passées marquantes afin de situer immédiatement l’ampleur d’une montée des eaux par rapport aux seuils de débordement des berges.',
      },
    ],
    faq: [
      {
        question: 'Pourquoi le niveau d’une rivière continue-t-il de monter alors que la pluie s’est arrêtée ?',
        answer:
          'L’eau tombée sur l’ensemble des collines et des affluents en amont met plusieurs heures, voire plusieurs jours sur les grands fleuves, à s’écouler jusqu’aux stations situées en aval : c’est le temps de propagation de l’onde de crue.',
      },
      {
        question: 'Quels sont les réflexes essentiels en cas d’inondation rapide ?',
        answer:
          'Ne vous engagez jamais à pied ou en voiture sur une route immergée (30 cm d’eau suffisent à emporter un véhicule), n’allez pas chercher votre voiture dans un parking souterrain et rejoignez les étages supérieurs.',
      },
      {
        question: 'Qu’appelle-t-on le débit d’étiage d’une rivière ?',
        answer:
          'L’étiage désigne le niveau moyen le plus bas atteint par un cours d’eau au cours de l’année, généralement observé à la fin de l’été après plusieurs semaines sans précipitations.',
      },
    ],
  },

  '/cartes-thematiques': {
    slug: 'cartes-thematiques',
    path: '/cartes-thematiques',
    canonicalUrl: `${BASE_SITE_URL}/cartes-thematiques`,
    title: 'Cartes météo thématiques de la France | Instant Météo',
    description:
      'Explorez les cartes météo thématiques de France : températures par région, anomalies thermiques, rafales de vent, cumuls de pluie et relief.',
    h1: 'Cartes météo thématiques par région',
    sectionTitle: 'Analyse cartographique des paramètres atmosphériques en France',
    breadcrumbName: 'Cartes Thématiques',
    tabId: 'radar',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'Les cartes thématiques offrent une vue d’ensemble des contrastes météorologiques entre le nord et le sud, les façades océaniques et les massifs montagneux. Vous pouvez filtrer l’affichage par grandeur physique (température, vent, pluie, anomalie climatique) et par tranche d’altitude.',
    sections: [
      {
        heading: 'Carte thermique nationale et contrastes régionaux',
        body: 'Visualisez simultanément les températures relevées dans les grandes villes, les stations côtières et les sommets d’altitude. Le filtre par étage topographique permet d’isoler les plaines (< 400 m), la moyenne montagne ou les sommets alpins et pyrénéens.',
      },
      {
        heading: 'Champs de vent et couloirs d’accélération',
        body: 'La carte des vents met en évidence les grands flux atmosphériques ainsi que les couloirs régionaux bien connus : Mistral dans la vallée du Rhône, Tramontane dans l’Aude et le Roussillon, vent d’Autan dans le Lauragais ou coups de vent atlantiques sur la pointe bretonne.',
      },
      {
        heading: 'Répartition spatiale des pluies et des anomalies',
        body: 'Comparez la pluviométrie et l’écart thermique de chaque région par rapport aux moyennes saisonnières pour repérer les zones soumises à un temps anormalement doux, frais ou humide.',
      },
    ],
    faq: [
      {
        question: 'Comment zoomer directement sur ma région ou sur un massif ?',
        answer:
          'Utilisez le bandeau de sélection rapide des 13 régions françaises ou la barre d’accès rapide aux sommets pour cadrer instantanément la carte sur la zone souhaitée.',
      },
      {
        question: 'À quoi sert le filtre par tranche d’altitude sur la carte ?',
        answer:
          'Il permet de comparer des stations situées à des altitudes équivalentes afin de ne pas confondre un refroidissement lié au relief avec l’arrivée d’une masse d’air froid en plaine.',
      },
      {
        question: 'Peut-on changer le fond de carte entre vue satellite et carte du relief ?',
        answer:
          'Oui, les boutons situés en haut à gauche de la carte permettent de basculer à tout moment entre le fond standard, la carte topographique du relief, le mode sombre et l’imagerie satellite.',
      },
    ],
  },

  '/sports': {
    slug: 'sports',
    path: '/sports',
    canonicalUrl: `${BASE_SITE_URL}/sports`,
    title: 'Météo des trajets routiers et activités de plein air | Instant Météo',
    description:
      'Calculateur météo de trajet routier et indices pour le sport en extérieur : vélo, course à pied, randonnée, golf, sports nautiques et entretien du jardin.',
    h1: 'Conditions météo pour la route et le sport',
    sectionTitle: 'Planification des déplacements routiers et des séances sportives',
    breadcrumbName: 'Météo Route & Sports',
    tabId: 'sportsActivities',
    changefreq: 'hourly',
    priority: '0.80',
    introParagraph:
      'Que vous prépariez un long trajet sur autoroute, une sortie à vélo ou une séance de course à pied, cette page évalue l’impact concret des conditions météo sur la sécurité routière et sur la pratique sportive au fil des heures.',
    sections: [
      {
        heading: 'Calculateur météo d’itinéraire routier étape par étape',
        body: 'En renseignant votre ville de départ, votre destination et votre heure de départ, le calculateur estime les conditions que vous rencontrerez tout au long du parcours : chaussée mouillée, risque d’aquaplaning, brouillard réduisant la visibilité, verglas matinal ou rafales de vent latéral sur les viaducs.',
      },
      {
        heading: 'Indices de confort pour le cyclisme, le running et la randonnée',
        body: 'Pour chaque discipline, un score de praticabilité sur 10 analyse la force et la direction du vent (vent de face ou porteur), le stress thermique lié à la chaleur humide, l’absence d’averse et la qualité de l’air.',
      },
      {
        heading: 'Conseils pratiques pour le jardinage et les activités extérieures',
        body: 'Identifiez les meilleurs créneaux horaires de la journée pour tondre, arroser, bricoler en extérieur ou organiser une sortie familiale à l’abri des averses et des fortes chaleurs.',
      },
    ],
    faq: [
      {
        question: 'À partir de quelle vitesse de vent la conduite devient-elle délicate ?',
        answer:
          'Dès que les rafales latérales dépassent 60 à 70 km/h, les deux-roues, les camping-cars et les véhicules tractant une remorque doivent réduire leur vitesse et redoubler de vigilance lors des dépassements de poids lourds.',
      },
      {
        question: 'Quel est le meilleur moment de la journée pour courir en été ?',
        answer:
          'En période estivale, privilégiez le créneau entre 6 h et 9 h du matin : la température est au plus bas et la concentration d’ozone troposphérique est nettement plus faible qu’en fin d’après-midi.',
      },
      {
        question: 'Comment savoir si une route risque d’être glissante au petit matin ?',
        answer:
          'Lorsque la température de l’air descend sous +2 °C avec une humidité élevée ou après une averse nocturne, la chaussée peut descendre sous 0 °C et former des plaques de verglas localisées, notamment sur les ponts et en lisière de forêt.',
      },
    ],
  },

  '/bulletins': {
    slug: 'bulletins',
    path: '/bulletins',
    canonicalUrl: `${BASE_SITE_URL}/bulletins`,
    title: 'Bulletins météo départementaux et tendances mensuelles | Instant Météo',
    description:
      'Bulletins météo rédigés pour la France et chaque département : synthèse du jour, évolution de la semaine et perspectives sur 4 semaines.',
    h1: 'Bulletins météo détaillés par département',
    sectionTitle: 'Organisation des bulletins quotidiens et des tendances à quatre semaines',
    breadcrumbName: 'Bulletins & 4 Semaines',
    tabId: 'bulletin',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'Pour ceux qui préfèrent une analyse rédigée et structurée aux simples icônes, la page Bulletins propose un point complet sur la situation atmosphérique en France, accompagné d’un bulletin propre à votre département et d’une perspective semaine par semaine sur un mois.',
    sections: [
      {
        heading: 'Synthèse nationale et situation générale en Europe',
        body: 'Le bulletin quotidien explique en termes accessibles le placement des anticyclones et des dépressions sur l’Atlantique Nord et l’Europe, afin de faire comprendre l’origine des masses d’air qui traversent la France.',
      },
      {
        heading: 'Bulletin départemental et communal détaillé',
        body: 'Chaque territoire dispose d’un récapitulatif précis pour la matinée, l’après-midi et la soirée : état du ciel, températures minimales et maximales, orientation du vent et probabilités de précipitations.',
      },
      {
        heading: 'Perspectives météo sur 4 semaines',
        body: 'Le module à quatre semaines dégage les grandes lignes des prochains régimes de temps (flux océanique humide, blocage anticyclonique doux et sec, ou descente fraîche continentale) semaine après semaine.',
      },
    ],
    faq: [
      {
        question: 'Quelle est la différence entre un bulletin météo à 7 jours et une tendance à 4 semaines ?',
        answer:
          'Le bulletin à 7 jours détaille le temps jour par jour avec les horaires de pluie et les températures précises, tandis que la tendance à 4 semaines décrit l’ambiance générale de chaque semaine (plus chaude, plus fraîche, plus sèche ou plus humide que la normale).',
      },
      {
        question: 'Puis-je consulter le bulletin spécifique à mon département ?',
        answer:
          'Oui, dès que vous sélectionnez une commune ou un département dans la barre de recherche, le bulletin départemental et communal s’adapte automatiquement à votre secteur géographique.',
      },
      {
        question: 'Peut-on exporter ou imprimer un dossier météo complet ?',
        answer:
          'Un bouton d’export permet de générer un récapitulatif clair regroupant les relevés actuels, les prévisions de la semaine et les normales locales.',
      },
    ],
  },

  '/archives': {
    slug: 'archives',
    path: '/archives',
    canonicalUrl: `${BASE_SITE_URL}/archives`,
    title: 'Archives météo en France depuis 1950 | Instant Météo',
    description:
      'Consultez l’historique météo jour par jour en France depuis 1950 : températures passées, cumuls de pluie, records et normales climatiques 1991-2020.',
    h1: 'Historique météo et normales de saison',
    sectionTitle: 'Recherche dans les archives climatiques et comparaison aux normales',
    breadcrumbName: 'Archives & Normales',
    tabId: 'weatherArchive',
    changefreq: 'daily',
    priority: '0.80',
    introParagraph:
      'Quel temps faisait-il dans votre commune à une date précise il y a dix, trente ou soixante-dix ans ? La page Archives Météo vous permet de remonter le temps depuis 1950 et de comparer la météo actuelle aux moyennes de référence.',
    sections: [
      {
        heading: 'Consultation de la météo passée jour par jour depuis 1950',
        body: 'Sélectionnez n’importe quelle date du calendrier pour afficher les conditions reconstituées sur votre commune : température minimale à l’aube, maximale de l’après-midi, hauteur de pluie ou de neige tombée sur 24 heures et vitesse maximale du vent.',
      },
      {
        heading: 'Que représentent les normales climatiques 1991-2020 ?',
        body: 'Pour savoir si une journée est anormalement chaude ou froide, les météorologues utilisent la moyenne calculée sur trente années consécutives (la période officielle 1991-2020). Chaque fiche compare les températures du jour à ce repère historique.',
      },
      {
        heading: 'Chronologie des grands événements météo en France',
        body: 'Retrouvez les dates marquantes de l’histoire météorologique française : vagues de froid mémorables (février 1956, janvier 1985), grandes tempêtes (décembre 1999, Xynthia) et étés caniculaires (2003, 2019, 2022).',
      },
    ],
    faq: [
      {
        question: 'Comment retrouver la météo d’une date précise pour un événement passé ?',
        answer:
          'Choisissez votre commune puis sélectionnez l’année, le mois et le jour dans le sélecteur d’archives : la fiche complète de cette journée passée s’affiche immédiatement.',
      },
      {
        question: 'Pourquoi la période de référence climatique change-t-elle tous les dix ans ?',
        answer:
          'L’Organisation Météorologique Mondiale actualise la période de référence trentenaire à chaque décennie (1981-2010 puis 1991-2020) afin que les normales reflètent le climat récent tout en permettant de mesurer le réchauffement sur le long terme.',
      },
      {
        question: 'Peut-on utiliser ces archives pour vérifier une intempérie passée ?',
        answer:
          'Les relevés historiques permettent de visualiser les pics de rafales de vent et les cumuls de précipitations quotidiens enregistrés lors d’un épisode d’intempéries sur votre secteur.',
      },
    ],
  },

  '/monde-catastrophes': {
    slug: 'monde-catastrophes',
    path: '/monde-catastrophes',
    canonicalUrl: `${BASE_SITE_URL}/monde-catastrophes`,
    title: 'Phénomènes naturels majeurs dans le monde | Instant Météo',
    description:
      'Suivi mondial des événements météo et géophysiques : cyclones tropicaux, tempêtes, inondations majeures, incendies, séismes et éruptions volcaniques.',
    h1: 'Suivi mondial des événements naturels majeurs',
    sectionTitle: 'Surveillance internationale des cyclones, séismes et phénomènes extrêmes',
    breadcrumbName: 'Monde & Catastrophes',
    tabId: 'worldDisasters',
    changefreq: 'always',
    priority: '0.80',
    introParagraph:
      'Au-delà des frontières françaises, cette page suit en temps réel les phénomènes naturels majeurs qui touchent la planète : cyclones tropicaux dans les bassins océaniques (notamment près des territoires français d’Outre-mer), séismes significatifs, éruptions volcaniques et grands feux de végétation.',
    sections: [
      {
        heading: 'Trajectoire et intensité des cyclones, ouragans et typhons',
        body: 'Suivez l’évolution des systèmes dépressionnaires tropicaux dans l’Atlantique (Antilles, Guyane), l’océan Indien (La Réunion, Mayotte) et le Pacifique Sud (Nouvelle-Calédonie, Polynésie française), avec leur catégorie sur l’échelle de Saffir-Simpson et leurs vents soutenus.',
      },
      {
        heading: 'Activité sismique et volcanique mondiale',
        body: 'Les secousses sismiques significatives sont répertoriées avec leur magnitude, la profondeur de l’hypocentre et la distance aux zones habitées, complétées par le suivi des volcans en activité.',
      },
      {
        heading: 'Grands incendies et inondations à l’échelle des continents',
        body: 'Visualisez les foyers thermiques majeurs et les épisodes d’inondations sévères recensés sur les cinq continents afin de suivre l’actualité environnementale internationale.',
      },
    ],
    faq: [
      {
        question: 'Quelle est la différence entre un ouragan, un typhon et un cyclone ?',
        answer:
          'Il s’agit exactement du même phénomène météorologique : on l’appelle ouragan dans l’Atlantique Nord et le Pacifique Nord-Est, typhon dans le Pacifique Nord-Ouest (Asie), et cyclone tropical dans l’océan Indien et le Pacifique Sud.',
      },
      {
        question: 'À partir de quelle vitesse de vent parle-t-on d’ouragan de catégorie 1 ?',
        answer:
          'Un système tropical atteint la catégorie 1 sur l’échelle de Saffir-Simpson lorsque ses vents moyens soutenus sur une minute dépassent 119 km/h (et la catégorie 5 au-delà de 252 km/h).',
      },
      {
        question: 'Les territoires français d’Outre-mer sont-ils couverts par ce suivi ?',
        answer:
          'Oui, une attention particulière est portée aux bassins cycloniques et sismiques entourant la Guadeloupe, la Martinique, Saint-Martin, La Réunion, Mayotte, la Nouvelle-Calédonie et la Polynésie.',
      },
    ],
  },

  '/climat': {
    slug: 'climat',
    path: '/climat',
    canonicalUrl: `${BASE_SITE_URL}/climat`,
    title: 'Tendances saisonnières et évolution du climat | Instant Météo',
    description:
      'Projections climatiques saisonnières sur 8 mois en France, suivi du cycle El Niño / La Niña (ENSO) et évolution des températures annuelles.',
    h1: 'Tendances saisonnières et bilans climatiques',
    sectionTitle: 'Analyse des tendances à long terme et des cycles océaniques',
    breadcrumbName: 'Climat & 8 Mois',
    tabId: 'eightMonths',
    changefreq: 'daily',
    priority: '0.80',
    introParagraph:
      'L’espace Climat explore l’évolution de l’atmosphère sur le temps long : tendances saisonnières pour les prochains mois en France, influence des grands cycles océaniques mondiaux et suivi de l’écart thermique annuel par rapport aux décennies passées.',
    sections: [
      {
        heading: 'Tendances saisonnières mois par mois sur 8 mois',
        body: 'Les projections saisonnières n’ont pas vocation à prévoir la météo d’un jour précis, mais à estimer si les prochains mois s’annoncent globalement plus chauds, plus frais, plus secs ou plus arrosés que la moyenne habituelle en France.',
      },
      {
        heading: 'Influence des cycles El Niño, La Niña et de l’Atlantique Nord',
        body: 'Les variations de température de surface des océans (cycle ENSO dans le Pacifique) et l’Oscillation Nord-Atlantique (NAO) modifient la circulation des courants-jets et orientent la fréquence des hivers doux et humides ou des étés chauds en Europe.',
      },
      {
        heading: 'Évolution des températures moyennes en France depuis le XXe siècle',
        body: 'Les graphiques d’évolution annuelle illustrent la progression des températures moyennes, la diminution du nombre de jours de gel en plaine et la fréquence accrue des vagues de chaleur estivales.',
      },
    ],
    faq: [
      {
        question: 'Comment une tendance saisonnière peut-elle voir à plusieurs mois d’échéance ?',
        answer:
          'Contrairement à l’air qui change rapidement, les océans, la banquise et l’humidité des sols possèdent une forte inertie thermique qui influence durablement la circulation atmosphérique sur plusieurs mois.',
      },
      {
        question: 'Qu’est-ce que l’Oscillation Nord-Atlantique (NAO) pour la météo en France ?',
        answer:
          'C’est la différence de pression entre l’anticyclone des Açores et la dépression d’Islande : lorsqu’elle est positive en hiver, elle dirige un flux océanique doux et pluvieux sur la France ; lorsqu’elle est négative, elle favorise les descentes d’air froid.',
      },
      {
        question: 'Que mesure l’anomalie thermique affichée en degrés (°C) ?',
        answer:
          'Elle mesure l’écart entre la température moyenne observée sur un mois ou une année et la température normale de référence calculée sur la période 1991-2020.',
      },
    ],
  },

  '/communaute': {
    slug: 'communaute',
    path: '/communaute',
    canonicalUrl: `${BASE_SITE_URL}/communaute`,
    title: 'Signalements météo participatifs en France | Instant Météo',
    description:
      'Partagez et consultez les observations météo des habitants en direct : chutes de neige, grêle, orages, rafales de vent, brouillard et discussions locales.',
    h1: 'Observations météo partagées par les habitants',
    sectionTitle: 'Fonctionnement des signalements citoyens et de l’entraide locale',
    breadcrumbName: 'Communauté & Signalements',
    tabId: 'discussionGroup',
    changefreq: 'always',
    priority: '0.75',
    introParagraph:
      'Même les réseaux de mesure les plus denses ne peuvent pas voir chaque flocon de neige, chaque averse de grêle localisée ou chaque nappe de brouillard au fond d’une vallée. L’espace Communauté permet aux habitants et aux passionnés de partager en direct ce qu’ils observent depuis chez eux.',
    sections: [
      {
        heading: 'Carte participative des phénomènes observés au sol',
        body: 'En quelques secondes, signalez l’apparition de neige, de verglas, de grêle, d’un orage ou de fortes rafales dans votre commune. Votre observation apparaît sur la carte pour informer les habitants et automobilistes des environs.',
      },
      {
        heading: 'Validation croisée avec les paramètres météo locaux',
        body: 'Pour garantir la qualité des informations affichées, chaque signalement est accompagné du contexte météorologique local (température et humidité du secteur) afin d’éviter les erreurs manifestes.',
      },
      {
        heading: 'Fil d’échange et suivi collectif lors des épisodes météo marquants',
        body: 'L’espace de discussion permet d’échanger entre passionnés et habitants d’une même région pour suivre l’avancée d’une ligne orageuse, la tenue de la neige au sol ou l’évolution du ciel.',
      },
    ],
    faq: [
      {
        question: 'Comment publier une observation météo sur ma commune ?',
        answer:
          'Cliquez sur le bouton de signalement, choisissez le phénomène observé (pluie, neige, orage, vent, ciel dégagé) et précisez éventuellement un court commentaire : votre observation est immédiatement visible.',
      },
      {
        question: 'Pourquoi les observations des habitants sont-elles utiles en hiver ?',
        answer:
          'Lors d’un épisode neigeux en plaine, un écart d’un demi-degré suffit à transformer la pluie en neige : seul un observateur au sol peut confirmer instantanément si les flocons tiennent sur la chaussée.',
      },
      {
        question: 'La participation au fil communautaire est-elle gratuite ?',
        answer:
          'Oui, le partage d’observations et la participation aux échanges météo sont entièrement gratuits et ouverts à tous.',
      },
    ],
  },

  '/competition': {
    slug: 'competition',
    path: '/competition',
    canonicalUrl: `${BASE_SITE_URL}/competition`,
    title: 'Quiz météo et défis de prévision | Instant Météo',
    description:
      'Testez vos connaissances avec le quiz météo et les défis de prévision : estimez les températures et les pluies en France pour progresser au classement.',
    h1: 'Quiz météo et classement des pronostiqueurs',
    sectionTitle: 'Règles du jeu de prévision et des quiz pédagogiques',
    breadcrumbName: 'Quiz & Défis Météo',
    tabId: 'competitive',
    changefreq: 'daily',
    priority: '0.75',
    introParagraph:
      'Apprenez à décrypter l’atmosphère tout en vous mesurant aux autres passionnés : l’espace Quiz & Défis propose des questions pédagogiques sur les phénomènes météo ainsi que des pronostics de prévision où la précision de vos estimations est récompensée.',
    sections: [
      {
        heading: 'Défis de prévision : mettez-vous dans la peau d’un prévisionniste',
        body: 'Analysez les indices disponibles pour estimer la température maximale, le cumul de pluie ou la vitesse du vent sur une station donnée. Plus votre pronostic est proche de la réalité, plus vous marquez de points.',
      },
      {
        heading: 'Quiz thématiques sur les nuages, le climat et les records',
        body: 'Des séries de questions variées vous permettent de réviser la classification des nuages, les mécanismes des orages, les vents régionaux français et les grands records climatiques.',
      },
      {
        heading: 'Classement général et progression des joueurs',
        body: 'Cumulez de l’expérience au fil de vos bonnes réponses pour faire évoluer votre grade de prévisionniste et figurer au tableau d’honneur des meilleurs joueurs.',
      },
    ],
    faq: [
      {
        question: 'Comment sont attribués les points lors des défis météo ?',
        answer:
          'Le score dépend de la justesse de votre réponse et de votre régularité : une série de bonnes réponses consécutives déclenche un multiplicateur de points.',
      },
      {
        question: 'Faut-il être spécialiste en météorologie pour participer au quiz ?',
        answer:
          'Pas du tout : les questions comportent plusieurs niveaux de difficulté et chaque réponse est accompagnée d’une explication claire pour apprendre pas à pas.',
      },
      {
        question: 'Comment enregistrer mon score dans le classement des joueurs ?',
        answer:
          'Choisissez simplement un pseudonyme avant de lancer votre partie : vos points sont automatiquement sauvegardés et synchronisés avec le classement général.',
      },
    ],
  },
};

export interface MajorCitySeoConfig {
  slug: string;
  path: string;
  cityName: string;
  stationId: string;
  deptCode: string;
  department: string;
  region: string;
  altitude: number;
  climateZone: string;
  recordMax: number;
  recordMin: number;
  recordRain24h: number;
}

export const MAJOR_FRENCH_CITY_SEO_LIST: MajorCitySeoConfig[] = [
  {
    slug: 'paris',
    path: '/paris',
    cityName: 'Paris',
    stationId: 'paris-montsouris',
    deptCode: '75',
    department: '75 - Paris',
    region: 'Île-de-France',
    altitude: 75,
    climateZone: 'Océanique dégradé / Îlot de chaleur urbain',
    recordMax: 42.6,
    recordMin: -23.9,
    recordRain24h: 104.2,
  },
  {
    slug: 'lyon',
    path: '/lyon',
    cityName: 'Lyon',
    stationId: 'lyon-bron',
    deptCode: '69',
    department: '69 - Rhône',
    region: 'Auvergne-Rhône-Alpes',
    altitude: 201,
    climateZone: 'Semi-continental à influences méridionales',
    recordMax: 41.4,
    recordMin: -24.6,
    recordRain24h: 106.0,
  },
  {
    slug: 'marseille',
    path: '/marseille',
    cityName: 'Marseille',
    stationId: 'marseille-marignane',
    deptCode: '13',
    department: '13 - Bouches-du-Rhône',
    region: "Provence-Alpes-Côte d'Azur",
    altitude: 36,
    climateZone: 'Méditerranéen franc (Mistral)',
    recordMax: 40.2,
    recordMin: -16.8,
    recordRain24h: 196.4,
  },
  {
    slug: 'toulouse',
    path: '/toulouse',
    cityName: 'Toulouse',
    stationId: 'toulouse-blagnac',
    deptCode: '31',
    department: '31 - Haute-Garonne',
    region: 'Occitanie',
    altitude: 151,
    climateZone: "Océanique altéré / Aquitain chaud (Vent d'Autan)",
    recordMax: 42.4,
    recordMin: -19.2,
    recordRain24h: 82.7,
  },
  {
    slug: 'nice',
    path: '/nice',
    cityName: 'Nice',
    stationId: 'nice-cote-dazur',
    deptCode: '06',
    department: '06 - Alpes-Maritimes',
    region: "Provence-Alpes-Côte d'Azur",
    altitude: 4,
    climateZone: 'Méditerranéen maritime doux',
    recordMax: 37.7,
    recordMin: -7.2,
    recordRain24h: 191.0,
  },
  {
    slug: 'nantes',
    path: '/nantes',
    cityName: 'Nantes',
    stationId: 'nantes-atlantique',
    deptCode: '44',
    department: '44 - Loire-Atlantique',
    region: 'Pays de la Loire',
    altitude: 26,
    climateZone: 'Océanique franc tempéré',
    recordMax: 42.0,
    recordMin: -15.6,
    recordRain24h: 94.9,
  },
  {
    slug: 'montpellier',
    path: '/montpellier',
    cityName: 'Montpellier',
    stationId: 'montpellier-frejorgues',
    deptCode: '34',
    department: '34 - Hérault',
    region: 'Occitanie',
    altitude: 2,
    climateZone: 'Méditerranéen languedocien (Épisodes cévenols)',
    recordMax: 43.5,
    recordMin: -17.8,
    recordRain24h: 299.5,
  },
  {
    slug: 'strasbourg',
    path: '/strasbourg',
    cityName: 'Strasbourg',
    stationId: 'strasbourg-entzheim',
    deptCode: '67',
    department: '67 - Bas-Rhin',
    region: 'Grand Est',
    altitude: 153,
    climateZone: "Semi-continental d'abri rhénan",
    recordMax: 38.9,
    recordMin: -23.6,
    recordRain24h: 68.4,
  },
  {
    slug: 'bordeaux',
    path: '/bordeaux',
    cityName: 'Bordeaux',
    stationId: 'bordeaux-merignac',
    deptCode: '33',
    department: '33 - Gironde',
    region: 'Nouvelle-Aquitaine',
    altitude: 47,
    climateZone: 'Océanique aquitain doux et humide',
    recordMax: 41.2,
    recordMin: -16.4,
    recordRain24h: 111.4,
  },
  {
    slug: 'lille',
    path: '/lille',
    cityName: 'Lille',
    stationId: 'lille-lesquin',
    deptCode: '59',
    department: '59 - Nord',
    region: 'Hauts-de-France',
    altitude: 47,
    climateZone: 'Océanique flamand frais',
    recordMax: 41.5,
    recordMin: -19.5,
    recordRain24h: 64.0,
  },
  {
    slug: 'rennes',
    path: '/rennes',
    cityName: 'Rennes',
    stationId: 'rennes-st-jacques',
    deptCode: '35',
    department: '35 - Ille-et-Vilaine',
    region: 'Bretagne',
    altitude: 36,
    climateZone: 'Océanique breton intérieur',
    recordMax: 40.5,
    recordMin: -14.7,
    recordRain24h: 81.0,
  },
  {
    slug: 'grenoble',
    path: '/grenoble',
    cityName: 'Grenoble',
    stationId: 'grenoble-saint-geoirs',
    deptCode: '38',
    department: '38 - Isère',
    region: 'Auvergne-Rhône-Alpes',
    altitude: 384,
    climateZone: 'Préalpin à cuvette thermique',
    recordMax: 40.7,
    recordMin: -27.1,
    recordRain24h: 118.4,
  },
  {
    slug: 'dijon',
    path: '/dijon',
    cityName: 'Dijon',
    stationId: 'dijon-longvic',
    deptCode: '21',
    department: "21 - Côte-d'Or",
    region: 'Bourgogne-Franche-Comté',
    altitude: 221,
    climateZone: 'Semi-continental bourguignon',
    recordMax: 39.5,
    recordMin: -22.0,
    recordRain24h: 75.0,
  },
  {
    slug: 'brest',
    path: '/brest',
    cityName: 'Brest',
    stationId: 'brest-guipavas',
    deptCode: '29',
    department: '29 - Finistère',
    region: 'Bretagne',
    altitude: 94,
    climateZone: 'Hyper-océanique venteux',
    recordMax: 39.3,
    recordMin: -14.0,
    recordRain24h: 83.6,
  },
  {
    slug: 'clermont-ferrand',
    path: '/clermont-ferrand',
    cityName: 'Clermont-Ferrand',
    stationId: 'clermont-ferrand',
    deptCode: '63',
    department: '63 - Puy-de-Dôme',
    region: 'Auvergne-Rhône-Alpes',
    altitude: 330,
    climateZone: "Semi-continental de plaine d'abri (Limagne)",
    recordMax: 40.9,
    recordMin: -29.0,
    recordRain24h: 93.3,
  },
  {
    slug: 'reims',
    path: '/reims',
    cityName: 'Reims',
    stationId: 'reims-prunay',
    deptCode: '51',
    department: '51 - Marne',
    region: 'Grand Est',
    altitude: 95,
    climateZone: 'Semi-continental champenois',
    recordMax: 41.1,
    recordMin: -21.0,
    recordRain24h: 65.0,
  },
  {
    slug: 'rouen',
    path: '/rouen',
    cityName: 'Rouen',
    stationId: 'rouen-boos',
    deptCode: '76',
    department: '76 - Seine-Maritime',
    region: 'Normandie',
    altitude: 156,
    climateZone: 'Océanique normand humide',
    recordMax: 41.3,
    recordMin: -17.1,
    recordRain24h: 70.0,
  },
  {
    slug: 'tours',
    path: '/tours',
    cityName: 'Tours',
    stationId: 'tours-val-de-loire',
    deptCode: '37',
    department: '37 - Indre-et-Loire',
    region: 'Centre-Val de Loire',
    altitude: 108,
    climateZone: 'Océanique tourangeau doux',
    recordMax: 40.8,
    recordMin: -18.5,
    recordRain24h: 80.0,
  },
  {
    slug: 'perpignan',
    path: '/perpignan',
    cityName: 'Perpignan',
    stationId: 'perpignan-rivesaltes',
    deptCode: '66',
    department: '66 - Pyrénées-Orientales',
    region: 'Occitanie',
    altitude: 44,
    climateZone: 'Méditerranéen roussillonnais (Tramontane)',
    recordMax: 42.4,
    recordMin: -11.0,
    recordRain24h: 222.0,
  },
  {
    slug: 'caen',
    path: '/caen',
    cityName: 'Caen',
    stationId: 'caen-carpiquet',
    deptCode: '14',
    department: '14 - Calvados',
    region: 'Normandie',
    altitude: 78,
    climateZone: 'Océanique normand tempéré',
    recordMax: 40.1,
    recordMin: -19.6,
    recordRain24h: 75.0,
  },
];

const MAJOR_CITY_SEO_MAP_EN: Record<string, PageSeoMetadata> = {};

for (const city of MAJOR_FRENCH_CITY_SEO_LIST) {
  SEO_PAGES_MAP[city.path] = {
    slug: city.slug,
    path: city.path,
    canonicalUrl: `${BASE_SITE_URL}${city.path}`,
    title: `Météo ${city.cityName} (${city.deptCode}) en Direct — Prévisions 14 Jours & Radar Pluie | Instant Météo`,
    description: `Consultez la météo à ${city.cityName} (${city.department}, ${city.region}) en direct : température actuelle, prévisions heure par heure 48h, tendance à 14 jours, radar des pluies HD et vigilances.`,
    h1: `Météo ${city.cityName} (${city.deptCode}) — Observations en direct et prévisions à 14 jours`,
    sectionTitle: `Climatologie locale, prévisions heure par heure et radar pluie à ${city.cityName}`,
    breadcrumbName: `Météo ${city.cityName}`,
    tabId: 'realtime',
    changefreq: 'always',
    priority: '0.90',
    introParagraph: `Suivez en temps réel la météo à ${city.cityName} (${city.department}, région ${city.region}, altitude ${city.altitude} m). Retrouvez la température sous abri, le ressenti thermique, le risque de pluie dans l'heure par radar Doppler, le chronogramme 48 heures et la tendance complète à 7 et 14 jours.`,
    sections: [
      {
        heading: `Spécificités climatiques de ${city.cityName} (${city.region})`,
        body: `Située à ${city.altitude} mètres d'altitude dans le département ${city.department}, l'agglomération de ${city.cityName} se caractérise par un climat ${city.climateZone.toLowerCase()}. Les modèles haute résolution AROME (1,3 km) et ECMWF ajustent les prévisions locales en tenant compte de la topographie et de l'îlot de chaleur urbain.`,
      },
      {
        heading: `Suivi des précipitations et radar de pluie sur ${city.cityName}`,
        body: `Le nowcasting chirurgical (< 3h) et le radar des pluies permettent d'anticiper minute par minute le passage des averses, des fronts pluvieux et des cellules orageuses au-dessus de ${city.cityName} et de sa périphérie.`,
      },
      {
        heading: `Records météorologiques historiques à ${city.cityName}`,
        body: `Les archives climatiques de la station de référence de ${city.cityName} enregistrent un record absolu de chaleur de +${city.recordMax}°C, un record de froid de ${city.recordMin}°C et un cumul maximal de pluie en 24 heures de ${city.recordRain24h} mm.`,
      },
    ],
    faq: [
      {
        question: `Quel temps fait-il aujourd'hui à ${city.cityName} (${city.deptCode}) ?`,
        answer: `Consultez en haut de cette page le relevé en direct pour ${city.cityName} : température actuelle, ressenti, humidité, rafales de vent, pression atmosphérique et évolution heure par heure.`,
      },
      {
        question: `Va-t-il pleuvoir dans l'heure à ${city.cityName} ?`,
        answer: `Le module Prévisions Précipitations & Nowcasting analyse les échos radar en temps réel par pas de 5 minutes pour indiquer l'heure exacte du début et de la fin de la pluie à ${city.cityName}.`,
      },
      {
        question: `Quelles sont les prévisions météo à 7 et 14 jours pour ${city.cityName} ?`,
        answer: `Le tableau quotidien détaille pour chaque journée à ${city.cityName} les températures minimales et maximales, le cumul de pluie attendu, la vitesse du vent et l'indice UV.`,
      },
    ],
  };

  MAJOR_CITY_SEO_MAP_EN[city.path] = {
    slug: city.slug,
    path: city.path,
    canonicalUrl: `${BASE_SITE_URL}${city.path}`,
    title: `${city.cityName} Weather Live (${city.deptCode}) — 14-Day Forecast & Rain Radar | Instant Weather`,
    description: `Live weather in ${city.cityName} (${city.department}, ${city.region}, France): current temperature, 48-hour hourly forecast, 14-day outlook, HD Doppler rain radar and weather warnings.`,
    h1: `${city.cityName} Weather (${city.deptCode}) — Live Observations and 14-Day Forecast`,
    sectionTitle: `Local Climate, Hourly Forecasts and Rain Radar in ${city.cityName}`,
    breadcrumbName: `${city.cityName} Weather`,
    tabId: 'realtime',
    changefreq: 'always',
    priority: '0.90',
    introParagraph: `Track real-time weather in ${city.cityName} (${city.department}, ${city.region}, elevation ${city.altitude} m). View current temperature, wind chill / heat index, next-hour Doppler rain radar nowcasting, 48-hour hourly trends and 14-day forecasts.`,
    sections: [
      {
        heading: `Local climate characteristics of ${city.cityName} (${city.region})`,
        body: `Located at ${city.altitude} meters elevation in ${city.department}, ${city.cityName} experiences a ${city.climateZone} climate regime. High-resolution AROME (1.3 km) and ECMWF IFS models calibrate local forecasts for urban and topographic effects.`,
      },
      {
        heading: `Rain radar and 3-hour precipitation nowcasting in ${city.cityName}`,
        body: `Surgical 5-minute precipitation nowcasting and live Doppler radar track approaching rain bands, showers and thunderstorm cells across ${city.cityName}.`,
      },
      {
        heading: `Historical climate records in ${city.cityName}`,
        body: `Official station archives for ${city.cityName} record an all-time high temperature of +${city.recordMax}°C, an all-time low of ${city.recordMin}°C and a 24-hour rainfall record of ${city.recordRain24h} mm.`,
      },
    ],
    faq: [
      {
        question: `What is the current weather in ${city.cityName} today?`,
        answer: `Check the live telemetry card at the top of this page for ${city.cityName}: current temperature, feels-like index, humidity, wind gusts, barometric pressure and hourly trend.`,
      },
      {
        question: `Will it rain in the next hour in ${city.cityName}?`,
        answer: `The Precipitation Nowcasting module analyzes live Doppler radar echoes in 5-minute steps to indicate exact rain start and end times in ${city.cityName}.`,
      },
      {
        question: `What is the 7-day and 14-day weather forecast for ${city.cityName}?`,
        answer: `The daily forecast table provides minimum and maximum temperatures, precipitation probabilities, wind gusts and UV index day by day for ${city.cityName}.`,
      },
    ],
  };
}

export function getMajorCityConfigFromPath(rawPathname: string): MajorCitySeoConfig | null {
  let cleanPath = (rawPathname || '/').split('?')[0].split('#')[0].trim().toLowerCase();
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  if (cleanPath.startsWith('/meteo-')) {
    cleanPath = '/' + cleanPath.slice('/meteo-'.length);
  }
  return MAJOR_FRENCH_CITY_SEO_LIST.find((c) => c.path === cleanPath) || null;
}

export function getMajorCityPathForStationId(stationId?: string, stationName?: string): string | null {
  if (!stationId && !stationName) return null;
  const byId = MAJOR_FRENCH_CITY_SEO_LIST.find((c) => c.stationId === stationId);
  if (byId) return byId.path;
  if (stationName) {
    const cleanName = stationName.toLowerCase().trim();
    const byName = MAJOR_FRENCH_CITY_SEO_LIST.find(
      (c) =>
        cleanName === c.cityName.toLowerCase() ||
        cleanName.startsWith(c.cityName.toLowerCase() + '-') ||
        cleanName.startsWith(c.cityName.toLowerCase() + ' ')
    );
    if (byName) return byName.path;
  }
  return null;
}

/**
 * Normalise un chemin URL et retourne les métadonnées SEO correspondantes
 * dans la langue demandée (fr, en, de, es, it, pt, nl, ar, zh-CN, ja, ru, uk) avec le nom du site traduit.
 */
export function getSeoDataForPath(rawPathname: string, lang: string = 'fr'): PageSeoMetadata {
  const locale = normalizeSupportedLocale(lang);
  const isFr = locale === 'fr';
  const map: Record<string, PageSeoMetadata> = isFr
    ? SEO_PAGES_MAP
    : { ...SEO_PAGES_MAP_EN, ...MAJOR_CITY_SEO_MAP_EN };

  let cleanPath = (rawPathname || '/').split('?')[0].split('#')[0].trim();
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  if (cleanPath.toLowerCase().startsWith('/meteo-') && MAJOR_FRENCH_CITY_SEO_LIST.some((c) => c.path === '/' + cleanPath.slice(7).toLowerCase())) {
    cleanPath = '/' + cleanPath.slice(7).toLowerCase();
  }

  // Alias historiques éventuels redirigés vers la bonne configuration SEO
  const aliases: Record<string, string> = {
    '/accueil': '/',
    '/home': '/',
    '/meteo-en-direct': '/direct',
    '/temps-reel': '/direct',
    '/radar-pluie': '/radar',
    '/radar-meteo': '/radar',
    '/vigilance': '/vigilances',
    '/alertes': '/vigilances',
    '/nuage': '/nuages',
    '/satellite': '/nuages',
    '/nephologie': '/nuages',
    '/modeles': '/nuages',
    '/modele': '/nuages',
    '/modeles-meteo': '/nuages',
    '/previsions': '/14-jours',
    '/previsions-14-jours': '/14-jours',
    '/previsions-15-jours': '/14-jours',
    '/previsions-meteo': '/14-jours',
    '/tendances': '/14-jours',
    '/neige': '/montagne',
    '/ski': '/montagne',
    '/meteo-montagne': '/montagne',
    '/plage': '/plages',
    '/littoral': '/plages',
    '/mer': '/plages',
    '/marees': '/plages',
    '/meteo-des-plages': '/plages',
    '/vigi-secheresse-incendie': '/secheresse-incendie',
    '/secheresse': '/secheresse-incendie',
    '/incendie': '/secheresse-incendie',
    '/feux': '/secheresse-incendie',
    '/qualite-air': '/secheresse-incendie',
    '/vigicrues': '/cours-d-eau',
    '/crues': '/cours-d-eau',
    '/rivieres': '/cours-d-eau',
    '/cartes': '/cartes-thematiques',
    '/carte-france': '/cartes-thematiques',
    '/comparateur': '/cartes-thematiques',
    '/sport': '/sports',
    '/route': '/sports',
    '/trajets': '/sports',
    '/bulletin': '/bulletins',
    '/4-semaines': '/bulletins',
    '/methodologie': '/',
    '/archive': '/archives',
    '/historique': '/archives',
    '/histoire': '/archives',
    '/records': '/archives',
    '/normales': '/archives',
    '/monde': '/monde-catastrophes',
    '/catastrophes': '/monde-catastrophes',
    '/saisonnier': '/climat',
    '/8-mois': '/climat',
    '/evolution-climatique': '/climat',
    '/observations': '/communaute',
    '/forum': '/communaute',
    '/quiz': '/competition',
    '/jeu': '/competition',
    '/jeu-meteo': '/competition',
  };

  const resolvedPath = map[cleanPath]
    ? cleanPath
    : aliases[cleanPath] && map[aliases[cleanPath]]
      ? aliases[cleanPath]
      : '/';

  const baseSeo = map[resolvedPath] || SEO_PAGES_MAP[resolvedPath] || SEO_PAGES_MAP['/'];
  if (locale === 'fr' || locale === 'en') {
    return baseSeo;
  }

  // Pour les 10 autres langues (de, es, it, pt, nl, ar, zh-CN, ja, ru, uk),
  // adapte automatiquement le nom du site et les balises de la page dans la langue choisie
  const brand = getSiteBrandForLocale(locale);
  if (resolvedPath === '/') {
    return {
      ...baseSeo,
      title: brand.homeTitle,
      description: brand.homeDescription,
      h1: brand.homeH1,
      breadcrumbName: brand.homeBreadcrumb,
      introParagraph: `${brand.brandFull} (${brand.brandName}) — ${baseSeo.introParagraph}`,
    };
  }

  return {
    ...baseSeo,
    title: baseSeo.title.replace(/\|\s*Instant (?:Weather|Météo).*$/i, `| ${brand.brandName}`),
    description: `${brand.brandName}: ${baseSeo.description}`,
    h1: `${brand.brandName} — ${baseSeo.h1}`,
  };
}

/**
 * Retourne le chemin URL canonique associé à un onglet de navigation interne.
 */
export function getPathForTabId(tabId: string, currentPath?: string): string {
  const rawCurrent = currentPath !== undefined ? currentPath : typeof window !== 'undefined' ? window.location.pathname : '';
  const cleanCurrent = rawCurrent.length > 1 && rawCurrent.endsWith('/') ? rawCurrent.slice(0, -1) : rawCurrent;

  if (tabId === 'realtime') {
    const cityCfg = getMajorCityConfigFromPath(cleanCurrent);
    if (cityCfg) return cityCfg.path;
    return cleanCurrent === '/direct' ? '/direct' : '/';
  }
  if (tabId === 'radar') {
    return cleanCurrent === '/cartes-thematiques' ? '/cartes-thematiques' : '/radar';
  }

  const tabToPath: Record<string, string> = {
    vigilance: '/vigilances',
    cloudNephology: '/nuages',
    scenarios14d: '/14-jours',
    mountain: '/montagne',
    beaches: '/plages',
    droughtFire: '/secheresse-incendie',
    watercourses: '/cours-d-eau',
    franceMap: '/cartes-thematiques',
    sportsActivities: '/sports',
    bulletin: '/bulletins',
    fourWeeks: '/bulletins',
    nationalDigest: '/bulletins',
    weatherArchive: '/archives',
    historicalArchive: '/archives',
    historical: '/archives',
    anomalies: '/climat',
    worldDisasters: '/monde-catastrophes',
    eightMonths: '/climat',
    projections: '/climat',
    discussionGroup: '/communaute',
    competitive: '/competition',
    altitude: '/montagne',
  };

  return tabToPath[tabId] || '/';
}

/**
 * Retourne l'identifiant d'onglet React correspondant à l'URL visitée.
 */
export function getTabIdForPath(pathname: string): string {
  const seo = getSeoDataForPath(pathname);
  return seo.tabId;
}

/**
 * Génère les balises HTML <link rel="alternate" hreflang="..."> pour signaler
 * toutes les versions linguistiques et régionales à Google.
 */
export function generateHreflangLinksHtml(canonicalUrl: string): string {
  const links = SUPPORTED_HREFLANG_LOCALES.map(
    ({ hreflang, param }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${canonicalUrl}${param}" />`
  );
  links.push(`    <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`);
  return links.join('\n');
}

/**
 * Génère le Sitemap XML complet (sans balise <lastmod> fixe périmée)
 * incluant les entrées <url><loc> pour chacune des 18 pages dans toutes les langues (fr, en, de, es, it, pt, nl, ar, zh-CN, ja, ru, uk)
 * ainsi que la grappe réciproque complète xhtml:link hreflang pour Google.
 */
export function generateSitemapXml(): string {
  const routes = Object.values(SEO_PAGES_MAP);
  const urlEntries: string[] = [];

  for (const page of routes) {
    const hreflangTags = [
      ...SITEMAP_HREFLANG_LOCALES.map(
        ({ hreflang, param }) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${page.canonicalUrl}${param}" />`
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${page.canonicalUrl}" />`,
    ].join('\n');

    for (const langVariant of SITEMAP_LANGUAGE_PARAMS) {
      const locUrl = `${page.canonicalUrl}${langVariant.param}`;
      urlEntries.push(`  <url>\n    <loc>${locUrl}</loc>\n${hreflangTags}\n  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlEntries.join('\n')}\n</urlset>\n`;
}

/**
 * Génère le graphe JSON-LD Schema.org (WebSite + WebPage + BreadcrumbList + FAQPage) propre à la page et à la langue active.
 * Le nom du site (WebSite.name, Organization.name) change dynamiquement selon la langue (Instant Météo en FR, Instant Weather en EN, Instant Wetter en DE, etc.).
 */
export function generatePageJsonLd(seoData: PageSeoMetadata, lang: string = 'fr'): string {
  const locale = normalizeSupportedLocale(lang);
  const brand = getSiteBrandForLocale(locale);
  const langParam = locale === 'fr' ? '' : `?hl=${locale}`;
  const localizedHomeUrl = `${BASE_SITE_URL}/${langParam}`;
  const localizedPageUrl = `${seoData.canonicalUrl}${langParam}`;

  const breadcrumbItems: any[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: brand.brandName,
      item: localizedHomeUrl,
    },
  ];

  if (seoData.path !== '/') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: seoData.breadcrumbName,
      item: localizedPageUrl,
    });
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE_SITE_URL}/#website-${locale}`,
        url: localizedHomeUrl,
        name: brand.brandName,
        alternateName: [
          brand.brandFull,
          brand.brandUpper,
          'Instant Météo',
          'Instant Météo France',
          'Instant Weather',
          'Instant Weather France',
          'INSTANT WEATHER',
          'Instant Wetter',
          'Instant Clima',
          'Instant Meteo',
          'Instant Tempo',
          'Instant Weer',
        ],
        description: brand.homeDescription,
        inLanguage: brand.inLanguage,
      },
      {
        '@type': 'Organization',
        '@id': `${BASE_SITE_URL}/#organization`,
        name: brand.brandFull,
        alternateName: brand.brandName,
        url: localizedHomeUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_SITE_URL}/icon-512.png`,
          width: 512,
          height: 512,
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${localizedPageUrl}#webpage`,
        url: localizedPageUrl,
        name: seoData.title,
        headline: seoData.h1,
        description: seoData.description,
        isPartOf: { '@id': `${BASE_SITE_URL}/#website-${locale}` },
        about: { '@id': `${BASE_SITE_URL}/#organization` },
        inLanguage: brand.inLanguage,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${localizedPageUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
      {
        '@type': 'FAQPage',
        '@id': `${localizedPageUrl}#faq`,
        mainEntity: seoData.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return JSON.stringify(graph, null, 2);
}

/**
 * Génère le bloc HTML sémantique complet propre à chaque URL (servi dès la réponse HTTP initiale)
 * afin que Googlebot reçoive immédiatement le vrai H1, le nom de site traduit et le texte unique de la page en tout début de document,
 * sans dilution par le menu de navigation qui est placé en pied de page.
 */
export function generateStaticHtmlContent(seoData: PageSeoMetadata, lang: string = 'fr'): string {
  const locale = normalizeSupportedLocale(lang);
  const brand = getSiteBrandForLocale(locale);
  const isFr = locale === 'fr';
  const langParam = isFr ? '' : `?hl=${locale}`;
  const localizedCanonical = `${seoData.canonicalUrl}${langParam}`;
  const pagesMap = isFr ? SEO_PAGES_MAP : SEO_PAGES_MAP_EN;
  const navLinks = Object.values(pagesMap)
    .map(
      (page) =>
        `<li style="display:inline-block;margin:3px 8px 3px 0;"><a href="${page.path}${langParam}" style="color:#38bdf8;text-decoration:underline;font-weight:500;">${page.breadcrumbName}</a></li>`
    )
    .join('\n              ');

  const sectionsHtml = seoData.sections
    .map(
      (s) => `
        <article style="margin-bottom: 20px; padding: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #38bdf8; margin-top: 0; margin-bottom: 8px;">${s.heading}</h3>
          <p style="line-height: 1.65; color: #cbd5e1; margin: 0;">${s.body}</p>
        </article>`
    )
    .join('\n');

  const faqHtml = seoData.faq
    .map(
      (f) => `
        <div style="margin-bottom: 16px; padding: 14px; background: #0f172a; border-left: 3px solid #0284c7; border-radius: 6px;">
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #f8fafc; margin-top: 0; margin-bottom: 6px;">${f.question}</h3>
          <p style="line-height: 1.6; color: #cbd5e1; margin: 0;">${f.answer}</p>
        </div>`
    )
    .join('\n');

  const languageFooterLinks = [
    { code: 'fr', param: '', label: 'Français (Instant Météo)' },
    { code: 'en', param: '?hl=en', label: 'English (Instant Weather)' },
    { code: 'de', param: '?hl=de', label: 'Deutsch (Instant Wetter)' },
    { code: 'es', param: '?hl=es', label: 'Español (Instant Clima)' },
    { code: 'it', param: '?hl=it', label: 'Italiano (Instant Meteo)' },
    { code: 'pt', param: '?hl=pt', label: 'Português (Instant Tempo)' },
    { code: 'nl', param: '?hl=nl', label: 'Nederlands (Instant Weer)' },
    { code: 'ar', param: '?hl=ar', label: 'العربية (طقس فوري)' },
    { code: 'zh-CN', param: '?hl=zh-CN', label: '中文 (即时天气)' },
    { code: 'ja', param: '?hl=ja', label: '日本語 (インスタント天気)' },
    { code: 'ru', param: '?hl=ru', label: 'Русский (Мгновенная Погода)' },
    { code: 'uk', param: '?hl=uk', label: 'Українська (Миттєва Погода)' },
  ]
    .map(
      (l) =>
        `<a href="${seoData.canonicalUrl}${l.param}" hreflang="${l.code}" style="color: #38bdf8;">${l.label}</a>`
    )
    .join(' | ');

  const faqHeading = isFr
    ? `Questions fréquentes — ${seoData.breadcrumbName}`
    : `Frequently Asked Questions — ${seoData.breadcrumbName}`;
  const canonicalLabel = isFr ? 'URL canonique :' : 'Canonical URL:';
  const langLabel = isFr ? 'Langues disponibles :' : 'Available languages:';
  const dirLabel = isFr ? 'Rubriques météo :' : 'Weather sections:';

  return `
      <div class="seo-prerendered-content" style="max-width: 1140px; margin: 0 auto; padding: 28px 20px; font-family: system-ui, -apple-system, sans-serif; color: #f8fafc; background-color: #020617;">
        <header style="border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
          <p style="font-size: 0.85rem; color: #94a3b8; margin: 0 0 10px 0;">
            <a href="/${langParam}" style="color: #38bdf8; text-decoration: none; font-weight: 700;">${brand.brandFull}</a>
            ${seoData.path !== '/' ? ` &rsaquo; <strong style="color: #f8fafc;">${seoData.breadcrumbName}</strong>` : ''}
          </p>
          <h1 style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 12px 0; line-height: 1.25;">${seoData.h1}</h1>
          <p style="font-size: 1.08rem; line-height: 1.7; color: #cbd5e1; margin: 0;">${seoData.introParagraph}</p>
        </header>

        <section aria-labelledby="sections-explicatives" style="margin-bottom: 28px;">
          <h2 id="sections-explicatives" style="font-size: 1.4rem; font-weight: 700; color: #e2e8f0; margin-bottom: 16px; border-bottom: 2px solid #334155; padding-bottom: 8px;">${seoData.sectionTitle}</h2>
          ${sectionsHtml}
        </section>

        <section aria-labelledby="questions-frequentes" style="margin-bottom: 28px;">
          <h2 id="questions-frequentes" style="font-size: 1.4rem; font-weight: 700; color: #e2e8f0; margin-bottom: 16px; border-bottom: 2px solid #334155; padding-bottom: 8px;">${faqHeading}</h2>
          ${faqHtml}
        </section>

        <footer style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 0.85rem; color: #94a3b8;">
          <nav aria-label="${dirLabel}" style="margin-bottom: 12px;">
            <strong style="color: #cbd5e1; display: block; margin-bottom: 4px;">${dirLabel}</strong>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${navLinks}
            </ul>
          </nav>
          <p style="margin: 0 0 6px 0;">${canonicalLabel} <a href="${localizedCanonical}" style="color: #38bdf8;">${localizedCanonical}</a></p>
          <p style="margin: 0;">${langLabel} ${languageFooterLinks}</p>
        </footer>
      </div>`;
}
