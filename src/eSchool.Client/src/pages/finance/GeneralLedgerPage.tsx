import { useEffect, useState } from 'react';
import {
  BadgeDollarSign,
  Plus,
  Scale,
  CheckCircle2,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { api } from '@/services/api';
import { useCampus } from '@/context/CampusContext';
import { useToast } from '@/context/ToastContext';
import type { AccountHead, Voucher } from '@/types';

export function GeneralLedgerPage() {
  const { currentCampus } = useCampus();
  const { showToast } = useToast();

  const [accounts, setAccounts] = useState<AccountHead[]>([]);
  const [, setLoadingAccounts] = useState(false);
  const [accountTypeFilter, setAccountTypeFilter] = useState('ALL');

  // New Voucher Modal
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [voucherType, setVoucherType] = useState<'CPV' | 'CRV' | 'BPV' | 'BRV' | 'JV'>('CPV');
  const [narration, setNarration] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [voucherEntries, setVoucherEntries] = useState<
    Array<{ accountId: string; debit: number; credit: number; narration?: string }>
  >([
    { accountId: '1', debit: 0, credit: 5000, narration: 'Cash outflow' },
    { accountId: '5', debit: 5000, credit: 0, narration: 'Office utility payment' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Vouchers registry
  const [vouchers, setVouchers] = useState<Voucher[]>([
    {
      id: 'v1',
      voucherNumber: 'CPV-2026-1001',
      voucherType: 'CPV',
      voucherDate: '2026-11-10',
      totalAmount: 5000,
      narration: 'Generator diesel refuel (50 Liters)',
      isPosted: true,
      entriesCount: 2,
    },
    {
      id: 'v2',
      voucherNumber: 'CRV-2026-0892',
      voucherType: 'CRV',
      voucherDate: '2026-11-09',
      totalAmount: 18500,
      narration: 'Counter fee collection batch clearance',
      isPosted: true,
      entriesCount: 2,
    },
    {
      id: 'v3',
      voucherNumber: 'BPV-2026-0412',
      voucherType: 'BPV',
      voucherDate: '2026-11-08',
      totalAmount: 120000,
      narration: 'Science lab equipment supply invoice #889',
      isPosted: true,
      entriesCount: 2,
    },
  ]);

  const loadCOA = async () => {
    if (!currentCampus) return;
    setLoadingAccounts(true);
    try {
      const data = await api.getChartOfAccounts(currentCampus.id);
      setAccounts(data);
    } catch {
      showToast('Error loading Chart of Accounts', 'error');
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadCOA();
  }, [currentCampus]);

  const totalDebit = voucherEntries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = voucherEntries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const handleAddEntry = () => {
    setVoucherEntries((prev) => [
      ...prev,
      { accountId: accounts[0]?.id || '1', debit: 0, credit: 0, narration: '' },
    ]);
  };

  const handleRemoveEntry = (idx: number) => {
    if (voucherEntries.length <= 2) {
      showToast('Double-entry voucher requires at least two lines', 'warning');
      return;
    }
    setVoucherEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePostVoucher = async () => {
    if (!currentCampus) return;
    if (!isBalanced) {
      showToast('Debit and Credit must be equal (Invariant violation)', 'error');
      return;
    }
    if (!narration.trim()) {
      showToast('Please enter a voucher description/narration', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.postVoucher({
        schoolId: currentCampus.id,
        voucherType,
        voucherDate: new Date().toISOString().split('T')[0],
        narration,
        chequeNumber: chequeNumber || undefined,
        entries: voucherEntries,
      });

      showToast(`Voucher posted successfully: ${result.voucherNumber}`, 'success');

      // Prepend to local voucher list
      setVouchers((prev) => [
        {
          id: result.voucherId || `v-${Date.now()}`,
          voucherNumber: result.voucherNumber || `${voucherType}-${Date.now().toString().slice(-4)}`,
          voucherType,
          voucherDate: new Date().toISOString().split('T')[0],
          totalAmount: totalDebit,
          narration,
          isPosted: true,
          entriesCount: voucherEntries.length,
        },
        ...prev,
      ]);

      setVoucherModalOpen(false);
      setNarration('');
      setChequeNumber('');
      loadCOA();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Voucher failed to post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    if (accountTypeFilter !== 'ALL' && acc.accountType !== accountTypeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-light-primary text-primary">
              <BadgeDollarSign className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              General Ledger & Double-Entry Accounting
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            4-Tier Chart of Accounts, strict double-entry invariants & voucher postings for{' '}
            <span className="font-semibold text-primary">
              {currentCampus?.name || 'Lahore Main'}
            </span>
          </p>
        </div>

        <Button
          tone="primary"
          onClick={() => setVoucherModalOpen(true)}
          className="inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Post New Voucher
        </Button>
      </div>

      {/* Account Type Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Cash & Bank Assets</p>
          <h3 className="mt-1 text-2xl font-bold text-ink">PKR 2,450,000</h3>
          <p className="mt-2 text-xs text-success flex items-center gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled with Bank
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Accounts Receivable (Fees)</p>
          <h3 className="mt-1 text-2xl font-bold text-primary">PKR 450,000</h3>
          <p className="mt-2 text-xs text-muted">Current Academic Session</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Monthly Fee Revenue</p>
          <h3 className="mt-1 text-2xl font-bold text-success">PKR 8,950,000</h3>
          <p className="mt-2 text-xs text-success flex items-center gap-1 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> +12.4% vs last month
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Monthly Operating Expenses</p>
          <h3 className="mt-1 text-2xl font-bold text-error">PKR 1,285,000</h3>
          <p className="mt-2 text-xs text-muted">Salaries, utilities, diesel</p>
        </Card>
      </div>

      {/* Chart of Accounts & Recent Vouchers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart of Accounts Card */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-ink">4-Tier Chart of Accounts (COA)</h2>
              <p className="text-xs text-muted">General ledger head codes and running balances</p>
            </div>

            <div className="flex rounded-xl bg-app p-1 border border-border">
              {['ALL', 'Asset', 'Income', 'Expense'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAccountTypeFilter(tab)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    accountTypeFilter === tab
                      ? 'bg-surface text-primary shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-app text-muted text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Account Code</th>
                  <th className="px-4 py-3">Account Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-subtle/50">
                    <td className="px-4 py-3 font-mono font-bold text-primary">
                      {acc.accountCode}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{acc.accountName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={acc.accountType}
                        tone={
                          acc.accountType === 'Asset'
                            ? 'info'
                            : acc.accountType === 'Income'
                            ? 'success'
                            : 'error'
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                      PKR {acc.currentBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Vouchers Register Card */}
        <Card className="p-5 space-y-4">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-bold text-ink">Recent Vouchers Register</h2>
            <p className="text-xs text-muted">Posted double-entry transactions</p>
          </div>

          <div className="space-y-3">
            {vouchers.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-border bg-app/50 p-3.5 space-y-2 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">
                    {v.voucherNumber}
                  </span>
                  <StatusBadge
                    label={v.voucherType}
                    tone={
                      v.voucherType === 'CRV' || v.voucherType === 'BRV'
                        ? 'success'
                        : v.voucherType === 'CPV' || v.voucherType === 'BPV'
                        ? 'error'
                        : 'primary'
                    }
                  />
                </div>
                <p className="text-xs font-medium text-ink line-clamp-1">{v.narration}</p>
                <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-border/50">
                  <span>{v.voucherDate}</span>
                  <span className="font-mono font-bold text-ink">
                    PKR {v.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Double Entry Voucher Modal */}
      <Modal
        open={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        title="Post Double-Entry Voucher (Mathematical Invariant)"
        size="lg"
      >
        <div className="space-y-5">
          {/* Voucher Header Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Voucher Type *</label>
              <select
                value={voucherType}
                onChange={(e) =>
                  setVoucherType(e.target.value as 'CPV' | 'CRV' | 'BPV' | 'BRV' | 'JV')
                }
                className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              >
                <option value="CPV">CPV - Cash Payment Voucher</option>
                <option value="CRV">CRV - Cash Receipt Voucher</option>
                <option value="BPV">BPV - Bank Payment Voucher</option>
                <option value="BRV">BRV - Bank Receipt Voucher</option>
                <option value="JV">JV - General Journal Voucher</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Cheque # (Optional)</label>
              <input
                type="text"
                placeholder="e.g. CHQ-481920"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Campus</label>
              <input
                type="text"
                disabled
                value={currentCampus?.name || 'Lahore Main'}
                className="w-full rounded-xl border border-border bg-subtle px-3.5 py-2 text-sm text-muted"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Voucher Narration / Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Being payment made for monthly office stationery and print paper"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          {/* Double Entry Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Double Entry Lines (Dr. = Cr.)
              </span>
              <Button tone="secondary" size="sm" onClick={handleAddEntry}>
                + Add Line
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-app text-muted text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">Account Head</th>
                    <th className="px-3.5 py-2.5">Line Description</th>
                    <th className="px-3.5 py-2.5 w-32">Debit (PKR)</th>
                    <th className="px-3.5 py-2.5 w-32">Credit (PKR)</th>
                    <th className="px-2 py-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {voucherEntries.map((entry, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <select
                          value={entry.accountId}
                          onChange={(e) => {
                            const newEntries = [...voucherEntries];
                            newEntries[idx].accountId = e.target.value;
                            setVoucherEntries(newEntries);
                          }}
                          className="w-full rounded-lg border border-border bg-app p-1.5 text-xs text-ink focus:border-primary focus:outline-none"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.accountCode} - {acc.accountName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Narration"
                          value={entry.narration || ''}
                          onChange={(e) => {
                            const newEntries = [...voucherEntries];
                            newEntries[idx].narration = e.target.value;
                            setVoucherEntries(newEntries);
                          }}
                          className="w-full rounded-lg border border-border bg-app p-1.5 text-xs text-ink focus:border-primary focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          value={entry.debit}
                          onChange={(e) => {
                            const newEntries = [...voucherEntries];
                            newEntries[idx].debit = Number(e.target.value);
                            setVoucherEntries(newEntries);
                          }}
                          className="w-full rounded-lg border border-border bg-app p-1.5 text-xs font-mono font-semibold text-ink text-right focus:border-primary focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          value={entry.credit}
                          onChange={(e) => {
                            const newEntries = [...voucherEntries];
                            newEntries[idx].credit = Number(e.target.value);
                            setVoucherEntries(newEntries);
                          }}
                          className="w-full rounded-lg border border-border bg-app p-1.5 text-xs font-mono font-semibold text-ink text-right focus:border-primary focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveEntry(idx)}
                          className="text-muted hover:text-error transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-app font-bold text-ink border-t border-border">
                  <tr>
                    <td colSpan={2} className="px-3.5 py-3 text-right">
                      Totals:
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono text-primary">
                      PKR {totalDebit.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono text-primary">
                      PKR {totalCredit.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Balance Invariant Indicator */}
          <div
            className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-semibold ${
              isBalanced
                ? 'bg-light-success text-success border border-success/30'
                : 'bg-light-error text-error border border-error/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 shrink-0" />
              <span>
                {isBalanced
                  ? 'Mathematical Invariant Satisfied: Debit equals Credit (Balanced)'
                  : `Invariant Violation: Difference of PKR ${Math.abs(
                      totalDebit - totalCredit
                    ).toLocaleString()}`}
              </span>
            </div>
            <span>Difference: PKR {Math.abs(totalDebit - totalCredit).toLocaleString()}</span>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={() => setVoucherModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              tone="primary"
              disabled={!isBalanced || submitting}
              onClick={handlePostVoucher}
            >
              {submitting ? 'Posting...' : 'Post to General Ledger'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
