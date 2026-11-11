# eSchool v2 — Product Requirements Document (PRD) & User Roles Matrix

> **Provenance:** Synthesized from Phase 1A Web Admin Audit (`reverse-engineering.rar`), Live CDP Gap-Closure Capture (`docs/raw/gap-batch1..4.json`, `docs/raw/gap-followup.json`), and Phase 1B Mobile APK Decompilation (`docs/03-PHASE-1B-MOBILE-API-INVENTORY.md`).  
> **Target Stack (Locked):**
> - **Initial Release Web Portals (`3` SPAs):** Admin Portal, Parent Portal, and Teacher Portal built with **React + TypeScript + Vite + React Router + Tailwind CSS + Lucide React + Recharts**. *(Native mobile apps are deferred to a future phase and will consume the same shared backend REST API).*
> - **Shared Backend API:** **ASP.NET Core (.NET 10) Modular Monolith + C# + EF Core 10 + PostgreSQL 17 + JWT Bearer Authentication + ASP.NET Core Authorization + OpenAPI + API Versioning (`/api/v1/...`)**.
> - **Execution Guardrail:** Pure specification document (`HOLD` on application/implementation code active). Unverified server-side internals are explicitly marked `[VERIFY]`.

---

## 1. Product Vision & Multi-Portal Scope

**eSchool v2** is a multi-tenant, multi-campus School Management ERP unifying **14 Web Admin operational modules** (`Dashboard`, `Management`, `Settings`, `Students`, `Billing`, `Exams`, `Timetable`, `eCalendar`, `HR`, `Payroll`, `Petty Cash`, `Accounts`, `Library`, `Inventory`) with **dedicated Parent and Teacher Web Portals** (replacing legacy `/parent/`, `/teacher/`, and native Android APK split endpoints) on a single **ASP.NET Core (.NET 10)** API surface.

### 1.1 Initial Release Scope (Day 1)
1. **Admin Web Portal (`apps/admin-portal`)**: Complete replacement of `/admin/` PHP SSR + Colorbox iframes with responsive React SPA (`375px` mobile through `1440px+` desktop), fixing all `25+` confirmed legacy runtime, JS validation, security, and financial integrity bugs.
2. **Parent Web Portal (`apps/parent-portal`)**: Replaces legacy `/parent/` web stub and achieves full feature parity with `eSchool for Parents` APK (`v1.0.20.10.2026`), including multi-child switching, profile revision requests, attendance (daily & subject-wise), fee challan PDFs & online payment gateways, exams/report cards, homework/classwork, weekly plans, daily reports, timetable, documents, behavior comments, leave applications, PTM chat, notices, events, blog, and social feed.
3. **Teacher Web Portal (`apps/teacher-portal`)**: Replaces legacy `/teacher/` web stub and achieves full feature parity with `eSchool for Teachers` APK (`v1.0.07.10.2026`), including assigned classes & student rosters, attendance marking (`AttendanceTime 0|1|2`), homework CRUD with multi-file attachments & grading/comments, teacher timetable, lesson plans, self-attendance, leave applications & quota balances, payroll & PDF salary slips, loans & EMI schedules, appraisals, notices, events, blog, and social feed.
4. **Mobile-Ready Shared API (`/api/v1/...`)**: Clean OpenAPI-documented JWT Bearer endpoints shared by all 3 React portals on Day 1 and ready for future Android/iOS mobile clients without breaking changes.

---

## 2. User Personas & Portal Access Model

