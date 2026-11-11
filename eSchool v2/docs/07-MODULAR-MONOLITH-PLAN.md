# eSchool v2 — Modular Monolith Implementation Plan (`.NET 10` + React 3-Portal Suite)

> **Provenance:** Synthesized from `01-PRD-AND-USER-ROLES.md`, `02-SITEMAP-AND-SCREEN-SPECS.md`, `03-API-AND-DATA-CONTRACTS.md`, `04-DATABASE-ERD.md`, `05-BUSINESS-RULES-AND-REPORTS.md`, and `06-UI-DESIGN-SYSTEM.md`.  
> **Locked Target Stack:**
> - **Backend:** **ASP.NET Core (.NET 10) Modular Monolith + C# + EF Core 10 + PostgreSQL 17 + JWT Bearer Authentication + ASP.NET Core Authorization + OpenAPI + API Versioning (`/api/v1/...`)**.
> - **Frontend (Initial Release — `3` Web Portals):** **Admin Portal**, **Parent Portal**, and **Teacher Portal** built with **React + TypeScript + Vite + React Router + Tailwind CSS + Lucide React + Recharts**. *(Native Android/iOS mobile apps are deferred past Initial Release, while consuming the same `/api/v1/{parent,teacher}/...` API surface when built).*
> - **Execution Guardrail:** Planning blueprint only (`HOLD` on creating `.cs`, `.tsx`, `.ts`, `.sql`, or scaffolding files until stakeholder implementation approval). Unknown legacy internal formulas remain tagged `[VERIFY]`.

---

## 1. Proposed Monorepo Blueprint (Documentation Reference Only)

```text
eschool-v2/
├── backend/
│   ├── eSchool.slnx
│   ├── src/
│   │   ├── Host/
│   │   │   └── eSchool.Api/                     # ASP.NET Core 10 Web API, Composition Root, OpenAPI/Scalar, Asp.Versioning, HealthChecks
│   │   ├── BuildingBlocks/
│   │   │   ├── eSchool.SharedKernel/            # Multi-tenant ICurrentUser, PagedResult<T>, Result/ProblemDetails, Domain Events
│   │   │   └── eSchool.Infrastructure/          # PostgreSQL 17 Npgsql setup, Argon2id, JWT, DataLockGuard, Background Channels, QuestPDF, ClosedXML
│   │   └── Modules/                             # 9 Bounded Contexts matching PostgreSQL 17 schemas 1:1
│   │       ├── Identity/                        # [identity]   Auth, TOTP 2FA, PIN Onboarding, 152 RBAC, Overrides, 41 Data Locks, Audit Logs
│   │       ├── Tenancy/                         # [tenancy]    Tenants, 12+ Feature Flags, System Settings, SMS/Email Templates, Payment Methods, Backups, Schools/Classes/Sessions/Banks
│   │       ├── Students/                        # [students]   Inquiries, Registrations, Student 360, Siblings, Attendance, Leaves, Revisions, Homework, PTM, Weekly/Daily Reports
│   │       ├── Billing/                         # [billing]    Fee Categories/Structures/Concessions, Regular/Custom/Installment Challans, Collection, Bank APIs, Online Gateways, Final Settlements
│   │       ├── Academics/                       # [academics]  Exams, Marks, Report Cards, Analysis, Timetable Scheduler + Clash Check, eCalendar, Photos/Videos
│   │       ├── Hr/                              # [hr]         Employees (48 fields), HR 360, Biometric/Shift Attendance, Rosters, Leave Policies/Quotas, Movements, Lesson Plans, Appraisals
│   │       ├── Payroll/                         # [payroll]    Income Tax/EOBI/PF/SS Slabs, Salaries, Loans (remainder-first EMI), Bonuses, Monthly Adjustments, Payroll Generation, Final Settlement
│   │       ├── Accounting/                      # [accounting] Chart of Accounts, Balanced JV/PV/RV/CV Vouchers, Cheque Books, Settings, Statements (TB/P&L/BS/GL), Closings, Depreciation, Petty Cash
│   │       └── Operations/                      # [operations] Library (CAT-BOOK-COPY), Unified Inventory & Serialized Asset Custody, Notices, Blog, Multi-Channel SMS/Push Dispatch
│   └── tests/
│       ├── eSchool.Architecture.Tests/          # NetArchTest module boundary checks (zero cross-module DbContext refs)
│       ├── eSchool.Integration.Tests/           # xUnit + Testcontainers PostgreSQL 17
│       └── eSchool.Unit.Tests/                  # Payroll/Billing/DataLock/Loan math tests
└── frontend/
    ├── pnpm-workspace.yaml
    ├── packages/
    │   ├── api-client/                          # OpenAPI-generated TypeScript fetch/React Query SDK + JWT refresh interceptor
    │   ├── ui/                                  # Tailwind design tokens, ServerDataGrid, Drawers, PrintPreviewSheet, Recharts wrappers, Lucide helpers
    │   └── auth-portal/                         # Shared Login, 2FA, 4-Step PIN Onboarding, RBAC/Feature-Flag hooks
    └── apps/
        ├── admin-portal/                        # React + Vite SPA served at /admin/* (All 14 Modules + Unlisted RBAC pages)
        ├── parent-portal/                       # React + Vite SPA served at /parent/* (Full Mobile + Web parity)
        └── teacher-portal/                      # React + Vite SPA served at /teacher/* (Full Mobile + Web parity)
```

