import L from 'leaflet';
import {
  SpatialFieldKey,
  SpatialGridData,
  sampleGridBilinear,
  sampleGridBicubic
} from '../services/radarGridService';
import { ColorScaleSpec } from './weatherColorScales';

export interface WeatherCanvasRenderConfig {
  grid: SpatialGridData | null;
  hourIndex: number;
  scale: ColorScaleSpec;
  opacity: number;
  showColorField: boolean;
  showIsolines: boolean;
  showGraticule: boolean;
  showWindParticles: boolean;
  darkBasemap: boolean;
}

interface PlacedLabel {
  x: number;
  y: number;
}

interface WindParticle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

/**
 * Custom Leaflet Overlay Manager that renders:
 * 1. Smooth bicubic meteorological color fields (no blocky tiles or circles)
 * 2. Marching-Squares contour isolines (isotherms, isobars) + A/D pressure centers + optional Lat/Lon graticule
 * 3. 60fps GPU-smooth animated wind particle streamlines (zero Windy)
 */
export class WeatherScientificCanvasEngine {
  private map: L.Map;
  private fieldCanvas: HTMLCanvasElement;
  private fieldCtx: CanvasRenderingContext2D | null;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D | null;

  private isolineCanvas: HTMLCanvasElement;
  private isolineCtx: CanvasRenderingContext2D | null;

  private windCanvas: HTMLCanvasElement;
  private windCtx: CanvasRenderingContext2D | null;

  private config: WeatherCanvasRenderConfig;
  private particles: WindParticle[] = [];
  private rafId: number | null = null;
  private isMoving = false;
  private prefersReducedMotion = false;

  constructor(map: L.Map, initialConfig: WeatherCanvasRenderConfig) {
    this.map = map;
    this.config = initialConfig;
    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Create dedicated panes with deterministic Z-index stacking
    const ensurePane = (name: string, zIndex: number) => {
      if (!map.getPane(name)) {
        const p = map.createPane(name);
        p.style.zIndex = String(zIndex);
        p.style.pointerEvents = 'none';
      }
      return map.getPane(name)!;
    };

    const fieldPane = ensurePane('weatherFieldPane', 350);
    const windPane = ensurePane('windParticlesPane', 385);
    const isolinesPane = ensurePane('weatherIsolinesPane', 435);

    const makeCanvas = (pane: HTMLElement) => {
      const c = document.createElement('canvas');
      c.style.position = 'absolute';
      c.style.top = '0';
      c.style.left = '0';
      c.style.pointerEvents = 'none';
      pane.appendChild(c);
      return c;
    };

    this.fieldCanvas = makeCanvas(fieldPane);
    this.fieldCtx = this.fieldCanvas.getContext('2d');
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    this.windCanvas = makeCanvas(windPane);
    this.windCtx = this.windCanvas.getContext('2d');

    this.isolineCanvas = makeCanvas(isolinesPane);
    this.isolineCtx = this.isolineCanvas.getContext('2d');

    this.handleResize();
    this.bindMapEvents();
    this.redrawStaticLayers();
    this.syncWindAnimationLoop();
  }

  private onMoveStart = () => {
    this.isMoving = true;
    this.clearWindCanvas();
  };

  private onMoveEnd = () => {
    this.isMoving = false;
    this.alignCanvasesToMapPane();
    this.redrawStaticLayers();
  };

  private onResize = () => {
    this.handleResize();
    this.redrawStaticLayers();
  };

  private bindMapEvents() {
    this.map.on('movestart zoomstart', this.onMoveStart);
    this.map.on('moveend zoomend viewreset', this.onMoveEnd);
    this.map.on('resize', this.onResize);
  }

