const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ones[n]!;
  return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`.trim();
}

function section(n: number, label: string): string {
  if (n === 0) return '';
  if (n < 100) return `${twoDigits(n)} ${label}`;
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return `${ones[h]} Hundred${rest ? ` ${twoDigits(rest)}` : ''} ${label}`.trim();
}

/** Indian numbering: Crore, Lakh, Thousand, Hundred */
export function amountInWordsInr(amount: number | string): string {
  const n = Math.round(Number(amount) * 100) / 100;
  if (!Number.isFinite(n) || n < 0) return '';
  if (n === 0) return 'Zero Rupees Only';

  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  const parts: string[] = [];
  if (crore) parts.push(section(crore, 'Crore'));
  if (lakh) parts.push(section(lakh, 'Lakh'));
  if (thousand) parts.push(section(thousand, 'Thousand'));
  if (hundred) parts.push(section(hundred, ''));

  let words = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!words) words = 'Zero';
  words = `${words} Rupees`;
  if (paise > 0) words += ` and ${twoDigits(paise)} Paise`;
  return `${words} Only`;
}
