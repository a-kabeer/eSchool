# Phase 1: Complete Module Inventory

**Project**: eSchool Complete Reverse Engineering & Modernization Blueprint  
**Application**: eSchool (School Management System)  
**Target URL**: `https://demo.eschool.com.pk/`  
**Total Core Modules Discovered**: 13  
**Total Functional Features / Endpoints**: 141  

---

## 1. System Navigation Architecture

eSchool organizes its operational surface into two complementary navigation tiers:
1. **Top Horizontal Navigation Bar (`#Navigation`)**: Dropdown-driven categorized access to all core domain modules.
2. **Dashboard Grid Menu (`#DashboardGridMenu`)**: A categorized icon launchpad grouped into 13 distinct HTML `<fieldset>` containers, providing direct one-click routes to every management and reporting submodule.

---

## 2. Comprehensive Module Catalog

```
eSchool Management System
├── 1. Students (23 Submodules)
├── 2. Billing & Finance (13 Submodules)
├── 3. Examinations & Results (8 Submodules)
├── 4. Timetable & Scheduling (5 Submodules)
├── 5. eCalendar & Events (6 Submodules)
├── 6. Human Resources (HR) (26 Submodules)
├── 7. Payroll & Compensation (12 Submodules)
├── 8. Petty Cash (4 Submodules)
├── 9. Accounts & General Ledger (10 Submodules)
├── 10. Library Management (13 Submodules)
├── 11. Inventory & Assets (9 Submodules)
├── 12. System Settings (12 Submodules)
└── 13. System Management & Security (6 Submodules)
```

---

### Module 1: Students (`admin/students/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/students/`
- **Main Purpose**: Comprehensive Student Lifecycle Management from initial admission inquiry to graduation, alumni tracking, daily attendance, class transfers, and guardian communication.
- **Related Modules**: Settings (Classes, Sections, Sessions), Billing (Student Invoices), Exams (Marks & Report Cards).
- **Access Roles**: Administrator, Principal, Vice Principal, Student Affairs Officer, Receptionist.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Navigator** | `students/navigator.php` | Interactive visual hierarchy of classes, sections, and active student rosters. |
| 2 | **Inquiry Statuses** | `students/inquiry-statuses.php` | Configure status tags for prospective admissions (e.g., New, Follow-up, Dropped). |
| 3 | **Inquiries** | `students/inquiries.php` | Log and track parent inquiries, walk-ins, phone calls, and prospect conversion. |
| 4 | **Registrations** | `students/registrations.php` | Formal pre-admission registration and test scheduling before enrollment. |
| 5 | **Students** | `students/students.php` | Master student directory. Full CRUD: Add, View, Edit, Inactivate, Profile export. |
| 6 | **Attendance** | `students/attendance.php` | Daily attendance register by school, class, and section (Present, Absent, Leave, Late). |
| 7 | **Leaves** | `students/leaves.php` | Student leave application logging, approval workflows, and leave quotas. |
| 8 | **Transfer Reasons** | `students/transfer-reasons.php` | Lookup table defining permitted reasons for intra-school class/section transfers. |
| 9 | **Transfers** | `students/transfers.php` | Process student inter-class, inter-section, or inter-school transfers with audit history. |
| 10 | **Withdrawal Reasons** | `students/withdrawal-reasons.php` | Lookup table for student dropouts and school leaving reasons. |
| 11 | **Withdrawals** | `students/withdrawals.php` | Formal student exit process, clearance checklist, and School Leaving Certificate (SLC). |
| 12 | **Rejoins** | `students/rejoins.php` | Re-enrollment and activation of previously withdrawn or archived students. |
| 13 | **Graduates** | `students/graduates.php` | Alumni tracking for students completing terminal grades/classes. |
| 14 | **Promotions** | `students/promotions.php` | Bulk end-of-year academic session student promotion into next grade/section. |
| 15 | **SMS Templates** | `students/sms-templates.php` | Template manager for student-targeted SMS notifications with dynamic merge tags. |
| 16 | **SMS** | `students/sms.php` | Broadcast and transactional SMS dispatch engine for parents and guardians. |
| 17 | **Homework** | `students/homework.php` | Daily homework assignment portal with file attachments and subject taggings. |
| 18 | **Notices** | `students/notices.php` | Circulars, announcements, and policy notices targeting student cohorts. |
| 19 | **App Notifications** | `students/notifications.php` | Push notifications targeting the dedicated eSchool mobile parent/student app. |
| 20 | **Statistics** | `students/statistics.php` | Demographic breakdowns (gender ratio, class distribution, age groupings). |
| 21 | **Profile Revisions** | `students/revisions.php` | Audit trail of edits made to student personal, guardian, or academic information. |
| 22 | **Student Lists** | `students/lists.php` | Custom query builder and tabular export for class rosters and student cohorts. |
| 23 | **Reports** | `students/reports.php` | Pre-formatted printable reports (Roll numbers, ID cards, emergency contacts). |

