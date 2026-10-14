'use client';

import { propertyDetailPath } from '@/lib/site-paths';

type Props = {
  title: string;
  location: string;
  priceInr: string;
  slug: string;
  imageUrl: string;
};

export function PropertyShowcaseCard({ title, location, priceInr, slug, imageUrl }: Props) {
  return (
    <article className="group h-full flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300">
      <div className="relative h-52 sm:h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          width={800}
          height={560}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent opacity-80" />
        <span className="absolute bottom-3 left-3 text-xs font-semibold tracking-wide text-emerald-100 bg-white/10 backdrop-blur px-2 py-1 rounded-lg border border-white/20">
          Featured
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-slate-900 leading-snug">{title}</h3>
        <p className="text-sm text-slate-600 mt-2">{location}</p>
        <p className="mt-4 font-bold text-emerald-800 text-xl tabular-nums">₹ {Number(priceInr).toLocaleString('en-IN')}</p>
        <a
          href={propertyDetailPath(slug)}
          className="inline-flex mt-auto pt-5 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          View Details →
        </a>
      </div>
    </article>
  );
}
