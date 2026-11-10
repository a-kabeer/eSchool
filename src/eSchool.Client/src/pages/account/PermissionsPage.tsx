import { useState, useMemo } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Button, StatusBadge } from '@/components/ui';
import { useToast } from '@/context/ToastContext';

interface PagePermission {
  pageKey: string;
  module: string;
  subModule: string;
  title: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

const ALL_152_PAGES_BASE = [
  // 1. Management (6)
  { pageKey: 'Management.Dashboard', module: 'Management', subModule: 'Core', title: 'School Analytics Dashboard' },
  { pageKey: 'Management.Users', module: 'Management', subModule: 'Security', title: 'Operator Users & Credentials' },
  { pageKey: 'Management.UserTypes', module: 'Management', subModule: 'Security', title: 'Roles & 152-Row RBAC Matrix' },
  { pageKey: 'Management.Settings', module: 'Management', subModule: 'Config', title: 'System Settings & Policies' },
  { pageKey: 'Management.SmsServices', module: 'Management', subModule: 'Config', title: 'SMS Gateway Services' },
  { pageKey: 'Management.Locks', module: 'Management', subModule: 'Compliance', title: '41-Section Period Data Locks' },

  // 2. Settings (12)
  { pageKey: 'Settings.Schools', module: 'Settings', subModule: 'Institutions', title: 'Campuses & Branches Master' },
  { pageKey: 'Settings.Classes', module: 'Settings', subModule: 'Academics', title: 'Classes / Grade Levels Master' },
  { pageKey: 'Settings.Sections', module: 'Settings', subModule: 'Academics', title: 'Class Sections Master' },
  { pageKey: 'Settings.Sessions', module: 'Settings', subModule: 'Academics', title: 'Academic Sessions Master' },
  { pageKey: 'Settings.Subjects', module: 'Settings', subModule: 'Academics', title: 'Academic Subjects Master' },
  { pageKey: 'Settings.Religions', module: 'Settings', subModule: 'Lookups', title: 'Religions Master' },
  { pageKey: 'Settings.Nationalities', module: 'Settings', subModule: 'Lookups', title: 'Nationalities Master' },
  { pageKey: 'Settings.Cities', module: 'Settings', subModule: 'Locations', title: 'Cities Master' },
  { pageKey: 'Settings.Towns', module: 'Settings', subModule: 'Locations', title: 'Towns & Tehsils Master' },
  { pageKey: 'Settings.Occupations', module: 'Settings', subModule: 'Lookups', title: 'Parent Occupations Master' },
  { pageKey: 'Settings.Banks', module: 'Settings', subModule: 'Banking', title: 'Banks Master' },
  { pageKey: 'Settings.BankAccounts', module: 'Settings', subModule: 'Banking', title: 'Bank Accounts & Clearing' },

  // 3. Students (23)
  { pageKey: 'Students.Inquiries', module: 'Students', subModule: 'Admissions', title: 'Student Inquiries & Leads' },
  { pageKey: 'Students.Registrations', module: 'Students', subModule: 'Admissions', title: 'Student Registrations' },
  { pageKey: 'Students.Students', module: 'Students', subModule: 'Directory', title: 'Students Master Register' },
  { pageKey: 'Students.Profile', module: 'Students', subModule: 'Student 360', title: 'Student 360 Profile & Drawers' },
  { pageKey: 'Students.Attendance', module: 'Students', subModule: 'Attendance', title: 'Daily Roll-Call Attendance' },
  { pageKey: 'Students.SubjectAttendance', module: 'Students', subModule: 'Attendance', title: 'Subject-Wise Period Attendance' },
  { pageKey: 'Students.Leaves', module: 'Students', subModule: 'Attendance', title: 'Student Leave Management' },
  { pageKey: 'Students.Withdrawals', module: 'Students', subModule: 'Lifecycle', title: 'Student Withdrawals & SLCs' },
  { pageKey: 'Students.Transfers', module: 'Students', subModule: 'Lifecycle', title: 'Student Transfers' },
  { pageKey: 'Students.Rejoins', module: 'Students', subModule: 'Lifecycle', title: 'Student Rejoins' },
  { pageKey: 'Students.Graduations', module: 'Students', subModule: 'Lifecycle', title: 'Student Graduations & Alumni' },
  { pageKey: 'Students.Revisions', module: 'Students', subModule: 'Self-Service', title: 'Parent Profile Revision Queue' },
  { pageKey: 'Students.Homework', module: 'Students', subModule: 'Academics', title: 'Homework & Assignments' },
  { pageKey: 'Students.Comments', module: 'Students', subModule: 'Discipline', title: 'Discipline & Behavior Comments' },
  { pageKey: 'Students.Notices', module: 'Students', subModule: 'Communications', title: 'Student Notice Board' },
  { pageKey: 'Students.Sms', module: 'Students', subModule: 'Communications', title: 'Student SMS Broadcast' },
  { pageKey: 'Students.AppNotifications', module: 'Students', subModule: 'Communications', title: 'Firebase Push Notifications' },
  { pageKey: 'Students.Documents', module: 'Students', subModule: 'Documents', title: 'Student Document Repository' },
  { pageKey: 'Students.IdCards', module: 'Students', subModule: 'Printing', title: 'Student Barcoded ID Cards' },
  { pageKey: 'Students.EmergencyContacts', module: 'Students', subModule: 'Safety', title: 'Emergency Contact Directory' },
  { pageKey: 'Students.Statistics', module: 'Students', subModule: 'Analytics', title: 'Student Demographics & Analytics' },
  { pageKey: 'Students.Lists', module: 'Students', subModule: 'Exports', title: 'Custom 72-Column Export Lists' },
  { pageKey: 'Students.Reports', module: 'Students', subModule: 'Reports', title: '9 Formal Student Reports' },

  // 4. Billing (13)
  { pageKey: 'Billing.Categories', module: 'Billing', subModule: 'Configuration', title: 'Fee Categories & Heads' },
  { pageKey: 'Billing.Structures', module: 'Billing', subModule: 'Configuration', title: 'Class Fee Structures' },
  { pageKey: 'Billing.Concessions', module: 'Billing', subModule: 'Configuration', title: 'Fee Concession Templates' },
  { pageKey: 'Billing.GenerateRegularFee', module: 'Billing', subModule: 'Invoicing', title: 'Regular Monthly Fee Batch Generator' },
  { pageKey: 'Billing.CustomFee', module: 'Billing', subModule: 'Invoicing', title: 'Custom & Ad-Hoc Fee Vouchers' },
  { pageKey: 'Billing.FeeCounter', module: 'Billing', subModule: 'Collections', title: 'POS Fee Counter & Barcode Scanner' },
  { pageKey: 'Billing.ManageFees', module: 'Billing', subModule: 'Collections', title: 'Fee Challans & Voucher Register' },
  { pageKey: 'Billing.BankReconciliation', module: 'Billing', subModule: 'Reconciliation', title: 'Bank Statement Reconciliation' },
  { pageKey: 'Billing.OnlinePayments', module: 'Billing', subModule: 'Digital', title: 'Online Payment Gateway Transactions' },
  { pageKey: 'Billing.Challans', module: 'Billing', subModule: 'Printing', title: '3-Part Bank Challan Printing Hub' },
  { pageKey: 'Billing.Adjustments', module: 'Billing', subModule: 'Corrections', title: 'Fee Adjustments & Late Fine Waiving' },
  { pageKey: 'Billing.Statistics', module: 'Billing', subModule: 'Analytics', title: 'Fee Accrual vs Collection Trends' },
  { pageKey: 'Billing.Reports', module: 'Billing', subModule: 'Reports', title: '15 Certified Billing Reports' },

  // 5. Examinations (8)
  { pageKey: 'Exams.SubjectAssignment', module: 'Exams', subModule: 'Configuration', title: 'Class-Subject Teacher Assignments' },
  { pageKey: 'Exams.ClassTeachers', module: 'Exams', subModule: 'Configuration', title: 'Class Teachers Master' },
  { pageKey: 'Exams.GradingScales', module: 'Exams', subModule: 'Configuration', title: 'Letter Grades (A+ to F) Rules' },
  { pageKey: 'Exams.Comments', module: 'Exams', subModule: 'Configuration', title: 'Report Card Comment Templates' },
  { pageKey: 'Exams.MasterExams', module: 'Exams', subModule: 'Exams', title: 'Term Exams Master & Publishing' },
  { pageKey: 'Exams.MarksEntry', module: 'Exams', subModule: 'Grading', title: 'Dual Theory & Practical Marks Entry' },
  { pageKey: 'Exams.ReportCards', module: 'Exams', subModule: 'Reporting', title: 'Student Progress Report Card Generator' },
  { pageKey: 'Exams.Analysis', module: 'Exams', subModule: 'Analytics', title: 'Exam Performance & Grade Analysis' },

  // 6. Timetable (5)
  { pageKey: 'Timetable.Periods', module: 'Timetable', subModule: 'Configuration', title: 'Daily Period Time Slots' },
  { pageKey: 'Timetable.Seasons', module: 'Timetable', subModule: 'Configuration', title: 'Summer / Winter Timetable Seasons' },
  { pageKey: 'Timetable.Schedules', module: 'Timetable', subModule: 'Planner', title: 'Drag-and-Drop Timetable Scheduler' },
  { pageKey: 'Timetable.ClassTimetable', module: 'Timetable', subModule: 'Views', title: 'Class-Wise Timetable Viewer' },
  { pageKey: 'Timetable.TeacherTimetable', module: 'Timetable', subModule: 'Views', title: 'Teacher-Wise Timetable Viewer' },

  // 7. eCalendar (6)
  { pageKey: 'Calendar.Events', module: 'eCalendar', subModule: 'Planner', title: 'Academic & Cultural Events' },
  { pageKey: 'Calendar.Tasks', module: 'eCalendar', subModule: 'Planner', title: 'Staff Tasks & Reminders' },
  { pageKey: 'Calendar.PhotoAlbums', module: 'eCalendar', subModule: 'Media', title: 'Event Photo Albums' },
  { pageKey: 'Calendar.VideoGalleries', module: 'eCalendar', subModule: 'Media', title: 'School Video Galleries' },
  { pageKey: 'Calendar.Organizers', module: 'eCalendar', subModule: 'Configuration', title: 'Event Organizers Master' },
  { pageKey: 'Calendar.Categories', module: 'eCalendar', subModule: 'Configuration', title: 'Calendar Event Categories' },

  // 8. HR & Employees (26)
  { pageKey: 'HR.Employees', module: 'HR', subModule: 'Directory', title: 'Employee Master Directory (48 Columns)' },
  { pageKey: 'HR.Profile', module: 'HR', subModule: 'HR 360', title: 'Employee 11-Tab HR 360 Profile' },
  { pageKey: 'HR.Attendance', module: 'HR', subModule: 'Attendance', title: 'Daily Employee Attendance' },
  { pageKey: 'HR.MachineAttendance', module: 'HR', subModule: 'Attendance', title: 'Biometric Clock Machine Import' },
  { pageKey: 'HR.Rosters', module: 'HR', subModule: 'Rosters', title: 'Staff Shift Rosters & Work Schedules' },
  { pageKey: 'HR.Shifts', module: 'HR', subModule: 'Rosters', title: 'Shift Timings & Margin Rules' },
  { pageKey: 'HR.LeaveTypes', module: 'HR', subModule: 'Leaves', title: 'Leave Policy Rules (Sandwich/Weightage)' },
  { pageKey: 'HR.LeaveQuotas', module: 'HR', subModule: 'Leaves', title: 'Annual Staff Leave Quotas' },
  { pageKey: 'HR.EmployeeLeaves', module: 'HR', subModule: 'Leaves', title: 'Staff Leave Requests & Approvals' },
  { pageKey: 'HR.Holidays', module: 'HR', subModule: 'Leaves', title: 'Official & Public Holidays Master' },
  { pageKey: 'HR.Transfers', module: 'HR', subModule: 'Movements', title: 'Staff Campus Transfers' },
  { pageKey: 'HR.Promotions', module: 'HR', subModule: 'Movements', title: 'Staff Promotions & Increments' },
  { pageKey: 'HR.Resignations', module: 'HR', subModule: 'Movements', title: 'Staff Resignations & Notice Periods' },
  { pageKey: 'HR.Rejoins', module: 'HR', subModule: 'Movements', title: 'Staff Rejoins & Rehiring' },
  { pageKey: 'HR.Appraisals', module: 'HR', subModule: 'Performance', title: 'Teacher Performance Appraisals' },
  { pageKey: 'HR.LessonPlans', module: 'HR', subModule: 'Academic', title: 'Teacher Weekly Lesson Plans' },
  { pageKey: 'HR.Documents', module: 'HR', subModule: 'Repository', title: 'Staff Document Files & Degrees' },
  { pageKey: 'HR.IdCards', module: 'HR', subModule: 'Printing', title: 'Employee Barcoded Staff ID Cards' },
  { pageKey: 'HR.Notices', module: 'HR', subModule: 'Communications', title: 'Staff Internal Notice Board' },
  { pageKey: 'HR.Sms', module: 'HR', subModule: 'Communications', title: 'Staff SMS Alerts & Announcements' },
  { pageKey: 'HR.AppNotifications', module: 'HR', subModule: 'Communications', title: 'Staff Mobile App Push Notifications' },
  { pageKey: 'HR.Statistics', module: 'HR', subModule: 'Analytics', title: 'Staff Demographics & Turnover' },
  { pageKey: 'HR.Lists', module: 'HR', subModule: 'Exports', title: 'Custom 48-Column Staff Export Lists' },
  { pageKey: 'HR.ExitClearance', module: 'HR', subModule: 'Clearance', title: 'Multi-Department Exit Clearance' },
  { pageKey: 'HR.Reports', module: 'HR', subModule: 'Reports', title: 'Comprehensive HR Reports' },
  { pageKey: 'HR.Dashboard', module: 'HR', subModule: 'Dashboard', title: 'HR & Attendance KPI Dashboard' },

  // 9. Payroll (12)
  { pageKey: 'Payroll.IncomeTaxSlabs', module: 'Payroll', subModule: 'Statutory', title: 'FBR Section 149 Income Tax Slabs' },
  { pageKey: 'Payroll.EobiSlabs', module: 'Payroll', subModule: 'Statutory', title: 'EOBI Pension Contribution Slabs' },
  { pageKey: 'Payroll.ProvidentFund', module: 'Payroll', subModule: 'Statutory', title: 'Provident Fund Contribution Tiers' },
  { pageKey: 'Payroll.SocialSecurity', module: 'Payroll', subModule: 'Statutory', title: 'Social Security Contribution Bands' },
  { pageKey: 'Payroll.Salaries', module: 'Payroll', subModule: 'Salaries', title: 'Employee Salary Structure (Basic 1/1.1)' },
  { pageKey: 'Payroll.Loans', module: 'Payroll', subModule: 'Loans', title: 'Staff Loans & Remainder-First EMIs' },
  { pageKey: 'Payroll.LoanRecovery', module: 'Payroll', subModule: 'Loans', title: 'Monthly Loan Recovery Register' },
  { pageKey: 'Payroll.Bonuses', module: 'Payroll', subModule: 'Adjustments', title: 'Staff Bonuses (Eid, Performance)' },
  { pageKey: 'Payroll.MonthlyAdjustments', module: 'Payroll', subModule: 'Adjustments', title: 'Monthly Overtime, Mobile, Deductions' },
  { pageKey: 'Payroll.GeneratePayroll', module: 'Payroll', subModule: 'Disbursement', title: 'Monthly Payroll Batch Generator' },
  { pageKey: 'Payroll.FinalSettlements', module: 'Payroll', subModule: 'Settlements', title: 'Resigned Staff Final Settlements' },
  { pageKey: 'Payroll.Reports', module: 'Payroll', subModule: 'Reports', title: '14 Certified Payroll Reports' },

  // 10. Petty Cash (4)
  { pageKey: 'PettyCash.Categories', module: 'Petty Cash', subModule: 'Configuration', title: 'Petty Cash Expense Heads' },
  { pageKey: 'PettyCash.Receipts', module: 'Petty Cash', subModule: 'Transactions', title: 'Petty Cash Replenishment Receipts' },
  { pageKey: 'PettyCash.Expenses', module: 'Petty Cash', subModule: 'Transactions', title: 'Petty Cash Daily Expense Vouchers' },
  { pageKey: 'PettyCash.Reports', module: 'Petty Cash', subModule: 'Reports', title: 'Petty Cash Day Book & Statements' },

  // 11. Accounting (10)
  { pageKey: 'Accounting.ChartOfAccounts', module: 'Accounting', subModule: 'COA', title: '4-Tier Chart of Accounts Hierarchy' },
  { pageKey: 'Accounting.Vouchers', module: 'Accounting', subModule: 'General Ledger', title: 'Balanced Vouchers (JV, CPV, CRV, BPV, BRV)' },
  { pageKey: 'Accounting.ChequeBooks', module: 'Accounting', subModule: 'Banking', title: 'Cheque Book Register & Status Tracking' },
  { pageKey: 'Accounting.Settings', module: 'Accounting', subModule: 'Integration', title: '5-Tab ERP to GL Automatic Posting Rules' },
  { pageKey: 'Accounting.LedgerStatement', module: 'Accounting', subModule: 'Statements', title: 'Ledger Account Statement with 6 Drilldowns' },
  { pageKey: 'Accounting.TrialBalance', module: 'Accounting', subModule: 'Statements', title: '6-Column Trial Balance (Debit == Credit)' },
  { pageKey: 'Accounting.ProfitAndLoss', module: 'Accounting', subModule: 'Statements', title: 'Profit & Loss (Income Statement)' },
  { pageKey: 'Accounting.BalanceSheet', module: 'Accounting', subModule: 'Statements', title: 'Balance Sheet Statement (Assets = Liab + Eq)' },
  { pageKey: 'Accounting.GeneralLedger', module: 'Accounting', subModule: 'Statements', title: 'General Ledger Detailed Transaction Book' },
  { pageKey: 'Accounting.Closings', module: 'Accounting', subModule: 'Fiscal Year', title: 'Annual Financial Year Closing Vouchers' },

  // 12. Library (13)
  { pageKey: 'Library.Navigator', module: 'Library', subModule: 'Circulation', title: 'Library Operations Navigator' },
  { pageKey: 'Library.Types', module: 'Library', subModule: 'Catalog', title: 'Book Types Master' },
  { pageKey: 'Library.Categories', module: 'Library', subModule: 'Catalog', title: 'Book Categories (3-Char Code)' },
  { pageKey: 'Library.Languages', module: 'Library', subModule: 'Catalog', title: 'Book Languages Master' },
  { pageKey: 'Library.Authors', module: 'Library', subModule: 'Catalog', title: 'Book Authors Master' },
  { pageKey: 'Library.Publishers', module: 'Library', subModule: 'Catalog', title: 'Book Publishers Master' },
  { pageKey: 'Library.Editions', module: 'Library', subModule: 'Catalog', title: 'Book Editions Master' },
  { pageKey: 'Library.Books', module: 'Library', subModule: 'Catalog', title: 'Book Titles & Metadata' },
  { pageKey: 'Library.Copies', module: 'Library', subModule: 'Catalog', title: 'Physical Barcoded Copies (CAT-BOOK-COPY)' },
  { pageKey: 'Library.Reservations', module: 'Library', subModule: 'Circulation', title: 'Student & Staff Book Reservations' },
  { pageKey: 'Library.Issues', module: 'Library', subModule: 'Circulation', title: 'Book Borrowing & Issue Register' },
  { pageKey: 'Library.Returns', module: 'Library', subModule: 'Circulation', title: 'Book Return & Overdue Fine Settlement' },
  { pageKey: 'Library.Reports', module: 'Library', subModule: 'Reports', title: '9 Certified Library Reports' },

  // 13. Inventory & Assets (9)
  { pageKey: 'Inventory.Categories', module: 'Inventory', subModule: 'Catalog', title: 'Item Categories Master' },
  { pageKey: 'Inventory.Brands', module: 'Inventory', subModule: 'Catalog', title: 'Equipment & Item Brands' },
  { pageKey: 'Inventory.Suppliers', module: 'Inventory', subModule: 'Catalog', title: 'Vendor & Supplier Directory' },
  { pageKey: 'Inventory.Attributes', module: 'Inventory', subModule: 'Catalog', title: 'Item Variant Attributes' },
  { pageKey: 'Inventory.Items', module: 'Inventory', subModule: 'Catalog', title: 'Stock Item Master' },
  { pageKey: 'Inventory.Batches', module: 'Inventory', subModule: 'Stock', title: 'Stock Batches & Procurements' },
  { pageKey: 'Inventory.Transfers', module: 'Inventory', subModule: 'Movements', title: 'Campus & Department Stock Transfers' },
  { pageKey: 'Inventory.Adjustments', module: 'Inventory', subModule: 'Custody', title: 'Serialized Asset Custody (C###-I####-#####)' },
  { pageKey: 'Inventory.Reports', module: 'Inventory', subModule: 'Reports', title: '4 Certified Inventory & Asset Reports' },

  // 14. 5 Verified Unlisted RBAC Pages (5)
  { pageKey: 'Accounting.Depreciation', module: 'Accounting', subModule: 'Fixed Assets', title: 'Fixed Asset Monthly Depreciation Calculator' },
  { pageKey: 'Management.Backups', module: 'Management', subModule: 'Operations', title: 'Database Backup & Restore Manager' },
  { pageKey: 'Management.PaymentMethods', module: 'Management', subModule: 'Billing', title: 'Payment Gateway & Merchant Account Toggles' },
  { pageKey: 'Students.InquirySources', module: 'Students', subModule: 'Admissions', title: 'Student Inquiry Marketing Sources Master' },
  { pageKey: 'Management.EmailTemplates', module: 'Management', subModule: 'Communications', title: '2FA & Notification Email Templates Manager' },
];

const ROLES = [
  { id: 'super-admin', title: 'Super Administrator', subtitle: '150/152 Full Access', isDefault: true },
  { id: 'administrator', title: 'Administrator', subtitle: '146/152 Operational Access', isDefault: false },
  { id: 'accountant', title: 'Acountant', subtitle: 'Finance & Billing Access', isDefault: false },
  { id: 'exam-coordinator', title: 'Exam Coordinator', subtitle: 'Exams & Student Grading Access', isDefault: false },
  { id: 'teacher', title: 'Teacher / Faculty', subtitle: 'Rosters & Attendance Access', isDefault: false },
];

export function PermissionsPage() {
  const { showToast } = useToast();

  const [activeRole, setActiveRole] = useState('super-admin');
  const [selectedModule, setSelectedModule] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial permission state initialized from defaults
  const [permissions, setPermissions] = useState<Record<string, PagePermission>>(() => {
    const map: Record<string, PagePermission> = {};
    ALL_152_PAGES_BASE.forEach((p) => {
      map[p.pageKey] = {
        ...p,
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
      };
    });
    return map;
  });

  const modules = useMemo(() => {
    const set = new Set(ALL_152_PAGES_BASE.map((p) => p.module));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredPages = useMemo(() => {
    return ALL_152_PAGES_BASE.filter((p) => {
      const matchMod = selectedModule === 'All' || p.module === selectedModule;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pageKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subModule.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMod && matchSearch;
    });
  }, [selectedModule, searchQuery]);

  const toggleFlag = (pageKey: string, flag: 'canView' | 'canAdd' | 'canEdit' | 'canDelete' | 'canExport') => {
    setPermissions((prev) => {
      const current = prev[pageKey] ?? {
        ...ALL_152_PAGES_BASE.find((p) => p.pageKey === pageKey)!,
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
      };

      const nextVal = !current[flag];
      const updated = { ...current, [flag]: nextVal };

      // Rule: selecting Add/Edit/Delete/Export automatically enables View
      if (nextVal && flag !== 'canView') {
        updated.canView = true;
      }
      // If View is turned off, disable all other rights
      if (!nextVal && flag === 'canView') {
        updated.canAdd = false;
        updated.canEdit = false;
        updated.canDelete = false;
        updated.canExport = false;
      }

      return { ...prev, [pageKey]: updated };
    });
  };

  const handleGrantAll = (grantAllVaedx: boolean) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      filteredPages.forEach((p) => {
        updated[p.pageKey] = {
          ...p,
          canView: true,
          canAdd: grantAllVaedx,
          canEdit: grantAllVaedx,
          canDelete: grantAllVaedx,
          canExport: grantAllVaedx,
        };
      });
      return updated;
    });

    showToast(
      grantAllVaedx ? 'Full VAEDX Granted' : 'View Rights Granted',
      'info',
      `Applied to ${filteredPages.length} displayed pages.`
    );
  };