---

### Module 2: Billing & Fee Management (`admin/billing/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/billing/`
- **Main Purpose**: Institutional revenue collection, fee structure definitions, recurring invoice generation, fee concessions/discounts, fine management, and bank reconciliation.
- **Related Modules**: Students (Fee assignments), Accounts (General Ledger sync), Settings (Bank accounts).
- **Access Roles**: Administrator, Finance Manager, Accountant, Cashier.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Navigator** | `billing/navigator.php` | Visual overview of class-wise fee collections, outstanding dues, and recovery rates. |
| 2 | **Fee Categories** | `billing/fee-categories.php` | Define fee heads (Tuition, Admission, Exam Fee, Transport, Lab Fee, Sports Fee). |
| 3 | **Bulk Fee Revision** | `billing/fee-revision.php` | Annual/session percentage or flat-rate fee revisions across classes and categories. |
| 4 | **Bulk Fee Concessions** | `billing/fee-concession.php` | Mass application of scholarships, sibling discounts, and staff child concessions. |
| 5 | **Fee Structure** | `billing/fee-structure.php` | Class-wise and session-wise standard fee schedules and installment rules. |
| 6 | **Fee Concessions** | `billing/fee-concessions.php` | Individual student scholarship, hardship, and custom discount assignments. |
| 7 | **Regular Fee** | `billing/regular-fee.php` | Monthly/term voucher batch generation engine for enrolled students. |
| 8 | **Fee Collection** | `billing/fee-collection.php` | Counter cash/cheque fee receipt recording, barcode/challan scanning, and partial payments. |
| 9 | **Custom Fee** | `billing/custom-fee.php` | Ad-hoc one-off charges (fines, uniforms, books, tour fees, damage charges). |
| 10 | **Bank Reconciliation** | `billing/bank-reconciliation.php` | Import bank scrolls/statements (1Link, KuickPay, Bank Alfalah, etc.) to match payments. |
| 11 | **Final Settlements** | `billing/final-settlements.php` | Financial clearance and security deposit refund for withdrawing students. |
| 12 | **Bank API Logs** | `billing/api-logs.php` | Audit log for automated digital banking payment gateway webhooks and queries. |
| 13 | **Reports** | `billing/reports.php` | Collection summaries, defaulters lists, aging analysis, reconciliation sheets. |

---

### Module 3: Examinations & Results (`admin/exams/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/exams/`
- **Main Purpose**: Examination scheduling, subject assignment, class teacher supervision, marks entry, grade scale definitions, and multi-term report card generation.
- **Related Modules**: Settings (Classes, Sections, Subjects), Students (Enrollments).
- **Access Roles**: Administrator, Examination Controller, Principal, Teachers.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Subjects Assignment** | `exams/subjects.php` | Map academic subjects to classes, sections, and designate subject teachers. |
| 2 | **Class Teachers** | `exams/class-teachers.php` | Assign primary class mentor/teacher responsible for attendance and comments. |
| 3 | **Grades** | `exams/grades.php` | Configure grading scales (Percentage ranges, Letter grades, Grade points, Remarks). |
| 4 | **Comments** | `exams/comments.php` | Pre-defined teacher comment library for report cards (Behavior, Academic progress). |
| 5 | **Exams** | `exams/exams.php` | Create exam terms (Midterm, Final, Monthly Test, Assessment) and datesheets. |
| 6 | **Marks** | `exams/marks.php` | Tabular marks entry interface (Theory, Practical, Viva, Grace marks, Absentee flags). |
| 7 | **Report Cards** | `exams/report-cards.php` | Printable student terminal progress cards with cumulative averages and positions. |
| 8 | **Analysis** | `exams/analysis.php` | Academic performance metrics, subject pass/fail ratios, class rankings. |

---

