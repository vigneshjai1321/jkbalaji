import type { Metadata } from 'next';
import { JkNagarPhasesSection } from '@/components/realestate/JkNagarPhasesSection';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { MapEmbed } from '@/components/site/MapEmbed';

export const metadata: Metadata = {
  title: 'JK Nagar Phases | JK Balaji Real Estate',
  description: 'JK Nagar Phase 1 (Almost Completed), Phase 2 (Ongoing), and Phase 3 (Yet to Be Announced). Plot enquiries for Phase 1 and 2.',
  alternates: { canonical: 'https://jkbalaji.in/jk-nagar' },
};

export default function JkNagarPage() {
  return (
    <RealEstatePageShell whatsappText="JK Nagar plot enquiry">
      <div className="re-container py-10 md:py-14">
        <p className="re-eyebrow">JK Balaji Real Estate</p>
        <h1 className="re-heading mt-2">JK Nagar</h1>
        <p className="re-subheading mt-3 max-w-2xl">
          A planned residential layout delivered in three phases. Verified project information and enquiry capture — no speculative
          pricing or launch dates.
        </p>
      </div>
      <JkNagarPhasesSection />
      <section className="re-section bg-slate-100">
        <div className="re-container grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="re-heading">General enquiry</h2>
            <p className="re-subheading mt-2">Questions about JK Nagar or other JK Balaji developments.</p>
            <div className="mt-6">
              <ContactLeadForm site="REAL_ESTATE" leadType="JK_NAGAR_GENERAL" sourcePage="/jk-nagar" />
            </div>
          </div>
          <MapEmbed title="JK Balaji — Cheyyar area" />
        </div>
      </section>
    </RealEstatePageShell>
  );
}
