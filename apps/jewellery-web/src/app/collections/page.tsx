import type { Metadata } from 'next';
import Link from 'next/link';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
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
      <section className="jw-section">
        <div className="jw-container">
          <h1 className="jw-heading text-3xl font-semibold text-stone-900">Our Collections</h1>
          <p className="mt-3 text-stone-600 max-w-2xl">
            Illustrative category showcases — visit or call the showroom for what is in stock today.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-6 lg:gap-8">
            {JEWELLERY_COLLECTIONS.map((c) => (
              <article key={c.id} className="jw-card">
                <div className="jw-card-image relative aspect-[4/3]">
                  <SiteImage src={c.image.src} alt={`Illustrative ${c.title.toLowerCase()} showcase`} fill sizes="(max-width:768px) 100vw, 50vw" />
                </div>
                <div className="p-5 md:p-6">
                  <h2 className="jw-heading text-xl font-semibold text-stone-900">{c.title}</h2>
                  <Link href={JW_ROUTES.collection(c.id)} className="mt-4 inline-flex jw-btn-outline text-sm">
                    View collection →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
