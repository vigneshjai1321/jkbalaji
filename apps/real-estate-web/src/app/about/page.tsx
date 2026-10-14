import Link from 'next/link';
import { LegalPageChrome } from '@/components/site/LegalPageChrome';

export default function AboutPage() {
  return (
    <LegalPageChrome>
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl prose prose-slate">
        <h1>About JK Balaji Real Estate</h1>
        <p>
          We develop and sell residential plots and layouts around Cheyyar with transparent documentation and site support.
        </p>
        <Link href="/" className="text-emerald-700 underline">
          View Properties
        </Link>
      </div>
    </main>
    </LegalPageChrome>
  );
}
