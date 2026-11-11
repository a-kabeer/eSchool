# eSchool v2 — UI Design System & Frontend Component Architecture

> **Provenance:** Synthesized from Phase 1A Web Admin Audit (`reverse-engineering.rar`), Live CDP Captures (`docs/raw/gap-batch1..4.json`), and Phase 1B Mobile UI Patterns (`03-PHASE-1B-MOBILE-API-INVENTORY.md`).  
> **Locked Target UI Stack (Initial Release Web Portals):** **React 19 + TypeScript + Vite + React Router v7 + Tailwind CSS + Lucide React + Recharts** shared across **Admin Portal**, **Parent Portal**, and **Teacher Portal**.

---

## 1. Visual Modernization Strategy (Legacy jQuery UI -> Tailwind Design System)

| Legacy Pattern Observed | Pain Point / Technical Debt | eSchool v2 Target Standard |
| :--- | :--- | :--- |
| jQuery UI themes (`blitzer` Red, `redmond` Blue, `smoothness` Black) | Fixed `960px`/`1100px` boxes, `Verdana 10px–16px`, inconsistent margins, no mobile breakpoint | **Semantic CSS Variables + Tailwind Tokens** supporting Light (default), Dark, and optional Campus Accent presets (Crimson `#dc2626`, Cobalt `#2563eb`, Slate `#0f172a`) |
| `$.colorbox` nested `<iframe>` popups | Broken back-button history, double scrollbars, lost form state on refresh | **URL-Routed Detail Pages** (for 360 views), **Slide-Over Drawers** (quick create/edit/view), and **Accessible Dialogs** (confirmations, SMS/Push/Comments) |
| Legacy `Grid Menu` vs `Dashboard` toggle | Requires full mode switch to find routes | **Persistent Collapsible Left Sidebar + `Ctrl+K` Global Command Palette** + Quick-Launch Tile Grid view option |
| Tiny `16x16` `.png/.gif` icon columns | Zero touch targets on mobile (`< 44px`), unclear states, double-click races | **`Lucide React`** (`16px` inline / `20px` nav) icon buttons inside accessible `36px–40px` hit areas + tooltips + overflow `...` row menu on narrow screens |
| `EasyPieChart` + `Google Charts` (`arrayToDataTable`) | Mixed `#f6f6f6` boxes, crashes (`hr/index.php` 500, `setupPettyCashChart` ref error, `setupFeeCategoriessChart`) | Unified responsive **`Recharts`** components inside clean elevated cards with synchronized hover tooltips and empty/error states |
| `CKEditor 4` + `Plupload` + `jQuery DataTables 1.9` | Legacy Flash/jQuery plugins, chunk inconsistencies, non-responsive wide tables | **TipTap** (sanitized HTML editor for Homework/Blog/Email), **Native Chunked/Resumable `multipart/form-data` Uploader**, and **TanStack Table v8** Server-Side DataGrid |

---

## 2. Design Tokens (`CSS Variables` + Tailwind v4 Theme)

### 2.1 Color System & Data-Viz Palette
```css
:root {
  /* Surfaces */
  --bg-canvas: #f8fafc;        /* Slate 50 */
  --bg-surface: #ffffff;
  --bg-subtle: #f1f5f9;        /* Replaces legacy #f6f6f6 chart container */
  --border-default: #e2e8f0;

  /* Typography */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;

  /* Campus Accent (Tenant/User Theme Preset) */
  --brand-primary: #0096dc;    /* Matches legacy primary chart/info blue */
  --brand-primary-hover: #0284c7;
  --brand-crimson: #dc2626;    /* Modernized 'blitzer' preset */
  --brand-cobalt: #337ab7;     /* Legacy Bootstrap/Student-chart blue */

  /* Semantic Financial & Operational Status */
  --status-paid: #04c300;      /* Collected / Present / Positive */
  --status-warning: #ff9900;   /* Un-Paid / Pending / Partial / Tax */
  --status-danger: #dc3912;    /* Defaulter / Overdue / Absent / Rejection */
  --status-info: #00339a;      /* Fine Received / Deep Accent */
  --status-female: #e7505a;    /* Observed ClassStats Female Bar */
  --status-female-alt: #f66955;/* Observed Gender Pie Female */

  /* Comments.Nature (-2..2) Semantic Badges */
  --nature-2-bg: #dcfce7; --nature-2-fg: #166534;   /* Excellent (2) */
  --nature-1-bg: #ecfdf5; --nature-1-fg: #047857;   /* Good (1) */
  --nature-0-bg: #f1f5f9; --nature-0-fg: #334155;   /* Normal (0) */
  --nature-m1-bg: #fff7ed; --nature-m1-fg: #c2410c; /* Bad (-1) */
  --nature-m2-bg: #fee2e2; --nature-m2-fg: #b91c1c; /* Worst (-2) */
}

.dark {
  --bg-canvas: #09090b;
  --bg-surface: #18181b;
  --bg-subtle: #27272a;
  --border-default: #27272a;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
}
```

