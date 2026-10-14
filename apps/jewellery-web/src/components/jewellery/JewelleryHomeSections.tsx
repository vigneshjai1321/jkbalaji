import Link from 'next/link';
import { SiteImage } from '@/components/site/SiteImage';
import { JEWELLERY_COLLECTIONS } from '@/lib/jewellery-collections';
import { SRI_BALAJI } from '@/lib/jewellery-business';
import { JW_ROUTES } from '@/lib/site-routes';

export function CollectionsPreview() {
  return (
    <section className="jw-section bg-white" id="collections">
      <div className="jw-container">
        <h2 className="jw-heading text-2xl font-semibold text-stone-900">Featured collections</h2>
        <p className="mt-2 text-stone-600 text-sm max-w-2xl">
          Illustrative category showcases — visit the showroom for current stock, weight, and pricing.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {JEWELLERY_COLLECTIONS.map((c) => (
            <Link key={c.id} href={JW_ROUTES.collection(c.id)} className="jw-card overflow-hidden group">
              <div className="relative aspect-[4/3]">
                <SiteImage src={c.image.src} alt={`Illustrative ${c.title}`} fill sizes="25vw" className="group-hover:scale-105 transition-transform" />
              </div>
              <p className="p-4 font-medium text-stone-900">{c.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GoldSchemePromo() {
  return (
    <section className="jw-section bg-gradient-to-r from-amber-900 to-amber-800 text-white">
      <div className="jw-container flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="jw-heading text-2xl font-semibold">Gold savings scheme</h2>
          <p className="mt-2 text-amber-100/90 max-w-xl text-sm">
            Plan contributions from ₹5,000 to ₹1,00,000 — enquire online; enrolment and payment in showroom when approved.
          </p>
        </div>
        <Link href={JW_ROUTES.goldSchemes} className="jw-btn-gold !bg-white !text-amber-900 shrink-0">
          View scheme
        </Link>
      </div>
    </section>
  );
}

export function WhyChooseJewellery() {
  const items = [
    { title: 'Trusted showroom', desc: SRI_BALAJI.experience },
    { title: 'GST billing', desc: SRI_BALAJI.gstNote },
    { title: 'Gold, silver, platinum & diamond', desc: 'Categories we display match our showroom focus.' },
    { title: 'Cheyyar Gandhi Road', desc: SRI_BALAJI.addressLine },
  ];
  return (
    <section className="jw-section">
      <div className="jw-container">
        <h2 className="jw-heading text-2xl font-semibold text-stone-900">Why Sri Balaji Thangamaligai</h2>
        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.title} className="jw-card p-5">
              <h3 className="font-semibold text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ShowroomStrip() {
  return (
    <section className="jw-section bg-[#faf8f4] border-y border-stone-200/60">
      <div className="jw-container grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="jw-heading text-xl font-semibold">Visit the showroom</h2>
          <p className="mt-2 text-sm text-stone-600">{SRI_BALAJI.hours.open}</p>
          <p className="text-sm text-stone-500">{SRI_BALAJI.hours.closed}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={JW_ROUTES.visit} className="jw-btn-gold text-sm">
              Visit showroom
            </Link>
            <a href={`tel:${SRI_BALAJI.phoneE164}`} className="jw-btn-outline text-sm">
              Call {SRI_BALAJI.phoneDisplay}
            </a>
          </div>
        </div>
        <p className="text-sm text-stone-600">
          Services such as repairs, exchange, and customization — ask in person; see{' '}
          <Link href={JW_ROUTES.services} className="text-amber-900 underline">
            services
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

export function HomeFaqTeaser() {
  return (
    <section className="jw-section bg-white">
      <div className="jw-container flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-stone-700">Questions about purity, making charges, or the savings scheme?</p>
        <Link href={JW_ROUTES.faq} className="jw-btn-outline text-sm">
          Read FAQs
        </Link>
      </div>
    </section>
  );
}
