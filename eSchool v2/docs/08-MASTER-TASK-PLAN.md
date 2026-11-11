# eSchool v2 — Master Execution & Rebuild Task Plan

> **Purpose:** Portable, self-contained execution roadmap designed to travel directly inside `D:\eSchool v2\docs\` when copying the project folder to a new development workstation.  
> **Prerequisites Read Order:** [`00-AUDIT-COVERAGE-MATRIX.md`](file:///D:/eSchool%20v2/docs/00-AUDIT-COVERAGE-MATRIX.md) -> [`01`](file:///D:/eSchool%20v2/docs/01-PRD-AND-USER-ROLES.md) .. [`07`](file:///D:/eSchool%20v2/docs/07-MODULAR-MONOLITH-PLAN.md).

---

## 1. Locked Target Stack & Architectural Guardrails

| Layer | Locked Choice (Do Not Deviate) |
| :--- | :--- |
| **Backend API** | **ASP.NET Core (.NET 10) Modular Monolith** + **C#** + **EF Core 10** + **PostgreSQL 17** (`Npgsql`, schema-per-module, `UseSnakeCaseNamingConvention()`) |
| **Auth & Docs** | **JWT Bearer Authentication** + **ASP.NET Core Authorization** (`Portal:*`, `HasPermission`, `IDataLockGuard`, Parent/Teacher ownership) + **OpenAPI** + **API Versioning (`/api/v1/...`)** |
| **PDF & Excel** | **QuestPDF** (10 verified A4 PDFs + Report Card) & **ClosedXML** (Marks Sheet `.xlsx` + `15` Billing + `14` Payroll + `72` Student / `48` HR exports minus `school_password`) |
| **Initial Release UI** | **`3` Web Portals** (**Admin**, **Parent**, **Teacher**) built with **React + TypeScript + Vite + React Router + Tailwind CSS + Lucide React + Recharts** |
| **Future Mobile Phase** | Native Android/iOS deferred post-v2 launch; consumes the exact shared `/api/v1/auth/portal/*`, `/api/v1/parent/*`, and `/api/v1/teacher/*` contracts |
| **Clean-Room Rule** | Never ship plaintext `school_password` (`D4`); never trust client `AccountId` without JWT; resolve or configure all `7` `[VERIFY]` items in [`05`](file:///D:/eSchool%20v2/docs/05-BUSINESS-RULES-AND-REPORTS.md) §5 via UAT |

---

## 2. Workstation Setup & Portability Checklist (New PC)

1. **Copy Folder:** Copy the entire `eSchool v2` directory (`docs/`, `docs/raw/`, `Mobile APK/` — self-contained, zero temporary dependencies required).
2. **Install Dev Tooling on New Machine:**
   - [ ] `.NET 10 SDK` + IDE (Visual Studio 2026 / Rider / VS Code + C# Dev Kit)
   - [ ] `PostgreSQL 17` (or Docker Desktop running PostgreSQL 17 + Mailpit)
   - [ ] `Node.js 22 LTS` + `pnpm` (`corepack enable`)
   - [ ] `Git` (initialize repo on new machine) & `Playwright` Chromium browser binaries (for Phase 5 E2E)

---

## 3. Master Build Sequence (Phase 0 -> Phase 5)

### Phase 0 — Clean-Room Sign-Off & Monorepo Scaffolding
- [ ] **P0.1 Sign Off Configurable `[VERIFY]` Policies (`05` §5):** Confirm with Accountant / Principal how configurable defaults should ship for:
  1. Income Tax YTD remaining-months rounding & Bonus/Allowance taxability flags
  2. Employer PF match rule (`Basic` vs `Gross` lookup), EOBI age cutoff evaluation date, & Leave daily divisor (`Gross/30` vs `Gross/DaysInMonth` vs `WorkingDays`)
  3. Partial Fee sub-category allocation order & `AdvanceFee` handling (`oneiro`)
  4. Collection Cash/Bank clearing GL leg, Payroll Expense breakdown, & Asset Depreciation (`Cost` vs `WDV`)
  5. Bank API (Al Habib / Meezan) & Gateway (`Alpha/Card/JazzCash/Blinq/KuickPay`) HMAC secrets + Thermal 80mm ESC/POS template
  6. RBAC-locked screen details (`depreciation`, `backups`, `payment-methods`, `inquiry-sources`) & Mobile-only PDFs (`Weekly Plan`, `Daily Report`, `Appraisal`)
  7. Whether optional read-only Student login route is active in Day-1 release
- [ ] **P0.2 Create Backend `.NET 10` Modular Monolith Skeleton (`07` §1):**
  - `backend/eSchool.slnx`, `Host/eSchool.Api`, `BuildingBlocks/{SharedKernel,Infrastructure}`
  - `9` isolated module projects matching the `9` PostgreSQL schemas: `Identity`, `Tenancy`, `Students`, `Billing`, `Academics`, `Hr`, `Payroll`, `Accounting`, `Operations`
  - `3` test projects: `eSchool.Architecture.Tests` (`NetArchTest`), `eSchool.Integration.Tests` (`Testcontainers` PostgreSQL 17), `eSchool.Unit.Tests`
- [ ] **P0.3 Create Frontend `pnpm` Workspace (`06` & `07` §1):**
  - `frontend/packages/{api-client,ui,auth-portal}`
  - `frontend/apps/{admin-portal,parent-portal,teacher-portal}` wired with Tailwind v4 tokens (`06` §2), `Lucide React`, `Recharts`, React Router v7, and OpenAPI TypeScript codegen.

---

### Phase 1 — Identity, Tenancy, RBAC, Data Locks & Campus Settings
- [ ] **P1.1 Identity Module (`[identity]` schema):**
  - Users, User Types (`7` roles baseline), **`152`-row RBAC matrix** (`V/A/E/D/X`) + per-user overrides (`cbSchools[]`, `cbDashboards[6]`, `cbMiscRights[8]`, `cbStudentTabs[8]`, `cbEmployeeTabs[10]`)
  - **`41` Data Locks** + `IDataLockGuard` (`HTTP 422 DATA_LOCK_VIOLATION`)
  - JWT Bearer (`15m` access + rotating refresh token), TOTP 2FA + Email OTP fallback, Password Expiry/Reuse policy, `Argon2id` hashing
  - Unified **`/api/v1/auth/portal/*`** login + **4-Step PIN Onboarding** with server-side `5/day` sliding-window limit (fixing APK `"dd-MM-yyyyy"` bug `D26`)
  - `USER_LOGS` audit trail JSON diff interceptor
- [ ] **P1.2 Tenancy & Campus Settings Module (`[tenancy]` schema):**
  - `SYSTEM_SETTINGS` (`6` tabs) + **`TENANT_FEATURE_FLAGS`** (migrating all `12` hardcoded APK host gates + hidden flags)
  - Promoted unlisted routes: Email Templates (fixing `404` `D23`), Payment Methods, Backups, Inquiry Sources
  - SMS Gateways (`12` providers, fixing `D18`), plus all `12` campus settings CRUDs (`Schools` + merge, `Classes`, `Sections`, `Sessions` + lock, `Subjects`, `Religions`, `Nationalities`, `Cities`, `Towns`, `Occupations`, `Banks`, `Bank Accounts`)
- [ ] **P1.3 Frontend Foundation & Admin Shell:**
  - `AdminShell` (collapsible sidebar, `Ctrl+K` command search, Campus/Session selector, Light/Dark themes, `<ServerDataGrid />`, `My Account`) + Shared `auth-portal` login/PIN components.
- [ ] **P1 Gate:** `NetArchTest` passes; RBAC + `TenantId`/`SchoolId` isolation + `DataLockGuard 422` integration tests pass against `Testcontainers` PostgreSQL 17.

---

### Phase 2 — Students, Academics, Timetable, eCalendar & Communications
- [ ] **P2.1 Students Module (`[students]` schema):**
  - Admissions funnel (`Inquiries` -> `Registrations` + A4 Receipt PDF -> `Admissions`)
  - **Normalized `GUARDIANS` + `STUDENT_GUARDIANS`** (multi-child link, zero plaintext `school_password` `D4`/`D20`)
  - **Student 360** (`9` tabs + `8` drawers incl. `Comments.Nature` `-2..2`, `Manage Portal Login`)
  - Selective per-field **Profile Revisions** (`students/revisions`) + Attendance (Daily `P/A/L/H`, Monthly locking `L`, Subject-wise) + Leaves + Transfers/Withdrawals (A4 Landscape SLC PDF)/Rejoins/Graduates/Promotions
  - Homework CRUD + submissions 5-star grading + threaded comments (fixing `D10` MIME upload bug)
  - Student notices, SMS, push notifications, statistics, `72`-col custom list (minus password) & `9` reports
- [ ] **P2.2 Academics Module (`[academics]` schema):**
  - Exams (`Subjects Assignment`, `Class Teachers`, `% Grades`, Merge-tag `Comments`, `Marking`/`Published` `Exams`, `Marks Entry`, **`Student Report Card` A4 PDF**, **`Class Marks Sheet` `.xlsx`**, Grade Analysis Recharts)
  - Timetable (`Periods`, `Seasons`, `Timetables`, Drag/Drop `Scheduler` returning `HTTP 409` on teacher/slot clashes)
  - eCalendar (fixing `D6` `Dec 1999` bug, Month/Week/Day views, `Events` + Organizers, `Tasks`, chunked `Photos`, `Videos`)
- [ ] **P2 Gate:** Admissions -> Student 360 -> Attendance -> Exam Marks -> Report Card PDF & Timetable Clash tests pass.

---

### Phase 3 — Financial Core: Billing, Payroll, Petty Cash & Double-Entry Accounting
- [ ] **P3.1 Accounting & Petty Cash (`[accounting]` schema):**
  - `Chart of Accounts` (balanced opening migration), Balanced Vouchers (`JV`/`PV`/`RV`/`CV`), Cheque Books, **`Accounts Settings` (Tabs 1–5)**, **Single-FY `Ledger Statement`** with 6 drilldowns, `Trial Balance` (`DR == CR`), `P&L`, `Balance Sheet`, `General Ledger`, `Year Closings`, **Promoted `Accounts Depreciation`**
  - `Petty Cash` Categories, Receipts & Expenses (+ A4 PDFs), Day Book / Cash Flow
- [ ] **P3.2 Billing & Online Payments (`[billing]` schema):**
  - Fee Categories (`-> Income GL`), Fee Structures (Clone), Concessions, Regular Fee + Taxable threshold, Custom Fee (fixing `D9` year bug), **`1..6` Installments (`V`/`I`)**, `Due Date` patch (fixing `D5` `404`), Interactive Bulk Revision/Concession preview (fixing `D21`)
  - **Auto-GL Rules Verified Live:** Bill Accrual (`DR 30049 Fee Receivable / CR mapped Income`), Arrears Exclusion (`SF021731` non-reaccrual), Fine Credit (`CR 40015`)
  - Fee Collection (capped `MaxFeeFine`, Partial Fee fixing `D19`, `CA/BC/BT/CH/OL`, Thermal receipt JSON), Final Settlement (`Balance = SecurityDeposit - UnpaidFee - Deductions` + PDF), Bank Reconciliation, Bank Billing APIs (`Inquiry/Payment/Reversal` + `BANK_API_LOGS`), Payment Session API (`md5` replaced by opaque token!), **all `15` Billing Reports** (fixing `D2` `#BtnView`)
- [ ] **P3.3 Payroll (`[payroll]` schema):**
  - Statutory Slabs (`Income Tax` + surcharge, `EOBI`, `Provident Fund` top-tier cap, `Social Security` enforcing `CHECK Max >= Min` fixing `D7`)
  - `Salaries` (fixing `D14`), **`Basic = Round(Gross / 1.10)` & `Medical = Gross - Basic`**, Remainder-first **Loans** (+ PDF Loan Voucher), Bonuses, Monthly Adjustments
  - Payroll Generation + Edit live tax formula + A4 Pay Slip PDF (`"Reimbursement"` typo fixed) + Final Settlement + **all `14` Payroll Reports** (fixing `D8` 5-arg JS bug)
- [ ] **P3 Gate:** `xUnit` financial math + balanced GL invariant + `QuestPDF`/`ClosedXML` snapshot tests pass with zero rounding drift.

---

### Phase 4 — HR Completion, Library, Unified Inventory, Dashboards & Parent/Teacher Web Portals
- [ ] **P4.1 HR (`[hr]` schema):**
  - Fix **`hr/index.php` `HTTP 500`** (`D1`) + `6` HR Recharts + Main Dashboard `Petty Cash` chart (`D3`) + Billing `Fee Categories` chart (`D3`)
  - Employees (`48` cols minus password), **HR 360** (`11` tabs + `8` drawers), Biometric/Roster Shift attendance, **Leave Types (`Sandwich N/S/B`, `ClMerge`, `CarryForward`, `Prorated` fixing `D13`)**, Leave Quotas, Transfers/Promotions/Resignations (linked Exit Clearance)/Rejoins, Holidays, SMS/Notices (fixing `D11`, `D12`)
- [ ] **P4.2 Operations — Library & Unified Inventory (`[operations]` schema):**
  - Library (`CAT-BOOK-COPY` barcodes, `max_books`, `issue_days`, `min(days*50, 500)` fine, `9` reports fixing `D15`–`D17`)
  - Inventory & **Unified Serialized Asset Custody (`INVENTORY_UNITS` + `ASSET_CUSTODY_LOGS`)** retiring disconnected `hr/assets` (`D24`) + `4` reports (fixing `D22`)
  - Multi-channel SMS + Firebase FCM Push background dispatcher
- [ ] **P4.3 Parent Portal (`apps/parent-portal`) & Teacher Portal (`apps/teacher-portal`):**
  - **`/parent/*` (Full Parity):** Multi-child switcher, Profile + Guardian **Revision submission** (`multipart/form-data`, native nested `towns`), Daily Calendar & Subject Attendance, Fee Challan PDF + Online Payment drawer, Published Exams & Report Card PDF, Homework/Classwork (`label` flag), Weekly Plans, Daily Reports, Timetable (`6/7` days), Documents, `Comments` (`-2..2`), Multi-child Leaves, PTM Request & Chat, Notices, Events, Blog, Facebook, Web Push
  - **`/teacher/*` (Full Parity):** Class/Section roster (`CanMarkAttendance`), Attendance marking (`AttendanceTime 0|1|2`, `AttendanceDays`), Homework CRUD + multi-file upload & grading, Timetable, Lesson Plans, Self-Attendance, Leaves + Quota balances, Payroll slips PDF, Loans + EMIs, Appraisals, Feeds
- [ ] **P4 Gate:** Parent IDOR tests (child ownership), Teacher class-ownership tests, and responsive (`375px` & `1440px`) E2E suites pass across all 3 portals.

---

### Phase 5 — Legacy MySQL -> PostgreSQL 17 Migration, Parallel UAT & Cutover
- [ ] **P5.1 Pre-Migration Sanitization ETL (`07` §4):** Hash credentials cleanly (`Argon2id`, zero `school_password` migration), sanitize Social Security inverted bands, deduplicate `GUARDIANS`, balance COA Opening entries (`Opening DR == CR`), backfill `hr/assets` into `INVENTORY_UNITS`.
- [ ] **P5.2 Reconciliation & Cutover:** Verify exact row counts and financial parity (`Total Billed`, `Total Collected`, `Payroll Payable`, `Trial Balance DR == CR`), run parallel UAT sign-off on `[VERIFY]` items, deploy ASP.NET Core 10 host + 3 Vite builds behind reverse proxy, and retire legacy PHP routes.

---

## 4. Kickoff Prompt for the New Workstation Session

> Copy-paste this prompt when starting coding on the new system:
>
> *"Read `docs/00-AUDIT-COVERAGE-MATRIX.md` and `docs/08-MASTER-TASK-PLAN.md` along with `docs/01` through `docs/07`. We are now lifting the implementation HOLD and starting Phase 0 -> Phase 1 strictly using the locked stack: ASP.NET Core (.NET 10) Modular Monolith + EF Core 10 + PostgreSQL 17 + JWT Bearer + ASP.NET Core Authorization + OpenAPI + Asp.Versioning (`/api/v1/...`), and 3 React + TypeScript + Vite + React Router + Tailwind CSS + Lucide React + Recharts web portals (`admin-portal`, `parent-portal`, `teacher-portal`). Confirm the `[VERIFY]` configuration items from `05` §5 with me before finalizing financial formulas, then scaffold `P0.2` and `P0.3`."*
