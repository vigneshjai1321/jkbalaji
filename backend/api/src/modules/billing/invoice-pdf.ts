import PDFDocument from 'pdfkit';
import type { Customer, Invoice, InvoiceLine } from '../../generated/prisma/client.js';
import type { SellerProfile } from './billing-seller.js';
import { amountInWordsInr } from './amount-in-words.js';

type Inv = Invoice & { lines: InvoiceLine[]; customer: Customer };

function fmt(n: number | string | { toString(): string }) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function drawCenteredHeader(
  doc: InstanceType<typeof PDFDocument>,
  seller: SellerProfile,
  gst: boolean,
  left: number,
  width: number,
) {
  const title = (seller.tradeName || seller.legalName || '—').toUpperCase();
  let y = 40;
  if (seller.logoUrl?.startsWith('http')) {
    try {
      doc.image(seller.logoUrl, left + width / 2 - 28, y, { width: 56, height: 40, fit: [56, 40] });
      y += 46;
    } catch {
      /* optional */
    }
  }
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(14).text(title, left, y, { width, align: 'center' });
  y = doc.y + 4;
  doc.font('Helvetica').fontSize(9).fillColor('#334155');
  if (seller.address) {
    doc.text(seller.address, left, y, { width, align: 'center' });
    y = doc.y + 2;
  }
  if (seller.phone) {
    doc.text(`Phone: ${seller.phone}`, left, y, { width, align: 'center' });
    y = doc.y + 2;
  }
  if (seller.email) {
    doc.text(seller.email, left, y, { width, align: 'center' });
    y = doc.y + 2;
  }
  if (gst && seller.gstin) {
    doc.text(`GSTIN: ${seller.gstin.toUpperCase()}`, left, y, { width, align: 'center' });
    y = doc.y + 2;
  }
  doc.moveTo(left, y + 4).lineTo(left + width, y + 4).strokeColor('#cbd5e1').stroke();
  return y + 10;
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
    const top = 36;
    const bottom = doc.page.height - 36;
    const width = right - left;
    const frameHeight = bottom - top;
    const gst = inv.gstApplied !== false;
    const docTitle = gst ? 'TAX INVOICE' : 'INVOICE';
    const compact = inv.lines.length <= 8 && (!inv.notes || inv.notes.length <= 140);

    doc.rect(left, top, width, frameHeight).strokeColor('#475569').lineWidth(0.75).stroke();
    if (compact) {
      doc
        .moveTo(left, top + frameHeight / 2)
        .lineTo(right, top + frameHeight / 2)
        .strokeColor('#e2e8f0')
        .lineWidth(0.5)
        .stroke();
    }

    let y = drawCenteredHeader(doc, seller, gst, left, width);

    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text(docTitle, left, y);
    const metaX = right - 160;
    doc.font('Helvetica').fontSize(9);
    doc.text(`Invoice No: ${inv.invoiceNo}`, metaX, y, { width: 160, align: 'right' });
    doc.text(`Date: ${new Date(inv.invoiceDate).toLocaleDateString('en-IN')}`, metaX, doc.y + 2, { width: 160, align: 'right' });
    if (inv.dueDate) {
      doc.text(`Due: ${new Date(inv.dueDate).toLocaleDateString('en-IN')}`, metaX, doc.y + 2, { width: 160, align: 'right' });
    }
    if (inv.status && !['DRAFT', 'PREVIEW'].includes(inv.status)) {
      doc.text(`Status: ${inv.status.replace(/_/g, ' ')}`, metaX, doc.y + 2, { width: 160, align: 'right' });
    }

    y = Math.max(doc.y, y) + 14;
    doc.rect(left, y, width, 58).strokeColor('#e2e8f0').stroke();
    doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(8).text('BILL TO', left + 8, y + 6);
    doc.fillColor('#0f172a').font('Helvetica').fontSize(9);
    doc.text(inv.customer.name, left + 8, y + 18);
    doc.text(`Phone: ${inv.customer.phone}`, left + 8, y + 30);
    let cy = y + 42;
    if (inv.customer.email) {
      doc.text(inv.customer.email, left + 8, cy);
      cy += 12;
    }
    if (inv.customer.address) doc.text(inv.customer.address, left + 8, cy, { width: width * 0.55 });
    if (inv.customer.gstin) doc.text(`GSTIN: ${inv.customer.gstin}`, left + width * 0.55, y + 18);

    y += 68;
    const cols = gst
      ? [left, left + 168, left + 228, left + 278, left + 328, left + 388, right]
      : [left, left + 248, left + 308, left + 358, right];

    const drawTableHead = (yy: number) => {
      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8);
      doc.text('Description', cols[0]! + 4, yy);
      if (gst) {
        doc.text('HSN', cols[1]! + 2, yy);
        doc.text('Qty', cols[2]! + 2, yy, { width: 40, align: 'right' });
        doc.text('Unit', cols[3]! + 2, yy);
        doc.text('Rate', cols[4]! + 2, yy, { width: 50, align: 'right' });
        doc.text('Taxable', cols[5]! + 2, yy, { width: 50, align: 'right' });
        doc.text('Amount', cols[6]! - 52, yy, { width: 52, align: 'right' });
      } else {
        doc.text('Qty', cols[1]! + 2, yy, { width: 40, align: 'right' });
        doc.text('Unit', cols[2]! + 2, yy);
        doc.text('Rate', cols[3]! + 2, yy, { width: 50, align: 'right' });
        doc.text('Amount', cols[4]! - 52, yy, { width: 52, align: 'right' });
      }
      doc.moveTo(left, yy + 14).lineTo(right, yy + 14).strokeColor('#94a3b8').stroke();
      return yy + 18;
    };

    y = drawTableHead(y);
    doc.font('Helvetica').fontSize(8).fillColor('#0f172a');

    inv.lines
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((l) => {
        if (y > 640) {
          doc.addPage();
          y = 50;
          y = drawTableHead(y);
          doc.font('Helvetica').fontSize(8).fillColor('#0f172a');
        }
        doc.text(l.description.slice(0, 52), cols[0]! + 4, y, { width: gst ? 160 : 200 });
        if (gst) {
          doc.text(l.hsnSac ?? '—', cols[1]! + 2, y);
          doc.text(String(l.qty), cols[2]! + 2, y, { width: 40, align: 'right' });
          doc.text(l.unit ?? 'nos', cols[3]! + 2, y);
          doc.text(fmt(l.rateInr), cols[4]! + 2, y, { width: 50, align: 'right' });
          doc.text(fmt(l.taxableInr), cols[5]! + 2, y, { width: 50, align: 'right' });
          doc.text(fmt(l.amountInr), cols[6]! - 52, y, { width: 52, align: 'right' });
        } else {
          doc.text(String(l.qty), cols[1]! + 2, y, { width: 40, align: 'right' });
          doc.text(l.unit ?? 'nos', cols[2]! + 2, y);
          doc.text(fmt(l.rateInr), cols[3]! + 2, y, { width: 50, align: 'right' });
          doc.text(fmt(l.amountInr), cols[4]! - 52, y, { width: 52, align: 'right' });
        }
        y += 16;
      });

    y += 8;
    const tx = right - 200;
    doc.font('Helvetica').fontSize(9);
    doc.text(`Subtotal: ₹ ${fmt(inv.subtotalInr)}`, tx, y, { width: 200, align: 'right' });
    y += 13;
    if (Number(inv.discountInr) > 0) {
      doc.text(`Discount: ₹ ${fmt(inv.discountInr)}`, tx, y, { width: 200, align: 'right' });
      y += 13;
    }
    if (gst && Number(inv.cgstInr) > 0) {
      doc.text(`CGST: ₹ ${fmt(inv.cgstInr)}`, tx, y, { width: 200, align: 'right' });
      y += 13;
      doc.text(`SGST: ₹ ${fmt(inv.sgstInr)}`, tx, y, { width: 200, align: 'right' });
      y += 13;
    }
    if (gst && Number(inv.igstInr) > 0) {
      doc.text(`IGST: ₹ ${fmt(inv.igstInr)}`, tx, y, { width: 200, align: 'right' });
      y += 13;
    }
    doc.font('Helvetica-Bold').fontSize(11).text(`Amount Payable: ₹ ${fmt(inv.totalInr)}`, tx, y + 2, { width: 200, align: 'right' });
    y += 16;
    doc.font('Helvetica-Oblique').fontSize(7).text(amountInWordsInr(Number(inv.totalInr)), tx - 40, y, { width: 240, align: 'right' });
    y += 18;
    doc.font('Helvetica').fontSize(9);
    if (Number(inv.amountPaidInr) > 0) {
      doc.text(`Paid: ₹ ${fmt(inv.amountPaidInr)}`, tx, y, { width: 200, align: 'right' });
      y += 13;
      const balance = Math.max(0, Number(inv.totalInr) - Number(inv.amountPaidInr));
      doc.text(`Balance due: ₹ ${fmt(balance)}`, tx, y, { width: 200, align: 'right' });
      y += 13;
    }

    y = Math.min(Math.max(y + 24, 680), 740);
    doc.font('Helvetica').fontSize(8).fillColor('#64748b');
    if (seller.bankDetails) doc.text(seller.bankDetails, left, y, { width });
    if (inv.paymentTerms) doc.text(`Payment terms: ${inv.paymentTerms}`, left, doc.y + 4, { width });
    if (inv.notes) doc.text(`Notes: ${inv.notes}`, left, doc.y + 4, { width });
    if (seller.invoiceFooter) doc.text(seller.invoiceFooter, left, doc.y + 4, { width });
    doc.text('This is a computer-generated invoice. E. & O.E.', left, doc.y + 6, { width });

    doc.fillColor('#0f172a').font('Helvetica').fontSize(9);
    doc.text('Authorised signatory', left, 780);
    doc.text(seller.tradeName || seller.legalName || '', left, 812);

    doc.end();
  });
}
