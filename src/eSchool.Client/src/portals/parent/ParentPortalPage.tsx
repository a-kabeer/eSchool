import { useState } from 'react';
import {
  CreditCard,
  Printer
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { useToast } from '@/context/ToastContext';

interface ChildProfile {
  id: string;
  name: string;
  regNo: string;
  grade: string;
  section: string;
  campus: string;
  rollNo: string;
  attendancePct: number;
  unpaidFees: number;
}

export function ParentPortalPage() {
  const { showToast } = useToast();

  const children: ChildProfile[] = [
    {
      id: 'c1',
      name: 'Muhammad Hamza Ali',
      regNo: 'REG-2024-1084',
      grade: 'Grade 8',
      section: 'Section A',
      campus: 'Lahore Main Campus',
      rollNo: '1084',
      attendancePct: 96.6,
      unpaidFees: 13500
    },
    {
      id: 'c2',
      name: 'Hassan Tariq Ali',
      regNo: 'REG-2026-0014',
      grade: 'Grade 6',
      section: 'Section B',
      campus: 'Lahore Main Campus',
      rollNo: '0614',
      attendancePct: 98.2,
      unpaidFees: 0
    }
  ];

  const [selectedChild, setSelectedChild] = useState<ChildProfile>(children[0]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'fees' | 'academics' | 'homework'>('attendance');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  const handlePayOnline = () => {
    showToast('Redirecting to 1Link / Meezan Bank 3DS Payment Gateway...', 'info');
    setTimeout(() => {
      showToast('Fee paid successfully! Receipt BNK-202611-998811 generated.', 'success');
      setPayModalOpen(false);
      setSelectedChild({ ...selectedChild, unpaidFees: 0 });
    }, 1500);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Leave application submitted for ${selectedChild.name}. Notification sent to Class Teacher.`, 'success');
    setLeaveModalOpen(false);
    setLeaveReason('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="eSchool Parent Portal & Multi-Child Hub"
        breadcrumbs={[{ label: 'eSchool' }, { label: 'Portals' }, { label: 'Parent Portal' }]}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted">Active Student:</span>
            <div className="relative">
              <select
                value={selectedChild.id}
                onChange={(e) => {
                  const found = children.find((c) => c.id === e.target.value);
                  if (found) setSelectedChild(found);
                }}
                className="rounded-lg border border-primary bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary outline-none cursor-pointer"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade} - {c.section})
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      {/* Hero Child Identity Strip */}
      <Card className="p-5 bg-surface border border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-xl text-primary border border-primary/20">
              {selectedChild.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink">{selectedChild.name}</h2>
                <StatusBadge label="Enrolled" tone="success" variant="soft" />
              </div>
              <p className="text-xs text-muted font-mono mt-0.5">
                {selectedChild.regNo} | Roll #{selectedChild.rollNo} | {selectedChild.grade} ({selectedChild.section})
              </p>
              <p className="text-xs text-muted mt-0.5">{selectedChild.campus}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted font-semibold">Attendance Rate</p>
              <p className="text-xl font-bold text-success">{selectedChild.attendancePct}%</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-right">
              <p className="text-xs text-muted font-semibold">Fee Outstanding</p>
              <p className={`text-xl font-bold font-mono ${selectedChild.unpaidFees > 0 ? 'text-error' : 'text-success'}`}>
                PKR {selectedChild.unpaidFees.toLocaleString()}
              </p>
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
              1. Attendance & Leaves
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'fees'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              2. Challans & Online Payment
            </button>
            <button
              onClick={() => setActiveTab('academics')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'academics'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              3. Examination Report Card
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'homework'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              4. Daily Homework & Diary
            </button>
          </div>
        </div>

        {/* Tab 1: Attendance */}
        {activeTab === 'attendance' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">November 2026 Attendance Summary</h3>
                <p className="text-xs text-muted">22 Working Days | 21 Present | 1 Approved Leave</p>
              </div>
              <Button tone="secondary" size="sm" onClick={() => setLeaveModalOpen(true)}>
                Apply for Student Leave
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="font-semibold text-muted uppercase text-[11px] py-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
                const isWeekend = day % 7 === 6 || day % 7 === 0;
                const isLeave = day === 12;
                return (
                  <div
                    key={day}
                    className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 ${
                      isWeekend
                        ? 'bg-subtle/30 border-transparent text-muted'
                        : isLeave
                        ? 'bg-light-warning border-warning text-warning font-bold'
                        : 'bg-card border-border text-ink'
                    }`}
                  >
                    <span className="font-semibold">{day}</span>
                    {!isWeekend && (
                      <span className={`text-[10px] font-bold ${isLeave ? 'text-warning' : 'text-success'}`}>
                        {isLeave ? 'L' : 'P'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Fees */}
        {activeTab === 'fees' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">Fee Challan Statements</h3>
                <p className="text-xs text-muted">Payable via 1Link, ATM, Mobile Banking, or Campus Counter</p>
              </div>
              {selectedChild.unpaidFees > 0 && (
                <Button tone="primary" size="md" onClick={() => setPayModalOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay PKR {selectedChild.unpaidFees.toLocaleString()} Online
                </Button>
              )}
            </div>

            <div className="border border-border rounded-xl p-5 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">INV-202611-1084</span>
                  <h4 className="font-bold text-ink text-sm mt-0.5">November 2026 Monthly Tuition Challan</h4>
                  <p className="text-xs text-muted">Due Date: 20-Nov-2026</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-ink text-base">
                    PKR {selectedChild.unpaidFees.toLocaleString()}
                  </div>
                  <StatusBadge
                    label={selectedChild.unpaidFees > 0 ? 'Unpaid' : 'Paid'}
                    tone={selectedChild.unpaidFees > 0 ? 'error' : 'success'}
                    variant="soft"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-mono text-xs text-muted">Barcode: 202411084</span>
                <Button
                  tone="secondary"
                  size="sm"
                  onClick={() => showToast('Downloading 3-Part Bank Challan PDF...', 'success')}
                >
                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                  Download 3-Part Challan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Academics */}
        {activeTab === 'academics' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">Mid-Term Academic Progress</h3>
                <p className="text-xs text-muted">Overall Percentage: 87.8% | Grade: A+ | Class Position: 3rd</p>
              </div>
              <Button
                tone="secondary"
                size="sm"
                onClick={() => showToast('Generating high-resolution report card PDF...', 'success')}
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print Official Report Card
              </Button>
            </div>

            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-app text-muted border-b border-border text-[11px] uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Total Marks</th>
                  <th className="px-4 py-3">Obtained Marks</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { subject: 'English Literature', total: 100, obtained: 88, grade: 'A+', remarks: 'Excellent creative writing skills' },
                  { subject: 'Mathematics', total: 100, obtained: 94, grade: 'A+', remarks: 'Outstanding problem solving in algebra' },
                  { subject: 'Physics (Theory + Practical)', total: 100, obtained: 85, grade: 'A', remarks: 'Good grasp of lab experiments' },
                  { subject: 'Chemistry', total: 100, obtained: 82, grade: 'A', remarks: 'Active classroom participation' },
                  { subject: 'Pakistan Studies', total: 50, obtained: 46, grade: 'A+', remarks: 'Very thorough historical knowledge' }
                ].map((row) => (
                  <tr key={row.subject} className="hover:bg-subtle/50">
                    <td className="px-4 py-3 font-semibold text-ink">{row.subject}</td>
                    <td className="px-4 py-3">{row.total}</td>
                    <td className="px-4 py-3 font-mono font-bold text-primary">{row.obtained}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-success">{row.grade}</span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{row.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Homework */}
        {activeTab === 'homework' && (
          <div className="p-6 space-y-3">
            <h3 className="font-bold text-ink text-sm sm:text-base">Today's Assigned Homework & Diary</h3>
            <div className="space-y-3">
              {[
                {
                  subject: 'Mathematics',
                  title: 'Exercise 4.2 - Algebraic Factorization Questions 1 to 10',
                  dueDate: 'Tomorrow 8:00 AM',
                  teacher: 'Mr. Asif Raza'
                },
                {
                  subject: 'English Literature',
                  title: 'Write a 200-word essay on "Renewable Energy in Pakistan"',
                  dueDate: 'Thursday 8:00 AM',
                  teacher: 'Ms. Sarah Khan'
                }
              ].map((hw) => (
                <div key={hw.title} className="p-4 rounded-xl border border-border bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{hw.subject}</span>
                    <span className="text-xs text-muted">Due: {hw.dueDate}</span>
                  </div>
                  <h4 className="font-semibold text-ink text-sm">{hw.title}</h4>
                  <p className="text-xs text-muted">Teacher: {hw.teacher}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Online Pay Modal */}
      <Modal open={payModalOpen} onClose={() => setPayModalOpen(false)} title="1Link / Debit Card Online Payment">
        <div className="space-y-4">
          <div className="p-4 bg-app rounded-xl border border-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Student:</span>
              <span className="font-semibold text-ink">{selectedChild.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Consumer Number:</span>
              <span className="font-mono font-semibold text-ink">202411084</span>
            </div>
            <div className="flex justify-between text-xs border-t border-border pt-2">
              <span className="font-bold text-ink">Amount Payable:</span>
              <span className="font-mono font-bold text-success text-base">
                PKR {selectedChild.unpaidFees.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button tone="secondary" onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
            <Button tone="primary" onClick={handlePayOnline}>
              Confirm 1Link Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Leave Application Modal */}
      <Modal open={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} title="Submit Student Leave Application">
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Student</label>
            <input
              type="text"
              readOnly
              value={`${selectedChild.name} (${selectedChild.grade})`}
              className="w-full rounded-lg border border-border bg-subtle px-3.5 py-2 text-sm text-ink outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Leave Date</label>
              <input
                type="date"
                defaultValue="2026-11-12"
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Leave Type</label>
              <select className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary">
                <option>Medical / Sickness</option>
                <option>Family Emergency</option>
                <option>Out of Station</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Reason for Leave *</label>
            <textarea
              required
              rows={3}
              placeholder="Please provide details of leave..."
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button tone="secondary" onClick={() => setLeaveModalOpen(false)}>
              Cancel
            </Button>
            <Button tone="primary" type="submit">
              Submit Leave Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
