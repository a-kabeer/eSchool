import { useEffect, useState } from 'react';
import {
  Send,
  UserCheck,
} from 'lucide-react';
import { Card, Button, StatusBadge } from '@/components/ui';
import { api } from '@/services/api';
import { useCampus } from '@/context/CampusContext';
import { useToast } from '@/context/ToastContext';
import type { AttendanceStudent } from '@/types';

export function DailyAttendancePage() {
  const { currentCampus } = useCampus();
  const { showToast } = useToast();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('Grade 8 - Section A');
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAttendance = async () => {
    if (!currentCampus) return;
    setLoading(true);
    try {
      const data = await api.getAttendanceRegister(currentCampus.id, date);
      setStudents(data);
    } catch {
      showToast('Error loading attendance register', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [currentCampus, date]);

  const toggleStatus = (id: string, newStatus: 'Present' | 'Absent' | 'Leave' | 'Late') => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
    showToast('All students marked Present', 'info');
  };

  const handleSaveAttendance = async () => {
    if (!currentCampus) return;
    setSaving(true);
    try {
      const result = await api.markAttendance({
        schoolId: currentCampus.id,
        date,
        items: students.map((s) => ({
          studentId: s.id,
          studentName: s.name,
          status: s.status,
        })),
      });

      showToast(
        `Attendance saved! ${result.presentCount ?? 5} Present, ${
          result.absentCount ?? 0
        } Absent. Notification Worker Dispatched SMS!`,
        'success'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;
  const lateCount = students.filter((s) => s.status === 'Late').length;
  const leaveCount = students.filter((s) => s.status === 'Leave').length;
  const rate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-light-primary text-primary">
              <UserCheck className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Daily Attendance Register & SMS Trigger
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Fast roll call marking with automated absence SMS notifications to parents via .NET
            background worker for{' '}
            <span className="font-semibold text-primary">
              {currentCampus?.name || 'Lahore Main'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllPresent}>
            Mark All Present
          </Button>
          <Button
            tone="primary"
            disabled={saving}
            className="inline-flex items-center gap-1.5"
            onClick={handleSaveAttendance}
          >
            <Send className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save & Send SMS'}
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Attendance Rate</p>
          <h3 className="mt-1 text-2xl font-bold text-primary">{rate}%</h3>
          <p className="mt-2 text-xs text-muted">{students.length} Total Registered</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Present Count</p>
          <h3 className="mt-1 text-2xl font-bold text-success">{presentCount}</h3>
          <p className="mt-2 text-xs text-success font-medium">In classroom</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Absent Count</p>
          <h3 className="mt-1 text-2xl font-bold text-error">{absentCount}</h3>
          <p className="mt-2 text-xs text-error font-medium">Will receive SMS</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Late / Leave</p>
          <h3 className="mt-1 text-2xl font-bold text-warning">{lateCount + leaveCount}</h3>
          <p className="mt-2 text-xs text-muted">{lateCount} Late, {leaveCount} Leave</p>
        </Card>
      </div>

      {/* Filter & Register Card */}
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border pb-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Class & Section</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="Grade 8 - Section A">Grade 8 - Section A (Morning)</option>
              <option value="Grade 8 - Section B">Grade 8 - Section B (Morning)</option>
              <option value="Grade 9 - Section A">Grade 9 - Section A (Matric)</option>
              <option value="Grade 10 - Section A">Grade 10 - Section A (Matric)</option>
            </select>
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

        {/* Student Attendance List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-app text-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Roll / Reg No</th>
                <th className="px-5 py-3">Student Full Name</th>
                <th className="px-5 py-3">Current Status</th>
                <th className="px-5 py-3 text-right">Quick Roll Call Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    Loading attendance register...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    No students found for this class.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-primary">
                      {student.registrationNumber}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-ink">{student.name}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        label={student.status}
                        tone={
                          student.status === 'Present'
                            ? 'success'
                            : student.status === 'Absent'
                            ? 'error'
                            : student.status === 'Late'
                            ? 'warning'
                            : 'neutral'
                        }
                      />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex rounded-xl bg-app p-1 border border-border">
                        {(['Present', 'Absent', 'Late', 'Leave'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => toggleStatus(student.id, st)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                              student.status === st
                                ? st === 'Present'
                                  ? 'bg-success text-white shadow-xs'
                                  : st === 'Absent'
                                  ? 'bg-error text-white shadow-xs'
                                  : st === 'Late'
                                  ? 'bg-warning text-white shadow-xs'
                                  : 'bg-primary text-white shadow-xs'
                                : 'text-muted hover:text-ink'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
