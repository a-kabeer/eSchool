# eSchool v2 — Forensic Audit of `reverse-engineering.rar` vs. Approved Master Task Plan

> **Purpose:** Compares the existing browser audit inside `D:\eSchool v2\docs\reverse-engineering.rar` (`132` entries: `00`–`10` docs, `evidence/progress-checklist.md`, `116` screenshots) against:
> 1. Our approved **Master Task Plan** (`master_task_plan.md`) and user-locked architecture/scope requirements, and
> 2. Our completed **Phase 1B Mobile Decompilation & API Extraction** (`docs/03-PHASE-1B-MOBILE-API-INVENTORY.md`).
>
> **Execution Rule Respected:** Pure audit & documentation only (`HOLD` on all implementation code remains active). Zero credentials, tokens, or private keys exposed.

---

## 1. Executive Verdict

**Why `reverse-engineering.rar` alone is NOT rebuild-ready (Status: `Partial Web Admin Discovery — Wrong Target Architecture`):**

1. **Wrong Tech Stack & Wrong Delivery Phasing (`10-rebuild-technical-blueprint.md`):**
   - Recommends **Next.js + NestJS + PostgreSQL 16 + Prisma/Drizzle + Redis/BullMQ + shadcn/ui + TanStack Table** (or **Laravel 11 + Inertia.js**), targets workspace `d:\eSchool`, proposes **cookie/Redis web sessions**, and pushes Parent/Teacher Portals out to **"Phase 6"** (`10-rebuild-technical-blueprint.md:20-40, 49, 65, 82, 120`).
   - **Violates locked user requirements:** Initial release **must** include **React + TypeScript + Vite + React Router + Tailwind CSS + Lucide React + Recharts** portals (Admin + Parent + Teacher) backed by an API-first **ASP.NET Core (.NET 10) Modular Monolith + C# + EF Core 10 + PostgreSQL 17 + JWT Bearer Auth + OpenAPI + API Versioning** inside `D:\eSchool v2`.
2. **100% Missing Parent, Teacher & Mobile Ecosystem (~40% of Product Scope):**
   - Searching all `13` `.md`/`.mmd` files in `reverse-engineering.rar` for `eSchoolForParents`, `eSchoolForTeachers`, `ptm`, `weekly-plan`, `lesson-plan`, `appraisal`, `daily-report`, `ASP.NET`, `Entity Framework`, `React Router`, `.NET 10`, and `PostgreSQL 17` returns **0 matches**.
   - Misses entire business modules proven live in our Phase 1B APK decompilation (`03-PHASE-1B-MOBILE-API-INVENTORY.md`): **PTM Requests & Chat**, **Weekly Plans**, **Daily Reports**, **Teacher Lesson Plans**, **Teacher Appraisals**, **Parent Blog (`posts.php` + comments)**, **PIN/OTP Self-Onboarding (`4`-step flow)**, **5 Online Payment Gateways (`Alpha`, `Card`, `JazzCash`, `Blinq`, `KuickPay`)**, **FCM Push (`TokenId`)**, **AttendanceTime (`0`/`1`/`2`)**, and **12+ hardcoded tenant feature gates**.
3. **API & Data Contracts Too Shallow for Code Generation (`04-api-endpoint-inventory.md`):**
   - Compresses 4–6 endpoints onto single table rows (`{check,toggle,delete}-*.php`), omits response JSON/SSP/pipe-delimited schemas, omits field validation/type/maxlength specs per endpoint, leaves unverified placeholder notes (`line 64: "exact param name inferred pending click/JS detail"`), and maps zero endpoints to `.NET 10` `/api/v1/...` DTOs or JWT policies.
