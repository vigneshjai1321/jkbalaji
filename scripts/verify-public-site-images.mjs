#!/usr/bin/env node
/**
 * Verify static image URLs return 200 from running Next apps (production `next start`).
 * Usage: node scripts/verify-public-site-images.mjs [--re-port=3000] [--jew-port=3001]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rePort = Number(process.argv.find((a) => a.startsWith('--re-port='))?.split('=')[1] ?? 3000);
const jewPort = Number(process.argv.find((a) => a.startsWith('--jew-port='))?.split('=')[1] ?? 3001);

const RE_PATHS = [
  '/assets/images/realestate.jpg',
  '/assets/images/plot.jpg',
  '/assets/images/plot1.jpg',
  '/assets/images/plot2.jpg',
  '/assets/images/plot3.jpg',
  '/assets/images/promotors.jpg',
];

const JW_PATHS = [
  '/assets/images/rings1.jpg',
  '/assets/images/chains.jpg',
  '/assets/images/jewels1.jpg',
  '/assets/images/diamond.jpg',
  '/assets/images/silver2.jpg',
  '/assets/images/platinum1.jpg',
];

function localFileExists(app, urlPath) {
  const rel = urlPath.replace(/^\//, '');
  return fs.existsSync(path.join(root, 'apps', app, 'public', rel));
}

async function headOk(base, urlPath) {
  const res = await fetch(`${base}${urlPath}`, { method: 'HEAD' });
  const ct = res.headers.get('content-type') ?? '';
  return { ok: res.ok && ct.includes('image'), status: res.status, contentType: ct };
}

async function verifySite(label, app, port, paths) {
  const base = `http://127.0.0.1:${port}`;
  const rows = [];
  for (const p of paths) {
    const disk = localFileExists(app, p);
    let net = { ok: false, status: 0, contentType: '' };
    try {
      net = await headOk(base, p);
    } catch (e) {
      net = { ok: false, status: 0, contentType: String(e) };
    }
    rows.push({ path: p, disk, ...net });
  }
  return { label, base, rows };
}

const re = await verifySite('real-estate-web', 'real-estate-web', rePort, RE_PATHS);
const jew = await verifySite('jewellery-web', 'jewellery-web', jewPort, JW_PATHS);

let failed = 0;
for (const site of [re, jew]) {
  console.log(`\n=== ${site.label} (${site.base}) ===`);
  for (const r of site.rows) {
    const tag = r.ok ? 'OK' : 'FAIL';
    if (!r.ok || !r.disk) failed++;
    console.log(`[${tag}] disk=${r.disk ? 'yes' : 'no'} HTTP ${r.status} ${r.contentType} ${r.path}`);
  }
}

const unsplash =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';
const u = await fetch(unsplash, { method: 'HEAD' });
console.log(`\n=== Unsplash fallback ===\n[${u.ok ? 'OK' : 'FAIL'}] HTTP ${u.status} ${unsplash}`);
if (!u.ok) failed++;

process.exit(failed > 0 ? 1 : 0);
