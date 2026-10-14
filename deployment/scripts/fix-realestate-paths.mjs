import fs from 'node:fs';
import path from 'node:path';

function walk(dir, fn) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, fn);
    else if (/\.(tsx?|jsx?)$/.test(ent.name)) fn(p);
  }
}

function rep(file, pairs) {
  let c = fs.readFileSync(file, 'utf8');
  const orig = c;
  for (const [a, b] of pairs) c = c.split(a).join(b);
  if (c !== orig) fs.writeFileSync(file, c);
}

const re = path.resolve('apps/real-estate-web/src');
walk(re, (f) =>
  rep(f, [
    ['/realestate/', '/'],
    ['/realestate', '/'],
    ["from '../../lib/", "from '@/lib/"],
    ["from '../../components/", "from '@/components/"],
    ["from '../../../lib/", "from '@/lib/"],
    ["from '../../../components/", "from '@/components/"],
  ]),
);

console.log('fix-realestate-paths done');
