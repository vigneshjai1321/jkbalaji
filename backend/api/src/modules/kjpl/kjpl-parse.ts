/** Parse MJDTA headline rates from kjpl.in public HTML (not an official API). */

export type KjplParsedRates = {
  goldWithoutGstInr: number;
  silverWithoutGstInr: number;
  goldWithGstInr: number | null;
  silverWithGstInr: number | null;
  sourceUpdatedAtText: string | null;
};

function parseInrAmount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, '').trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 100 || n > 1_000_000) return null;
  return n;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

function extractBlock(text: string, label: string): string | null {
  const idx = text.toUpperCase().indexOf(label.toUpperCase());
  if (idx < 0) return null;
  return text.slice(idx, idx + 600);
}

/** Extract MJDTA without-GST and with-GST blocks from page HTML. */
export function parseKjplMjdtaRates(html: string): KjplParsedRates | null {
  if (!html || html.length < 80) return null;
  if (/access denied|captcha|login required/i.test(html)) return null;

  const text = stripHtml(html);
  const without = extractBlock(text, 'MJDTA RATE (Without GST)');
  const withGst = extractBlock(text, 'MJDTA RATE (With GST)');

  const parsePair = (block: string | null) => {
    if (!block) return { gold: null as number | null, silver: null as number | null, updated: null as string | null };
    const goldM = block.match(/GOLD\s*:?\s*(?:\(\s*₹\s*\)|₹)?\s*([\d,]+(?:\.\d+)?)/i);
    const silverM = block.match(/SILVER\s*:?\s*(?:\(\s*₹\s*\)|₹)?\s*([\d,]+(?:\.\d+)?)/i);
    const updatedM = block.match(/UPDATED\s*:?\s*([0-9\-:\sapm]+)/i);
    return {
      gold: goldM ? parseInrAmount(goldM[1]!) : null,
      silver: silverM ? parseInrAmount(silverM[1]!) : null,
      updated: updatedM ? updatedM[1]!.trim().slice(0, 80) : null,
    };
  };

  const w = parsePair(without);
  const g = parsePair(withGst);

  if (w.gold == null || w.silver == null) {
    const headline = text.match(/GOLD\s+(\d{4,5})[\s\S]{0,40}?SILVER\s+(\d{2,4})/i);
    if (!headline) return null;
    const gold = parseInrAmount(headline[1]!);
    const silver = parseInrAmount(headline[2]!);
    if (gold == null || silver == null) return null;
    return {
      goldWithoutGstInr: gold,
      silverWithoutGstInr: silver,
      goldWithGstInr: g.gold,
      silverWithGstInr: g.silver,
      sourceUpdatedAtText: w.updated ?? g.updated,
    };
  }

  return {
    goldWithoutGstInr: w.gold,
    silverWithoutGstInr: w.silver,
    goldWithGstInr: g.gold,
    silverWithGstInr: g.silver,
    sourceUpdatedAtText: w.updated ?? g.updated,
  };
}
