import { InvestmentCalculator } from '@/components/public/InvestmentCalculator';
import { PropertyShowcaseCard } from '@/components/public/PropertyShowcaseCard';
import { ProjectsBlock } from '@/components/public/ProjectsBlock';
import { JkNagarPhasesSection } from '@/components/realestate/JkNagarPhasesSection';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollReveal from '@/components/ScrollReveal';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { RealEstateNavbar } from '@/components/realestate/RealEstateNavbar';
import { RealEstateHero } from '@/components/realestate/RealEstateHero';
import { TamilNaduCoverage } from '@/components/realestate/TamilNaduCoverage';
import { RealEstateFooter } from '@/components/site/RealEstateFooter';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { FaqSection } from '@/components/site/FaqSection';
import { MapEmbed } from '@/components/site/MapEmbed';
import { JsonLd } from '@/components/site/JsonLd';
import { apiGet } from '@/lib/api';
import { realEstateImages } from '@/lib/site-images';

type Property = {
  id: string;
  title: string;
  slug: string;
  location: string;
  priceInr: string;
};

type Project = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  phase: 'ONGOING' | 'COMPLETED' | 'UPCOMING';
  description: string | null;
};

const categories = [
  'Residential',
  'Commercial',
  'Villa',
  'Farm Land',
  'DTCP Approved Plots',
  'Investment Properties',
];

export default async function RealEstateHome() {
  let properties: Property[] = [];
  let projects: Project[] = [];
  const [propsRes, projRes] = await Promise.allSettled([
    apiGet<Property[]>('/public/properties'),
    apiGet<Project[]>('/public/projects'),
  ]);
  if (propsRes.status === 'fulfilled') properties = propsRes.value;
  if (projRes.status === 'fulfilled') projects = projRes.value;

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
    <>
      <JsonLd data={jsonLd} />
      <RealEstateNavbar />
      <main className="bg-slate-50 text-slate-900 overflow-x-hidden">
        <RealEstateHero />
        <ScrollReveal>
          <section id="about" className="re-section">
            <div className="re-container">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="reveal">
                  <p className="re-eyebrow">About Us</p>
                  <h2 className="re-heading mt-2">Plots and Layouts You Can Trust</h2>
                  <p className="re-subheading mt-4">
                    We help families and investors find verified plots around Cheyyar and Tamil Nadu — with clear
                    documentation, honest pricing, and support from site visit to registration.
                  </p>
                </div>
                <div className="reveal rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200/80">
                  <img
                    src={realEstateImages.about}
                    alt="JK Balaji real estate developments"
                    className="w-full h-72 md:h-80 object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="properties" className="re-section bg-white">
            <div className="re-container">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="re-eyebrow">Portfolio</p>
                  <h2 className="re-heading mt-2">Featured Properties</h2>
                  <p className="re-subheading mt-2 max-w-xl">Live listings from our admin panel — availability is confirmed when you enquire.</p>
                </div>
              </div>
              {properties.length === 0 ? (
                <p className="mt-8 text-slate-600 reveal max-w-xl">
                  No properties are published right now. Call or message us for the latest plots and JK Nagar phases.
                </p>
              ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((p, idx) => (
                    <div key={p.id} className="reveal">
                      <PropertyShowcaseCard
                        title={p.title}
                        location={p.location}
                        priceInr={p.priceInr}
                        slug={p.slug}
                        imageUrl={realEstateImages.gallery[idx % realEstateImages.gallery.length]!.src}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="investment" className="re-section bg-slate-100/80">
            <div className="re-container">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <p className="re-eyebrow">Planning</p>
                <h2 className="re-heading mt-2">Rough Budget Calculator</h2>
                <p className="re-subheading mt-3">A simple estimate only — final pricing and availability come from our team.</p>
              </div>
              <div className="reveal max-w-3xl mx-auto">
                <InvestmentCalculator />
              </div>
            </div>
          </section>

          <JkNagarPhasesSection />
          <ProjectsBlock projects={projects} />

          <section id="why" className="re-section bg-emerald-950 text-white">
            <div className="re-container">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Choose JK Balaji</h2>
                <p className="mt-3 text-emerald-100/90 text-lg leading-relaxed">
                  Clear titles, guided site visits, and support through registration.
                </p>
              </div>
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { t: 'Legal Clarity', d: 'Clear titles and DTCP-approved layouts shared per project.' },
                  { t: 'Statewide Reach', d: 'Plots and developments across major districts.' },
                  { t: 'Flexible Plans', d: 'Structured payment options for families and investors.' },
                  { t: 'Site Support', d: 'Guided visits and registration assistance.' },
                ].map((c) => (
                  <article
                    key={c.t}
                    className="reveal rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
                  >
                    <h3 className="text-lg font-semibold">{c.t}</h3>
                    <p className="mt-2 text-sm text-emerald-100/85 leading-relaxed">{c.d}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <TamilNaduCoverage />

          <section id="categories" className="re-section bg-white border-y border-slate-100">
            <div className="re-container">
              <h2 className="re-heading reveal">Property Categories</h2>
              <div className="mt-8 flex flex-wrap gap-3">
                {categories.map((c) => (
                  <span
                    key={c}
                    className="reveal px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-100 text-sm font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section id="gallery" className="re-section">
            <div className="re-container">
              <h2 className="re-heading reveal">Project Gallery</h2>
              <p className="re-subheading mt-2 reveal max-w-xl">Sample photography — ask us for photos of the project you are interested in.</p>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {realEstateImages.gallery.map((g) => (
                  <div key={g.src} className="reveal aspect-square rounded-2xl overflow-hidden shadow-md ring-1 ring-slate-200/60">
                    <img
                      src={g.src}
                      alt={g.alt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <FaqSection
            title="Frequently Asked Questions"
            items={[
              { q: 'Are your layouts DTCP approved?', a: 'Yes — we prioritize DTCP-approved and legally verifiable layouts. Specific approvals are shared per project.' },
              { q: 'Do you operate outside Cheyyar?', a: 'Yes. We market and develop properties across Tamil Nadu.' },
              { q: 'How do I book a site visit?', a: 'Call us, use WhatsApp, or submit the enquiry form below.' },
            ]}
          />

          <section id="contact" className="re-section bg-gradient-to-b from-emerald-50/50 to-white">
            <div className="re-container">
              <div className="reveal rounded-3xl bg-white p-8 md:p-10 shadow-xl border border-slate-200/80 max-w-3xl mx-auto">
                <p className="re-eyebrow">Contact</p>
                <h2 className="re-heading mt-2">Enquire About a Property</h2>
                <p className="re-subheading mt-2">We respond within one business day.</p>
                <ContactLeadForm site="REAL_ESTATE" />
              </div>
            </div>
          </section>

          <MapEmbed title="Find Us on the Map" />
        </ScrollReveal>
      </main>
      <RealEstateFooter />
      <WhatsAppButton phone={JK_BALAJI_RE.whatsappNumber} text="Hi, I want to enquire about JK Balaji properties" />
    </>
  );
}