---

## 2. Backend Modular Monolith Architecture (`.NET 10` + `EF Core 10` + `PostgreSQL 17`)

### 2.1 Module Boundary & Schema Isolation Rules
1. **One PostgreSQL 17 Schema per Module:** Each module (`identity`, `tenancy`, `students`, `billing`, `academics`, `hr`, `payroll`, `accounting`, `operations`) owns its private `DbContext` configured with:
   - `HasDefaultSchema("<module>")` and `UseSnakeCaseNamingConvention()`.
   - Dedicated `__ef_migrations_history_<module>` table so modules evolve independently while sharing one PostgreSQL 17 database.
   - Global Query Filter enforcing `.Where(e => e.TenantId == _currentUser.TenantId)` across every multi-tenant entity, plus automatic `SchoolId IN (_currentUser.SchoolIds)` scoping on campus-owned aggregates.
2. **Cross-Module Communication Contract:**
   - **Zero direct table joins or `DbContext` injection across modules.**
   - Synchronous reads use slim **In-Process Module Contracts (`I*ModuleQueries`)** registered via DI (e.g., `IBillingQueries` checking unpaid dues for `Students.Withdrawals` / `Payroll.FinalSettlement`, or `ITenancyQueries` reading `SystemSettings` & `FeatureFlags`).
   - State-changing side effects use **In-Process Domain Events / Outbox Channels** (e.g., `FeeCollectedEvent` -> `Accounting` posts Fee Receipt GL Voucher; `EmployeeResignedEvent` -> creates Exit Clearance tasks across `Operations`, `Payroll`, `Billing`).

### 2.2 Security, Authorization, Versioning & Cross-Cutting Infrastructure
- **Authentication:** `Microsoft.AspNetCore.Authentication.JwtBearer` issuing short-lived (`15m`) stateless JWT access tokens (`sub`, `tenant_id`, `portal`, `role_id`, `school_ids`, `guardian_type`, `employee_id`) + rotating cryptographic Refresh Tokens persisted hashed in `identity.refresh_tokens` (`HttpOnly; Secure; SameSite=Lax` for the 3 React SPAs, or JSON token exchange for future mobile apps).
- **Authorization Policies:**
  - Portal Gate Policies: `[Authorize(Policy = "Portal:Admin")]`, `"Portal:Parent"`, `"Portal:Teacher"`.
  - Granular RBAC Requirement Handler: `[HasPermission("Billing.FeeCollection", PermissionAction.Add)]` evaluating Role Defaults + Per-User Overrides (`V/A/E/D/X`).
  - Resource Ownership Guards: `IParentAuthorizationService` (`STUDENT_GUARDIANS` verification replacing spoofable `AccountId`) and `ITeacherAuthorizationService` (`CLASS_TEACHERS` / `CLASS_SUBJECT_TEACHERS` verification).
  - Historical Cutoff Guard: `IDataLockGuard.EnsureUnlockedAsync(sectionKey, transactionDate)` checking `identity.data_locks` (`41` sections) and returning `HTTP 422 ProblemDetails (DATA_LOCK_VIOLATION)`.
- **API Versioning & OpenAPI:**
  - `Asp.Versioning.Http` (`/api/v1/...`, URL segment + header/media-type ready).
  - Built-in `.NET 10` `Microsoft.AspNetCore.OpenApi` + Scalar UI (`/scalar/v1`) exporting OpenAPI specs consumed directly by `@hey-api/openapi-ts` / `orval` for TypeScript API client generation.
