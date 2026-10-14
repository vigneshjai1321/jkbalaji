import type { Metadata } from 'next';
import Link from 'next/link';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwPageHeader, JwShowroomCtaBar } from '@/components/jewellery/inner/JwInnerBlocks';
import { SiteImage } from '@/components/site/SiteImage';
import { JEWELLERY_COLLECTIONS } from '@/lib/jewellery-collections';
import { JW_ROUTES } from '@/lib/site-routes';

export const metadata: Metadata = {
  title: 'Collections | Sri Balaji Thangamaligai',
  description: 'Gold, silver, platinum and diamond jewellery collections at our Cheyyar showroom.',
  alternates: { canonical: 'https://cheyyarbalaji.com/collections' },
};

export default function CollectionsPage() {
  return (
    <JewelleryPageShell>
      <JwPageHeader
        eyebrow="Showroom"
        title="Our Collections"
        description="Illustrative category showcases — visit or call for what is in stock today."
      />
      <section className="jw-section-inner pt-0">
        <div className="jw-container">
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
            {JEWELLERY_COLLECTIONS.map((c) => (
              <article key={c.id} className="jw-card">
                <div className="jw-card-image relative aspect-[4/3]">
                  <SiteImage src={c.image.src} alt={`Illustrative ${c.title.toLowerCase()} showcase`} fill sizes="(max-width:768px) 100vw, 50vw" />
                </div>
                <div className="p-4 md:p-5">
                  <h2 className="jw-heading text-lg font-semibold text-stone-900">{c.title}</h2>
                  <p className="mt-1 text-xs text-stone-500 line-clamp-2">{c.examples[0]}</p>
                  <Link href={JW_ROUTES.collection(c.id)} className="mt-3 inline-flex jw-btn-outline text-sm !py-1.5 !px-3">
                    View collection →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <JwShowroomCtaBar />
    </JewelleryPageShell>
  );
}
