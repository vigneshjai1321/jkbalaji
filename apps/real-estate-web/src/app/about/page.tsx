import { SiteImage } from '@/components/site/SiteImage';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { ReAboutServicesLinks, ReEnquireCtaBar, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';
import { realEstateImages } from '@/lib/site-images';
import { RE_ROUTES } from '@/lib/site-routes';
import { reStaticMetadata } from '@/lib/seo/metadata';
import Link from 'next/link';

export const metadata = reStaticMetadata('about');

export default function AboutPage() {
  return (
    <RealEstatePageShell>
      <RePageHeader
        eyebrow="About Us"
        title="Plots and Layouts You Can Trust"
        description="We help families find verified plots around Cheyyar and Tamil Nadu — clear documentation, honest pricing, and support from site visit to registration."
      />
      <div className="re-container pb-6 md:pb-8 grid md:grid-cols-2 gap-8 items-center">
        <Link href={RE_ROUTES.contact} className="inline-flex rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 w-fit md:hidden">
          Enquire now
        </Link>
        <div className="rounded-xl overflow-hidden shadow-md ring-1 ring-slate-200/80 relative aspect-[4/3] md:order-2">
          <SiteImage src={realEstateImages.about} alt="JK Balaji real estate developments" fill sizes="(max-width:768px) 100vw, 50vw" />
        </div>
        <div className="md:order-1">
          <p className="text-sm text-slate-600 leading-relaxed">
            Our team focuses on published developments and JK Nagar phases. We do not advertise speculative launches or unverified
            approvals online.
          </p>
          <Link href={RE_ROUTES.contact} className="hidden md:inline-flex mt-6 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
            Enquire now
          </Link>
        </div>
      </div>
      <ReAboutServicesLinks />
      <ReEnquireCtaBar />
    </RealEstatePageShell>
  );
}
