import type { Metadata } from 'next';
import { SiteImage } from '@/components/site/SiteImage';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { realEstateImages } from '@/lib/site-images';
import { RE_ROUTES } from '@/lib/site-routes';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | JK Balaji Real Estate',
  description: 'JK Balaji Real Estate — verified plots and layouts around Cheyyar and Tamil Nadu.',
  alternates: { canonical: 'https://jkbalaji.in/about' },
};

export default function AboutPage() {
  return (
    <RealEstatePageShell>
      <div className="re-container py-10 md:py-14 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="re-eyebrow">About Us</p>
          <h1 className="re-heading mt-2">Plots and Layouts You Can Trust</h1>
          <p className="re-subheading mt-4">
            We help families and investors find verified plots around Cheyyar and Tamil Nadu — with clear documentation,
            honest pricing, and support from site visit to registration.
          </p>
          <Link href={RE_ROUTES.contact} className="inline-flex mt-8 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900">
            Enquire now
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200/80 relative aspect-[4/3]">
          <SiteImage src={realEstateImages.about} alt="JK Balaji real estate developments" fill sizes="(max-width:768px) 100vw, 50vw" />
        </div>
      </div>
    </RealEstatePageShell>
  );
}
