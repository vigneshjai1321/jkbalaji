import { RealEstateNavbar } from '@/components/realestate/RealEstateNavbar';
import { JkNagarPhasesSection } from '@/components/realestate/JkNagarPhasesSection';
import { RealEstateFooter } from '@/components/site/RealEstateFooter';
import WhatsAppButton from '@/components/WhatsAppButton';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { MapEmbed } from '@/components/site/MapEmbed';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JK Nagar Phases | JK Balaji Real Estate',
  description:
    'JK Nagar Phase 1 (Almost Completed), Phase 2 (Ongoing), and Phase 3 (Yet to Be Announced). Plot enquiries for Phase 1 and 2.',
  alternates: { canonical: 'https://jkbalaji.in/jk-nagar' },
};

export default function JkNagarPage() {
  return (
    <>
      <RealEstateNavbar />
      <main className="bg-slate-50 text-slate-900 overflow-x-hidden pt-20">
        <div className="re-container py-10 md:py-14">
          <p className="re-eyebrow">JK Balaji Real Estate</p>
          <h1 className="re-heading mt-2">JK Nagar</h1>
          <p className="re-subheading mt-3 max-w-2xl">
            A planned residential layout delivered in three phases. Verified project information and enquiry capture — no
            speculative pricing or launch dates.
          </p>
        </div>
        <JkNagarPhasesSection />
        <section id="contact" className="re-section bg-slate-100">
          <div className="re-container grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="re-heading">General Enquiry</h2>
              <p className="re-subheading mt-2">Questions about JK Nagar or other JK Balaji developments.</p>
              <div className="mt-6">
                <ContactLeadForm site="REAL_ESTATE" leadType="JK_NAGAR_GENERAL" sourcePage="/jk-nagar" />
              </div>
            </div>
            <MapEmbed title="JK Balaji — Cheyyar area" />
          </div>
        </section>
      </main>
      <RealEstateFooter />
      <WhatsAppButton phone={JK_BALAJI_RE.whatsappNumber} text="Hi, I want to enquire about JK Nagar plots" />
    </>
  );
}
