'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { PublicAssetImg } from '@/components/site/PublicAssetImg';
import { SiteImage } from '@/components/site/SiteImage';
import type { JkNagarPhase } from '@/lib/jk-nagar-phases';
import { RE_ROUTES } from '@/lib/site-routes';

type Props = {
  phase: JkNagarPhase;
  imageSrc: string;
  imageAlt: string;
  coverImageUrl?: string | null;
  description?: string | null;
  onEnquire: () => void;
  className?: string;
  reveal?: boolean;
};

export function JkNagarPhaseCard({
  phase,
  imageSrc,
  imageAlt,
  coverImageUrl,
  description,
  onEnquire,
  className,
  reveal,
}: Props) {
  const body = description?.trim() || phase.summary;
  const detailHref =
    phase.id === 'phase-1'
      ? RE_ROUTES.jkNagarPhase1
      : phase.id === 'phase-2'
        ? RE_ROUTES.jkNagarPhase2
        : RE_ROUTES.jkNagarPhase3;

  return (
    <article
      className={clsx(
        'group flex flex-col rounded-2xl border border-emerald-100/80 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300',
        reveal && 'reveal',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {coverImageUrl ? (
          <SiteImage src={coverImageUrl} alt={`${phase.name} layout`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
        ) : (
          <PublicAssetImg src={imageSrc} alt={imageAlt} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
        )}
        <span className="absolute top-3 left-3 inline-flex rounded-full bg-emerald-800/95 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {phase.publicStatusLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-lg font-bold text-slate-900">{phase.name}</h3>
        <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
          {phase.mapsPlaceUrl ? (
            <a
              href={phase.mapsPlaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1.5 text-emerald-800 hover:text-emerald-950 hover:underline font-medium"
            >
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
              <span>{phase.locationLabel}</span>
            </a>
          ) : (
            <>
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700" aria-hidden />
              <span>{phase.locationLabel}</span>
            </>
          )}
        </div>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed flex-1">{body}</p>
        {phase.facilities.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Confirmed highlights">
            {phase.facilities.map((f) => (
              <li key={f.label} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900 border border-emerald-100">
                {f.label}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-xs text-slate-500">
          Plot availability and pricing are confirmed with our team — ongoing development does not guarantee immediate possession.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onEnquire}
            className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Plot Enquiry
          </button>
          <Link
            href={detailHref}
            className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
