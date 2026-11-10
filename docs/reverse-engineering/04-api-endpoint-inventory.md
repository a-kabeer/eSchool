# Phase 4: API & Endpoint Architecture Inventory

**Project**: eSchool Complete Reverse Engineering & Modernization Blueprint  
**Application**: eSchool (School Management System)  
**Target URL**: `https://demo.eschool.com.pk/`  
**Endpoint Classification**: Multi-Page Procedural Handlers, Form POST Actions & Dependent AJAX Services  

---

## 1. Architectural Interface Paradigm

Unlike modern single-page applications (SPAs) that communicate with a stateless JSON REST or GraphQL API gateway, eSchool employs a **Page-Centric Endpoint Architecture**. Each functional feature is bound to a dedicated server-side PHP script that serves as both:
1. The **View Renderer** on `HTTP GET`
2. The **Transaction Controller** on `HTTP POST`

In addition, dynamic dependent selectors (such as School -> Class -> Section -> Student cascades) execute internal AJAX calls that return formatted HTML snippets (`<option>` tags or tabular `<tr>` blocks) rather than pure JSON data.

---

## 2. Global Authentication & Session Endpoints

| Endpoint Path | Method | Content Type | Parameters / Payload | Response & Behavior |
| :--- | :---: | :---: | :--- | :--- |
| `/` | `GET` | N/A | None | Issues `302 Found` redirecting to `/admin/`. |
| `/admin/index.php` | `GET` | `text/html` | None | Renders the primary administrative login container. |
| `/admin/index.php` | `POST` | `application/x-www-form-urlencoded` | `email` (string)<br>`password` (string)<br>`btnLogin` (action) | Authenticates credentials, sets `PHPSESSID` cookie, redirects to `dashboard.php`. Invalid logins return error banner in `#PageMsg`. |
| `/admin/logout.php` | `GET` | N/A | None | Destroys PHP session server-side, unsets cookies, redirects to `/admin/index.php`. |
| `/admin/my-account.php` | `GET`/`POST` | `text/html` / Form | `txtName`, `txtEmail`, `txtPassword`, `txtConfirmPassword` | Updates active administrator user credentials and preferences. |
| `/admin/dashboard.php` | `GET` | `text/html` | None | Renders Grid Menu or Executive Analytics depending on `MainDashboard` cookie. |
| `/admin/dashboard.php` | `POST` | AJAX / Form | `viewMode` (`grid` / `graphs`) | Updates user preference cookie `MainDashboard` (`0` or `1`). |

---

## 3. Subsystem API & Endpoint Catalog

### 3.1 Student Management Subsystem (`/admin/students/`)

| Endpoint Path | Primary Methods | Key Request Parameters | Operational Behavior |
| :--- | :---: | :--- | :--- |
| `students/students.php` | `GET`, `POST` | `txtFromDate`, `txtToDate`, `ddSchool`, `ddClassSection`, `ddSession`, `ddStatus`, `txtSearch`, `page` | Master student directory. GET renders filterable DataTables grid. POST handles bulk actions (`btnDeleteSelected`, `btnExport`). |
| `students/students.php#tabs-2` | `POST` | `txtName`, `ddGender`, `txtDob`, `txtBirthPlace`, `txtBformNo`, `filePicture`, `ddBloodGroup`, `ddReligion`, `ddNationality`, `ddSchool`, `ddClassSection`, `txtRegDate`, `txtJoinDate`, `txtRollNo`, `txtFatherName`, `txtFatherCnicNo`, `txtFatherMobile`, `txtMotherName`, `txtAddress`, `ddLocation`, `txtEmergencyName`, `txtEmergencyMobile` | Submits complete student admission record. Validates required fields, writes to database, triggers auto-assignment of registration number if blank. |
| `students/view-student.php?id={id}` | `GET` | `StudentId` (int) | Colorbox iframe view rendering the complete student bio-data, academic history, and fee profile. |
| `students/edit-student.php?id={id}` | `GET`, `POST` | `StudentId` (int) + Form fields | Loads existing student data into editable accordion form. Submitting updates profile and logs changes into `students/revisions.php`. |
| `students/attendance.php` | `GET`, `POST` | `ddSchool`, `ddClassSection`, `ddDate`, `ddMonth`, `ddYear`, `rdoStatus_{StudentID}` (`P`/`A`/`L`/`H`), `chkSendSms` | GET loads attendance register. POST records daily student attendance statuses. If `chkSendSms` is enabled, triggers automated SMS alert to absent students' parents. |
| `students/ajax_get_classes.php` | `GET` / `POST` | `school_id` (int) | Dependent AJAX service: returns `<option>` list of classes configured for the selected school campus. |
| `students/ajax_get_sections.php` | `GET` / `POST` | `class_id` (int) | Dependent AJAX service: returns `<option>` list of sections configured for the selected class. |
| `students/ajax_get_students.php` | `GET` / `POST` | `section_id` (int) | Dependent AJAX service: returns active student cohort roster for dropdown or attendance table. |
| `students/leaves.php` | `GET`, `POST` | `StudentId`, `txtFromDate`, `txtToDate`, `txtReason`, `fileAttachment` | Logs student leave applications with date ranges and approval status. |
| `students/transfers.php` | `GET`, `POST` | `StudentId`, `ddFromSchool`, `ddToSchool`, `ddToClassSection`, `ddReason`, `txtTransferDate` | Processes inter-campus or inter-class transfers, maintaining student academic and fee continuity. |
| `students/withdrawals.php` | `GET`, `POST` | `StudentId`, `txtWithdrawDate`, `ddReason`, `txtRemarks`, `chkIssueSLC` | Formal student withdrawal and School Leaving Certificate generation. |
| `students/rejoins.php` | `GET`, `POST` | `StudentId`, `txtRejoinDate`, `ddSchool`, `ddClassSection` | Re-activates a withdrawn student record into active student roll. |
| `students/promotions.php` | `GET`, `POST` | `ddFromSession`, `ddToSession`, `ddFromClass`, `ddToClass`, `chkStudent[]` | Bulk end-of-year academic promotion engine. Rolls students forward to next grade. |

