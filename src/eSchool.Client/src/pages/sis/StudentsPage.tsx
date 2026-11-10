import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Phone,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { api } from '@/services/api';
import { useCampus } from '@/context/CampusContext';
import { useToast } from '@/context/ToastContext';
import type { Student } from '@/types';

export function StudentsPage() {
  const navigate = useNavigate();
  const { currentCampus } = useCampus();
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');

  // Modal State for 4-Step Admission Wizard
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '2012-04-15',
    gender: 'Male',
    bloodGroup: 'B+',
    bFormOrCnic: '',
    classLevel: 'Grade 8',
    section: 'Section A',
    guardianName: '',
    guardianRelationship: 'Father',
    guardianPhone: '',
    guardianAddress: '',
  });

  const loadStudents = async () => {
    if (!currentCampus) return;
    setLoading(true);
    try {
      const data = await api.getStudents(currentCampus.id, search);
      setStudents(data.items);
      setTotalCount(data.total);
    } catch {
      showToast('Error loading students register', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [currentCampus, search]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCampus) return;
    if (!formData.firstName || !formData.guardianName || !formData.guardianPhone) {
      showToast('Please complete required fields (Name, Guardian & Phone)', 'warning');
      return;
    }

    try {
      const result = await api.createStudent({
        schoolId: currentCampus.id,
        ...formData,
      });
      showToast(`Student registered: ${result.name} (${result.registrationNumber})`, 'success');
      setAdmissionModalOpen(false);
      setWizardStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '2012-04-15',
        gender: 'Male',
        bloodGroup: 'B+',
        bFormOrCnic: '',
        classLevel: 'Grade 8',
        section: 'Section A',
        guardianName: '',
        guardianRelationship: 'Father',
        guardianPhone: '',
        guardianAddress: '',
      });
      loadStudents();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Registration failed', 'error');
    }
  };

  const filtered = students.filter((s) => {
    if (genderFilter !== 'ALL' && s.gender !== genderFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-light-primary text-primary">
              <Users className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Student Information System (SIS)
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Manage student registrations, academic placements, and emergency guardian records
            for{' '}
            <span className="font-semibold text-primary">
              {currentCampus?.name || 'All Campuses'}
            </span>
          </p>
        </div>

        <Button
          tone="primary"
          onClick={() => {
            setWizardStep(1);
            setAdmissionModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5"
        >
          <UserPlus className="h-4 w-4" />
          New Admission (Wizard)
        </Button>
      </div>

      {/* KPI Metric Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Total Enrolled</p>
              <h3 className="mt-1 text-2xl font-bold text-ink">{totalCount}</h3>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-light-primary text-primary">
              <GraduationCap className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-success flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Active in session 2026-2027
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Active Campus</p>
              <h3 className="mt-1 text-base font-bold text-ink truncate max-w-[150px]">
                {currentCampus?.name || 'Lahore Main'}
              </h3>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-light-info text-info">
              <Building className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">Code: {currentCampus?.code || 'LHE-MAIN'}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Male Students</p>
              <h3 className="mt-1 text-2xl font-bold text-ink">
                {students.filter((s) => s.gender === 'Male').length}
              </h3>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-light-secondary text-secondary">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">Standard Grade 1–10</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Female Students</p>
              <h3 className="mt-1 text-2xl font-bold text-ink">
                {students.filter((s) => s.gender === 'Female').length}
              </h3>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-light-success text-success">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">Standard Grade 1–10</p>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by student name, Reg No, or CNIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-app pl-9 pr-4 py-2 text-xs font-medium text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted" />
              <div className="flex rounded-xl bg-app p-1 border border-border">
                {['ALL', 'Male', 'Female'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setGenderFilter(tab)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      genderFilter === tab
                        ? 'bg-surface text-primary shadow-xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-app text-muted border-b border-border text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Registration No</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Gender & Blood</th>
                <th className="px-5 py-3.5">Guardian & Contact</th>
                <th className="px-5 py-3.5">B-Form / CNIC</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    Loading student records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No student records found matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-primary">
                      {s.registrationNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink">{s.name}</div>
                      <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> DOB: {s.dateOfBirth || '2011-05-14'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-ink">{s.gender}</span>
                      {s.bloodGroup && (
                        <span className="ml-2 inline-block rounded-md bg-light-error px-1.5 py-0.5 text-[10px] font-bold text-error">
                          {s.bloodGroup}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-ink">
                        {s.guardianName || 'Tariq Mahmood'}
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {s.guardianPhone || '+92-300-8451234'}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-muted text-xs">
                      {s.bFormOrCnic || '35201-1234567-1'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge label={s.status || 'Active'} tone="success" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          tone="primary"
                          size="sm"
                          onClick={() => navigate(`/sis/students/${s.id}/360`)}
                        >
                          360 Profile
                        </Button>
                        <Button
                          tone="secondary"
                          size="sm"
                          onClick={() =>
                            showToast(`Viewing digital card for ${s.name}`, 'info')
                          }
                        >
                          ID Card
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4-Step Admission Wizard Modal */}
      <Modal
        open={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
        title="Student Admission Wizard (4-Step Flow)"
        size="lg"
      >
        <div className="space-y-5">
          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            {[
              { num: 1, title: 'Personal Info' },
              { num: 2, title: 'Placement' },
              { num: 3, title: 'Fee Plan' },
              { num: 4, title: 'Guardian Contact' },
            ].map((step) => (
              <div
                key={step.num}
                className={`flex items-center gap-2 cursor-pointer ${
                  wizardStep === step.num
                    ? 'text-primary font-bold'
                    : wizardStep > step.num
                    ? 'text-success font-medium'
                    : 'text-muted'
                }`}
                onClick={() => setWizardStep(step.num)}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    wizardStep === step.num
                      ? 'bg-primary text-white shadow-sm'
                      : wizardStep > step.num
                      ? 'bg-light-success text-success'
                      : 'bg-subtle text-muted'
                  }`}
                >
                  {wizardStep > step.num ? '✓' : step.num}
                </span>
                <span className="hidden sm:inline text-xs">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Form Step Contents */}
          {wizardStep === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daniyal"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  B-Form / CNIC Number
                </label>
                <input
                  type="text"
                  placeholder="35202-XXXXXXX-X"
                  value={formData.bFormOrCnic}
                  onChange={(e) => setFormData({ ...formData, bFormOrCnic: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Academic Session</label>
                <input
                  type="text"
                  disabled
                  value="2026-2027 (Active Session)"
                  className="w-full rounded-xl border border-border bg-subtle px-3.5 py-2 text-sm text-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Assigned Campus</label>
                <input
                  type="text"
                  disabled
                  value={currentCampus?.name || 'Lahore Main Campus'}
                  className="w-full rounded-xl border border-border bg-subtle px-3.5 py-2 text-sm text-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Class Level *</label>
                <select
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                >
                  <option value="Grade 6">Grade 6 - Middle</option>
                  <option value="Grade 7">Grade 7 - Middle</option>
                  <option value="Grade 8">Grade 8 - Middle</option>
                  <option value="Grade 9">Grade 9 - Matric</option>
                  <option value="Grade 10">Grade 10 - Matric</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Section</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                >
                  <option value="Section A">Section A (Morning)</option>
                  <option value="Section B">Section B (Morning)</option>
                  <option value="Section C">Section C (Evening)</option>
                </select>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-light-primary p-3 text-xs text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0" />
                Fee structure automatically mapped based on selected Class (Grade 8: PKR 8,500/month).
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Standard Monthly Tuition
                  </label>
                  <input
                    type="text"
                    disabled
                    value="PKR 7,500"
                    className="w-full rounded-xl border border-border bg-subtle px-3.5 py-2 text-sm text-muted"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Lab / Sports Fund</label>
                  <input
                    type="text"
                    disabled
                    value="PKR 1,000"
                    className="w-full rounded-xl border border-border bg-subtle px-3.5 py-2 text-sm text-muted"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Concession / Scholarship %
                  </label>
                  <select className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none">
                    <option value="0">0% - Standard Full Fee</option>
                    <option value="25">25% - Kinship Discount</option>
                    <option value="50">50% - Teacher Son/Daughter</option>
                    <option value="100">100% - Merit Full Scholarship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Registration Challan Barcode
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Auto-generated upon submission"
                    className="w-full rounded-xl border border-border bg-subtle px-3.5 py-2 text-sm text-muted font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Guardian / Father Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mahmood"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Relationship</label>
                <select
                  value={formData.guardianRelationship}
                  onChange={(e) =>
                    setFormData({ ...formData, guardianRelationship: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Mobile / SMS Notification Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+92-300-XXXXXXX"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="House #, Street, City"
                  value={formData.guardianAddress}
                  onChange={(e) => setFormData({ ...formData, guardianAddress: e.target.value })}
                  className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Modal Buttons */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {wizardStep < 4 ? (
                <Button
                  tone="primary"
                  onClick={() => setWizardStep((prev) => Math.min(4, prev + 1))}
                >
                  Next Step
                </Button>
              ) : (
                <Button tone="primary" onClick={handleCreateStudent}>
                  Confirm & Register Student
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
