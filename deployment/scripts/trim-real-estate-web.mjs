import fs from 'node:fs';
import path from 'node:path';

const appDir = path.resolve('apps/real-estate-web/src/app');
const reDir = path.join(appDir, 'realestate');

if (!fs.existsSync(reDir)) {
  console.log('realestate folder missing, skip');
  process.exit(0);
}

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

for (const name of ['admin', 'jewellery', 'realestate']) {
  /* move realestate children up */
}
for (const ent of fs.readdirSync(reDir, { withFileTypes: true })) {
  const src = path.join(reDir, ent.name);
  const dest = path.join(appDir, ent.name);
  if (fs.existsSync(dest)) rmrf(dest);
  fs.renameSync(src, dest);
}
rmrf(reDir);
rmrf(path.join(appDir, 'admin'));
rmrf(path.join(appDir, 'jewellery'));

const mw = path.resolve('apps/real-estate-web/src/middleware.ts');
if (fs.existsSync(mw)) fs.unlinkSync(mw);

rmrf(path.resolve('apps/real-estate-web/src/components/admin'));
rmrf(path.resolve('apps/real-estate-web/src/components/jewellery'));

console.log('trim-real-estate-web done');
