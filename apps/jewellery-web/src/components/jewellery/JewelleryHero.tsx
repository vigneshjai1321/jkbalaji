'use client';

import { PublicAssetImg } from '@/components/site/PublicAssetImg';
import { jewelleryImages } from '@/lib/site-images';
import { SRI_BALAJI } from '@/lib/jewellery-business';

export function JewelleryHero() {
  return (
    <section id="home" className="relative pt-[4.25rem] overflow-hidden bg-gradient-to-br from-[#faf8f4] via-amber-50/40 to-stone-100">
      <div className="relative min-h-[min(500px,76vh)] max-h-[580px] flex items-center">
        <PublicAssetImg
          src={jewelleryImages.hero}
          alt="Illustrative premium gold jewellery display"
          className="absolute inset-0 h-full w-full object-cover opacity-50 md:opacity-60"
          width={1600}
          height={900}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f4]/96 via-amber-50/88 to-stone-100/35 md:from-[#faf8f4]/92 md:via-amber-50/75 md:to-transparent" />
        <div className="jw-container relative py-10 md:py-12 w-full">
          <div className="max-w-xl jw-fade-in">
            <p className="jw-eyebrow !text-amber-900/80">Sri Balaji Thangamaligai · Cheyyar</p>
            <h1 className="jw-heading mt-3 text-3xl sm:text-4xl md:text-[2.65rem] font-semibold text-stone-900 leading-tight">
              Timeless Elegance.
              <span className="block text-amber-900/90 mt-1">Trusted for Generations.</span>
            </h1>
            <p className="mt-4 text-base text-stone-700 leading-relaxed max-w-md">
              Discover gold, silver, platinum and diamond jewellery at Sri Balaji Thangamaligai, Cheyyar.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#collections" className="jw-btn-gold">
                View Collections
              </a>
              <a
                href={`tel:${SRI_BALAJI.phoneE164}`}
                className="jw-btn-outline !text-stone-900 !border-stone-300 !bg-white/90 hover:!bg-white shadow-sm"
              >
                Call {SRI_BALAJI.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