  public updateConfig(next: WeatherCanvasRenderConfig) {
    const prevShowWind = this.config.showWindParticles;
    const prevGrid = this.config.grid;
    const prevHour = this.config.hourIndex;
    const prevMode = this.config.scale.mode;
    const prevShowField = this.config.showColorField;
    const prevIsolines = this.config.showIsolines;
    const prevGraticule = this.config.showGraticule;
    const prevOpacity = this.config.opacity;
    const prevDark = this.config.darkBasemap;

    this.config = next;

    const staticChanged =
      prevGrid !== next.grid ||
      prevHour !== next.hourIndex ||
      prevMode !== next.scale.mode ||
      prevShowField !== next.showColorField ||
      prevIsolines !== next.showIsolines ||
      prevGraticule !== next.showGraticule ||
      prevOpacity !== next.opacity ||
      prevDark !== next.darkBasemap;

    if (staticChanged) {
      this.redrawStaticLayers();
    }

    if (prevShowWind !== next.showWindParticles || prevGrid !== next.grid) {
      this.syncWindAnimationLoop();
    }
  }

  private alignCanvasesToMapPane() {
    const topLeft = this.map.containerPointToLayerPoint([0, 0]);
    for (const c of [this.fieldCanvas, this.windCanvas, this.isolineCanvas]) {
      L.DomUtil.setPosition(c, topLeft);
    }
  }

  private handleResize() {
    const size = this.map.getSize();
    const w = Math.max(1, size.x);
    const h = Math.max(1, size.y);

    for (const c of [this.fieldCanvas, this.windCanvas, this.isolineCanvas]) {
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
    }

    this.alignCanvasesToMapPane();
    this.initWindParticles();
  }

  private initWindParticles() {
    const size = this.map.getSize();
    const area = size.x * size.y;
    const targetCount = Math.min(1100, Math.max(400, Math.round(area / 750)));
    this.particles = Array.from({ length: targetCount }, () => ({
      x: Math.random() * size.x,
      y: Math.random() * size.y,
      age: Math.floor(Math.random() * 65),
      maxAge: 55 + Math.floor(Math.random() * 45)
    }));
  }

  public redrawStaticLayers() {
    this.alignCanvasesToMapPane();
    this.renderColorField();
    this.renderIsolinesAndGraticule();
  }

  private renderColorField() {
    if (!this.fieldCtx || !this.offscreenCtx) return;
    const w = this.fieldCanvas.width;
    const h = this.fieldCanvas.height;
    this.fieldCtx.clearRect(0, 0, w, h);

    const { grid, hourIndex, scale, opacity, showColorField } = this.config;
    if (!grid || !showColorField || w < 4 || h < 4) return;

    // Sample at 1/4 resolution (~4px stride) and upscale with smooth bicubic hardware compositing
    const stride = 4;
    const sw = Math.max(8, Math.ceil(w / stride));
    const sh = Math.max(8, Math.ceil(h / stride));

    if (this.offscreenCanvas.width !== sw || this.offscreenCanvas.height !== sh) {
      this.offscreenCanvas.width = sw;
      this.offscreenCanvas.height = sh;
    }

    // Precompute latitude per row & longitude per column (exact Web Mercator inverse)
    const colLons = new Float64Array(sw);
    const rowLats = new Float64Array(sh);
    for (let cx = 0; cx < sw; cx++) {
      colLons[cx] = this.map.containerPointToLatLng([cx * stride + stride * 0.5, 0]).lng;
    }
    for (let cy = 0; cy < sh; cy++) {
      rowLats[cy] = this.map.containerPointToLatLng([0, cy * stride + stride * 0.5]).lat;
    }

    const imgData = this.offscreenCtx.createImageData(sw, sh);
    const pixels = imgData.data;
    const lut = scale.lut;
    const min = scale.min;
    const invRange = 255 / Math.max(1e-6, scale.max - min);
    const fieldKey = scale.field;
    const clampZero = !!scale.clampMinZero;

    for (let cy = 0; cy < sh; cy++) {
      const lat = rowLats[cy];
      const inLat = lat >= grid.latMin && lat <= grid.latMax;
      for (let cx = 0; cx < sw; cx++) {
        const pIdx = (cy * sw + cx) * 4;
        const lon = colLons[cx];
        if (!inLat || lon < grid.lonMin || lon > grid.lonMax) {
          pixels[pIdx + 3] = 0;
          continue;
        }

        const val = sampleGridBicubic(grid, hourIndex, fieldKey, lat, lon, clampZero);
        const lutIdx = Math.max(0, Math.min(255, Math.round((val - min) * invRange))) * 4;

        pixels[pIdx] = lut[lutIdx];
        pixels[pIdx + 1] = lut[lutIdx + 1];
        pixels[pIdx + 2] = lut[lutIdx + 2];
        pixels[pIdx + 3] = lut[lutIdx + 3];
      }
    }

    this.offscreenCtx.putImageData(imgData, 0, 0);

    this.fieldCtx.save();
    this.fieldCtx.globalAlpha = Math.max(0.1, Math.min(1, opacity));
    this.fieldCtx.imageSmoothingEnabled = true;
    this.fieldCtx.imageSmoothingQuality = 'high';
    this.fieldCtx.drawImage(this.offscreenCanvas, 0, 0, sw, sh, 0, 0, w, h);
    this.fieldCtx.restore();
  }

