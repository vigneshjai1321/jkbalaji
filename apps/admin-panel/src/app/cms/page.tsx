'use client';

import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAdminTheme } from '@/components/admin/AdminShell';

export default function AdminCmsPage() {
  const theme = useAdminTheme();
  const dark = theme === 'dark';
  return (
    <AdminPanel title="Website CMS" description="Manage banners, blogs, gallery, testimonials, and SEO content.">
      <div className={`p-8 space-y-4 text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
        <p>Use the content API to publish hero copy and offers:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <code className="text-xs bg-black/20 px-1 rounded">POST /content</code> — site keys REAL_ESTATE / JEWELLERY
          </li>
          <li>Gallery & testimonials: extend public modules (UI wired on next sprint)</li>
        </ul>
        <p className={dark ? 'text-slate-500' : 'text-slate-500'}>
          Public pages already pull live properties, products, gold rates, and schemes from the API.
        </p>
      </div>
    </AdminPanel>
  );
}
