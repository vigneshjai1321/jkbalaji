import { SRI_BALAJI } from '@/lib/jewellery-business';

export function JewelleryMap() {
  return (
    <section id="map" className="jw-section bg-white">
      <div className="jw-container">
        <h2 className="jw-heading text-2xl md:text-3xl font-semibold text-stone-900">Find Our Showroom</h2>
        <p className="mt-2 text-stone-600 text-sm max-w-2xl">{SRI_BALAJI.addressLine}</p>
        <div className="mt-6 rounded-2xl overflow-hidden border border-stone-200 shadow-sm aspect-[16/10] max-h-[420px]">
          <iframe
            title="Sri Balaji Thangamaligai on Google Maps"
            className="w-full h-full min-h-[280px]"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            src={SRI_BALAJI.mapEmbedSrc}
          />
        </div>
      </div>
    </section>
  );
}
