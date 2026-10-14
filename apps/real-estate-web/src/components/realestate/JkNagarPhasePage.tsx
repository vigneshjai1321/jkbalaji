import Link from 'next/link';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { SiteImage } from '@/components/site/SiteImage';
import { RealEstatePageShell } from './RealEstatePageShell';
import { JK_NAGAR_PHASES, leadTypeForPhase, type JkNagarPhaseId } from '@/lib/jk-nagar-phases';
import { realEstateImages } from '@/lib/site-images';
import { RE_ROUTES } from '@/lib/site-routes';

export function JkNagarPhasePage({ phaseId }: { phaseId: JkNagarPhaseId }) {
  const phase = JK_NAGAR_PHASES.find((p) => p.id === phaseId)!;
  const image = realEstateImages.gallery[phase.imageIndex] ?? realEstateImages.gallery[0]!;

  return (
    <RealEstatePageShell whatsappText={`JK Nagar ${phaseId.replace('phase-', 'Phase ')} enquiry`}>
      <div className="re-container py-10 md:py-14">
        <nav className="text-sm text-slate-600 mb-4" aria-label="Breadcrumb">
          <Link href={RE_ROUTES.home} className="hover:text-emerald-800">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href={RE_ROUTES.jkNagar} className="hover:text-emerald-800">
            JK Nagar
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">{phase.name}</span>
        </nav>
        <p className="re-eyebrow">{phase.statusLabel}</p>
        <h1 className="re-heading mt-2">{phase.name}</h1>
        <p className="re-subheading mt-3 max-w-2xl">{phase.summary}</p>
        <div className="mt-8 rounded-2xl overflow-hidden border border-slate-200 shadow-md max-w-3xl">
          <SiteImage src={image.src} alt={image.alt} width={1200} height={675} className="w-full h-auto max-h-80 object-cover" />
          <p className="text-xs text-slate-500 px-4 py-2 bg-white border-t border-slate-100">
            Layout photography — enquire for site-specific photos and availability.
          </p>
        </div>
        <div className="mt-10 max-w-xl">
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
    </RealEstatePageShell>
  );
}
