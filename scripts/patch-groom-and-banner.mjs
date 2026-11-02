import { readFileSync, writeFileSync } from 'fs';

let hero = readFileSync('src/module/home/components/HeroSection.tsx', 'utf8');

// Replace groom photo
hero = hero.replace(
  `photo: img(\n      "/images/home/radiant-indian-groom-in-a-golden-wedding-setting.webp",\n    ),`,
  `photo: "/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp",`
);

// Align banner srcSet with index.html
hero = hero.replace(
  `"/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-800.webp 800w, /images/home/home_banner_image-1024.webp 1085w, /images/home/home_banner_image-1280.webp 1280w, /images/home/home_banner_image-1440.webp 1440w, /images/home/home_banner_image.webp 2172w"`,
  `"/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-1024.webp 1024w, /images/home/home_banner_image-1280.webp 1280w, /images/home/home_banner_image.webp 2172w"`
);

writeFileSync('src/module/home/components/HeroSection.tsx', hero);
console.log('Groom photo and banner srcSet updated');

