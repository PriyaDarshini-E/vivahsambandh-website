import { readFileSync, writeFileSync } from 'fs';

let hero = readFileSync('src/module/home/components/HeroSection.tsx', 'utf8');

// Replace any occurrence of the remote groom image with local 128w
const pattern = /photo:\s*img\(\s*["']\/images\/home\/radiant-indian-groom-in-a-golden-wedding-setting\.webp["']\s*,?\s*\),?/;
hero = hero.replace(pattern, 'photo: "/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp",');

writeFileSync('src/module/home/components/HeroSection.tsx', hero);
console.log('Regex replace successful');

