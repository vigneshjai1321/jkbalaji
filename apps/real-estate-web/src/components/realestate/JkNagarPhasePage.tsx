import { ContactLeadForm } from '@/components/ContactLeadForm';
import { SiteImage } from '@/components/site/SiteImage';
import { RealEstatePageShell } from './RealEstatePageShell';
import { JK_NAGAR_PHASES, leadTypeForPhase, type JkNagarPhaseId } from '@/lib/jk-nagar-phases';
import { realEstateImages } from '@/lib/site-images';
import { RE_ROUTES } from '@/lib/site-routes';
import { ReBreadcrumbs, ReEnquireCtaBar, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';

export function JkNagarPhasePage({ phaseId }: { phaseId: JkNagarPhaseId }) {
  const phase = JK_NAGAR_PHASES.find((p) => p.id === phaseId)!;
  const image = realEstateImages.gallery[phase.imageIndex] ?? realEstateImages.gallery[0]!;

  return (
    <RealEstatePageShell whatsappText={`JK Nagar ${phaseId.replace('phase-', 'Phase ')} enquiry`}>
      <RePageHeader
        eyebrow={phase.statusLabel}
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
        <div className="mt-6 max-w-xl">
          {phase.plotsAvailable ? (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Plot enquiry</h2>
              <p className="text-sm text-slate-600 mt-2">Our team confirms availability, pricing, and documentation on call or visit.</p>
              <div className="mt-6">
                <ContactLeadForm site="REAL_ESTATE" leadType={leadTypeForPhase(phaseId)} sourcePage={`/jk-nagar/${phaseId}`} />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Register interest</h2>
              <p className="text-sm text-slate-600 mt-2">Bookings are not open yet. We will contact you when official details are published.</p>
              <div className="mt-6">
                <ContactLeadForm site="REAL_ESTATE" leadType={leadTypeForPhase(phaseId)} sourcePage={`/jk-nagar/${phaseId}`} />
              </div>
            </>
          )}
        </div>
      </div>
      {phase.plotsAvailable ? (
        <ReEnquireCtaBar title="Schedule a JK Nagar site visit" detail="Phase 3 remains register-interest only — our team confirms which plots are open for enquiry." />
      ) : null}
    </RealEstatePageShell>
  );
}
