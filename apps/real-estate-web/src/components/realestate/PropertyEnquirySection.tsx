'use client';

import Link from 'next/link';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { JK_NAGAR_PHASES } from '@/lib/jk-nagar-phases';
import { RE_ROUTES } from '@/lib/site-routes';

const PROJECT_OPTIONS = [
  { value: 'jk-nagar-phase-1', label: 'JK Nagar — Phase 1' },
  { value: 'jk-nagar-phase-2', label: 'JK Nagar — Phase 2' },
  { value: 'jk-nagar-phase-3', label: 'JK Nagar — Phase 3' },
  { value: 'cheyyar-general', label: 'Cheyyar / Tiruvannamalai area' },
  { value: 'other-tamil-nadu', label: 'Other Tamil Nadu location' },
  { value: 'unsure', label: 'Not sure yet — need guidance' },
];

export function PropertyEnquirySection() {
  return (
    <section id="property-enquiry" className="re-section bg-white border-y border-slate-200/60 scroll-mt-20">
      <div className="re-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <div className="reveal">
            <p className="re-eyebrow">Properties</p>
            <h2 className="re-heading mt-2">Find the Right Property for You</h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              We have multiple property options to explore. Share your requirements through our enquiry form, and our team will contact you
              with relevant property details, current availability, pricing, and guidance to help you make an informed decision.
            </p>
            <p className="mt-4 text-sm text-slate-600">
              Published listings appear when available on our{' '}
              <Link href={RE_ROUTES.properties} className="text-emerald-800 font-medium hover:underline">
                properties page
              </Link>
              . JK Nagar: {JK_NAGAR_PHASES.map((p) => p.name.replace('JK Nagar — ', '')).join(', ')}.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-slate-50/80 p-6 shadow-sm reveal">
            <h3 className="text-lg font-semibold text-slate-900">Enquire about properties</h3>
            <p className="text-sm text-slate-600 mt-1">Fields marked * are required. We respond by phone or email.</p>
            <ContactLeadForm
              site="REAL_ESTATE"
              leadType="PROPERTY_ENQUIRY"
              sourcePage="/#property-enquiry"
              variant="property"
              preferredProjectOptions={PROJECT_OPTIONS}
              submitLabel="Enquire About Properties"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
