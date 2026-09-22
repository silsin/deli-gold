import fs from 'fs';

const files = [
  'src/app/components/SpecialOffers.tsx',
  'src/app/admin/special-offers/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/page.tsx',
  'src/app/api/special-offers/route.ts',
  'src/app/api/admin/special-offers/route.ts',
  'src/app/api/admin/special-offers/[id]/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/lib/db.ts',
  'src/lib/settings.ts',
  'src/lib/pricing.ts',
];

let totalBad = 0;
for (const f of files){
  const txt = fs.readFileSync(f.replace(/\\/g,'/'), 'utf8');
  const lines = txt.split('\n');
  const bad = [];
  lines.forEach((ln, li) => {
    for (const ch of ln){
      const cp = ch.codePointAt(0);
      if (cp >= 0x80 && cp <= 0xFF){
        bad.push({line: li+1, char: ch, hex: cp.toString(16)});
      }
    }
  });
  if (bad.length > 0){
    totalBad += bad.length;
    console.log('MOJIBAKE in', f, '| count:', bad.length);
    for (const b of bad){ console.log('   line', b.line, '| char', b.char, '| hex', b.hex); }
  } else {
    console.log('clean:', f);
  }
}
console.log('=== total mojibake chars across source files:', totalBad);
