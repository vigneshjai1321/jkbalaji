import { LegalPageChrome } from '@/components/site/LegalPageChrome';
import { jwStaticMetadata } from '@/lib/seo/metadata';

export const metadata = jwStaticMetadata('terms');

export default function TermsPage() {
  return (
    <LegalPageChrome>
      <main className="mx-auto max-w-3xl px-4 py-16 prose prose-slate">
        <h1>Terms &amp; Conditions</h1>
        <p>Gold rates change daily. Final billing as per store policy and applicable GST rules.</p>
      </main>
    </LegalPageChrome>
  );
}
