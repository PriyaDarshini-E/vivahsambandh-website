import { readFileSync, writeFileSync } from 'fs';

let hero = readFileSync('src/module/home/components/HeroSection.tsx', 'utf8');

// 1. Align HeroSection banner srcSet and sizes exactly with index.html preload
hero = hero.replace(
  'srcSet={imgSrcSet(\n              "/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-800.webp 800w, /images/home/home_banner_image-1024.webp 1085w, /images/home/home_banner_image-1280.webp 1280w, /images/home/home_banner_image-1440.webp 1440w, /images/home/home_banner_image.webp 2172w",\n            )}',
  'srcSet={imgSrcSet(\n              "/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-1024.webp 1024w, /images/home/home_banner_image-1280.webp 1280w, /images/home/home_banner_image.webp 2172w",\n            )}'
);

hero = hero.replace(
  'sizes="100vw"',
  'sizes="(max-width: 640px) 240px, (max-width: 1024px) 640px, 100vw"'
);

// 2. Set MATCH_CARDS fallback photos to 128w
hero = hero.replace(
  'photo: "/images/home/radiant-indian-bride-in-floral-glow-320.webp",',
  'photo: "/images/home/radiant-indian-bride-in-floral-glow-128.webp",'
);

hero = hero.replace(
  'photo: img(\n      "/images/home/radiant-indian-groom-in-a-golden-wedding-setting.webp",\n    ),',
  'photo: "/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp",'
);

// 3. Make card illustration fallback 160w
hero = hero.replace(
  'illustration: img("/images/home/man_image.webp"),',
  'illustration: "/images/home/man_image-160.webp",'
);

writeFileSync('src/module/home/components/HeroSection.tsx', hero);
console.log('HeroSection.tsx updated: banner and match card assets aligned to ultra-fast presets');

