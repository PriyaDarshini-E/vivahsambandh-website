import { readFileSync, writeFileSync } from 'fs';

let hero = readFileSync('src/module/home/components/HeroSection.tsx', 'utf8');

// For bride: replace photo and photoSrcSet to use local 320w and 128w only
hero = hero.replace(
  'photo: img("/images/home/radiant-indian-bride-in-floral-glow.webp"),',
  'photo: "/images/home/radiant-indian-bride-in-floral-glow-320.webp",'
);
hero = hero.replace(
  'photoSrcSet: imgSrcSet(\n      "/images/home/radiant-indian-bride-in-floral-glow-128.webp 128w, /images/home/radiant-indian-bride-in-floral-glow-320.webp 320w, /images/home/radiant-indian-bride-in-floral-glow-640.webp 640w, /images/home/radiant-indian-bride-in-floral-glow.webp 1145w",\n    ),',
  'photoSrcSet: "/images/home/radiant-indian-bride-in-floral-glow-128.webp 128w, /images/home/radiant-indian-bride-in-floral-glow-320.webp 320w",'
);

// For groom: replace photo and photoSrcSet to use local 320w and 128w only
hero = hero.replace(
  'photo: img(\n      "/images/home/radiant-indian-groom-in-a-golden-wedding-setting.webp",\n    ),',
  'photo: "/images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp",'
);
hero = hero.replace(
  'photoSrcSet: imgSrcSet(\n      "/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp 128w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp 320w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-640.webp 640w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting.webp 1254w",\n    ),',
  'photoSrcSet: "/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp 128w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp 320w",'
);

// For illustration: use local 160w and 320w only
hero = hero.replace(
  'illustration: img("/images/home/woman_image.webp"),',
  'illustration: "/images/home/woman_image-160.webp",'
);
hero = hero.replace(
  'illustrationSrcSet: imgSrcSet(\n      "/images/home/woman_image-160.webp 160w, /images/home/woman_image-320.webp 320w, /images/home/woman_image.webp 1355w",\n    ),',
  'illustrationSrcSet: "/images/home/woman_image-160.webp 160w, /images/home/woman_image-320.webp 320w",'
);

hero = hero.replace(
  'illustration: img("/images/home/man_image.webp"),',
  'illustration: "/images/home/man_image-160.webp",'
);
hero = hero.replace(
  'illustrationSrcSet: imgSrcSet(\n      "/images/home/man_image-160.webp 160w, /images/home/man_image-320.webp 320w, /images/home/man_image.webp 1324w",\n    ),',
  'illustrationSrcSet: "/images/home/man_image-160.webp 160w, /images/home/man_image-320.webp 320w",'
);

writeFileSync('src/module/home/components/HeroSection.tsx', hero);
console.log('HeroSection.tsx match cards optimized to local responsive sets');

