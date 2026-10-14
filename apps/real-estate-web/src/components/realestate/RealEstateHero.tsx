'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PublicAssetImg } from '@/components/site/PublicAssetImg';
import { resolvePublicAssetUrl } from '@/lib/site-asset-url';
import { realEstateImages } from '@/lib/site-images';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { Search, MapPin } from 'lucide-react';

const KEYWORDS = ['Residential Plots', 'JK Nagar Layouts', 'Villas', 'Farm Land', 'Commercial Land'];

const slides = (realEstateImages.heroSlides ?? [realEstateImages.hero]).map(resolvePublicAssetUrl);

export function RealEstateHero() {
  const [slide, setSlide] = useState(0);
  const [word, setWord] = useState(0);
  const [anim, setAnim] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setSlide((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setAnim(false);
      setTimeout(() => {
        setWord((w) => (w + 1) % KEYWORDS.length);
        setAnim(true);
      }, 280);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-white text-slate-900">
      <div className="absolute inset-0">
        {slides.map((src, i) => (
          <PublicAssetImg
            key={src}
            src={src}
            alt={i === slide ? 'Residential property and land development in Tamil Nadu' : ''}
            aria-hidden={i !== slide}
            width={1600}
            height={900}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1000ms] ${
              i === slide ? 'opacity-55 md:opacity-65' : 'opacity-0'
            }`}
            fetchPriority={i === 0 ? 'high' : 'low'}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-emerald-50/88 to-emerald-100/45 md:from-white/92 md:via-emerald-50/78 md:to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12 lg:py-14 min-h-[min(68vh,600px)] flex flex-col justify-center">
        <div className="max-w-2xl">
          <p className="text-emerald-800 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            JK Balaji · Tamil Nadu
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold leading-[1.12] tracking-tight text-slate-900">
            Discover{' '}
            <span
              className={`inline-block text-emerald-700 transition-all duration-300 ${
                anim ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              {KEYWORDS[word]}
            </span>
            <br />
            <span className="text-slate-800">With Confidence</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-xl leading-relaxed">
            Verified layouts, clear pricing, and help from site visit to registration.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/#properties"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-900 transition-colors"
            >
              View Properties
            </Link>
            <a
              href={`https://wa.me/${JK_BALAJI_RE.whatsappNumber}?text=${encodeURIComponent('JK Balaji property enquiry')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-800/25 bg-white/90 px-5 py-3 text-sm font-semibold text-emerald-900 hover:bg-white transition-colors shadow-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 md:mt-12 w-full max-w-3xl rounded-2xl border border-white/15 bg-white/[0.97] p-4 sm:p-5 shadow-2xl text-slate-900">
          <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <Search className="h-4 w-4" aria-hidden />
            Quick Property Enquiry
          </p>
          <form
            className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = '/#contact';
            }}
          >
            <label className="sr-only" htmlFor="hero-location">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden />
              <select
                id="hero-location"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                defaultValue="Cheyyar"
              >
                {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Cheyyar', 'Vellore', 'Erode'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <label className="sr-only" htmlFor="hero-type">
              Property type
            </label>
            <select
              id="hero-type"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 px-3 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              defaultValue="Plots"
            >
              {['Residential Plots', 'Villa', 'Commercial', 'Farm Land', 'Investment'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-emerald-800 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors sm:min-w-[8.5rem]"
            >
              Enquire
            </button>
          </form>
        </div>

        <div className="mt-6 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Background ${i + 1}`}
              onClick={() => setSlide(i)}
              className={`h-1 rounded-full transition-all ${i === slide ? 'w-8 bg-emerald-700' : 'w-3 bg-emerald-900/25'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
