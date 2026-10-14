import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const brands = {
  jkbalaji: { bg: '#047857', accent: '#0d9488', mark: 'JK', label: 'Real Estate' },
  cheyyar: { bg: '#b45309', accent: '#f59e0b', mark: 'CB', label: 'Gold' },
  admin: { bg: '#1e293b', accent: '#10b981', mark: 'ERP', label: 'Admin' },
};

mkdirSync(join(root, 'icons'), { recursive: true });

function svg(name, { bg, accent, mark }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="${accent}"/></linearGradient></defs><rect width="512" height="512" rx="96" fill="url(#g)"/><text x="256" y="300" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="180" font-weight="800">${mark}</text></svg>`;
}

for (const [key, cfg] of Object.entries(brands)) {
  const content = svg(key, cfg);
  writeFileSync(join(root, 'icons', `${key}.svg`), content);
}

writeFileSync(join(root, 'favicon.svg'), svg('jkbalaji', brands.jkbalaji));
writeFileSync(
  join(root, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: 'JK Balaji',
      short_name: 'JK Balaji',
      icons: [
        { src: '/icons/jkbalaji.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        { src: '/icons/admin.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
      ],
      theme_color: '#047857',
      background_color: '#0f172a',
      display: 'standalone',
    },
    null,
    2,
  ),
);

console.log('Favicons written to public/icons and public/favicon.svg');
