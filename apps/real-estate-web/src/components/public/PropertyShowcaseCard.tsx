'use client';

import Link from 'next/link';
import { SiteImage } from '@/components/site/SiteImage';
import { resolvePublicAssetUrl } from '@/lib/site-asset-url';
import { RE_ROUTES } from '@/lib/site-routes';

type Props = {
  title: string;
  location: string;
  priceInr: string;
  slug: string;
  imageUrl: string | null;
};

export function PropertyShowcaseCard({ title, location, priceInr, slug, imageUrl }: Props) {
  return (
    <article className="group h-full flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300">
      <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <SiteImage
            src={resolvePublicAssetUrl(imageUrl)}
            alt={`${title} — listing photo`}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
            Photo available on enquiry — contact us for site images.
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 to-transparent pointer-events-none" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-slate-900 leading-snug">{title}</h3>
        <p className="text-sm text-slate-600 mt-2">{location}</p>
        <p className="mt-4 font-bold text-emerald-800 text-xl tabular-nums">₹ {Number(priceInr).toLocaleString('en-IN')}</p>
        <Link href={RE_ROUTES.property(slug)} className="inline-flex mt-auto pt-5 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
          View Details →
        </Link>
      </div>
    </article>
  );
}