---

### 3.2 Billing & Fee Subsystem (`/admin/billing/`)

| Endpoint Path | Primary Methods | Key Request Parameters | Operational Behavior |
| :--- | :---: | :--- | :--- |
| `billing/fee-structure.php` | `GET`, `POST` | `ddSchool`, `ddClass`, `txtEffectiveDate`, `chkFeeItem[]`, `txtAmount[]` | Manages periodic fee templates (Monthly, Once, Yearly fee heads). Supports Clone, Toggle Status, Edit, and Delete actions. |
| `billing/regular-fee.php` | `GET`, `POST` | `ddSchool`, `ddClassSection`, `ddMonth`, `ddYear`, `txtIssueDate`, `txtDueDate`, `txtValidityDate` | Batch generates monthly fee vouchers / challans for enrolled students based on active fee structures and individual concessions. |
| `billing/fee-collection.php` | `GET`, `POST` | `txtChallanNo` / `txtRegNo`, `txtReceivedDate`, `txtPaidAmount`, `ddBank`, `txtReceiptNo`, `txtLateFee` | Counter fee receipt entry. Accepts voucher number, calculates outstanding dues and fines, prints official payment receipt. |
| `billing/custom-fee.php` | `GET`, `POST` | `StudentId`, `ddFeeCategory`, `txtAmount`, `txtDueDate`, `txtDescription` | Dispatches ad-hoc one-off charges to specific students (fines, uniforms, books, trips). |
| `billing/bank-reconciliation.php` | `GET`, `POST` | `fileBankStatement`, `ddBank`, `txtStatementDate` | Imports electronic banking payment scrolls (1Link, KuickPay, Bank Alfalah) to automatically clear matching pending vouchers. |
| `billing/final-settlements.php` | `GET`, `POST` | `StudentId`, `txtSettlementDate`, `txtSecurityRefund`, `txtOutstandingDues` | Computes final financial clearance and security deposit refund for departing students. |
| `billing/api-logs.php` | `GET` | `txtFromDate`, `txtToDate`, `txtTransactionId`, `txtStatus` | Displays incoming webhook query logs from integrated banking payment gateways. |

---

### 3.3 Examinations Subsystem (`/admin/exams/`)

| Endpoint Path | Primary Methods | Key Request Parameters | Operational Behavior |
| :--- | :---: | :--- | :--- |
| `exams/exams.php` | `GET`, `POST` | `txtExamTitle`, `ddSession`, `txtStartDate`, `txtEndDate`, `ddExamType` | Creates academic terms (Midterm, Final Exam, Monthly Test). |
| `exams/subjects.php` | `GET`, `POST` | `ddClassSection`, `ddSubject`, `ddTeacher`, `txtTotalMarks`, `txtPassingMarks` | Maps subjects to classes and designates examining faculty. |
| `exams/marks.php` | `GET`, `POST` | `ddExam`, `ddClassSection`, `ddSubject`, `txtTheoryMarks[]`, `txtPracticalMarks[]`, `chkAbsent[]` | Matrix marks entry grid. Calculates total, percentage, grade, and status per student. |
| `exams/grades.php` | `GET`, `POST` | `txtGradeName`, `txtMinPercent`, `txtMaxPercent`, `txtGradePoint`, `txtRemarks` | Defines grading scale slabs (e.g. A+, A, B, C, D, F). |
| `exams/report-cards.php` | `GET` | `ExamId`, `ClassSectionId`, `StudentId` | Generates printable high-fidelity student terminal progress reports / report cards. |

