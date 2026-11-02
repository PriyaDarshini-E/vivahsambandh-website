import fs from 'node:fs';

let content = fs.readFileSync('src/lib/image.ts', 'utf8');
const target = "'/images/home/woman_image-160.webp',";
const replacement = "'/images/home/woman_image-120.webp',\n  '/images/home/woman_image-160.webp',";

if (content.includes(target)) {
  content = content.replace(target, replacement);
  content = content.replace(
    "'/images/home/man_image-160.webp',",
    "'/images/home/man_image-120.webp',\n  '/images/home/man_image-160.webp',"
  );
  content = content.replace(
    "'/images/home/radiant-indian-bride-in-floral-glow-128.webp',",
    "'/images/home/radiant-indian-bride-in-floral-glow-128.webp',\n  '/images/home/radiant-indian-bride-in-floral-glow-200.webp',"
  );
  content = content.replace(
    "'/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp',",
    "'/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp',\n  '/images/home/radiant-indian-groom-in-a-golden-wedding-setting-200.webp',"
  );
  fs.writeFileSync('src/lib/image.ts', content, 'utf8');
  console.log('Successfully updated src/lib/image.ts');
} else {
  console.log('Target not found!');
}

