import type { PageSeoMetadata } from '../seo/pagesSeoData';

const BASE_SITE_URL = 'https://instantmeteo.instantmeteofr.workers.dev';

export type NativeSiteLang = 'fr' | 'en';

export const SEO_PAGES_MAP_EN: Record<string, PageSeoMetadata> = {
  '/': {
    slug: 'home',
    path: '/',
    canonicalUrl: `${BASE_SITE_URL}/`,
    title: 'Instant Météo France — Live Weather Forecasts & Real-Time Radar',
    description:
      'Check live weather across all 34,965 municipalities in France: current observations, hourly forecasts, Doppler rain radar and departmental warnings.',
    h1: 'Live Weather Forecasts and Real-Time Tracking in France',
    sectionTitle: 'Meteorological Data Sources and Portal Architecture',
    breadcrumbName: 'France Weather Home',
    tabId: 'realtime',
    changefreq: 'always',
    priority: '1.0',
    introParagraph:
      'Instant Météo France brings together live surface observations and high-resolution local forecasts for all 34,965 municipalities across metropolitan France and overseas territories. Search for your town or use GPS geolocation to immediately view temperature, wind chill, hourly evolution and multi-day trends.',
    sections: [
      {
        heading: 'Where does the meteorological data displayed on the site come from?',
        body: 'This central observatory combines leading public datasets: Météo-France AROME (1.3 km high-resolution mesh) and ARPEGE numerical models, the European ECMWF (IFS 9 km) model, RainViewer radar imagery, Vigicrues (SCHAPI) hydrological readings, SHOM tide predictions, BRGM groundwater tracking, NASA FIRMS / GIBS satellite data and Copernicus ERA5 climate reanalyses.',
      },
      {
        heading: 'Automatic relief and altitude calibration for every municipality',
        body: 'Unlike generic regional forecasts, each municipal sheet accounts for the true elevation of the selected town hall or mountain summit. Vertical thermal lapse rates and exposure to prevailing winds are integrated to deliver accurate ground-level conditions.',
      },
      {
        heading: 'Direct navigation across specialized weather observatories',
        body: 'From the home screen, switch seamlessly to the interactive precipitation radar, departmental severe weather warnings, vertical cloud nephology observatory, or specialized bulletins for mountains, beaches and rivers.',
      },
    ],
    faq: [
      {
        question: 'How often are the weather observations updated?',
        answer:
          'Surface observations and radar imagery are refreshed every 5 to 15 minutes, while high-resolution numerical forecast models are updated multiple times per day.',
      },
      {
        question: 'Can I look up a small rural village or mountain peak in France?',
        answer:
          'Yes, our search engine covers all 34,965 French municipalities as well as major mountain peaks, passes, ski resorts and coastal beaches.',
      },
      {
        question: 'How does the altitude adjustment work?',
        answer:
          'Temperature, snow line and wind exposure are automatically calibrated to the exact elevation in meters of your chosen locality.',
      },
    ],
  },

  '/direct': {
    slug: 'direct',
    path: '/direct',
    canonicalUrl: `${BASE_SITE_URL}/direct`,
    title: 'Live Weather Observations in France — Temperature, Wind & Pressure | Instant Météo',
    description:
      'Real-time weather conditions in your municipality: current temperature, feels-like index, wind gusts, atmospheric pressure, humidity and UV index.',
    h1: 'Real-Time Weather Observations & Hourly Evolution',
    sectionTitle: 'Understanding Live Surface Parameters and Hourly Trends',
    breadcrumbName: 'Live Weather',
    tabId: 'realtime',
    changefreq: 'always',
    priority: '0.95',
    introParagraph:
      'The Live Weather page displays current atmospheric parameters measured and modeled above your municipality: air temperature at 2 meters, wind chill and humidex, wind speed and gusts, barometric pressure, relative humidity, dew point and hourly forecasts.',
    sections: [
      {
        heading: 'Difference between air temperature and feels-like temperature',
        body: 'Air temperature is measured under a ventilated shelter at 2 meters above ground. Feels-like temperature incorporates wind cooling in winter (Wind Chill) and moisture heat stress in summer (Humidex).',
      },
      {
        heading: 'Barometric pressure reduced to sea level (hPa)',
        body: 'Tracking atmospheric pressure helps anticipate weather changes: a pressure above 1020 hPa usually indicates stable anticyclonic conditions, whereas a rapid drop below 1005 hPa signals an approaching Atlantic low-pressure system.',
      },
      {
        heading: 'Dew point, relative humidity and fog formation',
        body: 'When air temperature cools down to the dew point temperature during the night, water vapor condenses into droplets, forming dew, frost or radiation fog at dawn.',
      },
    ],
    faq: [
      {
        question: 'At what height are official wind gusts measured?',
        answer:
          'Standard anemometers measure wind speed and peak gusts at 10 meters above unobstructed ground.',
      },
      {
        question: 'What is Considered normal atmospheric pressure?',
        answer:
          'Standard atmospheric pressure at sea level is 1013.25 hectopascals (hPa).',
      },
      {
        question: 'Why does temperature differ between city centers and rural valleys?',
        answer:
          'The urban heat island effect traps heat in densely built areas overnight, while rural valleys and forests cool much faster through radiative heat loss.',
      },
    ],
  },

  '/radar': {
    slug: 'radar',
    path: '/radar',
    canonicalUrl: `${BASE_SITE_URL}/radar`,
    title: 'Live Rain & Storm Radar in France | Instant Météo',
    description:
      'Interactive full-screen precipitation radar: track rain, snow, thunderstorms, cloud cover and wind streamlines in real time across France.',
    h1: 'Live Precipitation & Doppler Weather Radar',
    sectionTitle: 'How the Weather Radar Works and Reading Reflectivity Echoes',
    breadcrumbName: 'Live Rain Radar',
    tabId: 'radar',
    changefreq: 'always',
    priority: '0.95',
    introParagraph:
      'The interactive radar visualizes the exact position of rain showers, frontal bands, snowfall and thunderstorm cells on a full-screen map. Use the timeline slider to inspect past trajectories and short-term movement.',
    sections: [
      {
        heading: 'Reflectivity color scale and precipitation intensity (dBZ)',
        body: 'The color scale reflects droplet or ice crystal density in the atmosphere (in dBZ). Blue and green tones indicate drizzle or light rain (1–3 mm/h), yellow and orange show moderate to heavy rain (5–20 mm/h), and red to purple mark intense convective storms and hail.',
      },
      {
        heading: 'Layer switcher: Rain, Clouds, Temperatures and Lightning',
        body: 'The top radar bar lets you switch seamlessly between precipitation echoes, continuous cloud cover, station temperatures, wind streamlines and thunderstorm electrical activity.',
      },
      {
        heading: 'Locked full-screen mode for continuous storm tracking',
        body: 'Full-screen mode locks the viewport onto the interactive map for smooth touch or mouse navigation from the European scale down to your neighborhood.',
      },
    ],
    faq: [
      {
        question: 'How do I animate the radar to anticipate a rain shower?',
        answer:
          'Press the Play button at the bottom of the map: the timeline advances in 5-to-10-minute steps to reveal the speed and direction of approaching rain bands.',
      },
      {
        question: 'What is the difference between the Rain layer and the Clouds layer?',
        answer:
          'The Rain layer shows only clouds actively producing precipitation detected by radar echoes, whereas the Clouds layer displays the entire cloud deck even when no rain reaches the ground.',
      },
      {
        question: 'How do I exit full-screen radar mode?',
        answer:
          'Click the Minimize button in the top-right corner of the map or press the Escape key on your keyboard.',
      },
    ],
  },

  '/vigilances': {
    slug: 'vigilances',
    path: '/vigilances',
    canonicalUrl: `${BASE_SITE_URL}/vigilances`,
    title: 'Departmental Weather Warnings in France | Instant Météo',
    description:
      'Official weather alert map by department in France: green, yellow, orange and red warning levels for wind, storms, rain-flooding, snow and heatwaves.',
    h1: 'Departmental Weather Warning Map in France',
    sectionTitle: 'Understanding the Four Warning Levels and Safety Guidelines',
    breadcrumbName: 'Weather Warnings',
    tabId: 'vigilance',
    changefreq: 'always',
    priority: '0.95',
    introParagraph:
      'The Weather Warnings page provides a complete overview of meteorological hazards across all French departments, highlighting areas under special watch today and over the coming days.',
    sections: [
      {
        heading: 'Meaning of Green, Yellow, Orange and Red warning levels',
        body: 'Green indicates no particular hazard. Yellow calls for attentiveness during outdoor activities. Orange signals dangerous phenomena requiring heightened caution and limiting non-essential travel. Red denotes an event of exceptional intensity requiring strict adherence to civil safety instructions.',
      },
      {
        heading: 'Nine monitored meteorological hazards',
        body: 'Each departmental sheet details risks for violent winds, thunderstorms, heavy rain and flooding, river floods, snow-ice, coastal waves-submersion, mountain avalanches, heatwaves and extreme cold.',
      },
      {
        heading: 'Multi-day hazard forecast matrix',
        body: 'Alongside today’s map, a chronological matrix helps identify upcoming weather deteriorations across your department several days in advance.',
      },
    ],
    faq: [
      {
        question: 'What should I do when my department is placed on Orange warning?',
        answer:
          'Secure outdoor objects sensitive to wind, avoid forests and riverbanks, unplug sensitive electrical appliances during severe thunderstorms and postpone non-essential road travel.',
      },
      {
        question: 'Why is a neighboring department under warning while mine is not?',
        answer:
          'Warning thresholds account for local topography, prior soil saturation and exposure to prevailing winds specific to each department.',
      },
      {
        question: 'How often is the warning map updated?',
        answer:
          'The map is updated at least twice daily (at 6:00 AM and 4:00 PM) and at any time whenever a severe weather event evolves rapidly.',
      },
    ],
  },

  '/nuages': {
    slug: 'nuages',
    path: '/nuages',
    canonicalUrl: `${BASE_SITE_URL}/nuages`,
    title: 'Cloud Cover, Vertical Sounding, Cloud Classification & Icing | Instant Météo',
    description:
      'Track cloud cover (nebulosity) in France: vertical atmospheric sounding, WMO cloud classification (low, mid, high decks), cloud ceiling, icing risk and 48h sky clearing.',
    h1: 'Cloud Cover, Vertical Sounding, Cloud Classification and Nebulosity',
    sectionTitle: 'Vertical Tropospheric Sounding, WMO Cloud Classification, Icing and Nebulosity',
    breadcrumbName: 'Clouds & Nephology',
    tabId: 'cloudNephology',
    changefreq: 'always',
    priority: '0.90',
    introParagraph:
      'The Cloud & Nephology Observatory details the vertical structure of the atmosphere above your municipality. Through vertical sounding profiles, WMO cloud classification, icing risk detection and nebulosity tracking across low, middle and high tropospheric decks, you can accurately anticipate sunshine, fog, ceiling height and aviation conditions over 48 hours.',
    sections: [
      {
        heading: 'Vertical sounding and atmospheric humidity profile (1000 hPa to 200 hPa)',
        body: 'The vertical sounding analyzes temperature, dew point and relative humidity from the ground up to 12,000 meters across standard pressure levels. It calculates the Lifting Condensation Level (LCL), cloud base altitude (ceiling), cloud top height and thermal inversions.',
      },
      {
        heading: 'WMO cloud classification and nebulosity by altitude deck',
        body: 'Nebulosity (sky fraction covered in percent and octas from 0/8 clear sky to 8/8 overcast) is broken down into the 10 WMO cloud genera across three altitude decks: low clouds below 2,000 m (stratus, stratocumulus, cumulus), middle clouds between 2,000 m and 6,000 m (altocumulus, altostratus, nimbostratus), high ice clouds above 6,000 m (cirrus, cirrocumulus, cirrostratus) and vertical convective towers (cumulonimbus).',
      },
      {
        heading: 'Atmospheric icing risk, 0 °C isotherm and optical thickness',
        body: 'By crossing sub-freezing temperatures (between 0 °C and -20 °C) with supercooled liquid water layers, the observatory identifies altitude bands prone to airframe icing for aviation and mountain activities, while distinguishing thin high cirrus from dense low stratus.',
      },
    ],
    faq: [
      {
        question: 'Why can the weather feel sunny even when total nebulosity is 70%?',
        answer:
          'When cloud cover consists solely of high-altitude cirrus ice clouds above 6,000 meters, their low optical thickness lets most solar radiation through, unlike a thick layer of low stratus.',
      },
      {
        question: 'How does the vertical sounding detect icing risk in clouds?',
        answer:
          'Icing occurs when relative humidity exceeds 85% in an atmospheric layer where temperature lies between 0 °C and -20 °C, indicating the presence of supercooled water droplets.',
      },
      {
        question: 'What nebulosity is required for stargazing and astrophotography?',
        answer:
          'For optimal night-sky observation, look for time slots where all three cloud decks (low, middle and high nebulosity) simultaneously remain below 15% (0 to 1 octa).',
      },
    ],
  },

  '/14-jours': {
    slug: '14-jours',
    path: '/14-jours',
    canonicalUrl: `${BASE_SITE_URL}/14-jours`,
    title: '14-Day Weather Forecast & Ensemble Scenarios in France | Instant Météo',
    description:
      '14-day weather trends for your municipality: daily minimum and maximum temperatures, precipitation probabilities, ensemble spread and confidence index.',
    h1: '14-Day Weather Trends and Ensemble Scenarios',
    sectionTitle: 'How to Interpret a Two-Week Weather Forecast',
    breadcrumbName: '14-Day Forecast',
    tabId: 'scenarios14d',
    changefreq: 'hourly',
    priority: '0.90',
    introParagraph:
      'This page presents the expected meteorological evolution over two full weeks in your municipality, displaying both the median forecast scenario and the ensemble temperature range.',
    sections: [
      {
        heading: 'Reading the thermal uncertainty cone',
        body: 'On the 14-day chart, the central curve represents the most likely evolution, surrounded by a shaded band illustrating warmer and cooler ensemble scenarios.',
      },
      {
        heading: 'Daily confidence score expressed in percent',
        body: 'Each day features a reliability index: a score above 80% signals a well-established weather regime, whereas a score near 50% indicates uncertainty in storm tracks.',
      },
      {
        heading: 'Planning outdoor work, travel and events',
        body: 'The daily summary synthesizes expected rainfall totals, peak wind speed and temperature departures from seasonal norms.',
      },
    ],
    faq: [
      {
        question: 'How far ahead is a weather forecast highly accurate?',
        answer:
          'Forecasts are generally very precise up to 5 days for rain timing and temperatures, and provide a reliable trend on the overall weather regime between days 6 and 14.',
      },
      {
        question: 'What does a 60% rain probability at day 10 mean?',
        answer:
          'It means that 6 out of 10 numerical ensemble members simulate a rain system passing over your municipality on that day.',
      },
      {
        question: 'How often is the 14-day trend recalculated?',
        answer:
          'Ensemble scenarios are updated four times a day to incorporate the latest global atmospheric observations.',
      },
    ],
  },

  '/montagne': {
    slug: 'montagne',
    path: '/montagne',
    canonicalUrl: `${BASE_SITE_URL}/montagne`,
    title: 'Mountain Weather & Snow Conditions Across French Massifs | Instant Météo',
    description:
      'Mountain weather across the 7 French ranges (Northern Alps, Southern Alps, Pyrenees, Massif Central, Vosges, Jura and Corsica): snow depth, rain-snow line, 0°C isotherm and avalanche risk.',
    h1: 'Mountain Weather and Snowpack Conditions',
    sectionTitle: 'High-Altitude Parameters for Ski Resorts and Mountaineering',
    breadcrumbName: 'Mountain Weather',
    tabId: 'mountain',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'The Mountain Weather observatory supports hikers, mountaineers and skiers across the seven major French mountain ranges: Northern Alps, Southern Alps, Pyrenees, Massif Central, Vosges, Jura and Corsica. Check conditions by elevation band from valley floors to the highest peaks.',
    sections: [
      {
        heading: 'Real-time 0 °C isotherm and rain-snow limit',
        body: 'The 0 °C isotherm indicates the altitude where free-air temperature reaches freezing. During steady precipitation, snowflakes typically fall 200 to 400 meters below this isotherm.',
      },
      {
        heading: 'Snowpack depth and snow quality',
        body: 'For each resort and summit, check snow depth at the base and top of slopes, 24-hour fresh snowfall totals and snowpack quality.',
      },
      {
        heading: 'Snowpack stability and high-altitude ridge winds',
        body: 'Strong winds on ridges transport large volumes of snow and form wind slabs on lee slopes. Always verify the avalanche danger scale (1 to 5) before any backcountry outing.',
      },
    ],
    faq: [
      {
        question: 'How does temperature change with altitude?',
        answer:
          'In a standard atmosphere, temperature decreases by an average of 0.65 °C per 100 meters of elevation gain, except during winter temperature inversions.',
      },
      {
        question: 'What does an avalanche risk of level 3 out of 5 mean?',
        answer:
          'Level 3 (considerable risk) means avalanches can be triggered by a single skier or hiker on many steep slopes; solid snow-safety experience is essential.',
      },
      {
        question: 'Why is the UV index much stronger in the mountains?',
        answer:
          'Ultraviolet radiation increases by about 10% every 1,000 meters of elevation, and fresh snow reflects up to 85% of UV rays.',
      },
    ],
  },

  '/plages': {
    slug: 'plages',
    path: '/plages',
    canonicalUrl: `${BASE_SITE_URL}/plages`,
    title: 'Beach Weather, Tides & Sea Water Temperature in France | Instant Météo',
    description:
      'Coastal and beach weather in France: high and low tide times, tide coefficients, sea surface temperature, wave height, swell period, onshore wind and UV index.',
    h1: 'Coastal Weather, Tide Times and Swimming Conditions',
    sectionTitle: 'Marine Information for Swimming and Water Sports',
    breadcrumbName: 'Beaches & Tides',
    tabId: 'beaches',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'From the English Channel to the Mediterranean and the Atlantic coast, the Beach Weather page brings together marine data to plan a day by the sea, a surf session or coastal sailing.',
    sections: [
      {
        heading: 'High tide, low tide times and tide coefficients',
        body: 'Check exact high and low water times along with the daily tide coefficient (from 20 to 120). Above coefficient 90 (spring tides), tidal range and rip currents strengthen significantly.',
      },
      {
        heading: 'Sea water temperature and swell state',
        body: 'Each beach sheet displays sea surface temperature, significant wave height in meters, swell period in seconds and coastal thermal breeze direction.',
      },
      {
        heading: 'Sun protection and swimming safety',
        body: 'A synthetic indicator evaluates swimming safety based on sea state and wind speed, paired with hourly UV tracking.',
      },
    ],
    faq: [
      {
        question: 'What is a rip current (baïne) on the Atlantic coast?',
        answer:
          'A baïne is a natural sandbar pool that empties during ebb tide, creating a strong seaward current. If caught, swim parallel to the shoreline rather than against the current.',
      },
      {
        question: 'Why is a long-period swell (over 12 seconds) more powerful?',
        answer:
          'Long-period swells originate from distant ocean storms, carrying greater deep-water energy that builds into larger wave sets near coastal sandbars.',
      },
      {
        question: 'Why is it often cooler on the beach than 10 km inland?',
        answer:
          'In the afternoon, rapid inland heating creates a thermal sea breeze that draws temperate marine air onto the shore.',
      },
    ],
  },

  '/secheresse-incendie': {
    slug: 'secheresse-incendie',
    path: '/secheresse-incendie',
    canonicalUrl: `${BASE_SITE_URL}/secheresse-incendie`,
    title: 'Drought Status & Wildfire Risk in France | Instant Météo',
    description:
      'Track soil moisture, groundwater levels and meteorological wildfire danger by department across France.',
    h1: 'Drought Monitoring and Forest Fire Risk',
    sectionTitle: 'Soil Moisture Indicators, Groundwater Reserves and Wildfire Danger',
    breadcrumbName: 'Drought & Wildfires',
    tabId: 'droughtFire',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'This environmental observatory monitors water resources and vegetation vulnerability to wildfires across France, distinguishing surface agricultural soil drought, groundwater levels and daily fire weather danger.',
    sections: [
      {
        heading: 'Surface soil moisture and water balance',
        body: 'The water balance compares recent rainfall with plant evapotranspiration driven by heat and wind to measure crop and forest water stress.',
      },
      {
        heading: 'Groundwater levels and water usage restrictions',
        body: 'Underground aquifers recharge mainly from October to March. During low-water periods, four prefectural restriction levels apply: watch, alert, reinforced alert and crisis.',
      },
      {
        heading: 'Meteorological forest fire danger index',
        body: 'Dry vegetation combined with air humidity below 30%, high temperatures and strong winds (such as the Mistral or Tramontane) favors rapid fire spread.',
      },
    ],
    faq: [
      {
        question: 'Why doesn’t a heavy summer thunderstorm recharge groundwater aquifers?',
        answer:
          'Dry summer soils cause rapid surface runoff, and active vegetation absorbs most infiltrated water before it can reach deep aquifers.',
      },
      {
        question: 'What are the watering rules during a drought alert?',
        answer:
          'Lawn and garden watering is typically banned during the hottest hours (11 AM to 6 PM) under alert levels and suspended under crisis levels.',
      },
      {
        question: 'How can accidental wildfire ignitions be prevented?',
        answer:
          'Never discard cigarette butts outdoors, avoid spark-producing tools near dry grass and respect temporary forest access closures.',
      },
    ],
  },

  '/cours-d-eau': {
    slug: 'cours-d-eau',
    path: '/cours-d-eau',
    canonicalUrl: `${BASE_SITE_URL}/cours-d-eau`,
    title: 'River Levels & Flood Monitoring in France | Instant Météo',
    description:
      'Hydrological monitoring of rivers and streams in France: water height in meters, discharge in m³/s, level trends and historical flood markers.',
    h1: 'River Levels and Flood Surveillance',
    sectionTitle: 'Hydrometric Stations and Watershed Response',
    breadcrumbName: 'Rivers & Floods',
    tabId: 'watercourses',
    changefreq: 'always',
    priority: '0.85',
    introParagraph:
      'The Rivers & Floods page tracks water levels across major French rivers and mountain streams, displaying gauge height in meters, estimated flow rate and immediate trend.',
    sections: [
      {
        heading: 'Measuring water height (m) and discharge (m³/s)',
        body: 'Sensors along bridges and riverbanks continuously measure water surface height, converted into cubic meters per second via station rating curves.',
      },
      {
        heading: 'Slow lowland floods versus flash torrential floods',
        body: 'Major lowland rivers rise gradually over several days, whereas steep Mediterranean and mountain catchments can rise several meters in under two hours during stationary storms.',
      },
      {
        heading: 'Comparison with historical reference floods',
        body: 'Each hydrological sheet compares current levels with historical benchmark floods to evaluate bank overflow thresholds.',
      },
    ],
    faq: [
      {
        question: 'Why does a river keep rising after the rain has stopped?',
        answer:
          'Runoff collected across upstream hills and tributaries takes hours or days to travel downstream as a flood wave.',
      },
      {
        question: 'What are the essential safety rules during a flash flood?',
        answer:
          'Never drive or walk onto a flooded road (30 cm of moving water can sweep a car away), avoid underground parking garages and move to higher floors.',
      },
      {
        question: 'What is low-water baseflow (étiage)?',
        answer:
          'It refers to the lowest average water level reached by a river during the year, usually at the end of summer.',
      },
    ],
  },

  '/cartes-thematiques': {
    slug: 'cartes-thematiques',
    path: '/cartes-thematiques',
    canonicalUrl: `${BASE_SITE_URL}/cartes-thematiques`,
    title: 'Thematic Weather Maps of France | Instant Météo',
    description:
      'Explore thematic weather maps of France: regional temperatures, thermal anomalies, wind gusts, rainfall totals and relief.',
    h1: 'Regional Thematic Weather Maps of France',
    sectionTitle: 'Cartographic Analysis of Atmospheric Parameters in France',
    breadcrumbName: 'Thematic Maps',
    tabId: 'radar',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'Thematic maps provide a nationwide view of weather contrasts between northern and southern France, oceanic coastlines and mountain ranges.',
    sections: [
      {
        heading: 'National thermal map and regional contrasts',
        body: 'Compare temperatures across major cities, coastal stations and mountain peaks with elevation-band filtering.',
      },
      {
        heading: 'Wind fields and regional acceleration corridors',
        body: 'Identify major wind corridors including the Mistral in the Rhône valley, Tramontane in Roussillon, Autan wind and Atlantic gales.',
      },
      {
        heading: 'Spatial distribution of rainfall and climate anomalies',
        body: 'Compare regional rainfall and temperature departures from seasonal norms across all 13 metropolitan regions.',
      },
    ],
    faq: [
      {
        question: 'How can I zoom directly into my region or mountain range?',
        answer:
          'Use the quick-selection bar for the 13 French regions or mountain summits to frame the map immediately.',
      },
      {
        question: 'What is the purpose of the altitude filter on the map?',
        answer:
          'It compares stations at similar elevations so relief cooling is not confused with a lowland cold front.',
      },
      {
        question: 'Can I switch the basemap between satellite and topographic relief?',
        answer:
          'Yes, the top-left map controls let you switch between standard, topographic relief, dark mode and satellite imagery.',
      },
    ],
  },

  '/sports': {
    slug: 'sports',
    path: '/sports',
    canonicalUrl: `${BASE_SITE_URL}/sports`,
    title: 'Road Trip Weather & Outdoor Sports Indices | Instant Météo',
    description:
      'Road route weather calculator and outdoor activity indices: cycling, running, hiking, golf, water sports and gardening.',
    h1: 'Weather Conditions for Road Travel and Outdoor Sports',
    sectionTitle: 'Planning Road Journeys and Outdoor Training Sessions',
    breadcrumbName: 'Road & Sports Weather',
    tabId: 'sportsActivities',
    changefreq: 'hourly',
    priority: '0.80',
    introParagraph:
      'Whether planning a highway trip, a bike ride or a running session, this page evaluates the concrete impact of weather conditions hour by hour.',
    sections: [
      {
        heading: 'Step-by-step road route weather calculator',
        body: 'Enter your departure town, destination and departure time to estimate road conditions along the route: wet pavement, aquaplaning risk, fog, black ice or crosswinds.',
      },
      {
        heading: 'Comfort indices for cycling, running and hiking',
        body: 'Each sport receives a 0–10 practicability score based on wind speed and direction, thermal stress, rain probability and air quality.',
      },
      {
        heading: 'Practical guidance for gardening and outdoor work',
        body: 'Identify the best hourly windows for mowing, watering or outdoor projects away from showers and peak heat.',
      },
    ],
    faq: [
      {
        question: 'At what wind speed does driving become hazardous?',
        answer:
          'When crosswind gusts exceed 60 to 70 km/h, motorcycles, campers and trailers should reduce speed and exercise caution on bridges.',
      },
      {
        question: 'What is the best time of day to run in summer?',
        answer:
          'Between 6:00 AM and 9:00 AM, when air temperature and ground-level ozone concentrations are lowest.',
      },
      {
        question: 'How can I tell if roads might be icy at dawn?',
        answer:
          'When air temperature drops below +2 °C with high humidity or after an overnight shower, road surfaces can freeze locally on bridges and forest edges.',
      },
    ],
  },

  '/bulletins': {
    slug: 'bulletins',
    path: '/bulletins',
    canonicalUrl: `${BASE_SITE_URL}/bulletins`,
    title: 'Departmental Weather Bulletins & 4-Week Outlook | Instant Météo',
    description:
      'Written weather bulletins for France and every department: daily synopsis, weekly evolution and 4-week outlook.',
    h1: 'Detailed Weather Bulletins by Department',
    sectionTitle: 'Daily Written Synopses and Four-Week Outlooks',
    breadcrumbName: 'Bulletins & 4-Week Outlook',
    tabId: 'bulletin',
    changefreq: 'hourly',
    priority: '0.85',
    introParagraph:
      'For readers who prefer a structured written analysis, the Bulletins page provides a complete national weather synopsis, a local departmental bulletin and a week-by-week monthly outlook.',
    sections: [
      {
        heading: 'National synopsis and European synoptic situation',
        body: 'The daily bulletin explains the position of high- and low-pressure systems across the North Atlantic and Europe.',
      },
      {
        heading: 'Detailed departmental and municipal forecast',
        body: 'Each locality features a morning, afternoon and evening breakdown of sky conditions, temperatures, wind direction and rain probability.',
      },
      {
        heading: '4-week meteorological outlook',
        body: 'The four-week module outlines upcoming weather regimes week by week (oceanic flow, anticyclonic blocking or continental cooling).',
      },
    ],
    faq: [
      {
        question: 'What is the difference between a 7-day bulletin and a 4-week outlook?',
        answer:
          'The 7-day bulletin details day-by-day weather and rain timing, while the 4-week outlook describes the dominant weekly anomaly.',
      },
      {
        question: 'Can I view the bulletin specific to my department?',
        answer:
          'Yes, selecting any municipality or department in the search bar automatically updates the local bulletin.',
      },
      {
        question: 'Can I export or print a complete weather report?',
        answer:
          'An export button generates a printable summary combining current observations, weekly forecasts and local climate normals.',
      },
    ],
  },

  '/archives': {
    slug: 'archives',
    path: '/archives',
    canonicalUrl: `${BASE_SITE_URL}/archives`,
    title: 'Historical Weather Archives in France Since 1950 | Instant Météo',
    description:
      'Look up historical daily weather in France since 1950: past temperatures, rainfall totals, records and 1991–2020 climate normals.',
    h1: 'Historical Weather Archives and Seasonal Normals',
    sectionTitle: 'Searching Climate Archives and Comparing with Reference Normals',
    breadcrumbName: 'Archives & Normals',
    tabId: 'weatherArchive',
    changefreq: 'daily',
    priority: '0.80',
    introParagraph:
      'What was the weather like in your town on a specific date ten, thirty or seventy years ago? The Weather Archives page lets you explore daily records since 1950 and compare current weather with reference normals.',
    sections: [
      {
        heading: 'Daily historical weather lookup since 1950',
        body: 'Select any calendar date to view reconstructed conditions for your municipality: dawn minimum temperature, afternoon maximum, 24-hour precipitation and peak wind speed.',
      },
      {
        heading: 'What do the 1991–2020 climate normals represent?',
        body: 'Meteorologists use the 30-year average (1991–2020) as the official baseline to measure whether a day is unusually warm, cold, dry or wet.',
      },
      {
        heading: 'Chronology of major historical weather events in France',
        body: 'Explore landmark events in French meteorological history: severe cold waves (1956, 1985), major windstorms (1999, Xynthia) and summer heatwaves (2003, 2019, 2022).',
      },
    ],
    faq: [
      {
        question: 'How do I find the weather for a specific past date?',
        answer:
          'Choose your municipality and select the year, month and day in the archive picker to display the complete historical sheet.',
      },
      {
        question: 'Why does the climate reference period change every ten years?',
        answer:
          'The World Meteorological Organization updates the 30-year baseline each decade so normals reflect recent climate conditions.',
      },
      {
        question: 'Can I use these archives to check a past storm event?',
        answer:
          'Historical series display daily peak wind gusts and rainfall totals recorded during past severe weather episodes.',
      },
    ],
  },

  '/monde-catastrophes': {
    slug: 'monde-catastrophes',
    path: '/monde-catastrophes',
    canonicalUrl: `${BASE_SITE_URL}/monde-catastrophes`,
    title: 'Global Natural Disasters & Extreme Weather Tracker | Instant Météo',
    description:
      'Real-time global tracking of meteorological and geophysical events: tropical cyclones, severe storms, floods, wildfires, earthquakes and volcanic eruptions.',
    h1: 'Global Natural Hazards and Extreme Events Tracker',
    sectionTitle: 'International Monitoring of Cyclones, Earthquakes and Extreme Events',
    breadcrumbName: 'World & Disasters',
    tabId: 'worldDisasters',
    changefreq: 'always',
    priority: '0.80',
    introParagraph:
      'Beyond metropolitan France, this page tracks major natural hazards worldwide in real time: tropical cyclones (including French overseas territories), significant earthquakes, volcanic eruptions and major wildfires.',
    sections: [
      {
        heading: 'Track and intensity of tropical cyclones, hurricanes and typhoons',
        body: 'Monitor tropical systems across the Atlantic, Indian Ocean and Pacific basins with their Saffir-Simpson category and sustained wind speeds.',
      },
      {
        heading: 'Global seismic and volcanic activity',
        body: 'Significant earthquakes are listed with magnitude, hypocenter depth and distance to populated areas, alongside active volcano alerts.',
      },
      {
        heading: 'Major wildfires and floods across continents',
        body: 'Visualize major thermal anomalies and severe flood episodes reported across all five continents.',
      },
    ],
    faq: [
      {
        question: 'What is the difference between a hurricane, a typhoon and a cyclone?',
        answer:
          'They are the exact same meteorological phenomenon, named hurricane in the North Atlantic/Northeast Pacific, typhoon in the Northwest Pacific and tropical cyclone in the Indian and South Pacific oceans.',
      },
      {
        question: 'At what wind speed does a tropical storm become a Category 1 hurricane?',
        answer:
          'A tropical system reaches Category 1 on the Saffir-Simpson scale when 1-minute sustained winds exceed 119 km/h (and Category 5 above 252 km/h).',
      },
      {
        question: 'Are French overseas territories covered by this tracker?',
        answer:
          'Yes, special focus is given to cyclonic and seismic basins surrounding Guadeloupe, Martinique, La Réunion, Mayotte, New Caledonia and French Polynesia.',
      },
    ],
  },

  '/climat': {
    slug: 'climat',
    path: '/climat',
    canonicalUrl: `${BASE_SITE_URL}/climat`,
    title: 'Seasonal Climate Trends & 8-Month Outlook in France | Instant Météo',
    description:
      '8-month seasonal climate projections in France, El Niño / La Niña (ENSO) cycle tracking and long-term annual temperature trends.',
    h1: 'Seasonal Climate Trends and Long-Term Assessments',
    sectionTitle: 'Long-Range Climate Projections and Oceanic Cycles',
    breadcrumbName: 'Climate & 8-Month Outlook',
    tabId: 'eightMonths',
    changefreq: 'daily',
    priority: '0.80',
    introParagraph:
      'The Climate observatory explores long-term atmospheric evolution: month-by-month seasonal trends over the next 8 months in France, global oceanic cycles and annual thermal anomalies.',
    sections: [
      {
        heading: 'Month-by-month seasonal projections over 8 months',
        body: 'Seasonal projections estimate whether upcoming months are likely to be warmer, cooler, drier or wetter than average across France.',
      },
      {
        heading: 'Influence of El Niño, La Niña and the North Atlantic Oscillation',
        body: 'Sea surface temperature anomalies (ENSO) and the North Atlantic Oscillation (NAO) shape jet stream patterns and European seasonal regimes.',
      },
      {
        heading: 'Evolution of mean temperatures in France since the 20th century',
        body: 'Long-term charts illustrate rising mean temperatures, fewer lowland frost days and more frequent summer heatwaves.',
      },
    ],
    faq: [
      {
        question: 'How can a seasonal forecast look several months ahead?',
        answer:
          'Oceans, sea ice and soil moisture have strong thermal inertia that influences large-scale atmospheric circulation over several months.',
      },
      {
        question: 'What is the North Atlantic Oscillation (NAO)?',
        answer:
          'It measures the pressure difference between the Azores High and the Icelandic Low: a positive winter NAO brings mild, wet oceanic air to France, while a negative NAO favors cold outbreaks.',
      },
      {
        question: 'What does the thermal anomaly in degrees (°C) measure?',
        answer:
          'It measures the departure of observed monthly or annual mean temperature from the 1991–2020 reference normal.',
      },
    ],
  },

  '/communaute': {
    slug: 'communaute',
    path: '/communaute',
    canonicalUrl: `${BASE_SITE_URL}/communaute`,
    title: 'Community Weather Reports & Live Chat in France | Instant Météo',
    description:
      'Share and view live citizen weather observations in France: snowfall, hail, thunderstorms, wind gusts, fog and local weather discussions.',
    h1: 'Citizen Weather Observations and Community Chat',
    sectionTitle: 'How Participatory Weather Reporting Works',
    breadcrumbName: 'Community & Reports',
    tabId: 'discussionGroup',
    changefreq: 'always',
    priority: '0.75',
    introParagraph:
      'Even the densest station networks cannot see every localized hail shower, snowflake or valley fog bank. The Community space lets residents and enthusiasts share live ground observations.',
    sections: [
      {
        heading: 'Participatory map of ground weather phenomena',
        body: 'Report snow, black ice, hail, thunderstorms or strong wind gusts in your municipality in seconds to inform nearby residents.',
      },
      {
        heading: 'Cross-validation with local meteorological parameters',
        body: 'Each report is paired with local temperature and humidity context to ensure high data reliability.',
      },
      {
        heading: 'Live discussion feed during major weather events',
        body: 'Exchange observations with fellow weather enthusiasts across your region to follow storm lines or snowfall accumulation.',
      },
    ],
    faq: [
      {
        question: 'How do I submit a weather observation for my town?',
        answer:
          'Click the report button, select the observed phenomenon (rain, snow, storm, wind, clear sky) and add a short note.',
      },
      {
        question: 'Why are citizen observations so helpful in winter?',
        answer:
          'During lowland snow events, a half-degree difference determines whether rain turns to snow on the ground.',
      },
      {
        question: 'Is participation in the community feed free?',
        answer:
          'Yes, sharing observations and participating in the weather chat is completely free and open to everyone.',
      },
    ],
  },

  '/competition': {
    slug: 'competition',
    path: '/competition',
    canonicalUrl: `${BASE_SITE_URL}/competition`,
    title: 'Weather Quiz, Forecast Challenges & 3D Game | Instant Météo',
    description:
      'Test your meteorology skills with the weather quiz, forecast challenges and the Paratonnerre 3D weather defense game.',
    h1: 'Weather Quiz, Forecaster Leaderboard and 3D Weather Game',
    sectionTitle: 'Rules of the Forecast Challenge and Educational Quizzes',
    breadcrumbName: 'Quiz & Weather Game',
    tabId: 'competitive',
    changefreq: 'daily',
    priority: '0.75',
    introParagraph:
      'Learn to decode the atmosphere while competing with other enthusiasts: take educational meteorology quizzes, make forecast predictions or play the 3D Paratonnerre storm defense game.',
    sections: [
      {
        heading: 'Forecast challenges: step into the shoes of a meteorologist',
        body: 'Analyze atmospheric clues to estimate maximum temperature, rainfall totals or wind speed at a given station.',
      },
      {
        heading: 'Thematic quizzes on clouds, climate and records',
        body: 'Review cloud classification, thunderstorm dynamics, regional French winds and historical climate records.',
      },
      {
        heading: 'Global leaderboard and player progression',
        body: 'Earn points and streaks with accurate answers to climb the forecaster rankings.',
      },
    ],
    faq: [
      {
        question: 'How are points awarded in weather challenges?',
        answer:
          'Scores depend on accuracy and consistency: consecutive correct answers trigger a streak multiplier.',
      },
      {
        question: 'Do I need to be a meteorology expert to play?',
        answer:
          'Not at all: questions feature multiple difficulty levels with clear explanations after each answer.',
      },
      {
        question: 'How do I launch the 3D weather game?',
        answer:
          'Click the gamepad icon in the top header or inside the Competitive tab to launch Paratonnerre 3D immediately.',
      },
    ],
  },
};