  private renderIsolinesAndGraticule() {
    if (!this.isolineCtx) return;
    const ctx = this.isolineCtx;
    const w = this.isolineCanvas.width;
    const h = this.isolineCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const { grid, hourIndex, scale, showIsolines, showGraticule, darkBasemap, showColorField } = this.config;

    // 1. Optional Dotted Geographic Lat/Lon Graticule (Meteociel / ECMWF reference grid)
    if (showGraticule && w > 20 && h > 20) {
      const bounds = this.map.getBounds();
      const latSpan = bounds.getNorth() - bounds.getSouth();
      const stepDeg = latSpan > 28 ? 5 : latSpan > 12 ? 2 : latSpan > 5 ? 1 : 0.5;

      const latStart = Math.ceil(bounds.getSouth() / stepDeg) * stepDeg;
      const lonStart = Math.ceil(bounds.getWest() / stepDeg) * stepDeg;

      ctx.save();
      ctx.strokeStyle = darkBasemap ? 'rgba(148, 163, 184, 0.25)' : 'rgba(51, 65, 85, 0.22)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.font = '600 10px "Plus Jakarta Sans", monospace';
      ctx.fillStyle = darkBasemap ? 'rgba(203, 213, 225, 0.65)' : 'rgba(30, 41, 59, 0.65)';

      for (let lat = latStart; lat <= bounds.getNorth(); lat += stepDeg) {
        const pt = this.map.latLngToContainerPoint([lat, bounds.getWest()]);
        ctx.beginPath();
        ctx.moveTo(0, pt.y);
        ctx.lineTo(w, pt.y);
        ctx.stroke();
        if (pt.y > 60 && pt.y < h - 80) {
          ctx.fillText(`${lat.toFixed(stepDeg < 1 ? 1 : 0)}°N`, 8, pt.y - 4);
        }
      }

      for (let lon = lonStart; lon <= bounds.getEast(); lon += stepDeg) {
        const pt = this.map.latLngToContainerPoint([bounds.getNorth(), lon]);
        ctx.beginPath();
        ctx.moveTo(pt.x, 0);
        ctx.lineTo(pt.x, h);
        ctx.stroke();
        if (pt.x > 70 && pt.x < w - 70) {
          const ew = lon >= 0 ? `${Math.abs(lon).toFixed(stepDeg < 1 ? 1 : 0)}°E` : `${Math.abs(lon).toFixed(stepDeg < 1 ? 1 : 0)}°O`;
          ctx.fillText(ew, pt.x + 4, 68);
        }
      }
      ctx.restore();
    }

    if (!grid || !showIsolines) return;

    const step = scale.isolineStep;
    if (!step) return;

    // 2. Build scalar screen-space grid for crisp Marching Squares contour extraction
    const cell = 14;
    const cols = Math.ceil(w / cell) + 1;
    const rows = Math.ceil(h / cell) + 1;
    const colLons = new Float64Array(cols);
    const rowLats = new Float64Array(rows);

    for (let c = 0; c < cols; c++) {
      colLons[c] = this.map.containerPointToLatLng([c * cell, 0]).lng;
    }
    for (let r = 0; r < rows; r++) {
      rowLats[r] = this.map.containerPointToLatLng([0, r * cell]).lat;
    }

    const values = new Float32Array(rows * cols);
    let minVal = Infinity;
    let maxVal = -Infinity;
    const fieldKey: SpatialFieldKey = scale.field;

    for (let r = 0; r < rows; r++) {
      const lat = rowLats[r];
      for (let c = 0; c < cols; c++) {
        const lon = colLons[c];
        const v = sampleGridBicubic(grid, hourIndex, fieldKey, lat, lon, !!scale.clampMinZero);
        values[r * cols + c] = v;
        if (lat >= grid.latMin && lat <= grid.latMax && lon >= grid.lonMin && lon <= grid.lonMax) {
          if (v < minVal) minVal = v;
          if (v > maxVal) maxVal = v;
        }
      }
    }

    if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) return;

