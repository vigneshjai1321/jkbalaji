import Link from 'next/link';
import { SRI_BALAJI } from '@/lib/jewellery-business';

export function JewelleryFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="jw-container py-10 md:py-11 grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-white jw-heading">{SRI_BALAJI.name}</p>
          <p className="mt-3 text-sm leading-relaxed text-stone-400">{SRI_BALAJI.addressLine}</p>
          <p className="mt-3 text-sm">
            <span className="text-stone-500">Phone: </span>
            <a href={`tel:${SRI_BALAJI.phoneE164}`} className="text-amber-200/90 hover:text-amber-100">
              {SRI_BALAJI.phoneDisplay}
            </a>
          </p>
          <p className="mt-1 text-sm">
            <span className="text-stone-500">Gold scheme: </span>
            <a href={SRI_BALAJI.schemeTel} className="text-amber-200/90 hover:text-amber-100">
              {SRI_BALAJI.schemePhoneDisplay}
            </a>
          </p>
          <p className="mt-3 text-xs text-stone-500">{SRI_BALAJI.hours.open}</p>
          <p className="text-xs text-stone-500">{SRI_BALAJI.hours.closed}</p>
        </div>
        <div>
          <p className="jw-footer-heading">Navigate</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/#collections" className="hover:text-amber-200">
                Collections
              </Link>
            </li>
            <li>
              <Link href="/#schemes" className="hover:text-amber-200">
                Gold Savings Scheme
              </Link>
            </li>
            <li>
              <Link href="/#services" className="hover:text-amber-200">
                Services
              </Link>
            </li>
            <li>
              <Link href="/#about" className="hover:text-amber-200">
                About
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="hover:text-amber-200">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-amber-200">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-amber-200">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="jw-footer-heading">Visit Us</p>
          <p className="mt-4 text-sm text-stone-400">{SRI_BALAJI.tagline}</p>
          <p className="mt-3 text-sm text-stone-400">{SRI_BALAJI.gstNote}</p>
          <a href={SRI_BALAJI.directionsUrl} className="mt-4 inline-block jw-btn-outline !text-stone-200 !border-stone-600">
            Get Directions
          </a>
        </div>
      </div>
      <div className="border-t border-stone-800 py-5 text-center text-xs text-stone-500 space-y-1">
        <p>© {year} {SRI_BALAJI.name}. All rights reserved.</p>
        <p className="text-stone-400">{SRI_BALAJI.legalEntity}</p>
      </div>
    </footer>
  );
}
