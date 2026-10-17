import { SetMetadata } from '@nestjs/common';

export const BUSINESS_UNIT_KEY = 'businessUnit';

/** Restrict route to real-estate operations (blocks jewellery-only roles). */
export const RealEstateUnit = () => SetMetadata(BUSINESS_UNIT_KEY, 'REAL_ESTATE');

/** Restrict route to jewellery operations (blocks real-estate-only roles). */
export const JewelleryUnit = () => SetMetadata(BUSINESS_UNIT_KEY, 'JEWELLERY');
