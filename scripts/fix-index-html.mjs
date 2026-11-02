import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');

// 1. Remove the logo preload entirely so initial connection is 100% focused on LCP banner
const logoPreloadRegex = /\s*<link\s+rel="preload"\s+as="image"\s+href="\/images\/logo-150\.webp"[\s\S]*?fetchpriority="low"\s*>/;
if (logoPreloadRegex.test(html)) {
  html = html.replace(logoPreloadRegex, '');
  console.log('Removed logo preload from index.html');
}

// 2. Fix imagesizes so mobile picks 640w or 800w instead of 1280w
html = html.replace(
  'imagesizes="100vw"',
  'imagesizes="(max-width: 640px) 240px, (max-width: 1024px) 640px, 100vw"'
);

// 3. Clean up the preload srcset in index.html
html = html.replace(
  'imagesrcset="/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-800.webp 800w, /images/home/home_banner_image-1024.webp 1085w, /images/home/home_banner_image-1280.webp 1280w, /images/home/home_banner_image-1440.webp 1440w, /images/home/home_banner_image.webp 2172w"',
  'imagesrcset="/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-1024.webp 1024w, /images/home/home_banner_image-1280.webp 1280w, /images/home/home_banner_image.webp 2172w"'
);

writeFileSync('index.html', html);
console.log('index.html successfully updated and cleaned');

