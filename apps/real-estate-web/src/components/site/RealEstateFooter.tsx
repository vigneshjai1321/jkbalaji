import Link from 'next/link';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { RE_ROUTES } from '@/lib/site-routes';

const QUICK = [
  { href: RE_ROUTES.home, label: 'Home' },
  { href: RE_ROUTES.contact, label: 'Enquire' },
  { href: RE_ROUTES.faq, label: 'FAQ' },
  { href: RE_ROUTES.about, label: 'About' },
] as const;

const EXPLORE = [
  { href: RE_ROUTES.projects, label: 'Projects' },
  { href: RE_ROUTES.properties, label: 'Properties' },
  { href: RE_ROUTES.jkNagar, label: 'JK Nagar' },
  { href: RE_ROUTES.jkNagarPhase1, label: 'Phase 1' },
  { href: RE_ROUTES.jkNagarPhase2, label: 'Phase 2' },
  { href: RE_ROUTES.jkNagarPhase3, label: 'Phase 3' },
  { href: RE_ROUTES.gallery, label: 'Gallery' },
  { href: RE_ROUTES.location, label: 'Location' },
] as const;

function LinkGrid({ links }: { links: readonly { href: string; label: string }[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="text-slate-400 hover:text-white transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function RealEstateFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-emerald-900/30 bg-slate-950 text-slate-300">
      <div className="re-container py-7 md:py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-4">
            <p className="text-base font-bold text-white tracking-tight">{JK_BALAJI_RE.name}</p>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-xs">
              {JK_BALAJI_RE.legalEntity} — verified plots and layouts in Tamil Nadu.
            </p>
          </div>
          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <p className="re-footer-heading mb-2">Quick links</p>
              <LinkGrid links={QUICK} />
            </div>
            <div>
              <p className="re-footer-heading mb-2">Explore</p>
              <LinkGrid links={EXPLORE} />
            </div>
          </div>
          <div className="lg:col-span-4">
            <p className="re-footer-heading mb-2">Contact</p>
            <ul className="text-sm space-y-1.5 text-slate-400">
              <li>{JK_BALAJI_RE.location}</li>
              <li>
                <a href={`tel:${JK_BALAJI_RE.phoneE164}`} className="hover:text-white">
                  {JK_BALAJI_RE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${JK_BALAJI_RE.email}`} className="hover:text-white break-all">
                  {JK_BALAJI_RE.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${JK_BALAJI_RE.whatsappNumber}?text=${encodeURIComponent('Property enquiry — JK Balaji Real Estate')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-300 hover:text-emerald-200"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-3">
        <div className="re-container flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
          <p>© {year} {JK_BALAJI_RE.legalEntity}</p>
          <p className="flex gap-3">
            <Link href={RE_ROUTES.privacy} className="hover:text-slate-300">
              Privacy
            </Link>
            <Link href={RE_ROUTES.terms} className="hover:text-slate-300">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
