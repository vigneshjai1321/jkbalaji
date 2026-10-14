# One-time scaffold: extract jewellery-web and admin-panel from real-estate-web monolith.
$ErrorActionPreference = 'Stop'
$Root = 'E:\JKbalaji'
$Re = Join-Path $Root 'apps\real-estate-web'
$Jew = Join-Path $Root 'apps\jewellery-web'
$Admin = Join-Path $Root 'apps\admin-panel'

function Copy-Config($dest) {
  foreach ($f in @('next.config.ts', 'tsconfig.json', 'postcss.config.mjs', 'eslint.config.mjs', 'next-env.d.ts')) {
    $src = Join-Path $Re $f
    if (Test-Path $src) { Copy-Item $src (Join-Path $dest $f) -Force }
  }
  if (Test-Path (Join-Path $Re 'vitest.config.ts')) {
    Copy-Item (Join-Path $Re 'vitest.config.ts') (Join-Path $dest 'vitest.config.ts') -Force
  }
}

function Ensure-Dir($p) { New-Item -ItemType Directory -Force -Path $p | Out-Null }

# --- Jewellery ---
Ensure-Dir $Jew
Ensure-Dir (Join-Path $Jew 'src')
Copy-Config $Jew

# public
robocopy (Join-Path $Re 'public') (Join-Path $Jew 'public') /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

# src pieces
$jewSrc = Join-Path $Jew 'src'
Ensure-Dir (Join-Path $jewSrc 'app')
Ensure-Dir (Join-Path $jewSrc 'components')
Ensure-Dir (Join-Path $jewSrc 'lib')
Ensure-Dir (Join-Path $jewSrc 'styles')

robocopy (Join-Path $Re 'src\app\jewellery') (Join-Path $jewSrc 'app') /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
robocopy (Join-Path $Re 'src\components\jewellery') (Join-Path $jewSrc 'components\jewellery') /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
Copy-Item (Join-Path $Re 'src\components\ContactLeadForm.tsx') (Join-Path $jewSrc 'components\ContactLeadForm.tsx')
Copy-Item (Join-Path $Re 'src\components\ScrollReveal.tsx') (Join-Path $jewSrc 'components\ScrollReveal.tsx') -ErrorAction SilentlyContinue
Copy-Item (Join-Path $Re 'src\components\WhatsAppButton.tsx') (Join-Path $jewSrc 'components\WhatsAppButton.tsx') -ErrorAction SilentlyContinue
robocopy (Join-Path $Re 'src\components\site') (Join-Path $jewSrc 'components\site') /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

Copy-Item (Join-Path $Re 'src\lib\api.ts') (Join-Path $jewSrc 'lib\api.ts')
Copy-Item (Join-Path $Re 'src\lib\jewellery-business.ts') (Join-Path $jewSrc 'lib\jewellery-business.ts')
Copy-Item (Join-Path $Re 'src\lib\jewellery-collections.ts') (Join-Path $jewSrc 'lib\jewellery-collections.ts')
Copy-Item (Join-Path $Re 'src\lib\site-images.ts') (Join-Path $jewSrc 'lib\site-images.ts')
Copy-Item (Join-Path $Re 'src\styles\jewellery.css') (Join-Path $jewSrc 'styles\jewellery.css')

# Root html layout for jewellery
@'
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { default: 'Sri Balaji Thangamaligai', template: '%s | Sri Balaji Thangamaligai' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
'@ | Set-Content (Join-Path $jewSrc 'app\layout-root.tsx') -Encoding utf8

# --- Admin ---
Ensure-Dir $Admin
Ensure-Dir (Join-Path $Admin 'src')
Copy-Config $Admin
robocopy (Join-Path $Re 'public') (Join-Path $Admin 'public') /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

$adminSrc = Join-Path $Admin 'src'
Ensure-Dir (Join-Path $adminSrc 'app')
robocopy (Join-Path $Re 'src\app\admin') (Join-Path $adminSrc 'app') /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
robocopy (Join-Path $Re 'src\components\admin') (Join-Path $adminSrc 'components\admin') /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
Ensure-Dir (Join-Path $adminSrc 'lib')
Copy-Item (Join-Path $Re 'src\lib\admin-api.ts') (Join-Path $adminSrc 'lib\admin-api.ts')
Copy-Item (Join-Path $Re 'src\lib\api.ts') (Join-Path $adminSrc 'lib\api.ts') -ErrorAction SilentlyContinue
if (Test-Path (Join-Path $Re 'src\providers.tsx')) { Copy-Item (Join-Path $Re 'src\providers.tsx') (Join-Path $adminSrc 'providers.tsx') }
if (Test-Path (Join-Path $Re 'src\styles\globals.css')) {
  Ensure-Dir (Join-Path $adminSrc 'styles')
  Copy-Item (Join-Path $Re 'src\styles\globals.css') (Join-Path $adminSrc 'styles\globals.css')
}

Write-Host 'Scaffold copy complete. Run path fix scripts next.'
