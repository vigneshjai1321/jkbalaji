import { describe, expect, it } from 'vitest';
import { parseKjplMjdtaRates } from './kjpl-parse.js';

const SAMPLE = `MJDTA RATE (Without GST) GOLD: (₹) 13685 SILVER: (₹) 245 UPDATED: 13-10-2026 09:44:10 am MJDTA RATE (With GST) GOLD: (₹) 14095.55 SILVER: (₹) 252.35`;

describe('parseKjplMjdtaRates', () => {
  it('parses MJDTA without and with GST blocks', () => {
    const r = parseKjplMjdtaRates(SAMPLE);
    expect(r).not.toBeNull();
    expect(r!.goldWithoutGstInr).toBe(13685);
    expect(r!.silverWithoutGstInr).toBe(245);
    expect(r!.goldWithGstInr).toBe(14095.55);
    expect(r!.silverWithGstInr).toBe(252.35);
    expect(r!.sourceUpdatedAtText).toBe('13-10-2026 09:44:10 am');
  });

  it('rejects empty or non-html input', () => {
    expect(parseKjplMjdtaRates('')).toBeNull();
    expect(parseKjplMjdtaRates('captcha required')).toBeNull();
  });
});
