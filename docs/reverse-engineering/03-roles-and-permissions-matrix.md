# Phase 3: Roles and Permissions Matrix

**Project**: eSchool Complete Reverse Engineering & Modernization Blueprint  
**Application**: eSchool (School Management System)  
**Target URL**: `https://demo.eschool.com.pk/admin/management/user-types.php`  
**Evidence Screenshot**: [03-role-permissions-matrix.png](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/screenshots/03-role-permissions-matrix.png)  

---

## 1. Access Control Model Overview

eSchool implements a classic **Role-Based Access Control (RBAC)** architecture augmented with a granular **Page-Level Permission Matrix**. 

The security hierarchy is structured as follows:
1. **User Types (Roles)**: Pre-defined administrative profiles created in `management/user-types.php`.
2. **Permission Matrix (`view-user-type.php?TypeId=ID`)**: A 2-dimensional security matrix mapping each system section and page against 5 distinct operational privileges:
   - **View** (`R` - Read/Inspect list and detail records)
   - **Add** (`C` - Create new records)
   - **Edit** (`U` - Update/modify existing records)
   - **Delete** (`D` - Soft or hard removal of records)
   - **Export** (`X` - Export tabular datasets to CSV/Excel or trigger print view)
   - **ALL** (`*` - Master wildcard granting all 5 privileges for that specific page)
3. **User Accounts (`management/users.php`)**: Operator accounts assigned to a single User Type and optionally bound to a specific school campus/branch.

---

## 2. Identified User Roles (User Types)

The system currently configures 7 active user types:

| Role ID | Role Title | Status | Typical Assignee & Administrative Scope |
| :---: | :--- | :---: | :--- |
| **1** | **Super Administrator** | Active | Software owners, chief system administrators. Complete, unrestricted access across all 13 modules, global configuration, data locks, and user management. |
| **2** | **Administrator** | Active | School Principals, Headmasters, Directors. Full operational command across academic, financial, HR, and reporting workflows. |
| **28** | **Coordinator** | Active | Section Heads, Academic Coordinators. Focused on curriculum, timetable, period scheduling, teacher allocations, student attendance, and examinations. |
| **34** | **Acountant** | Active | Chief Accountants, Finance Managers, Bursars. Full access to double-entry general ledger, vouchers, fee structure, fee collection, payroll, and petty cash. |
| **38** | **Admin** | Active | Branch Administrators / Assistant Registrars with delegated campus management duties. |
| **39** | **administration** | Active | Front-desk staff, admissions clerks, and student affairs officers managing daily records. |
| **40** | **exam** | Active | Examination Controllers, marks compilation staff, datesheet and report card operators. |

---

## 3. High-Level Role Permission Matrix

The following matrix documents observed and configured functional boundaries across key administrative roles:

| Module Section | Functional Area | Super Admin | Administrator | Acountant | Coordinator | Exam Officer | Administration |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | Metrics, Graphs & Grid Launchpad | Full | Full | Full | View Only | View Only | View Only |
| **Students** | Inquiries & Registrations | Full | Full | View Only | Full | No Access | Full |
| **Students** | Student Directory & Profiles | Full | Full | View Only | Full | View Only | Full |
| **Students** | Daily Attendance & Leaves | Full | Full | View Only | Full | No Access | Full |
| **Students** | Promotions, Transfers, Rejoins | Full | Full | No Access | Full | No Access | Edit/View |
| **Students** | SMS Broadcasts & Homework | Full | Full | No Access | Full | No Access | Full |
| **Billing** | Fee Structure & Categories | Full | Full | Full | No Access | No Access | View Only |
| **Billing** | Regular Fee Voucher Generation | Full | Full | Full | No Access | No Access | No Access |
| **Billing** | Counter Fee Collection & Receipts | Full | Full | Full | No Access | No Access | Add/View |
| **Billing** | Bank Reconciliation & Settlement | Full | Full | Full | No Access | No Access | No Access |
| **Exams** | Subject Assignment & Teachers | Full | Full | No Access | Full | Full | View Only |
| **Exams** | Exam Scheduling & Grades | Full | Full | No Access | Full | Full | View Only |
| **Exams** | Marks Entry & Report Cards | Full | Full | No Access | Full | Full | View Only |
| **Timetable** | Periods, Seasons & Scheduler | Full | Full | No Access | Full | No Access | View Only |
| **eCalendar** | Events, Tasks & Photos | Full | Full | View Only | Full | View Only | View Only |
| **HR** | Staff Directory & Contracts | Full | Full | View Only | View Only | No Access | View Only |
| **HR** | Staff Attendance & Rosters | Full | Full | View Only | Full | No Access | View Only |
| **HR** | Leaves, Transfers, Resignations | Full | Full | View Only | Edit/View | No Access | View Only |
| **Payroll** | Salary Structures & Slabs | Full | Full | Full | No Access | No Access | No Access |
| **Payroll** | Monthly Payroll Calculation | Full | Full | Full | No Access | No Access | No Access |
| **Payroll** | Employee Loans & Bonuses | Full | Full | Full | No Access | No Access | No Access |
| **Petty Cash** | Receipts & Daily Expenses | Full | Full | Full | No Access | No Access | Add/View |
| **Accounts** | Chart of Accounts | Full | Full | Full | No Access | No Access | No Access |
| **Accounts** | Vouchers (CPV, BPV, CRV, JV) | Full | Full | Full | No Access | No Access | No Access |
| **Accounts** | Balance Sheet, P&L, Trial Balance | Full | Full | Full | No Access | No Access | No Access |
| **Library** | Book Catalog, Copies & Issues | Full | Full | No Access | View Only | No Access | View Only |
| **Inventory** | Items, Balances & Transfers | Full | Full | View Only | No Access | No Access | View Only |
| **Settings** | Schools, Classes, Sessions | Full | Full | View Only | View Only | View Only | View Only |
| **Management** | User Accounts & Permissions | Full | Full | No Access | No Access | No Access | No Access |
| **Management** | Data Locks & Security Logs | Full | Full | No Access | No Access | No Access | No Access |