- **Exception Handling (`RFC 7807`):** Global `IExceptionHandler` mapping FluentValidation errors (`400`), auth failures (`401`), RBAC/scope denials (`403`), clashes/unique collisions (`409`), and Data Locks (`422`) without leaking stack traces or secrets.
- **Async Background Processing (`BackgroundService` + Bounded `Channel<T>`):** Handles heavy workloads observed in legacy timeouts: batch `regular-fee` challan generation, monthly `payroll` calculation runs, mass `SMS` (12 gateways) / Firebase `FCM` push notifications, scheduled `DB backups`, and large multi-page PDF / `72`-column Excel exports.
- **Documents & Reporting Libraries:**
  - **`QuestPDF`**: Clean vector generation of all verified **A4 Portrait/Landscape PDFs** (`3-Copy Fee Challan`, `Registration Receipt`, `SLC`, `Pay Slip`, `Billing Final Settlement`, `Loan Voucher`, `Accounts JV/PV/RV/CV`, `Petty Cash Receipt/Expense`, `Exam Report Cards`) + 80mm thermal slip DTOs.
  - **`ClosedXML`**: Streaming Excel `.xlsx` exports and template imports (`Students 72 cols minus password`, `HR 48 cols minus password`, `15` Billing reports, `14` Payroll reports, Bulk Fee Revisions, Bank Collections, Marks Entry).

---

## 3. Initial Release Phased Delivery Roadmap

### Phase 0 — Verification & Foundations *(Prerequisite before Coding)*
1. Resolve `[VERIFY]` server-side items in `05-BUSINESS-RULES-AND-REPORTS.md` Section 5 (Income Tax/PF/EOBI/Leave formulas, partial fee allocation order, auto-GL templates, Bank/Payment Gateway webhooks, Report Card PDF layout).
2. Provision repository CI/CD, Docker Compose (`PostgreSQL 17`, Redis/Mailpit optional), `.NET 10` solution template, shared Vite + Tailwind + UI monorepo packages, and legacy MySQL -> PostgreSQL 17 anonymized staging fixture.

### Phase 1 — Core Identity, Tenancy, RBAC & Campus Masters
- Build `Identity` + `Tenancy` modules and Admin shell (`AdminShell` + `Ctrl+K` + `My Account`).
- Deliver Admin Login + TOTP 2FA + Email OTP fallback, Parent/Teacher Web Login + 4-Step PIN Onboarding (`5/day` server throttle), 152-row RBAC + Per-User Overrides, 41 Data Locks, `SYSTEM_SETTINGS` + `TENANT_FEATURE_FLAGS`, SMS/Email/Payment Method managers, and all 12 Settings sub-modules.
- Fix legacy defects: `email-templates` (`D23`), `sms-services` toggle (`D18`), and plaintext `school_password` elimination (`D4`).

### Phase 2 — Students, Academics, Attendance & Communications
- Build `Students` + `Academics` + HR Attendance/Rosters backbone.
- Deliver Inquiries -> Registrations -> Admissions -> **Student 360** (9 tabs + 8 modern drawers) + Parent `FieldDiff` Revisions (`revisions.php`) + Student Attendance (`P/A/L/H` Daily, Monthly Matrix locking `L`, Subject-wise) + Homework CRUD + Exams/Marks/Report Cards + Timetable Scheduler (`409` clash detection) + eCalendar (fixing `D6` Dec 1999 bug, `D10`–`D11` upload bugs, `D20` Select All).

### Phase 3 — Financial Core: Billing, Payroll, Petty Cash & Double-Entry Accounting
- Build `Billing`, `Payroll`, and `Accounting` modules with event-driven GL voucher posting.
- Deliver Fee Engine (`TaxRate`, `Installments 1..6` `V/I`, Capped Late Fine, Partial Fee fixing `D19`, Custom Fee year fix `D9`, Due Date edit fixing `D5`), Fee Collection + Thermal Receipt + Bank Reconciliation + Bank Billing APIs + Online Checkout gateways, all **15 Billing Reports** (fixing `D2` `#BtnView` + `D21`), Payroll Statutory Slabs (fixing `D7` CHECK constraint, `D8`, `D14`), `Basic = Gross / 1.10` math, Remainder-first Loans, Final Settlements, COA + Balanced Vouchers + **Accounts Depreciation** + `TB`/`P&L`/`BS`/`GL` Financial Statements, and Petty Cash.