### Module 4: Timetable & Scheduling (`admin/timetable/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/timetable/`
- **Main Purpose**: Academic timetable creation, period timing configuration, seasonal scheduling (Summer/Winter hours), and teacher conflict-free period assignments.
- **Related Modules**: Settings (Classes, Sections, Subjects), HR (Teachers).
- **Access Roles**: Administrator, Academic Coordinator, Vice Principal.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Periods** | `timetable/periods.php` | Define period slots, break durations, assembly timings, and day schedules. |
| 2 | **Seasons** | `timetable/seasons.php` | Seasonal timings configuration (Summer vs. Winter bell schedules). |
| 3 | **Timetables** | `timetable/timetables.php` | Class-wise and section-wise period allocation grids. |
| 4 | **Scheduler** | `timetable/scheduler.php` | Teacher-wise schedule allocation, substitution planning, and conflict detection. |
| 5 | **Reports** | `timetable/reports.php` | Printable weekly class timetables, master room schedules, teacher free-period lists. |

---

### Module 5: eCalendar & Event Management (`admin/ecalendar/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/ecalendar/`
- **Main Purpose**: Institutional calendar management, academic holidays, administrative tasks, and multimedia event galleries.
- **Related Modules**: Settings (Sessions), HR (Holidays), Students (Notices).
- **Access Roles**: Administrator, Public Relations Officer, Academic Coordinator.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Calendar** | `ecalendar/calendar.php` | Interactive full-month/week/day calendar view with event pins. |
| 2 | **Categories** | `ecalendar/categories.php` | Event taxonomy (Academic, Sports, Cultural, Public Holidays, Examinations). |
| 3 | **Events** | `ecalendar/events.php` | Institutional events creation with start/end timestamps and targeted audiences. |
| 4 | **Tasks** | `ecalendar/tasks.php` | Administrative task checklist with due dates, assignees, and completion status. |
| 5 | **Photos** | `ecalendar/photos.php` | Event photo galleries and album manager. |
| 6 | **Videos** | `ecalendar/videos.php` | Video gallery manager (embedded YouTube/Vimeo or hosted links). |

---

### Module 6: Human Resources (HR) (`admin/hr/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/hr/`
- **Main Purpose**: Complete staff lifecycle management, faculty profiles, biometric/manual staff attendance, designations, leave applications, transfers, promotions, and resignations.
- **Related Modules**: Payroll, Timetable (Teachers), Settings (Schools, Sessions).
- **Access Roles**: Administrator, HR Manager, Principal.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Navigator** | `hr/navigator.php` | Departmental and branch-wise staff hierarchy and deployment tree. |
| 2 | **Employees** | `hr/employees.php` | Master employee repository (Bio-data, CNIC, qualifications, contracts, salary base). |
| 3 | **Departments** | `hr/departments.php` | Department directory (Administration, Science Faculty, IT, Accounts, Support). |
| 4 | **Groups** | `hr/groups.php` | Employee classification groups (Teaching, Non-Teaching, Contractual, Permanent). |
| 5 | **Designations** | `hr/designations.php` | Institutional job titles (Senior Teacher, Lab Assistant, Accountant, Peon). |
| 6 | **Attendance** | `hr/attendance.php` | Daily staff attendance logging, biometric clock-in sync, late arrival recording. |
| 7 | **Leave Types** | `hr/leave-types.php` | Configure leave heads (Casual, Sick, Annual, Maternity, Duty leave). |
| 8 | **Rosters** | `hr/rosters.php` | Staff shift assignments, rotational rosters, and working hour schedules. |
| 9 | **Leaves** | `hr/leaves.php` | Employee leave application entry, medical certificate attachment, supervisor approvals. |
| 10 | **Transfer Reasons** | `hr/transfer-reasons.php` | Permitted reasons for employee inter-branch or departmental transfers. |
| 11 | **Leaves Quota** | `hr/leave-quotas.php` | Annual leave entitlement allocation per designation/employee category. |
| 12 | **Transfers** | `hr/transfers.php` | Execute employee campus or departmental reassignments with effective dates. |
| 13 | **Promotions** | `hr/promotions.php` | Staff promotion logging, designation upgrades, and increment tracking. |
| 14 | **Resignation Reasons** | `hr/resignation-reasons.php` | Exit reasons lookup table (Relocation, Better Opportunity, Termination). |
| 15 | **Resignations** | `hr/resignations.php` | Resignation submission, notice period monitoring, clearance workflows. |
| 16 | **Rejoins** | `hr/rejoins.php` | Re-hiring of former employees preserving historical records. |
| 17 | **Asset Types** | `hr/asset-types.php` | Employee asset categories (Laptops, Keys, Uniforms, ID Cards). |
| 18 | **Holidays** | `hr/holidays.php` | Official institutional holiday calendar impacting staff payroll and attendance. |
| 19 | **Assets** | `hr/assets.php` | Issue and return tracking of institutional property assigned to employees. |
| 20 | **SMS Templates** | `hr/sms-templates.php` | Pre-defined SMS templates targeting teaching and non-teaching staff. |
| 21 | **SMS** | `hr/sms.php` | Bulk SMS broadcast module for staff alerts and emergency closures. |
| 22 | **Notices** | `hr/notices.php` | Internal administrative circulars and faculty policy notices. |
| 23 | **Statistics** | `hr/statistics.php` | Faculty analytics, teacher-to-student ratios, qualification distribution. |
| 24 | **App Notifications** | `hr/notifications.php` | Mobile app push notifications directed to staff accounts. |
| 25 | **Employee Lists** | `hr/lists.php` | Dynamic staff directory filters and tabular data export. |
| 26 | **Reports** | `hr/reports.php` | Staff service records, monthly attendance sheets, leave utilization registers. |

