import fs from 'node:fs';

let content = fs.readFileSync('src/components/CompanyLogo.tsx', 'utf8');

content = content.replace(
  'const LOCAL_LOGO = "/images/logo.webp";\nconst LOCAL_LOGO_SRCSET =\n  "/images/logo-150.webp 150w, /images/logo.webp 300w, /images/logo-450.webp 450w";',
  'const LOCAL_LOGO = "/images/logo-150.webp";\nconst LOCAL_LOGO_SRCSET =\n  "/images/logo-150.webp 150w, /images/logo-200.webp 200w, /images/logo-300.webp 300w";'
);

fs.writeFileSync('src/components/CompanyLogo.tsx', content, 'utf8');
console.log('Successfully updated CompanyLogo.tsx');

