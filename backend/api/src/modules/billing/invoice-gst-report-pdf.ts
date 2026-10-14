import PDFDocument from 'pdfkit';
import type { buildGstReport } from './billing-gst-reports.js';

type Report = Awaited<ReturnType<typeof buildGstReport>>;

export function renderGstReportPdf(report: Report): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(16).text('GST & Tax Summary (Internal)', { align: 'center' });
    doc.font('Helvetica').fontSize(9).text(report.range.label, { align: 'center' });
    doc.moveDown();
    doc.fontSize(8).fillColor('#64748b').text(report.disclaimer);
    doc.fillColor('#0f172a').moveDown();

    const t = report.totals;
    doc.font('Helvetica-Bold').fontSize(10).text('Totals');
    doc.font('Helvetica').fontSize(9);
    doc.text(`GST invoices: ${t.gstInvoiceCount} · Non-GST: ${t.nonGstInvoiceCount}`);
    doc.text(`Taxable sales: ₹ ${t.taxableSalesInr.toLocaleString('en-IN')}`);
    doc.text(`CGST: ₹ ${t.cgstInr.toLocaleString('en-IN')} · SGST: ₹ ${t.sgstInr.toLocaleString('en-IN')} · IGST: ₹ ${t.igstInr.toLocaleString('en-IN')}`);
    doc.text(`Total GST: ₹ ${t.gstCollectedInr.toLocaleString('en-IN')} · Invoice value: ₹ ${t.invoiceValueInr.toLocaleString('en-IN')}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Invoice detail (first 40)');
    doc.font('Helvetica').fontSize(8);
    let y = doc.y;
    for (const row of report.invoices.slice(0, 40)) {
      if (y > 720) {
        doc.addPage();
        y = 40;
      }
      const line = `${row.invoiceNo} · ${new Date(row.invoiceDate).toLocaleDateString('en-IN')} · ${row.customerName} · ₹${row.totalInr}`;
      doc.text(line, 40, y);
      y += 12;
    }

    doc.end();
  });
}
