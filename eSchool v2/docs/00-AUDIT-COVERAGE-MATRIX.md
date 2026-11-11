# eSchool v2 — Audit Coverage Matrix

> **Purpose:** Tracks 100% discovery coverage across Web Portals (`Phase 1A`) and Android Mobile APKs (`Phase 1B`) before generating final Architecture, Database, API, and UI specifications.

## Summary Status

| Surface | Source | Audit Status | Notes & Deliverables |
| :--- | :--- | :--- | :--- |
| **Web Admin Public & Authenticated** | `https://demo.eschool.com.pk/admin/` | `Complete (100% — Baseline + Section 4.2 + Deep Forensics)` | Merged verified [`reverse-engineering.rar`](file:///D:/eSchool%20v2/docs/reverse-engineering.rar) baseline (`14` modules, `152` RBAC, `41` Data Locks, defects) with live CDP captures ([Batch 1](file:///D:/eSchool%20v2/docs/raw/gap-batch1-profiles-modals.json), [Batch 2](file:///D:/eSchool%20v2/docs/raw/gap-batch2-rbac-siblings-corejs.json), [Batch 3](file:///D:/eSchool%20v2/docs/raw/gap-batch3-ssp-ajax-reports.json), [Batch 4](file:///D:/eSchool%20v2/docs/raw/gap-batch4-printables-pdfs.json), [Follow-up](file:///D:/eSchool%20v2/docs/raw/gap-followup.json), [Batch 5](file:///D:/eSchool%20v2/docs/raw/gap-batch5-deep-forensics.json), [Batch 6](file:///D:/eSchool%20v2/docs/raw/gap-batch6-surgical.json), [Batch 7](file:///D:/eSchool%20v2/docs/raw/gap-batch7-final-forensics.json), [Batch 8](file:///D:/eSchool%20v2/docs/raw/gap-batch8-verify.json)) |
| **Sibling Web Portals & Public Directory** | `https://demo.eschool.com.pk/parent/`, `/teacher/`, `/api/{parents,teachers}/` | `Complete (100% — Phase 1A + Phase 1B Merged)` | Verified active `/parent/` & `/teacher/` portals (`200 OK` + login JS), `404` on `/parents/` `/teachers/` `/student/` `/portal/` `/pay/` `/website/`, & live `GET`/`POST` JSON on `api/*/version.php` & `schools.php` |
| **Mobile: eSchool for Parents** | `eSchool-for-Parents_1.0.20.10.2026_apkcube.apk` | `Complete (100% — Phase 1B)` | `jadx` decompilation (`40` endpoints, `12` host gates) documented in [`03-PHASE-1B-MOBILE-API-INVENTORY.md`](file:///D:/eSchool%20v2/docs/03-PHASE-1B-MOBILE-API-INVENTORY.md) & merged into `/api/v1/parent/*` |
| **Mobile: eSchool for Teachers** | `eSchool-for-Teachers_1.0.07.10.2026_apkcube.apk` | `Complete (100% — Phase 1B)` | `jadx` decompilation (`32` endpoints, `AttendanceTime 0|1|2`) documented in [`03-PHASE-1B-MOBILE-API-INVENTORY.md`](file:///D:/eSchool%20v2/docs/03-PHASE-1B-MOBILE-API-INVENTORY.md) & merged into `/api/v1/teacher/*` |
| **Final `.NET 10` + React Blueprint Suite** | `D:\eSchool v2\docs\01`..`07` | `Complete (100% — Ready for [VERIFY] Sign-Off)` | Locked targets: 3 React+Vite SPAs (Admin, Parent, Teacher) + ASP.NET Core `.NET 10` Modular Monolith (`PostgreSQL 17`, `EF Core 10`, `JWT Bearer`, `/api/v1/...`). **Code HOLD active.** |

---

## Final Phase 2 Blueprint Deliverables (`D:\eSchool v2\docs\`)

| Doc | Scope & Stack Alignment | Link |
| :-: | :--- | :--- |
| **01** | PRD, Personas (`9`), Core User Stories, `152` RBAC & Overrides, `41` Locks, `TenantFeatureFlags`, `.NET 10` Auth Policies | [`01-PRD-AND-USER-ROLES.md`](file:///D:/eSchool%20v2/docs/01-PRD-AND-USER-ROLES.md) |
| **02** | Complete React Router Sitemap & Screen Specs for `/admin/*` (`14` modules + 360 views + Modals), `/parent/*`, `/teacher/*` | [`02-SITEMAP-AND-SCREEN-SPECS.md`](file:///D:/eSchool%20v2/docs/02-SITEMAP-AND-SCREEN-SPECS.md) |
| **03** | Unified `.NET 10` `/api/v1/...` OpenAPI Data Contracts, DTOs, `RFC 7807` errors, `12` SSP & Pipe AJAX raw baselines, Bank/Payment webhooks | [`03-API-AND-DATA-CONTRACTS.md`](file:///D:/eSchool%20v2/docs/03-API-AND-DATA-CONTRACTS.md) |
| **04** | Unified PostgreSQL 17 + EF Core 10 ERD (`9` module schemas, `Mermaid erDiagram`, normalized Guardians, SS `CHECK`, COA/Asset integrity) | [`04-DATABASE-ERD.md`](file:///D:/eSchool%20v2/docs/04-DATABASE-ERD.md) |
| **05** | Business Rules, `Basic/Medical`, Payroll Slabs, Auto-GL & Leave Forensics, `10` PDFs + Marks `.xlsx`, `15` Billing & `14` Payroll Reports, `26` Defects & `[VERIFY]` Register | [`05-BUSINESS-RULES-AND-REPORTS.md`](file:///D:/eSchool%20v2/docs/05-BUSINESS-RULES-AND-REPORTS.md) |
| **06** | Tailwind CSS Design Tokens, Light/Dark Shells (`Admin`/`Parent`/`Teacher`), Full `Lucide React` Map, Exact `Recharts` Specs & Category A/B/C UI Patterns | [`06-UI-DESIGN-SYSTEM.md`](file:///D:/eSchool%20v2/docs/06-UI-DESIGN-SYSTEM.md) |
| **07** | ASP.NET Core `.NET 10` Modular Monolith + React/Vite Monorepo Plan, MySQL->PG17 ETL Sanitization, Phased Delivery & Test Strategy | [`07-MODULAR-MONOLITH-PLAN.md`](file:///D:/eSchool%20v2/docs/07-MODULAR-MONOLITH-PLAN.md) |
| **08** | Portable Phase 0–5 Master Execution Checklist, Defect (`D1`–`D26`) & `[VERIFY]` Gates, + New-PC Kickoff Prompt | [`08-MASTER-TASK-PLAN.md`](file:///D:/eSchool%20v2/docs/08-MASTER-TASK-PLAN.md) |

---

## Phase 1A — Web Portal Modules & Section 4.2 Gap Closure (`demo.eschool.com.pk`)

| Discovery Stream / Check | URL / Artifact Captured | Status | Resolved Facts & Remaining `[VERIFY]` Unknowns |
| :--- | :--- | :--- | :--- |
| Root Redirect & Public Login | `/` → `/admin/`, `/admin/ajax/login.php`, `verify-2fa.php` | `Complete (100%)` | `302 Found`, `PHPSESSID` (`HttpOnly`, `Secure`), Google reCAPTCHA v3 + TOTP/Email 2FA |
| Prior Web Admin Baseline | `reverse-engineering.rar` (`14` modules, `152` RBAC, `116` screenshots) | `Complete (100%)` | Reused verified functional specs, `41` Data Locks, `72`/`48` export schemas & defect log; ignored old Next.js/NestJS/Laravel blueprint |
| Student 360 & HR 360 + All 16 Modals | `students/profile.php?Id=806`, `hr/profile.php?Id=25`, `16` action modals (`docs/raw/gap-batch1-profiles-modals.json`) | `Complete (100%)` | Confirmed `Comments.Nature` enum (`2=Excellent, 1=Good, 0=Normal, -1=Bad, -2=Worst`), `manage-login` Father/Mother states, Attendance summaries |
| Revisions, Homework, Billing & Payroll Modals | `revisions` (`20,6,2`), `homework` (`233`), `view/edit/collect-fee` (`22791`), `view/edit-payroll` (`522`) (`gap-followup.json`) | `Complete (100%)` | Confirmed selective per-field revision checkboxes, 5-star homework grading, `1..6` installments (`V`/`I`), `MaxFeeFine` cap math, `Basic = round(Gross/1.10)` & `edit-payroll` tax recalculation |
| 5 Unlisted RBAC Pages & Settings/SMS | `depreciation.php`, `backups.php`, `payment-methods.php`, `inquiry-sources.php`, `email-templates.php`, `settings.php`, `sms-services.php` (`gap-batch2`) | `Complete (100%)` | Confirmed first 4 return `HTTP 200` (with full JS logic) & `email-templates.php` returns `HTTP 404`; confirmed `{ServiceId}` on `toggle-sms-service-status` & all `6` Settings tabs + hidden flags |
| Sibling Web Portals & Mobile Directory | `/parent/`, `/teacher/`, `/api/{parents,teachers}/{version,schools}.php` (`gap-batch2` & `gap-followup`) | `Complete (100%)` | `/parent/` & `/teacher/` live `200 OK` (`#frmLogin` + `#frmPassword` JS captured); directory endpoints work with both `GET` & `POST`; unauthenticated `download-fee.php` returns required-data error |
| Raw SSP, Filters, Pipe AJAX & Counts | `12` SSP endpoints, `5` filter endpoints, `10` pipe AJAX, `5` GL financial statements, `5` Dashboards (`gap-batch3`) | `Complete (100%)` | Reconciled **`15` Billing reports** (fixing `#BtnView -> students/` bug), **`583` Accounts Vouchers** (`07` had `6,547`), `debits=credits` on `TB`, `6` Ledger drilldowns, & all Google Charts colors (plus `hr/index.php` `500` & `setupPettyCashChart` crash) |
| Printable PDFs & Exports (`pdfjs-dist` + XLSX) | `10` live PDFs (`Student Report Card` incl.) + `Class Marks Sheet` `.xlsx` + Thermal JS (`gap-batch4..7`) | `Complete (100%)` | Captured exact dimensions & fields for Fee Challan (3-copy A4-P), Reg Receipt, SLC (A4-L), Pay Slip (A4-P), Final Settlement (A4-P), Loan & Accounts Vouchers (A4-L), Petty Cash Receipt/Expense (A4-P), **Student Report Card (`210x297mm` PDF)**, & **Class Marks Sheet (`.xlsx` frozen `D7`)**. Remaining `[VERIFY]`: Thermal ESC/POS bytes & Mobile Weekly/Daily/Appraisal PDFs |
| Deep Domain Forensics (Payroll/Leave/Auto-GL/Checkout) | Tax/PF/EOBI/SS slabs, `32` Payslips (`2019–2026`), Leave Modals, Accounts `Settings`+`Ledgers`, `/pay/` & Blinq/KuickPay (`gap-batch5..8`) | `Complete (100% Live Boundary)` | Verified FY `2017–24` Tax & `2020–27` PF slabs (top-cap behavior), `Leave` Sandwich enum (`N/S/B`), Remainder-first EMI (`LP000382=13,334`, `LP000372=3,334`), **`14` Payroll reports**, `JV(239)+PV(322)+RV(17)+CV(5)=583`, Billing->GL accrual & arrears-exclusion rule, & `/pay/<md5>/` `404` on demo. Remaining `[VERIFY]` server code items narrowed to clean-room UAT rules in `05` §5 |

---

## Phase 1B — Mobile: eSchool for Parents (`com.sw3solutions.eschoolforparents`)

**Base API URLs Observed:** `https://demo.eschool.com.pk/api/parents/` (relay fallback `https://eschool-parents-app.mt-shahzad.workers.dev/` with `[REDACTED - App.RELAY_API_KEY]`)  
**Full Phase 1B Spec:** [`03-PHASE-1B-MOBILE-API-INVENTORY.md`](file:///D:/eSchool%20v2/docs/03-PHASE-1B-MOBILE-API-INVENTORY.md)

| Module / Screen Class | Discovered Endpoints | Triage Status | Deep Decompile Status |
| :--- | :--- | :--- | :--- |
| Auth & Account (`Account`, `ResetPassword`, `ReConnect`, `HomeSettings`) | `login.php`, `logout.php`, `setup-account.php`, `reset-password.php`, `update-password.php`, `schools.php`, `version.php` | `Endpoints Listed` | Extracted (`POST` + Relay + `User-Agent`; see `03-PHASE-1B`) |
| PIN Verification (`Account`, `ResetPassword`) | `generate-pin-code.php`, `verify-pin-code.php`, `generate-account-pin-code.php`, `verify-account-pin-code.php` | `Endpoints Listed` | Extracted (5/day limit; `[UNRESOLVED]` SMS gateway) |
| Dashboard & Children (`HomeDashboard`, `HomeChilds`) | `students.php` | `Endpoints Listed` | Extracted (Full Child + Nested Info Schemas) |
| Student & Parent Profiles (`StudentProfile*`, `StudentParents*`) | `get-student-profile.php`, `save-student-profile.php`, `get-parents-profile.php`, `save-parents-profile.php` | `Endpoints Listed` | Extracted (`Locations.towns` JSON-in-string; Base64 pic) |
| Attendance (`StudentAttendance*`) | `attendance.php` | `Endpoints Listed` | Extracted (Calendar grid + `"date=status"` delimiter) |
| Billing & Online Payments (`StudentBilling`, `PayOnline`, `PayVia*`) | `billing.php`, `download-fee.php?FeeId=`, `/pay/<md5(VoucherNo)>/`, `payments/blinq/index.php?VoucherNo=`, `payments/kuickpay/index.php?VoucherNo=` | `Endpoints Listed` | Extracted (`FeeDetails[]`; `[UNRESOLVED]` gateway callbacks) |
| Exams, Homework, Weekly Plans, Daily Report & Timetable | `exams.php`, `homework.php`, `weekly-plans.php`, `daily-report.php`, `timetable.php` | `Endpoints Listed` | Extracted (Full schemas + tenant host gates) |
| Documents & Viewers (`StudentDocuments`, `PdfViewer`, `PictureViewer`, `VideoPlayer`) | `documents.php` | `Endpoints Listed` | Extracted (`?Inline=Y` PDF loader + `DownloadManager`) |
| Comments & Leaves (`StudentComments`, `HomeLeaves`, `LeaveApplication`) | `comments.php`, `leaves.php`, `save-leave.php` | `Endpoints Listed` | Extracted (`Nature` tints; comma-separated `Students`) |
| PTM Requests (`HomePtm`, `HomePtmDetail`, `RequestPtm`) | `ptm-requests.php`, `save-ptm-request.php`, `ptm-comments.php`, `save-ptm-comments.php` | `Endpoints Listed` | Extracted (`unity.eschool.pk` gate; `spnrReligion` bug noted) |
| Notices, Events, Blog & Facebook (`HomeNotices*`, `HomeEvents`, `HomeBlog*`, `HomeFacebook*`) | `notices.php`, `events.php`, `posts.php`, `post-comments.php`, `save-comments.php`, `facebook.php` | `Endpoints Listed` | Extracted (`Attachments[]` & `Pictures[]`; `blog.json`/`posts.json` quirk) |
| Push Notifications (`FcmNotificationService`, `FcmNotification`) | Firebase Cloud Messaging (`App.sTokenId` -> `TokenId` field) | `Class Observed` | Extracted (`Title`, `Message`, `Summary`, `Website` keys) |

---

## Phase 1B — Mobile: eSchool for Teachers (`com.sw3solutions.eschoolforteachers`)

**Base API URL Observed:** `https://demo.eschool.com.pk/api/teachers/`  
**Full Phase 1B Spec:** [`03-PHASE-1B-MOBILE-API-INVENTORY.md`](file:///D:/eSchool%20v2/docs/03-PHASE-1B-MOBILE-API-INVENTORY.md)

| Module / Screen Class | Discovered Endpoints | Triage Status | Deep Decompile Status |
| :--- | :--- | :--- | :--- |
| Auth & Account (`Account`, `ResetPassword`, `ReConnect`, `HomeSettings`) | `login.php`, `logout.php`, `setup-account.php`, `reset-password.php`, `update-password.php`, `schools.php` (`GET`), `version.php` (`GET`) | `Endpoints Listed` | Extracted (`Gender` + `EmployeeId`; `eschoolghana.com` gate in Reset) |
| PIN Verification (`Account`, `ResetPassword`) | `generate-pin-code.php`, `verify-pin-code.php`, `generate-account-pin-code.php`, `verify-account-pin-code.php` | `Endpoints Listed` | Extracted (5/day limit; `[UNRESOLVED]` SMS gateway) |
| Classes & Students (`HomeClasses`, `StudentsList`) | `classes.php`, `students.php` | `Endpoints Listed` | Extracted (`Classes` + `Subjects[]` + `StudentSessionId`) |
| Attendance (`HomeAttendance`, `StudentsAttendance`) | `attendance.php` (self), `students.php`, `save-attendance.php` | `Endpoints Listed` | Extracted (`AttendanceTime` modes `0`/`1`/`2`; `Students` JSON array) |
| Homework (`StudentsHomework*`) | `homework.php`, `save-homework.php`, `delete-homework.php` | `Endpoints Listed` | Extracted (Dynamic `AttachmentType/Name/Data{i}` Base64) |
| Lesson Plans & Timetable (`HomeLessonPlans`, `HomeTimetable*`) | `lesson-plans.php`, `timetable.php` | `Endpoints Listed` | Extracted (`anes.eschool.pk` + `taaleem.eschool.pk` gates) |
| Teacher HR: Appraisals, Leaves, Loans & Payroll (`HomeAppraisals`, `HomeLeaves`, `LeaveApplication`, `HomeLoans`, `HomePayroll`) | `appraisals.php`, `leaves.php`, `save-leave.php`, `loans.php`, `payroll.php`, `download-salary-slip.php?SalaryId=&AccountId=` | `Endpoints Listed` | Extracted (`Types`+`Quota`+`Leaves`; `Bonuses`/`Allowances`/`Installments`/`PaymentMode`) |
| Notices, Events, Blog & Facebook (`HomeNotices*`, `HomeEvents`, `HomeBlog*`, `HomeFacebook*`) | `notices.php`, `events.php`, `posts.php`, `post-comments.php`, `save-comments.php`, `facebook.php` (`sServer`) | `Endpoints Listed` | Extracted (Full schemas + WebView CSS) |
| Push Notifications (`FcmNotificationService`, `FcmNotification`) | Firebase Cloud Messaging (`App.sTokenId` -> `TokenId` field) | `Class Observed` | Extracted (`Title`, `Message`, `Summary`, `Website` keys) |
