import React, { useState } from 'react';
import {
  Barcode,
  Search,
  CheckCircle2,
  Printer,
  AlertTriangle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { api } from '@/services/api';
import { useCampus } from '@/context/CampusContext';
import { useToast } from '@/context/ToastContext';
import type { FeeInvoice } from '@/types';

export function FeeCounterPage() {
  const { currentCampus, signalRConnected } = useCampus();
  const { showToast } = useToast();
  const [barcodeInput, setBarcodeInput] = useState('202411084');
  const [invoice, setInvoice] = useState<FeeInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment form state
  const [amountPaid, setAmountPaid] = useState<number>(8500);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptData, setReceiptData] = useState<{
    receiptNumber: string;
    studentName: string;
    amountPaid: number;
    balance: number;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.getInvoiceByBarcode(barcodeInput.trim());
      setInvoice(data);
      setAmountPaid(data.balance);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Challan record not found');
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectPayment = async () => {
    if (!invoice) return;
    if (amountPaid <= 0) {
      showToast('Payment amount must be greater than zero', 'warning');
      return;
    }

    setProcessing(true);
    try {
      const result = await api.collectFeePayment({
        invoiceId: invoice.id,
        amountPaid: amountPaid,
        paymentMethod: paymentMethod,
        receivedBy: 'Counter Cashier',
        referenceNumber: referenceNumber || undefined,
      });

      setReceiptData({
        receiptNumber: result.receiptNumber || 'RCP-2026-9041',
        studentName: invoice.studentName,
        amountPaid: amountPaid,
        balance: result.balance,
      });

      setInvoice((prev) =>
        prev
          ? {
              ...prev,
              paidAmount: result.paidAmount,
              balance: result.balance,
              status: result.status,
            }
          : null
      );

      setReceiptModalOpen(true);
      showToast(`Payment received: PKR ${amountPaid.toLocaleString()} (SignalR Emitted)`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to collect payment', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-light-success text-success">
              <Receipt className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Fee Counter & Barcode Laser Scanner
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            High-speed challan payment cashier with real-time double-entry GL ledger posting &
            SignalR broadcast for{' '}
            <span className="font-semibold text-primary">
              {currentCampus?.name || 'Lahore Main'}
            </span>
          </p>
        </div>

        {signalRConnected && (
          <div className="flex items-center gap-2 rounded-full border border-success/30 bg-light-success px-3.5 py-1.5 text-xs font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            SignalR CounterHub: Live Synchronized
          </div>
        )}
      </div>

      {/* Barcode Laser Input Card */}
      <Card className="p-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Barcode className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
            <input
              type="text"
              autoFocus
              placeholder="Scan Barcode or Enter Challan No (e.g. 202411084)"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full rounded-2xl border-2 border-primary/30 bg-app py-3 pl-11 pr-4 font-mono text-base font-bold tracking-wider text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            tone="primary"
            size="lg"
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Querying...' : 'Fetch Challan'}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>Quick test barcodes:</span>
          {['202411084', '202411085', '202411086'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setBarcodeInput(code);
                api.getInvoiceByBarcode(code).then((data) => {
                  setInvoice(data);
                  setAmountPaid(data.balance);
                });
              }}
              className="rounded-lg bg-subtle px-2.5 py-1 font-mono text-[11px] font-semibold text-ink hover:bg-light-primary hover:text-primary transition-colors"
            >
              #{code}
            </button>
          ))}
        </div>
      </Card>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-error/30 bg-light-error p-4 text-xs font-medium text-error">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Invoice Details & Payment Section */}
      {invoice && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Challan Overview Card */}
          <Card className="p-6 lg:col-span-2 space-y-6">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-ink">{invoice.invoiceNumber}</h2>
                  <StatusBadge
                    label={invoice.status}
                    tone={
                      invoice.status === 'PAID'
                        ? 'success'
                        : invoice.status === 'PARTIAL'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </div>
                <p className="mt-1 font-mono text-xs text-muted">Barcode ID: {invoice.barcode}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted">Billing Cycle</span>
                <p className="font-semibold text-ink">{invoice.billingMonth} (Nov 2024)</p>
              </div>
            </div>

            {/* Student & Class Details */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-app p-4 sm:grid-cols-4">
              <div>
                <p className="text-[11px] font-medium text-muted">Student Name</p>
                <p className="mt-1 text-sm font-bold text-ink">{invoice.studentName}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted">Class & Section</p>
                <p className="mt-1 text-sm font-bold text-ink">{invoice.classSection}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted">Issue Date</p>
                <p className="mt-1 text-sm font-semibold text-ink">{invoice.issueDate}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted">Due Date</p>
                <p className="mt-1 text-sm font-bold text-error">{invoice.dueDate}</p>
              </div>
            </div>

            {/* Itemized Fee Breakdown Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                Itemized Fee Head Breakdown
              </h3>
              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-app text-muted text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Fee Head Name</th>
                      <th className="px-4 py-3 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-subtle/50">
                          <td className="px-4 py-3 font-medium text-ink">{item.headName}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                            PKR {item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="px-4 py-3 font-medium text-ink">Tuition Fee</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                            PKR 7,500
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium text-ink">Computer & Lab Fund</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                            PKR 1,000
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                  <tfoot className="bg-app font-bold text-ink border-t border-border">
                    <tr>
                      <td className="px-4 py-3">Total Payable</td>
                      <td className="px-4 py-3 text-right font-mono text-primary text-sm">
                        PKR {invoice.netPayable.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </Card>

          {/* Cashier Payment Action Box */}
          <Card className="p-6 space-y-5">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-bold text-ink">Cashier Payment Action</h3>
              <p className="mt-0.5 text-xs text-muted">Receive cash, card, or bank transfer</p>
            </div>

            {/* Outstanding Balance KPI */}
            <div className="rounded-2xl bg-light-primary p-4">
              <span className="text-xs font-medium text-primary">Outstanding Payable</span>
              <h2 className="mt-1 text-3xl font-extrabold text-primary">
                PKR {invoice.balance.toLocaleString()}
              </h2>
              {invoice.paidAmount > 0 && (
                <p className="mt-1.5 text-xs text-success font-semibold">
                  ✓ Already paid: PKR {invoice.paidAmount.toLocaleString()}
                </p>
              )}
            </div>

            {invoice.status === 'PAID' ? (
              <div className="rounded-2xl border border-success/30 bg-light-success p-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
                <h4 className="mt-2 text-sm font-bold text-success">Fully Cleared</h4>
                <p className="mt-1 text-xs text-muted">
                  No outstanding balance remaining for this challan.
                </p>
                <Button
                  tone="success"
                  size="sm"
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5"
                  onClick={() => setReceiptModalOpen(true)}
                >
                  <Printer className="h-4 w-4" />
                  Print Last Receipt
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Amount to Collect (PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={invoice.balance}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-app px-3.5 py-2.5 text-base font-bold text-ink focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-border bg-app px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank">Bank Deposit / Transfer</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="JazzCash">JazzCash / EasyPaisa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Receipt / Cheque Ref (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TR-98214"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  />
                </div>

                <Button
                  tone="success"
                  size="lg"
                  className="w-full inline-flex items-center justify-center gap-2"
                  disabled={processing}
                  onClick={handleCollectPayment}
                >
                  <FileCheck className="h-4 w-4" />
                  {processing
                    ? 'Posting to Ledger...'
                    : `Receive PKR ${amountPaid.toLocaleString()}`}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Thermal Receipt Modal */}
      <Modal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Official Payment Receipt"
        size="md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="text-center border-b border-dashed border-border pb-4">
            <h3 className="text-base font-bold text-ink uppercase tracking-wider">eSchool System</h3>
            <p className="text-muted">{currentCampus?.name || 'Lahore Main Campus'}</p>
            <p className="text-[11px] text-muted">Gulberg III, Lahore • Tel: 042-35870000</p>
          </div>

          <div className="space-y-1 py-2">
            <div className="flex justify-between">
              <span className="text-muted">Receipt No:</span>
              <span className="font-bold text-ink">
                {receiptData?.receiptNumber || 'RCP-2026-9041'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Date & Time:</span>
              <span className="text-ink">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Challan Ref:</span>
              <span className="text-ink">{invoice?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Student Name:</span>
              <span className="font-bold text-ink">{invoice?.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment Mode:</span>
              <span className="text-ink">{paymentMethod}</span>
            </div>
          </div>

          <div className="border-t border-b border-dashed border-border py-3 space-y-1">
            <div className="flex justify-between text-sm font-bold text-ink">
              <span>Amount Paid:</span>
              <span className="text-success">
                PKR {(receiptData?.amountPaid ?? 8500).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Remaining Balance:</span>
              <span className="text-ink">
                PKR {(receiptData?.balance ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center text-[11px] text-muted pt-2">
            <p>Computer generated payment receipt.</p>
            <p>Thank you for paying on time.</p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              tone="primary"
              className="inline-flex items-center gap-1.5"
              onClick={() => {
                window.print();
              }}
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
