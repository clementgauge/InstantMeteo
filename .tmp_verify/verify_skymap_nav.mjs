import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const URL = 'http://localhost:3000/skymap';

const CURVY_COORDS = [
  [2.3212, 48.8656],
  [2.3175, 48.8668],
  [2.3125, 48.8686],
  [2.3075, 48.8705],
  [2.3018, 48.8726],
  [2.2975, 48.8738],
  [2.2950, 48.8738],
  [2.2952, 48.8710],
  [2.2978, 48.8685],
  [2.3010, 48.8662]
];

function makeOsrmPayload(mode, { motorwayOnly = false } = {}) {
  const steps = CURVY_COORDS.slice(0, -1).map((pt, i) => ({
    distance: 420,
    duration: mode === 'foot' ? 300 : mode === 'bike' ? 100 : 35,
    name: motorwayOnly ? 'A86 Autoroute du Soleil' : (i < 5 ? 'Avenue des Champs-Élysées' : 'Avenue Marceau'),
    ref: motorwayOnly ? 'A86' : '',
    classes: motorwayOnly ? ['motorway'] : [],
    maneuver: {
      type: i === 0 ? 'depart' : (i === 5 ? 'turn' : 'continue'),
      modifier: i === 5 ? 'left' : 'straight',
      location: pt
    }
  }));
  steps.push({
    distance: 0,
    duration: 0,
    name: 'Pont de l’Alma',
    classes: [],
    maneuver: { type: 'arrive', location: CURVY_COORDS[CURVY_COORDS.length - 1] }
  });
  return {
    code: 'Ok',
    routes: [{
      distance: 3800,
      duration: mode === 'foot' ? 2736 : mode === 'bike' ? 912 : 340,
      geometry: { type: 'LineString', coordinates: CURVY_COORDS },
      legs: [{ steps, summary: motorwayOnly ? 'A86' : 'Avenue des Champs-Élysées' }]
    }],
    waypoints: [
      { distance: 2, location: CURVY_COORDS[0] },
      { distance: 2, location: CURVY_COORDS[CURVY_COORDS.length - 1] }
    ]
  };
}

let mockWeatherState = { is_day: 1, temp: 18, code: 61, rain: 1.2, wind: 42 };
let forceMotorwayForBike = false;
const requestedRouteUrls = [];

const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox']
});

const context = await browser.newContext({ viewport: { width: 1366, height: 860 } });

await context.addInitScript(() => {
  const watchers = new Map();
  let nextId = 1;
  let current = {
    coords: { latitude: 48.8656, longitude: 2.3212, accuracy: 6, heading: 292, speed: 12, altitude: null, altitudeAccuracy: null },
    timestamp: Date.now()
  };
  window.__pushGps = (patch) => {
    current = { coords: { ...current.coords, ...patch }, timestamp: Date.now() };
    for (const cb of watchers.values()) { try { cb.ok(current); } catch (_) {} }
  };
  const geo = {
    getCurrentPosition(ok) { setTimeout(() => ok({ ...current, timestamp: Date.now() }), 20); },
    watchPosition(ok, err) {
      const id = nextId++;
      watchers.set(id, { ok, err });
      setTimeout(() => ok({ ...current, timestamp: Date.now() }), 20);
      return id;
    },
    clearWatch(id) { watchers.delete(id); }
  };
  Object.defineProperty(navigator, 'geolocation', { value: geo, configurable: true });
});

const page = await context.newPage();
const waitEl = async (sel, ms = 15000) => {
  const t = Date.now();
  while (Date.now() - t < ms) {
    const ok = await page.evaluate(s => {
      const el = document.querySelector(s);
      if (!el) return false;
      const st = getComputedStyle(el);
      return !el.closest("[hidden]") && st.display !== "none" && st.visibility !== "hidden";
    }, sel).catch(() => false);
    if (ok) return;
    await page.waitForTimeout(100);
  }
  throw new Error("waitEl timeout " + sel);
};
const fillEl = async (sel, val) => {
  await waitEl(sel);
  await page.evaluate(([s, v]) => {
    const el = document.querySelector(s);
    el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, [sel, val]);
};
const clickEl = async sel => { const t = Date.now(); while (Date.now() - t < 15000) { const ok = await page.evaluate(s => { const el = document.querySelector(s); if (!el) return false; el.click(); return true; }, sel).catch(() => false); if (ok) return; await page.waitForTimeout(100); } throw new Error("clickEl timeout " + sel); };
const consoleErrors = [];
const pageErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => { pageErrors.push(err.message); if (pageErrors.length <= 3) console.error('PAGEERROR_STACK:', err.stack); });

