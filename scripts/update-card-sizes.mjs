import { readFileSync, writeFileSync } from 'fs';

let s = readFileSync('src/module/home/components/HeroSection.tsx', 'utf8');

s = s.replace(
  'sizes="(max-width: 640px) 4rem, (max-width: 1024px) 10rem, 16rem"',
  'sizes="(max-width: 640px) 112px, (max-width: 1024px) 160px, 256px"'
);

s = s.replace(
  'sizes="(max-width: 640px) 3.5rem, (max-width: 1024px) 4.5rem, 5.5rem"',
  'sizes="(max-width: 640px) 72px, (max-width: 1024px) 96px, 120px"'
);

writeFileSync('src/module/home/components/HeroSection.tsx', s);
console.log('HeroSection.tsx sizes updated cleanly');