---

### Module 7: Payroll & Compensation (`admin/payroll/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/payroll/`
- **Main Purpose**: Monthly staff salary computation, statutory Pakistani deductions (EOBI, Social Security, Provident Fund, Withholding Income Tax), advances, loans, bonuses, and final settlements.
- **Related Modules**: HR (Employees, Attendance, Leaves), Accounts (Vouchers & Disbursals).
- **Access Roles**: Administrator, Finance Manager, Payroll Officer.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Social Security** | `payroll/social-security.php` | PESSI/SESSI statutory employee social security rates and contribution slabs. |
| 2 | **EOBI** | `payroll/eobi.php` | Employees' Old-Age Benefits Institution calculation formulas and employer shares. |
| 3 | **Provident Fund** | `payroll/provident-fund.php` | Contributory provident fund accounts, monthly deductions, and interest management. |
| 4 | **Income Tax** | `payroll/income-tax.php` | Federal Board of Revenue (FBR) salary tax slabs and monthly withholding deductions. |
| 5 | **Salaries** | `payroll/salaries.php` | Base salary structures, allowances (House rent, Medical, Conveyance, Special). |
| 6 | **Loans** | `payroll/loans.php` | Employee loan disbursement, repayment schedules, and monthly installment auto-deduct. |
| 7 | **Bonus Types** | `payroll/bonus-types.php` | Bonus definitions (Eid Bonus, Performance Bonus, Annual Increment). |
| 8 | **Bonuses** | `payroll/bonuses.php` | Disburse bonuses to eligible employee tiers with tax integration. |
| 9 | **Monthly Adjustments** | `payroll/monthly-adjustments.php` | Ad-hoc monthly additions/deductions (Overtime, Late arrival fines, Arrears). |
| 10 | **Payroll** | `payroll/payroll.php` | Master monthly payroll calculation, review, lock, and payslip generation engine. |
| 11 | **Final Settlement** | `payroll/final-settlement.php` | End-of-service gratuity, provident fund payout, unearned salary calculation. |
| 12 | **Reports** | `payroll/reports.php` | Bank salary transfer letters, cash payment sheets, tax deduction certificates, payslips. |

---

### Module 8: Petty Cash (`admin/pettycash/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/pettycash/`
- **Main Purpose**: Day-to-day minor cash expense tracking, imprest fund replenishments, receipt archiving, and daily cash log balancing.
- **Related Modules**: Accounts (General Ledger cash replenishment vouchers).
- **Access Roles**: Administrator, Cashier, Receptionist, Accountant.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Categories** | `pettycash/categories.php` | Expense categories (Office Refreshments, Postage, Cleaning, Minor Repairs). |
| 2 | **Receipts** | `pettycash/receipts.php` | Funds received from main bank/cash account to replenish petty cash drawer. |
| 3 | **Expenses** | `pettycash/expenses.php` | Daily cash voucher entry with date, payee, item description, category, and amount. |
| 4 | **Reports** | `pettycash/reports.php` | Daily cash closing reports, expense statements, category expense analysis. |

---

