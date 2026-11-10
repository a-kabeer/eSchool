import { useState } from 'react';
import {
  GraduationCap,
  Award,
  Printer,
  Save,
  FileText,
} from 'lucide-react';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { useCampus } from '@/context/CampusContext';
import { useToast } from '@/context/ToastContext';

interface StudentExamMark {
  studentId: string;
  rollNo: string;
  name: string;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  remarks: string;
}

export function ExaminationsPage() {
  const { currentCampus } = useCampus();
  const { showToast } = useToast();

  const [term, setTerm] = useState('Mid-Term Examination 2026-2027');
  const [selectedClass, setSelectedClass] = useState('Grade 8 - Section A');
  const [selectedSubject, setSelectedSubject] = useState('General Science');
  const [saving, setSaving] = useState(false);

  // Sample student marks record
  const [marks, setMarks] = useState<StudentExamMark[]>([
    {
      studentId: '1',
      rollNo: 'REG-2024-1084',
      name: 'Ali Khan',
      theoryMarks: 65,
      practicalMarks: 22,
      totalMarks: 87,
      maxMarks: 100,
      percentage: 87,
      grade: 'A+',
      remarks: 'Outstanding conceptual understanding',
    },
    {
      studentId: '2',
      rollNo: 'REG-2024-1085',
      name: 'Fatima Zahra',
      theoryMarks: 72,
      practicalMarks: 24,
      totalMarks: 96,
      maxMarks: 100,
      percentage: 96,
      grade: 'A+',
      remarks: 'Class position 1st candidate',
    },
    {
      studentId: '3',
      rollNo: 'REG-2024-1086',
      name: 'Bilal Ahmad',
      theoryMarks: 45,
      practicalMarks: 18,
      totalMarks: 63,
      maxMarks: 100,
      percentage: 63,
      grade: 'B',
      remarks: 'Satisfactory progress, improve lab notebook',
    },
    {
      studentId: '4',
      rollNo: 'REG-2024-1087',
      name: 'Zainab Bibi',
      theoryMarks: 58,
      practicalMarks: 20,
      totalMarks: 78,
      maxMarks: 100,
      percentage: 78,
      grade: 'A',
      remarks: 'Very good performance',
    },
    {
      studentId: '5',
      rollNo: 'REG-2024-1088',
      name: 'Hamza Farooq',
      theoryMarks: 32,
      practicalMarks: 12,
      totalMarks: 44,
      maxMarks: 100,
      percentage: 44,
      grade: 'D',
      remarks: 'Needs remedial coaching in science',
    },
  ]);

  // Report Card Modal
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<StudentExamMark | null>(null);

  const calculateGrade = (pct: number): string => {
    if (pct >= 80) return 'A+';
    if (pct >= 70) return 'A';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const handleMarkChange = (studentId: string, field: 'theory' | 'practical', value: number) => {
    setMarks((prev) =>
      prev.map((m) => {
        if (m.studentId !== studentId) return m;
        const theory = field === 'theory' ? value : m.theoryMarks;
        const practical = field === 'practical' ? value : m.practicalMarks;
        const total = theory + practical;
        const pct = Math.round((total / m.maxMarks) * 100);
        return {
          ...m,
          theoryMarks: theory,
          practicalMarks: practical,
          totalMarks: total,
          percentage: pct,
          grade: calculateGrade(pct),
        };
      })
    );
  };

  const handleSaveMarks = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast(`Marks for ${selectedSubject} saved and tabulated!`, 'success');
    }, 600);
  };

  const classAvg =
    marks.length > 0 ? Math.round(marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length) : 0;
  const highestScore = marks.length > 0 ? Math.max(...marks.map((m) => m.totalMarks)) : 0;
  const passCount = marks.filter((m) => m.percentage >= 40).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-light-primary text-primary">
              <GraduationCap className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Examinations & Tabulation Sheet
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Subject marks entry, grading rules, auto-ranking & formal student progress report cards for{' '}
            <span className="font-semibold text-primary">{currentCampus?.name || 'Lahore Main'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            tone="primary"
            disabled={saving}
            className="inline-flex items-center gap-1.5"
            onClick={handleSaveMarks}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Marks Grid'}
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Class Average</p>
          <h3 className="mt-1 text-2xl font-bold text-primary">{classAvg}%</h3>
          <p className="mt-2 text-xs text-muted">Mean score across 5 students</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Highest Score</p>
          <h3 className="mt-1 text-2xl font-bold text-success">{highestScore}/100</h3>
          <p className="mt-2 text-xs text-success font-medium flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> Fatima Zahra (96%)
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Pass Rate</p>
          <h3 className="mt-1 text-2xl font-bold text-ink">
            {Math.round((passCount / marks.length) * 100)}%
          </h3>
          <p className="mt-2 text-xs text-success font-medium">
            {passCount} of {marks.length} Passed
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Grading Scale</p>
          <h3 className="mt-1 text-2xl font-bold text-secondary">A+ to F</h3>
          <p className="mt-2 text-xs text-muted">Punjab Board Standard</p>
        </Card>
      </div>

      {/* Filter and Criteria Selection Card */}
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border pb-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Examination Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="Mid-Term Examination 2026-2027">Mid-Term Examination 2026-2027</option>
              <option value="Final Term Examination 2026-2027">Final Term Examination 2026-2027</option>
              <option value="Monthly Assessment - October">Monthly Assessment - October</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Class & Section</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="Grade 8 - Section A">Grade 8 - Section A</option>
              <option value="Grade 8 - Section B">Grade 8 - Section B</option>
              <option value="Grade 9 - Section A">Grade 9 - Section A (Matric)</option>
              <option value="Grade 10 - Section A">Grade 10 - Section A (Matric)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="General Science">General Science (Max: 100)</option>
              <option value="Mathematics">Mathematics (Max: 100)</option>
              <option value="English Literature">English Literature (Max: 100)</option>
              <option value="Urdu Language">Urdu Language (Max: 100)</option>
              <option value="Computer Studies">Computer Studies (Max: 100)</option>
            </select>
          </div>
        </div>

        {/* Tabulation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-app text-muted text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 w-28">Theory (75)</th>
                <th className="px-4 py-3 w-28">Practical (25)</th>
                <th className="px-4 py-3 text-right">Total (100)</th>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3">Teacher Remarks</th>
                <th className="px-4 py-3 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {marks.map((row) => (
                <tr key={row.studentId} className="hover:bg-subtle/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-primary">{row.rollNo}</td>
                  <td className="px-4 py-3.5 font-semibold text-ink">{row.name}</td>
                  <td className="px-4 py-3.5">
                    <input
                      type="number"
                      min="0"
                      max="75"
                      value={row.theoryMarks}
                      onChange={(e) =>
                        handleMarkChange(row.studentId, 'theory', Number(e.target.value))
                      }
                      className="w-20 rounded-lg border border-border bg-app p-1.5 font-mono text-xs font-semibold text-ink text-center focus:border-primary focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <input
                      type="number"
                      min="0"
                      max="25"
                      value={row.practicalMarks}
                      onChange={(e) =>
                        handleMarkChange(row.studentId, 'practical', Number(e.target.value))
                      }
                      className="w-20 rounded-lg border border-border bg-app p-1.5 font-mono text-xs font-semibold text-ink text-center focus:border-primary focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-ink">
                    {row.totalMarks} <span className="text-[11px] text-muted font-normal">/ 100</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-extrabold ${
                        row.grade === 'A+'
                          ? 'bg-light-success text-success'
                          : row.grade === 'A'
                          ? 'bg-light-primary text-primary'
                          : row.grade === 'B'
                          ? 'bg-light-info text-info'
                          : row.grade === 'C'
                          ? 'bg-light-warning text-warning'
                          : row.grade === 'D'
                          ? 'bg-subtle text-muted'
                          : 'bg-light-error text-error'
                      }`}
                    >
                      {row.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted italic">{row.remarks}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center gap-1"
                      onClick={() => {
                        setSelectedStudentForReport(row);
                        setReportCardOpen(true);
                      }}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Report Card
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Formal Student Progress Report Card Modal */}
      {selectedStudentForReport && (
        <Modal
          open={reportCardOpen}
          onClose={() => setReportCardOpen(false)}
          title="Student Progress Report Card"
          size="lg"
        >
          <div className="space-y-5">
            {/* School Header */}
            <div className="text-center border-b border-border pb-4">
              <h2 className="text-lg font-extrabold text-ink uppercase tracking-wider">
                eSchool Model System
              </h2>
              <p className="text-xs text-muted">{currentCampus?.name || 'Lahore Main Campus'}</p>
              <p className="text-[11px] font-bold text-primary mt-1">{term}</p>
            </div>

            {/* Student Metadata Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-app p-4 rounded-2xl border border-border text-xs">
              <div>
                <span className="text-muted">Student Name:</span>
                <p className="font-bold text-ink">{selectedStudentForReport.name}</p>
              </div>
              <div>
                <span className="text-muted">Roll / Reg No:</span>
                <p className="font-mono font-bold text-primary">
                  {selectedStudentForReport.rollNo}
                </p>
              </div>
              <div>
                <span className="text-muted">Class & Section:</span>
                <p className="font-semibold text-ink">{selectedClass}</p>
              </div>
              <div>
                <span className="text-muted">Academic Session:</span>
                <p className="font-semibold text-ink">2026-2027</p>
              </div>
            </div>

            {/* Subject Marks Summary Table */}
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-app text-muted text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5 text-center">Max Marks</th>
                    <th className="px-4 py-2.5 text-center">Obtained</th>
                    <th className="px-4 py-2.5 text-center">Grade</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-2.5 font-medium">{selectedSubject}</td>
                    <td className="px-4 py-2.5 text-center font-mono">100</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold text-primary">
                      {selectedStudentForReport.totalMarks}
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold">
                      {selectedStudentForReport.grade}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge label="PASS" tone="success" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Mathematics</td>
                    <td className="px-4 py-2.5 text-center font-mono">100</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold text-primary">82</td>
                    <td className="px-4 py-2.5 text-center font-bold">A+</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge label="PASS" tone="success" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">English Literature</td>
                    <td className="px-4 py-2.5 text-center font-mono">100</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold text-primary">76</td>
                    <td className="px-4 py-2.5 text-center font-bold">A</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge label="PASS" tone="success" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Urdu Compulsory</td>
                    <td className="px-4 py-2.5 text-center font-mono">100</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold text-primary">80</td>
                    <td className="px-4 py-2.5 text-center font-bold">A+</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge label="PASS" tone="success" />
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-app font-bold text-ink border-t border-border">
                  <tr>
                    <td className="px-4 py-3">Grand Total:</td>
                    <td className="px-4 py-3 text-center font-mono">400</td>
                    <td className="px-4 py-3 text-center font-mono text-primary text-sm">
                      {selectedStudentForReport.totalMarks + 238} / 400
                    </td>
                    <td className="px-4 py-3 text-center text-success">
                      {calculateGrade(
                        Math.round(((selectedStudentForReport.totalMarks + 238) / 400) * 100)
                      )}
                    </td>
                    <td className="px-4 py-3">Overall Pass</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Teacher Remarks & Signatures */}
            <div className="rounded-2xl border border-dashed border-border p-4 bg-app/50 text-xs space-y-2">
              <span className="font-bold text-ink">Class Teacher Comments:</span>
              <p className="text-muted italic">{selectedStudentForReport.remarks}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="border-t border-border pt-2 text-center text-xs text-muted">
                Class Teacher Signature
              </div>
              <div className="border-t border-border pt-2 text-center text-xs text-muted">
                Principal & Controller Examination
              </div>
            </div>

            {/* Print Action */}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                tone="primary"
                className="inline-flex items-center gap-1.5"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
                Print Report Card
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
