import React, { useState } from 'react';
import { Barcode, Search, CheckCircle, Printer, AlertTriangle } from './Icons';
import { api } from '../services/api';
import type { FeeInvoice } from '../types';

interface Props {
  schoolId: string;
}

export const FeeCounterView: React.FC<Props> = ({ schoolId: _schoolId }) => {
  const [barcodeInput, setBarcodeInput] = useState('202411084');
  const [invoice, setInvoice] = useState<FeeInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amountPaid, setAmountPaid] = useState<number>(8500);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [receiptData, setReceiptData] = useState<{ receiptNumber: string; studentName: string; amountPaid: number; balance: number } | null>(null);
  const [processing, setProcessing] = useState(false);

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
      setError(err instanceof Error ? err.message : 'Challan not found');
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectPayment = async () => {
    if (!invoice) return;
    if (amountPaid <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }

    setProcessing(true);
    try {
      const result = await api.collectFeePayment({
        invoiceId: invoice.id,
        amountPaid: amountPaid,
        paymentMethod: paymentMethod,
        receivedBy: 'Counter Cashier'
      });

      setReceiptData({
        receiptNumber: result.receiptNumber,
        studentName: invoice.studentName,
        amountPaid: amountPaid,
        balance: result.balance
      });

      // Refresh invoice state
      setInvoice(prev => prev ? {
        ...prev,
        paidAmount: result.paidAmount,
        balance: result.balance,
        status: result.status
      } : null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to collect payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Barcode Fee Counter Collection</h1>
          <p className="page-subtitle">Instant laser barcode scanning, partial payment tracking & thermal receipt printing</p>
        </div>
      </div>

      {/* Barcode Scanner Bar */}
      <div className="table-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Barcode size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '40px', height: '44px', fontSize: '16px', fontWeight: 600, letterSpacing: '1px' }}
              placeholder="Scan Barcode or Enter Challan No (e.g. 202411084)"
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }} disabled={loading}>
            <Search size={18} /> {loading ? 'Scanning...' : 'Find Challan (Enter)'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ padding: '16px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Invoice Details Grid */}
      {invoice && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Left: Invoice Breakdown */}
          <div className="table-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>STUDENT CHALLAN</span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{invoice.studentName}</h2>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{invoice.classSection} • Challan #{invoice.invoiceNumber}</p>
              </div>
              <span className={`badge ${invoice.status === 'PAID' ? 'badge-success' : invoice.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
                {invoice.status}
              </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Fee Head Breakdown</h4>
              <table style={{ border: '1px solid #f1f5f9' }}>
                <thead>
                  <tr>
                    <th>Fee Description</th>
                    <th style={{ textAlign: 'right' }}>Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.headName}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {invoice.arrears > 0 && (
                    <tr style={{ color: '#ef4444' }}>
                      <td>Overdue Arrears (Previous Month)</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{invoice.arrears.toLocaleString()}</td>
                    </tr>
                  )}
                  {invoice.concession > 0 && (
                    <tr style={{ color: '#10b981' }}>
                      <td>Approved Kinship / Sibling Concession</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>- {invoice.concession.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                <span>Gross Payable:</span>
                <span>PKR {invoice.netPayable.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px', color: '#10b981' }}>
                <span>Amount Paid:</span>
                <span>PKR {invoice.paidAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, color: '#ef4444', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                <span>Net Outstanding Balance:</span>
                <span>PKR {invoice.balance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right: Cashier Payment Box */}
          <div className="table-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Collect Payment at Counter</h3>

              <div className="form-group">
                <label className="form-label">Tendered Payment Amount (PKR)</label>
                <input
                  type="number"
                  className="input-field"
                  style={{ fontSize: '20px', fontWeight: 700, color: '#4f46e5', height: '48px' }}
                  value={amountPaid}
                  onChange={e => setAmountPaid(Number(e.target.value))}
                  disabled={invoice.balance <= 0}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Channel</label>
                <select
                  className="input-field"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  style={{ height: '40px' }}
                >
                  <option value="Cash">Cash in Hand (Counter)</option>
                  <option value="Bank Clearing">Bank Al-Habib Cheque / Transfer</option>
                  <option value="1Link">1Link 1Bill Gateway</option>
                  <option value="EasyPaisa">EasyPaisa / JazzCash</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '13px', color: '#64748b' }}>
                <div>• Automatic Double-Entry Voucher posted to General Ledger.</div>
                <div>• Instant SignalR real-time broadcast to dashboard revenue.</div>
                <div>• Supports partial payment rollover to next billing cycle.</div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 600, justifyContent: 'center' }}
                onClick={handleCollectPayment}
                disabled={processing || invoice.balance <= 0}
              >
                <CheckCircle size={20} /> {invoice.balance <= 0 ? 'Challan Already Cleared' : processing ? 'Posting Payment...' : 'Submit & Print Receipt (F2)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '16px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>eSchool Modern ERP</h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Official Payment Receipt</p>
            </div>

            <div style={{ textAlign: 'left', fontSize: '13px', lineHeight: '1.8', marginBottom: '20px' }}>
              <div><strong>Receipt No:</strong> {receiptData.receiptNumber}</div>
              <div><strong>Student:</strong> {receiptData.studentName}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
              <div><strong>Payment Method:</strong> {paymentMethod}</div>
              <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '10px', paddingTop: '10px', fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                Amount Paid: PKR {receiptData.amountPaid.toLocaleString()}
              </div>
              <div style={{ fontSize: '13px', color: receiptData.balance > 0 ? '#ef4444' : '#10b981' }}>
                Remaining Dues: PKR {receiptData.balance.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => window.print()}>
                <Printer size={16} /> Print Thermal Slip
              </button>
              <button className="btn btn-secondary" onClick={() => setReceiptData(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
