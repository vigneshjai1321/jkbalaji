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

const jew = path.resolve('apps/jewellery-web/src');
walk(jew, (f) =>
  rep(f, [
    ['/jewellery#', '/#'],
    ['/jewellery/privacy', '/privacy'],
    ['/jewellery/terms', '/terms'],
    ["from '../../lib/", "from '@/lib/"],
    ["from '../../components/", "from '@/components/"],
    ["from '../../../components/", "from '@/components/"],
    ['href="/jewellery#home"', 'href="/#home"'],
    ['href="/jewellery#', 'href="/#'],
  ]),
);

const admin = path.resolve('apps/admin-panel/src');
walk(admin, (f) =>
  rep(f, [
    ["/admin/", '/'],
    ["href: '/admin'", "href: '/'"],
    ["href: '/admin',", "href: '/',"],
    ["from '../../../../", "from '../../../"],
    ["from '../../../../../", "from '../../../../"],
    ["from '../../../lib/", "from '@/lib/"],
    ["from '../../../components/", "from '@/components/"],
    ["from '../../../../components/", "from '@/components/"],
    ["from '../../../../lib/", "from '@/lib/"],
    ["from '../../../../../lib/", "from '@/lib/"],
    ["from '../../../../../components/", "from '@/components/"],
    ["from '../../components/admin/", "from '@/components/admin/"],
    ['{ href: \'/admin', "{ href: '/"],
  ]),
);

walk(admin, (f) =>
  rep(f, [
    ["from '@/components/Admin", "from '@/components/admin/Admin"],
    ["from '@/components/Crm", "from '@/components/admin/Crm"],
  ]),
);

console.log('fix-split-paths done');
