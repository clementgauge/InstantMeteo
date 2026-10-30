import { GeographicZoneType } from '../utils/robustModelConsensus';

export interface PrefectureOrSousPrefecture {
  id: string;
  name: string;
  status: 'prefecture' | 'sous-prefecture';
  departmentCode: string;
  departmentName: string;
  region: string;
  latitude: number;
  longitude: number;
  altitude: number;
  geographicZone: GeographicZoneType;
  microclimaticTrait: string;
  localWind: string;
  elevationStage: string;
}

export interface RegionAdministrativeInfo {
  id: string;
  name: string;
  chefLieuRegional: string;
  departmentsCount: number;
  departmentsCodes: string[];
  climateSummary: string;
  dominantZone: GeographicZoneType;
  localities: PrefectureOrSousPrefecture[];
}

export const FRENCH_REGIONS_CATALOG: RegionAdministrativeInfo[] = [
  // 1. Île-de-France (8 départements)
  {
    id: 'ile-de-france',
    name: 'Île-de-France',
    chefLieuRegional: 'Paris',
    departmentsCount: 8,
    departmentsCodes: ['75', '77', '78', '91', '92', '93', '94', '95'],
    climateSummary: 'Climat océanique dégradé marqué par un îlot de chaleur urbain nocturne puissant (+2°C à +5°C sur Paris intra-muros) et des contrastes nets avec les plateaux briards et beaucerons.',
    dominantZone: 'PARIS_NORTH_PLAINS',
    localities: [
      { id: 'pref-75', name: 'Paris', status: 'prefecture', departmentCode: '75', departmentName: 'Paris', region: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, altitude: 45, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Îlot de chaleur urbain dense (ICU), surélévation des minimales nocturnes', localWind: 'Faible à modéré, canalisé par les avenues', elevationStage: 'Plaine fluviale' },
      { id: 'pref-78', name: 'Versailles', status: 'prefecture', departmentCode: '78', departmentName: 'Yvelines', region: 'Île-de-France', latitude: 48.8049, longitude: 2.1204, altitude: 135, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Plateau forestier et vallonné, nuits plus fraîches que Paris (-2°C)', localWind: 'Vent d\'Ouest franc', elevationStage: 'Plateau' },
      { id: 'spref-78-mantes', name: 'Mantes-la-Jolie', status: 'sous-prefecture', departmentCode: '78', departmentName: 'Yvelines', region: 'Île-de-France', latitude: 48.9908, longitude: 1.7172, altitude: 35, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Boucle de la Seine, brumes matinales fréquentes', localWind: 'Flux de Seine', elevationStage: 'Vallée fluviale' },
      { id: 'pref-77', name: 'Melun', status: 'prefecture', departmentCode: '77', departmentName: 'Seine-et-Marne', region: 'Île-de-France', latitude: 48.5392, longitude: 2.6599, altitude: 70, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Bordure de la forêt de Fontainebleau, inversion nocturne de clairière', localWind: 'Régime d\'Ouest à Sud-Ouest', elevationStage: 'Plaine' },
      { id: 'spref-77-meaux', name: 'Meaux', status: 'sous-prefecture', departmentCode: '77', departmentName: 'Seine-et-Marne', region: 'Île-de-France', latitude: 48.9603, longitude: 2.8883, altitude: 55, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Plateau de la Brie, ciel souvent dégagé en flux de Nord-Est', localWind: 'Bise de Nord-Est', elevationStage: 'Plateau briard' },
      { id: 'pref-91', name: 'Évry-Courcouronnes', status: 'prefecture', departmentCode: '91', departmentName: 'Essonne', region: 'Île-de-France', latitude: 48.6298, longitude: 2.4418, altitude: 80, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Plateau du Hurepoix, bonne réactivité thermique diurne', localWind: 'Vent de Sud-Ouest', elevationStage: 'Plateau' },
      { id: 'pref-92', name: 'Nanterre', status: 'prefecture', departmentCode: '92', departmentName: 'Hauts-de-Seine', region: 'Île-de-France', latitude: 48.8924, longitude: 2.2071, altitude: 38, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Petite couronne urbaine dense, influence de la Seine', localWind: 'Vent d\'Ouest urbain', elevationStage: 'Plaine alluviale' },
      { id: 'pref-93', name: 'Bobigny', status: 'prefecture', departmentCode: '93', departmentName: 'Seine-Saint-Denis', region: 'Île-de-France', latitude: 48.9086, longitude: 2.4397, altitude: 48, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Bassin sédimentaire urbain, forte concentration thermique', localWind: 'Vent faible', elevationStage: 'Plaine' },
      { id: 'pref-94', name: 'Créteil', status: 'prefecture', departmentCode: '94', departmentName: 'Val-de-Marne', region: 'Île-de-France', latitude: 48.7904, longitude: 2.4556, altitude: 40, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Confluence Seine-Marne et lac de Créteil, humidité relative élevée', localWind: 'Brise de confluence', elevationStage: 'Vallée fluviale' },
      { id: 'pref-95', name: 'Cergy', status: 'prefecture', departmentCode: '95', departmentName: 'Val-d\'Oise', region: 'Île-de-France', latitude: 49.0362, longitude: 2.0772, altitude: 65, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Boucle de l\'Oise et plateau du Vexin français, brouillards d\'automne tenaces', localWind: 'Vent d\'Ouest-Nord-Ouest', elevationStage: 'Coteau & Plateau' }
    ]
  },

  // 2. Auvergne-Rhône-Alpes (12 départements)
  {
    id: 'auvergne-rhone-alpes',
    name: 'Auvergne-Rhône-Alpes',
    chefLieuRegional: 'Lyon',
    departmentsCount: 12,
    departmentsCodes: ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'],
    climateSummary: 'Grand carrefour météorologique entre plaines semi-continentales (Saône, Rhône), cuvettes orographiques fermées (Grenoble, Clermont-Ferrand), plateaux volcaniques d\'altitude (Cantal, Sancy) et hauts massifs alpins (Mont-Blanc, Vanoise). Fortes inversions thermiques hivernales.',
    dominantZone: 'MOUNTAIN_ALPS',
    localities: [
      { id: 'pref-69', name: 'Lyon', status: 'prefecture', departmentCode: '69', departmentName: 'Rhône', region: 'Auvergne-Rhône-Alpes', latitude: 45.7640, longitude: 4.8357, altitude: 175, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Carrefour Saône-Rhône, inversions et stratus fréquents en automne/hiver', localWind: 'Vent du Sud / Bise de Nord', elevationStage: 'Plaine alluviale' },
      { id: 'pref-38', name: 'Grenoble', status: 'prefecture', departmentCode: '38', departmentName: 'Isère', region: 'Auvergne-Rhône-Alpes', latitude: 45.1885, longitude: 5.7245, altitude: 215, geographicZone: 'MOUNTAIN_ALPS', microclimaticTrait: 'Cuvette alpine fermée (Belledonne, Chartreuse, Vercors), très chaud en été, gelées d\'inversion', localWind: 'Brises de vallée / Foehn', elevationStage: 'Cuvette intra-alpine' },
      { id: 'pref-74', name: 'Annecy', status: 'prefecture', departmentCode: '74', departmentName: 'Haute-Savoie', region: 'Auvergne-Rhône-Alpes', latitude: 45.8992, longitude: 6.1294, altitude: 450, geographicZone: 'MOUNTAIN_ALPS', microclimaticTrait: 'Bordure du lac d\'Annecy et Préalpes des Bornes, régulation thermique lacustre', localWind: 'Brise lacustre et montante', elevationStage: 'Étage collinéen alpin' },
      { id: 'spref-74-chamonix', name: 'Chamonix-Mont-Blanc', status: 'sous-prefecture', departmentCode: '74', departmentName: 'Haute-Savoie', region: 'Auvergne-Rhône-Alpes', latitude: 45.9237, longitude: 6.8694, altitude: 1035, geographicZone: 'MOUNTAIN_ALPS', microclimaticTrait: 'Haute vallée de l\'Arve au pied du Mont-Blanc, fortes amplitudes, LPN basse par isothermie', localWind: 'Vent de crête / Bise de combe', elevationStage: 'Étage montagnard supérieur' },
      { id: 'pref-73', name: 'Chambéry', status: 'prefecture', departmentCode: '73', departmentName: 'Savoie', region: 'Auvergne-Rhône-Alpes', latitude: 45.5646, longitude: 5.9178, altitude: 275, geographicZone: 'MOUNTAIN_ALPS', microclimaticTrait: 'Cluse alpine entre Bauges et Chartreuse, lac du Bourget proche', localWind: 'Vent de cluse', elevationStage: 'Cluse alpine' },
      { id: 'spref-73-albertville', name: 'Albertville', status: 'sous-prefecture', departmentCode: '73', departmentName: 'Savoie', region: 'Auvergne-Rhône-Alpes', latitude: 45.6756, longitude: 6.3927, altitude: 345, geographicZone: 'MOUNTAIN_ALPS', microclimaticTrait: 'Carrefour des vallées de Tarentaise et Maurienne, réactif aux précipitations d\'ouest', localWind: 'Brise de Tarentaise', elevationStage: 'Pied de massif' },
      { id: 'pref-63', name: 'Clermont-Ferrand', status: 'prefecture', departmentCode: '63', departmentName: 'Puy-de-Dôme', region: 'Auvergne-Rhône-Alpes', latitude: 45.7772, longitude: 3.0870, altitude: 360, geographicZone: 'MOUNTAIN_MASSIF_CENTRAL', microclimaticTrait: 'Plaine de la Limagne sous le vent de la Chaîne des Puys (effet d\'abri et de foehn marqué)', localWind: 'Vent d\'Ouest asséché', elevationStage: 'Plaine de piémont' },
      { id: 'pref-42', name: 'Saint-Étienne', status: 'prefecture', departmentCode: '42', departmentName: 'Loire', region: 'Auvergne-Rhône-Alpes', latitude: 45.4397, longitude: 4.3872, altitude: 520, geographicZone: 'MOUNTAIN_MASSIF_CENTRAL', microclimaticTrait: 'Seuil de partage des eaux au pied du Pilat, vent de Sud turbulent, neige précoce', localWind: 'Vent du Sud / Bise de Pilat', elevationStage: 'Étage collinéen élevé' },
      { id: 'pref-15', name: 'Aurillac', status: 'prefecture', departmentCode: '15', departmentName: 'Cantal', region: 'Auvergne-Rhône-Alpes', latitude: 44.9261, longitude: 2.4452, altitude: 630, geographicZone: 'MOUNTAIN_MASSIF_CENTRAL', microclimaticTrait: 'Plateau auvergnat d\'altitude, record de fraîcheur matinale réputé, hivers rigoureux', localWind: 'Vent d\'Ouest océanique', elevationStage: 'Étage montagnard volcanique' },
      { id: 'pref-26', name: 'Valence', status: 'prefecture', departmentCode: '26', departmentName: 'Drôme', region: 'Auvergne-Rhône-Alpes', latitude: 44.9333, longitude: 4.8917, altitude: 130, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Porte du Midi dans le couloir rhodanien, transition océanique-méditerranéenne', localWind: 'Mistral violent (> 80 km/h)', elevationStage: 'Vallée du Rhône' },
      { id: 'pref-01', name: 'Bourg-en-Bresse', status: 'prefecture', departmentCode: '01', departmentName: 'Ain', region: 'Auvergne-Rhône-Alpes', latitude: 46.2052, longitude: 5.2258, altitude: 240, geographicZone: 'MOUNTAIN_JURA_VOSGES', microclimaticTrait: 'Plaine bressane et piémont du Revermont jurassien, brouillards denses', localWind: 'Bise noire', elevationStage: 'Plaine de piémont' },
      { id: 'pref-43', name: 'Le Puy-en-Velay', status: 'prefecture', departmentCode: '43', departmentName: 'Haute-Loire', region: 'Auvergne-Rhône-Alpes', latitude: 45.0428, longitude: 3.8829, altitude: 630, geographicZone: 'MOUNTAIN_MASSIF_CENTRAL', microclimaticTrait: 'Bassin volcanique du Velay, climat très tonique, fortes amplitudes thermiques', localWind: 'Vent de Nord frais', elevationStage: 'Plateau montagnard' }
    ]
  },

  // 3. Provence-Alpes-Côte d'Azur (6 départements)
  {
    id: 'paca',
    name: 'Provence-Alpes-Côte d\'Azur',
    chefLieuRegional: 'Marseille',
    departmentsCount: 6,
    departmentsCodes: ['04', '05', '06', '13', '83', '84'],
    climateSummary: 'Climat méditerranéen franc le plus ensoleillé de France (> 2700 h de soleil/an), rythmé par le Mistral violent en basse vallée du Rhône, contrastant avec les hauts massifs alpins du Mercantour, des Écrins et du Queyras.',
    dominantZone: 'MEDITERRANEAN_SE',
    localities: [
      { id: 'pref-13', name: 'Marseille', status: 'prefecture', departmentCode: '13', departmentName: 'Bouches-du-Rhône', region: 'Provence-Alpes-Côte d\'Azur', latitude: 43.2965, longitude: 5.3698, altitude: 20, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Façade maritime rocheuse, assèchement brutal par le Mistral, brises de mer estivales', localWind: 'Mistral (Nord-Nord-Ouest)', elevationStage: 'Bordure maritime' },
      { id: 'spref-13-aix', name: 'Aix-en-Provence', status: 'sous-prefecture', departmentCode: '13', departmentName: 'Bouches-du-Rhône', region: 'Provence-Alpes-Côte d\'Azur', latitude: 43.5297, longitude: 5.4474, altitude: 200, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Bassin au pied de la Sainte-Victoire, nuits plus froides que la côte (-3°C à -5°C)', localWind: 'Mistral atténué', elevationStage: 'Bassin intérieur' },
      { id: 'pref-06', name: 'Nice', status: 'prefecture', departmentCode: '06', departmentName: 'Alpes-Maritimes', region: 'Provence-Alpes-Côte d\'Azur', latitude: 43.7102, longitude: 7.2620, altitude: 15, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Baie des Anges abritée du Mistral par les Préalpes de Grasse, hivers exceptionnellement doux', localWind: 'Libeccio / Brise thermique', elevationStage: 'Littoral abrité' },
      { id: 'spref-06-grasse', name: 'Grasse', status: 'sous-prefecture', departmentCode: '06', departmentName: 'Alpes-Maritimes', region: 'Provence-Alpes-Côte d\'Azur', latitude: 43.6600, longitude: 6.9242, altitude: 330, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Balcon ensoleillé au pied des Préalpes, microclimat floral doux', localWind: 'Brise de montagne', elevationStage: 'Coteau méditerranéen' },
      { id: 'pref-83', name: 'Toulon', status: 'prefecture', departmentCode: '83', departmentName: 'Var', region: 'Provence-Alpes-Côte d\'Azur', latitude: 43.1242, longitude: 5.9280, altitude: 15, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Rade abritée par les monts Faron et Coudon, ensoleillement record', localWind: 'Mistral et vent d\'Est', elevationStage: 'Littoral varois' },
      { id: 'pref-84', name: 'Avignon', status: 'prefecture', departmentCode: '84', departmentName: 'Vaucluse', region: 'Provence-Alpes-Côte d\'Azur', latitude: 43.9493, longitude: 4.8055, altitude: 25, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Cœur du couloir du Mistral, hygrométrie très basse lors des coups de vent', localWind: 'Mistral violent', elevationStage: 'Plaine rhodanienne' },
      { id: 'pref-05', name: 'Gap', status: 'prefecture', departmentCode: '05', departmentName: 'Hautes-Alpes', region: 'Provence-Alpes-Côte d\'Azur', latitude: 44.5596, longitude: 6.0798, altitude: 750, geographicZone: 'MOUNTAIN_ALPS', microclimaticTrait: 'Bassin intra-alpin très ensoleillé (300 jours/an), air sec et pur', localWind: 'Brise de Durance', elevationStage: 'Étage montagnard sud-alpin' },
      { id: 'spref-05-briancon', name: 'Briançon', status: 'sous-prefecture', departmentCode: '05', departmentName: 'Hautes-Alpes', region: 'Provence-Alpes-Côte d\'Azur', latitude: 44.8994, longitude: 6.6433, altitude: 1320, geographicZone: 'MOUNTAIN_ALPS', microclimaticTrait: 'Plus haute ville d\'Europe, climat sub-méditerranéen d\'altitude sec, Lombarde d\'Italie', localWind: 'La Lombarde (Est)', elevationStage: 'Haute montagne intra-alpine' },
      { id: 'pref-04', name: 'Digne-les-Bains', status: 'prefecture', departmentCode: '04', departmentName: 'Alpes-de-Haute-Provence', region: 'Provence-Alpes-Côte d\'Azur', latitude: 44.0922, longitude: 6.2361, altitude: 600, geographicZone: 'MOUNTAIN_ALPS', microclimaticTrait: 'Vallée de la Bléone, transition entre Haute-Provence et Alpes de lumière', localWind: 'Brise de Bléone', elevationStage: 'Piémont alpin' }
    ]
  },

  // 4. Occitanie (13 départements)
  {
    id: 'occitanie',
    name: 'Occitanie',
    chefLieuRegional: 'Toulouse',
    departmentsCount: 13,
    departmentsCodes: ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'],
    climateSummary: 'Contraste saisissant entre l\'est méditerranéen (Montpellier, Nîmes, Perpignan) balayé par la Tramontane et exposé aux crues cévenoles, le couloir du vent d\'Autan (Toulouse, Lauragais, Castres), le relief pyrénéen et les hauts plateaux de l\'Aubrac et de la Lozère.',
    dominantZone: 'MEDITERRANEAN_SE',
    localities: [
      { id: 'pref-31', name: 'Toulouse', status: 'prefecture', departmentCode: '31', departmentName: 'Haute-Garonne', region: 'Occitanie', latitude: 43.6047, longitude: 1.4442, altitude: 145, geographicZone: 'SOUTH_WEST_AQUITAINE', microclimaticTrait: 'Plaine de la Garonne, carrefour océanique-méditerranéen, vent d\'Autan turbulent', localWind: 'Vent d\'Autan (« vent qui rend fou »)', elevationStage: 'Plaine garonnaise' },
      { id: 'pref-34', name: 'Montpellier', status: 'prefecture', departmentCode: '34', departmentName: 'Hérault', region: 'Occitanie', latitude: 43.6108, longitude: 3.8767, altitude: 35, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Plaine littorale languedocienne, soumise aux flux marins humides et orages cévenols', localWind: 'Marin (Sud-Est) / Tramontane', elevationStage: 'Bordure côtière' },
      { id: 'spref-34-beziers', name: 'Béziers', status: 'sous-prefecture', departmentCode: '34', departmentName: 'Hérault', region: 'Occitanie', latitude: 43.3442, longitude: 3.2158, altitude: 45, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Colline biterroise au-dessus de l\'Orb, très chaud et sec en été', localWind: 'Tramontane vive', elevationStage: 'Plaine littorale' },
      { id: 'pref-30', name: 'Nîmes', status: 'prefecture', departmentCode: '30', departmentName: 'Gard', region: 'Occitanie', latitude: 43.8367, longitude: 4.3601, altitude: 45, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Pied des garrigues cévenoles, très forte chaleur estivale (> 40°C), Mistral', localWind: 'Mistral rhodanien', elevationStage: 'Garrigues de plaine' },
      { id: 'pref-66', name: 'Perpignan', status: 'prefecture', departmentCode: '66', departmentName: 'Pyrénées-Orientales', region: 'Occitanie', latitude: 42.6887, longitude: 2.8948, altitude: 35, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Plaine du Roussillon dominée par le Canigou, Tramontane violente (> 100 km/h)', localWind: 'Tramontane (Nord-Ouest)', elevationStage: 'Plaine roussillonnaise' },
      { id: 'pref-65', name: 'Tarbes', status: 'prefecture', departmentCode: '65', departmentName: 'Hautes-Pyrénées', region: 'Occitanie', latitude: 43.2329, longitude: 0.0781, altitude: 310, geographicZone: 'MOUNTAIN_PYRENEES', microclimaticTrait: 'Piémont bigourdan, effet de foehn très net lors des flux de Sud pyrénéens', localWind: 'Vent de Sud (Foehn chaud)', elevationStage: 'Piémont pyrénéen' },
      { id: 'pref-09', name: 'Foix', status: 'prefecture', departmentCode: '09', departmentName: 'Ariège', region: 'Occitanie', latitude: 42.9647, longitude: 1.6053, altitude: 400, geographicZone: 'MOUNTAIN_PYRENEES', microclimaticTrait: 'Vallée de l\'Ariège au pied du massif du Plantaurel, blocages nuageux en flux de Nord', localWind: 'Brise d\'Ariège', elevationStage: 'Vallée montagnarde' },
      { id: 'pref-81', name: 'Albi', status: 'prefecture', departmentCode: '81', departmentName: 'Tarn', region: 'Occitanie', latitude: 43.9284, longitude: 2.1480, altitude: 175, geographicZone: 'SOUTH_WEST_AQUITAINE', microclimaticTrait: 'Bassin tarnais en brique rouge, étés caniculaires, vent d\'Autan', localWind: 'Vent d\'Autan', elevationStage: 'Bassin intérieur' },
      { id: 'pref-12', name: 'Rodez', status: 'prefecture', departmentCode: '12', departmentName: 'Aveyron', region: 'Occitanie', latitude: 44.3516, longitude: 2.5739, altitude: 580, geographicZone: 'MOUNTAIN_MASSIF_CENTRAL', microclimaticTrait: 'Plateau du Rouergue, climat tonique, gelées printanières régulières', localWind: 'Vent de Nord-Ouest', elevationStage: 'Plateau caussenard' },
      { id: 'pref-48', name: 'Mende', status: 'prefecture', departmentCode: '48', departmentName: 'Lozère', region: 'Occitanie', latitude: 44.5176, longitude: 3.5008, altitude: 740, geographicZone: 'MOUNTAIN_MASSIF_CENTRAL', microclimaticTrait: 'Plus haute préfecture de France en fond de vallée du Lot, fortes gelées nocturnes', localWind: 'Brise de causse', elevationStage: 'Moyenne montagne cévenole' }
    ]
  },

  // 5. Nouvelle-Aquitaine (12 départements)
  {
    id: 'nouvelle-aquitaine',
    name: 'Nouvelle-Aquitaine',
    chefLieuRegional: 'Bordeaux',
    departmentsCount: 12,
    departmentsCodes: ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'],
    climateSummary: 'Plus vaste région de France : douceur océanique de la Côte d\'Argent (Arcachon, Biarritz, La Rochelle), vignobles bordelais réchauffés, plateaux limousins plus frais et humides, et barrière pyrénéenne basco-béarnaise.',
    dominantZone: 'SOUTH_WEST_AQUITAINE',
    localities: [
      { id: 'pref-33', name: 'Bordeaux', status: 'prefecture', departmentCode: '33', departmentName: 'Gironde', region: 'Nouvelle-Aquitaine', latitude: 44.8378, longitude: -0.5792, altitude: 25, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Estuaire de la Gironde, douceur océanique, étés chauds à orages préfrontaux violents', localWind: 'Vent d\'Ouest atlantique', elevationStage: 'Plaine estuarienne' },
      { id: 'pref-64', name: 'Pau', status: 'prefecture', departmentCode: '64', departmentName: 'Pyrénées-Atlantiques', region: 'Nouvelle-Aquitaine', latitude: 43.2951, longitude: -0.3708, altitude: 195, geographicZone: 'MOUNTAIN_PYRENEES', microclimaticTrait: 'Piémont béarnais face au Pic du Midi d\'Ossau, douceur record par effet de foehn', localWind: 'Vent de Sud (Foehn basque)', elevationStage: 'Piémont pyrénéen' },
      { id: 'spref-64-bayonne', name: 'Bayonne / Biarritz', status: 'sous-prefecture', departmentCode: '64', departmentName: 'Pyrénées-Atlantiques', region: 'Nouvelle-Aquitaine', latitude: 43.4929, longitude: -1.4748, altitude: 15, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Côte basque hyper-océanique, fortes précipitations annuelles (> 1400 mm), douceur hivernale', localWind: 'Vent de mer / Galerne soudaine', elevationStage: 'Littoral atlantique sud' },
      { id: 'pref-17', name: 'La Rochelle', status: 'prefecture', departmentCode: '17', departmentName: 'Charente-Maritime', region: 'Nouvelle-Aquitaine', latitude: 46.1603, longitude: -1.1511, altitude: 10, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Ensoleillement exceptionnel réputé comparable à la Méditerranée, brise de mer active', localWind: 'Vent de Nord-Ouest marin', elevationStage: 'Littoral charentais' },
      { id: 'pref-87', name: 'Limoges', status: 'prefecture', departmentCode: '87', departmentName: 'Haute-Vienne', region: 'Nouvelle-Aquitaine', latitude: 45.8336, longitude: 1.2611, altitude: 280, geographicZone: 'MOUNTAIN_MASSIF_CENTRAL', microclimaticTrait: 'Plateau limousin humide et verdoyant, nuits fraîches, brouillards matinaux', localWind: 'Flux d\'Ouest pluvieux', elevationStage: 'Plateau collinéen' },
      { id: 'pref-86', name: 'Poitiers', status: 'prefecture', departmentCode: '86', departmentName: 'Vienne', region: 'Nouvelle-Aquitaine', latitude: 46.5802, longitude: 0.3404, altitude: 110, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Seuil du Poitou entre bassins parisien et aquitain, bon ensoleillement', localWind: 'Vent d\'Ouest-Sud-Ouest', elevationStage: 'Plateau poitevin' },
      { id: 'pref-40', name: 'Mont-de-Marsan', status: 'prefecture', departmentCode: '40', departmentName: 'Landes', region: 'Nouvelle-Aquitaine', latitude: 43.8903, longitude: -0.4998, altitude: 45, geographicZone: 'SOUTH_WEST_AQUITAINE', microclimaticTrait: 'Forêt des Landes de Gascogne sur sol sableux : très forte amplitude jour/nuit', localWind: 'Brise de pinède', elevationStage: 'Plaine landaise' },
      { id: 'pref-47', name: 'Agen', status: 'prefecture', departmentCode: '47', departmentName: 'Lot-et-Garonne', region: 'Nouvelle-Aquitaine', latitude: 44.2031, longitude: 0.6164, altitude: 50, geographicZone: 'SOUTH_WEST_AQUITAINE', microclimaticTrait: 'Vallée de la Garonne alluviale, étés chauds favorables aux vergers', localWind: 'Vent d\'Ouest modéré', elevationStage: 'Vallée alluviale' },
      { id: 'pref-24', name: 'Périgueux', status: 'prefecture', departmentCode: '24', departmentName: 'Dordogne', region: 'Nouvelle-Aquitaine', latitude: 45.1839, longitude: 0.7217, altitude: 90, geographicZone: 'SOUTH_WEST_AQUITAINE', microclimaticTrait: 'Vallée de l\'Isle au cœur du Périgord, étés chauds et brumes matinales', localWind: 'Vent calme d\'abri', elevationStage: 'Coteau périgourdin' }
    ]
  },

  // 6. Bretagne (4 départements)
  {
    id: 'bretagne',
    name: 'Bretagne',
    chefLieuRegional: 'Rennes',
    departmentsCount: 4,
    departmentsCodes: ['22', '29', '35', '56'],
    climateSummary: 'Climat océanique pur tempéré par l\'Atlantique et la Manche : hivers très doux exempts de grands froids, étés tempérés sans canicules extrêmes sur les pointes finistériennes, passages frontaux dynamiques et microclimat doux du Golfe du Morbihan.',
    dominantZone: 'COASTAL_ATLANTIC_MANCHE',
    localities: [
      { id: 'pref-35', name: 'Rennes', status: 'prefecture', departmentCode: '35', departmentName: 'Ille-et-Vilaine', region: 'Bretagne', latitude: 48.1173, longitude: -1.6778, altitude: 35, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Bassin rennais abrité des vents violents de côte, étés plus chauds que sur le littoral', localWind: 'Vent de Sud-Ouest tempéré', elevationStage: 'Bassin intérieur' },
      { id: 'spref-35-stmalo', name: 'Saint-Malo', status: 'sous-prefecture', departmentCode: '35', departmentName: 'Ille-et-Vilaine', region: 'Bretagne', latitude: 48.6493, longitude: -2.0257, altitude: 12, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Côte d\'Émeraude aux marées spectaculaires, brise marine vive et constante', localWind: 'Vent de Noroît marin', elevationStage: 'Littoral de la Manche' },
      { id: 'pref-29', name: 'Quimper', status: 'prefecture', departmentCode: '29', departmentName: 'Finistère', region: 'Bretagne', latitude: 47.9960, longitude: -4.0999, altitude: 25, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Vallée de l\'Odet en Cornouaille, grande douceur océanique et végétation semi-exotique', localWind: 'Vent d\'Ouest doux', elevationStage: 'Fond d\'aber' },
      { id: 'spref-29-brest', name: 'Brest', status: 'sous-prefecture', departmentCode: '29', departmentName: 'Finistère', region: 'Bretagne', latitude: 48.3904, longitude: -4.4861, altitude: 40, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Pointe bretonne en rade de Brest, très faible amplitude thermique, vent permanent', localWind: 'Vent d\'Ouest à Sud-Ouest soutenu', elevationStage: 'Pointe côtière atlantique' },
      { id: 'pref-56', name: 'Vannes', status: 'prefecture', departmentCode: '56', departmentName: 'Morbihan', region: 'Bretagne', latitude: 47.6582, longitude: -2.7608, altitude: 15, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Bordure du Golfe du Morbihan (« petite mer »), microclimat d\'une douceur insulaire', localWind: 'Brise thermique du golfe', elevationStage: 'Bordure littorale abritée' },
      { id: 'spref-56-lorient', name: 'Lorient', status: 'sous-prefecture', departmentCode: '56', departmentName: 'Morbihan', region: 'Bretagne', latitude: 47.7483, longitude: -3.3702, altitude: 20, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Rade de Lorient face à l\'île de Groix, air iodé tempéré toute l\'année', localWind: 'Vent océanique d\'Ouest', elevationStage: 'Rade côtière' },
      { id: 'pref-22', name: 'Saint-Brieuc', status: 'prefecture', departmentCode: '22', departmentName: 'Côtes-d\'Armor', region: 'Bretagne', latitude: 48.5141, longitude: -2.7658, altitude: 65, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Baie de Saint-Brieuc sur la Manche, passages pluvieux rapides et éclaircies lumineuses', localWind: 'Vent de Nord-Ouest', elevationStage: 'Plateau côtier' }
    ]
  },

  // 7. Grand Est (10 départements)
  {
    id: 'grand-est',
    name: 'Grand Est',
    chefLieuRegional: 'Strasbourg',
    departmentsCount: 10,
    departmentsCodes: ['08', '10', '51', '52', '54', '55', '56', '57', '67', '68', '88'],
    climateSummary: 'Climat semi-continental le plus marqué de France : hivers froids sous anticyclone russe avec gelées sévères et stratus tenaces, étés orageux et chauds. La plaine d\'Alsace (Colmar, Strasbourg) bénéficie de l\'effet d\'abri vosgien exceptionnel (faible pluviosité).',
    dominantZone: 'CONTINENTAL_EAST',
    localities: [
      { id: 'pref-67', name: 'Strasbourg', status: 'prefecture', departmentCode: '67', departmentName: 'Bas-Rhin', region: 'Grand Est', latitude: 48.5734, longitude: 7.7521, altitude: 140, geographicZone: 'CONTINENTAL_EAST', microclimaticTrait: 'Plaine du Rhin abritée des pluies océaniques par les Vosges, hivers froids et étés chauds', localWind: 'Bise de Nord-Est', elevationStage: 'Fossé rhénan' },
      { id: 'pref-68', name: 'Colmar', status: 'prefecture', departmentCode: '68', departmentName: 'Haut-Rhin', region: 'Grand Est', latitude: 48.0794, longitude: 7.3582, altitude: 195, geographicZone: 'CONTINENTAL_EAST', microclimaticTrait: 'Zone la plus sèche de France hors littoral méditerranéen (< 550 mm/an) par effet de foehn vosgien', localWind: 'Foehn d\'Ouest asséché', elevationStage: 'Piémont vosgien d\'abri' },
      { id: 'spref-68-mulhouse', name: 'Mulhouse', status: 'sous-prefecture', departmentCode: '68', departmentName: 'Haut-Rhin', region: 'Grand Est', latitude: 47.7508, longitude: 7.3359, altitude: 240, geographicZone: 'CONTINENTAL_EAST', microclimaticTrait: 'Trouée de Belfort entre Vosges et Jura, couloir de bise froide en hiver', localWind: 'Vent de la Trouée de Belfort', elevationStage: 'Plaine' },
      { id: 'pref-57', name: 'Metz', status: 'prefecture', departmentCode: '57', departmentName: 'Moselle', region: 'Grand Est', latitude: 49.1193, longitude: 6.1757, altitude: 175, geographicZone: 'CONTINENTAL_EAST', microclimaticTrait: 'Vallée de la Moselle, brumes automnales et froid continental régulier', localWind: 'Vent de Moselle', elevationStage: 'Vallée fluviale' },
      { id: 'pref-54', name: 'Nancy', status: 'prefecture', departmentCode: '54', departmentName: 'Meurthe-et-Moselle', region: 'Grand Est', latitude: 48.6921, longitude: 6.1844, altitude: 210, geographicZone: 'CONTINENTAL_EAST', microclimaticTrait: 'Bassin lorrain encadré de collines, fortes gelées hivernales sous anticyclone', localWind: 'Vent de Nord-Est frais', elevationStage: 'Bassin de cuvette' },
      { id: 'pref-51', name: 'Reims / Châlons', status: 'prefecture', departmentCode: '51', departmentName: 'Marne', region: 'Grand Est', latitude: 49.2583, longitude: 4.0317, altitude: 85, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Plaine crayeuse champenoise, gelées de printemps redoutées dans le vignoble', localWind: 'Vent d\'Ouest tempéré', elevationStage: 'Plaine champenoise' },
      { id: 'pref-88', name: 'Épinal', status: 'prefecture', departmentCode: '88', departmentName: 'Vosges', region: 'Grand Est', latitude: 48.1744, longitude: 6.4503, altitude: 340, geographicZone: 'MOUNTAIN_JURA_VOSGES', microclimaticTrait: 'Piémont vosgien ouest, précipitations océaniques abondantes, neige régulière', localWind: 'Vent de crête vosgienne', elevationStage: 'Piémont montagnard' },
      { id: 'pref-08', name: 'Charleville-Mézières', status: 'prefecture', departmentCode: '08', departmentName: 'Ardennes', region: 'Grand Est', latitude: 49.7719, longitude: 4.7161, altitude: 150, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Massif des Ardennes proche, hivers humides et froids, gelées tardives', localWind: 'Bise ardennaise', elevationStage: 'Plaine de Meuse' }
    ]
  },

  // 8. Hauts-de-France (5 départements)
  {
    id: 'hauts-de-france',
    name: 'Hauts-de-France',
    chefLieuRegional: 'Lille',
    departmentsCount: 5,
    departmentsCodes: ['02', '59', '60', '62', '80'],
    climateSummary: 'Climat maritime et venté ouvert sur la mer du Nord et la Manche (Côte d\'Opale, Baie de Somme). Pluies fines fréquentes, étés doux et hivers rarement rigoureux sur la côte, mais plus froids dans l\'intérieur picard et flamand.',
    dominantZone: 'COASTAL_ATLANTIC_MANCHE',
    localities: [
      { id: 'pref-59', name: 'Lille', status: 'prefecture', departmentCode: '59', departmentName: 'Nord', region: 'Hauts-de-France', latitude: 50.6292, longitude: 3.0573, altitude: 25, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Plaine flamande intérieure, ciel changeant rapide, douceur hivernale modérée', localWind: 'Vent d\'Ouest-Sud-Ouest maritime', elevationStage: 'Plaine flamande' },
      { id: 'spref-59-dunkerque', name: 'Dunkerque', status: 'sous-prefecture', departmentCode: '59', departmentName: 'Nord', region: 'Hauts-de-France', latitude: 51.0343, longitude: 2.3768, altitude: 5, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Frontière de la mer du Nord, vent quasi-permanent, quasi-absence de gelées sévères', localWind: 'Vent de mer du Nord soutenu', elevationStage: 'Littoral des Flandres' },
      { id: 'pref-62', name: 'Arras', status: 'prefecture', departmentCode: '62', departmentName: 'Pas-de-Calais', region: 'Hauts-de-France', latitude: 50.2910, longitude: 2.7775, altitude: 75, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Collines de l\'Artois, carrefour venteux entre Manche et plaine flamande', localWind: 'Vent d\'Artois', elevationStage: 'Collines de craie' },
      { id: 'spref-62-calais', name: 'Calais', status: 'sous-prefecture', departmentCode: '62', departmentName: 'Pas-de-Calais', region: 'Hauts-de-France', latitude: 50.9513, longitude: 1.8587, altitude: 8, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Détroit du Pas-de-Calais, courants d\'air maritimes puissants, brouillards marins', localWind: 'Vent de détroit puissant', elevationStage: 'Littoral de détroit' },
      { id: 'pref-80', name: 'Amiens', status: 'prefecture', departmentCode: '80', departmentName: 'Somme', region: 'Hauts-de-France', latitude: 49.8941, longitude: 2.2958, altitude: 30, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Vallée de la Somme et hortillonnages, humidité nocturne élevée, brumes', localWind: 'Vent d\'Ouest de Somme', elevationStage: 'Vallée fluviale picarde' },
      { id: 'pref-60', name: 'Beauvais', status: 'prefecture', departmentCode: '60', departmentName: 'Oise', region: 'Hauts-de-France', latitude: 49.4316, longitude: 2.0833, altitude: 75, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Plaine picarde aux portes de l\'Île-de-France, réactivité aux flux océaniques froids', localWind: 'Vent d\'Ouest-Nord-Ouest', elevationStage: 'Plaine picarde' }
    ]
  },

  // 9. Normandie (5 départements)
  {
    id: 'normandie',
    name: 'Normandie',
    chefLieuRegional: 'Rouen',
    departmentsCount: 5,
    departmentsCodes: ['14', '27', '50', '61', '76'],
    climateSummary: 'Quintessence du climat océanique tempéré : verdure abondante, hivers très doux sur la presqu\'île du Cotentin (palmiers de Cherbourg), passages pluvieux atlantiques réguliers et falaises de craie venteuses du pays de Caux.',
    dominantZone: 'COASTAL_ATLANTIC_MANCHE',
    localities: [
      { id: 'pref-76', name: 'Rouen', status: 'prefecture', departmentCode: '76', departmentName: 'Seine-Maritime', region: 'Normandie', latitude: 49.4432, longitude: 1.0999, altitude: 20, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Boucle encaissée de la Seine, microclimat de vallée fluviale à brouillards fréquents', localWind: 'Vent d\'Ouest de Seine', elevationStage: 'Vallée de Seine' },
      { id: 'spref-76-lehavre', name: 'Le Havre', status: 'sous-prefecture', departmentCode: '76', departmentName: 'Seine-Maritime', region: 'Normandie', latitude: 49.4944, longitude: 0.1079, altitude: 10, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Estuaire de la Seine face à la Manche, vents soutenus et embruns', localWind: 'Vent marin d\'Ouest à Nord-Ouest', elevationStage: 'Estuaire maritime' },
      { id: 'pref-14', name: 'Caen', status: 'prefecture', departmentCode: '14', departmentName: 'Calvados', region: 'Normandie', latitude: 49.1829, longitude: -0.3707, altitude: 25, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Plaine de Caen ouverte sur la baie de Seine, climat très tempéré et modéré', localWind: 'Brise de baie de Seine', elevationStage: 'Plaine côtière' },
      { id: 'pref-50', name: 'Saint-Lô', status: 'prefecture', departmentCode: '50', departmentName: 'Manche', region: 'Normandie', latitude: 49.1158, longitude: -1.0911, altitude: 35, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Bocage normand central dans la vallée de la Vire, précipitations fréquentes', localWind: 'Vent océanique de bocage', elevationStage: 'Bocage collinéen' },
      { id: 'spref-50-cherbourg', name: 'Cherbourg-en-Cotentin', status: 'sous-prefecture', departmentCode: '50', departmentName: 'Manche', region: 'Normandie', latitude: 49.6337, longitude: -1.6221, altitude: 15, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Pointe septentrionale du Cotentin entourée par la mer : gelées rarissimes, hivers ultra-doux', localWind: 'Vent de grand large permanent', elevationStage: 'Pointe maritime avancée' },
      { id: 'pref-27', name: 'Évreux', status: 'prefecture', departmentCode: '27', departmentName: 'Eure', region: 'Normandie', latitude: 49.0270, longitude: 1.1508, altitude: 70, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Plateau de Saint-André, transition entre Normandie maritime et Île-de-France', localWind: 'Vent d\'Ouest franc', elevationStage: 'Plateau normand' }
    ]
  },

  // 10. Pays de la Loire (5 départements)
  {
    id: 'pays-de-la-loire',
    name: 'Pays de la Loire',
    chefLieuRegional: 'Nantes',
    departmentsCount: 5,
    departmentsCodes: ['44', '49', '53', '72', '85'],
    climateSummary: 'Douceur ligérienne célèbre (« douceur angevine »), côte vendéenne très lumineuse (la Côte de Lumière égale la Côte d\'Azur en ensoleillement estival), estuaire de la Loire ouvert aux brises atlantiques bienfaisantes.',
    dominantZone: 'COASTAL_ATLANTIC_MANCHE',
    localities: [
      { id: 'pref-44', name: 'Nantes', status: 'prefecture', departmentCode: '44', departmentName: 'Loire-Atlantique', region: 'Pays de la Loire', latitude: 47.2184, longitude: -1.5536, altitude: 25, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Estuaire de la Loire, influence océanique prédominante, douceur et humidité équilibrée', localWind: 'Vent d\'Ouest de Loire', elevationStage: 'Estuaire alluvionnaire' },
      { id: 'spref-44-stnazaire', name: 'Saint-Nazaire', status: 'sous-prefecture', departmentCode: '44', departmentName: 'Loire-Atlantique', region: 'Pays de la Loire', latitude: 47.2735, longitude: -2.2137, altitude: 12, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Embouchure de la Loire face à l\'océan, surventes d\'estuaire, brise marine nette', localWind: 'Vent marin d\'Ouest', elevationStage: 'Embouchure littorale' },
      { id: 'pref-49', name: 'Angers', status: 'prefecture', departmentCode: '49', departmentName: 'Maine-et-Loire', region: 'Pays de la Loire', latitude: 47.4784, longitude: -0.5632, altitude: 35, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Cœur de la « douceur angevine », confluence Maine-Loire, microclimat d\'une grande tempérance', localWind: 'Vent doux de Sud-Ouest', elevationStage: 'Bassin ligérien' },
      { id: 'pref-72', name: 'Le Mans', status: 'prefecture', departmentCode: '72', departmentName: 'Sarthe', region: 'Pays de la Loire', latitude: 48.0061, longitude: 0.1996, altitude: 55, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Bassin manceau abrité des collines du Perche, ensoleillement généreux', localWind: 'Vent d\'Ouest modéré', elevationStage: 'Plaine sarthoise' },
      { id: 'pref-85', name: 'La Roche-sur-Yon', status: 'prefecture', departmentCode: '85', departmentName: 'Vendée', region: 'Pays de la Loire', latitude: 46.6705, longitude: -1.4268, altitude: 75, geographicZone: 'COASTAL_ATLANTIC_MANCHE', microclimaticTrait: 'Bocage vendéen à 30 km des plages ensoleillées de la Côte de Lumière', localWind: 'Vent atlantique franc', elevationStage: 'Bocage vendéen' }
    ]
  },

  // 11. Bourgogne-Franche-Comté (8 départements)
  {
    id: 'bourgogne-franche-comte',
    name: 'Bourgogne-Franche-Comté',
    chefLieuRegional: 'Dijon',
    departmentsCount: 8,
    departmentsCodes: ['21', '25', '39', '58', '70', '71', '89', '90'],
    climateSummary: 'Région charnière semi-continentale : vignobles réputés de la Côte-d\'Or abrités des vents d\'ouest, couloir de la Saône propice aux brouillards denses et stratus d\'inversion, et haut relief jurassien aux hivers les plus froids de plaine/montagne en France (Mouthe, Chapelle-des-Bois).',
    dominantZone: 'MOUNTAIN_JURA_VOSGES',
    localities: [
      { id: 'pref-21', name: 'Dijon', status: 'prefecture', departmentCode: '21', departmentName: 'Côte-d\'Or', region: 'Bourgogne-Franche-Comté', latitude: 47.3220, longitude: 5.0415, altitude: 245, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Pied de la Côte de Nuits et val de Saône, stratus d\'inversion fréquents en automne/hiver', localWind: 'Bise de Saône', elevationStage: 'Plaine de piémont' },
      { id: 'pref-25', name: 'Besançon', status: 'prefecture', departmentCode: '25', departmentName: 'Doubs', region: 'Bourgogne-Franche-Comté', latitude: 47.2378, longitude: 6.0241, altitude: 260, geographicZone: 'MOUNTAIN_JURA_VOSGES', microclimaticTrait: 'Boucle du Doubs au pied du Jura, pluviométrie soutenue, hivers frais', localWind: 'Bise du Doubs', elevationStage: 'Piémont jurassien' },
      { id: 'pref-39', name: 'Lons-le-Saunier', status: 'prefecture', departmentCode: '39', departmentName: 'Jura', region: 'Bourgogne-Franche-Comté', latitude: 46.6753, longitude: 5.5562, altitude: 300, geographicZone: 'MOUNTAIN_JURA_VOSGES', microclimaticTrait: 'Revermont jurassien, vignoble du Jura, transition entre plaine bressane et hauts plateaux', localWind: 'Vent de combe jurassienne', elevationStage: 'Revermont' },
      { id: 'pref-71', name: 'Mâcon', status: 'prefecture', departmentCode: '71', departmentName: 'Saône-et-Loire', region: 'Bourgogne-Franche-Comté', latitude: 46.3069, longitude: 4.8316, altitude: 190, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Val de Saône à la limite d\'Auvergne-Rhône-Alpes, étés chauds à orages, brumes hivernales', localWind: 'Vent du Sud / Bise', elevationStage: 'Val de Saône' },
      { id: 'pref-90', name: 'Belfort', status: 'prefecture', departmentCode: '90', departmentName: 'Territoire de Belfort', region: 'Bourgogne-Franche-Comté', latitude: 47.6397, longitude: 6.8638, altitude: 360, geographicZone: 'CONTINENTAL_EAST', microclimaticTrait: 'Trouée de Belfort entre Vosges et Jura, accélérateur éolien pour les masses d\'air', localWind: 'Vent de couloir de la Trouée', elevationStage: 'Seuil géographique' }
    ]
  },

  // 12. Centre-Val de Loire (6 départements)
  {
    id: 'centre-val-de-loire',
    name: 'Centre-Val de Loire',
    chefLieuRegional: 'Orléans',
    departmentsCount: 6,
    departmentsCodes: ['18', '28', '36', '37', '41', '45'],
    climateSummary: 'Cœur historique tempéré du Val de Loire, plateau céréalier de la Beauce balayé par les vents d\'ouest, Sologne forestière et étangs aux fortes gelées radiatives nocturnes, et vignobles tourangeaux abrités.',
    dominantZone: 'PARIS_NORTH_PLAINS',
    localities: [
      { id: 'pref-45', name: 'Orléans', status: 'prefecture', departmentCode: '45', departmentName: 'Loiret', region: 'Centre-Val de Loire', latitude: 47.9029, longitude: 1.9039, altitude: 110, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Bordure de la Loire et de la forêt d\'Orléans, climat très tempéré, brouillards matinaux', localWind: 'Vent d\'Ouest ligérien', elevationStage: 'Plaine ligérienne' },
      { id: 'pref-37', name: 'Tours', status: 'prefecture', departmentCode: '37', departmentName: 'Indre-et-Loire', region: 'Centre-Val de Loire', latitude: 47.3941, longitude: 0.6848, altitude: 55, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Jardin de la France entre Loire et Cher, régulation thermique très douce', localWind: 'Brise de Loire', elevationStage: 'Vallée de Loire' },
      { id: 'pref-18', name: 'Bourges', status: 'prefecture', departmentCode: '18', departmentName: 'Cher', region: 'Centre-Val de Loire', latitude: 47.0810, longitude: 2.3988, altitude: 135, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Plateau du Berry, centre géographique de la France, étés secs et chauds', localWind: 'Vent d\'Ouest-Sud-Ouest', elevationStage: 'Plateau berrichon' },
      { id: 'pref-28', name: 'Chartres', status: 'prefecture', departmentCode: '28', departmentName: 'Eure-et-Loir', region: 'Centre-Val de Loire', latitude: 48.4439, longitude: 1.4890, altitude: 145, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Plaine de Beauce (« grenier à blé »), relief plat très ouvert au vent, ensoleillement franc', localWind: 'Vent de Beauce régulier', elevationStage: 'Plateau beauceron' },
      { id: 'pref-41', name: 'Blois', status: 'prefecture', departmentCode: '41', departmentName: 'Loir-et-Cher', region: 'Centre-Val de Loire', latitude: 47.5861, longitude: 1.3359, altitude: 80, geographicZone: 'PARIS_NORTH_PLAINS', microclimaticTrait: 'Val de Loire aux portes de la Sologne, forte amplitude thermique dans les clairières de Sologne', localWind: 'Vent d\'Ouest', elevationStage: 'Vallée ligérienne' }
    ]
  },

  // 13. Corse (2 départements)
  {
    id: 'corse',
    name: 'Corse',
    chefLieuRegional: 'Ajaccio',
    departmentsCount: 2,
    departmentsCodes: ['2A', '2B'],
    climateSummary: 'Une « montagne dans la mer » : climat méditerranéen maritime d\'une grande douceur sur les côtes, contrastant immédiatement avec le relief alpin du Monte Cinto (2706 m) où la neige persiste jusqu\'en été, battu par le Libeccio violent.',
    dominantZone: 'MEDITERRANEAN_SE',
    localities: [
      { id: 'pref-2a', name: 'Ajaccio', status: 'prefecture', departmentCode: '2A', departmentName: 'Corse-du-Sud', region: 'Corse', latitude: 41.9192, longitude: 8.7386, altitude: 15, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Golfe d\'Ajaccio abrité des vents de Nord-Est, hivers d\'une douceur subtropicale exceptionnelle', localWind: 'Libeccio (Sud-Ouest) / Brise de mer', elevationStage: 'Golfe maritime' },
      { id: 'pref-2b', name: 'Bastia', status: 'prefecture', departmentCode: '2B', departmentName: 'Haute-Corse', region: 'Corse', latitude: 42.6973, longitude: 9.4509, altitude: 25, geographicZone: 'MEDITERRANEAN_SE', microclimaticTrait: 'Façade tyrrhénienne au pied du Cap Corse, effet de foehn spectaculaire par Libeccio (chaleur soudaine)', localWind: 'Libeccio asséché / Gregale d\'Est', elevationStage: 'Littoral tyrrhénien' },
      { id: 'spref-2b-corte', name: 'Corte', status: 'sous-prefecture', departmentCode: '2B', departmentName: 'Haute-Corse', region: 'Corse', latitude: 42.3060, longitude: 9.1500, altitude: 450, geographicZone: 'MOUNTAIN_ALPS', microclimaticTrait: 'Cœur de la montagne corse au pied du Monte Rotondo, fortes gelées hivernales et étés très chauds', localWind: 'Brise de montagne corse', elevationStage: 'Cuvette montagnarde insulaire' }
    ]
  }
];

export function getAllPrefecturesAndSousPrefectures(): PrefectureOrSousPrefecture[] {
  return FRENCH_REGIONS_CATALOG.flatMap(r => r.localities);
}
