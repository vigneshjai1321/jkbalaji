import { LegalPageChrome } from '@/components/site/LegalPageChrome';
import { jwStaticMetadata } from '@/lib/seo/metadata';

export const metadata = jwStaticMetadata('privacy');

export default function PrivacyPage() {
  return (
    <LegalPageChrome>
      <main className="mx-auto max-w-3xl px-4 py-16 prose prose-slate">
        <h1>Privacy Policy</h1>
        <p>
          Sri Balaji Thangamaligai — we use enquiry details only to respond to your requests and do not sell your
          contact information.
        </p>
      </main>
    </LegalPageChrome>
  );
}