### 2.2 Typography, Spacing & Tabular Financials
- **Font Family:** `Inter` (`font-sans`) for UI labels/headings; `JetBrains Mono` (`font-mono`) for Voucher Numbers, Bill Codes, Barcodes (`C###-I####-#####`, `CAT-BOOK-COPY`), CNICs, and GL Account Codes.
- **Financial & Quantitative Alignment:** Every monetary cell, balance column, mark/percentage, invoice amount, and count badge **must apply `tabular-nums`** (`font-variant-numeric: tabular-nums`) and right-alignment inside DataGrids and Printable Previews.
- **Scale:** `H1` Page Title `20px/600`, `H2` Section/Card `16px/600`, `Body` `14px/400`, `Table Cell` `13px/400`, `Badge/Meta` `12px/500`.

---

## 3. Multi-Portal Responsive Layout Shells (`375px`–`1440px+`)

### 3.1 Admin Shell (`AdminShell`)
- **Desktop (`>= 1024px`):** Fixed collapsible Left Sidebar (`260px` expanded / `72px` icon rail) grouped into collapsible accordions for all 14 modules + Top Bar (`56px`) with:
  - Global **Command Search (`Ctrl+K`)**: searches routes, students (Name / Reg #), employees (Name / Emp #), fee Bill #, and GL vouchers.
  - **Campus Scope Selector (`cbSchools[]`)**: Multi-campus or single campus context pill.
  - **Active Academic Session Badge** + Quick Notifications Bell + User Menu (`My Account`, Theme Toggle, Logout).
- **Mobile/Tablet (`375px–1023px`):** Off-canvas Sheet sidebar drawer, responsive Filter Toolbar collapse (`Filters (N)` drawer trigger), and horizontal-scroll-free stacked Card View fallback on DataGrids `< 768px`.

### 3.2 Parent Portal Shell (`ParentShell`)
- **Child Switcher Bar:** Sticky top pill selector showing currently active child (`Photo`, `Name`, `Class/Section`, `Defaulter/Active` badge) enabling 1-click switching across siblings without losing current route context (`/parent/children/:id/...`).
- **Mobile Navigation:** Bottom quick-action bar (`Home`, `Attendance`, `Homework`, `Fees`, `More` drawer) on `< 768px` mirroring mobile ergonomics inside the responsive React web app.

### 3.3 Teacher Portal Shell (`TeacherShell`)
- **Desktop & Tablet-First for Classroom Use:** Prominent Class/Section Context Header, Quick Action Cards (`Mark Today's Attendance`, `Assign Homework`, `Today's Timetable`), and Slide-over Drawer for rapid `P/A/L/H` attendance and homework grading without page reloads.

---

## 4. Complete Lucide React Icon Taxonomy

Replaces all legacy 16x16 GIF/PNG icons consistently across all 3 portals:

### 4.1 Module & Portal Navigation Icons (`lucide-react`)
| Module / Section | Primary Icon | Secondary / Portal Icons |
| :--- | :--- | :--- |
| **Dashboard / Home** | `LayoutDashboard` | `Home`, `BarChart3`, `LayoutGrid` |
| **Management & Security** | `ShieldCheck` | `Settings2`, `MessageSquareMore` (SMS), `Users` (Roles), `UserCog`, `History` (Audit Logs), `Lock` (`41` Data Locks), `DatabaseBackup` (Backups), `CreditCard` (Payment Methods), `Mail` (Email Templates) |
| **Campus Settings** | `SlidersHorizontal` | `Building2` (Schools), `GraduationCap` (Classes), `Layers` (Sections), `CalendarRange` (Sessions), `BookOpenCheck` (Subjects), `Landmark` (Banks), `MapPin` (Cities/Towns) |
| **Students** | `UsersRound` | `UserPlus` (Inquiries/Admissions), `ClipboardList` (Registrations), `CalendarCheck2` (Attendance), `FileEdit` (Revisions), `NotebookPen` (Homework), `ArrowLeftRight` (Transfers), `LogOut` (Withdrawals), `Award` (Graduates), `TrendingUp` (Promotions) |
| **Billing** | `ReceiptText` | `Tags` (Fee Categories), `Calculator` (Structures), `Percent` (Concessions), `Wallet` (Collection), `Split` (Installments), `FileSpreadsheet` (Bulk Revision), `Building` (Bank Reconciliation), `Scale` (Final Settlement), `Webhook` (API Logs) |
| **Exams** | `FileCheck2` | `BookMarked` (Subjects), `Medal` (Grades), `MessageSquareQuote` (Comments), `PenLine` (Marks Entry), `ScrollText` (Report Cards), `PieChart` (Analysis) |
| **Timetable** | `CalendarClock` | `Clock`, `SunSnow` (Seasons), `CalendarDays` (Schedules) |
| **eCalendar** | `Calendar` | `CheckSquare` (Tasks), `Camera` (Photos), `Video` (Videos), `Sparkles` (Events), `Users` (PTM Chat) |
| **HR** | `BriefcaseBusiness` | `IdCard` (Employees), `Network` (Departments), `Clock3` (Rosters), `CalendarOff` (Leaves/Quotas), `ArrowUpRight` (Promotions), `UserMinus` (Resignations), `RotateCcw` (Rejoins), `Laptop` (Assets) |
| **Payroll** | `Banknote` | `Shield` (Social Security/EOBI), `PiggyBank` (Provident Fund), `Landmark` (Income Tax), `HandCoins` (Loans), `Gift` (Bonuses), `Sliders` (Adjustments), `FileSpreadsheet` (Pay Runs) |
| **Petty Cash & Accounts** | `Coins` / `BookOpen` | `ArrowDownLeft` (Receipt), `ArrowUpRight` (Expense), `FolderTree` (COA), `FileDiff` (Vouchers), `BookCopy` (Cheque Books), `Scale` (Trial Balance/BS), `TrendingDown` (Depreciation), `LockKeyhole` (Closings) |
| **Library & Inventory** | `Library` / `Boxes` | `BookCopy`, `QrCode` (Barcodes), `BookUp` (Issue), `BookDown` (Return), `Package`, `Truck` (Transfers), `Wrench` (Serialized Custody) |

### 4.2 Standardized Table Row & Form Action Icons
- **View / Inspect 360:** `Eye` | **Edit / Drawer:** `Pencil` | **Delete (Confirm):** `Trash2` | **Export PDF:** `FileText` | **Download Excel:** `FileSpreadsheet` | **Thermal/Print Preview:** `Printer` | **Toggle Active/Inactive:** `Power` / `ToggleRight` | **Drag Reorder (replacing TableDnD):** `GripVertical` | **Status Badges:** `CheckCircle2` (Approved/Paid), `AlertTriangle` (Warning/Overdue), `XCircle` (Rejected/Inactive), `Clock` (Pending/Lock).

---

## 5. Exact Recharts Dashboard Parity Specifications

Every chart from `dashboard.php`, `students/index.php`, `billing/index.php`, `payroll/index.php`, `hr/index.php`, and missing `PettyCashDashboard` / `setupPettyCashChart` is mapped 1:1 with verified colors and series:

| Dashboard | Chart Component & Legacy ID | `Recharts` Type | Verified Exact Series & Colors |
| :--- | :--- | :--- | :--- |
| **Main** | Attendance Gauges (`6` tiles: Students + Employees Present/Leave/Absent) | Custom SVG Radial Ring *(replacing EasyPieChart)* | `Present` `#04c300`, `On Leave` `#ff9900`, `Absent` `#dc3912` (`tabular-nums` center %) |
| **Main** | `BillingGraph` — *"Month-wise Billing Summary (Year)"* | `BarChart` (`Column`) | `Billed Amount` (`#0096dc`), `Paid Amount` (`#04c300`), `Un-Paid Amount` (`#ff9900`), `Default Amount` (`#dc3912`), `Fine Received` (`#00339a`) |
| **Main** | `PayrollGraph` — *"Month-wise Payroll Summary"* | `AreaChart` | `Payable Amount` (`#0096dc`), `Tax` (`#ff9900`) |
| **Main** | *Petty Cash Summary (Fixing `setupPettyCashChart` crash)* | `BarChart` | `Receipts` (`#04c300`), `Expenses` (`#dc3912`) |
| **Main** | `ClassStrengthGraph` — *"Class wise Students Strength"* | `PieChart` / Donut | Dynamic semantic palette per Class + interactive legend toggle |
| **Main** | `LocationsGraph` — *"Top Student Locations"* | `PieChart` / Horizontal `BarChart` | Top locations ranked descending |
| **Students** | `YearStatsGraph` — *"Month-wise Student Statistics"* | `AreaChart` | `Registrations` (`#0096dc`), `Admissions` (`#04c300`), `Withdrawals` (`#bb0000`), `Re-Joins` (`#ff9900`) |
| **Students** | `ClassStatsGraph` — *"Class-wise Strength & Gender"* | `ComposedChart` (`Area` + `Bar`) | `Area`: `Total Strength` (`#04c300`); `Bars`: `Male Students` (`#0096dc`), `Female Students` (`#e7505a`) |
| **Students** | `NationalitiesGraph`, `ReligionsGraph`, `GendersGraph` | `PieChart` (Donut) | `GendersGraph`: `#337ab7` (Male) / `#f66955` (Female) |
| **Students** | `GraduatesGraph` & `LocationsGraph` | `LineChart` (monotone) & `BarChart` | `Graduates`: `#04c300`; `Locations`: `#337ab7` |
| **Billing** | `DayWiseCollectionGraph` — *"Day-wise Fee Collection"* | `LineChart` (`type="monotone"`) | `Amount` (`#0096dc`, gradient area fill optional) |
| **Billing** | `FeeCategoriesChart` *(fixing double-`s` typo)* | Horizontal `BarChart` | `Amount` (`#0096dc`), `Concession` (`#ff9900`) |
| **Billing** | `MonthlyGraph` & `YearlyGraph` | `BarChart` | `Billed` (`#0096dc`), `Paid` (`#04c300`), `Un-Paid` (`#ff9900`), `Default` (`#dc3912`), `Fine Received` (`#00339a`) |
| **Payroll** | `PayrollSummaryGraph`, `MonthlyLoanGraph`, `YearlySummaryGraph` | `AreaChart`, `BarChart`, `BarChart` | `Payroll`: `Payable Amount` (`#0096dc`), `Tax` (`#04c300` / `#ff9900`); `Loan`: `Loan Issued` (`#0096dc`), `Loan Recovered` (`#04c300`); `Yearly`: `Gross` (`#0096dc`), `Payable` (`#04c300`) |
| **HR** | `YearStatsGraph` *(fixing `HTTP 500` crash)* + `Subjects`, `Departments`, `Nationality`, `Religion`, `Genders`, `Locations` | `AreaChart` + `BarChart` + `PieChart` | `YearStats`: `Joinings` (`#04c300`), `Resignations` (`#bb0000`), `Re-Joins` (`#ff9900`); restored all 6 HR breakdown charts |
| **Petty Cash** | `MonthlySummaryGraph` & `YearlySummaryGraph` | `BarChart` | `Receipts` (`#04c300`), `Expenses` (`#dc3912`) |

---

## 6. Standardized UI Pattern Components & Category A/B/C Experience Upgrades

### 6.1 Core Reusable Component Library (`packages/ui`)
1. **`<ServerDataGrid<T> />` (TanStack Table + URL Sync):**
   - Replaces legacy DataTables 1.9 SSP HTML payloads and DOM state loss.
   - URL query-synced pagination (`page`, `pageSize` defaulting to User Preference `10|25|50|100`), debounced search (`300ms`), server sort headers, multi-select toolbar filters, bulk select checkboxes + contextual bulk action bar (only rendered if row actions permitted by RBAC).
   - Responsive mobile mode automatically stacks columns into clean key-value cards `< 768px`.
2. **`<FormSectionAccordion />` & `FormValidator` -> `React Hook Form + Zod`:**
   - Every legacy `FormValidator` code (`B` required, `C` alpha, `N` numeric, `F` float, `S` safe text, `E` email, `U` URL, `P` phone/mobile, `L(N)` min length) maps to reusable **Zod schemas** displaying inline field errors plus a top summary banner for server `RFC 7807` validation errors and `Data Lock` cutoff date tooltips on date inputs.
   - Replaces `Select All` accordion limitation (`students/lists.php`) with **Global Select All + Per-Accordion Select All**.
3. **`<Student360Layout />` & `<Employee360Layout />`:**
   - Sticky top Hero Card (Avatar, Status Pill, Defaulter/Deposit Alert, Quick Action Buttons grouped cleanly) + URL-synchronized horizontal Tabs (`?tab=profile|siblings|attendance|...` honoring `cbStudentTabs[8]` / `cbEmployeeTabs[10]` RBAC visibility) + Slide-Over Action Drawers (replacing all 8+8 Colorbox modals!).
4. **`<FieldDiffReviewDrawer />` (Replaces `students/revisions.php` modals):**
   - Side-by-side `Field | Current Value | Requested Value` diff highlights with per-field Accept/Reject checkboxes, `Check All`, `Clear`, Photo side-by-side comparison, and Atomic Process button.
5. **`<TimetableDragBoard />` (Replaces `timetable/scheduler.js`):**
   - Clean accessible `Period × Day (Mon–Sat[+Sun])` matrix supporting drag/drop AND keyboard/select assignment, showing inline teacher badge and instant optimistic revert + toast when server returns `409 Clash`.
6. **`<PrintPreviewSheet />` & `<ThermalReceiptModal />`:**
   - Renders clean React `@media print` preview OR embedded server PDF (`A4 Portrait` / `A4 Landscape`) in a modal drawer, plus an 80mm thermal slip preview with one-click print / printer bridge trigger.
7. **`<ChunkedFileDropzone />` & `<TipTapRichEditor />`:**
   - Replaces `Plupload` with native drag-and-drop progress uploads + image cropper (`Center & Crop` vs `Fit to Size`), and replaces `CKEditor 4` with sanitized `TipTap` (DOMPurify clean HTML output).

### 6.2 Modernization Enhancements Matrix (Category A / B / C)
- **Category A (Strict Legacy Parity Preserved):** All 14 Admin modules, 152 RBAC granularity + per-user tab/school/misc overrides, 41 Data Locks, 9 Student 360 tabs, 11 HR 360 tabs, Dual Dashboard toggle, Parent multi-child flows, Teacher `AttendanceTime` & Leave Quotas.
- **Category B (UX & Defect Fixes):** All 26 confirmed defects (`D1`–`D26` from `05-BUSINESS-RULES-AND-REPORTS.md`), converting 100+ Colorbox nested iframes to drawers/routes, responsive 375px grids, keyboard shortcuts (`Ctrl+K`), accessible contrasts, live bulk fee revision preview table, working Calendar Month/Week/Day views.
- **Category C (High-Value Capabilities Built Cleanly):** Real-time Web Push / SSE alerts (PTM chat, revision approvals, fee receipts), automated Exit Clearance linking `HR Resignations -> Library Returns -> Inventory Custody -> Payroll Final Settlement -> Billing Final Settlement`, consolidated Multi-Campus Executive KPI Switcher, and interactive Trial Balance -> General Ledger -> Source Voucher drilldown chain.
