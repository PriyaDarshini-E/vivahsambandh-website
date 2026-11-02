import fs from 'node:fs';

let content = fs.readFileSync('index.html', 'utf8');

// Replace favicon.svg with lightweight 32x32 PNG and SVG fallback
content = content.replace(
  '<link rel="icon" type="image/svg+xml" href="/favicon.svg" >',
  '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n    <link rel="icon" type="image/svg+xml" href="/favicon.svg">'
);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully updated favicon in index.html');

