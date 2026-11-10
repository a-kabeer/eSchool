import { useState } from 'react';
import {
  Award,
  Calendar,
  CreditCard,
  FileText,
  HeartHandshake,
  History,
  MessageSquare,
  Receipt,
  User,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Button, StatusBadge } from '@/components/ui';

export function Student360Page() {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'siblings' | 'guardians' | 'attendance' | 'leaves' | 'billing' | 'comments' | 'history'
  >('profile');

  // Seeded Student 360 state
  const student = {
    id: 's-1084',
    regNo: 'REG-2024-1084',
    rollNo: '1084',
    name: 'Muhammad Hamza Ali',
    grade: 'Grade 8',
    section: 'Section A',
    campus: 'Lahore Main Campus',
    dob: '2012-05-14',
    gender: 'Male',
    bForm: '35201-8819201-1',
    bloodGroup: 'B+',
    religion: 'Islam',
    nationality: 'Pakistani',
    admissionDate: '2024-08-01',
    status: 'Active',
    attendancePct: 96.6,
    totalBilled: 40500,
    totalPaid: 27000,
    outstanding: 13500,
  };

  const guardians = [
    {
      relationship: 'Father',
      name: 'Tariq Mehmood Ali',
      cnic: '35201-1456789-1',
      mobile: '+92-300-8451290',
      email: 'tariq.mehmood@example.com',
      occupation: 'Senior Software Architect',
      company: 'Systems Limited Pakistan',
      address: 'House 42-B, Block G, Model Town, Lahore',
      isPrimary: true,
    },
    {
      relationship: 'Mother',
      name: 'Dr. Farzana Tariq',
      cnic: '35201-9928172-2',
      mobile: '+92-321-4567890',
      email: 'dr.farzana@example.com',
      occupation: 'Assistant Professor of Medicine',
      company: 'Shaikh Zayed Hospital Lahore',
      address: 'House 42-B, Block G, Model Town, Lahore',
      isPrimary: false,
    },
  ];

  const siblings = [
    {
      name: 'Amina Tariq Ali',
      regNo: 'REG-2024-1085',
      grade: 'Grade 5',
      section: 'Section B',
      status: 'Active',
    },
  ];

  const invoices = [
    {
      challanNo: 'CHAL-202411084',
      month: 'November 2026',
      dueDate: '2026-11-10',
      netPayable: 13500,
      paid: 0,
      status: 'UNPAID',
    },
    {
      challanNo: 'CHAL-202410084',
      month: 'October 2026',
      dueDate: '2026-10-10',
      netPayable: 13500,
      paid: 13500,
      status: 'PAID',
    },
    {
      challanNo: 'CHAL-202409084',
      month: 'September 2026',
      dueDate: '2026-09-10',
      netPayable: 13500,
      paid: 13500,
      status: 'PAID',
    },
  ];

  const comments = [
    {
      nature: 2,
      natureLabel: 'Excellent (+2)',
      title: 'Outstanding Mathematics Science Project',
      desc: 'Demonstrated exemplary algorithmic problem-solving skills in the inter-school science exhibition.',
      author: 'Mathematics Teacher',
      date: '2026-10-24',
    },
    {
      nature: 1,
      natureLabel: 'Good (+1)',
      title: 'Active Class Participation',
      desc: 'Actively engaged during Cambridge English comprehension exercises and grammar workshops.',
      author: 'English Teacher',
      date: '2026-10-12',
    },
    {
      nature: -1,
      natureLabel: 'Warning (-1)',
      title: 'Late Arrival to Morning Assembly',
      desc: 'Arrived 10 minutes past morning assembly gate cutoff due to traffic congestion on Ferozepur Road.',
      author: 'Discipline In-Charge',
      date: '2026-09-18',
    },
  ];

  const tabs = [
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'guardians', label: 'Guardians & Parents', icon: Users },
    { id: 'siblings', label: 'Siblings Link', icon: HeartHandshake },
    { id: 'attendance', label: 'Attendance (96.6%)', icon: Calendar },
    { id: 'billing', label: 'Fee Challans & POS', icon: Receipt },
    { id: 'comments', label: 'Behavioral Comments', icon: MessageSquare },
    { id: 'history', label: 'Enrollment History', icon: History },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student 360° Comprehensive Profile"
        breadcrumbs={[
          { label: 'Home', path: '/dashboards/dashboard3' },
          { label: 'Students', path: '/sis/students' },
          { label: 'Student 360' },
        ]}
      />

      {/* Hero Card */}
      <Card className="border border-border/80 bg-gradient-to-r from-primary/[0.03] to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-md">
              MH
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-ink">{student.name}</h2>
                <StatusBadge label={student.status} tone="success" variant="solid" />
                <span className="rounded-md bg-light-primary px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
                  {student.regNo}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {student.grade} • {student.section} • Roll No: {student.rollNo} • {student.campus}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted">
                <span>B-Form: <strong className="text-ink">{student.bForm}</strong></span>
                <span>•</span>
                <span>Father: <strong className="text-ink">{guardians[0].name}</strong></span>
                <span>•</span>
                <span>Contact: <strong className="text-ink">{guardians[0].mobile}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Student SLC
            </Button>
            <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              Print Challan
            </Button>
            <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Add Comment
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-muted hover:bg-light-primary hover:text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-sm font-bold text-ink">Personal & Demographic Details</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted">Full Name</p>
                <p className="mt-0.5 font-semibold text-ink">{student.name}</p>
              </div>
              <div>
                <p className="text-muted">Date of Birth</p>
                <p className="mt-0.5 font-semibold text-ink">{student.dob} (Age 14)</p>
              </div>
              <div>
                <p className="text-muted">Gender</p>
                <p className="mt-0.5 font-semibold text-ink">{student.gender}</p>
              </div>
              <div>
                <p className="text-muted">Blood Group</p>
                <p className="mt-0.5 font-semibold text-ink">{student.bloodGroup}</p>
              </div>
              <div>
                <p className="text-muted">Pakistani B-Form #</p>
                <p className="mt-0.5 font-mono font-semibold text-ink">{student.bForm}</p>
              </div>
              <div>
                <p className="text-muted">Religion & Nationality</p>
                <p className="mt-0.5 font-semibold text-ink">{student.religion} • {student.nationality}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-bold text-ink">Institutional Enrollment</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted">Registration Number</p>
                <p className="mt-0.5 font-mono font-semibold text-ink">{student.regNo}</p>
              </div>
              <div>
                <p className="text-muted">Roll Number</p>
                <p className="mt-0.5 font-mono font-semibold text-ink">{student.rollNo}</p>
              </div>
              <div>
                <p className="text-muted">Academic Class & Section</p>
                <p className="mt-0.5 font-semibold text-ink">{student.grade} - {student.section}</p>
              </div>
              <div>
                <p className="text-muted">Admission Date</p>
                <p className="mt-0.5 font-semibold text-ink">{student.admissionDate}</p>
              </div>
              <div>
                <p className="text-muted">Campus / Branch</p>
                <p className="mt-0.5 font-semibold text-ink">{student.campus}</p>
              </div>
              <div>
                <p className="text-muted">Enrollment Status</p>
                <p className="mt-0.5 font-semibold text-emerald-600">Active & Enrolled</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Guardians */}
      {activeTab === 'guardians' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {guardians.map((g) => (
            <Card key={g.relationship} className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-light-primary font-bold text-primary">
                    {g.relationship[0]}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{g.name}</h4>
                    <span className="text-xs text-muted">{g.relationship}</span>
                  </div>
                </div>
                {g.isPrimary && <StatusBadge label="Primary SMS Contact" tone="primary" variant="solid" />}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted">CNIC #</p>
                  <p className="font-mono font-semibold text-ink">{g.cnic}</p>
                </div>
                <div>
                  <p className="text-muted">WhatsApp / Mobile</p>
                  <p className="font-mono font-semibold text-ink">{g.mobile}</p>
                </div>
                <div>
                  <p className="text-muted">Occupation</p>
                  <p className="font-semibold text-ink">{g.occupation}</p>
                </div>
                <div>
                  <p className="text-muted">Organization</p>
                  <p className="font-semibold text-ink">{g.company}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted">Residential Address</p>
                  <p className="font-semibold text-ink">{g.address}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 3: Siblings */}
      {activeTab === 'siblings' && (
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-ink">Family Sibling Registry</h3>
            <p className="text-xs text-muted">
              Students sharing the same Guardian CNIC profile across eSchool campuses. Eligible for sibling fee concession.
            </p>
          </div>

          <div className="divide-y divide-border/40">
            {siblings.map((sib) => (
              <div key={sib.regNo} className="flex items-center justify-between py-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-light-primary font-bold text-primary">
                    AT
                  </div>
                  <div>
                    <p className="font-bold text-ink">{sib.name}</p>
                    <p className="text-muted">{sib.grade} • {sib.section} • {sib.regNo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Sibling Concession (20%)" tone="success" variant="soft" />
                  <Button variant="outline" size="sm">
                    View 360
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 4: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="text-center">
              <p className="text-xs text-muted">Attendance Rate</p>
              <h4 className="mt-1 text-2xl font-bold text-primary">96.6%</h4>
              <span className="text-[11px] text-muted">114 of 118 Sessions</span>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-muted">Present Days</p>
              <h4 className="mt-1 text-2xl font-bold text-emerald-600">114</h4>
              <span className="text-[11px] text-muted">On-Time Roll Call</span>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-muted">Late Arrivals</p>
              <h4 className="mt-1 text-2xl font-bold text-amber-600">1</h4>
              <span className="text-[11px] text-muted">10-Min Margin</span>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-muted">Absences / Leaves</p>
              <h4 className="mt-1 text-2xl font-bold text-rose-600">3</h4>
              <span className="text-[11px] text-muted">1 Excused Medical</span>
            </Card>
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-bold text-ink">Recent Daily Attendance Logs</h3>
            <div className="divide-y divide-border/40 text-xs">
              {[
                { date: '10-Nov-2026', timeIn: '07:52 AM', status: 'Present', tone: 'success' as const },
                { date: '09-Nov-2026', timeIn: '07:48 AM', status: 'Present', tone: 'success' as const },
                { date: '08-Nov-2026', timeIn: '07:55 AM', status: 'Present', tone: 'success' as const },
                { date: '07-Nov-2026', timeIn: '08:08 AM', status: 'Late', tone: 'warning' as const },
                { date: '06-Nov-2026', timeIn: '07:50 AM', status: 'Present', tone: 'success' as const },
              ].map((row) => (
                <div key={row.date} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted" />
                    <span className="font-medium text-ink">{row.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-muted">{row.timeIn}</span>
                    <StatusBadge label={row.status} tone={row.tone} variant="soft" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Billing */}
      {activeTab === 'billing' && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-ink">Fee Ledger & Challans</h3>
              <p className="text-xs text-muted">
                Total Billed: PKR {student.totalBilled.toLocaleString()} • Paid: PKR {student.totalPaid.toLocaleString()} • Outstanding: PKR {student.outstanding.toLocaleString()}
              </p>
            </div>
            <Button variant="primary" size="sm">
              Generate Challan
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted">
                  <th className="py-2.5 pl-4 pr-3 font-semibold">Challan #</th>
                  <th className="px-3 py-2.5 font-semibold">Billing Cycle</th>
                  <th className="px-3 py-2.5 font-semibold">Due Date</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Net Payable</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Paid Amount</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 pl-3 pr-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {invoices.map((inv) => (
                  <tr key={inv.challanNo}>
                    <td className="py-2.5 pl-4 pr-3 font-mono font-bold text-primary">{inv.challanNo}</td>
                    <td className="px-3 py-2.5 font-medium text-ink">{inv.month}</td>
                    <td className="px-3 py-2.5 font-mono text-muted">{inv.dueDate}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-ink">
                      PKR {inv.netPayable.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-emerald-600">
                      PKR {inv.paid.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        label={inv.status}
                        tone={inv.status === 'PAID' ? 'success' : 'error'}
                        variant="solid"
                      />
                    </td>
                    <td className="py-2.5 pl-3 pr-4 text-right">
                      <Button variant="outline" size="sm">
                        Print Copy
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 6: Comments */}
      {activeTab === 'comments' && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-ink">Discipline & Merits History</h3>
              <p className="text-xs text-muted">
                Official behavior observations using the Pakistani 5-point Nature scale (-2 Worst to +2 Excellent).
              </p>
            </div>
            <Button variant="primary" size="sm">
              Add Observation
            </Button>
          </div>

          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.title}
                className={`rounded-lg border p-3.5 text-xs ${
                  c.nature > 0
                    ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                    : c.nature === 0
                    ? 'border-border bg-surface'
                    : 'border-rose-500/20 bg-rose-500/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award
                      className={`h-4 w-4 ${
                        c.nature > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    />
                    <h4 className="font-bold text-ink">{c.title}</h4>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        c.nature > 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {c.natureLabel}
                    </span>
                  </div>
                  <span className="font-mono text-muted">{c.date}</span>
                </div>
                <p className="mt-2 text-muted">{c.desc}</p>
                <p className="mt-2 text-[11px] font-medium text-ink">Author: {c.author}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 7: History */}
      {activeTab === 'history' && (
        <Card>
          <h3 className="mb-3 text-sm font-bold text-ink">Academic & Institutional Audit Trail</h3>
          <div className="relative pl-6 before:absolute before:bottom-0 before:left-2.5 before:top-2 before:w-0.5 before:bg-border">
            {[
              { date: '01-Aug-2026', event: 'Promoted to Grade 8 - Section A', user: 'Admin' },
              { date: '20-May-2026', event: 'Completed Grade 7 Final Examination (A+ Distinction 91.2%)', user: 'Exam Coordinator' },
              { date: '01-Aug-2024', event: 'Initial Admission Enrolled in Grade 7 - Section B', user: 'Admissions Officer' },
              { date: '24-Jul-2024', event: 'Registration Receipt #REG-2024-1084 Approved', user: 'Bursar' },
            ].map((item) => (
              <div key={item.date} className="relative mb-6 last:mb-0">
                <span className="absolute -left-6 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-light-primary" />
                <p className="text-xs font-mono text-muted">{item.date}</p>
                <p className="text-xs font-semibold text-ink">{item.event}</p>
                <span className="text-[11px] text-muted">Action by: {item.user}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