| Persona | Portal(s) | Primary Responsibilities & Value | Legacy Mapping |
| :--- | :--- | :--- | :--- |
| **Super Administrator / Tenant Owner** | Admin | Full cross-campus configuration, System Settings, SMS Gateways, Payment Methods, Backups, RBAC User Types & Users, Data Locks, Financial Year Closings | `TypeId = 1` (`Super Administrator`) |
| **Campus Administrator / Principal** | Admin | Campus-scoped admissions, student/HR 360 profiles, attendance, billing oversight, notices/SMS/push communications, timetable & calendar management | `TypeId = 2` (`Administrator`) + custom `cbSchools[]` |
| **Accountant / Bursar** | Admin | Chart of Accounts, Double-Entry Vouchers (`JV/PV/RV/CV`), Cheque Books, Fee Categories, Fee Collection, Bank Reconciliation, Financial Statements (`TB/P&L/BS/GL`), Petty Cash | `TypeId = 34` (`Acountant`), `38`, `39` |
| **Exam Coordinator** | Admin | Subject-teacher assignment, Class Teachers, Grading Scales, Report Card Comments, Exam Master (`Marking`/`Published`), Marks Entry, Report Cards & Grade Analysis | `TypeId = 40` (`exam`), `28` (`Coordinator`) |
| **HR & Payroll Officer** | Admin | Employee onboarding (`48` fields), Shift Rosters, Leave Types & Quotas, Transfers/Promotions/Resignations/Rejoins, Statutory Slabs (`SS/EOBI/PF/Tax`), Loans, Payroll Generation & Final Settlement | Granular `HR` & `Payroll` RBAC permissions |
| **Librarian / Store Keeper** | Admin | Barcode book catalog (`CAT-BOOK-COPY`), Reservations, Issue/Return & Overdue Fines, Stock Batches, Campus/Class Transfers, Serialized Asset Adjustments | Granular `Library` & `Inventory` RBAC permissions |
| **Teacher / Faculty** | Teacher (Web) | View assigned classes/rosters, mark daily/subject attendance, publish/grade homework, view timetable & lesson plans, view self-attendance, apply for leaves, view payslips/loans/appraisals | `/teacher/` + `eSchool for Teachers` APK (`Gender`, `EmployeeId`, `Mobile`) |
| **Parent / Guardian (`Father` / `Mother`)** | Parent (Web) | Multi-child switcher, view/submit profile revisions, view attendance/exams/report cards/homework/timetable/documents/comments, download fee challans & pay online, apply for leaves & PTM requests, read notices/events/blog | `/parent/` + `eSchool for Parents` APK (`Type: Father|Mother`, `AccountId`) |
| **Student (Read-Only Future/Optional)** | Parent (Shared) | Legacy `students/students.php` stores `txtSchoolEmail` / `txtSchoolPassword`, though `/student/` returns `404` on demo. Phase 2 models Student self-service cleanly as optional restricted scope `[VERIFY]`. | `STUDENTS` school credentials |

---

## 3. Core User Stories & Acceptance Criteria

### 3.1 Authentication, Onboarding & Security
- **US-AUTH-01 (Admin Login & TOTP 2FA):** As an Admin user, I sign in with Email + Password (protected against bots on public login) and verify my 6-digit TOTP authenticator code (or email OTP fallback when enabled) to receive short-lived JWT Access + Refresh tokens.
  - *Acceptance:* Password policy supports configurable expiry (`0|30|60|90` days) and password reuse history (`0|1|2|3` prior hashes). Plaintext `school_password` exports are strictly prohibited (`Argon2id` / `bcrypt` hashing enforced).
- **US-AUTH-02 (Parent/Teacher Web & Self-Onboarding PIN Flow):** As a Parent (`Father`/`Mother`) or Teacher (`Male`/`Female`), I can log in with Username + Password (`/parent/` or `/teacher/`), reset a forgotten password, or self-onboard via the 4-step PIN verification flow (`School Selection -> Generate PIN [max 5/day] -> Verify 6-digit PIN -> Set Password`) without exposing raw `AccountId` parameters.
  - *Acceptance:* Legacy `AccountId`-in-body trust is eliminated; all portal requests require `Authorization: Bearer <JWT>`. Client PIN rate-limit bug (`"dd-MM-yyyyy"`) is moved to server-side sliding-window throttling (`5/day` per phone/tenant).

