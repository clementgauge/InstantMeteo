/**
 * Résolveur d'arrière-plans géographiques réels et cohérents pour la météo
 * 1. Recherche en direct la véritable photo de la commune / ville via Wikipedia & Wikimedia REST API
 * 2. Si non trouvée, applique un arrière-plan haute résolution ultra-fidèle au département / terroir / région
 */

export const GEOGRAPHIC_DEFAULT_BACKDROPS: Record<string, string> = {
  paris_ile_de_france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=85',
  versailles: 'https://images.unsplash.com/photo-1599818816853-a55a73e659b8?auto=format&fit=crop&w=1920&q=85',
  mediterranean_coast: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=85',
  marseille: 'https://images.unsplash.com/photo-1589705916946-b51c1106e987?auto=format&fit=crop&w=1920&q=85',
  atlantic_coast: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85',
  bretagne_cliffs: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=1920&q=85',
  normandie_bocage: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1920&q=85',
  alps_mountains: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85',
  pyrenees_mountains: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=85',
  massif_central: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85',
  lyon_urban: 'https://images.unsplash.com/photo-1524397030793-162828b49e1e?auto=format&fit=crop&w=1920&q=85',
  bordeaux_urban: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1920&q=85',
  strasbourg_alsace: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1920&q=85',
  toulouse_occitanie: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=85',
  lille_north: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1920&q=85',
  loire_valley: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1920&q=85',
  bourgogne_vines: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1920&q=85',
  provence_lavender: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1920&q=85',
  corse_island: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=85',
  outre_mer_tropics: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=85',
  countryside_fields: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=85'
};

// Cache mémoire client pour éviter les requêtes répétitives
const clientPhotoCache = new Map<string, string>();

/**
 * Résolution synchrone immédiate selon géographie / département
 */
export function getClientGeographicBackdrop(
  cityName: string,
  regionName: string = '',
  department: string = '',
  altitude: number = 0
): string {
  const c = (cityName || '').toLowerCase();
  const r = (regionName || '').toLowerCase();
  const d = (department || '').toLowerCase();

  // Outre-mer (Guadeloupe, Martinique, Réunion, Mayotte, Guyane)
  if (
    c.includes('pointe-à-pitre') || c.includes('fort-de-france') || c.includes('saint-denis') ||
    c.includes('cayenne') || c.includes('mamoudzou') || r.includes('guadeloupe') ||
    r.includes('martinique') || r.includes('réunion') || r.includes('reunion') ||
    r.includes('guyane') || r.includes('mayotte') || d.includes('971') ||
    d.includes('972') || d.includes('973') || d.includes('974') || d.includes('976')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.outre_mer_tropics;
  }

  // 1. Île-de-France & Versailles
  if (c.includes('versailles') || c.includes('saint-germain') || c.includes('rambouillet')) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.versailles;
  }
  if (
    c.includes('paris') ||
    r.includes('île-de-france') ||
    r.includes('ile-de-france') ||
    d.includes('75') ||
    d.includes('92') ||
    d.includes('93') ||
    d.includes('94') ||
    d.includes('77') ||
    d.includes('78') ||
    d.includes('91') ||
    d.includes('95')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.paris_ile_de_france;
  }

  // 2. Montagne (Alpes / Pyrénées / Massif Central)
  if (
    altitude > 700 ||
    c.includes('chamonix') ||
    c.includes('grenoble') ||
    c.includes('albertville') ||
    c.includes('annecy') ||
    c.includes('briançon') ||
    c.includes('chambéry') ||
    c.includes('gap') ||
    c.includes('avoriaz') ||
    c.includes('tignes') ||
    d.includes('73') ||
    d.includes('74') ||
    d.includes('38') ||
    d.includes('05')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.alps_mountains;
  }

  if (
    c.includes('tarbes') ||
    c.includes('pau') ||
    c.includes('lourdes') ||
    c.includes('font-romeu') ||
    d.includes('65') ||
    d.includes('66') ||
    d.includes('09')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.pyrenees_mountains;
  }

  if (
    c.includes('clermont') ||
    c.includes('aurillac') ||
    c.includes('saint-flour') ||
    c.includes('mende') ||
    r.includes('auvergne') ||
    d.includes('63') ||
    d.includes('15') ||
    d.includes('43') ||
    d.includes('48')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.massif_central;
  }

  // 3. Méditerranée, Côte d'Azur & Corse
  if (
    c.includes('ajaccio') ||
    c.includes('bastia') ||
    c.includes('calvi') ||
    c.includes('porto-vecchio') ||
    r.includes('corse') ||
    d.includes('2a') ||
    d.includes('2b')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.corse_island;
  }

  if (c.includes('marseille') || c.includes('cassis') || c.includes('la ciotat') || d.includes('13')) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.marseille;
  }

  if (
    c.includes('nice') ||
    c.includes('cannes') ||
    c.includes('antibes') ||
    c.includes('menton') ||
    c.includes('monaco') ||
    c.includes('hyères') ||
    c.includes('toulon') ||
    c.includes('saint-tropez') ||
    d.includes('06') ||
    d.includes('83')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.mediterranean_coast;
  }

  if (
    c.includes('avignon') ||
    c.includes('aix-en-provence') ||
    c.includes('arles') ||
    d.includes('84') ||
    d.includes('04')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.provence_lavender;
  }

  // 4. Bretagne & Littoral Atlantique
  if (
    c.includes('brest') ||
    c.includes('saint-malo') ||
    c.includes('quimper') ||
    c.includes('vannes') ||
    c.includes('lorient') ||
    r.includes('bretagne') ||
    d.includes('29') ||
    d.includes('35') ||
    d.includes('56') ||
    d.includes('22')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.bretagne_cliffs;
  }

  if (
    c.includes('biarritz') ||
    c.includes('arcachon') ||
    c.includes('rochelle') ||
    c.includes('royan') ||
    c.includes('sables-d\'olonne') ||
    c.includes('bayonne') ||
    d.includes('17') ||
    d.includes('64') ||
    d.includes('40') ||
    d.includes('85')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.atlantic_coast;
  }

  // 5. Normandie & Manche
  if (
    c.includes('cherbourg') ||
    c.includes('havre') ||
    c.includes('rouen') ||
    c.includes('caen') ||
    c.includes('deauville') ||
    r.includes('normandie') ||
    d.includes('14') ||
    d.includes('50') ||
    d.includes('76') ||
    d.includes('27') ||
    d.includes('61')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.normandie_bocage;
  }

  // 6. Val de Loire & Châteaux
  if (
    c.includes('tours') ||
    c.includes('orléans') ||
    c.includes('orleans') ||
    c.includes('blois') ||
    c.includes('angers') ||
    c.includes('nantes') ||
    r.includes('centre-val') ||
    r.includes('pays de la loire') ||
    d.includes('37') ||
    d.includes('45') ||
    d.includes('41') ||
    d.includes('49') ||
    d.includes('44')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.loire_valley;
  }

  // 7. Bourgogne & Vignobles
  if (
    c.includes('dijon') ||
    c.includes('beaune') ||
    c.includes('besançon') ||
    c.includes('mâcon') ||
    r.includes('bourgogne') ||
    d.includes('21') ||
    d.includes('71') ||
    d.includes('89') ||
    d.includes('58') ||
    d.includes('25')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.bourgogne_vines;
  }

  // 8. Grandes Métropoles Urbaines
  if (c.includes('lyon') || c.includes('villeurbanne') || d.includes('69')) return GEOGRAPHIC_DEFAULT_BACKDROPS.lyon_urban;
  if (c.includes('bordeaux') || c.includes('mérignac') || d.includes('33')) return GEOGRAPHIC_DEFAULT_BACKDROPS.bordeaux_urban;
  if (c.includes('strasbourg') || c.includes('colmar') || c.includes('mulhouse') || r.includes('alsace') || d.includes('67') || d.includes('68')) return GEOGRAPHIC_DEFAULT_BACKDROPS.strasbourg_alsace;
  if (c.includes('toulouse') || c.includes('montauban') || d.includes('31')) return GEOGRAPHIC_DEFAULT_BACKDROPS.toulouse_occitanie;
  if (c.includes('lille') || c.includes('roubaix') || c.includes('tourcoing') || d.includes('59') || d.includes('62')) return GEOGRAPHIC_DEFAULT_BACKDROPS.lille_north;

  // 9. Campagne, Terroirs & Bocages
  return GEOGRAPHIC_DEFAULT_BACKDROPS.countryside_fields;
}

