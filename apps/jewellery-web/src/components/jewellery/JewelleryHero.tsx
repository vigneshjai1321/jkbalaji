'use client';

import { jewelleryImages } from '@/lib/site-images';
import { SRI_BALAJI } from '@/lib/jewellery-business';

export function JewelleryHero() {
  return (
    <section id="home" className="relative pt-[4.25rem] overflow-hidden">
      <div className="relative min-h-[min(520px,78vh)] max-h-[560px] flex items-center">
        <img
          src={jewelleryImages.hero}
          alt="Illustrative premium gold jewellery display"
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={900}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/88 via-stone-900/75 to-stone-900/35" />
        <div className="jw-container relative py-10 md:py-14 w-full">
          <div className="max-w-xl jw-fade-in">
            <p className="jw-eyebrow">Sri Balaji Thangamaligai · Cheyyar</p>
            <h1 className="jw-heading mt-3 text-3xl sm:text-4xl md:text-[2.65rem] font-semibold text-white leading-tight">
              Timeless Elegance.
              <span className="block text-amber-100/95 mt-1">Trusted for Generations.</span>
            </h1>
            <p className="mt-4 text-base text-stone-200/95 leading-relaxed max-w-md">
              Discover gold, silver, platinum and diamond jewellery at Sri Balaji Thangamaligai, Cheyyar.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#collections" className="jw-btn-gold">
                View Collections
              </a>
              <a href={`tel:${SRI_BALAJI.phoneE164}`} className="jw-btn-outline !text-white !border-white/30 !bg-white/10 hover:!bg-white/15">
                Call {SRI_BALAJI.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
