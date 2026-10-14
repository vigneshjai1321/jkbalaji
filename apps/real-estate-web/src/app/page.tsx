import Link from 'next/link';
import { RealEstateHero } from '@/components/realestate/RealEstateHero';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { PropertyShowcaseCard } from '@/components/public/PropertyShowcaseCard';
import { InvestmentCalculator } from '@/components/public/InvestmentCalculator';
import {
  BuyingProcessSection,
  FeaturedProjectsSection,
  HomeFaqTeaser,
  JkNagarPhasesSection,
  LocationAdvantagesSection,
  SiteVisitSection,
  WhyChooseSection,
} from '@/components/realestate/RealEstateHomeSections';
import { JsonLd } from '@/components/site/JsonLd';
import { resolvePublicAssetUrl } from '@/lib/site-asset-url';
import { apiGet } from '@/lib/api';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { RE_ROUTES } from '@/lib/site-routes';

type Property = {
  id: string;
  title: string;
  slug: string;
  location: string;
  priceInr: string;
  images?: string[];
};

type Project = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  phase: string;
  phaseLabel?: string | null;
  description: string | null;
  coverImage?: string | null;
};

export default async function RealEstateHome() {
  let properties: Property[] = [];
  let projects: Project[] = [];
  try {
    properties = await apiGet<Property[]>('/public/properties');
  } catch {
    properties = [];
  }
  try {
    projects = await apiGet<Project[]>('/public/projects');
  } catch {
    projects = [];
  }
  const featured = properties.slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'JK Balaji Real Estate',
    url: 'https://jkbalaji.in/',
    areaServed: 'Tamil Nadu, India',
    email: JK_BALAJI_RE.email,
    telephone: JK_BALAJI_RE.phoneE164,
  };

  return (
    <RealEstatePageShell>
      <JsonLd data={jsonLd} />
      <RealEstateHero />
      <section className="re-section bg-white">
        <div className="re-container grid md:grid-cols-3 gap-6">
          {[
            { title: 'JK Nagar', desc: 'Three planned phases — plot enquiry for Phase 1 & 2.', href: RE_ROUTES.jkNagar },
            { title: 'Projects', desc: 'Published developments from our catalogue.', href: RE_ROUTES.projects },
            { title: 'Contact', desc: 'Site visits, documentation, and registration support.', href: RE_ROUTES.contact },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <h2 className="font-bold text-lg text-slate-900">{card.title}</h2>
              <p className="text-sm text-slate-600 mt-2">{card.desc}</p>
              <span className="inline-block mt-4 text-sm font-semibold text-emerald-800">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedProjectsSection projects={projects} />
      <JkNagarPhasesSection />

      <section id="properties" className="re-section">
        <div className="re-container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="re-eyebrow">Portfolio</p>
              <h2 className="re-heading mt-2">Available plots & properties</h2>
            </div>
            <Link href={RE_ROUTES.properties} className="text-sm font-semibold text-emerald-800 hover:underline">
              View all properties →
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="mt-8 text-slate-600 max-w-xl">
              No individual listings are published right now. Explore{' '}
              <Link href={RE_ROUTES.jkNagar} className="text-emerald-800 font-medium hover:underline">
                JK Nagar
              </Link>{' '}
              or{' '}
              <Link href={RE_ROUTES.contact} className="text-emerald-800 font-medium hover:underline">
                contact our team
              </Link>
              .
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => {
                const img = p.images?.[0]?.trim();
                return (
                  <PropertyShowcaseCard
                    key={p.id}
                    title={p.title}
                    location={p.location}
                    priceInr={p.priceInr}
                    slug={p.slug}
                    imageUrl={img ? resolvePublicAssetUrl(img) : null}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      <WhyChooseSection />
      <BuyingProcessSection />
      <LocationAdvantagesSection />
      <SiteVisitSection />
      <HomeFaqTeaser />

      <section className="re-section bg-slate-100/80">
        <div className="re-container max-w-3xl">
          <p className="re-eyebrow text-center">Planning</p>
          <h2 className="re-heading mt-2 text-center">Property investment calculator</h2>
          <p className="re-subheading mt-2 text-center">Indicative estimate only — confirm pricing with our team.</p>
          <div className="mt-8">
            <InvestmentCalculator />
          </div>
        </div>
      </section>
    </RealEstatePageShell>
  );
}
