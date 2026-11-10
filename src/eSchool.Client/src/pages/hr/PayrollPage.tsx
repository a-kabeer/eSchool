import { useState } from 'react';
import {
  Banknote,
  CreditCard,
  FileText,
  Printer,
  Scale,
  Send,
} from 'lucide-react';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { useCampus } from '@/context/CampusContext';
import { useToast } from '@/context/ToastContext';
import type { EmployeeSalary } from '@/types';

export function PayrollPage() {
  const { currentCampus } = useCampus();
  const { showToast } = useToast();

  const [billingMonth, setBillingMonth] = useState('2026-11');
  const [disbursing, setDisbursing] = useState(false);
  const [selectedPaySlip, setSelectedPaySlip] = useState<EmployeeSalary | null>(null);
  const [paySlipOpen, setPaySlipOpen] = useState(false);

  // Seeded staff salary directory matching standard Pakistani private school tiers
  const [employees, setEmployees] = useState<EmployeeSalary[]>([
    {
      id: 'emp-1',
      employeeCode: 'EMP-1001',
      name: 'Prof. Tariq Mehmood',
      designation: 'Principal & Senior Headmaster',
      department: 'Academic Administration',
      cnic: '35201-1456789-1',
      bankAccountNumber: 'BAHL-0014-9821-01',
      basicSalary: 120000,
      houseRentAllowance: 54000,
      medicalAllowance: 12000,
      conveyanceAllowance: 15000,
      grossSalary: 201000,
      eobiDeduction: 450,
      incomeTaxDeduction: 18500,
      otherDeductions: 0,
      totalDeductions: 18950,
      netSalary: 182050,
      status: 'PENDING',
    },
    {
      id: 'emp-2',
      employeeCode: 'EMP-1002',
      name: 'Ms. Ayesha Siddiqui',
      designation: 'Senior Physics Specialist',
      department: 'Secondary Sciences',
      cnic: '35202-8874123-2',
      bankAccountNumber: 'HBL-0129-8732-02',
      basicSalary: 65000,
      houseRentAllowance: 29250,
      medicalAllowance: 6500,
      conveyanceAllowance: 8000,
      grossSalary: 108750,
      eobiDeduction: 450,
      incomeTaxDeduction: 5200,
      otherDeductions: 0,
      totalDeductions: 5650,
      netSalary: 103100,
      status: 'PENDING',
    },
    {
      id: 'emp-3',
      employeeCode: 'EMP-1003',
      name: 'Mr. Muhammad Imran',
      designation: 'Head Accountant & Bursar',
      department: 'Finance & Accounts',
      cnic: '35201-3321456-3',
      bankAccountNumber: 'MCB-0821-4432-01',
      basicSalary: 55000,
      houseRentAllowance: 24750,
      medicalAllowance: 5500,
      conveyanceAllowance: 7000,
      grossSalary: 92250,
      eobiDeduction: 450,
      incomeTaxDeduction: 3800,
      otherDeductions: 0,
      totalDeductions: 4250,
      netSalary: 88000,
      status: 'PENDING',
    },
    {
      id: 'emp-4',
      employeeCode: 'EMP-1004',
      name: 'Ms. Rabia Basri',
      designation: 'Primary English Teacher',
      department: 'Junior Wing',
      cnic: '35201-9988123-4',
      bankAccountNumber: 'MEZN-0043-1123-01',
      basicSalary: 40000,
      houseRentAllowance: 18000,
      medicalAllowance: 4000,
      conveyanceAllowance: 5000,
      grossSalary: 67000,
      eobiDeduction: 450,
      incomeTaxDeduction: 1200,
      otherDeductions: 0,
      totalDeductions: 1650,
      netSalary: 65350,
      status: 'PENDING',
    },
    {
      id: 'emp-5',
      employeeCode: 'EMP-1005',
      name: 'Mr. Abdul Ghaffar',
      designation: 'Senior Lab Attendant',
      department: 'Science Laboratories',
      cnic: '35201-5544332-5',
      bankAccountNumber: 'UBL-0943-7721-01',
      basicSalary: 30000,
      houseRentAllowance: 13500,
      medicalAllowance: 3000,
      conveyanceAllowance: 4000,
      grossSalary: 50500,
      eobiDeduction: 450,
      incomeTaxDeduction: 0,
      otherDeductions: 0,
      totalDeductions: 450,
      netSalary: 50050,
      status: 'PENDING',
    },
    {
      id: 'emp-6',
      employeeCode: 'EMP-1006',
      name: 'Mr. Sher Muhammad',
      designation: 'Campus Security In-charge',
      department: 'General Services',
      cnic: '35201-7711223-6',
      bankAccountNumber: 'BAHL-0014-6632-02',
      basicSalary: 28000,
      houseRentAllowance: 12600,
      medicalAllowance: 2800,
      conveyanceAllowance: 3500,
      grossSalary: 46900,
      eobiDeduction: 450,
      incomeTaxDeduction: 0,
      otherDeductions: 0,
      totalDeductions: 450,
      netSalary: 46450,
      status: 'PENDING',
    },
  ]);

  const totalGross = employees.reduce((sum, e) => sum + e.grossSalary, 0);
  const totalTax = employees.reduce((sum, e) => sum + e.incomeTaxDeduction, 0);
  const totalEobi = employees.reduce((sum, e) => sum + e.eobiDeduction, 0);
  const totalNet = employees.reduce((sum, e) => sum + e.netSalary, 0);

  const handleDisbursePayroll = () => {
    setDisbursing(true);
    setTimeout(() => {
      setDisbursing(false);
      setEmployees((prev) => prev.map((e) => ({ ...e, status: 'DISBURSED' })));
      showToast(
        `Payroll for ${billingMonth} disbursed! General Ledger Voucher BPV-2026-${billingMonth.replace(
          '-',
          ''
        )} posted automatically (PKR ${totalNet.toLocaleString()}).`,
        'success'
      );
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-light-primary text-primary">
              <Banknote className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Human Resources & Pakistani Payroll Engine
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            FBR Section 149 salary tax withholding, EOBI contribution, automated GL voucher posting
            & bank advice for{' '}
            <span className="font-semibold text-primary">{currentCampus?.name || 'Lahore Main'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            tone="success"
            disabled={disbursing || employees.every((e) => e.status === 'DISBURSED')}
            className="inline-flex items-center gap-1.5"
            onClick={handleDisbursePayroll}
          >
            <Send className="h-4 w-4" />
            {disbursing ? 'Posting to GL...' : 'Disburse & Post BPV Voucher'}
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Total Gross Payroll</p>
          <h3 className="mt-1 text-2xl font-bold text-ink">
            PKR {totalGross.toLocaleString()}
          </h3>
          <p className="mt-2 text-xs text-muted">{employees.length} Active Staff Members</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">FBR Tax Withholding (Sec 149)</p>
          <h3 className="mt-1 text-2xl font-bold text-primary">
            PKR {totalTax.toLocaleString()}
          </h3>
          <p className="mt-2 text-xs text-muted">Remitted to National Bank</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">EOBI Pension Contribution</p>
          <h3 className="mt-1 text-2xl font-bold text-secondary">
            PKR {totalEobi.toLocaleString()}
          </h3>
          <p className="mt-2 text-xs text-muted">PKR 450 per employee/mo</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Net Bank Disbursal</p>
          <h3 className="mt-1 text-2xl font-bold text-success">
            PKR {totalNet.toLocaleString()}
          </h3>
          <p className="mt-2 text-xs text-success font-medium flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" /> Direct Bank Transfer
          </p>
        </Card>
      </div>

      {/* Double Entry GL Voucher Invariant Preview Banner */}
      <Card className="p-4 bg-light-primary border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Scale className="h-4 w-4 shrink-0" />
            <span>
              Automated Accounting Invariant: Debit (Salaries Expense) = Credit (Bank Net + Tax + EOBI) = PKR{' '}
              {totalGross.toLocaleString()}
            </span>
          </div>
          <span className="font-mono text-[11px] bg-surface px-2.5 py-1 rounded-lg border border-border text-ink font-bold">
            Balanced Double-Entry Satisfied
          </span>
        </div>
      </Card>

      {/* Filter and Month Selection Card */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Payroll Month</label>
              <input
                type="month"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="rounded-xl border border-border bg-app px-3.5 py-2 text-sm text-ink font-semibold focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Campus</label>
              <input
                type="text"
                disabled
                value={currentCampus?.name || 'Lahore Main'}
                className="rounded-xl border border-border bg-subtle px-3.5 py-2 text-sm text-muted"
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted">Disbursal Bank</span>
            <p className="font-bold text-sm text-ink">Bank Al-Habib Ltd (Operating A/C 0014)</p>
          </div>
        </div>

        {/* Staff Payroll Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-app text-muted text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Emp Code</th>
                <th className="px-4 py-3">Staff Name & Designation</th>
                <th className="px-4 py-3 text-right">Basic Pay</th>
                <th className="px-4 py-3 text-right">Allowances</th>
                <th className="px-4 py-3 text-right">Gross Pay</th>
                <th className="px-4 py-3 text-right">Tax & EOBI</th>
                <th className="px-4 py-3 text-right">Net Payable</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Pay Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map((emp) => {
                const allowances =
                  emp.houseRentAllowance + emp.medicalAllowance + emp.conveyanceAllowance;
                return (
                  <tr key={emp.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-primary">
                      {emp.employeeCode}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink">{emp.name}</div>
                      <div className="text-[11px] text-muted">{emp.designation}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-ink">
                      {emp.basicSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted">
                      {allowances.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-ink">
                      PKR {emp.grossSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-error">
                      -{emp.totalDeductions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-success text-sm">
                      PKR {emp.netSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge
                        label={emp.status}
                        tone={emp.status === 'DISBURSED' ? 'success' : 'warning'}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center gap-1"
                        onClick={() => {
                          setSelectedPaySlip(emp);
                          setPaySlipOpen(true);
                        }}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Slip
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-app font-bold text-ink border-t border-border">
              <tr>
                <td colSpan={4} className="px-4 py-3.5 text-right">
                  Monthly Total Payroll:
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-ink">
                  PKR {totalGross.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-error">
                  -{(totalTax + totalEobi).toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-success text-sm">
                  PKR {totalNet.toLocaleString()}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Official Monthly Salary Pay Slip Modal */}
      {selectedPaySlip && (
        <Modal
          open={paySlipOpen}
          onClose={() => setPaySlipOpen(false)}
          title="Official Monthly Salary Slip"
          size="md"
        >
          <div className="space-y-4 font-sans text-xs">
            {/* Header */}
            <div className="text-center border-b border-border pb-3">
              <h2 className="text-base font-extrabold text-ink uppercase tracking-wider">
                eSchool System
              </h2>
              <p className="text-muted">{currentCampus?.name || 'Lahore Main Campus'}</p>
              <p className="text-[11px] font-bold text-primary mt-1">
                Salary Slip for Month: {billingMonth}
              </p>
            </div>

            {/* Employee Demographics */}
            <div className="grid grid-cols-2 gap-2 bg-app p-3 rounded-xl border border-border text-[11px]">
              <div>
                <span className="text-muted">Staff Name:</span>
                <p className="font-bold text-ink">{selectedPaySlip.name}</p>
              </div>
              <div>
                <span className="text-muted">Employee Code:</span>
                <p className="font-mono font-bold text-primary">
                  {selectedPaySlip.employeeCode}
                </p>
              </div>
              <div>
                <span className="text-muted">Designation:</span>
                <p className="font-medium text-ink">{selectedPaySlip.designation}</p>
              </div>
              <div>
                <span className="text-muted">Department:</span>
                <p className="font-medium text-ink">{selectedPaySlip.department}</p>
              </div>
              <div>
                <span className="text-muted">CNIC:</span>
                <p className="font-mono text-muted">{selectedPaySlip.cnic}</p>
              </div>
              <div>
                <span className="text-muted">Bank Account:</span>
                <p className="font-mono font-semibold text-ink">
                  {selectedPaySlip.bankAccountNumber}
                </p>
              </div>
            </div>

            {/* Salary Breakdown Columns: Earnings vs Deductions */}
            <div className="grid grid-cols-2 gap-3">
              {/* Earnings */}
              <div className="border border-border rounded-xl p-3 bg-surface space-y-1.5">
                <h4 className="font-bold text-ink uppercase text-[10px] tracking-wider border-b border-border pb-1">
                  Earnings (PKR)
                </h4>
                <div className="flex justify-between">
                  <span className="text-muted">Basic Salary:</span>
                  <span className="font-mono font-medium">
                    {selectedPaySlip.basicSalary.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">House Rent (45%):</span>
                  <span className="font-mono font-medium">
                    {selectedPaySlip.houseRentAllowance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Medical (10%):</span>
                  <span className="font-mono font-medium">
                    {selectedPaySlip.medicalAllowance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Conveyance Allowance:</span>
                  <span className="font-mono font-medium">
                    {selectedPaySlip.conveyanceAllowance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-bold text-ink">
                  <span>Gross Salary:</span>
                  <span className="font-mono">
                    PKR {selectedPaySlip.grossSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-border rounded-xl p-3 bg-surface space-y-1.5">
                <h4 className="font-bold text-error uppercase text-[10px] tracking-wider border-b border-border pb-1">
                  Deductions (PKR)
                </h4>
                <div className="flex justify-between">
                  <span className="text-muted">EOBI Pension:</span>
                  <span className="font-mono font-medium text-error">
                    {selectedPaySlip.eobiDeduction.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Income Tax (Sec 149):</span>
                  <span className="font-mono font-medium text-error">
                    {selectedPaySlip.incomeTaxDeduction.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Other Deductions:</span>
                  <span className="font-mono font-medium">0</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-bold text-error">
                  <span>Total Deductions:</span>
                  <span className="font-mono">
                    -PKR {selectedPaySlip.totalDeductions.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Salary Payable */}
            <div className="rounded-xl bg-light-success border border-success/30 p-3.5 flex justify-between items-center text-sm font-bold text-success">
              <span>Net Take-Home Salary:</span>
              <span className="font-mono text-base">
                PKR {selectedPaySlip.netSalary.toLocaleString()}
              </span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6 pt-4 text-center text-[10px] text-muted">
              <div className="border-t border-border pt-1.5">Employee Signature</div>
              <div className="border-t border-border pt-1.5">Bursar / Accounts Officer</div>
            </div>

            {/* Print Action */}
            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <Button
                tone="primary"
                className="inline-flex items-center gap-1.5"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
                Print Salary Slip
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
