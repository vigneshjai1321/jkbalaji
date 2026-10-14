import type { Metadata } from 'next';
import { MarketRatesBanner } from '@/components/jewellery/MarketRatesBanner';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';

export const metadata: Metadata = {
  title: 'Gold Rates | Sri Balaji Thangamaligai',
  description: 'Live market reference rates for gold and silver when configured on our server.',
  alternates: { canonical: 'https://cheyyarbalaji.com/gold-rates' },
};

export default function GoldRatesPage() {
  return (
    <JewelleryPageShell>
      <section className="jw-section">
        <div className="jw-container max-w-3xl">
          <h1 className="jw-heading text-3xl font-semibold text-stone-900">Gold & Silver Rates</h1>
          <p className="mt-3 text-stone-600">Reference rates for customer information — confirm final pricing in the showroom.</p>
          <div className="mt-8">
            <MarketRatesBanner />
          </div>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