await page.route('**/*', async route => {
  const url = route.request().url();
  if (url.includes('nominatim.openstreetmap.org/search')) {
    const q = new globalThis.URL(url).searchParams.get('q') || '';
    const isEnd = q.toLowerCase().includes('alma');
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([{
        display_name: isEnd ? 'Pont de l’Alma, Paris, France' : 'Place de la Concorde, Paris, France',
        name: isEnd ? 'Pont de l’Alma' : 'Place de la Concorde',
        lat: isEnd ? '48.8662' : '48.8656',
        lon: isEnd ? '2.3010' : '2.3212',
        address: { road: isEnd ? 'Pont de l’Alma' : 'Place de la Concorde', city: 'Paris', country: 'France' }
      }])
    });
  }
  if (url.includes('nominatim.openstreetmap.org/reverse')) {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ name: 'Avenue des Champs-Élysées', address: { road: 'Avenue des Champs-Élysées', city: 'Paris' } })
    });
  }
  if (url.includes('api.open-meteo.com')) {
    const u = new globalThis.URL(url);
    const lats = (u.searchParams.get('latitude') || '48.8656').split(',');
    const one = () => ({
      latitude: 48.8656, longitude: 2.3212, utc_offset_seconds: 3600, timezone: 'Europe/Paris',
      current: {
        time: '2026-11-16T14:25', interval: 900,
        temperature_2m: mockWeatherState.temp, apparent_temperature: mockWeatherState.temp - 1,
        is_day: mockWeatherState.is_day, weather_code: mockWeatherState.code,
        precipitation: mockWeatherState.rain / 4, rain: mockWeatherState.rain / 4, showers: 0,
        cloud_cover: mockWeatherState.code >= 51 ? 82 : 35, pressure_msl: 1012, relative_humidity_2m: 78,
        wind_speed_10m: mockWeatherState.wind, wind_direction_10m: 260, wind_gusts_10m: mockWeatherState.wind + 14,
        uv_index: mockWeatherState.is_day ? 2.1 : 0, visibility: 9500
      },
      hourly: {
        time: Array.from({ length: 24 }, (_, h) => `2026-11-16T${String(h).padStart(2, '0')}:00`),
        temperature_2m: Array(24).fill(mockWeatherState.temp),
        weather_code: Array(24).fill(mockWeatherState.code),
        is_day: Array(24).fill(mockWeatherState.is_day),
        precipitation_probability: Array(24).fill(mockWeatherState.rain > 0 ? 75 : 10),
        precipitation: Array(24).fill(mockWeatherState.rain),
        wind_speed_10m: Array(24).fill(mockWeatherState.wind)
      },
      daily: {
        time: ['2026-11-16', '2026-11-17', '2026-11-18'],
        weather_code: [mockWeatherState.code, 2, 1],
        temperature_2m_max: [mockWeatherState.temp + 2, 19, 17],
        temperature_2m_min: [mockWeatherState.temp - 5, 11, 10],
        sunrise: ['2026-11-16T07:58', '2026-11-17T08:00', '2026-11-18T08:01'],
        sunset: ['2026-11-16T17:08', '2026-11-17T17:07', '2026-11-18T17:05'],
        precipitation_probability_max: [80, 30, 15], wind_speed_10m_max: [mockWeatherState.wind, 20, 15]
      },
      minutely_15: {
        time: Array.from({ length: 8 }, (_, k) => `2026-11-16T14:${String((k * 15) % 60).padStart(2, '0')}`),
        precipitation: Array(8).fill(mockWeatherState.rain / 4),
        weather_code: Array(8).fill(mockWeatherState.code)
      }
    });
    const body = lats.length > 1 ? lats.map(() => one()) : one();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  }
  if (url.includes('air-quality-api.open-meteo.com')) {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ current: { european_aqi: 28 } }) });
  }
  if (url.includes('router.project-osrm.org')) {
    requestedRouteUrls.push({ mode: 'car-osrm', url });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeOsrmPayload('car')) });
  }
  if (url.includes('routing.openstreetmap.de/routed-bike')) {
    requestedRouteUrls.push({ mode: 'bike-fossgis', url });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeOsrmPayload('bike', { motorwayOnly: forceMotorwayForBike })) });
  }
  if (url.includes('routing.openstreetmap.de/routed-foot')) {
    requestedRouteUrls.push({ mode: 'foot-fossgis', url });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeOsrmPayload('foot')) });
  }
  if (url.includes('valhalla1.openstreetmap.de/route')) {
    requestedRouteUrls.push({ mode: 'valhalla-fallback', url });
    if (forceMotorwayForBike) return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'No bike path' }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ trip: { summary: { length: 3.8, time: 912 }, legs: [] } }) });
  }
  if (url.includes('api.rainviewer.com')) {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        host: 'https://tilecache.rainviewer.com',
        radar: { past: [{ time: Math.floor(Date.now() / 1000) - 300, path: '/v2/radar/nowcast_test' }], nowcast: [] }
      })
    });
  }
  return route.continue();
});

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
await waitEl('.maplibregl-canvas', 20000);
await page.waitForTimeout(2500);