4. **Key Web Admin Sub-Screens, Modals, PDFs, Unlisted Routes & Screenshots Were Skipped or Cropped:**
   - Zero field/table breakdown for `students/profile.php` (`9` tabs + `8` modals incl. `manage-login.php` & `write-comments.php`), `hr/profile.php` (`11` tabs + `8` modals), `homework-comments.php`, `homework-assignments.php`, `edit-fee.php`, and the `5` RBAC-only unlisted routes (`Accounts :: Depreciation`, `Management :: Backups`, `Email Templates`, `Payment Methods`, `Students :: Inquiry Sources`).
   - Zero layout/field specs for ANY printable PDF/thermal receipt.
   - `44` of `116` screenshots (`37.9%`, Batches 5–6 `.jpg`s like `15-hr-new-employee.jpg` and `16-payroll-generate.jpg`) are viewport-cropped above the fold rather than full-page captures.
   - Even visible live data in screenshots was missed in text (e.g., `screenshots/08-billing-api-logs.png` clearly displays the Bank API payload `Request: BillNo = 123470` / `Response: Code = 00 / Status = INVALID / Message = ...`, yet `04` omitted it and `06` claimed Bank API payloads could not be seen from browser!).

---

## 2. Deliverable-by-Deliverable Comparison Matrix