### 3.2 Student Lifecycle, Admissions & Parent Revisions
- **US-STU-01 (Admissions Funnel):** Admissions staff log `Inquiry` -> convert to `Registration` (auto/manual Reg #, printable `Registration Fee Receipt` A4 PDF) -> approve (`New/Processing/Hold/Approved/Rejected`) with target `Session`, `Section`, and `Joining Date` to enroll the student.
- **US-STU-02 (Student 360 & Parent Revision Diff Queue):** Staff inspect all **9 Student 360 tabs** (`Profile`, `Siblings`, `Attendance`, `Leaves`, `Exams`, `Billing`, `Documents`, `Comments` with `Nature` `-2..2` badges, `History`) and **8 quick actions**, and selectively approve/reject field-level changes submitted by Parents (`students/revisions.php`).
- **US-STU-03 (Daily & Subject-Wise Attendance):** Staff and Teachers mark Daily (`P/A/L/H` + `TimeIn`/`TimeOut`) or Subject-wise attendance (`AttendanceTime 0|1|2`), locking pre-approved `L` (Leave) cells, enforcing Data Locks, and optionally triggering Father/Mother absentee SMS/Push notifications.

### 3.3 Billing, Fee Collection & Bank/Online Payments
- **US-BILL-01 (Fee Engine & Challans):** Finance staff configure `Monthly`/`Once`/`Yearly` taxable Fee Categories, campus/class Fee Structures, `%`/fixed Concession Templates, and generate Regular or Custom fee challans (with `TaxRate`, `AdvanceIncomeTax` threshold, and `1..6` installment splitting via New Vouchers or Next Bill) rendering a 3-copy (`BANK COPY`, `SCHOOL COPY`, `PARENT'S COPY`) A4 PDF.
- **US-BILL-02 (Multi-Channel Collection & Bank APIs):** Staff collect fees via Cash (`CA`), Bank Counter (`BC`), Bank Transfer (`BT`), Cheque (`CH`), or Online (`OL`), applying capped late-payment fines (`LateFeeFine * days <= MaxFeeFine`), optional partial payments (`ddAcceptPartialFee`), bulk bank Excel reconciliation, and live Bank Billing API webhooks (`Bill Inquiry`, `Bill Payment`, `Bill Reversal` — e.g., Bank Al Habib, Meezan Bank) plus Parent Online Checkout (`Alpha`, `Card`, `JazzCash`, `Blinq`, `KuickPay`).

### 3.4 Academics, Exams, Timetable & eCalendar
- **US-ACAD-01 (Exams & Grading):** Exam staff map Class/Section (and elective Student) Subjects & Teachers (`Lab Fee`, `Additional Course`), configure `%` Grade Scales and merge-tag Comment Templates, toggle exam `Marking` and `Published (On Parents App & Portal)`, enter marks (bulk Total Marks, Absent toggle), and export Class Marks Sheets, Student Report Cards, and 3D/Pie Grade Analysis.
- **US-ACAD-02 (Timetable & eCalendar):** Coordinators define Period Slots, 7-day Seasons, and drag-and-drop Schedules with real-time server teacher/slot clash rejection (`update-schedule`), plus Event Calendar (Month/Week/Day views, fixing the `Dec 1999` bug), Tasks, Photo Albums, and Video Galleries.

### 3.5 HR, Payroll, Accounting, Petty Cash, Library & Inventory
- **US-HR-01 (HR 360 & Policy-Driven Leaves):** HR manages 48-column Employee profiles (excluding plaintext passwords), 11-tab HR 360 views, biometric `AttendanceId`/`ThumbCode` attendance, Regular/Seasonal 7-day Shift Rosters, rich Leave Type policies (weightage `1.0`/`0.5`, eligibility, sandwich, carry-forward, proration), Leave Quotas, Transfers, Promotions, Resignations, Rejoins, and Holidays.
- **US-PAY-01 (Statutory Payroll & Final Settlement):** Payroll generates monthly runs applying `Basic = Gross / 1.10`, `Medical = Gross - Basic`, Pakistani progressive `Income Tax` + surcharge slabs, `EOBI` (with age exemptions), `Provident Fund` brackets, `Social Security` bands (enforcing `Max >= Min`), Loan EMIs (remainder-first on EMI #1, `Skip Loan` flag), Bonuses, Monthly Adjustments, PDF Pay Slips, and Final Settlements for resigned employees.
- **US-ACC-01 (Double-Entry GL & Petty Cash):** Accountants maintain 3-tier Chart of Accounts (`Group -> Head -> Ledger`), balanced `JV`/`PV`/`RV`/`CV` vouchers (`Total DR == Total CR`), Cheque Books, 5-tab ERP-to-GL Settings, Financial Year Closings, Ledger Statements with 6 source drilldowns, Trial Balance, P&L, Balance Sheet, Asset Depreciation (`accounts/depreciation.php`), and Petty Cash Receipts/Expenses.
- **US-OPS-01 (Library & Unified Assets/Inventory):** Librarians run `CAT-BOOK-COPY` barcoded circulation (`max_books=2`, `issue_days=3`, `50/day` capped at `500`). Operations manages hierarchical Inventory items, stock batches (`C###-I####-#####`), campus/class transfers, and unified employee/campus asset custody (retiring the disconnected `hr/assets.php` free-text split).

---

## 4. Complete RBAC & Authorization Matrix

### 4.1 Legacy Admin User Types (`management/user-types.php`)
| `TypeId` | Role Title | Status | Legacy Page Access (of 152) | Observed Scope & Notes |
| :---: | :--- | :---: | :---: | :--- |
| `1` | `Super Administrator` | Active | `150 / 152` | Full `VAEDX` on 148; `V`-only on `Management/Settings` & `SMS Services`; `NONE` on `Backups` & `Email Templates` |
| `2` | `Administrator` *(Demo Account)* | Active | `149 / 152` | Full `VAEDX` on 146; `V`-only on `User Types`, `Users`, `Schools`; `NONE` on `Settings`, `Email Templates`, `Payment Methods`; runtime demo guards also block `Edit` on `Locks`, `Classes/Sections/Sessions/Banks`, `Accounts Settings` Tabs 1–3, `HR Edit/Import`, `Payroll Import` |
| `34` | `Acountant` *(sic)* | Active | `11 / 152` | Full `VAEDX` on 10 `Accounts` pages (except `Accounts/Settings`) + `Billing/Fee Categories` |
| `38` | `Admin` | Active | `1 / 152` | `Accounts/Chart of Accounts` (`VAEDX`) only |
| `39` | `administration` | Active | `1 / 152` | `Accounts/Chart of Accounts` (`VAEX`, no Delete) only |
| `28` | `Coordinator` | Active | `0 / 152` | Zero pages assigned (template role) |
| `40` | `exam` | Active | `8 / 152` | Full `VAEDX` on all 8 `Exams` pages only |

### 4.2 Granular Permission Architecture (5+1 Rights + Per-User Overrides)
Every Admin permission entry uses **5 granular flags** (`View`, `Add`, `Edit`, `Delete`, `Export`, where selecting `A/E/D/X` auto-grants `View`; serialized as `"Y,Y,Y,Y,Y"` in legacy `#Rights{i}`) across **152 rows**:
- **147 Navigation Grid Pages** across 13 functional modules (`Management [6]`, `Settings [12]`, `Students [23]`, `Billing [13]`, `Exams [8]`, `Timetable [5]`, `eCalendar [6]`, `HR [26]`, `Payroll [12]`, `Petty Cash [4]`, `Accounts [10]`, `Library [13]`, `Inventory [9]`).
- **5 Unlisted RBAC Pages (Verified via Live Probe):**
  1. `Accounts :: Depreciation` (`/admin/accounts/depreciation.php` — `HTTP 200`, RBAC-protected; full JS captured for `%` & Expense Ledger mapping + monthly depreciation batch voucher generation).
  2. `Management :: Backups` (`/admin/management/backups.php` — `HTTP 200`, RBAC-protected; DB backup, restore, delete).
  3. `Management :: Payment Methods` (`/admin/management/payment-methods.php` — `HTTP 200`, RBAC-protected; payment mode config/toggle).
  4. `Students :: Inquiry Sources` (`/admin/students/inquiry-sources.php` — `HTTP 200`, RBAC-protected; TableDnD lookup CRUD).
  5. `Management :: Email Templates` (`/admin/management/email-templates.php` — **`HTTP 404`** on legacy server; implement cleanly as an active `.NET 10` template manager for 2FA/Onboarding/Password Reset emails).

**Per-User Override Scopes (`management/view-user.php`):**
1. **Campus Scope (`cbSchools[]`):** Restricts user queries/actions to assigned `SchoolId`s (`USER_SCHOOLS`).
2. **Dashboard Visibility (`cbDashboards[6]`):** `Main Dashboard`, `Students`, `Billing`, `HR`, `Payroll`, `Petty Cash`.
3. **Misc Non-CRUD Feature Flags (`cbMiscRights[8]`):**
   - `RegistrationStatus` (approve/convert registrations)
   - `RegistrationNo` (manual registration number override)
   - `DueDateRevision` (single bill due-date edit)
   - `BulkDueDateRevision` (bulk due-date update)
   - `BulkFeeRevision` (bulk fee line-item adjustment / Excel import)
   - `EmployeeId` (manual employee code override)
   - `AttendanceApp` (mobile/biometric attendance app linkage)
   - `ReRegister` (re-register withdrawn/former students)
4. **Student 360 Tab Visibility (`cbStudentTabs[8]`):** `Profile`, `Siblings`, `Attendance`, `Leaves`, `Exams`, `Billing`, `Documents`, `Comments` *(plus fixed `History` tab)*.
5. **HR 360 Tab Visibility (`cbEmployeeTabs[10]`):** `Profile`, `Subjects`, `Education`, `Experience`, `Attendance`, `Leaves`, `Children`, `Salary`, `Documents`, `Comments` *(plus fixed `History` tab)*.

### 4.3 Period & Section Data Locks (`41` Locks — `management/locks.php`)
Admins configure cutoff freeze dates (`YYYY-MM-DD`) per business section (`Inquiries`, `Registrations`, `Students Joining`, `Student Attendance`, `Student Leaves`, `Student Withdrawals`, `Student Transfers`, `Student Rejoins`, `Student Graduations`, `Fee Structure`, `Regular Fee`, `Fee Collection`, `Vouchers`, `Payroll`, etc. — `41` unique sections). Both backend API mutations and frontend datepickers reject transactions on or before the active `LockDate` (`<= minDate`).

---

## 5. Tenant Feature Flags (Replacing Legacy Hardcoded Host Checks)

All `12` hardcoded `App.sServer.contains(...)` domain switches found in Phase 1B APKs plus `schools.php` flags (`Blog`, `Events`, `Facebook`, `Edit`) and `management/settings.php` hidden flags (`WebsiteMode`, `ddSefMode`, `ddStudentsSaturday`, `ddEmployeesSaturday`, `ddStudentsAttendance`, `ddSubjectWiseAttendance`) **must** be unified into database-driven `TENANT_FEATURE_FLAGS` delivered in JWT claims / `/api/v1/tenant/capabilities`:

| Feature Key | Type | Default | Legacy Source Replaced |
| :--- | :---: | :---: | :--- |
| `portal.parent.blog` / `events` / `facebook` / `profile_edit` | `bool` | `true` | `login.php` & `students.php` flags (`Y`/`N`) |
| `portal.parent.ptm_enabled` | `bool` | `false` | `unity.eschool.pk` host gate |
| `portal.parent.weekly_plans_enabled` | `bool` | `false` | `esc.eschool.pk` host gate |
| `portal.parent.daily_report_enabled` | `bool` | `false` | `noon.eschool.pk` / `babulilm.eschool.pk` gate |
| `portal.parent.homework_label` | `enum` | `Homework` | `babulilm.eschool.pk` (`"Classwork"`) |
| `portal.parent.subject_wise_attendance` | `bool` | `false` | `ahp.eschool.pk` & `ddSubjectWiseAttendance` |
| `portal.parent.signup_username_mode` | `enum` | `Mobile` | `isc.eschool.pk` (`CNIC` vs `Mobile`) |
| `portal.parent.billing_summary_mode` | `enum` | `None` | `cis.eschool.pk` (`DefaultPayable`) / `oneiro.eschool.pk` (`AdvanceFee`) |
| `portal.parent.online_payment_enabled` | `bool` | `true` | `eschool.com.pk` & `OL` method in settings |
| `portal.shared.timetable_sunday_enabled` | `bool` | `false` | `taaleem.eschool.pk` (`Day7` SUN tab) |
| `portal.teacher.appraisals_enabled` | `bool` | `false` | `aas.eschool.pk` host gate |
| `portal.teacher.lesson_plans_enabled` | `bool` | `false` | `anes.eschool.pk` host gate |
| `portal.teacher.phone_id_validation_profile` | `enum` | `PK` | `eschoolghana.com` (`GH` vs `PK` `03xx`/`13-digit CNIC`) |
| `attendance.teacher_time_mode` | `enum` | `0` | `AttendanceTime: 0 \| 1 \| 2` |

---

## 6. ASP.NET Core (.NET 10) Authorization Mapping

| Portal / Capability | ASP.NET Core Policy / Mechanism | Claims / Evaluation Rule |
| :--- | :--- | :--- |
| **Portal Isolation** | `[Authorize(Policy = "Portal:Admin")]`, `"Portal:Parent"`, `"Portal:Teacher"` | Validates `portal` claim (`Admin`, `Parent`, `Teacher`) and `tenant_id` against tenant route/header |
| **Admin Module CRUD** | `[HasPermission("Students.Inquiries", PermissionAction.Edit)]` | Evaluates `IAuthorizationHandler` checking user's resolved `Role + Per-User Overrides` (`V/A/E/D/X`) |
| **Campus Data Isolation** | EF Core Global Query Filter + `ICurrentUser.SchoolIds` | Every campus-scoped query automatically filters `SchoolId IN (user.SchoolIds)` unless `AllSchools` |
| **Data Lock Enforcement** | `IDataLockGuard.EnsureUnlockedAsync(sectionKey, txDate)` | Throws `422 Unprocessable Entity` (`RFC 7807`) if `txDate <= DataLock.LockDate` |
| **Parent Child Ownership** | `IParentAuthorizationService.EnsureChildAccessAsync(guardianId, studentId)` | Replaces legacy untrusted body `AccountId`; verifies active `STUDENT_GUARDIANS` link in DB |
| **Teacher Class/Subject Ownership** | `ITeacherAuthorizationService.EnsureClassAccessAsync(employeeId, sectionId, subjectId)` | Verifies `CLASS_TEACHERS` or `CLASS_SUBJECT_TEACHERS` assignment for active session |

---

## 7. Non-Functional Requirements
1. **Security:** `Argon2id` password hashing, JWT Bearer (`15m` access + `7d`/`30d` HttpOnly or secure refresh token), `TOTP` 2FA (`RFC 6238`), strict CSP without `unsafe-eval`, CSRF protection on web cookies if any, MIME + magic-byte file upload validation, zero PII/passwords in exports or logs.
2. **Auditability:** All state mutations emit structured before/after JSON diffs (`USER_LOGS`) capturing `UserId`, `Module`, `Section`, `Action`, `OldData`, `NewData`, `IpAddress`, `UserAgent`, `Timestamp (UTC)`.
3. **Performance & Scale:** Server-side paginated APIs (`PagedResult<T>`) for grids exceeding 50 rows (`logs` `23.5k+`, `payroll` `3.2k+`, `inventory` `4.1k+`), background job queue (`BackgroundService` / Channels) for batch billing, payroll runs, mass SMS/FCM, and bulk PDF/XLSX exports.
4. **Responsiveness & Accessibility:** `0px` horizontal overflow from `375px` mobile to `1440px+` desktop across all 3 React portals; WCAG AA contrast and keyboard navigation.