await clickEl('#routeBtn');
await fillEl('#routeFrom', 'Concorde Paris');
await clickEl('#searchFrom');
await waitEl('#routeSearchResults:not([hidden]) button', 20000);
await clickEl('#routeSearchResults button');

await fillEl('#routeTo', 'Pont de l’Alma Paris');
await clickEl('#searchTo');
await waitEl('#routeSearchResults:not([hidden]) button', 20000);
await clickEl('#routeSearchResults button');

await clickEl('#routeCalculate');
await waitEl('#routeResults:not([hidden])', 20000);
const carCalcText = (await page.textContent('#routeDuration'))?.trim();
console.log('1) Route calculated (Car):', carCalcText);

await clickEl('#startDriving');
await waitEl('#driveHUD:not([hidden])', 20000);
await page.waitForTimeout(1800);

const dayState = await page.evaluate(() => ({
  drivingMode: document.getElementById('app').classList.contains('driving-mode'),
  drivingDay: document.getElementById('app').classList.contains('driving-day'),
  drivingNight: document.getElementById('app').classList.contains('driving-night'),
  radarPressed: document.getElementById('carDockRadar').getAttribute('aria-pressed'),
  hasMarker: !!document.querySelector('.gps-marker')
}));
console.log('2) Day Mode State:', dayState);
if (!dayState.drivingMode || !dayState.drivingDay || dayState.drivingNight || dayState.radarPressed !== 'true') {
  throw new Error('Day mode assertion failed: ' + JSON.stringify(dayState));
}
await page.screenshot({ path: '.tmp_verify/verify-day.png', animations: 'disabled', timeout: 60000 });

// TEST 1: Curvy Simulation ("Aperçu") progression
await clickEl('#carSimBtn');
await page.waitForTimeout(1600);
const sim1 = await page.evaluate(() => ({
  rem: document.getElementById('driveRemaining').textContent.trim(),
  stepDist: document.getElementById('carStepDist').textContent.trim(),
  tr: document.querySelector('.gps-marker')?.style.transform || ''
}));
await page.waitForTimeout(4500);
const sim2 = await page.evaluate(() => ({
  rem: document.getElementById('driveRemaining').textContent.trim(),
  stepDist: document.getElementById('carStepDist').textContent.trim(),
  tr: document.querySelector('.gps-marker')?.style.transform || ''
}));
console.log('3) Sim Progression:', { sim1, sim2 });
if (sim1.rem === sim2.rem && sim1.stepDist === sim2.stepDist) {
  throw new Error('Expected simulation progress to change remaining distance/step distance');
}
await clickEl('#carSimBtn');
await page.waitForTimeout(300);

