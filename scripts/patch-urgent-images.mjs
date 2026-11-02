import { readFileSync, writeFileSync } from 'fs';

let imgTs = readFileSync('src/lib/image.ts', 'utf8');

if (!imgTs.includes("'/images/home/home_banner_image-800.webp',")) {
  imgTs = imgTs.replace(
    "'/images/home/home_banner_image-640.webp',",
    "'/images/home/home_banner_image-640.webp',\n  '/images/home/home_banner_image-800.webp',"
  );
  writeFileSync('src/lib/image.ts', imgTs);
  console.log('src/lib/image.ts updated with home_banner_image-800.webp in URGENT_LOCAL_IMAGES');
} else {
  console.log('src/lib/image.ts already has 800w in URGENT_LOCAL_IMAGES');
}