/**
 * Exact FR -> EN UI Phrase Dictionary for native instant client-side translation
 * without using Google Translate when 'en' is selected.
 */
const FR_TO_EN_EXACT: Record<string, string> = {
  'MÉTÉO': 'WEATHER',
  'Radar Doppler HD & Prévisions Temps Réel': 'HD Doppler Radar & Live Forecasts',
  'HD & DIRECT': 'HD & LIVE',
  'Bulle Écran': 'Screen Bubble',
  'Rechercher une ville...': 'Search for a city...',
  'Rechercher': 'Search',
  'Chercher commune / monde': 'Search town / world',
  'Position ': 'GPS ',
  'GPS': 'GPS',
  'Jeu Météo': 'Weather Game',
  'Jeu': 'Game',
  'Vidéos': 'Videos',
  'Appli': 'App',
  'Langue': 'Language',
  'Langue du site': 'Site Language',
  'Options': 'Options',
  'Simplifié': 'Simplified',
  'Expert': 'Expert',
  'Blanc': 'Light',
  'Noir': 'Dark',
  'Tuto': 'Guide',
  'Fermer': 'Close',
  'Relancer': 'Restart',
  'Alertes & Push': 'Alerts & Push',
  'Restez informé': 'Stay informed',
  'Vigilance 5j': '5-Day Warnings',
  'Vigilance 15j': '15-Day Warnings',
  'Cartes officielles': 'Official maps',
  'Radar HD': 'HD Radar',
  'En temps réel': 'Real-time',
  'Sommaire': 'Contents',
  'Complet': 'Full',
  'Logos': 'Icons',
  'Réduire': 'Minimize',
  'Accueil': 'Home',
  'Cartes & Modèles': 'Maps & Models',
  'Agro-Météo': 'Agro-Weather',
  'Aviation': 'Aviation',
  'Paramètres': 'Settings',
  'Mode Sombre': 'Dark Mode',
  'Bulletins Prévisions': 'Forecast Bulletins',
  'Ma Position GPS': 'My GPS Location',
  'Raccourcis Directs': 'Quick Shortcuts',
  'Rechercher une ville': 'Search for a city',
  'Alertes & Notifications': 'Alerts & Notifications',
  'Atmosphère & Thème': 'Atmosphere & Theme',
  'Changer de page météo': 'Switch weather page',
  'Menu rapide': 'Quick Menu',
  "Tous les raccourcis de l'application": 'All application shortcuts',
  'Alertes & signalement': 'Alerts & Reporting',
  'Centre de notifications météo': 'Weather notification center',
  'Signaler / Corriger météo': 'Report / Correct Weather',
  'Signaler une observation météo incorrecte': 'Report an inaccurate local observation',
  'Affichage': 'Display',
  'Confort Senior Activé': 'Senior Comfort Enabled',
  'Mode Confort': 'Comfort Mode',
  "Améliorer la lisibilité de l'interface": 'Enhance interface readability',
  'Mode Blanc (Design Clair)': 'Light Mode (Bright Design)',
  'Mode Noir (Design Sombre)': 'Dark Mode (Night Design)',
  'Choix des pages & blocs': 'Pages & Blocks Customizer',
  'Personnaliser': 'Customize',
  'Choisir les pages et les blocs à afficher': 'Choose which pages and blocks to display',
  'Grand écran': 'Full Screen',
  'Quitter le grand écran': 'Exit Full Screen',
  "Afficher l'application en plein écran": 'Display application in full screen',
  'Outils': 'Tools',
  'Comparateur': 'Comparator',
  'Comparer plusieurs communes ou sommets': 'Compare multiple towns or summits',
  'Dossier': 'Weather Dossier',
  'Exporter ou imprimer le dossier météo': 'Export or print the weather report',
  'Application': 'Application',
  "Télécharger l'Application": 'Download the Application',
  'Actualisation météo': 'Weather Refresh',
  'Actualiser': 'Refresh',
  'Actif': 'Active',
  'Pause': 'Paused',
  'Accueil France': 'France Home',
  'Météo en Direct': 'Live Weather',
  'Radar Précipitations HD': 'HD Rain Radar',
  'Vigilances Météo-France': 'Weather Warnings',
  'Nuages & Néphologie 48h': 'Clouds & 48h Nephology',
  'Tendances 14 Jours': '14-Day Trends',
  'Tendances 8 Mois & Climat': '8-Month & Climate Trends',
  'Cartes Météo Thématiques': 'Thematic Weather Maps',
  'Météo Montagne & BERA': 'Mountain & Snow Weather',
  'Météo Plages & SHOM': 'Beaches & Tides Weather',
  'Sécheresse & Feux': 'Drought & Wildfires',
  "Cours d'Eau & Crues": 'Rivers & Floods',
  'Météo Sport & Itinéraire': 'Sports & Route Weather',
  'Bulletins & 4 Semaines': 'Bulletins & 4 Weeks',
  'Archives Journalières': 'Daily Archives',
  'Catastrophes Monde': 'World Disasters',
  'Salon Météo': 'Weather Chat',
  'Quiz & Compétition': 'Quiz & Competition',
  '⚖️ Comparateur Multi-Villes': '⚖️ Multi-City Comparator',
  '🔍 Recherche 34 965 communes': '🔍 Search 34,965 municipalities',
  "📱 Installer l'App": '📱 Install the App',
  '1. Temps Réel & Observatoire Direct': '1. Real-Time & Live Observatory',
  '2. Nuages 48h & Néphologie': '2. 48h Clouds & Nephology',
  '3. Vigilances & Alertes Multi-Jours': '3. Multi-Day Warnings & Alerts',
  '4. Tendances & Scénarios 14 Jours': '4. 14-Day Trends & Scenarios',
  '5. Radar Précipitations, Feux NASA & Vents': '5. Rain Radar, NASA Fires & Winds',
  '6. Tendances 8 Mois (Dép/Région/Pays)': '6. 8-Month Seasonal Trends',
  '7. Évolution depuis 2000 & 1min': '7. Climate Evolution Since 2000',
  '8. Météo Sport & Trajet Itinéraire': '8. Sports & Road Trip Weather',
  '9. Monde & Catastrophes Naturelles': '9. World & Natural Disasters',
  '10. Archives & Historique Journalier': '10. Daily Weather Archives',
  '11. Bulletins Prévisions (J+7 & 4 Semaines)': '11. Forecast Bulletins (7d & 4w)',
  '12. Mode Compétitif & Classement': '12. Competitive Quiz & Leaderboard',
  '13. Groupe de Discussion & Salon Météo': '13. Community Weather Chat',
  'Envie d\'une pause cinéma ?': 'Looking for a movie break?',
  'Partenaire': 'Partner',
  'Visiter Cin-Scope': 'Visit Cin-Scope',
};

