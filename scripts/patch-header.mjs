import { readFileSync, writeFileSync } from 'fs';

const file = 'src/components/Header.tsx';
let c = readFileSync(file, 'utf8');

const hasGate = c.includes('company.logoUrl &&');
console.log('Has logoUrl gate:', hasGate);

if (!hasGate) {
  console.log('Nothing to patch.');
  process.exit(0);
}

// Replace the gated block with unconditional logo render
// The block looks like: {company.logoUrl && (\n  <span ...>\n    <CompanyLogo .../>\n  </span>\n)}
c = c.replace(
  /\{company\.logoUrl && \([\s\S]*?<span className="flex shrink-0 items-center rounded-lg px-2 py-1\.5">[\s\S]*?<CompanyLogo className="h-8 w-auto sm:h-9" \/>[\s\S]*?<\/span>[\s\S]*?\)\}/,
  `<span className="flex shrink-0 items-center rounded-lg px-2 py-1.5">
              <CompanyLogo className="h-8 w-auto sm:h-9" width={154} height={38} />
            </span>`
);

const stillHasGate = c.includes('company.logoUrl &&');
if (stillHasGate) {
  console.error('Regex did not match. Dumping around logoUrl:');
  const idx = c.indexOf('company.logoUrl');
  console.log(JSON.stringify(c.slice(Math.max(0, idx - 20), idx + 200)));
  process.exit(1);
}

writeFileSync(file, c);
console.log('Patched and saved!');

