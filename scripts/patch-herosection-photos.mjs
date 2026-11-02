import fs from 'node:fs';

let content = fs.readFileSync('src/module/home/components/HeroSection.tsx', 'utf8');

// Replace bride photo
content = content.replace(
  'radiant-indian-bride-in-floral-glow-128.webp 128w, /images/home/radiant-indian-bride-in-floral-glow-320.webp 320w',
  'radiant-indian-bride-in-floral-glow-128.webp 128w, /images/home/radiant-indian-bride-in-floral-glow-200.webp 200w, /images/home/radiant-indian-bride-in-floral-glow-320.webp 320w'
);

// Replace groom photo
content = content.replace(
  'radiant-indian-groom-in-a-golden-wedding-setting-128.webp 128w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp 320w',
  'radiant-indian-groom-in-a-golden-wedding-setting-128.webp 128w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-200.webp 200w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp 320w'
);

// Replace woman illustration
content = content.replace(
  'woman_image-160.webp 160w, /images/home/woman_image-320.webp 320w',
  'woman_image-120.webp 120w, /images/home/woman_image-160.webp 160w, /images/home/woman_image-320.webp 320w'
);

// Replace man illustration
content = content.replace(
  'man_image-160.webp 160w, /images/home/man_image-320.webp 320w',
  'man_image-120.webp 120w, /images/home/man_image-160.webp 160w, /images/home/man_image-320.webp 320w'
);

fs.writeFileSync('src/module/home/components/HeroSection.tsx', content, 'utf8');
console.log('Successfully updated HeroSection.tsx with 200w photos and 120w illustrations');
