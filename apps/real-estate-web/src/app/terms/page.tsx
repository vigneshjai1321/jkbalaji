import { LegalPageChrome } from '@/components/site/LegalPageChrome';
import { reStaticMetadata } from '@/lib/seo/metadata';

export const metadata = reStaticMetadata('terms');

export default function TermsPage() {
  return (
    <LegalPageChrome>
      <main className="mx-auto max-w-3xl px-4 py-16 prose prose-slate">
        <h1>Terms &amp; Conditions</h1>
        <p>Listings and rates are indicative until confirmed in writing. Subject to availability and applicable laws.</p>
      </main>
    </LegalPageChrome>
  );
}
