import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');
if (!html.includes('home_banner_image-800.webp')) {
  html = html.replace(
    '/images/home/home_banner_image-640.webp 640w,',
    '/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-800.webp 800w,'
  );
  writeFileSync('index.html', html);
  console.log('index.html updated with 800w');
} else {
  console.log('index.html already has 800w');
}

let hero = readFileSync('src/module/home/components/HeroSection.tsx', 'utf8');
if (!hero.includes('home_banner_image-800.webp')) {
  hero = hero.replace(
    '/images/home/home_banner_image-640.webp 640w,',
    '/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-800.webp 800w,'
  );
  writeFileSync('src/module/home/components/HeroSection.tsx', hero);
  console.log('HeroSection.tsx updated with 800w');
} else {
  console.log('HeroSection.tsx already has 800w');
}

