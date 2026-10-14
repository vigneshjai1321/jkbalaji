'use client';

import { useState } from 'react';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { realEstateImages } from '@/lib/site-images';
import { JK_NAGAR_PHASES, leadTypeForPhase, type JkNagarPhaseId } from '@/lib/jk-nagar-phases';
import { clsx } from 'clsx';

export function JkNagarPhasesSection() {
  const [enquiryPhase, setEnquiryPhase] = useState<JkNagarPhaseId | null>(null);
  const active = JK_NAGAR_PHASES.find((p) => p.id === enquiryPhase);

  return (
    <section className="re-section bg-white border-y border-slate-200/60">
      <div className="re-container">
        <p className="re-eyebrow">Flagship Layout</p>
        <h2 className="re-heading mt-2">JK Nagar — Phases</h2>
        <p className="re-subheading mt-2 max-w-2xl">
          Three phases of the JK Nagar development. Plot enquiries are available for Phase 1 and Phase 2 only.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {JK_NAGAR_PHASES.map((phase) => {
            const img = realEstateImages.gallery[phase.imageIndex % realEstateImages.gallery.length]!;
            return (
              <article
                key={phase.id}
                className={clsx(
                  'flex flex-col rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow',
                  phase.id === 'phase-3' ? 'border-slate-200 bg-slate-50' : 'border-emerald-100 bg-white',
                )}
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <span
                    className={clsx(
                      'inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold',
                      phase.id === 'phase-3' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800',
                    )}
                  >
                    {phase.statusLabel}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{phase.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 flex-1">{phase.summary}</p>
                  {phase.plotsAvailable ? (
                    <button
                      type="button"
                      onClick={() => setEnquiryPhase(phase.id)}
                      className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      Plot Enquiry
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEnquiryPhase(phase.id)}
                      className="mt-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                    >
                      Register Interest
                    </button>
                  )}
                </div>
              </article>
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
                    {active.plotsAvailable ? 'Plot Enquiry' : 'Interest Registration'} — {active.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{active.statusLabel}</p>
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
                  projectSlug={`jk-nagar-${active.id}`}
                  sourcePage={`/jk-nagar#${active.id}`}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