### Phase 4 — HR Lifecycle Completion, Library, Unified Inventory & Parent/Teacher Web Portals
- Complete `Hr` (`hr/index.php` 500 fix `D1`, Leave Quotas, Transfers/Promotions/Resignations/Rejoins, Unified Exit Clearance), `Library` (`CAT-BOOK-COPY`, fixing `D15`–`D17`), and `Operations` Unified Inventory & Serialized Asset Custody (`D24` retiring disconnected `hr/assets`).
- Launch complete **`apps/parent-portal`** (`/parent/*`, replacing `/parent/` stub with 100% Parent APK parity) and **`apps/teacher-portal`** (`/teacher/*`, replacing `/teacher/` stub with 100% Teacher APK parity) consuming the exact `/api/v1/{parent,teacher}/...` contracts.

### Phase 5 — Data Migration, Hardening, Cutover & Post-Launch Mobile Phase
- Execute ETL migration + financial reconciliation verification + UAT parallel run, then cut over web portals.
- *(Post-Initial Release)* Native Android/iOS apps (React Native / Flutter / Kotlin) plug directly into the existing `/api/v1/auth/portal/*`, `/api/v1/parent/*`, and `/api/v1/teacher/*` endpoints without backend rework.

---

## 4. Legacy MySQL -> PostgreSQL 17 Data Migration & Hygiene Plan

1. **Pre-Migration Sanitization & Quarantine Report:**
   - **Never migrate `school_password` plaintext** into exportable student/employee tables; hash valid guardian/teacher/admin passwords once into `Argon2id` inside `identity.users` / `identity.portal_accounts` (flagging weak/default passwords for forced reset).
   - **Fix Corrupt Statutory Data:** Quarantine/correct inverted Social Security bands (`95/55`, `50,000/10,000`) before enabling `CHECK (max_amount >= min_amount)`.
   - **Deduplicate Families:** Group Student records sharing normalized Father/Mother CNIC or verified primary mobile into unified `GUARDIANS` + `STUDENT_GUARDIANS` rows while flagging ambiguous duplicates for Admin review.
   - **Reconcile COA & Asset Split:** Audit legacy Chart of Accounts opening balances (`diff ~140k+`) via a compensating migration adjustment ledger approved by Finance (`Opening Debit == Opening Credit`), and backfill `hr/assets` free-text entries into serialized `INVENTORY_UNITS` + `ASSET_CUSTODY_LOGS`.
2. **Idempotent ETL Pipeline:** Staging extract -> normalize enums/dates (`UTC`) -> deterministic key-mapping table (`legacy_id -> new_bigint_id`) -> row-count & financial-sum parity checks (`Total Billed`, `Total Collected`, `Total Payable Salary`, `Trial Balance DR == CR`).

---

## 5. Comprehensive Testing & Quality Verification Strategy

| Test Layer | Tooling Stack | Mandatory Coverage Scope |
| :--- | :--- | :--- |
| **Architecture Tests** | `xUnit` + `NetArchTest.Rules` | Enforce module isolation (no cross-module `DbContext` or internal entity references). |
| **Domain Unit Tests** | `xUnit` + `FluentAssertions` | `Basic/Medical` split, `edit-payroll` payable tax math, Loan remainder-first EMI, Late fee cap + partial fee validation, `1..6` installment split, Attendance `AttendanceTime` & Leave lock rules, Timetable clash rejection, RBAC bitmask evaluation. |
| **Integration & API Tests** | `xUnit` + `WebApplicationFactory` + **`Testcontainers` PostgreSQL 17** | End-to-end `/api/v1/...` HTTP tests, Multi-tenant `TenantId` & `SchoolId` leakage tests, `DataLockGuard` `422` tests, **Parent IDOR prevention** (child A parent cannot read/pay child B), **Teacher class ownership**, balanced voucher DB invariants. |
| **Frontend Component Tests** | `Vitest` + `React Testing Library` | `Zod` form validation parity (`FormValidator` codes `B/C/N/F/S/E/U/P/L`), `ServerDataGrid` filtering, `FieldDiffReviewDrawer`, responsive layout checks. |
| **End-to-End Browser Suite** | **`Playwright`** (Chromium + Mobile `375px` viewport) | Golden journeys across all 3 SPAs: Admin login+2FA -> Inquiry->Reg->Student360 -> Regular Fee->Collect Fee->Trial Balance; Parent PIN setup -> Revision submit -> Admin selective approve -> Pay Challan; Teacher Attendance mark (`AttendanceTime 0/1/2`) -> Homework multipart upload -> Payroll slip download. |
| **Print & Export Regression** | PDF/Excel snapshot assertions | Verify A4 Portrait/Landscape orientation, 3-copy Challan layout, balanced Voucher PDFs, `ClosedXML` column parity (15 Billing reports, 72 Student cols minus `school_password`). |
