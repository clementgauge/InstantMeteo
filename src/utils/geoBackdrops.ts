/**
 * Résolveur d'arrière-plans géographiquement cohérents pour la météo
 * Adapte immédiatement le fond d'écran selon la région (Île-de-France, Littoraux, Montagnes, etc.)
 */

export const GEOGRAPHIC_DEFAULT_BACKDROPS = {
  paris_ile_de_france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=85', // Paris / Seine panorama
  versailles: 'https://images.unsplash.com/photo-1599818816853-a55a73e659b8?auto=format&fit=crop&w=1920&q=85', // Versailles château & parcs
  mediterranean_coast: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=85', // Côte d'Azur / Nice / Baie des Anges
  marseille: 'https://images.unsplash.com/photo-1589705916946-b51c1106e987?auto=format&fit=crop&w=1920&q=85', // Marseille Vieux-Port / Calanques
  atlantic_coast: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85', // Océan Atlantique / Biarritz / Bretagne
  alps_mountains: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85', // Montagnes / Alpes / Chamonix
  pyrenees_mountains: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=85', // Pyrénées / Sommets
  lyon_urban: 'https://images.unsplash.com/photo-1524397030793-162828b49e1e?auto=format&fit=crop&w=1920&q=85', // Lyon Fourvière / Saône
  bordeaux_urban: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1920&q=85', // Bordeaux Garonne
  strasbourg_alsace: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1920&q=85', // Strasbourg / Alsace
  toulouse_occitanie: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=85', // Toulouse / Garonne
  lille_north: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1920&q=85', // Nord / Flandres
  countryside_fields: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=85' // Campagne / Bocage / Terroirs
};

export function getClientGeographicBackdrop(
  cityName: string,
  regionName: string = '',
  department: string = '',
  altitude: number = 0
): string {
  const c = (cityName || '').toLowerCase();
  const r = (regionName || '').toLowerCase();
  const d = (department || '').toLowerCase();

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

  // 3. Méditerranée & Corse
  if (
    c.includes('nice') ||
    c.includes('cannes') ||
    c.includes('antibes') ||
    c.includes('menton') ||
    c.includes('monaco') ||
    c.includes('hyères') ||
    c.includes('toulon') ||
    d.includes('06') ||
    d.includes('83')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.mediterranean_coast;
  }

  if (c.includes('marseille') || c.includes('cassis') || c.includes('la ciotat') || d.includes('13')) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.marseille;
  }

  if (c.includes('ajaccio') || c.includes('bastia') || r.includes('corse') || d.includes('2a') || d.includes('2b')) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.mediterranean_coast;
  }

  // 4. Littoral Atlantique & Manche
  if (
    c.includes('biarritz') ||
    c.includes('arcachon') ||
    c.includes('rochelle') ||
    c.includes('brest') ||
    c.includes('saint-malo') ||
    c.includes('quimper') ||
    c.includes('vannes') ||
    c.includes('cherbourg') ||
    c.includes('havre') ||
    r.includes('bretagne') ||
    d.includes('29') ||
    d.includes('35') ||
    d.includes('56') ||
    d.includes('22') ||
    d.includes('17') ||
    d.includes('64') ||
    d.includes('40')
  ) {
    return GEOGRAPHIC_DEFAULT_BACKDROPS.atlantic_coast;
  }

  // 5. Grandes Métropoles
  if (c.includes('lyon') || d.includes('69')) return GEOGRAPHIC_DEFAULT_BACKDROPS.lyon_urban;
  if (c.includes('bordeaux') || d.includes('33')) return GEOGRAPHIC_DEFAULT_BACKDROPS.bordeaux_urban;
  if (c.includes('strasbourg') || r.includes('alsace') || d.includes('67') || d.includes('68')) return GEOGRAPHIC_DEFAULT_BACKDROPS.strasbourg_alsace;
  if (c.includes('toulouse')) return GEOGRAPHIC_DEFAULT_BACKDROPS.toulouse_occitanie;
  if (c.includes('lille') || d.includes('59')) return GEOGRAPHIC_DEFAULT_BACKDROPS.lille_north;

  // 6. Campagne & Terroirs
  return GEOGRAPHIC_DEFAULT_BACKDROPS.countryside_fields;
}