| Approved Plan Deliverable (`master_task_plan.md`) | Nearest File(s) in `reverse-engineering.rar` | Verdict | Specific Missing Parts & Needed Improvements |
| :--- | :--- | :---: | :--- |
| **`00-AUDIT-COVERAGE-MATRIX.md`** | `evidence/progress-checklist.md`, `00-access-and-environment-report.md`, `01-complete-module-inventory.md` | **Needs Update** | Wrong workspace path (`d:\eSchool`); excludes Mobile/Parent/Teacher coverage; marks `5` RBAC-only unlisted pages (`Depreciation`, `Backups`, `Email Templates`, `Payment Methods`, `Inquiry Sources`) unverified; misses sibling web portal probing (`/parents/`, `/teachers/`, `/api/`). |
| **`01-PRD-AND-USER-ROLES.md`** | `03-roles-and-permissions-matrix.md` | **Incomplete (`Admin Only`)** | Excellent capture of `7` admin User Types, `152` matrix rows, `41` Data Locks & per-user overrides (`cbSchools[]`, `cbDashboards[6]`, `cbMiscRights[8]`, `cbStudentTabs[8]`, `cbEmployeeTabs[10]`). **Missing:** Parent, Teacher, Student personas/user stories, mobile/portal role rules (`Father`/`Mother`, `Teachers`), tenant feature flags (`12` APK gates + `Blog`/`Events`/`Facebook`/`Edit`), and formal acceptance criteria. |
| **`02-SITEMAP-AND-SCREEN-SPECS.md`** | `01-complete-module-inventory.md`, `02-module-functional-specifications.md` | **Partial (`55-60%` Detail)** | Admin main forms (`Management`, `Settings`, `Students`) are strong; Batches 4–6 (`Billing` sub-modals, `HR` 26 pages, `Payroll` 12 pages, `Library` 13 pages) compress columns/modals into dense paragraphs. **Missing:** All Parent & Teacher React Router screens, `Student 360` (`9` tabs / `8` modals) field specs, `HR 360` (`11` tabs / `8` modals) field specs, `edit-*`/`view-*` modal fields, `homework-comments`/`assignments`, `manage-login.php`, printable PDF specs, and React Router structure. |
| **`03-API-AND-DATA-CONTRACTS.md`** | `04-api-endpoint-inventory.md`, `06-backend-access-gaps.md` | **Needs Full Rebuild** | Catalogs Web Admin `/admin/ajax/*.php` names only. **Missing:** All `42` Parents + `32` Teachers mobile/portal APIs (`03-PHASE-1B`), raw SSP JSON & `\|-\|` response payload samples, `Bank API` response observed in `08-billing-api-logs.png`, `.NET 10` `/api/v1/...` REST mapping, C# DTOs, `RFC 7807` ProblemDetails, OpenAPI contracts, JWT Bearer claims, and ASP.NET Core Authorization policies. |
| **`04-DATABASE-ERD.md`** | `07-logical-database-design.md`, `07-database-erd.mmd` | **Incomplete & Out-of-Sync** | Strong logical core, **but** `.md` and `.mmd` disagree and miss both Mobile/Portal tables (`PTM`, `WEEKLY_PLANS`, `DAILY_REPORTS`, `LESSON_PLANS`, `TEACHER_APPRAISALS`, `PUSH_DEVICES`, `BLOG`, `OTP_CODES`, `ONLINE_PAYMENTS`, `TENANT_FEATURE_FLAGS`) and key Admin tables inside `.mmd` (`ACCOUNTS_SETTINGS`, `FINAL_SETTLEMENTS`, `CLASS_SUBJECT_TEACHERS`, `CLASS_TEACHERS`, `HOMEWORK_ATTACHMENTS/COMMENTS/SUBMISSIONS`, `BONUS_TYPES`, `EMPLOYEE_BONUSES`, `MONTHLY_ADJUSTMENTS`, `HR_ROSTER_DAYS`, `LEAVE_QUOTA_ITEMS`, `STUDENT/EMPLOYEE_DOCUMENTS/COMMENTS`, `HOLIDAYS`/`LEAVE_QUOTAS` orphaned with 0 relationships). Also misses **PostgreSQL 17 + EF Core 10** types (`timestamptz`, `numeric(14,2)`, `jsonb`, indexes, multi-tenant filters). |
| **`05-BUSINESS-RULES-AND-REPORTS.md`** | Scattered in `02`, `06`, `08`, `09` | **Missing Unified Spec** | Formulas for Income Tax, PF, Social Security, Leave Sandwich/Weightage/Proration, Payroll `Basic`/`Medical` split (`view-payroll.php` never recorded formula/ratios!), Fee Tax threshold (`txtTaxableFeeAmount` + `5%`), Partial Fee allocation across arrears/fines, Bank API webhooks, `AttendanceTime` (`0/1/2`), `Comments.Nature` (`-2..2`), and Printable PDF layouts are scattered or unverified (`[VERIFY]` backlog). |
| **`06-UI-DESIGN-SYSTEM.md`** | `08-modernization-recommendations.md` | **Missing Design Spec** | Good defect & UX modernization analysis (`Category A/B/C`), **but** contains zero Tailwind CSS v4 tokens, zero React Router layout architecture, zero **Lucide React** icon mapping (for 147+ modules), zero **Recharts** component specs (`01-dashboard-analytics.png` series names like `Billed/Paid/Un-Paid/Default/Fine Received` and `Payable Amount/Tax` weren't even documented!), and wrongly assumes Next.js/shadcn/TanStack. |
| **`07-MODULAR-MONOLITH-PLAN.md`** | `10-rebuild-technical-blueprint.md` | **Wrong Stack (Rewrite)** | Built around **Next.js + NestJS + Prisma/BullMQ + PostgreSQL 16** (or Laravel 11). Must be completely rewritten for **ASP.NET Core (.NET 10) Modular Monolith + EF Core 10 + PostgreSQL 17 + JWT Bearer + OpenAPI** and **React + TypeScript + Vite + React Router + Tailwind + Lucide + Recharts** (`Admin`, `Parent`, `Teacher` portals on Day 1). |

---

## 3. Specific Technical Defects, Contradictions & Missed Evidence in `reverse-engineering.rar`

### 3.1 Internal Contradictions & Unfinished Audit Markers
1. **Leftover Unfinished Spec (`04-api-endpoint-inventory.md:64`):** `toggle-sms-service-status.php` reads `Service ID (exact param name inferred pending click/JS detail)` despite the doc claiming `Audit Status: Complete`.
2. **Mismatched Record & Module Counts Across Files:**
   - Billing report count: `15` report types in `01:148`, `02:378`, `04:240` vs `"Choose from 13 Report Types"` in `09:66` (`TC-BILL-05`).
   - Voucher count: `583 rows` in `01:271`, `02:418`, `04:267` vs `6,547 rows` in `07-logical-database-design.md:146`.
   - Module count: `13 functional modules` (`04:3`, `05:3`) vs `14 modules` (`00:80`, `01:3`).
3. **Bank API Payload Missed Despite Being Visible on Screen:**
   - `06-backend-access-gaps.md:32` states Bank API payloads cannot be seen from the browser, yet `screenshots/08-billing-api-logs.png` explicitly shows Row 1 (`Bank Bill Inquiry`):
     - `Date/Time`: `06-Feb-2025 06:10 PM` | `Bill No`: `123470` | `Action`: `Inquiry`
     - `Request`: `BillNo = 123470`
     - `Response`: `Code = 00`, `Status = INVALID`, `Message = An input parameter is missing or having invalid value.`
4. **Dashboard Google Charts Data Series Omitted:**
   - `screenshots/01-dashboard-analytics.png` clearly renders the exact chart legends (`Month-wise Billing Summary (2026)`: `Billed Amount`, `Paid Amount`, `Un-Paid Amount`, `Default Amount`, `Fine Received`; `Month-wise Payroll Summary`: `Payable Amount`, `Tax`), which `02:74-75` omitted when listing dashboard charts (needed for Recharts parity).
5. **Unprobed `5` Unlisted RBAC Pages (`03-roles-and-permissions-matrix.md:22-28`, `01:72`):**
   - `Accounts :: Depreciation`, `Management :: Backups`, `Management :: Email Templates`, `Management :: Payment Methods`, and `Students :: Inquiry Sources` were left untested (`"not linked in menu; unverified"`). At least `Email Templates` and `Payment Methods` directly relate to 2FA email fallback, parent/teacher onboarding, and online fee gateways (`PayVia*`).
6. **Cropped & Collapsed Screenshot Evidence (`116` files: `72` PNGs, `44` JPGs):**
   - Batches 5–6 (`15-hr-*`, `16-payroll-*`, `17-library-*`) switched from full-page PNGs to viewport-clipped JPGs (`~97KB–112KB`, e.g., `15-hr-new-employee.jpg`, `16-payroll-generate.jpg`), cutting off lower form fields, submit buttons, and accordions.
   - Multi-accordion forms (`06-students-new-student.png`) only screenshot Accordion 1 expanded (`Contact`, `Registration`, `Father`, `Mother`, `Emergency` collapsed).
   - **0 screenshots** exist for: `students/profile.php`, `hr/profile.php`, `students/revisions.php`, `collect-fee.php`, `return-book.php`, ANY `edit-*`/`view-*` modals (except `view-user-type.php`), or ANY PDF output.

### 3.2 Critical Cross-Surface Discrepancies Found by Comparing With Phase 1B Mobile APKs

| Feature / Endpoint Area | Web Admin Audit (`reverse-engineering.rar`) | Phase 1B Mobile Decompilation (`03-PHASE-1B`) | Audit Action Required in Next Phase 1A Pass |
| :--- | :--- | :--- | :--- |
| **Student Comments (`Nature`)** | Only mentions `write-comments.php` modal (`02:239`); zero fields/enums captured | Parent `comments.php` returns `Nature: -2 \| -1 \| 0 \| 1 \| 2` with red/green/neutral color tints | Capture `write-comments.php` modal fields & dropdown options (`Nature` labels!) in Chrome DevTools |
| **Parent/Teacher Portal Auth** | Mentions `manage-login.php` modal (`students` & `hr`) + `school_password` (`48`-col export); zero modal details | APKs use `login.php`, `AccountId`, `Type` (`Father`/`Mother`), `Gender`, `EmployeeId`, `VoucherNo`, PIN flow (`4`-step) | Capture `students/manage-login.php` & `hr/manage-login.php` DOM/AJAX; test if web Parent/Teacher portal routes exist on `demo.eschool.com.pk` |
| **Student Attendance (`Subject` / `Time`)** | Mentions `Subject-wise` & single `#txtTime{i}` (`attendance.php`) | Teacher `students.php`/`save-attendance.php` reveals `AttendanceTime: 0 \| 1 \| 2` (`Time` vs `TimeIn`/`TimeOut`) + `AttendanceDays` (`7`); Parent `ahp` returns `"YYYY-MM-DD=P"` | Inspect exact `students/attendance.php` Save POST payload & subject attendance DOM/JS rules |
| **Parent Profile Revisions** | `students/revisions.php` only notes `4` rows & 8 col names (`02:324`) | Parent `save-student-profile.php` / `save-parents-profile.php` omits `City` & `EmergencyCity`, sending only `Town`/`EmergencyTown` + `1200px` Base64 JPEG | Open `view-revision.php` and `edit-revision.php` on demo (`4` live rows exist!) to capture exact diff payload & approval AJAX |
| **PTM / Weekly Plans / Daily Report / Lesson Plans / Appraisals** | **0 mentions** in any Web Admin doc | Gated on tenant hosts (`unity`, `esc`, `noon`/`babulilm`, `anes`, `aas`) via `/api/parents/` and `/api/teachers/` | Check `management/settings.php` hidden inputs, RBAC matrix / direct PHP paths, or confirm whether these modules are tenant-specific plugins outside core demo `/admin/` |
| **Employee Portal & App Notifications** | `hr/notifications.php` & `hr/notices.php` say `"no deep-link"` (`05:49`) | `FcmNotificationService` reads `"Title"`, `"Message"`, `"Summary"`, `"Website"` from FCM data | Inspect `students/send-app-notification.php`, `hr/send-app-notification.php`, `students/notifications.php`, `hr/notifications.php` POST forms & response messages |
| **Billing Online Payment Gateways (`OL`)** | `management/settings.php` shows `OL` code; `06` marks card gateway unknown | Parents `PayViaAlpha`, `PayViaCard`, `PayViaJazzCash` use `/pay/<md5(VoucherNo)>/`; `Blinq` & `KuickPay` use `/payments/{blinq,kuickpay}/index.php?VoucherNo=` | Capture live fee voucher (`view-fee.php`, `edit-fee.php`), `Payment Methods` unlisted route (`/admin/management/payment-methods.php`), and fee challan print view |

---

## 4. What to Reuse vs. Re-Verify Before Writing Final `D:\eSchool v2\docs\01..07`

### 4.1 Safe to Reuse as Verified Baseline Evidence (No Need to Re-Do Basic Discovery)
- All `14` Admin module navigation trees (`149` / `163` nav items, `147` grid tiles).
- All `7` Admin roles (`TypeId 1, 2, 34, 38, 39, 28, 40`), the `152`-row RBAC matrix, `41` Data Locks, and `user` override shapes (`cbSchools`, `cbDashboards[6]`, `cbMiscRights[8]`, `cbStudentTabs[8]`, `cbEmployeeTabs[10]`).
- Confirmed core JS defect register (`setupPettyCashChart`, `Hr/HrDashboard` 500, `school_password` leak, `edit-fee-due-date.php` 404, `ecalendar` Dec 1999, `social-security` inverted min/max, Trial Balance opening imbalance, `sType=="Picture" && !checkDocument`, `payroll/reports.js` 5-arg bug, `library/reports.php` `#ddEdition` bug, etc.).
- Core table list/export column catalogs (`students/lists.php` `72` cols, `hr/lists.php` `48` cols, `accounts/settings.php` 5-tab GL mappings, `accounts/vouchers.php` & `closings.php`).
- All **Phase 1B** Mobile API contracts already extracted in `03-PHASE-1B-MOBILE-API-INVENTORY.md`.

### 4.2 Mandatory Targeted Phase 1A Chrome DevTools Gap-Closure Checklist (Next Conversation)
Before generating final `01-PRD-AND-USER-ROLES.md` through `07-MODULAR-MONOLITH-PLAN.md` in `D:\eSchool v2\docs\`, run a focused Chrome DevTools MCP capture covering ONLY these uncaptured / under-documented Web Admin items:

1. **Modal & 360-Profile Deep Capture:**
   - Open `students/profile.php?Id=<active>` -> capture all `9` tab table headers/actions AND open all `8` quick-action modals (`edit-student.php`, `fee-concession.php`, `custom-fee.php`, `send-sms.php`, `send-app-notification.php`, `write-comments.php` [to resolve `Comments.Nature`], `manage-login.php`, `add-document.php`).
   - Open `hr/profile.php?Id=<active>` -> capture all `11` tabs AND all `8` quick-action modals (`edit-employee.php`, `manage-login.php`, `write-comments.php`, `send-app-notification.php`, `add-education/experience/document.php`).
   - Open `students/view-revision.php` & `students/edit-revision.php` (`4` live rows exist!) + `students/homework-comments.php` + `students/homework-assignments.php`.
   - Open `billing/collect-fee.php`, `billing/view-fee.php`, `billing/edit-fee.php`, `payroll/view-payroll.php`, `payroll/edit-payroll.php` (capture exact `Basic` / `Medical` ratios and tax math!).
2. **`5` Unlisted RBAC Routes + Sibling Web Portals Probe (Read-Only `GET`):**
   - Probe `/admin/accounts/depreciation.php`, `/admin/management/backups.php`, `/admin/management/email-templates.php`, `/admin/management/payment-methods.php`, `/admin/students/inquiry-sources.php` (recording exact HTTP status, RBAC result, or UI fields).
   - Check `management/sms-services.php` / `sms-services.js` to capture exact param name for `toggle-sms-service-status.php` (resolving `04:64` leftover note).
   - Read-only check if `https://demo.eschool.com.pk/` hosts web Parent/Teacher portals (`/parents/`, `/teachers/`, `/parent/`, `/teacher/`, `/student/`) or public `WebsiteMode` pages.
3. **Raw JSON / Pipe-Delimited Response Capture & Chart Queries:**
   - Capture at least `1` live DataTables SSP JSON payload (`get-students.php` / `get-logs.php`), `get-*-filters.php` HTML output, and key `ajax/*.php` multi-segment `|-|` strings (e.g., `get-final-settlement-details.php`, `get-employee-monthly-adjustments.php`, `get-salary-bank-account.php`, `update-schedule.php`).
   - Capture the remaining `Billing` (`edit-fee`, `final-settlement`), `Accounts` (`Balance Sheet` / `P&L` / `Trial Balance` / `General Ledger` exact column structures & chart/drilldown DOM), and any `13` vs `15` report type reconciliation on `billing/reports.php`.
4. **Printable / Export Document Layout Capture (Parity Gate #4):**
   - Inspect DOM/HTML/PDF outputs of Fee Challan, Thermal Fee Receipt (`print-fee-receipt.php`), Registration Fee Receipt (`export-registration-fee.php`), SLC Withdrawal Certificate (`export-withdrawal-certificate.php`), Student Report Card (`export-student-report-card.php`), Class Marks Sheet, Payslip (`export-pay-slip.php`), Final Settlement Certificate (`export-final-settlement.php`), Loan Voucher, Petty Cash Receipt/Expense, and Accounts Voucher (`export-voucher.php`).
5. **Phase 2+ Consolidation (Clean-Room Documentation Rewrite for Locked Stack):**
   - Merge `reverse-engineering.rar` baseline + Chrome DevTools Gap Closure + `03-PHASE-1B-MOBILE-API-INVENTORY.md` into the **8 approved `D:\eSchool v2\docs\00..07` documents** targeting strictly:
     - **React + TypeScript + Vite + React Router + Tailwind CSS + Lucide React + Recharts** (`Admin`, `Parent`, and `Teacher` web portals in initial release)
     - **ASP.NET Core (.NET 10) Modular Monolith + C# + EF Core 10 + PostgreSQL 17 + JWT Bearer + OpenAPI + API Versioning** (shared across React web portals & future mobile apps).
