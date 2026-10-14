import Link from 'next/link';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { ProjectsBlock } from '@/components/public/ProjectsBlock';
import { JkNagarPhasesSection } from '@/components/realestate/JkNagarPhasesSection';
import { MapEmbed } from '@/components/site/MapEmbed';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { RE_ROUTES } from '@/lib/site-routes';

type Project = Parameters<typeof ProjectsBlock>[0]['projects'];

export function FeaturedProjectsSection({ projects }: { projects: Project }) {
  if (!projects.length) return null;
  return <ProjectsBlock projects={projects} />;
}

export function WhyChooseSection() {
  const items = [
    { title: 'Guided site visits', desc: 'Our team arranges layout visits for published JK Nagar phases and listed properties.' },
    { title: 'Clear documentation support', desc: 'We help you understand registration steps — final legal advice from your advocate.' },
    { title: 'Tamil Nadu focus', desc: 'Developments marketed from Cheyyar with experience across the state.' },
    { title: 'Direct enquiry line', desc: `Reach us on ${JK_BALAJI_RE.phoneDisplay} or WhatsApp for plot availability.` },
  ];
  return (
    <section className="re-section bg-white">
      <div className="re-container">
        <p className="re-eyebrow">Why JK Balaji</p>
        <h2 className="re-heading mt-2">Why Choose JK Balaji Real Estate</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
              <h3 className="font-bold text-emerald-950">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BuyingProcessSection() {
  const steps = [
    'Enquiry',
    'Site visit',
    'Plot selection',
    'Documentation',
    'Registration',
  ];
  return (
    <section className="re-section bg-slate-50 border-y border-slate-200/60">
      <div className="re-container max-w-4xl">
        <p className="re-eyebrow text-center">Process</p>
        <h2 className="re-heading mt-2 text-center">Property buying process</h2>
        <p className="re-subheading mt-2 text-center">
          Typical journey for our plot buyers — timings and documents vary by project. Confirm with our team.
        </p>
        <ol className="mt-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {steps.map((step, i) => (
            <li key={step} className="flex-1 text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-white font-bold text-sm">
                {i + 1}
              </span>
              <p className="mt-3 font-semibold text-slate-900">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function LocationAdvantagesSection() {
  return (
    <section className="re-section">
      <div className="re-container grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <p className="re-eyebrow">Location</p>
          <h2 className="re-heading mt-2">Cheyyar & Tamil Nadu</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Our office is in {JK_BALAJI_RE.location}. JK Nagar and other published projects are marketed with on-site visits — ask
            our team for directions, landmarks, and connectivity from your city.
          </p>
          <Link href={RE_ROUTES.location} className="mt-4 inline-flex text-sm font-semibold text-emerald-800 hover:underline">
            Open map & directions →
          </Link>
        </div>
        <MapEmbed title={JK_BALAJI_RE.name} />
      </div>
    </section>
  );
}

export function SiteVisitSection() {
  return (
    <section className="re-section bg-emerald-950 text-white" id="site-visit">
      <div className="re-container grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <p className="text-emerald-300/90 text-xs font-semibold tracking-wide uppercase">Site visit</p>
          <h2 className="re-heading mt-2 text-white">Book a site visit or call back</h2>
          <p className="mt-3 text-emerald-100/90 text-sm leading-relaxed">
            Tell us which project or phase you are interested in. We confirm availability before scheduling — Phase 3 remains
            register-interest only.
          </p>
          <a
            href={`https://wa.me/${JK_BALAJI_RE.whatsappNumber}?text=${encodeURIComponent('Site visit enquiry — JK Balaji Real Estate')}`}
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
        <div className="rounded-2xl bg-white p-6 text-slate-900">
          <ContactLeadForm site="REAL_ESTATE" leadType="SITE_VISIT" sourcePage="/#site-visit" />
        </div>
      </div>
    </section>
  );
}

export function HomeFaqTeaser() {
  return (
    <section className="re-section bg-white border-t border-slate-100">
      <div className="re-container flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="re-heading text-xl">Questions about plots or JK Nagar?</h2>
          <p className="mt-2 text-slate-600 text-sm">See answers on documentation, visits, and phases.</p>
        </div>
        <Link
          href={RE_ROUTES.faq}
          className="inline-flex rounded-xl border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
        >
          Read FAQs
        </Link>
      </div>
    </section>
  );
}

export { JkNagarPhasesSection };
