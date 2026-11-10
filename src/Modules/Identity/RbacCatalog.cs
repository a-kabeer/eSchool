namespace eSchool.Modules.Identity;

public record RbacPageDefinition(string PageKey, string Module, string SubModule, string Title);
public record DataLockDefinition(string SectionKey, string Module, string Title, string Description);

public static class RbacCatalog
{
    public static readonly List<DataLockDefinition> AllDataLocks = new()
    {
        // Students (11)
        new("Students.Inquiries", "Students", "Student Inquiries", "Freezes historical student inquiries and leads"),
        new("Students.Registrations", "Students", "Student Registrations", "Freezes new candidate registrations and registration fees"),
        new("Students.Joining", "Students", "Student Joining", "Locks formal admission enrollment and joining dates"),
        new("Students.Attendance", "Students", "Daily Attendance", "Locks student daily roll-call attendance entries"),
        new("Students.SubjectAttendance", "Students", "Subject-Wise Attendance", "Locks subject-specific period attendance records"),
        new("Students.Leaves", "Students", "Student Leaves", "Locks historical student leave applications and approvals"),
        new("Students.Withdrawals", "Students", "Student Withdrawals", "Locks student withdrawal and SLC generation"),
        new("Students.Transfers", "Students", "Student Transfers", "Locks inter-campus or inter-section student transfers"),
        new("Students.Rejoins", "Students", "Student Rejoins", "Locks re-enrollment of former students"),
        new("Students.Graduations", "Students", "Student Graduations", "Locks graduating class closures and record archives"),
        new("Students.DisciplineComments", "Students", "Behavior & Comments", "Locks behavioral merits/demerits and nature ratings"),

        // Academics (4)
        new("Academics.Examinations", "Academics", "Examinations Master", "Locks exam term definitions and dates"),
        new("Academics.MarksEntry", "Academics", "Marks Entry", "Locks theory and practical examination marks from edits"),
        new("Academics.Timetable", "Academics", "Timetable Schedules", "Locks seasonal period assignments and teacher allocations"),
        new("Academics.CalendarEvents", "Academics", "eCalendar Events", "Locks historical school events, tasks, and gallery media"),

        // Billing (8)
        new("Billing.FeeStructure", "Billing", "Fee Structures", "Locks class-wise tuition and fee head tariffs"),
        new("Billing.Concessions", "Billing", "Fee Concessions", "Locks sibling discounts and scholarship percentage matrices"),
        new("Billing.RegularFeeGeneration", "Billing", "Regular Monthly Fee", "Locks mass monthly fee challan accruals"),
        new("Billing.CustomFee", "Billing", "Custom Fee Challans", "Locks ad-hoc and one-time fee vouchers"),
        new("Billing.FeeCollection", "Billing", "Fee Collection & Receipts", "Locks cashier receipt posting and settlement reversals"),
        new("Billing.FeeRevisions", "Billing", "Fee Adjustments & Revisions", "Locks individual line-item fee adjustments"),
        new("Billing.BankReconciliation", "Billing", "Bank Reconciliation", "Locks imported bank scroll settlement vouchers"),
        new("Billing.FinalSettlement", "Billing", "Student Final Settlements", "Locks security deposit refund balances for exiting students"),

        // Accounting (8)
        new("Accounting.ChartOfAccounts", "Accounting", "Chart of Accounts", "Locks account code structural additions and edits"),
        new("Accounting.JournalVouchers", "Accounting", "Journal Vouchers (JV)", "Locks posted journal adjustment vouchers"),
        new("Accounting.PaymentVouchers", "Accounting", "Payment Vouchers (CPV/BPV)", "Locks cash and bank expenditure disbursements"),
        new("Accounting.ReceiptVouchers", "Accounting", "Receipt Vouchers (CRV/BRV)", "Locks cash and bank collection vouchers"),
        new("Accounting.ContraVouchers", "Accounting", "Contra Vouchers (CV)", "Locks internal cash-to-bank and bank-to-bank transfers"),
        new("Accounting.ChequeBooks", "Accounting", "Cheque Book Management", "Locks cheque leaves inventory and status transitions"),
        new("Accounting.YearClosing", "Accounting", "Financial Year Closings", "Locks complete fiscal year audit balances"),
        new("Accounting.Depreciation", "Accounting", "Asset Depreciation", "Locks monthly asset depreciation amortization vouchers"),

        // Petty Cash (2)
        new("PettyCash.Receipts", "Petty Cash", "Petty Cash Receipts", "Locks petty cash imprest replenishment vouchers"),
        new("PettyCash.Expenses", "Petty Cash", "Petty Cash Expenses", "Locks daily petty cash expense disbursements"),

        // HR (5)
        new("HR.Employees", "HR", "Employee Master", "Locks employee personal profiles and salary bands"),
        new("HR.Attendance", "HR", "Staff Biometric Attendance", "Locks staff clock-in/clock-out machine entries"),
        new("HR.Leaves", "HR", "Staff Leaves", "Locks employee leave applications and quota deductions"),
        new("HR.Promotions", "HR", "Promotions & Transfers", "Locks designation changes, pay increments, and campus moves"),
        new("HR.Resignations", "HR", "Resignations & Clearances", "Locks employee resignations, clearances, and rejoins"),

        // Payroll (3)
        new("Payroll.Salaries", "Payroll", "Salary Allowances & Slabs", "Locks salary head configurations and statutory tax rates"),
        new("Payroll.Loans", "Payroll", "Staff Loans & Recovery", "Locks loan disbursement and EMI recovery schedules"),
        new("Payroll.Generation", "Payroll", "Monthly Payroll Runs", "Locks monthly salary disbursement vouchers and tax withholding")
    };

