import type { Metadata } from 'next';
import { MarketRatesBanner } from '@/components/jewellery/MarketRatesBanner';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwPageHeader, JwRatesExplainer } from '@/components/jewellery/inner/JwInnerBlocks';

export const metadata: Metadata = {
  title: 'Gold Rates | Sri Balaji Thangamaligai',
  description: 'Live market reference rates for gold and silver when configured on our server.',
  alternates: { canonical: 'https://cheyyarbalaji.com/gold-rates' },
};

export default function GoldRatesPage() {
  return (
    <JewelleryPageShell>
      <JwPageHeader
        eyebrow="Reference"
        title="Gold & Silver Rates"
        description="Customer information only — confirm final pricing in the showroom."
      />
      <div className="jw-section-inner pt-0 max-w-3xl mx-auto">
        <MarketRatesBanner />
      </div>
      <JwRatesExplainer />
    </JewelleryPageShell>
  );
}
