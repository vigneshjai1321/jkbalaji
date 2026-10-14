import ScrollReveal from '@/components/ScrollReveal';
import WhatsAppButton from '@/components/WhatsAppButton';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { JsonLd } from '@/components/site/JsonLd';
import { JewelleryNavbar } from '@/components/jewellery/JewelleryNavbar';
import { JewelleryHero } from '@/components/jewellery/JewelleryHero';
import { MarketRatesBanner } from '@/components/jewellery/MarketRatesBanner';
import { JewelleryFooter } from '@/components/jewellery/JewelleryFooter';
import { JewelleryMap } from '@/components/jewellery/JewelleryMap';
import { SRI_BALAJI } from '@/lib/jewellery-business';
import { JEWELLERY_COLLECTIONS } from '@/lib/jewellery-collections';
import { jewelleryImages } from '@/lib/site-images';
import Link from 'next/link';

export default function JewelleryHome() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: SRI_BALAJI.name,
    url: SRI_BALAJI.url,
    telephone: SRI_BALAJI.phoneE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 49/3, Gandhi Road',
      addressLocality: 'Cheyyar',
      addressRegion: 'Tamil Nadu',
      postalCode: '604407',
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    description: SRI_BALAJI.tagline,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JewelleryNavbar />
      <main>
        <JewelleryHero />
        <MarketRatesBanner />

        <ScrollReveal>
          <section id="collections" className="jw-section">
            <div className="jw-container">
              <h2 className="jw-heading text-2xl md:text-3xl font-semibold text-stone-900">Our Collections</h2>
              <p className="mt-2 text-stone-600 max-w-2xl text-sm md:text-base">
                Gold, silver, platinum and diamond pieces. Photos are examples — visit or call the showroom for what is in stock
                today.
              </p>
              <div className="mt-10 grid sm:grid-cols-2 gap-6 lg:gap-8">
                {JEWELLERY_COLLECTIONS.map((c) => (
                  <article key={c.id} className="jw-card reveal">
                    <div className="jw-card-image">
                      <img src={c.image.src} alt={`Illustrative ${c.title.toLowerCase()} showcase`} width={800} height={600} loading="lazy" />
                    </div>
                    <div className="p-5 md:p-6">
                      <h3 className="jw-heading text-xl font-semibold text-stone-900">{c.title}</h3>
                      <ul className="mt-3 space-y-1.5 text-sm text-stone-600 list-disc pl-4">
                        {c.examples.map((ex) => (
                          <li key={ex}>{ex}</li>
                        ))}
                      </ul>
                      <Link href="#contact" className="mt-5 inline-flex jw-btn-outline text-sm">
                        Enquire About {c.title.split(' ')[0]}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="schemes" className="jw-section bg-gradient-to-b from-amber-50/80 to-[#faf8f4] border-y border-amber-100/80">
            <div className="jw-container max-w-3xl text-center">
              <h2 className="jw-heading text-2xl md:text-3xl font-semibold text-stone-900">
                Gold Savings Scheme — Enquire at Our Store
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed">
                We offer a gold savings scheme for customers who wish to plan their purchases. Please visit or call our showroom
                for full details — our team will explain how to enrol and answer your questions in person.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={SRI_BALAJI.schemeTel} className="jw-btn-gold w-full sm:w-auto">
                  Call {SRI_BALAJI.schemePhoneDisplay}
                </a>
                <a
                  href={`https://wa.me/${SRI_BALAJI.whatsappNumber}?text=${encodeURIComponent('Gold savings scheme enquiry — Sri Balaji Thangamaligai')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="jw-btn-outline w-full sm:w-auto"
                >
                  WhatsApp Enquiry
                </a>
              </div>
            </div>
          </section>

          <section id="about" className="jw-section bg-white">
            <div className="jw-container grid lg:grid-cols-2 gap-10 items-center">
              <div className="reveal">
                <h2 className="jw-heading text-2xl md:text-3xl font-semibold text-stone-900">About {SRI_BALAJI.name}</h2>
                <p className="mt-4 text-stone-600 leading-relaxed">
                  {SRI_BALAJI.name} is a trusted jewellery showroom on Gandhi Road, Cheyyar, serving customers with gold, silver,
                  platinum and diamond jewellery. {SRI_BALAJI.experience}. We operate as a {SRI_BALAJI.gstNote.toLowerCase()}.
                </p>
                <p className="mt-4 text-stone-600 leading-relaxed">
                  Visit us to browse collections, discuss custom designs, or learn about our gold savings scheme — our team is
                  ready to assist you in the showroom.
                </p>
              </div>
              <div className="reveal rounded-2xl overflow-hidden border border-stone-200 shadow-md jw-card-image max-h-80">
                <img
                  src={jewelleryImages.bridal}
                  alt="Illustrative bridal gold jewellery showcase"
                  width={1200}
                  height={900}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>

          <section className="jw-section bg-stone-100/60">
            <div className="jw-container">
              <h2 className="jw-heading text-2xl md:text-3xl font-semibold text-stone-900 text-center">Meet Our Proprietors</h2>
              <p className="mt-2 text-center text-stone-600 text-sm">Professional service led by our proprietors in Cheyyar.</p>
              <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {SRI_BALAJI.proprietors.map((p) => (
                  <article key={p.name} className="jw-card p-6 text-center reveal">
                    <div
                      className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center text-amber-900 text-xl font-semibold jw-heading"
                      aria-hidden
                    >
                      {p.name.charAt(0)}
                    </div>
                    <h3 className="mt-4 jw-heading text-xl font-semibold">{p.name}</h3>
                    <p className="text-sm text-amber-800/80 font-medium">{p.role}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="services" className="jw-section">
            <div className="jw-container">
              <h2 className="jw-heading text-2xl md:text-3xl font-semibold text-stone-900">Services &amp; Trust</h2>
              <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { t: 'Custom Jewellery Design', d: 'Share your ideas — enquire in-store for custom design consultations.' },
                  { t: 'Old Gold Buyback & Exchange', d: 'Ask our team about buyback and exchange options when you visit.' },
                  { t: 'Collection Enquiries', d: 'Gold, silver, platinum and diamond — we help you choose in person.' },
                  { t: 'Store Location & Hours', d: `${SRI_BALAJI.hours.open}. ${SRI_BALAJI.hours.closed}.` },
                  { t: 'GST-Compliant Billing', d: SRI_BALAJI.gstNote },
                  { t: 'Regional Experience', d: SRI_BALAJI.experience },
                ].map((s) => (
                  <article key={s.t} className="reveal rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-stone-900">{s.t}</h3>
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed">{s.d}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="gallery" className="jw-section bg-white border-t border-stone-100">
            <div className="jw-container">
              <h2 className="jw-heading text-2xl font-semibold text-stone-900">Gallery</h2>
              <p className="mt-1 text-sm text-stone-500">Illustrative jewellery photography — not specific in-store inventory.</p>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {jewelleryImages.gallery.map((g) => (
                  <div key={g.src} className="reveal aspect-square rounded-xl overflow-hidden border border-stone-100">
                    <img src={g.src} alt={g.alt} width={400} height={400} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <JewelleryMap />

          <section id="contact" className="jw-section bg-stone-950 text-stone-100">
            <div className="jw-container grid lg:grid-cols-2 gap-10">
              <div className="reveal">
                <h2 className="jw-heading text-2xl md:text-3xl font-semibold text-white">Contact Us</h2>
                <p className="mt-3 text-stone-400 text-sm leading-relaxed">{SRI_BALAJI.addressLine}</p>
                <div className="mt-6 space-y-2 text-sm">
                  <p>
                    <span className="text-stone-500">Phone: </span>
                    <a href={`tel:${SRI_BALAJI.phoneE164}`} className="text-amber-200 hover:underline">
                      {SRI_BALAJI.phoneDisplay}
                    </a>
                  </p>
                  <p>
                    <span className="text-stone-500">Gold scheme: </span>
                    <a href={SRI_BALAJI.schemeTel} className="text-amber-200 hover:underline">
                      {SRI_BALAJI.schemePhoneDisplay}
                    </a>
                  </p>
                  <p className="text-stone-400">{SRI_BALAJI.hours.open}</p>
                  <p className="text-stone-400">{SRI_BALAJI.hours.closed}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={`tel:${SRI_BALAJI.phoneE164}`} className="jw-btn-gold">
                    Call Now
                  </a>
                  <a href={SRI_BALAJI.directionsUrl} target="_blank" rel="noreferrer" className="jw-btn-outline !text-stone-100 !border-stone-600">
                    Directions
                  </a>
                </div>
              </div>
              <div className="reveal rounded-2xl bg-white text-stone-900 p-6 md:p-8 shadow-xl">
                <h3 className="font-semibold text-lg">General Contact Form</h3>
                <p className="text-sm text-stone-500 mt-1">Enquiries are saved securely — our team will follow up.</p>
                <ContactLeadForm leadType="GENERAL_CONTACT" />
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>
      <JewelleryFooter />
      <WhatsAppButton phone={SRI_BALAJI.whatsappNumber} text="Hello, I have an enquiry for Sri Balaji Thangamaligai." />
    </>
  );
}
