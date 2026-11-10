import React from 'react';
import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { FeeInvoice, Campus } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  invoice: FeeInvoice;
  campus: Campus | null;
}

export const PrintableChallanModal: React.FC<Props> = ({ open, onClose, invoice, campus }) => {
  if (!open) return null;

  const copies = [
    { title: 'BANK COPY', subtitle: 'To be retained by receiving bank' },
    { title: 'SCHOOL COPY', subtitle: 'To be deposited at school office' },
    { title: 'STUDENT COPY', subtitle: 'To be kept by parent/student' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-surface p-6 shadow-2xl border border-border my-8">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-ink">Official 3-Part Bank Challan</h2>
            <p className="text-xs text-muted">
              Standard Pakistani A4 3-column layout (Bank, School, and Student copies)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              tone="primary"
              className="inline-flex items-center gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print Challan (A4 Landscape)
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 3-Column Challan Document */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3 text-ink">
          {copies.map((copy, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border border-dashed border-border bg-app/40 p-4 text-[11px] font-sans flex flex-col justify-between ${
                idx > 0 ? 'md:border-l md:border-dashed md:border-border' : ''
              }`}
            >
              {/* Header */}
              <div className="text-center border-b border-border pb-2.5">
                <span className="inline-block rounded-md bg-light-primary px-2 py-0.5 text-[10px] font-bold text-primary tracking-wider uppercase mb-1">
                  {copy.title}
                </span>
                <h3 className="font-extrabold text-sm text-ink tracking-tight uppercase">
                  eSchool System
                </h3>
                <p className="font-semibold text-[10px] text-muted">{campus?.name || 'Lahore Main Campus'}</p>
                <p className="text-[9px] text-muted">A/C: Bank Al-Habib Ltd (Gulberg Branch)</p>
                <p className="font-mono text-[9px] font-semibold text-primary">A/C #: 0014-8921-0091-01</p>
              </div>

              {/* Challan Metadata */}
              <div className="my-2.5 space-y-1">
                <div className="flex justify-between items-center bg-surface p-1.5 rounded-lg border border-border">
                  <span className="text-muted font-medium">Challan No:</span>
                  <span className="font-mono font-bold text-ink">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Barcode:</span>
                  <span className="font-mono font-bold text-primary">*{invoice.barcode}*</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Billing Month:</span>
                  <span className="font-semibold">{invoice.billingMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Student Name:</span>
                  <span className="font-bold text-ink truncate max-w-[120px]">{invoice.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Class & Sec:</span>
                  <span className="font-semibold">{invoice.classSection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Issue Date:</span>
                  <span>{invoice.issueDate ? invoice.issueDate.split('T')[0] : '2024-11-01'}</span>
                </div>
                <div className="flex justify-between text-error font-bold">
                  <span>Due Date:</span>
                  <span>{invoice.dueDate ? invoice.dueDate.split('T')[0] : '2024-11-15'}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="my-2 border rounded-xl border-border overflow-hidden bg-surface">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-subtle text-muted text-[9px] uppercase border-b border-border">
                    <tr>
                      <th className="px-2 py-1">Head</th>
                      <th className="px-2 py-1 text-right">PKR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((it, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1 text-muted">{it.headName}</td>
                          <td className="px-2 py-1 text-right font-mono font-medium">
                            {it.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="px-2 py-1 text-muted">Tuition Fee</td>
                          <td className="px-2 py-1 text-right font-mono font-medium">7,500</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1 text-muted">Computer & Lab</td>
                          <td className="px-2 py-1 text-right font-mono font-medium">1,000</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                  <tfoot className="bg-subtle font-bold border-t border-border">
                    <tr>
                      <td className="px-2 py-1">Within Due Date:</td>
                      <td className="px-2 py-1 text-right font-mono text-primary">
                        PKR {invoice.netPayable.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="text-error">
                      <td className="px-2 py-1">After Due Date:</td>
                      <td className="px-2 py-1 text-right font-mono">
                        PKR {(invoice.netPayable + (invoice.lateSurcharge || 500)).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Instructions & Bank Stamp Box */}
              <div className="mt-2 space-y-2">
                <p className="text-[9px] text-muted italic leading-tight">
                  Fee can be deposited at any online branch of Bank Al-Habib across Pakistan or via 1Link 1Bill.
                </p>

                <div className="h-14 border border-dashed border-border rounded-xl flex items-center justify-center text-[9px] text-muted bg-surface/50">
                  Bank Teller Stamp & Signature
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
