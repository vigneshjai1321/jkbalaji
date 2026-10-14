import Link from 'next/link';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';

export function RealEstateFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-emerald-900/30 bg-slate-950 text-slate-300">
      <div className="re-container py-10 md:py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-lg font-bold text-white tracking-tight">{JK_BALAJI_RE.name}</p>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{JK_BALAJI_RE.legalEntity}</p>
          <p className="mt-2 text-sm text-slate-400">{JK_BALAJI_RE.location}</p>
        </div>
        <div>
          <p className="re-footer-heading">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/jk-nagar" className="hover:text-white transition-colors">
                JK Nagar Phases
              </Link>
            </li>
            <li>
              <Link href="/#properties" className="hover:text-white transition-colors">
                Properties
              </Link>
            </li>
            <li>
              <Link href="/#projects" className="hover:text-white transition-colors">
                Projects
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="re-footer-heading">Support</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/#contact" className="hover:text-white transition-colors">
                Enquire
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="re-footer-heading">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`tel:${JK_BALAJI_RE.phoneE164}`} className="hover:text-white transition-colors">
                {JK_BALAJI_RE.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${JK_BALAJI_RE.email}`} className="hover:text-white transition-colors break-all">
                {JK_BALAJI_RE.email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${JK_BALAJI_RE.whatsappNumber}?text=${encodeURIComponent('Property enquiry — JK Balaji Real Estate')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 transition-colors"
              >
                WhatsApp Enquiry
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500 px-4">
        <p>
          © {year} {JK_BALAJI_RE.legalEntity}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
