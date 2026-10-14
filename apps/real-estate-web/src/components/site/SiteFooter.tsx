import Link from 'next/link';

type Site = 'realestate' | 'jewellery';

export function SiteFooter({ site }: { site: Site }) {
  const base = site === 'realestate' ? '/' : '/jewellery';
  const brand = site === 'realestate' ? 'JK Balaji Real Estate' : 'Cheyyar Balaji Jewellers';
  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-semibold text-white">{brand}</p>
          <p className="mt-2 text-sm">Jamavisa Enterprises Private Limited</p>
          <p className="mt-1 text-sm">Cheyyar, Tamil Nadu, India</p>
          <p className="mt-2 text-sm">
            <a href="tel:+919900000000" className="hover:text-white">
              +91 99000 00000
            </a>
          </p>
          <p className="text-sm">
            <a href="mailto:jamavisapvt@gmail.com" className="hover:text-white">
              jamavisapvt@gmail.com
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
            {site === 'realestate'
              ? 'Trusted Real Estate Partner Across Tamil Nadu'
              : 'Trusted Jewellery Destination in Cheyyar'}
          </p>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Jamavisa Enterprises Private Limited. All Rights Reserved.
      </div>
    </footer>
  );
}
