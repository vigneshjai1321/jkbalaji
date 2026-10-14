'use client';

import { useState } from 'react';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { JkNagarPhaseCard } from '@/components/realestate/developments/JkNagarPhaseCard';
import { JK_NAGAR_PHASES, leadTypeForPhase, type JkNagarPhaseId } from '@/lib/jk-nagar-phases';
import { realEstateImages } from '@/lib/site-images';

export function JkNagarPhasesSection() {
  const [enquiryPhase, setEnquiryPhase] = useState<JkNagarPhaseId | null>(null);
  const active = JK_NAGAR_PHASES.find((p) => p.id === enquiryPhase);

  return (
    <section className="re-section bg-white border-y border-slate-200/60">
      <div className="re-container">
        <p className="re-eyebrow">Flagship Layout</p>
        <h2 className="re-heading mt-2">JK Nagar — Phases</h2>
        <p className="re-subheading mt-2 max-w-2xl">
          Three phases of the JK Nagar development. All phases are shown as ongoing — submit a plot enquiry and our team will confirm
          current availability, pricing, and site visit options.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {JK_NAGAR_PHASES.map((phase) => {
            const img = realEstateImages.gallery[phase.imageIndex % realEstateImages.gallery.length]!;
            return (
              <JkNagarPhaseCard
                key={phase.id}
                phase={phase}
                imageSrc={img.src}
                imageAlt={img.alt}
                onEnquire={() => setEnquiryPhase(phase.id)}
              />
            );
          })}
        </div>

        {active ? (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="jk-nagar-enquiry-title"
          >
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 id="jk-nagar-enquiry-title" className="text-lg font-bold text-slate-900">
                    Plot Enquiry — {active.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{active.publicStatusLabel} · availability confirmed with our team</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close"
                  onClick={() => setEnquiryPhase(null)}
                >
                  ×
                </button>
              </div>
              <div className="mt-6">
                <ContactLeadForm
                  site="REAL_ESTATE"
                  leadType={leadTypeForPhase(active.id)}
                  projectSlug={active.slug}
                  sourcePage={`/jk-nagar#${active.id}`}
                  submitLabel="Submit Plot Enquiry"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
