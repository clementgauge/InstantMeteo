import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';

const svgPath = path.resolve('public/favicon.svg');
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

// Generate Instant-Meteo.ico
pngToIco([
  path.resolve('public/icon-256.png') || path.resolve('public/icon-512.png'),
  path.resolve('public/icon-128.png'),
  path.resolve('public/icon-64.png'),
  path.resolve('public/icon-48.png'),
  path.resolve('public/icon-32.png'),
  path.resolve('public/icon-16.png'),
])
  .then((buf) => {
    fs.writeFileSync(path.resolve('public/Instant-Meteo.ico'), buf);
    fs.writeFileSync(path.resolve('public/favicon.ico'), buf);
    console.log('Generated: public/Instant-Meteo.ico and public/favicon.ico successfully!');
  })
  .catch((err) => {
    console.error('Error generating ICO:', err);
  });