    const firstLevel = Math.ceil(minVal / step) * step;
    const levels: number[] = [];
    for (let lv = firstLevel; lv <= maxVal; lv += step) {
      // Avoid noisy 0 isoline on precip/CAPE
      if ((fieldKey === 'precip' || fieldKey === 'cape' || fieldKey === 'snow') && lv <= 0.01) continue;
      levels.push(Number(lv.toFixed(2)));
    }

    const placedLabels: PlacedLabel[] = [];
    const majorStep = scale.isolineMajorStep || step * 2;
    const isLightSurface = !darkBasemap || showColorField;

    const strokeIso = (isMajor: boolean) => {
      if (fieldKey === 'pressure') {
        return darkBasemap && !showColorField
          ? isMajor ? 'rgba(248, 250, 252, 0.9)' : 'rgba(203, 213, 225, 0.65)'
          : isMajor ? 'rgba(15, 23, 42, 0.9)' : 'rgba(30, 41, 59, 0.55)';
      }
      return isLightSurface
        ? isMajor ? 'rgba(15, 23, 42, 0.72)' : 'rgba(15, 23, 42, 0.36)'
        : isMajor ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.35)';
    };

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 11px "JetBrains Mono", "Plus Jakarta Sans", monospace';

    const lerpPt = (
      x1: number,
      y1: number,
      v1: number,
      x2: number,
      y2: number,
      v2: number,
      target: number
    ): [number, number] => {
      const denom = v2 - v1;
      const t = Math.abs(denom) < 1e-6 ? 0.5 : (target - v1) / denom;
      const ct = Math.max(0, Math.min(1, t));
      return [x1 + (x2 - x1) * ct, y1 + (y2 - y1) * ct];
    };

    for (const level of levels) {
      const isMajor = Math.abs(Math.round(level / majorStep) * majorStep - level) < 0.05;
      ctx.strokeStyle = strokeIso(isMajor);
      ctx.lineWidth = isMajor ? 1.65 : 0.9;
      ctx.beginPath();

      const candidateLabelPts: PlacedLabel[] = [];

      for (let r = 0; r < rows - 1; r++) {
        const y0 = r * cell;
        const y1 = (r + 1) * cell;
        for (let c = 0; c < cols - 1; c++) {
          const x0 = c * cell;
          const x1 = (c + 1) * cell;

          const vTL = values[r * cols + c];
          const vTR = values[r * cols + (c + 1)];
          const vBR = values[(r + 1) * cols + (c + 1)];
          const vBL = values[(r + 1) * cols + c];

          const mask =
            (vTL >= level ? 8 : 0) |
            (vTR >= level ? 4 : 0) |
            (vBR >= level ? 2 : 0) |
            (vBL >= level ? 1 : 0);

          if (mask === 0 || mask === 15) continue;

          // Edge points: 0=Top, 1=Right, 2=Bottom, 3=Left
          const top = () => lerpPt(x0, y0, vTL, x1, y0, vTR, level);
          const right = () => lerpPt(x1, y0, vTR, x1, y1, vBR, level);
          const bottom = () => lerpPt(x0, y1, vBL, x1, y1, vBR, level);
          const left = () => lerpPt(x0, y0, vTL, x0, y1, vBL, level);

          const drawSeg = (a: [number, number], b: [number, number]) => {
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            if ((r + c) % 5 === 0) {
              candidateLabelPts.push({ x: (a[0] + b[0]) * 0.5, y: (a[1] + b[1]) * 0.5 });
            }
          };

          switch (mask) {
            case 1:
            case 14:
              drawSeg(left(), bottom());
              break;
            case 2:
            case 13:
              drawSeg(bottom(), right());
              break;
            case 3:
            case 12:
              drawSeg(left(), right());
              break;
            case 4:
            case 11:
              drawSeg(top(), right());
              break;
            case 5:
              drawSeg(top(), left());
              drawSeg(bottom(), right());
              break;
            case 6:
            case 9:
              drawSeg(top(), bottom());
              break;
            case 7:
            case 8:
              drawSeg(top(), left());
              break;
            case 10:
              drawSeg(top(), right());
              drawSeg(left(), bottom());
              break;
          }
        }
      }
      ctx.stroke();

      // Place crisp non-overlapping numeric contour labels along isolines
      if (isMajor || fieldKey === 'pressure' || fieldKey === 'temp2m' || fieldKey === 'temp850') {
        const labelStr = `${Math.round(level)}${scale.isolineLabelUnit || ''}`;
        for (const pt of candidateLabelPts) {
          if (pt.x < 75 || pt.x > w - 75 || pt.y < 75 || pt.y > h - 95) continue;
          const tooClose = placedLabels.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 115);
          if (tooClose) continue;

          placedLabels.push(pt);
          ctx.lineWidth = 3;
          ctx.strokeStyle = darkBasemap && !showColorField ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.88)';
          ctx.strokeText(labelStr, pt.x, pt.y);
          ctx.fillStyle = darkBasemap && !showColorField ? '#f8fafc' : '#0f172a';
          ctx.fillText(labelStr, pt.x, pt.y);
        }
      }
    }

    // 3. Draw synoptic D (Dépression) & A (Anticyclone) action centers in Pressure mode
    if (fieldKey === 'pressure') {
      const pArr = grid.fields.pressure[hourIndex];
      if (pArr) {
        const centers: { type: 'A' | 'D'; val: number; lat: number; lon: number }[] = [];
        for (let r = 1; r < grid.rows - 1; r++) {
          for (let c = 1; c < grid.cols - 1; c++) {
            const val = pArr[r * grid.cols + c];
            let isLocalMax = true;
            let isLocalMin = true;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nv = pArr[(r + dr) * grid.cols + (c + dc)];
                if (nv >= val) isLocalMax = false;
                if (nv <= val) isLocalMin = false;
              }
            }
            if (isLocalMax && val >= 1018) {
              centers.push({ type: 'A', val, lat: grid.latMin + r * grid.dLat, lon: grid.lonMin + c * grid.dLon });
            } else if (isLocalMin && val <= 1010) {
              centers.push({ type: 'D', val, lat: grid.latMin + r * grid.dLat, lon: grid.lonMin + c * grid.dLon });
            }
          }
        }

        centers.forEach((ctr) => {
          const pt = this.map.latLngToContainerPoint([ctr.lat, ctr.lon]);
          if (pt.x < 40 || pt.x > w - 40 || pt.y < 60 || pt.y > h - 80) return;

          ctx.font = '900 22px "Outfit", sans-serif';
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(255,255,255,0.92)';
          ctx.strokeText(ctr.type, pt.x, pt.y - 6);
          ctx.fillStyle = ctr.type === 'D' ? '#dc2626' : '#1d4ed8';
          ctx.fillText(ctr.type, pt.x, pt.y - 6);

          ctx.font = '800 11px "JetBrains Mono", monospace';
          const hpaText = `${Math.round(ctr.val)} hPa`;
          ctx.strokeText(hpaText, pt.x, pt.y + 11);
          ctx.fillStyle = '#0f172a';
          ctx.fillText(hpaText, pt.x, pt.y + 11);
        });
      }
    }

    ctx.restore();
  }

  private clearWindCanvas() {
    if (this.windCtx) {
      this.windCtx.clearRect(0, 0, this.windCanvas.width, this.windCanvas.height);
    }
  }

  private syncWindAnimationLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (!this.config.showWindParticles || !this.config.grid) {
      this.clearWindCanvas();
      return;
    }

    if (this.prefersReducedMotion) {
      this.drawStaticWindArrows();
      return;
    }

    const tick = () => {
      this.stepWindParticles();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private drawStaticWindArrows() {
    if (!this.windCtx || !this.config.grid) return;
    const ctx = this.windCtx;
    const w = this.windCanvas.width;
    const h = this.windCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const { grid, hourIndex, darkBasemap, showColorField } = this.config;
    ctx.strokeStyle = darkBasemap || showColorField ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.65)';
    ctx.lineWidth = 1.5;

    for (let y = 40; y < h - 40; y += 52) {
      for (let x = 40; x < w - 40; x += 52) {
        const ll = this.map.containerPointToLatLng([x, y]);
        if (ll.lat < grid.latMin || ll.lat > grid.latMax || ll.lng < grid.lonMin || ll.lng > grid.lonMax) continue;
        const u = sampleGridBilinear(grid, hourIndex, 'windU', ll.lat, ll.lng);
        const v = sampleGridBilinear(grid, hourIndex, 'windV', ll.lat, ll.lng);
        const spd = Math.hypot(u, v);
        if (spd < 1) continue;
        const len = Math.min(22, 6 + spd * 0.25);
        const dx = (u / spd) * len;
        const dy = (-v / spd) * len;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
      }
    }
  }

  private stepWindParticles() {
    if (this.isMoving || !this.windCtx || !this.config.grid) return;
    const ctx = this.windCtx;
    const w = this.windCanvas.width;
    const h = this.windCanvas.height;
    const { grid, hourIndex, darkBasemap, showColorField } = this.config;

    // Fade previous trails smoothly
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.90)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    const bounds = this.map.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const latSpan = Math.max(0.1, north - south);
    const lonSpan = Math.max(0.1, east - west);

    ctx.lineCap = 'round';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.age >= p.maxAge || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        p.age = 0;
        p.maxAge = 55 + Math.floor(Math.random() * 45);
        continue;
      }

      // Fast approximate screen-to-latlng mapping inside particle loop
      const lat = north - (p.y / h) * latSpan;
      const lon = west + (p.x / w) * lonSpan;

      if (lat < grid.latMin || lat > grid.latMax || lon < grid.lonMin || lon > grid.lonMax) {
        p.age = p.maxAge;
        continue;
      }

      const u = sampleGridBilinear(grid, hourIndex, 'windU', lat, lon);
      const v = sampleGridBilinear(grid, hourIndex, 'windV', lat, lon);
      const spd = Math.hypot(u, v);

      // Scale velocity to crisp smooth pixel delta per animation frame
      const speedScale = 0.085;
      const nx = p.x + u * speedScale;
      const ny = p.y - v * speedScale; // Screen Y grows downward while wind V grows northward

      const alpha = Math.min(0.92, 0.35 + spd / 65);
      ctx.strokeStyle =
        darkBasemap || showColorField
          ? `rgba(255, 255, 255, ${alpha.toFixed(2)})`
          : `rgba(15, 23, 42, ${alpha.toFixed(2)})`;
      ctx.lineWidth = spd > 55 ? 1.8 : 1.25;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      p.x = nx;
      p.y = ny;
      p.age++;
    }
  }

  public destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.map.off('movestart zoomstart', this.onMoveStart);
    this.map.off('moveend zoomend viewreset', this.onMoveEnd);
    this.map.off('resize', this.onResize);

    this.fieldCanvas.remove();
    this.windCanvas.remove();
    this.isolineCanvas.remove();
  }
}
