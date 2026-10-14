import Link from 'next/link';
import { JewelleryHero } from '@/components/jewellery/JewelleryHero';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { MarketRatesBanner } from '@/components/jewellery/MarketRatesBanner';
import { JsonLd } from '@/components/site/JsonLd';
import { SRI_BALAJI } from '@/lib/jewellery-business';
import {
  CollectionsPreview,
  GoldSchemePromo,
  HomeFaqTeaser,
  ShowroomStrip,
  WhyChooseJewellery,
} from '@/components/jewellery/JewelleryHomeSections';
import { JW_ROUTES } from '@/lib/site-routes';

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
    description: SRI_BALAJI.tagline,
  };

  return (
    <JewelleryPageShell>
      <JsonLd data={jsonLd} />
      <JewelleryHero />
      <MarketRatesBanner />
      <section className="jw-section bg-white">
        <div className="jw-container grid sm:grid-cols-3 gap-6">
          {[
            { title: 'Collections', href: JW_ROUTES.collections, desc: 'Gold, silver, platinum & diamond.' },
            { title: 'Gold rates', href: JW_ROUTES.goldRates, desc: 'Live reference rates when configured.' },
            { title: 'Visit us', href: JW_ROUTES.visit, desc: 'Gandhi Road showroom — Cheyyar.' },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="jw-card p-6 hover:shadow-md transition-shadow">
              <h2 className="font-semibold text-stone-900">{c.title}</h2>
              <p className="text-sm text-stone-600 mt-2">{c.desc}</p>
              <span className="inline-block mt-4 text-sm font-medium text-amber-900">Explore →</span>
            </Link>
          ))}
        </div>
      </section>
      <CollectionsPreview />
      <GoldSchemePromo />
      <WhyChooseJewellery />
      <ShowroomStrip />
      <HomeFaqTeaser />
    </JewelleryPageShell>
  );
}