  const handleClearAll = () => {
    setPermissions((prev) => {
      const updated = { ...prev };
      filteredPages.forEach((p) => {
        updated[p.pageKey] = {
          ...p,
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canExport: false,
        };
      });
      return updated;
    });

    showToast('Permissions Cleared', 'warning', `Revoked all permissions for ${filteredPages.length} displayed pages.`);
  };

  const handleSave = () => {
    showToast(
      'Permissions Matrix Saved',
      'success',
      `Updated 152-row RBAC matrix successfully for role '${ROLES.find((r) => r.id === activeRole)?.title}'.`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Base Access Control (152-Row Matrix)"
        breadcrumbs={[
          { label: 'Home', path: '/dashboards/dashboard3' },
          { label: 'Management' },
          { label: '152-Row RBAC Matrix' },
        ]}
      />

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ROLES.map((role) => {
          const isSelected = activeRole === role.id;
          return (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:-translate-y-0.5'
              }`}
              onClick={() => setActiveRole(role.id)}
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                  isSelected ? 'bg-primary text-white' : 'bg-light-primary text-primary'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </span>
                {isSelected && <StatusBadge label="Active" tone="primary" variant="solid" />}
              </div>
              <h3 className="mt-3 text-sm font-bold text-ink">{role.title}</h3>
              <p className="mt-1 text-xs text-muted">{role.subtitle}</p>
            </Card>
          );
        })}
      </div>

      {/* Main Matrix Card */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {modules.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModule(mod)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedModule === mod
                    ? 'bg-primary text-white'
                    : 'bg-surface text-muted hover:bg-light-primary hover:text-primary'
                }`}
              >
                {mod} {mod === 'All' ? `(${ALL_152_PAGES_BASE.length})` : `(${ALL_152_PAGES_BASE.filter((p) => p.module === mod).length})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 152 pages..."
                className="w-full rounded-lg border border-border bg-surface py-1.5 pl-9 pr-3 text-xs text-ink outline-none focus:border-primary"
              />
            </div>

            <Button variant="outline" size="sm" onClick={() => handleGrantAll(false)}>
              Grant View
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleGrantAll(true)}>
              Grant All (VAEDX)
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-rose-600">
              Clear All
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Matrix
            </Button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted">
                <th className="py-3 pl-4 pr-3 font-semibold">#</th>
                <th className="px-3 py-3 font-semibold">Module & Submodule</th>
                <th className="px-3 py-3 font-semibold">Page Title & Route Key</th>
                <th className="px-3 py-3 text-center font-semibold">View (V)</th>
                <th className="px-3 py-3 text-center font-semibold">Add (A)</th>
                <th className="px-3 py-3 text-center font-semibold">Edit (E)</th>
                <th className="px-3 py-3 text-center font-semibold">Delete (D)</th>
                <th className="py-3 pl-3 pr-4 text-center font-semibold">Export (X)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredPages.map((page, idx) => {
                const perm = permissions[page.pageKey] ?? {
                  canView: false,
                  canAdd: false,
                  canEdit: false,
                  canDelete: false,
                  canExport: false,
                };

                return (
                  <tr key={page.pageKey} className="hover:bg-primary/[0.02]">
                    <td className="py-2.5 pl-4 pr-3 font-mono text-muted">{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-ink">{page.module}</span>
                      <span className="ml-1.5 rounded bg-surface-ground px-1.5 py-0.5 text-[10px] text-muted">
                        {page.subModule}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-ink">{page.title}</p>
                      <p className="font-mono text-[10px] text-muted">{page.pageKey}</p>
                    </td>

                    {/* Checkbox columns */}
                    {(['canView', 'canAdd', 'canEdit', 'canDelete', 'canExport'] as const).map((flag) => (
                      <td key={flag} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={perm[flag]}
                          onChange={() => toggleFlag(page.pageKey, flag)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
