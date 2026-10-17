import { SetMetadata } from '@nestjs/common';

export const SKIP_TAB_UNLOCK_KEY = 'skipTabUnlock';

/** JWT routes that must not require a per-tab unlock token (login bootstrap, verify-tab, etc.). */
export const SkipTabUnlock = () => SetMetadata(SKIP_TAB_UNLOCK_KEY, true);