// 10m lateral offset map matching + noisy heading check
await page.evaluate(() => {
  window.__pushGps({ latitude: 48.86955, longitude: 2.3100, accuracy: 5, heading: 299, speed: 12 });
});
await page.waitForTimeout(1200);
const exactPose = await page.evaluate(() => {
  const m = document.querySelector('.gps-marker');
  const r = m.getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, transform: m.style.transform, rem: document.getElementById('driveRemaining').textContent };
});
await page.evaluate(() => {
  window.__pushGps({ latitude: 48.86955 + 0.00009, longitude: 2.3100, accuracy: 5, heading: 325, speed: 12 });
});
await page.waitForTimeout(1200);
const offsetPose = await page.evaluate(() => {
  const m = document.querySelector('.gps-marker');
  const r = m.getBoundingClientRect();
  const tr = m.style.transform;
  const rotMatch = tr.match(/rotateZ\(([-0-9.]+)deg\)/);
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, rot: rotMatch ? parseFloat(rotMatch[1]) : null, transform: tr };
});
console.log('4) 10m Lateral Offset Marker Pose:', { exactPose, offsetPose });
if (!offsetPose.transform || offsetPose.cx < 0 || offsetPose.cy < 0) {
  throw new Error('Marker lost after 10m lateral offset');
}

// Monotonic check
const distBeforeBack = await page.textContent('#carDistRemain');
await page.evaluate(() => {
  window.__pushGps({ latitude: 48.8686, longitude: 2.3125, accuracy: 5, heading: 299, speed: 12 });
});
await page.waitForTimeout(400);
const distAfterBack = await page.textContent('#carDistRemain');
console.log('5) Monotonic guard (#carDistRemain):', { distBeforeBack, distAfterBack });
const parseDistM = s => s.includes('km') ? parseFloat(s.replace(',', '.')) * 1000 : parseFloat(s);
if (parseDistM(distAfterBack) > parseDistM(distBeforeBack) + 15) {
  throw new Error('Distance remaining jumped backwards on noisy earlier GPS point!');
}

// TEST 2: Drag pause + Auto-recenter
const box = await page.locator('#map').boundingBox();
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.5 + 180, box.y + box.height * 0.5 + 110, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(300);
const pausedAfterDrag = await page.evaluate(() => document.getElementById('driveRecenter').classList.contains('paused'));
console.log('6) Recenter paused after drag:', pausedAfterDrag);
if (!pausedAfterDrag) throw new Error('Expected #driveRecenter to have .paused class after dragging map');
await page.waitForTimeout(6800);
const resumedAfterWait = await page.evaluate(() => !document.getElementById('driveRecenter').classList.contains('paused'));
console.log('7) Auto-recenter resumed after ~6.8s:', resumedAfterWait);
if (!resumedAfterWait) throw new Error('Expected auto-recenter to resume follow after ~6.5s');

// TEST 3: High speed (100 km/h)
await page.evaluate(() => {
  window.__pushGps({ latitude: 48.8705, longitude: 2.3075, accuracy: 5, heading: 299, speed: 27.8 });
});
await page.waitForTimeout(1000);
const speedFraming = await page.evaluate(() => {
  const m = document.querySelector('.gps-marker').getBoundingClientRect();
  const mapR = document.getElementById('map').getBoundingClientRect();
  const cx = m.left + m.width / 2, cy = m.top + m.height / 2;
  return { cx, cy, w: mapR.width, h: mapR.height, inView: cx >= 0 && cx <= mapR.width && cy >= 0 && cy <= mapR.height };
});
console.log('8) 100 km/h Framing:', speedFraming);
if (!speedFraming.inView) throw new Error('Vehicle went out of viewport at 100 km/h');

// TEST 4: Bike mode + alert + motorway rejection + Foot mode + 35 km/h prompt
await clickEl('#carModeSwitch [data-mode="bike"]');
await page.waitForTimeout(1200);
const bikeCheck = await page.evaluate(() => ({
  badge: document.getElementById('carWxModeBadge').textContent.trim(),
  dur: document.getElementById('carDurRemain').textContent.trim(),
  alert: document.getElementById('carAlertText').textContent.trim(),
  markerBikeClass: document.querySelector('.gps-marker').classList.contains('mode-bike')
}));
console.log('9) Bike Mode State:', bikeCheck);
if (bikeCheck.badge !== 'Vélo' || !bikeCheck.markerBikeClass || !bikeCheck.alert.toLowerCase().includes('vélo')) {
  throw new Error('Bike mode UI/alert/marker check failed: ' + JSON.stringify(bikeCheck));
}

