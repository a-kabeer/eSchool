import { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Unlock,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { useCampus } from '@/context/CampusContext';
import { useToast } from '@/context/ToastContext';

interface DataLockItem {
  sectionKey: string;
  category: string;
  title: string;
  description: string;
  lockDate: string; // YYYY-MM-DD
  updatedBy: string;
}

const INITIAL_41_DATA_LOCKS: DataLockItem[] = [
  // Students (11)
  { sectionKey: 'Students.Inquiries', category: 'Students', title: 'Student Inquiries', description: 'Freezes historical student inquiries and leads', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Students.Registrations', category: 'Students', title: 'Student Registrations', description: 'Freezes new candidate registrations and registration fees', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Students.Joining', category: 'Students', title: 'Student Joining', description: 'Locks formal admission enrollment and joining dates', lockDate: '2024-07-31', updatedBy: 'System' },
  { sectionKey: 'Students.Attendance', category: 'Students', title: 'Daily Attendance', description: 'Locks student daily roll-call attendance entries', lockDate: '2026-10-31', updatedBy: 'Principal' },
  { sectionKey: 'Students.SubjectAttendance', category: 'Students', title: 'Subject-Wise Attendance', description: 'Locks subject-specific period attendance records', lockDate: '2026-10-31', updatedBy: 'System' },
  { sectionKey: 'Students.Leaves', category: 'Students', title: 'Student Leaves', description: 'Locks historical student leave applications and approvals', lockDate: '2026-10-31', updatedBy: 'System' },
  { sectionKey: 'Students.Withdrawals', category: 'Students', title: 'Student Withdrawals', description: 'Locks student withdrawal and SLC generation', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Students.Transfers', category: 'Students', title: 'Student Transfers', description: 'Locks inter-campus or inter-section student transfers', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Students.Rejoins', category: 'Students', title: 'Student Rejoins', description: 'Locks re-enrollment of former students', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Students.Graduations', category: 'Students', title: 'Student Graduations', description: 'Locks graduating class closures and record archives', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Students.DisciplineComments', category: 'Students', title: 'Behavior & Comments', description: 'Locks behavioral merits/demerits and nature ratings', lockDate: '2026-10-31', updatedBy: 'System' },

  // Academics (4)
  { sectionKey: 'Academics.Examinations', category: 'Academics', title: 'Examinations Master', description: 'Locks exam term definitions and dates', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Academics.MarksEntry', category: 'Academics', title: 'Marks Entry', description: 'Locks theory and practical examination marks from edits', lockDate: '2026-03-31', updatedBy: 'Exam Coordinator' },
  { sectionKey: 'Academics.Timetable', category: 'Academics', title: 'Timetable Schedules', description: 'Locks seasonal period assignments and teacher allocations', lockDate: '2024-08-31', updatedBy: 'System' },
  { sectionKey: 'Academics.CalendarEvents', category: 'Academics', title: 'eCalendar Events', description: 'Locks historical school events, tasks, and gallery media', lockDate: '2024-06-30', updatedBy: 'System' },

  // Billing (8)
  { sectionKey: 'Billing.FeeStructure', category: 'Billing', title: 'Fee Structures', description: 'Locks class-wise tuition and fee head tariffs', lockDate: '2024-07-31', updatedBy: 'System' },
  { sectionKey: 'Billing.Concessions', category: 'Billing', title: 'Fee Concessions', description: 'Locks sibling discounts and scholarship percentage matrices', lockDate: '2024-07-31', updatedBy: 'System' },
  { sectionKey: 'Billing.RegularFeeGeneration', category: 'Billing', title: 'Regular Monthly Fee', description: 'Locks mass monthly fee challan accruals', lockDate: '2026-10-31', updatedBy: 'Bursar' },
  { sectionKey: 'Billing.CustomFee', category: 'Billing', title: 'Custom Fee Challans', description: 'Locks ad-hoc and one-time fee vouchers', lockDate: '2026-10-31', updatedBy: 'System' },
  { sectionKey: 'Billing.FeeCollection', category: 'Billing', title: 'Fee Collection & Receipts', description: 'Locks cashier receipt posting and settlement reversals', lockDate: '2026-10-31', updatedBy: 'Bursar' },
  { sectionKey: 'Billing.FeeRevisions', category: 'Billing', title: 'Fee Adjustments & Revisions', description: 'Locks individual line-item fee adjustments', lockDate: '2026-10-31', updatedBy: 'System' },
  { sectionKey: 'Billing.BankReconciliation', category: 'Billing', title: 'Bank Reconciliation', description: 'Locks imported bank scroll settlement vouchers', lockDate: '2026-10-31', updatedBy: 'Bursar' },
  { sectionKey: 'Billing.FinalSettlement', category: 'Billing', title: 'Student Final Settlements', description: 'Locks security deposit refund balances for exiting students', lockDate: '2024-06-30', updatedBy: 'System' },

  // Accounting (8)
  { sectionKey: 'Accounting.ChartOfAccounts', category: 'Accounting', title: 'Chart of Accounts', description: 'Locks account code structural additions and edits', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Accounting.JournalVouchers', category: 'Accounting', title: 'Journal Vouchers (JV)', description: 'Locks posted journal adjustment vouchers', lockDate: '2026-06-30', updatedBy: 'Head Accountant' },
  { sectionKey: 'Accounting.PaymentVouchers', category: 'Accounting', title: 'Payment Vouchers (CPV/BPV)', description: 'Locks cash and bank expenditure disbursements', lockDate: '2026-10-31', updatedBy: 'Head Accountant' },
  { sectionKey: 'Accounting.ReceiptVouchers', category: 'Accounting', title: 'Receipt Vouchers (CRV/BRV)', description: 'Locks cash and bank collection vouchers', lockDate: '2026-10-31', updatedBy: 'Head Accountant' },
  { sectionKey: 'Accounting.ContraVouchers', category: 'Accounting', title: 'Contra Vouchers (CV)', description: 'Locks internal cash-to-bank and bank-to-bank transfers', lockDate: '2026-10-31', updatedBy: 'System' },
  { sectionKey: 'Accounting.ChequeBooks', category: 'Accounting', title: 'Cheque Book Management', description: 'Locks cheque leaves inventory and status transitions', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Accounting.YearClosing', category: 'Accounting', title: 'Financial Year Closings', description: 'Locks complete fiscal year audit balances', lockDate: '2024-06-30', updatedBy: 'Super Admin' },
  { sectionKey: 'Accounting.Depreciation', category: 'Accounting', title: 'Asset Depreciation', description: 'Locks monthly asset depreciation amortization vouchers', lockDate: '2026-10-31', updatedBy: 'System' },

  // Petty Cash (2)
  { sectionKey: 'PettyCash.Receipts', category: 'Petty Cash', title: 'Petty Cash Receipts', description: 'Locks petty cash imprest replenishment vouchers', lockDate: '2026-10-31', updatedBy: 'Bursar' },
  { sectionKey: 'PettyCash.Expenses', category: 'Petty Cash', title: 'Petty Cash Expenses', description: 'Locks daily petty cash expense disbursements', lockDate: '2026-10-31', updatedBy: 'Bursar' },

  // HR (5)
  { sectionKey: 'HR.Employees', category: 'HR', title: 'Employee Master', description: 'Locks employee personal profiles and salary bands', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'HR.Attendance', category: 'HR', title: 'Staff Biometric Attendance', description: 'Locks staff clock-in/clock-out machine entries', lockDate: '2026-10-31', updatedBy: 'HR Manager' },
  { sectionKey: 'HR.Leaves', category: 'HR', title: 'Staff Leaves', description: 'Locks employee leave applications and quota deductions', lockDate: '2026-10-31', updatedBy: 'HR Manager' },
  { sectionKey: 'HR.Promotions', category: 'HR', title: 'Promotions & Transfers', description: 'Locks designation changes, pay increments, and campus moves', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'HR.Resignations', category: 'HR', title: 'Resignations & Clearances', description: 'Locks employee resignations, clearances, and rejoins', lockDate: '2024-06-30', updatedBy: 'System' },

  // Payroll (3)
  { sectionKey: 'Payroll.Salaries', category: 'Payroll', title: 'Salary Allowances & Slabs', description: 'Locks salary head configurations and statutory tax rates', lockDate: '2024-06-30', updatedBy: 'System' },
  { sectionKey: 'Payroll.Loans', category: 'Payroll', title: 'Staff Loans & Recovery', description: 'Locks loan disbursement and EMI recovery schedules', lockDate: '2026-10-31', updatedBy: 'System' },
  { sectionKey: 'Payroll.Generation', category: 'Payroll', title: 'Monthly Payroll Runs', description: 'Locks monthly salary disbursement vouchers and tax withholding', lockDate: '2026-10-31', updatedBy: 'Bursar' },
];

export function DataLocksPage() {
  const { currentCampus } = useCampus();
  const { showToast } = useToast();

  const [locks, setLocks] = useState<DataLockItem[]>(INITIAL_41_DATA_LOCKS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState<DataLockItem | null>(null);
  const [editDate, setEditDate] = useState('');

  // Simulator Verification State
  const [simSection, setSimSection] = useState(INITIAL_41_DATA_LOCKS[0].sectionKey);
  const [simDate, setSimDate] = useState('2024-05-15');
  const [simResult, setSimResult] = useState<{
    tested: boolean;
    allowed: boolean;
    message: string;
    lockDate: string;
  } | null>(null);

  const categories = useMemo(() => {
    const set = new Set(locks.map((l) => l.category));
    return ['All', ...Array.from(set)];
  }, [locks]);

  const filteredLocks = useMemo(() => {
    return locks.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sectionKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [locks, selectedCategory, searchQuery]);

  const handleOpenEdit = (item: DataLockItem) => {
    setEditingItem(item);
    setEditDate(item.lockDate);
  };

  const handleSaveDate = () => {
    if (!editingItem || !editDate) return;

    setLocks((prev) =>
      prev.map((l) =>
        l.sectionKey === editingItem.sectionKey
          ? { ...l, lockDate: editDate, updatedBy: 'Admin (You)' }
          : l
      )
    );

    showToast(
      'Data Lock Cutoff Updated',
      'success',
      `Section '${editingItem.title}' is now locked for all transactions on or before ${editDate}.`
    );

    setEditingItem(null);
  };

  const handleTestSimulator = () => {
    const target = locks.find((l) => l.sectionKey === simSection);
    if (!target) return;

    const attemptedDate = new Date(simDate);
    const lockedDate = new Date(target.lockDate);

    if (attemptedDate <= lockedDate) {
      setSimResult({
        tested: true,
        allowed: false,
        lockDate: target.lockDate,
        message: `HTTP 422 DATA_LOCK_VIOLATION: Attempted transaction date (${simDate}) is on or before the frozen cutoff date (${target.lockDate}) for section '${target.title}'. Operation blocked.`,
      });
    } else {
      setSimResult({
        tested: true,
        allowed: true,
        lockDate: target.lockDate,
        message: `HTTP 200 OK: Attempted transaction date (${simDate}) is AFTER the active cutoff (${target.lockDate}) for section '${target.title}'. Operation permitted.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="41-Section Period Data Locks"
        breadcrumbs={[
          { label: 'Home', path: '/dashboards/dashboard3' },
          { label: 'Management' },
          { label: 'Data Locks' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Protected Sections</p>
            <h4 className="text-xl font-bold text-ink">41 Business Sections</h4>
            <span className="text-xs text-muted">100% Coverage Across ERP</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Active Campus</p>
            <h4 className="text-xl font-bold text-ink">{currentCampus?.name.split(' ')[0] ?? 'Lahore'}</h4>
            <span className="text-xs text-muted">Scoped via EF Core Filter</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Latest Fiscal Lock</p>
            <h4 className="text-xl font-bold text-ink">31-Oct-2026</h4>
            <span className="text-xs text-muted">Monthly Closing Freeze</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Security Guard</p>
            <h4 className="text-xl font-bold text-ink">HTTP 422 Guard</h4>
            <span className="text-xs text-muted">RFC 7807 Exception Filter</span>
          </div>
        </Card>
      </div>

      {/* Simulator Card */}
      <Card className="border border-primary/20 bg-primary/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-bold text-ink">Live Data Lock Guard Simulator</h3>
              <p className="text-xs text-muted">
                Test whether a proposed backdated transaction would be permitted or rejected with HTTP 422 by the server-side guard.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleTestSimulator}>
            Verify Transaction Date
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink">Business Section</label>
            <select
              value={simSection}
              onChange={(e) => setSimSection(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
            >
              {locks.map((l) => (
                <option key={l.sectionKey} value={l.sectionKey}>
                  [{l.category}] {l.title} (Locked: {l.lockDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink">Attempted Transaction Date</label>
            <input
              type="date"
              value={simDate}
              onChange={(e) => setSimDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-end">
            <div className="text-xs text-muted">
              Active Lock Date for Selected Section:{' '}
              <span className="font-bold text-ink">
                {locks.find((l) => l.sectionKey === simSection)?.lockDate}
              </span>
            </div>
          </div>
        </div>

        {simResult && (
          <div
            className={`mt-4 flex items-start gap-3 rounded-lg border p-3.5 text-xs ${
              simResult.allowed
                ? 'border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                : 'border-rose-500/30 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
            }`}
          >
            {simResult.allowed ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <div>
              <p className="font-semibold">{simResult.message}</p>
              <p className="mt-1 opacity-80">
                Rule: All mutations on or before {simResult.lockDate} are permanently immutable to preserve audited books.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Main Table Card */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-surface text-muted hover:bg-light-primary hover:text-primary'
                }`}
              >
                {cat} {cat === 'All' ? `(${locks.length})` : `(${locks.filter((l) => l.category === cat).length})`}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 41 sections..."
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-xs text-ink outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted">
                <th className="py-3 pl-4 pr-3 font-semibold">#</th>
                <th className="px-3 py-3 font-semibold">Section & Key</th>
                <th className="px-3 py-3 font-semibold">Module</th>
                <th className="px-3 py-3 font-semibold">Description</th>
                <th className="px-3 py-3 font-semibold">Cutoff Freeze Date</th>
                <th className="px-3 py-3 font-semibold">Enforcement Status</th>
                <th className="py-3 pl-3 pr-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredLocks.map((item, idx) => (
                <tr key={item.sectionKey} className="hover:bg-primary/[0.02]">
                  <td className="py-3 pl-4 pr-3 font-mono text-muted">{idx + 1}</td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="font-mono text-[10px] text-muted">{item.sectionKey}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded bg-light-primary px-2 py-0.5 font-medium text-primary">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted">{item.description}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5 font-mono font-medium text-ink">
                      <Calendar className="h-3.5 w-3.5 text-muted" />
                      {item.lockDate}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      label={`Frozen \u2264 ${item.lockDate}`}
                      tone="error"
                      variant="soft"
                    />
                  </td>
                  <td className="py-3 pl-3 pr-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center gap-1"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      Edit Cutoff
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Cutoff Modal */}
      {editingItem && (
        <Modal
          open={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          title={`Edit Freeze Date: ${editingItem.title}`}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveDate}>
                Save Freeze Cutoff
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-surface-ground p-3 text-xs">
              <p className="font-semibold text-ink">{editingItem.title}</p>
              <p className="font-mono text-muted">{editingItem.sectionKey}</p>
              <p className="mt-1 text-muted">{editingItem.description}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                New Cutoff Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              />
              <p className="mt-1.5 text-[11px] text-muted">
                Transactions with dates on or before this day will be strictly rejected across the web and mobile API.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
