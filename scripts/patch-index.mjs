import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('index.html', 'utf8');

if (c.includes('logo-150.webp')) {
  console.log('Logo preload already present');
  process.exit(0);
}

const insert = `    <link
      rel="preload"
      as="image"
      href="/images/logo-150.webp"
      imagesrcset="/images/logo-150.webp 150w, /images/logo.webp 300w, /images/logo-450.webp 450w"
      imagesizes="154px"
      fetchpriority="low"
    >\n`;

c = c.replace('    <!-- Google Fonts', insert + '    <!-- Google Fonts');
writeFileSync('index.html', c);
console.log('Logo preload added to index.html');

