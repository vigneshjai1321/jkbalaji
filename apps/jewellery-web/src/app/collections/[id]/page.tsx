import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { SiteImage } from '@/components/site/SiteImage';
import { JEWELLERY_COLLECTIONS } from '@/lib/jewellery-collections';
import { JW_ROUTES } from '@/lib/site-routes';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = JEWELLERY_COLLECTIONS.find((x) => x.id === id);
  if (!c) return { title: 'Collection | Sri Balaji Thangamaligai' };
  return {
    title: `${c.title} | Sri Balaji Thangamaligai`,
    description: `Enquire about ${c.title.toLowerCase()} at our Cheyyar showroom.`,
    alternates: { canonical: `https://cheyyarbalaji.com/collections/${id}` },
  };
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = JEWELLERY_COLLECTIONS.find((x) => x.id === id);
  if (!c) notFound();

  return (
    <JewelleryPageShell>
      <section className="jw-section">
        <div className="jw-container max-w-3xl">
          <nav className="text-sm text-stone-500 mb-4">
            <Link href={JW_ROUTES.collections} className="hover:text-amber-900">
              Collections
            </Link>
            <span className="mx-2">/</span>
            <span className="text-stone-800">{c.title}</span>
          </nav>
          <div className="rounded-2xl overflow-hidden border border-stone-200 relative aspect-[16/10] mb-8">
            <SiteImage src={c.image.src} alt={`Illustrative ${c.title.toLowerCase()} photography`} fill sizes="100vw" priority />
          </div>
          <h1 className="jw-heading text-3xl font-semibold text-stone-900">{c.title}</h1>
          <p className="mt-3 text-sm text-amber-900/80 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Photos are illustrative examples — not specific in-store inventory.
          </p>
          <ul className="mt-6 space-y-2 text-stone-700 list-disc pl-5">
            {c.examples.map((ex) => (
              <li key={ex}>{ex}</li>
            ))}
          </ul>
          <Link href={JW_ROUTES.contact} className="jw-btn-gold inline-flex mt-8">
            Enquire in showroom
          </Link>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
