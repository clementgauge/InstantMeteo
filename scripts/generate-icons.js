import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const icoPath = path.resolve('public/Instant-Meteo.ico');
  const icon512Path = path.resolve('public/icon-512.png');
  const icon192Path = path.resolve('public/icon-192.png');

  if (fs.existsSync(icoPath) && fs.existsSync(icon512Path) && fs.existsSync(icon192Path)) {
    console.log('[Generate Icons] Public icons and ICO already exist, skipping regeneration.');
    return;
  }

  const svgPath = path.resolve('public/favicon.svg');
  if (!fs.existsSync(svgPath)) {
    console.log('[Generate Icons] No favicon.svg found, skipping.');
    return;
  }

  try {
    const { Resvg } = await import('@resvg/resvg-js');
    const pngToIco = (await import('png-to-ico')).default;

    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const sizes = [512, 256, 192, 128, 64, 48, 32, 16];
    const pngFiles = [];

    for (const size of sizes) {
      const resvg = new Resvg(svgContent, {
        fitTo: {
          mode: 'width',
          value: size,
        },
      });
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      const outPath = path.resolve(`public/icon-${size}.png`);
      fs.writeFileSync(outPath, pngBuffer);
      pngFiles.push(outPath);
      console.log(`Generated: public/icon-${size}.png`);
    }

    const buf = await pngToIco([
      path.resolve('public/icon-256.png'),
      path.resolve('public/icon-128.png'),
      path.resolve('public/icon-64.png'),
      path.resolve('public/icon-48.png'),
      path.resolve('public/icon-32.png'),
      path.resolve('public/icon-16.png'),
    ]);
    fs.writeFileSync(path.resolve('public/Instant-Meteo.ico'), buf);
    fs.writeFileSync(path.resolve('public/favicon.ico'), buf);
    console.log('[Generate Icons] Generated Instant-Meteo.ico and favicon.ico successfully!');
  } catch (err) {
    console.warn('[Generate Icons] Skipped icon generation (missing generator libraries or binary):', err.message);
  }
}

generateIcons();
