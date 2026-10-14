import { JkNagarPhasesSection } from '@/components/realestate/JkNagarPhasesSection';
import { reStaticMetadata } from '@/lib/seo/metadata';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { MapEmbed } from '@/components/site/MapEmbed';

export const metadata = reStaticMetadata('jkNagar');

export default function JkNagarPage() {
  return (
    <RealEstatePageShell whatsappText="JK Nagar plot enquiry">
      <RePageHeader
        eyebrow="JK Balaji Real Estate"
        title="JK Nagar"
        description="A planned residential layout in three phases. Verified information only — no speculative pricing or launch dates."
      />
      <JkNagarPhasesSection />
      <section className="re-inner-band border-t border-slate-200 bg-slate-50/80">
        <div className="re-container py-5 md:py-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">General enquiry</h2>
            <p className="text-sm text-slate-600 mt-1">Questions about JK Nagar or other developments.</p>
            <div className="mt-4">
              <ContactLeadForm site="REAL_ESTATE" leadType="JK_NAGAR_GENERAL" sourcePage="/jk-nagar" />
            </div>
          </div>
          <MapEmbed title="JK Balaji — Cheyyar area" />
        </div>
      </section>
    </RealEstatePageShell>
  );
}
