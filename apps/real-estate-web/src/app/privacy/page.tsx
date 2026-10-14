import { LegalPageChrome } from '@/components/site/LegalPageChrome';
import { reStaticMetadata } from '@/lib/seo/metadata';

export const metadata = reStaticMetadata('privacy');

export default function PrivacyPage() {
  return (
    <LegalPageChrome>
    <main className="mx-auto max-w-3xl px-4 py-16 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p>JK Balaji Real Estate respects your privacy. Enquiry data is used only to respond to your request.</p>
    </main>
    </LegalPageChrome>
  );
}