/**
 * Recherche dynamique de la vraie photo de n'importe quelle commune de France
 * via Wikipedia REST API avec fallback automatique
 */
export async function fetchCityRealPhoto(
  cityName: string,
  regionName: string = '',
  department: string = '',
  altitude: number = 0
): Promise<string> {
  const cleanCity = (cityName || '').trim();
  if (!cleanCity) {
    return getClientGeographicBackdrop(cleanCity, regionName, department, altitude);
  }

  const cacheKey = cleanCity.toLowerCase();
  if (clientPhotoCache.has(cacheKey)) {
    return clientPhotoCache.get(cacheKey)!;
  }

  // Check sessionStorage
  try {
    const saved = sessionStorage.getItem(`city_photo_${cacheKey}`);
    if (saved) {
      clientPhotoCache.set(cacheKey, saved);
      return saved;
    }
  } catch {}

  const defaultPhoto = getClientGeographicBackdrop(cleanCity, regionName, department, altitude);

  // 1. Tenter l'API Wikipedia REST directe (Open Data sans clé)
  const candidateTitles = [
    cleanCity,
    `${cleanCity}_(commune)`,
    `${cleanCity},_France`,
    `${cleanCity}_(${department})`,
  ];

  for (const title of candidateTitles) {
    try {
      const wikiUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;
      const res = await fetch(wikiUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const json = await res.json();
        const src = json?.originalimage?.source || json?.thumbnail?.source;
        if (src && typeof src === 'string' && src.startsWith('http')) {
          clientPhotoCache.set(cacheKey, src);
          try { sessionStorage.setItem(`city_photo_${cacheKey}`, src); } catch {}
          return src;
        }
      }
    } catch {}
  }

  // 2. Tenter le serveur backend /api/city-photo
  try {
    const serverUrl = `/api/city-photo?city=${encodeURIComponent(cleanCity)}&region=${encodeURIComponent(regionName)}&department=${encodeURIComponent(department)}&altitude=${altitude}`;
    const serverRes = await fetch(serverUrl, { signal: AbortSignal.timeout(3000) });
    if (serverRes.ok) {
      const serverData = await serverRes.json();
      const photo = serverData.photoUrl || serverData.url;
      if (photo && photo !== defaultPhoto) {
        clientPhotoCache.set(cacheKey, photo);
        try { sessionStorage.setItem(`city_photo_${cacheKey}`, photo); } catch {}
        return photo;
      }
    }
  } catch {}

  // 3. Fallback géographiquement pertinent
  clientPhotoCache.set(cacheKey, defaultPhoto);
  return defaultPhoto;
}