const FR_TO_EN_FRAGMENTS: Array<[RegExp, string]> = [
  [/Prévisions météo en France et suivi en temps réel/g, 'Live Weather Forecasts and Real-Time Tracking in France'],
  [/Couverture nuageuse, sondage vertical et nébulosité/g, 'Cloud Cover, Vertical Sounding and Nebulosity'],
  [/Observatoires & Cartographies Instant Météo \(Indexation Officielle\) :/g, 'Instant Météo Observatories & Maps (Official Directory):'],
  [/Prévisions météorologiques de référence, temps réel, 14 jours, 8 mois par département & Vigilances Météo-France\./g, 'Reference weather forecasts, real-time observations, 14-day & 8-month trends and severe weather warnings in France.'],
  [/Versions linguistiques disponibles :/g, 'Available language versions:'],
  [/Accès direct aux rubriques :/g, 'Direct access to sections:'],
  [/Recherche avancée \(34 965 communes & Monde\)/g, 'Advanced Search (34,965 municipalities & World)'],
  [/Recherche avancée \(34 965 communes\)/g, 'Advanced Search (34,965 municipalities)'],
  [/Stations Favorites & Repères/g, 'Favorite & Reference Stations'],
  [/Chargement des données météo et radar pour /g, 'Loading weather and radar data for '],
  [/Dernière mise à jour :/g, 'Last updated:'],
  [/Live Continu/g, 'Continuous Live'],
  [/Live en pause/g, 'Live Paused'],
  [/Unité °/g, 'Unit °'],
  [/Ouvrir les vigilances 15 jours/g, 'Open 15-day warnings'],
  [/Ressenti/g, 'Feels like'],
  [/Humidité/g, 'Humidity'],
  [/Pression/g, 'Pressure'],
  [/Précipitations/g, 'Precipitation'],
  [/Couverture nuageuse/g, 'Cloud cover'],
  [/Nébulosité/g, 'Nebulosity'],
  [/Sondage vertical/g, 'Vertical sounding'],
  [/Classification des nuages/g, 'Cloud classification'],
  [/Givrage/g, 'Icing'],
  [/Plafond nuageux/g, 'Cloud ceiling'],
  [/Visibilité/g, 'Visibility'],
  [/Point de rosée/g, 'Dew point'],
  [/Indice UV/g, 'UV Index'],
  [/Rafales/g, 'Wind gusts'],
  [/Vent moyen/g, 'Mean wind'],
  [/Prévisions heure par heure/g, 'Hourly Forecast'],
  [/Prévisions 7 jours/g, '7-Day Forecast'],
  [/Prévisions 14 jours/g, '14-Day Forecast'],
  [/Aujourd'hui/g, 'Today'],
  [/Demain/g, 'Tomorrow'],
  [/Lundi/g, 'Monday'],
  [/Mardi/g, 'Tuesday'],
  [/Mercredi/g, 'Wednesday'],
  [/Jeudi/g, 'Thursday'],
  [/Vendredi/g, 'Friday'],
  [/Samedi/g, 'Saturday'],
  [/Dimanche/g, 'Sunday'],
  [/Ciel dégagé/g, 'Clear sky'],
  [/Peu nuageux/g, 'Mostly clear'],
  [/Partiellement nuageux/g, 'Partly cloudy'],
  [/Couvert/g, 'Overcast'],
  [/Brouillard/g, 'Fog'],
  [/Pluie faible/g, 'Light rain'],
  [/Pluie modérée/g, 'Moderate rain'],
  [/Pluie forte/g, 'Heavy rain'],
  [/Averses/g, 'Showers'],
  [/Orage/g, 'Thunderstorm'],
  [/Neige/g, 'Snow'],
  [/Grêle/g, 'Hail'],
];

const originalTextNodes = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Record<string, string>>();
let currentNativeLang: NativeSiteLang = 'fr';
let domObserver: MutationObserver | null = null;
let isApplyingTranslation = false;

function translateStringToEn(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return input;
  if (FR_TO_EN_EXACT[trimmed]) {
    return input.replace(trimmed, FR_TO_EN_EXACT[trimmed]);
  }
  let out = input;
  for (const [regex, replacement] of FR_TO_EN_FRAGMENTS) {
    out = out.replace(regex, replacement);
  }
  return out;
}

function processNodeForLanguage(root: Node, lang: NativeSiteLang) {
  if (typeof document === 'undefined') return;
  isApplyingTranslation = true;
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.closest('#google-translate-custom-control')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      textNodes.push(current as Text);
      current = walker.nextNode();
    }

    for (const tNode of textNodes) {
      const val = tNode.nodeValue || '';
      if (!val.trim()) continue;

      if (lang === 'en') {
        if (!originalTextNodes.has(tNode)) {
          originalTextNodes.set(tNode, val);
        }
        const sourceFr = originalTextNodes.get(tNode) ?? val;
        const translated = translateStringToEn(sourceFr);
        if (tNode.nodeValue !== translated) {
          tNode.nodeValue = translated;
        }
      } else {
        if (originalTextNodes.has(tNode)) {
          const orig = originalTextNodes.get(tNode)!;
          if (tNode.nodeValue !== orig) {
            tNode.nodeValue = orig;
          }
        }
      }
    }

    if (root instanceof Element || root instanceof Document) {
      const elements = (root as ParentNode).querySelectorAll?.('[placeholder], [title], [aria-label]') || [];
      elements.forEach((el) => {
        if (el.closest('#google-translate-custom-control')) return;
        const attrs = ['placeholder', 'title', 'aria-label'];
        let saved = originalAttributes.get(el);
        if (!saved) {
          saved = {};
          originalAttributes.set(el, saved);
        }
        for (const attr of attrs) {
          const curVal = el.getAttribute(attr);
          if (!curVal) continue;
          if (lang === 'en') {
            if (!(attr in saved)) {
              saved[attr] = curVal;
            }
            const translated = translateStringToEn(saved[attr]);
            if (curVal !== translated) {
              el.setAttribute(attr, translated);
            }
          } else {
            if (attr in saved && curVal !== saved[attr]) {
              el.setAttribute(attr, saved[attr]);
            }
          }
        }
      });
    }
  } finally {
    isApplyingTranslation = false;
  }
}

export function getNativeSiteLanguage(): NativeSiteLang {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const hl = params.get('hl') || params.get('lang');
    if (hl === 'en') return 'en';
  }
  return currentNativeLang;
}

export function applyNativeSiteLanguage(lang: NativeSiteLang): void {
  currentNativeLang = lang;
  if (typeof document === 'undefined') return;

  document.documentElement.lang = lang;
  processNodeForLanguage(document.body, lang);

  if (lang === 'en') {
    if (!domObserver) {
      domObserver = new MutationObserver((mutations) => {
        if (isApplyingTranslation || currentNativeLang !== 'en') return;
        for (const m of mutations) {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) {
              processNodeForLanguage(n, 'en');
            }
          });
        }
      });
      domObserver.observe(document.body, { childList: true, subtree: true });
    }
  } else {
    if (domObserver) {
      domObserver.disconnect();
      domObserver = null;
    }
  }

  window.dispatchEvent(new CustomEvent('instant_meteo_native_lang_change', { detail: { lang } }));
}