forceMotorwayForBike = true;
await clickEl('#carModeSwitch [data-mode="car"]');
await page.waitForTimeout(600);
await clickEl('#carModeSwitch [data-mode="bike"]');
await page.waitForTimeout(1000);
const bikeRejectInst = (await page.textContent('#driveInstruction'))?.trim();
console.log('10) Bike motorway rejection:', bikeRejectInst);
if (!bikeRejectInst.includes('Aucun itinéraire à vélo possible')) {
  throw new Error('Expected bike rejection message, got: ' + bikeRejectInst);
}
forceMotorwayForBike = false;

await clickEl('#carModeSwitch [data-mode="foot"]');
await page.waitForTimeout(1000);
await page.evaluate(() => { window.__pushGps({ latitude: 48.8705, longitude: 2.3075, accuracy: 5, heading: 299, speed: 9.72 }); });
await page.waitForTimeout(250);
await page.evaluate(() => { window.__pushGps({ latitude: 48.8706, longitude: 2.3072, accuracy: 5, heading: 299, speed: 9.8 }); });
await page.waitForTimeout(250);
const footPrompt = await page.evaluate(() => ({
  badge: document.getElementById('carWxModeBadge').textContent.trim(),
  markerFoot: document.querySelector('.gps-marker').classList.contains('mode-foot'),
  promptHidden: document.getElementById('carModePrompt').hidden,
  promptText: document.getElementById('carModePromptText').textContent
}));
console.log('11) Foot Mode + 35 km/h Suggestion:', footPrompt);
if (footPrompt.badge !== 'Piéton' || !footPrompt.markerFoot || footPrompt.promptHidden) {
  throw new Error('Foot mode or speed prompt failed: ' + JSON.stringify(footPrompt));
}

// TEST 5B: Real NIGHT mode (is_day = 0, storm)
mockWeatherState = { is_day: 0, temp: 8, code: 95, rain: 4.5, wind: 48 };
await clickEl('#carModeSwitch [data-mode="car"]');
await page.waitForTimeout(800);
await clickEl('#carDockSettings');
await waitEl('#bRefresh', 20000);
await clickEl('#bRefresh');
await page.waitForTimeout(1500);
await page.keyboard.press('Escape');
await page.waitForTimeout(800);

const nightState = await page.evaluate(() => ({
  drivingDay: document.getElementById('app').classList.contains('driving-day'),
  drivingNight: document.getElementById('app').classList.contains('driving-night'),
  modalOpen: document.getElementById('modal').classList.contains('open')
}));
console.log('12) Night Mode State:', nightState);
if (!nightState.drivingNight || nightState.drivingDay) {
  throw new Error('Expected driving-night after is_day=0 refresh: ' + JSON.stringify(nightState));
}
await page.screenshot({ path: '.tmp_verify/verify-night.png', animations: 'disabled', timeout: 60000 });

// Mobile viewport (390x844)
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(900);
await page.screenshot({ path: '.tmp_verify/verify-mobile.png', animations: 'disabled', timeout: 60000 });

const nonCarUsedPublicOsrm = requestedRouteUrls.filter(r => r.mode !== 'car-osrm').some(r => r.url.includes('router.project-osrm.org'));
console.log('13) Routing Endpoints Requested:', requestedRouteUrls.map(r => r.mode));
if (nonCarUsedPublicOsrm || !requestedRouteUrls.some(r => r.mode === 'bike-fossgis') || !requestedRouteUrls.some(r => r.mode === 'foot-fossgis')) {
  throw new Error('Routing provider isolation check failed');
}

console.log('Console errors:', consoleErrors.length);
console.log('Page errors:', pageErrors.length, pageErrors);
if (pageErrors.length) throw new Error('PageErrors detected: ' + pageErrors.slice(0, 3).join(' | '));

await browser.close();
