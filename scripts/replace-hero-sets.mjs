import { readFileSync, writeFileSync } from 'fs';

let s = readFileSync('src/module/home/components/HeroSection.tsx', 'utf8');

const r1 = '/images/home/radiant-indian-bride-in-floral-glow-128.webp 128w, /images/home/radiant-indian-bride-in-floral-glow-320.webp 320w, /images/home/radiant-indian-bride-in-floral-glow-640.webp 640w, /images/home/radiant-indian-bride-in-floral-glow.webp 1145w';
const t1 = '/images/home/radiant-indian-bride-in-floral-glow-128.webp 128w, /images/home/radiant-indian-bride-in-floral-glow-320.webp 320w';

const r2 = '/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp 128w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp 320w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-640.webp 640w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting.webp 1254w';
const t2 = '/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp 128w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp 320w';

const r3 = '/images/home/woman_image-160.webp 160w, /images/home/woman_image-320.webp 320w, /images/home/woman_image.webp 1355w';
const t3 = '/images/home/woman_image-160.webp 160w, /images/home/woman_image-320.webp 320w';

const r4 = '/images/home/man_image-160.webp 160w, /images/home/man_image-320.webp 320w, /images/home/man_image.webp 1324w';
const t4 = '/images/home/man_image-160.webp 160w, /images/home/man_image-320.webp 320w';

s = s.replace(r1, t1);
s = s.replace(r2, t2);
s = s.replace(r3, t3);
s = s.replace(r4, t4);

writeFileSync('src/module/home/components/HeroSection.tsx', s);
console.log('HeroSection srcSets successfully replaced');