*Legend*:
- **Full**: Full CRUDX permissions (`View`, `Add`, `Edit`, `Delete`, `Export`)
- **View Only**: Read and inspect access only (`View`, `Export`)
- **Add/View**: Transactional entry and receipt printing without editing past posted vouchers
- **No Access**: Module hidden from navigation; direct URL access triggers security redirect or access denied

---

## 4. Deep Inspection of Accountant Role (`TypeId=34`)

Inspection of `view-user-type.php?TypeId=34` confirms how granular security is applied to specialized financial operators:

1. **Accounts Module**:
   - `Chart of Accounts`: `View: YES`, `Add: YES`, `Edit: YES`, `Delete: YES`, `Export: YES` (ALL)
   - `Vouchers`: `View: YES`, `Add: YES`, `Edit: YES`, `Delete: YES`, `Export: YES` (ALL)
   - `Depreciation`: `View: YES`, `Add: YES`, `Edit: YES`, `Delete: YES`, `Export: YES` (ALL)
   - `Ledger Statement`: `View: YES`, `Export: YES`
   - `Trial Balance`: `View: YES`, `Export: YES`
   - `Profit & Loss`: `View: YES`, `Export: YES`
   - `Balance Sheet`: `View: YES`, `Export: YES`
   - `Year Closings`: `View: YES`, `Add: YES`, `Edit: NO`, `Delete: NO`

2. **Billing Module**:
   - `Fee Categories`: `View: YES`, `Add: YES`, `Edit: YES`, `Delete: NO`, `Export: YES`
   - `Fee Structure`: `View: YES`, `Add: YES`, `Edit: YES`, `Delete: NO`, `Export: YES`
   - `Regular Fee`: `View: YES`, `Add: YES`, `Edit: YES`, `Delete: NO`, `Export: YES`
   - `Fee Collection`: `View: YES`, `Add: YES`, `Edit: YES`, `Delete: NO`, `Export: YES`
   - `Bank Reconciliation`: `View: YES`, `Add: YES`, `Edit: YES`, `Delete: NO`, `Export: YES`
   - `Final Settlements`: `View: YES`, `Add: YES`, `Edit: YES`, `Delete: NO`, `Export: YES`

3. **Academic Modules (Exams, Timetable, eCalendar)**:
   - All permissions explicitly `DISABLED / UNCHECKED`. The accountant interface hides non-financial submodules to prevent unauthorized grading or scheduling modifications.

---

## 5. Security & Permission Architecture Gaps

During reverse engineering of the role system, several architectural weaknesses were identified:

1. **Client-Side Enforced View States**: Forms rendered in iframe popups (`view-user-type.php`) rely heavily on disabled HTML attributes (`disabled="disabled"`) on input checkboxes. In modern architectures, authorization must be validated strictly on the server/API layer.
2. **Missing Granular Field-Level Permissions**: The current system governs access at the **Page** level. It lacks fine-grained field-level security (e.g., allowing an accountant to view student contact details but masking national identity CNIC numbers).
3. **No Dynamic Policy-Based Access Control (PBAC / ABAC)**: Branch filtering is handled via session variables rather than contextual attribute-based evaluation (e.g., *Can user edit records in Branch 2 if Session is Closed?*).
4. **Audit Trail Limitations**: While `management/logs.php` tracks login attempts and basic URL visits, it lacks diff-level data change auditing (capturing before/after JSON snapshots of edited student or ledger records).
