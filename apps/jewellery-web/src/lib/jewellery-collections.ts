import { jewelleryImages } from './site-images';

/** Category showcases — illustrative imagery, not live inventory. */
export const JEWELLERY_COLLECTIONS = [
  {
    id: 'gold',
    title: 'Gold Jewellery',
    image: jewelleryImages.gallery[0]!,
    examples: ['Traditional wedding sets', 'Antique harams & necklaces', 'Jimikki & earrings', 'Bangles', 'Lightweight daily-wear rings'],
  },
  {
    id: 'silver',
    title: 'Silver Articles',
    image: jewelleryImages.gallery[2]!,
    examples: ['Pooja utensils', 'Silver anklets', 'Waist chains (aranjanam)', 'Silver gifts'],
  },
  {
    id: 'platinum',
    title: 'Platinum Jewellery',
    image: jewelleryImages.gallery[3]!,
    examples: ['Contemporary platinum designs', 'Wedding & occasion pieces', 'Enquire for current selections'],
  },
  {
    id: 'diamond',
    title: 'Diamond Jewellery',
    image: jewelleryImages.gallery[1]!,
    examples: ['Diamond necklaces & earrings', 'Bridal diamond sets', 'Custom design enquiries welcome'],
  },
] as const;
