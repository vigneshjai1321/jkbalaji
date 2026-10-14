import { MarketRatesBanner } from '@/components/jewellery/MarketRatesBanner';
import { jwStaticMetadata } from '@/lib/seo/metadata';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwPageHeader, JwRatesExplainer } from '@/components/jewellery/inner/JwInnerBlocks';

export const metadata = jwStaticMetadata('goldRates');

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
