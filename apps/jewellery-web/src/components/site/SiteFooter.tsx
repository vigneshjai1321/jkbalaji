import Link from 'next/link';
import { SITE_DEVELOPER_CREDIT, SRI_BALAJI } from '@/lib/jewellery-business';

type Site = 'realestate' | 'jewellery';

export function SiteFooter({ site }: { site: Site }) {
  const isRe = site === 'realestate';
  const brand = isRe ? 'JK Balaji Real Estate' : SRI_BALAJI.name;
  const phone = isRe ? '+919943541435' : SRI_BALAJI.phoneE164;
  const phoneDisplay = isRe ? '+91 99435 41435' : SRI_BALAJI.phoneDisplay;
  const email = 'tmlcheyyar@gmail.com';
  const base = isRe ? '/realestate' : '/';
  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-semibold text-white">{brand}</p>
          <p className="mt-1 text-sm">Cheyyar, Tamil Nadu, India</p>
          <p className="mt-2 text-sm">
            <a href={`tel:${phone}`} className="hover:text-white">
              {phoneDisplay}
            </a>
          </p>
          <p className="text-sm">
            <a href={`mailto:${email}`} className="hover:text-white break-all">
              {email}
            </a>
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Quick links</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href={`${base}#contact`} className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href={`${base}#faq`} className="hover:text-white">
                FAQ
              </Link>
            </li>
            <li>
              <Link href={`${base}/privacy`} className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href={`${base}/terms`} className="hover:text-white">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Trusted partner</p>
          <p className="mt-2 text-sm">
            {isRe
              ? 'Trusted Real Estate Partner Across Tamil Nadu'
              : 'Trusted Jewellery Destination in Cheyyar'}
          </p>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500 space-y-1">
        <p>© {new Date().getFullYear()} {brand}</p>
        <p>
          <a href={SITE_DEVELOPER_CREDIT.href} target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">
            {SITE_DEVELOPER_CREDIT.label}
          </a>
        </p>
      </div>
    </footer>
  );
}
