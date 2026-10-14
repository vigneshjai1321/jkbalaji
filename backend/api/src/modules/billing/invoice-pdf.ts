import PDFDocument from 'pdfkit';
import type { Customer, Invoice, InvoiceLine } from '../../generated/prisma/client.js';
import type { SellerProfile } from './billing-seller.js';
import { amountInWordsInr } from './amount-in-words.js';

type Inv = Invoice & { lines: InvoiceLine[]; customer: Customer };

function fmt(n: number | string | { toString(): string }) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function renderInvoicePdf(inv: Inv, seller: SellerProfile): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 40;
    const right = doc.page.width - 40;
    const width = right - left;

    const title = inv.gstApplied ? 'TAX INVOICE' : 'INVOICE';
    let headerY = 40;
    if (seller.logoUrl?.startsWith('http')) {
      try {
        doc.image(seller.logoUrl, left, headerY, { width: 56, height: 56, fit: [56, 56] });
        headerY += 62;
      } catch {
        /* logo optional */
      }
    }

    doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(16).text(seller.tradeName || seller.legalName || '—', left, headerY, { width: width * 0.55 });
    doc.fillColor('#334155').font('Helvetica').fontSize(8);
    if (seller.legalName && seller.legalName !== seller.tradeName) doc.text(seller.legalName, left, doc.y + 2);
    if (seller.address) doc.text(seller.address, left, doc.y + 4, { width: width * 0.55 });
    if (inv.gstApplied && seller.gstin) doc.text(`GSTIN: ${seller.gstin}`, left, doc.y + 2);
    const contact = [seller.phone, seller.email].filter(Boolean).join(' · ');
    if (contact) doc.text(contact, left, doc.y + 2);

    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(14).text(title, right - 180, 40, { width: 180, align: 'right' });
    doc.font('Helvetica').fontSize(9);
    doc.text(`Invoice No: ${inv.invoiceNo}`, right - 180, 62, { width: 180, align: 'right' });
    doc.text(`Date: ${new Date(inv.invoiceDate).toLocaleDateString('en-IN')}`, right - 180, 74, { width: 180, align: 'right' });
    if (inv.dueDate) {
      doc.text(`Due: ${new Date(inv.dueDate).toLocaleDateString('en-IN')}`, right - 180, 86, { width: 180, align: 'right' });
    }
    doc.text(`Status: ${inv.status.replace(/_/g, ' ')}`, right - 180, inv.dueDate ? 98 : 86, { width: 180, align: 'right' });

    let y = 120;
    doc.rect(left, y, width, 68).fill('#f8fafc');
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text('Bill To', left + 8, y + 8);
    doc.font('Helvetica').fontSize(9);
    doc.text(inv.customer.name, left + 8, y + 22);
    doc.text(`Phone: ${inv.customer.phone}`, left + 8, y + 34);
    if (inv.customer.email) doc.text(inv.customer.email, left + 8, y + 46);
    if (inv.customer.address) doc.text(inv.customer.address, left + 8, y + 58, { width: width * 0.5 });
    if (inv.customer.gstin) doc.text(`GSTIN: ${inv.customer.gstin}`, left + width * 0.52, y + 22);

    y += 80;
    const cols = [left, left + 200, left + 248, left + 308, left + 368, left + 428, right];
    doc.fillColor('#047857').rect(left, y, width, 20).fill();
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8);
    doc.text('Description', cols[0]! + 4, y + 6, { width: 190 });
    doc.text('HSN', cols[1]! + 2, y + 6);
    doc.text('Qty', cols[2]! + 2, y + 6);
    doc.text('Rate', cols[3]! + 2, y + 6);
    doc.text('Taxable', cols[4]! + 2, y + 6);
    doc.text('GST', cols[5]! + 2, y + 6);
    y += 22;

    doc.font('Helvetica').fontSize(8).fillColor('#0f172a');
    inv.lines
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((l, i) => {
        if (y > 680) {
          doc.addPage();
          y = 50;
        }
        if (i % 2 === 0) doc.rect(left, y - 2, width, 18).fill('#f1f5f9');
        doc.fillColor('#0f172a');
        const gst = Number(l.cgstInr) + Number(l.sgstInr) + Number(l.igstInr);
        doc.text(l.description.slice(0, 48), cols[0]! + 4, y, { width: 190 });
        doc.text(l.hsnSac ?? '—', cols[1]! + 2, y);
        doc.text(String(l.qty), cols[2]! + 2, y);
        doc.text(fmt(l.rateInr), cols[3]! + 2, y);
        doc.text(fmt(l.taxableInr), cols[4]! + 2, y);
        doc.text(fmt(gst), cols[5]! + 2, y);
        y += 18;
      });

    y += 12;
    const tx = right - 200;
    doc.font('Helvetica').fontSize(9);
    doc.text(`Subtotal: ₹ ${fmt(inv.subtotalInr)}`, tx, y, { width: 200, align: 'right' });
    y += 14;
    if (Number(inv.discountInr) > 0) {
      doc.text(`Discount: ₹ ${fmt(inv.discountInr)}`, tx, y, { width: 200, align: 'right' });
      y += 14;
    }
    if (inv.gstApplied && Number(inv.cgstInr) > 0) {
      doc.text(`CGST: ₹ ${fmt(inv.cgstInr)}`, tx, y, { width: 200, align: 'right' });
      y += 14;
      doc.text(`SGST: ₹ ${fmt(inv.sgstInr)}`, tx, y, { width: 200, align: 'right' });
      y += 14;
    }
    if (inv.gstApplied && Number(inv.igstInr) > 0) {
      doc.text(`IGST: ₹ ${fmt(inv.igstInr)}`, tx, y, { width: 200, align: 'right' });
      y += 14;
    }
    doc.font('Helvetica-Bold').fontSize(11).text(`Grand Total: ₹ ${fmt(inv.totalInr)}`, tx, y + 4, { width: 200, align: 'right' });
    y += 18;
    doc.font('Helvetica-Oblique').fontSize(7).text(amountInWordsInr(Number(inv.totalInr)), tx - 40, y, { width: 240, align: 'right' });
    y += 22;
    doc.font('Helvetica').fontSize(9);
    doc.text(`Amount Paid: ₹ ${fmt(inv.amountPaidInr)}`, tx, y, { width: 200, align: 'right' });
    y += 14;
    const balance = Math.max(0, Number(inv.totalInr) - Number(inv.amountPaidInr));
    doc.text(`Balance Due: ₹ ${fmt(balance)}`, tx, y, { width: 200, align: 'right' });

    y = Math.max(y + 40, 720);
    doc.font('Helvetica').fontSize(8).fillColor('#64748b');
    if (seller.bankDetails) doc.text(`Bank: ${seller.bankDetails}`, left, y, { width });
    if (inv.paymentTerms) doc.text(`Payment terms: ${inv.paymentTerms}`, left, doc.y + 4, { width });
    if (inv.notes) doc.text(`Notes: ${inv.notes}`, left, doc.y + 4, { width });
    if (seller.invoiceFooter) doc.text(seller.invoiceFooter, left, doc.y + 4, { width });
    doc.text('This is a computer-generated invoice. E. & O.E.', left, doc.y + 8, { width });

    doc.fillColor('#0f172a').font('Helvetica').fontSize(9);
    doc.text('Authorised Signatory', left, 780);
    doc.text('_________________________', left, 798);
    doc.text(seller.tradeName || seller.legalName || '', left, 812);

    doc.end();
  });
}