### Module 9: Accounts & General Ledger (`admin/accounts/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/accounts/`
- **Main Purpose**: Double-entry financial accounting, Chart of Accounts (COA), Journal vouchers, Bank/Cash vouchers, Ledger statements, Trial Balance, Profit & Loss, and Balance Sheet.
- **Related Modules**: Billing (Fee receipts sync), Payroll (Salary disbursals), Petty Cash.
- **Access Roles**: Administrator, Chief Accountant, Financial Auditor.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Chart of Accounts** | `accounts/accounts.php` | Multi-tier accounting tree (Assets, Liabilities, Equity, Revenue, Expenses). |
| 2 | **Vouchers** | `accounts/vouchers.php` | Voucher management: Cash Payment (CPV), Cash Receipt (CRV), Bank Payment (BPV), Bank Receipt (BRV), Journal Voucher (JV). |
| 3 | **Settings** | `accounts/settings.php` | Link automated system modules (Fee collection, Salaries) to default COA ledger codes. |
| 4 | **Ledger Statement** | `accounts/ledger-statement.php` | Comprehensive individual account ledger detailing debit, credit, and running balance. |
| 5 | **Cheque Books** | `accounts/cheque-books.php` | Bank cheque leaf management, tracking cleared, issued, and cancelled cheques. |
| 6 | **Balance Sheet** | `accounts/balance-sheet.php` | Financial position statement reporting institutional assets, liabilities, and equity. |
| 7 | **Profit & Loss** | `accounts/profit-n-loss.php` | Comprehensive income statement showing operational revenues versus expenditures. |
| 8 | **Trial Balance** | `accounts/trial-balance.php` | Periodical audit listing of all ledger debit and credit balances. |
| 9 | **General Ledger** | `accounts/general-ledger.php` | Master accounting book recording all financial transactions across all accounts. |
| 10 | **Year Closings** | `accounts/closings.php` | Fiscal year financial closing, retained earnings calculation, and opening balance rollover. |

---

### Module 10: Library Management (`admin/library/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/library/`
- **Main Purpose**: Book cataloging, multi-copy barcode tracking, author/publisher indexing, book issues/returns, student/staff library cards, and overdue fines.
- **Related Modules**: Students, HR (Staff borrowers), Billing (Overdue fines).
- **Access Roles**: Administrator, Librarian.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Navigator** | `library/navigator.php` | Visual book stack browser by genre, category, and availability status. |
| 2 | **Book Types** | `library/types.php` | Resource classification (Reference, Textbook, Novel, Magazine, Journal). |
| 3 | **Categories** | `library/categories.php` | Subject and thematic classification taxonomy (Science, History, Literature). |
| 4 | **Languages** | `library/languages.php` | Book language definitions (English, Urdu, Arabic, French). |
| 5 | **Authors** | `library/authors.php` | Master author directory with biographies and published titles. |
| 6 | **Publishers** | `library/publishers.php` | Book publishing house directory with contact details. |
| 7 | **Editions** | `library/editions.php` | Publication edition and revision year catalog. |
| 8 | **Books** | `library/books.php` | Master book titles repository (Title, ISBN, Shelf number, Edition, Author). |
| 9 | **Book Copies** | `library/copies.php` | Individual barcode/accession numbering for multiple copies of the same title. |
| 10 | **Reservations** | `library/reservations.php` | Student and faculty book hold/reservation queue. |
| 11 | **Issue Books** | `library/issues.php` | Book checkout desk with borrower identification and due-date stamps. |
| 12 | **Book Returns** | `library/returns.php` | Book return desk, condition inspection, and automated overdue fine calculation. |
| 13 | **Reports** | `library/reports.php` | Overdue books report, circulation statistics, lost/damaged books register. |

---

### Module 11: Inventory & Fixed Assets (`admin/inventory/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/inventory/`
- **Main Purpose**: Institutional stock control, laboratory apparatus, stationery, furniture, uniform/bookstore inventory, vendor tracking, and stock transfers.
- **Related Modules**: Accounts (Purchases), HR (Staff assets).
- **Access Roles**: Administrator, Inventory Storekeeper, Purchase Officer.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Categories** | `inventory/categories.php` | Stock categories (Stationery, IT Equipment, Lab Chemicals, Furniture). |
| 2 | **Brands** | `inventory/brands.php` | Equipment manufacturers and brands repository. |
| 3 | **Suppliers** | `inventory/suppliers.php` | Vendor address book, contact persons, tax registration numbers, payment terms. |
| 4 | **Attributes** | `inventory/attributes.php` | Item attributes (Size, Color, Voltage, Unit of Measurement: Pcs, Kg, Box). |
| 5 | **Items** | `inventory/items.php` | Master inventory items catalog (SKU, barcode, reorder level, unit cost). |
| 6 | **Inventory** | `inventory/inventory.php` | Current physical stock balances across campus warehouses and storerooms. |
| 7 | **Transfers** | `inventory/transfers.php` | Internal stock movement between central warehouse and department/classroom. |
| 8 | **Adjustments** | `inventory/adjustments.php` | Stock audit reconciliation, breakage, spoilage, and shrinkage write-offs. |
| 9 | **Reports** | `inventory/reports.php` | Low-stock alerts, purchase registers, consumption analysis, valuation reports. |

