import type { ReactNode } from 'react';
import Link from 'next/link';
import { SRI_BALAJI } from '@/lib/jewellery-business';
import { JW_ROUTES } from '@/lib/site-routes';

export function JwPageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
}) {
  return (
    <header className="jw-container jw-section-inner pb-0">
      {breadcrumbs}
      {eyebrow ? <p className="text-xs font-medium tracking-wide text-amber-800/90 uppercase">{eyebrow}</p> : null}
      <h1 className="jw-heading mt-1 text-2xl md:text-[1.75rem] font-semibold text-stone-900">{title}</h1>
      {description ? <p className="mt-2 text-sm md:text-base text-stone-600 max-w-2xl leading-relaxed">{description}</p> : null}
    </header>
  );
}

export function JwBreadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="text-xs text-stone-500 mb-3" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 ? <span className="mx-1.5">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-amber-900">
              {item.label}
            </Link>
          ) : (
            <span className="text-stone-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function JwInnerBand({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`jw-section-inner border-t border-stone-200/70 ${className}`}>
      <div className="jw-container">{children}</div>
    </section>
  );
}

export function JwShowroomCtaBar({
  title = 'Visit or call the showroom',
  detail = 'See pieces in person for weight, purity, and final pricing — gallery images are illustrative.',
  primaryHref = JW_ROUTES.visit,
  primaryLabel = 'Visit showroom',
}: {
  title?: string;
  detail?: string;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <JwInnerBand className="bg-amber-50/60">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold text-stone-900">{title}</p>
          <p className="mt-1 text-sm text-stone-600 max-w-xl">{detail}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link href={primaryHref} className="jw-btn-gold text-sm !py-2 !px-4">
            {primaryLabel}
          </Link>
          <Link href={JW_ROUTES.contact} className="jw-btn-outline text-sm !py-2 !px-4">
            Contact
          </Link>
        </div>
      </div>
    </JwInnerBand>
  );
}

export function JwRatesExplainer() {
  return (
    <JwInnerBand className="bg-white">
      <h2 className="text-base font-semibold text-stone-900">About these rates</h2>
      <p className="mt-2 text-sm text-stone-600 max-w-2xl leading-relaxed">
        22K and silver are per gram from KJPL. 24K is calculated from 22K. One sovereign is 22K × 8 g. Making charges and GST are extra.
      </p>
    </JwInnerBand>
  );
}

export function JwSchemeProcessNote() {
  return (
    <JwInnerBand className="bg-[#faf8f4]">
      <h2 className="text-base font-semibold text-stone-900">How scheme enquiry works</h2>
      <ol className="mt-2 text-sm text-stone-600 space-y-1 list-decimal pl-5 max-w-xl">
        <li>Choose a planning amount (₹5,000–₹1,00,000) and submit the form below.</li>
        <li>Our team calls you with approved scheme terms from the showroom.</li>
        <li>Enrolment and payment happen in person — not on this website.</li>
      </ol>
    </JwInnerBand>
  );
}

export function JwCollectionLinks() {
  return (
    <JwInnerBand>
      <h2 className="text-base font-semibold text-stone-900">Other collections</h2>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <Link href={JW_ROUTES.collections} className="text-amber-900 font-medium hover:underline">
          All collections
        </Link>
        <Link href={JW_ROUTES.collection('gold')} className="text-amber-900 hover:underline">
          Gold
        </Link>
        <Link href={JW_ROUTES.collection('silver')} className="text-amber-900 hover:underline">
          Silver
        </Link>
        <Link href={JW_ROUTES.collection('diamond')} className="text-amber-900 hover:underline">
          Diamond
        </Link>
      </div>
    </JwInnerBand>
  );
}

export function JwFaqContactCta() {
  return (
    <JwInnerBand className="bg-white">
      <p className="text-sm text-stone-700">
        Need help with rates, purity, or the savings scheme?{' '}
        <Link href={JW_ROUTES.contact} className="font-semibold text-amber-900 hover:underline">
          Contact the showroom
        </Link>{' '}
        or call{' '}
        <a href={`tel:${SRI_BALAJI.phoneE164}`} className="font-semibold text-amber-900 hover:underline">
          {SRI_BALAJI.phoneDisplay}
        </a>
        .
      </p>
    </JwInnerBand>
  );
}

export function JwAboutTrustStrip() {
  return (
    <JwInnerBand className="bg-[#faf8f4]">
      <p className="text-sm text-stone-600">{SRI_BALAJI.gstNote}</p>
      <p className="mt-1 text-sm text-stone-600">{SRI_BALAJI.hours.open}</p>
    </JwInnerBand>
  );
}
