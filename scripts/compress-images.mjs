import sharp from 'sharp';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';

const tasks = [
  { src: 'public/images/home/woman_image-320.webp', w: 320, q: 48 },
  { src: 'public/images/home/man_image-320.webp', w: 320, q: 48 },
  { src: 'public/images/home/home_banner_image-1280.webp', w: 1280, q: 55 },
  { src: 'public/images/home/radiant-indian-bride-in-floral-glow-320.webp', w: 320, q: 48 },
  { src: 'public/images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp', w: 320, q: 48 },
  { src: 'public/images/home/home_banner_image-640.webp', w: 640, q: 55 },
  { src: 'public/images/home/home_banner_image-1024.webp', w: 1024, q: 52 },
];

for (const t of tasks) {
  if (!existsSync(t.src)) { console.log('SKIP missing:', t.src); continue; }
  const origBuf = readFileSync(t.src);
  const orig = origBuf.length;
  const outPath = t.src.replace('.webp', '_opt.webp');
  await sharp(origBuf).resize(t.w).webp({ quality: t.q, effort: 6 }).toFile(outPath);
  const newBuf = readFileSync(outPath);
  console.log(
    t.src.split('/').pop(),
    'orig:', (orig/1024).toFixed(1)+'KB',
    '-> new:', (newBuf.length/1024).toFixed(1)+'KB',
    'saved:', ((orig-newBuf.length)/1024).toFixed(1)+'KB'
  );
  // Write new bytes back to original path by reading tmp then writing
  try {
    writeFileSync(t.src, newBuf);
    unlinkSync(outPath);
    console.log('  -> replaced original');
  } catch (e) {
    console.log('  -> could not overwrite, keeping _opt file:', outPath);
  }
}
console.log('Done');

