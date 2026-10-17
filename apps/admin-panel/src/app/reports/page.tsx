'use client';

import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPanel } from '@/components/admin/AdminPanel';

type Invoice = { invoiceNo: string; totalInr: string; invoiceDate: string; customer: { name: string } };

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const sales = useQuery({
    queryKey: ['reports-sales'],
    queryFn: () => adminFetch<Invoice[]>('/billing/reports/sales'),
  });

  const summary = useQuery({
    queryKey: ['erp-report-summary'],
    queryFn: () => adminFetch<{ expensesTotal: number; revenueTotal: number; plotsByStatus: Record<string, number> }>('/erp/reports/summary'),
  });

  return (
    <div className="space-y-6">
      <AdminPanel
        title="Reports"
        description="Sales, expenses, and plot summary. Broker commissions: use Commissions → Export CSV."
        actions={
          <button
            type="button"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              const rows = [
                ['Invoice', 'Customer', 'Date', 'Total'],
                ...(sales.data ?? []).map((i) => [
                  i.invoiceNo,
                  i.customer.name,
                  new Date(i.invoiceDate).toLocaleDateString('en-IN'),
                  String(i.totalInr),
                ]),
              ];
              downloadCsv('jkbalaji-sales-report.csv', rows);
            }}
          >
            Export sales CSV
          </button>
        }
      >
        {summary.data ? (
          <div className="grid sm:grid-cols-3 gap-4 p-4 border-b border-white/5 text-sm">
            <div className="rounded-xl bg-emerald-500/10 p-4">
              <p className="opacity-70">Total revenue</p>
              <p className="text-2xl font-bold">₹{summary.data.revenueTotal.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl bg-rose-500/10 p-4">
              <p className="opacity-70">Total expenses</p>
              <p className="text-2xl font-bold">₹{summary.data.expensesTotal.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl bg-sky-500/10 p-4">
              <p className="opacity-70">Plots tracked</p>
              <p className="text-2xl font-bold">{Object.values(summary.data.plotsByStatus).reduce((a, b) => a + b, 0)}</p>
            </div>
          </div>
        ) : null}
        <AdminDataTable
          columns={[
            { id: 'invoiceNo', header: 'Invoice', defaultWidth: 140, cell: (i: Invoice) => i.invoiceNo },
            { id: 'customer', header: 'Customer', defaultWidth: 180, cell: (i: Invoice) => <span title={i.customer.name}>{i.customer.name}</span> },
            { id: 'date', header: 'Date', defaultWidth: 120, cell: (i: Invoice) => new Date(i.invoiceDate).toLocaleDateString('en-IN') },
            { id: 'total', header: 'Total', defaultWidth: 130, cell: (i: Invoice) => `₹${Number(i.totalInr).toLocaleString('en-IN')}` },
          ]}
          rows={sales.data ?? []}
          rowKey={(i) => i.invoiceNo}
          isLoading={sales.isLoading}
          error={sales.isError ? 'Could not load the sales report.' : null}
          emptyMessage="No sales in this report."
          columnLayout={{ tableId: 'sales-report', requiredVisible: ['invoiceNo'] }}
        />
      </AdminPanel>
    </div>
  );
}
