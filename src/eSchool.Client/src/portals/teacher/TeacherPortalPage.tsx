import React, { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { useToast } from '@/context/ToastContext';

interface StudentRoster {
  id: string;
  rollNo: string;
  name: string;
  status: 'P' | 'A' | 'L';
}

export function TeacherPortalPage() {
  const { showToast } = useToast();

  const [selectedClass, setSelectedClass] = useState('Grade 8 - Section A');
  const [attendanceTime, setAttendanceTime] = useState<0 | 1 | 2>(0); // 0 = Morning, 1 = Midday, 2 = Evening
  const [activeTab, setActiveTab] = useState<'attendance' | 'homework' | 'salary'>('attendance');

  const [roster, setRoster] = useState<StudentRoster[]>([
    { id: '1', rollNo: '1084', name: 'Muhammad Hamza Ali', status: 'P' },
    { id: '2', rollNo: '1085', name: 'Fatima Zahra', status: 'P' },
    { id: '3', rollNo: '1086', name: 'Bilal Ahmed Khan', status: 'A' },
    { id: '4', rollNo: '1087', name: 'Ayesha Siddiqui', status: 'P' },
    { id: '5', rollNo: '1088', name: 'Zainab Fatima', status: 'L' }
  ]);

  // Homework Form
  const [hwModalOpen, setHwModalOpen] = useState(false);
  const [hwForm, setHwForm] = useState({
    subject: 'Physics',
    title: 'Chapter 3: Dynamics Numerical Problems (1 to 5)',
    dueDate: '2026-11-12',
    instructions: 'Solve in physics practical notebook and show diagrams.'
  });

  const handleStatusChange = (id: string, newStatus: 'P' | 'A' | 'L') => {
    setRoster(roster.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
  };

  const handleMarkAllPresent = () => {
    setRoster(roster.map((s) => ({ ...s, status: 'P' })));
    showToast('All students marked Present for active session.', 'info');
  };

  const handleSaveAttendance = () => {
    const present = roster.filter((s) => s.status === 'P').length;
    const absent = roster.filter((s) => s.status === 'A').length;
    const leave = roster.filter((s) => s.status === 'L').length;
    showToast(
      `Attendance saved for ${selectedClass} (${attendanceTime === 0 ? 'Morning' : attendanceTime === 1 ? 'Midday' : 'Evening'}): ${present} Present, ${absent} Absent, ${leave} Leave. Notifications dispatched via SMS.`,
      'success'
    );
  };

  const handlePublishHomework = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Homework published for ${selectedClass}: "${hwForm.title}". Parents notified.`, 'success');
    setHwModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="eSchool Teacher Portal & Faculty Workstation"
        breadcrumbs={[{ label: 'eSchool' }, { label: 'Portals' }, { label: 'Teacher Portal' }]}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted">Assigned Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary outline-none cursor-pointer"
            >
              <option value="Grade 8 - Section A">Grade 8 - Section A (Physics)</option>
              <option value="Grade 9 - Section B">Grade 9 - Section B (Physics & Chemistry)</option>
            </select>
          </div>
        }
      />

      {/* Teacher Profile Strip */}
      <Card className="p-5 bg-surface border border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center font-bold text-xl text-secondary border border-secondary/20">
              AS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink">Ms. Ayesha Siddiqui</h2>
                <StatusBadge label="Senior Faculty" tone="primary" variant="soft" />
              </div>
              <p className="text-xs text-muted font-mono mt-0.5">
                EMP-1002 | Senior Physics Specialist | Secondary Sciences
              </p>
              <p className="text-xs text-muted mt-0.5">Campus: Lahore Main Campus | CNIC: 35202-8874123-2</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted font-semibold">Today's Classes</p>
              <p className="text-xl font-bold text-ink">4 Periods</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-right">
              <p className="text-xs text-muted font-semibold">Leave Balance</p>
              <p className="text-xl font-bold text-success">8 / 10 Days</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Portal Tabs */}
      <Card className="bg-surface border border-border overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'attendance'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              1. Class Roll-Call Attendance
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'homework'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              2. Homework & Lesson Diary
            </button>
            <button
              onClick={() => setActiveTab('salary')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'salary'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              3. Salary Slip & Loan EMI Tracker
            </button>
          </div>
        </div>

        {/* Tab 1: Roll-Call */}
        {activeTab === 'attendance' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Attendance Slot:</span>
                {[
                  { slot: 0 as const, label: '0: Morning' },
                  { slot: 1 as const, label: '1: Midday' },
                  { slot: 2 as const, label: '2: Evening' }
                ].map((s) => (
                  <button
                    key={s.slot}
                    onClick={() => setAttendanceTime(s.slot)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      attendanceTime === s.slot
                        ? 'bg-primary text-white border-primary'
                        : 'bg-app border-border text-muted hover:text-ink'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button tone="secondary" size="sm" onClick={handleMarkAllPresent}>
                  Mark All Present
                </Button>
                <Button tone="primary" size="sm" onClick={handleSaveAttendance}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Save & Notify Parents
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-app text-muted border-b border-border text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3 text-center">Status (Click to Toggle)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {roster.map((s) => (
                    <tr key={s.id} className="hover:bg-subtle/50">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{s.rollNo}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{s.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {(['P', 'A', 'L'] as const).map((code) => (
                            <button
                              key={code}
                              onClick={() => handleStatusChange(s.id, code)}
                              className={`w-8 h-8 rounded-lg font-bold text-xs border transition-all ${
                                s.status === code
                                  ? code === 'P'
                                    ? 'bg-success text-white border-success'
                                    : code === 'A'
                                    ? 'bg-error text-white border-error'
                                    : 'bg-warning text-white border-warning'
                                  : 'bg-app border-border text-muted hover:border-ink/30'
                              }`}
                            >
                              {code}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Homework */}
        {activeTab === 'homework' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">Published Homework & Assignments</h3>
                <p className="text-xs text-muted">Assignments appear on Parent & Student mobile portals instantly.</p>
              </div>
              <Button tone="primary" size="md" onClick={() => setHwModalOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Assign New Homework
              </Button>
            </div>

            <div className="border border-border rounded-xl p-4 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary">Physics - Grade 8A</span>
                <span className="text-xs text-muted">Due: Tomorrow 8:00 AM</span>
              </div>
              <h4 className="font-bold text-ink text-sm">Chapter 3: Dynamics Numerical Problems (1 to 5)</h4>
              <p className="text-xs text-muted">Solve in physics practical notebook and show diagrams.</p>
            </div>
          </div>
        )}

        {/* Tab 3: Salary */}
        {activeTab === 'salary' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">Monthly Salary & Statutory Deductions</h3>
                <p className="text-xs text-muted">Compliant with FBR Section 149 Income Tax & EOBI statutory limits</p>
              </div>
              <Button
                tone="secondary"
                size="sm"
                onClick={() => showToast('Downloading vector pay slip PDF...', 'success')}
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Download Pay Slip
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h4 className="font-bold text-ink text-sm border-b border-border pb-2">Monthly Gross Earnings</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Basic Salary:</span>
                    <span className="font-mono font-semibold text-ink">PKR 65,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">House Rent Allowance (45%):</span>
                    <span className="font-mono font-semibold text-ink">PKR 29,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Medical Allowance:</span>
                    <span className="font-mono font-semibold text-ink">PKR 6,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Conveyance Allowance:</span>
                    <span className="font-mono font-semibold text-ink">PKR 8,000</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-bold text-sm">
                    <span className="text-ink">Total Gross Salary:</span>
                    <span className="font-mono text-primary">PKR 108,750</span>
                  </div>
                </div>
              </div>

              {/* Deductions including Loan EMI */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h4 className="font-bold text-ink text-sm border-b border-border pb-2">Statutory & Loan Deductions</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">FBR Section 149 Income Tax:</span>
                    <span className="font-mono font-semibold text-error">PKR 5,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">EOBI Employee Contribution:</span>
                    <span className="font-mono font-semibold text-error">PKR 450</span>
                  </div>
                  <div className="flex justify-between bg-light-warning/50 p-1.5 rounded border border-warning/20">
                    <div>
                      <span className="font-bold text-warning block">Loan Recovery (LN-2026-0001):</span>
                      <span className="text-[10px] text-muted">EMI #2 of 3 (Remainder-First Base EMI)</span>
                    </div>
                    <span className="font-mono font-bold text-error">PKR 33,333</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-bold text-sm">
                    <span className="text-ink">Net Take-Home Pay:</span>
                    <span className="font-mono text-success text-base">PKR 69,767</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Homework Modal */}
      <Modal open={hwModalOpen} onClose={() => setHwModalOpen(false)} title={`Publish Homework for ${selectedClass}`}>
        <form onSubmit={handlePublishHomework} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Subject</label>
            <input
              type="text"
              required
              value={hwForm.subject}
              onChange={(e) => setHwForm({ ...hwForm, subject: e.target.value })}
              className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Homework Title & Topic *</label>
            <input
              type="text"
              required
              value={hwForm.title}
              onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
              className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Submission Due Date</label>
            <input
              type="date"
              required
              value={hwForm.dueDate}
              onChange={(e) => setHwForm({ ...hwForm, dueDate: e.target.value })}
              className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Instructions / Description</label>
            <textarea
              rows={3}
              value={hwForm.instructions}
              onChange={(e) => setHwForm({ ...hwForm, instructions: e.target.value })}
              className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button tone="secondary" onClick={() => setHwModalOpen(false)}>
              Cancel
            </Button>
            <Button tone="primary" type="submit">
              Publish & Broadcast
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
