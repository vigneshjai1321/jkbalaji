'use client';

import { Building2, MapPin } from 'lucide-react';

const CITIES = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Trichy',
  'Salem',
  'Erode',
  'Vellore',
  'Kanchipuram',
  'Cheyyar',
  'Tirunelveli',
] as const;

export function TamilNaduCoverage() {
  return (
    <section id="coverage" className="re-section bg-gradient-to-b from-white to-emerald-50/40">
      <div className="re-container">
        <div className="text-center max-w-2xl mx-auto">
          <p className="re-eyebrow">Statewide Presence</p>
          <h2 className="re-heading mt-2">Serving Tamil Nadu</h2>
          <p className="re-subheading mt-3 mx-auto">
            From Chennai to Tirunelveli — we connect investors and families with verified plots, villas, and commercial
            opportunities.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CITIES.map((city) => (
            <article
              key={city}
              className="group reveal relative rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm hover:border-emerald-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                {city === 'Chennai' ? <Building2 className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{city}</h3>
              <p className="mt-1 text-xs text-slate-500">Enquire for listings.</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