---

### Module 12: System Settings (`admin/settings/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/settings/`
- **Main Purpose**: Institutional master parameters, campus configurations, class/section structures, academic calendar sessions, subjects, and geopolitical dropdown lookups.
- **Related Modules**: Foundation for all student, employee, academic, and financial modules.
- **Access Roles**: Administrator, System Architect.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Schools** | `settings/schools.php` | Branch/Campus configuration (Name, code, address, contact, registration #). |
| 2 | **Classes** | `settings/classes.php` | Academic grades/classes directory (Playgroup to Grade 12 / A-Levels). |
| 3 | **Sections** | `settings/sections.php` | Class division sections (A, B, C, Rose, Tulip, Green, etc.). |
| 4 | **Sessions** | `settings/sessions.php` | Academic annual terms (e.g., 2025-2026, 2026-2027) and active status flag. |
| 5 | **Subjects** | `settings/subjects.php` | Master academic subjects directory (English, Mathematics, Physics, Quran, etc.). |
| 6 | **Religions** | `settings/religions.php` | Religion lookup options for student/staff demographic records. |
| 7 | **Nationalities** | `settings/nationalities.php` | Nationality and citizenship lookup list. |
| 8 | **Cities** | `settings/cities.php` | Cities lookup list (Lahore, Karachi, Islamabad, Rawalpindi, etc.). |
| 9 | **Towns** | `settings/towns.php` | Local towns/sub-districts for address mapping and transport routing. |
| 10 | **Occupations** | `settings/occupations.php` | Guardian occupations lookup (Doctor, Engineer, Businessman, Army, etc.). |
| 11 | **Banks** | `settings/banks.php` | Master commercial banking institutions directory in Pakistan. |
| 12 | **Bank Accounts** | `settings/bank-accounts.php` | School corporate bank accounts linked to fee collection challans and payroll. |

---

### Module 13: System Management & Security (`admin/management/`)
- **Primary Route**: `https://demo.eschool.com.pk/admin/management/`
- **Main Purpose**: Access control management, user role hierarchies, user accounts, audit logging, SMS gateway credentials, and historical session data locks.
- **Related Modules**: Applies across all modules in the platform.
- **Access Roles**: Super Administrator only.

| # | Feature / Page | Endpoint Route | Operational Purpose & CRUD Capabilities |
| :--- | :--- | :--- | :--- |
| 1 | **Settings** | `management/settings.php` | Global institutional settings (Logo, currency format, timezone, date mask). |
| 2 | **SMS Services** | `management/sms-services.php` | SMS Gateway API credentials, HTTP endpoint configurations, sender ID mask. |
| 3 | **Users Types** | `management/user-types.php` | Role-based permission matrix defining view/add/edit/delete access per module. |
| 4 | **Users** | `management/users.php` | System operator user accounts (Email, password, user type, assigned branch). |
| 5 | **Users Log** | `management/logs.php` | Audit trail of user logins, IP addresses, timestamps, and CRUD activity logs. |
| 6 | **Data Locks** | `management/locks.php` | Fiscal or academic period data freeze to prevent modification of closed records. |

---

## 3. Coverage Analysis & Unobservable Modules

### 3.1 Unobservable / Missing Modules
The initial discovery checklist anticipated several modern portals that are **not** present in this legacy administrative deployment:
1. **Public Online Registration Portal**: No public-facing self-service enrollment portal was linked directly inside the `/admin/` interface; registrations (`students/registrations.php`) appear to be handled internally by school clerks.
2. **Dedicated Parent/Student Web Portal**: The current web application is strictly an administrative management suite (`/admin/`). Parent/student interactions occur via automated SMS, push notifications to an external native mobile application (`App Notifications`), and printed paper vouchers/report cards.
3. **Third-Party LMS (Learning Management System)**: Features such as video conferencing, live quizzes, or interactive online grading are absent. The platform provides a basic homework notice board (`students/homework.php`) rather than a full SCORM/LTI LMS.

---

## 4. Visual Cross-References

- **Main Dashboard & Module Matrix**: [01-dashboard.png](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/screenshots/01-dashboard.png)
- **Executive Analytics & Widgets**: [01-dashboard-metrics.png](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/screenshots/01-dashboard-metrics.png)