    public static readonly List<RbacPageDefinition> All152Pages = new()
    {
        // 1. Management (6)
        new("Management.Dashboard", "Management", "Core", "School Analytics Dashboard"),
        new("Management.Users", "Management", "Security", "Operator Users & Credentials"),
        new("Management.UserTypes", "Management", "Security", "Roles & 152-Row RBAC Matrix"),
        new("Management.Settings", "Management", "Config", "System Settings & Policies"),
        new("Management.SmsServices", "Management", "Config", "SMS Gateway Gateways"),
        new("Management.Locks", "Management", "Compliance", "41-Section Period Data Locks"),

        // 2. Settings (12)
        new("Settings.Schools", "Settings", "Institutions", "Campuses & Branches Master"),
        new("Settings.Classes", "Settings", "Academics", "Classes / Grade Levels Master"),
        new("Settings.Sections", "Settings", "Academics", "Class Sections Master"),
        new("Settings.Sessions", "Settings", "Academics", "Academic Sessions Master"),
        new("Settings.Subjects", "Settings", "Academics", "Academic Subjects Master"),
        new("Settings.Religions", "Settings", "Lookups", "Religions Master"),
        new("Settings.Nationalities", "Settings", "Lookups", "Nationalities Master"),
        new("Settings.Cities", "Settings", "Locations", "Cities Master"),
        new("Settings.Towns", "Settings", "Locations", "Towns & Tehsils Master"),
        new("Settings.Occupations", "Settings", "Lookups", "Parent Occupations Master"),
        new("Settings.Banks", "Settings", "Banking", "Banks Master"),
        new("Settings.BankAccounts", "Settings", "Banking", "Bank Accounts & Clearing"),

        // 3. Students (23)
        new("Students.Inquiries", "Students", "Admissions", "Student Inquiries & CRM"),
        new("Students.Registrations", "Students", "Admissions", "Student Registrations"),
        new("Students.Students", "Students", "Directory", "Students Master Register"),
        new("Students.Profile", "Students", "Student 360", "Student 360 Profile & Drawers"),
        new("Students.Attendance", "Students", "Attendance", "Daily Roll-Call Attendance"),
        new("Students.SubjectAttendance", "Students", "Attendance", "Subject-Wise Period Attendance"),
        new("Students.Leaves", "Students", "Attendance", "Student Leave Management"),
        new("Students.Withdrawals", "Students", "Lifecycle", "Student Withdrawals & SLCs"),
        new("Students.Transfers", "Students", "Lifecycle", "Student Transfers"),
        new("Students.Rejoins", "Students", "Lifecycle", "Student Rejoins"),
        new("Students.Graduations", "Students", "Lifecycle", "Student Graduations & Alumni"),
        new("Students.Revisions", "Students", "Self-Service", "Parent Profile Revision Queue"),
        new("Students.Homework", "Students", "Academics", "Homework & Assignments"),
        new("Students.Comments", "Students", "Discipline", "Discipline & Behavior Comments"),
        new("Students.Notices", "Students", "Communications", "Student Notice Board"),
        new("Students.Sms", "Students", "Communications", "Student SMS Broadcast"),
        new("Students.AppNotifications", "Students", "Communications", "Firebase Push Notifications"),
        new("Students.Documents", "Students", "Documents", "Student Document Repository"),
        new("Students.IdCards", "Students", "Printing", "Student Barcoded ID Cards"),
        new("Students.EmergencyContacts", "Students", "Safety", "Emergency Contact Directory"),
        new("Students.Statistics", "Students", "Analytics", "Student Demographics & Analytics"),
        new("Students.Lists", "Students", "Exports", "Custom 72-Column Export Lists"),
        new("Students.Reports", "Students", "Reports", "9 Formal Student Reports"),

        // 4. Billing (13)
        new("Billing.Categories", "Billing", "Configuration", "Fee Categories & Heads"),
        new("Billing.Structures", "Billing", "Configuration", "Class Fee Structures"),
        new("Billing.Concessions", "Billing", "Configuration", "Fee Concession Templates"),
        new("Billing.GenerateRegularFee", "Billing", "Invoicing", "Regular Monthly Fee Batch Generator"),
        new("Billing.CustomFee", "Billing", "Invoicing", "Custom & Ad-Hoc Fee Vouchers"),
        new("Billing.FeeCounter", "Billing", "Collections", "POS Fee Counter & Barcode Scanner"),
        new("Billing.ManageFees", "Billing", "Collections", "Fee Challans & Voucher Register"),
        new("Billing.BankReconciliation", "Billing", "Reconciliation", "Bank Statement Reconciliation"),
        new("Billing.OnlinePayments", "Billing", "Digital", "Online Payment Gateway Transactions"),
        new("Billing.Challans", "Billing", "Printing", "3-Part Bank Challan Printing Hub"),
        new("Billing.Adjustments", "Billing", "Corrections", "Fee Adjustments & Late Fine Waiving"),
        new("Billing.Statistics", "Billing", "Analytics", "Fee Accrual vs Collection Trends"),
        new("Billing.Reports", "Billing", "Reports", "15 Certified Billing Reports"),

        // 5. Examinations (8)
        new("Exams.SubjectAssignment", "Exams", "Configuration", "Class-Subject Teacher Assignments"),
        new("Exams.ClassTeachers", "Exams", "Configuration", "Class Teachers Master"),
        new("Exams.GradingScales", "Exams", "Configuration", "Letter Grades (A+ to F) Rules"),
        new("Exams.Comments", "Exams", "Configuration", "Report Card Comment Templates"),
        new("Exams.MasterExams", "Exams", "Exams", "Term Exams Master & Publishing"),
        new("Exams.MarksEntry", "Exams", "Grading", "Dual Theory & Practical Marks Entry"),
        new("Exams.ReportCards", "Exams", "Reporting", "Student Progress Report Card Generator"),
        new("Exams.Analysis", "Exams", "Analytics", "Exam Performance & Grade Analysis"),

        // 6. Timetable (5)
        new("Timetable.Periods", "Timetable", "Configuration", "Daily Period Time Slots"),
        new("Timetable.Seasons", "Timetable", "Configuration", "Summer / Winter Timetable Seasons"),
        new("Timetable.Schedules", "Timetable", "Planner", "Drag-and-Drop Timetable Scheduler"),
        new("Timetable.ClassTimetable", "Timetable", "Views", "Class-Wise Timetable Viewer"),
        new("Timetable.TeacherTimetable", "Timetable", "Views", "Teacher-Wise Timetable Viewer"),

        // 7. eCalendar (6)
        new("Calendar.Events", "eCalendar", "Planner", "Academic & Cultural Events"),
        new("Calendar.Tasks", "eCalendar", "Planner", "Staff Tasks & Reminders"),
        new("Calendar.PhotoAlbums", "eCalendar", "Media", "Event Photo Albums"),
        new("Calendar.VideoGalleries", "eCalendar", "Media", "School Video Galleries"),
        new("Calendar.Organizers", "eCalendar", "Configuration", "Event Organizers Master"),
        new("Calendar.Categories", "eCalendar", "Configuration", "Calendar Event Categories"),

        // 8. HR & Employees (26)
        new("HR.Employees", "HR", "Directory", "Employee Master Directory (48 Columns)"),
        new("HR.Profile", "HR", "HR 360", "Employee 11-Tab HR 360 Profile"),
        new("HR.Attendance", "HR", "Attendance", "Daily Employee Attendance"),
        new("HR.MachineAttendance", "HR", "Attendance", "Biometric Clock Machine Import"),
        new("HR.Rosters", "HR", "Rosters", "Staff Shift Rosters & Work Schedules"),
        new("HR.Shifts", "HR", "Rosters", "Shift Timings & Margin Rules"),
        new("HR.LeaveTypes", "HR", "Leaves", "Leave Policy Rules (Sandwich/Weightage)"),
        new("HR.LeaveQuotas", "HR", "Leaves", "Annual Staff Leave Quotas"),
        new("HR.EmployeeLeaves", "HR", "Leaves", "Staff Leave Requests & Approvals"),
        new("HR.Holidays", "HR", "Leaves", "Official & Public Holidays Master"),
        new("HR.Transfers", "HR", "Movements", "Staff Campus Transfers"),
        new("HR.Promotions", "HR", "Movements", "Staff Promotions & Increments"),
        new("HR.Resignations", "HR", "Movements", "Staff Resignations & Notice Periods"),
        new("HR.Rejoins", "HR", "Movements", "Staff Rejoins & Rehiring"),
        new("HR.Appraisals", "HR", "Performance", "Teacher Performance Appraisals"),
        new("HR.LessonPlans", "HR", "Academic", "Teacher Weekly Lesson Plans"),
        new("HR.Documents", "HR", "Repository", "Staff Document Files & Degrees"),
        new("HR.IdCards", "HR", "Printing", "Employee Barcoded Staff ID Cards"),
        new("HR.Notices", "HR", "Communications", "Staff Internal Notice Board"),
        new("HR.Sms", "HR", "Communications", "Staff SMS Alerts & Announcements"),
        new("HR.AppNotifications", "HR", "Communications", "Staff Mobile App Push Notifications"),
        new("HR.Statistics", "HR", "Analytics", "Staff Demographics & Turnover"),
        new("HR.Lists", "HR", "Exports", "Custom 48-Column Staff Export Lists"),
        new("HR.ExitClearance", "HR", "Clearance", "Multi-Department Exit Clearance"),
        new("HR.Reports", "HR", "Reports", "Comprehensive HR Reports"),
        new("HR.Dashboard", "HR", "Dashboard", "HR & Attendance KPI Dashboard"),

        // 9. Payroll (12)
        new("Payroll.IncomeTaxSlabs", "Payroll", "Statutory", "FBR Section 149 Income Tax Slabs"),
        new("Payroll.EobiSlabs", "Payroll", "Statutory", "EOBI Pension Contribution Slabs"),
        new("Payroll.ProvidentFund", "Payroll", "Statutory", "Provident Fund Contribution Tiers"),
        new("Payroll.SocialSecurity", "Payroll", "Statutory", "Social Security Contribution Bands"),
        new("Payroll.Salaries", "Payroll", "Salaries", "Employee Salary Structure (Basic 1/1.1)"),
        new("Payroll.Loans", "Payroll", "Loans", "Staff Loans & Remainder-First EMIs"),
        new("Payroll.LoanRecovery", "Payroll", "Loans", "Monthly Loan Recovery Register"),
        new("Payroll.Bonuses", "Payroll", "Adjustments", "Staff Bonuses (Eid, Performance)"),
        new("Payroll.MonthlyAdjustments", "Payroll", "Adjustments", "Monthly Overtime, Mobile, Deductions"),
        new("Payroll.GeneratePayroll", "Payroll", "Disbursement", "Monthly Payroll Batch Generator"),
        new("Payroll.FinalSettlements", "Payroll", "Settlements", "Resigned Staff Final Settlements"),
        new("Payroll.Reports", "Payroll", "Reports", "14 Certified Payroll Reports"),

        // 10. Petty Cash (4)
        new("PettyCash.Categories", "Petty Cash", "Configuration", "Petty Cash Expense Heads"),
        new("PettyCash.Receipts", "Petty Cash", "Transactions", "Petty Cash Replenishment Receipts"),
        new("PettyCash.Expenses", "Petty Cash", "Transactions", "Petty Cash Daily Expense Vouchers"),
        new("PettyCash.Reports", "Petty Cash", "Reports", "Petty Cash Day Book & Statements"),

        // 11. Accounting (10)
        new("Accounting.ChartOfAccounts", "Accounting", "COA", "4-Tier Chart of Accounts Hierarchy"),
        new("Accounting.Vouchers", "Accounting", "General Ledger", "Balanced Vouchers (JV, CPV, CRV, BPV, BRV)"),
        new("Accounting.ChequeBooks", "Accounting", "Banking", "Cheque Book Register & Status Tracking"),
        new("Accounting.Settings", "Accounting", "Integration", "5-Tab ERP to GL Automatic Posting Rules"),
        new("Accounting.LedgerStatement", "Accounting", "Statements", "Ledger Account Statement with 6 Drilldowns"),
        new("Accounting.TrialBalance", "Accounting", "Statements", "6-Column Trial Balance (Debit == Credit)"),
        new("Accounting.ProfitAndLoss", "Accounting", "Statements", "Profit & Loss (Income Statement)"),
        new("Accounting.BalanceSheet", "Accounting", "Statements", "Balance Sheet Statement (Assets = Liab + Eq)"),
        new("Accounting.GeneralLedger", "Accounting", "Statements", "General Ledger Detailed Transaction Book"),
        new("Accounting.Closings", "Accounting", "Fiscal Year", "Annual Financial Year Closing Vouchers"),

        // 12. Library (13)
        new("Library.Navigator", "Library", "Circulation", "Library Operations Navigator"),
        new("Library.Types", "Library", "Catalog", "Book Types Master"),
        new("Library.Categories", "Library", "Catalog", "Book Categories (3-Char Code)"),
        new("Library.Languages", "Library", "Catalog", "Book Languages Master"),
        new("Library.Authors", "Library", "Catalog", "Book Authors Master"),
        new("Library.Publishers", "Library", "Catalog", "Book Publishers Master"),
        new("Library.Editions", "Library", "Catalog", "Book Editions Master"),
        new("Library.Books", "Library", "Catalog", "Book Titles & Metadata"),
        new("Library.Copies", "Library", "Catalog", "Physical Barcoded Copies (CAT-BOOK-COPY)"),
        new("Library.Reservations", "Library", "Circulation", "Student & Staff Book Reservations"),
        new("Library.Issues", "Library", "Circulation", "Book Borrowing & Issue Register"),
        new("Library.Returns", "Library", "Circulation", "Book Return & Overdue Fine Settlement"),
        new("Library.Reports", "Library", "Reports", "9 Certified Library Reports"),

        // 13. Inventory & Assets (9)
        new("Inventory.Categories", "Inventory", "Catalog", "Item Categories Master"),
        new("Inventory.Brands", "Inventory", "Catalog", "Equipment & Item Brands"),
        new("Inventory.Suppliers", "Inventory", "Catalog", "Vendor & Supplier Directory"),
        new("Inventory.Attributes", "Inventory", "Catalog", "Item Variant Attributes"),
        new("Inventory.Items", "Inventory", "Catalog", "Stock Item Master"),
        new("Inventory.Batches", "Inventory", "Stock", "Stock Batches & Procurements"),
        new("Inventory.Transfers", "Inventory", "Movements", "Campus & Department Stock Transfers"),
        new("Inventory.Adjustments", "Inventory", "Custody", "Serialized Asset Custody (C###-I####-#####)"),
        new("Inventory.Reports", "Inventory", "Reports", "4 Certified Inventory & Asset Reports"),

        // 14. 5 Verified Unlisted RBAC Pages (5)
        new("Accounting.Depreciation", "Accounting", "Fixed Assets", "Fixed Asset Monthly Depreciation Calculator"),
        new("Management.Backups", "Management", "Operations", "Database Backup & Restore Manager"),
        new("Management.PaymentMethods", "Management", "Billing", "Payment Gateway & Merchant Account Toggles"),
        new("Students.InquirySources", "Students", "Admissions", "Student Inquiry Marketing Sources Master"),
        new("Management.EmailTemplates", "Management", "Communications", "2FA & Notification Email Templates Manager")
    };
}
