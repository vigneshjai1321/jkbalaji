import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { SiteImage } from '@/components/site/SiteImage';
import { RealEstatePageShell } from './RealEstatePageShell';
import { JK_NAGAR_PHASES, leadTypeForPhase, type JkNagarPhaseId } from '@/lib/jk-nagar-phases';
import { realEstateImages } from '@/lib/site-images';
import { RE_ROUTES } from '@/lib/site-routes';
import { ReBreadcrumbs, ReEnquireCtaBar, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';
import { JsonLd } from '@/components/site/JsonLd';
import { reBreadcrumbJsonLd } from '@/lib/seo/json-ld';

export function JkNagarPhasePage({ phaseId }: { phaseId: JkNagarPhaseId }) {
  const phase = JK_NAGAR_PHASES.find((p) => p.id === phaseId)!;
  const image = realEstateImages.gallery[phase.imageIndex] ?? realEstateImages.gallery[0]!;

  return (
    <RealEstatePageShell whatsappText={`JK Nagar ${phaseId.replace('phase-', 'Phase ')} enquiry`}>
      <JsonLd
        data={reBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'JK Nagar', path: '/jk-nagar' },
          { name: phase.name, path: `/jk-nagar/${phaseId}` },
        ])}
      />
      <RePageHeader
        eyebrow={phase.publicStatusLabel}
        title={phase.name}
        description={phase.summary}
        breadcrumbs={
          <ReBreadcrumbs
            items={[
              { href: RE_ROUTES.home, label: 'Home' },
              { href: RE_ROUTES.jkNagar, label: 'JK Nagar' },
              { label: phase.name },
            ]}
          />
        }
      />
      <div className="re-container pb-6 md:pb-8">
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-3xl">
          <SiteImage src={image.src} alt={image.alt} width={1200} height={675} className="w-full h-auto max-h-64 object-cover" />
          <p className="text-xs text-slate-500 px-3 py-2 bg-white border-t border-slate-100">
            Layout photography — enquire for site-specific photos and availability.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {phase.mapsPlaceUrl ? (
            <a
              href={phase.mapsPlaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-emerald-800 hover:underline"
            >
              <MapPin className="h-4 w-4" aria-hidden />
              Open location on Google Maps
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-700" aria-hidden />
              {phase.locationLabel}
            </span>
          )}
        </div>
        {phase.facilities.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {phase.facilities.map((f) => (
              <li key={f.label} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900 border border-emerald-100">
                {f.label}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6 max-w-xl">
          <h2 className="text-lg font-semibold text-slate-900">Plot enquiry</h2>
          <p className="text-sm text-slate-600 mt-2">
            Our team confirms availability, pricing, facilities, and documentation on call or visit. Ongoing development status is separate
            from day-to-day plot availability.
          </p>
          <div className="mt-6">
            <ContactLeadForm
              site="REAL_ESTATE"
              leadType={leadTypeForPhase(phaseId)}
              projectSlug={phase.slug}
              sourcePage={`/jk-nagar/${phaseId}`}
              submitLabel="Enquire Now"
            />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            <Link href={RE_ROUTES.contact} className="text-emerald-800 hover:underline">
              Contact our team
            </Link>{' '}
            for competitive pricing — offers are shared on enquiry, not guaranteed online.
          </p>
        </div>
      </div>
      <ReEnquireCtaBar
        title="Schedule a JK Nagar site visit"
        detail="Tell us which phase you prefer — we confirm plot availability before scheduling."
      />
    </RealEstatePageShell>
  );
}
