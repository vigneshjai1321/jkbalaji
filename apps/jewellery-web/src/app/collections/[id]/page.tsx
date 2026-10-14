import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwBreadcrumbs, JwCollectionLinks, JwShowroomCtaBar } from '@/components/jewellery/inner/JwInnerBlocks';
import { SiteImage } from '@/components/site/SiteImage';
import { JsonLd } from '@/components/site/JsonLd';
import { JEWELLERY_COLLECTIONS } from '@/lib/jewellery-collections';
import { JW_ROUTES } from '@/lib/site-routes';
import { buildJwPageMetadata, JW_SITE_ORIGIN } from '@/lib/seo/metadata';
import { jwBreadcrumbJsonLd, jwCollectionProductJsonLd } from '@/lib/seo/json-ld';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = JEWELLERY_COLLECTIONS.find((x) => x.id === id);
  if (!c) {
    return buildJwPageMetadata({
      title: 'Collection Not Found',
      description: 'This jewellery collection page is not available.',
      path: `/collections/${id}`,
      noIndex: true,
    });
  }
  const examples = c.examples.slice(0, 3).join(', ');
  return buildJwPageMetadata({
    title: c.title,
    description: `${c.title} at Sri Balaji Thangamaligai, Cheyyar — ${examples}. Visit Gandhi Road for current stock, weight, and pricing.`,
    path: `/collections/${id}`,
    keywords: [c.title, 'jewellery Cheyyar', 'Sri Balaji Thangamaligai'],
    ogImage: `${JW_SITE_ORIGIN}${c.image.src}`,
  });
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = JEWELLERY_COLLECTIONS.find((x) => x.id === id);
  if (!c) notFound();

  const url = `${JW_SITE_ORIGIN}/collections/${id}`;

  return (
    <JewelleryPageShell>
      <JsonLd
        data={[
          jwBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Collections', path: '/collections' },
            { name: c.title, path: `/collections/${id}` },
          ]),
          jwCollectionProductJsonLd({
            name: c.title,
            description: `Illustrative ${c.title.toLowerCase()} showcase — visit our Cheyyar showroom for current inventory.`,
            url,
            image: `${JW_SITE_ORIGIN}${c.image.src}`,
            category: c.title,
          }),
        ]}
      />
      <section className="jw-section-inner">
        <div className="jw-container max-w-3xl">
          <JwBreadcrumbs items={[{ href: JW_ROUTES.collections, label: 'Collections' }, { label: c.title }]} />
          <div className="rounded-xl overflow-hidden border border-stone-200 relative aspect-[16/10] mb-5 max-h-72">
            <SiteImage src={c.image.src} alt={`Illustrative ${c.title.toLowerCase()} photography`} fill sizes="100vw" priority />
          </div>
          <h1 className="jw-heading text-2xl font-semibold text-stone-900">{c.title}</h1>
          <p className="mt-2 text-sm text-amber-900/80 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Photos are illustrative — not specific in-store inventory.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-stone-700 list-disc pl-5">
            {c.examples.map((ex) => (
              <li key={ex}>{ex}</li>
            ))}
          </ul>
          <Link href={JW_ROUTES.contact} className="jw-btn-gold inline-flex mt-6 text-sm !py-2 !px-4">
            Enquire in showroom
          </Link>
        </div>
      </section>
      <JwCollectionLinks />
      <JwShowroomCtaBar />
    </JewelleryPageShell>
  );
}
