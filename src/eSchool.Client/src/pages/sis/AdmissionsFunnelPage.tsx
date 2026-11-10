import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Sparkles,
  Phone,
  CreditCard
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { useCampus } from '@/context/CampusContext';
import { useToast } from '@/context/ToastContext';

interface Inquiry {
  id: string;
  inquiryNumber: string;
  candidateName: string;
  fatherName: string;
  fatherMobile: string;
  targetGrade: string;
  inquiryDate: string;
  source: string;
  status: 'Open' | 'FollowUp' | 'Converted' | 'Dropped';
  remarks?: string;
}

interface Registration {
  id: string;
  registrationNumber: string;
  inquiryId?: string;
  candidateName: string;
  dateOfBirth: string;
  gender: string;
  bFormNo: string;
  fatherName: string;
  fatherCnic: string;
  fatherMobile: string;
  targetGrade: string;
  registrationFee: number;
  isFeePaid: boolean;
  status: 'New' | 'Processing' | 'Approved' | 'Rejected';
  registrationDate: string;
  approvedJoiningDate?: string;
}

const API_V1 = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5050/api/v1'
  : '/api/v1';

export function AdmissionsFunnelPage() {
  const { currentCampus } = useCampus();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'inquiries' | 'registrations'>('inquiries');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [newInquiryOpen, setNewInquiryOpen] = useState(false);
  const [newRegistrationOpen, setNewRegistrationOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  // New Inquiry form
  const [inqForm, setInqForm] = useState({
    candidateName: '',
    fatherName: '',
    fatherMobile: '',
    targetGrade: 'Grade 8',
    source: 'Walk-in',
    remarks: ''
  });

  // New Registration form
  const [regForm, setRegForm] = useState({
    candidateName: '',
    fatherName: '',
    fatherCnic: '',
    fatherMobile: '',
    bFormNo: '',
    dateOfBirth: '2012-05-14',
    gender: 'Male',
    targetGrade: 'Grade 8',
    registrationFee: 2500
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [inqRes, regRes] = await Promise.all([
        fetch(`${API_V1}/admissions/inquiries`),
        fetch(`${API_V1}/admissions/registrations`)
      ]);

      if (inqRes.ok) {
        const data = await inqRes.json();
        setInquiries(data.items || []);
      }
      if (regRes.ok) {
        const data = await regRes.json();
        setRegistrations(data.items || []);
      }
    } catch {
      showToast('Error loading admissions data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCampus]);

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inqForm.candidateName || !inqForm.fatherName || !inqForm.fatherMobile) {
      showToast('Please fill all required inquiry fields', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_V1}/admissions/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inqForm)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.title || err.detail || 'Failed to save inquiry');
      }

      showToast(`Inquiry logged successfully for ${inqForm.candidateName}`, 'success');
      setNewInquiryOpen(false);
      setInqForm({
        candidateName: '',
        fatherName: '',
        fatherMobile: '',
        targetGrade: 'Grade 8',
        source: 'Walk-in',
        remarks: ''
      });
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error creating inquiry', 'error');
    }
  };

  const handleConvertInquiry = async (inq: Inquiry) => {
    try {
      const res = await fetch(`${API_V1}/admissions/inquiries/${inq.id}/convert`, {
        method: 'POST'
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.title || err.detail || 'Conversion failed');
      }

      showToast(`Inquiry ${inq.inquiryNumber} converted to candidate registration!`, 'success');
      setActiveTab('registrations');
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error converting inquiry', 'error');
    }
  };

  const handleCreateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.candidateName || !regForm.fatherName || !regForm.bFormNo) {
      showToast('Please complete candidate B-Form and Father details', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_V1}/admissions/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regForm,
          isFeePaid: true
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.title || err.detail || 'Registration failed');
      }

      showToast(`Candidate registered: ${regForm.candidateName}`, 'success');
      setNewRegistrationOpen(false);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error creating registration', 'error');
    }
  };

  const handleApproveEnrollment = async (reg: Registration) => {
    try {
      const res = await fetch(`${API_V1}/admissions/registrations/${reg.id}/approve`, {
        method: 'POST'
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.title || err.detail || 'Approval failed');
      }

      const result = await res.json();
      showToast(result.message || 'Candidate enrolled successfully as active student!', 'success');
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Enrollment approval failed', 'error');
    }
  };

  const openReceipt = (reg: Registration) => {
    setSelectedRegistration(reg);
    setReceiptModalOpen(true);
  };

  // KPIs
  const totalInquiries = inquiries.length;
  const convertedInquiries = inquiries.filter((i) => i.status === 'Converted').length;
  const pendingRegistrations = registrations.filter((r) => r.status === 'New').length;
  const approvedEnrollments = registrations.filter((r) => r.status === 'Approved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions Funnel & Candidate Processing"
        breadcrumbs={[{ label: 'eSchool' }, { label: 'SIS' }, { label: 'Admissions Funnel' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              tone="secondary"
              variant="outline"
              size="md"
              onClick={() => setNewInquiryOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Log Inquiry
            </Button>
            <Button
              tone="primary"
              size="md"
              onClick={() => setNewRegistrationOpen(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              New Registration
            </Button>
          </div>
        }
      />

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Total Inquiries</p>
              <p className="text-2xl font-bold text-ink mt-1">{totalInquiries}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-primary text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">
            <span className="font-semibold text-success">{convertedInquiries} converted</span> to registrations
          </p>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Pending Test/Interview</p>
              <p className="text-2xl font-bold text-warning mt-1">{pendingRegistrations}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-warning text-warning">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Awaiting admission evaluation</p>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Approved & Enrolled</p>
              <p className="text-2xl font-bold text-success mt-1">{approvedEnrollments}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-success text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Active in Student SIS Directory</p>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Reg. Fee Collected</p>
              <p className="text-2xl font-bold text-primary mt-1">
                PKR {(registrations.length * 2500).toLocaleString()}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-primary text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Counter collection receipts</p>
        </Card>
      </div>

      {/* Funnel Tabs */}
      <Card className="bg-surface border border-border overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'inquiries'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              1. Inquiries Pipeline ({inquiries.length})
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'registrations'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              2. Candidate Registrations & Approvals ({registrations.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-app text-muted border-b border-border text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Inquiry No</th>
                  <th className="px-5 py-3.5">Candidate Name</th>
                  <th className="px-5 py-3.5">Father & Mobile</th>
                  <th className="px-5 py-3.5">Target Grade</th>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted">
                      Loading inquiries...
                    </td>
                  </tr>
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted">
                      No inquiries recorded yet.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-primary">
                        {inq.inquiryNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">{inq.candidateName}</div>
                        {inq.remarks && (
                          <div className="text-[11px] text-muted italic mt-0.5">{inq.remarks}</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-ink">{inq.fatherName}</div>
                        <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {inq.fatherMobile}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-ink">{inq.targetGrade}</td>
                      <td className="px-5 py-4">
                        <span className="inline-block rounded-md bg-subtle px-2 py-0.5 text-xs text-muted">
                          {inq.source}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          label={inq.status}
                          tone={
                            inq.status === 'Converted'
                              ? 'success'
                              : inq.status === 'FollowUp'
                              ? 'warning'
                              : inq.status === 'Open'
                              ? 'primary'
                              : 'error'
                          }
                          variant="soft"
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {inq.status !== 'Converted' ? (
                          <Button
                            tone="primary"
                            size="sm"
                            onClick={() => handleConvertInquiry(inq)}
                          >
                            Convert to Reg
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-success flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Converted
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Registrations */}
        {activeTab === 'registrations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-app text-muted border-b border-border text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Registration No</th>
                  <th className="px-5 py-3.5">Candidate Details</th>
                  <th className="px-5 py-3.5">Father CNIC & Phone</th>
                  <th className="px-5 py-3.5">Target Grade</th>
                  <th className="px-5 py-3.5">Fee Paid</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted">
                      Loading candidate registrations...
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted">
                      No registrations logged yet.
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-primary">
                        {reg.registrationNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">{reg.candidateName}</div>
                        <div className="text-[11px] text-muted font-mono mt-0.5">
                          B-Form: {reg.bFormNo} ({reg.gender})
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-ink">{reg.fatherName}</div>
                        <div className="text-[11px] text-muted font-mono mt-0.5">
                          {reg.fatherCnic} | {reg.fatherMobile}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-ink">{reg.targetGrade}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">PKR {reg.registrationFee.toLocaleString()}</div>
                        <span className="text-[10px] text-success font-medium">Paid (Cash/Online)</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          label={reg.status}
                          tone={
                            reg.status === 'Approved'
                              ? 'success'
                              : reg.status === 'New'
                              ? 'warning'
                              : 'error'
                          }
                          variant="soft"
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            tone="secondary"
                            size="sm"
                            onClick={() => openReceipt(reg)}
                          >
                            <Printer className="mr-1 h-3.5 w-3.5" />
                            Receipt
                          </Button>
                          {reg.status !== 'Approved' ? (
                            <Button
                              tone="primary"
                              size="sm"
                              onClick={() => handleApproveEnrollment(reg)}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </Button>
                          ) : (
                            <span className="text-xs font-semibold text-success flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Log Inquiry Modal */}
      <Modal
        open={newInquiryOpen}
        onClose={() => setNewInquiryOpen(false)}
        title="Log Prospective Student Inquiry"
      >
        <form onSubmit={handleCreateInquiry} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Candidate Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bilal Ahmed"
              value={inqForm.candidateName}
              onChange={(e) => setInqForm({ ...inqForm, candidateName: e.target.value })}
              className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Father's Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tariq Ahmed"
                value={inqForm.fatherName}
                onChange={(e) => setInqForm({ ...inqForm, fatherName: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Father Mobile *</label>
              <input
                type="text"
                required
                placeholder="+92-300-1234567"
                value={inqForm.fatherMobile}
                onChange={(e) => setInqForm({ ...inqForm, fatherMobile: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Target Grade</label>
              <select
                value={inqForm.targetGrade}
                onChange={(e) => setInqForm({ ...inqForm, targetGrade: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              >
                {['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9 (Matric)', 'Grade 10 (Matric)', 'O-Levels'].map(
                  (g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Inquiry Source</label>
              <select
                value={inqForm.source}
                onChange={(e) => setInqForm({ ...inqForm, source: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              >
                {['Walk-in', 'Social Media', 'Referral', 'Banner / Billboard', 'Website'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Remarks / Requirements</label>
            <textarea
              rows={2}
              placeholder="e.g. Transport required for DHA Phase 6; previous school Beaconhouse."
              value={inqForm.remarks}
              onChange={(e) => setInqForm({ ...inqForm, remarks: e.target.value })}
              className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button tone="secondary" onClick={() => setNewInquiryOpen(false)}>
              Cancel
            </Button>
            <Button tone="primary" type="submit">
              Save Inquiry
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Registration Modal */}
      <Modal
        open={newRegistrationOpen}
        onClose={() => setNewRegistrationOpen(false)}
        title="Candidate Registration & Receipt Generation"
      >
        <form onSubmit={handleCreateRegistration} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Candidate Name *</label>
              <input
                type="text"
                required
                placeholder="Candidate Full Name"
                value={regForm.candidateName}
                onChange={(e) => setRegForm({ ...regForm, candidateName: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">B-Form / CNIC *</label>
              <input
                type="text"
                required
                placeholder="35201-1234567-1"
                value={regForm.bFormNo}
                onChange={(e) => setRegForm({ ...regForm, bFormNo: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Father Name *</label>
              <input
                type="text"
                required
                placeholder="Father Full Name"
                value={regForm.fatherName}
                onChange={(e) => setRegForm({ ...regForm, fatherName: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Father CNIC *</label>
              <input
                type="text"
                required
                placeholder="35201-7654321-1"
                value={regForm.fatherCnic}
                onChange={(e) => setRegForm({ ...regForm, fatherCnic: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Target Grade</label>
              <input
                type="text"
                value={regForm.targetGrade}
                onChange={(e) => setRegForm({ ...regForm, targetGrade: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Father Mobile</label>
              <input
                type="text"
                required
                placeholder="+92-300-1234567"
                value={regForm.fatherMobile}
                onChange={(e) => setRegForm({ ...regForm, fatherMobile: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Reg. Fee (PKR)</label>
              <input
                type="number"
                value={regForm.registrationFee}
                onChange={(e) => setRegForm({ ...regForm, registrationFee: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button tone="secondary" onClick={() => setNewRegistrationOpen(false)}>
              Cancel
            </Button>
            <Button tone="primary" type="submit">
              Register Candidate
            </Button>
          </div>
        </form>
      </Modal>

      {/* A4 Registration Receipt Modal */}
      <Modal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Candidate Registration Receipt & Roll Number Slip"
      >
        {selectedRegistration && (
          <div className="space-y-4">
            <div className="border border-border rounded-xl p-5 bg-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                    eS
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-base">eSchool Academic Network</h3>
                    <p className="text-xs text-muted">{currentCampus?.name || 'Lahore Main Campus'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-primary">
                    {selectedRegistration.registrationNumber}
                  </span>
                  <p className="text-[11px] text-muted">
                    Date: {new Date(selectedRegistration.registrationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted">Candidate Name:</p>
                  <p className="font-bold text-ink text-sm">{selectedRegistration.candidateName}</p>
                </div>
                <div>
                  <p className="text-muted">B-Form / CNIC:</p>
                  <p className="font-mono font-bold text-ink">{selectedRegistration.bFormNo}</p>
                </div>
                <div>
                  <p className="text-muted">Father / Guardian Name:</p>
                  <p className="font-bold text-ink">{selectedRegistration.fatherName}</p>
                </div>
                <div>
                  <p className="text-muted">Father CNIC & Phone:</p>
                  <p className="font-mono text-ink">
                    {selectedRegistration.fatherCnic} ({selectedRegistration.fatherMobile})
                  </p>
                </div>
                <div>
                  <p className="text-muted">Target Grade Level:</p>
                  <p className="font-bold text-ink">{selectedRegistration.targetGrade}</p>
                </div>
                <div>
                  <p className="text-muted">Registration Fee Paid:</p>
                  <p className="font-mono font-bold text-success text-sm">
                    PKR {selectedRegistration.registrationFee.toLocaleString()} (PAID)
                  </p>
                </div>
              </div>

              {/* Barcode & Teller stamp */}
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs tracking-widest bg-subtle px-3 py-1.5 rounded text-ink border border-border inline-block">
                    |||| || ||||| |||| ||| |||||||
                  </div>
                  <p className="font-mono text-[10px] text-muted mt-1">
                    {selectedRegistration.registrationNumber}
                  </p>
                </div>
                <div className="text-right border border-dashed border-border rounded-lg p-2.5 w-36 text-center">
                  <p className="text-[10px] font-semibold text-muted uppercase">Teller Stamp</p>
                  <p className="text-[9px] text-success font-bold mt-1">CASH RECEIVED</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button tone="secondary" onClick={() => setReceiptModalOpen(false)}>
                Close
              </Button>
              <Button
                tone="primary"
                onClick={() => showToast('Sending printable vector receipt to printer...', 'success')}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print A4 Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
