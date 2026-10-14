import Link from 'next/link';
import { SITE_DEVELOPER_CREDIT, SRI_BALAJI } from '@/lib/jewellery-business';
import { JW_ROUTES } from '@/lib/site-routes';

const QUICK = [
  { href: JW_ROUTES.home, label: 'Home' },
  { href: JW_ROUTES.contact, label: 'Contact' },
  { href: JW_ROUTES.faq, label: 'FAQ' },
  { href: JW_ROUTES.visit, label: 'Visit showroom' },
] as const;

const SHOP = [
  { href: JW_ROUTES.collections, label: 'Collections' },
  { href: JW_ROUTES.goldRates, label: 'Gold rates' },
  { href: JW_ROUTES.goldSchemes, label: 'Gold scheme' },
  { href: JW_ROUTES.services, label: 'Services' },
  { href: JW_ROUTES.gallery, label: 'Gallery' },
  { href: JW_ROUTES.about, label: 'About' },
] as const;

function LinkGrid({ links }: { links: readonly { href: string; label: string }[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="text-stone-400 hover:text-amber-200 transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function JewelleryFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="jw-container py-7 md:py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-4">
            <p className="text-base font-semibold text-white jw-heading">{SRI_BALAJI.name}</p>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed max-w-xs">{SRI_BALAJI.tagline}</p>
          </div>
          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <p className="jw-footer-heading text-sm mb-2">Quick links</p>
              <LinkGrid links={QUICK} />
            </div>
            <div>
              <p className="jw-footer-heading text-sm mb-2">Showroom</p>
              <LinkGrid links={SHOP} />
            </div>
          </div>
          <div className="lg:col-span-4">
            <p className="jw-footer-heading text-sm mb-2">Contact</p>
            <ul className="text-xs sm:text-sm space-y-1 text-stone-400">
              <li className="leading-snug">{SRI_BALAJI.addressLine}</li>
              <li>
                <a href={`tel:${SRI_BALAJI.phoneE164}`} className="text-amber-200/90 hover:text-amber-100">
                  {SRI_BALAJI.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SRI_BALAJI.email}`} className="text-amber-200/90 hover:text-amber-100 break-all">
                  {SRI_BALAJI.email}
                </a>
              </li>
              <li>
                Scheme:{' '}
                <a href={SRI_BALAJI.schemeTel} className="text-amber-200/90 hover:text-amber-100">
                  {SRI_BALAJI.schemePhoneDisplay}
                </a>
              </li>
              <li className="text-stone-500">{SRI_BALAJI.hours.open}</li>
              <li>
                <a href={SRI_BALAJI.directionsUrl} className="text-amber-200/90 hover:text-amber-100 underline-offset-2 hover:underline">
                  Directions
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-800 py-3">
        <div className="jw-container flex flex-col gap-2 text-xs text-stone-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p>© {year} {SRI_BALAJI.name}</p>
            <p className="flex gap-3">
              <Link href={JW_ROUTES.privacy} className="hover:text-stone-300">
                Privacy
              </Link>
              <Link href={JW_ROUTES.terms} className="hover:text-stone-300">
                Terms
              </Link>
            </p>
          </div>
          <p>
            <a
              href={SITE_DEVELOPER_CREDIT.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-400 transition-colors"
            >
              {SITE_DEVELOPER_CREDIT.label}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
