import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, CheckCircle, AlertCircle } from './Icons';
import { api } from '../services/api';
import type { AccountHead, Voucher } from '../types';

interface Props {
  schoolId: string;
}

export const GeneralLedgerView: React.FC<Props> = ({ schoolId }) => {
  const [accounts, setAccounts] = useState<AccountHead[]>([]);
  const [_vouchers, _setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // New Voucher Form
  const [voucherType, setVoucherType] = useState('CPV');
  const [narration, setNarration] = useState('');
  const [entries, setEntries] = useState<Array<{ accountId: string; debit: number; credit: number; narration?: string }>>([
    { accountId: '', debit: 5000, credit: 0, narration: 'Generator Fuel Purchase' },
    { accountId: '', debit: 0, credit: 5000, narration: 'Paid from Cash in Hand' }
  ]);
  const [posting, setPosting] = useState(false);

  const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const loadData = () => {
    setLoading(true);
    api.getChartOfAccounts(schoolId).then(accs => {
      setAccounts(accs);
      if (accs.length >= 2) {
        setEntries([
          { accountId: accs.find(a => a.accountType === 'Expense')?.id || accs[0].id, debit: 5000, credit: 0, narration: 'Generator Diesel Fuel' },
          { accountId: accs.find(a => a.accountCode === '3010001')?.id || accs[1].id, debit: 0, credit: 5000, narration: 'Payment from Cash in Hand' }
        ]);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const handlePostVoucher = async () => {
    if (!isBalanced) {
      alert(`Voucher is out of balance! Total Debit (${totalDebit}) must equal Total Credit (${totalCredit}).`);
      return;
    }

    setPosting(true);
    try {
      await api.postVoucher({
        schoolId,
        voucherType,
        voucherDate: new Date().toISOString(),
        narration: narration || 'General Ledger Transaction',
        entries
      });

      alert('Voucher posted successfully and balanced ledger updated!');
      setShowVoucherModal(false);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to post voucher');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">General Ledger & Double-Entry Accounting</h1>
          <p className="page-subtitle">4-Tier Chart of Accounts (COA) with strict debit-credit balancing</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowVoucherModal(true)}>
          <Plus size={16} /> Post Double-Entry Voucher
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* 4-Tier COA Table */}
        <div className="table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Active Chart of Accounts Hierarchy</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Head Name</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Current Balance (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Loading accounts...</td></tr>
              ) : (
                accounts.map(acc => (
                  <tr key={acc.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{acc.accountCode}</td>
                    <td style={{ paddingLeft: `${acc.level * 14}px` }}>
                      {acc.level === 4 ? '↳ ' : ''}<strong>{acc.accountName}</strong>
                    </td>
                    <td>
                      <span className={`badge ${
                        acc.accountType === 'Asset' ? 'badge-info' :
                        acc.accountType === 'Income' ? 'badge-success' :
                        acc.accountType === 'Expense' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {acc.accountType}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>
                      {acc.currentBalance.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Voucher Types & Accounting Rules Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="table-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>Enforced Accounting Invariants</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle size={16} color="#10b981" />
                <span><strong>Atomic Balancing:</strong> Σ Debit ≡ Σ Credit per voucher</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle size={16} color="#10b981" />
                <span><strong>Cash Receipts (CRV):</strong> Auto-posted on counter student fee payment</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle size={16} color="#10b981" />
                <span><strong>Cash Payments (CPV):</strong> Operating petty cash expenses</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle size={16} color="#10b981" />
                <span><strong>Journal Vouchers (JV):</strong> Payroll accruals and month-end adjustments</span>
              </div>
            </div>
          </div>

          <div className="table-card" style={{ padding: '20px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <BookOpen size={20} color="#2563eb" />
              <div>
                <strong style={{ color: '#1e40af' }}>Audit Integrity Standard</strong>
                <p style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>
                  Posted financial vouchers cannot be silently overwritten or deleted. Any corrections require an offsetting reversing Journal Voucher (JV) with recorded user identity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Double-Entry Voucher Modal */}
      {showVoucherModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Post Double-Entry Voucher</h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Post balanced general ledger transaction to chart of accounts</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Voucher Type</label>
                <select className="input-field" value={voucherType} onChange={e => setVoucherType(e.target.value)}>
                  <option value="CPV">Cash Payment Voucher (CPV)</option>
                  <option value="CRV">Cash Receipt Voucher (CRV)</option>
                  <option value="BPV">Bank Payment Voucher (BPV)</option>
                  <option value="BRV">Bank Receipt Voucher (BRV)</option>
                  <option value="JV">Journal Voucher (JV)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">General Narration</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Generator Maintenance & Diesel"
                  value={narration}
                  onChange={e => setNarration(e.target.value)}
                />
              </div>
            </div>

            {/* Line Items Grid */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Transaction Entries</h4>
              <table style={{ border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr>
                    <th>Account Head</th>
                    <th>Line Narration</th>
                    <th style={{ width: '130px' }}>Debit (PKR)</th>
                    <th style={{ width: '130px' }}>Credit (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr key={idx}>
                      <td>
                        <select
                          className="input-field"
                          value={entry.accountId}
                          onChange={e => {
                            const newEntries = [...entries];
                            newEntries[idx].accountId = e.target.value;
                            setEntries(newEntries);
                          }}
                        >
                          <option value="">Select Account...</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="input-field"
                          value={entry.narration || ''}
                          onChange={e => {
                            const newEntries = [...entries];
                            newEntries[idx].narration = e.target.value;
                            setEntries(newEntries);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="input-field"
                          value={entry.debit}
                          onChange={e => {
                            const newEntries = [...entries];
                            newEntries[idx].debit = Number(e.target.value);
                            setEntries(newEntries);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="input-field"
                          value={entry.credit}
                          onChange={e => {
                            const newEntries = [...entries];
                            newEntries[idx].credit = Number(e.target.value);
                            setEntries(newEntries);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Balance Checker */}
            <div style={{
              background: isBalanced ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${isBalanced ? '#10b981' : '#ef4444'}`,
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <strong style={{ color: isBalanced ? '#065f46' : '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isBalanced ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  {isBalanced ? 'Voucher is Perfectly Balanced' : `Out of Balance Discrepancy: PKR ${Math.abs(totalDebit - totalCredit)}`}
                </strong>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Total Debit: PKR {totalDebit.toLocaleString()} | Total Credit: PKR {totalCredit.toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '12px' }}
                onClick={() => setEntries([...entries, { accountId: '', debit: 0, credit: 0, narration: '' }])}
              >
                + Add Line
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowVoucherModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePostVoucher}
                disabled={!isBalanced || posting}
              >
                {posting ? 'Posting to Ledger...' : 'Post Balanced Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
