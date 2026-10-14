'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { SiteImage } from '@/components/site/SiteImage';
import { JK_NAGAR_PHASES, leadTypeForPhase, type JkNagarPhaseId } from '@/lib/jk-nagar-phases';
import { isJkNagarSlug, publicProjectStatusLabel } from '@/lib/project-display';
import { REAL_ESTATE_SERVICES } from '@/lib/real-estate-services';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { realEstateImages } from '@/lib/site-images';
import { RE_ROUTES } from '@/lib/site-routes';
import { JkNagarPhaseCard } from './JkNagarPhaseCard';

export type ApiProject = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  phase: string;
  phaseLabel?: string | null;
  description: string | null;
  coverImage?: string | null;
};

function enquireHref(project: ApiProject) {
  if (project.slug === 'jk-nagar-phase-1') return RE_ROUTES.jkNagarPhase1;
  if (project.slug === 'jk-nagar-phase-2') return RE_ROUTES.jkNagarPhase2;
  if (project.slug === 'jk-nagar-phase-3') return RE_ROUTES.jkNagarPhase3;
  return `${RE_ROUTES.contact}?project=${encodeURIComponent(project.slug)}`;
}

export function DevelopmentsSection({
  projects,
  showPageHeader = true,
}: {
  projects: ApiProject[];
  /** When false, omit eyebrow (used on dedicated /projects page with RePageHeader). */
  showPageHeader?: boolean;
}) {
  const [enquiryPhase, setEnquiryPhase] = useState<JkNagarPhaseId | null>(null);
  const activePhase = JK_NAGAR_PHASES.find((p) => p.id === enquiryPhase);

  const apiBySlug = useMemo(() => new Map(projects.map((p) => [p.slug, p])), [projects]);
  const otherProjects = projects.filter((p) => !isJkNagarSlug(p.slug));

  return (
    <>
      <section id="projects" className="relative re-section overflow-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 border-y border-slate-200/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.08),_transparent_55%)]" aria-hidden />
        <div className="re-container relative">
          {showPageHeader ? (
            <>
              <p className="re-eyebrow reveal">Developments</p>
              <h2 className="re-heading mt-2 reveal max-w-3xl">Our Developments &amp; Real Estate Services</h2>
              <p className="re-subheading mt-3 reveal max-w-3xl text-slate-700">
                From residential plots and real estate consultancy to property management and NRI property assistance, JK Balaji helps
                customers explore property opportunities with personalised guidance and reliable support. Connect with our team to discover
                our projects, understand the facilities, and find the right property for your needs.
              </p>
            </>
          ) : null}

          <div className={showPageHeader ? 'mt-10' : 'mt-2'}>
            <h3 className="text-lg font-bold text-emerald-950 reveal">Real estate services</h3>
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal">
              {REAL_ESTATE_SERVICES.map((svc) => {
                const Icon = svc.icon;
                return (
                  <article key={svc.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h4 className="mt-4 font-semibold text-slate-900">{svc.title}</h4>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{svc.description}</p>
                    <Link href={svc.enquiryHref} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline">
                      {svc.enquiryLabel}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-emerald-100 bg-emerald-900/[0.03] p-5 sm:p-6 reveal">
            <p className="text-sm text-slate-700 leading-relaxed">
              Interested in <strong className="font-semibold text-emerald-950">JK Nagar Phase 1, Phase 2, or Phase 3</strong>? Submit your
              enquiry, and our team will help you understand current plot availability, applicable pricing, facilities, and site visit
              arrangements. Contact us for the best available offer — pricing is confirmed on enquiry, not guaranteed online.
            </p>
          </div>

          <div className="mt-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 reveal">
              <div>
                <h3 className="text-xl font-bold text-emerald-950">JK Nagar — all phases</h3>
                <p className="mt-1 text-sm text-slate-600 max-w-2xl">Flagship layout developments near Cheyyar — each phase shown as ongoing on our public site.</p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {JK_NAGAR_PHASES.map((phase) => {
                const api = apiBySlug.get(phase.slug);
                const img = realEstateImages.gallery[phase.imageIndex % realEstateImages.gallery.length]!;
                return (
                  <JkNagarPhaseCard
                    key={phase.id}
                    phase={phase}
                    imageSrc={img.src}
                    imageAlt={img.alt}
                    coverImageUrl={api?.coverImage ?? null}
                    description={api?.description}
                    onEnquire={() => setEnquiryPhase(phase.id)}
                    reveal
                  />
                );
              })}
            </div>
          </div>

          {otherProjects.length > 0 ? (
            <div className="mt-14 reveal">
              <h3 className="text-xl font-bold text-emerald-950">More published developments</h3>
              <p className="mt-1 text-sm text-slate-600">Additional projects from our catalogue — availability confirmed when you enquire.</p>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProjects.map((project) => {
                  const status = publicProjectStatusLabel(project);
                  return (
                    <article key={project.id} className="flex flex-col rounded-2xl bg-white border border-emerald-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {project.coverImage ? (
                        <div className="relative h-44 w-full bg-slate-100">
                          <SiteImage src={project.coverImage} alt={`${project.name} project`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                        </div>
                      ) : null}
                      <div className="flex flex-1 flex-col p-5">
                        <span className="text-xs font-semibold tracking-wide text-emerald-700">{status}</span>
                        <h4 className="mt-2 font-bold text-lg">{project.name}</h4>
                        {project.location ? <p className="text-sm text-slate-600 mt-1">{project.location}</p> : null}
                        {project.description ? <p className="text-sm text-slate-700 mt-3 line-clamp-4">{project.description}</p> : null}
                        <Link href={enquireHref(project)} className="mt-4 inline-flex text-sm font-semibold text-emerald-800 hover:underline">
                          Enquire About This Project
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-12 flex flex-col sm:flex-row flex-wrap gap-3 reveal">
            <Link
              href={RE_ROUTES.projects}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 shadow-sm"
            >
              Explore Projects
            </Link>
            <Link
              href={`${RE_ROUTES.home}#property-enquiry`}
              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
            >
              Enquire About Availability
            </Link>
            <Link
              href={RE_ROUTES.contact}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Contact Our Team
            </Link>
            <a
              href={`https://wa.me/${JK_BALAJI_RE.whatsappNumber}?text=${encodeURIComponent('JK Balaji — developments enquiry')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {activePhase ? (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="developments-enquiry-title"
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="developments-enquiry-title" className="text-lg font-bold text-slate-900">
                  Plot Enquiry — {activePhase.name}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{activePhase.publicStatusLabel} · availability confirmed with our team</p>
              </div>
              <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close" onClick={() => setEnquiryPhase(null)}>
                ×
              </button>
            </div>
            <div className="mt-6">
              <ContactLeadForm
                site="REAL_ESTATE"
                leadType={leadTypeForPhase(activePhase.id)}
                projectSlug={activePhase.slug}
                sourcePage="/#projects"
                submitLabel="Submit Plot Enquiry"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