---

### 3.4 Human Resources & Payroll Subsystem (`/admin/hr/` & `/admin/payroll/`)

| Endpoint Path | Primary Methods | Key Request Parameters | Operational Behavior |
| :--- | :---: | :--- | :--- |
| `hr/employees.php` | `GET`, `POST` | `txtName`, `txtCnic`, `ddDepartment`, `ddDesignation`, `ddGroup`, `txtBasicSalary`, `txtJoiningDate` | Master staff directory. Manages faculty and non-teaching personnel records. |
| `hr/attendance.php` | `GET`, `POST` | `ddDepartment`, `ddDate`, `rdoStatus_{EmpID}`, `txtTimeIn`, `txtTimeOut` | Staff daily attendance logging with late arrival and overtime timestamps. |
| `payroll/salaries.php` | `GET`, `POST` | `EmployeeId`, `txtBasic`, `txtHouseRent`, `txtMedical`, `txtConveyance`, `txtSpecialAllowance` | Configures employee base salary packages and compensation allowances. |
| `payroll/payroll.php` | `GET`, `POST` | `ddMonth`, `ddYear`, `ddDepartment`, `btnCalculatePayroll`, `btnLockPayroll` | Calculates monthly salaries factoring in attendance, leaves, loans, EOBI, and tax withholding. Generates printable bank advice and payslips. |
| `payroll/loans.php` | `GET`, `POST` | `EmployeeId`, `txtLoanAmount`, `txtMonthlyDeduction`, `txtStartDate` | Staff loan disbursement and monthly installment tracking. |

---

### 3.5 Accounts Subsystem (`/admin/accounts/`)

| Endpoint Path | Primary Methods | Key Request Parameters | Operational Behavior |
| :--- | :---: | :--- | :--- |
| `accounts/accounts.php` | `GET`, `POST` | `txtAccountCode`, `txtAccountTitle`, `ddAccountType`, `ddParentAccount` | Manages Chart of Accounts tree (Assets, Liabilities, Equity, Revenue, Expense). |
| `accounts/vouchers.php` | `GET`, `POST` | `ddVoucherType` (CPV/BPV/CRV/BRV/JV), `txtVoucherDate`, `ddDebitAccount[]`, `ddCreditAccount[]`, `txtDebitAmount[]`, `txtCreditAmount[]`, `txtNarration` | Multi-line double-entry voucher entry. Enforces debit equals credit validation prior to posting. |
| `accounts/ledger-statement.php`| `GET` | `ddAccount`, `txtFromDate`, `txtToDate` | Generates individual account ledger statement showing running debit/credit balance. |
| `accounts/trial-balance.php` | `GET` | `ddSession`, `txtAsOfDate` | Audit report listing closing debit and credit balances for all active ledger accounts. |

---

## 4. Proposed Modern RESTful API Mapping

For the rebuild application, these procedural PHP scripts will be replaced by standardized RESTful resource routes:

```
Legacy PHP Script                           Proposed Modern RESTful Route
-------------------------------------------------------------------------
admin/students/students.php                 GET    /api/v1/students
admin/students/students.php (Add)           POST   /api/v1/students
admin/students/students.php?id={id}         GET    /api/v1/students/{id}
admin/students/edit-student.php?id={id}     PUT    /api/v1/students/{id}
admin/students/attendance.php               POST   /api/v1/students/attendance
admin/billing/fee-structure.php             GET    /api/v1/billing/fee-structures
admin/billing/fee-structure.php (Add)       POST   /api/v1/billing/fee-structures
admin/billing/regular-fee.php (Generate)    POST   /api/v1/billing/invoices/generate-batch
admin/billing/fee-collection.php (Pay)      POST   /api/v1/billing/invoices/{id}/payments
admin/exams/marks.php                       POST   /api/v1/exams/{id}/marks
admin/payroll/payroll.php                   POST   /api/v1/payroll/runs
admin/accounts/vouchers.php                 POST   /api/v1/accounts/vouchers
admin/management/users.php                  GET    /api/v1/admin/users
```
