# eSchool v2 — Multi-Portal Sitemap & Complete Screen Specifications

> **Provenance:** Merged from Phase 1A Baseline (`01`/`02`), Live CDP Gap Captures (`docs/raw/gap-batch1..4.json`, `docs/raw/gap-followup.json`), and Phase 1B Mobile Decompilation (`03-PHASE-1B-MOBILE-API-INVENTORY.md`).  
> **Target Frontend Stack (Initial Release):** **React + TypeScript + Vite + React Router + Tailwind CSS + Lucide React + Recharts** across **3 dedicated web portals** (`Admin`, `Parent`, `Teacher`). Legacy Colorbox nested `<iframe>` popups are modernized into **URL-routed detail pages**, **slide-over Drawers**, and **Modal dialogs**.

---

## 1. Global SPA Routing Map (React Router)

| Portal App | Legacy Entrypoint | Target Base Path | Auth & Layout Shell |
| :--- | :--- | :--- | :--- |
| **Admin Portal** | `/admin/` (`dashboard.php` + 14 modules) | `/admin/*` | `AdminAuthLayout` (`/admin/login`, `/2fa`, `/forgot-password`) -> `AdminShell` (Collapsible Left Sidebar + Top Command Bar `Ctrl+K` + Campus/Session Switcher + `<Outlet />`) |
| **Parent Portal** | `/parent/` + `eSchool for Parents` APK (`21` screens) | `/parent/*` | `PortalAuthLayout` (`/parent/login`, `/setup-account`, `/reset-password`) -> `ParentShell` (Left Drawer/Nav + Child Switcher Pill + `<Outlet />`) |
| **Teacher Portal** | `/teacher/` + `eSchool for Teachers` APK (`18` screens) | `/teacher/*` | `PortalAuthLayout` (`/teacher/login`, `/setup-account`, `/reset-password`) -> `TeacherShell` (Left Nav + Campus/Class Quick Switcher + `<Outlet />`) |

---

## 2. Admin Portal — Complete Sitemap & Screen Specs (`/admin/*`)

### 2.0 Auth, Dashboard & My Account (`/admin/login`, `/admin`, `/admin/my-account`)
- **`/admin/login`, `/admin/2fa`, `/admin/forgot-password`**:
  - Login (`txtEmail` max 100, `txtPassword` max 30, invisible bot protection token).
  - TOTP 2FA (`txtCode` 6-digit numeric + `"Get Code via Email"` fallback).
  - Forgot Password (`txtLoginEmail`).
- **`/admin` (`dashboard.php` parity)**:
  - Dual mode toggle (`Grid Menu` [13 sections, 147+ tiles] ↔ `Analytics Dashboard`).
  - Analytics Mode: Campus Filter (`#ddSchools` multi-select), Session/Month KPI cards, `6` EasyPieChart-style Radial Gauges (`Students` & `Employees`: Present, On Leave, Absent), Recharts `Month-wise Billing Summary` (`Billed Amount`, `Paid Amount`, `Un-Paid Amount`, `Default Amount`, `Fine Received`), Recharts `Month-wise Payroll Summary` (`Payable Amount`, `Tax`), Recharts `Class wise Students Strength` Pie, and Recharts `Top Student Locations` Pie *(fixing legacy `setupPettyCashChart` crash)*.
- **`/admin/my-account`**:
  - Tabs: `Profile & Preferences` (`txtName` max 50, `txtEmail` max 100, `ddRecords` `10|25|50|100`, `ddTheme` Light/Dark/Red/Blue/Black), `Profile Picture` (`<=2MB` image cropper), `Change Password` (`txtOldPassword`, `txtNewPassword`, `txtConfirmPassword`), `Two-Factor Authentication` (QR code + manual key + enable/disable modal).

---

### 2.1 Management (`/admin/management/*` — 6 Nav + 3 Unlisted RBAC Routes)
| Route | Legacy Script | Screen Pattern & Key Verified Specs |
| :--- | :--- | :--- |
| `/admin/management/settings` | `management/settings.php` | 6-tab System Settings: **General** (`txtSiteTitle*`, `txtCopyright*`, `ddDateFormat`, `ddTimeFormat`, `ddImageResize`, `ddTheme`, `ddPasswordChangeDays` `0/30/60/90`, `ddPasswordReuse` `0..3`, `txtThermalPrinterIp`), **Billing** (`ddAdvanceIncomeTax`, `txtTaxableFeeAmount`, `txtFeeTaxRate`, `txtLateFeeFine`, `txtMaxFeeFine`, `txtLastFeeDay`, `txtRegistrationFee`, `cbFeeCollectionMethods[]` [`CA,BC,BT,CH,OL`], `ddAcceptPartialFee`, `ddCashFeeReceipt`, `ddIncludeUnpaidVouchers`), **Payroll** (`txtNonPermanentSalaryTaxRate`, `txtContractTaxPayerRate`, `txtContractNonTaxPayerRate`, `txtMaleEobiExemptionAge`, `txtFemaleEobiExemptionAge`, `ddPayrollStartDay` `1..31`), **Library** (`txtLibraryName`, `txtNoOfBooks`, `txtIssueDays`, `txtLateReturnFine`, `txtMaxReturnFine`), **Emails** (`General`, `Newsletter`, `SMTP` `tls/ssl`), **Website** (`txtHeader`, `txtFooter`), plus **12 hidden flags promoted to Tenant Feature Flags UI** (`ddSefMode`, `ddStartYear`, `WebsiteMode`, `txtFbPageId`, `ddStudentsSaturday`, `ddEmployeesSaturday`, `txtStudentsTimeInMargin`, `txtEmployeesTimeInMargin`, `ddStudentsAttendance`, `ddSubjectWiseAttendance`). |
| `/admin/management/sms-services` | `management/sms-services.php` | 12 SMS gateway rows (`GSM Modem`, `Ufone`, `Mobilink`, `Telenor`, `Zong`, `SMS 4 Parents`, `Bulk SMS`, `SMS Point`, `Outreach`, `Futuresol`, `SMS Portal`, `Biz SMS`), TableDnD order, Status toggle (`ServiceId` param verified), Edit drawer, Test SMS modal (`txtMobile`, `txtMessage`, `English/Urdu`). |
| `/admin/management/user-types` | `management/user-types.php` | Role list + 152-row `Section \| Page \| V \| A \| E \| D \| X \| ALL` matrix editor. |
| `/admin/management/users` | `management/users.php` | Admin users grid (filters: `School`, `Type`, `Status`, Excel export) + User Form (`txtName`, `txtMobile`, `txtEmail`, `txtPassword`, `ddType`, `cbSchools[]`, `cbDashboards[6]`, `cbMiscRights[8]`, `cbStudentTabs[8]`, `cbEmployeeTabs[10]`, `147`-row per-user overrides, Disable 2FA action). |
| `/admin/management/logs` | `management/logs.php` | Audit trail grid (`23,589` rows SSP) with `Module`, `Section`, `Action`, `Admin`, `From/To Date` filters and Old/New JSON diff viewer drawer (masking sensitive IPs/secrets). |
| `/admin/management/locks` | `management/locks.php` | `41`-section historical cutoff date locks (`LockId`, `Date` `yy-mm-dd`) with inline datepicker edit. |
| `/admin/management/backups` | `management/backups.php` *(Unlisted `200`)* | DB backup generator, backup history grid (`#`, `File`, `Date`, `Size`, `Options`), restore confirmation modal, multi-delete. |
| `/admin/management/payment-methods` | `management/payment-methods.php` *(Unlisted `200`)* | Gateway/method configuration table (`Mode`, `Status`, `Options`), edit drawer, status toggle. |
| `/admin/management/email-templates` | `management/email-templates.php` *(Legacy `404` -> New)* | Rich-text email templates manager for 2FA OTP, Password Reset, and Parent/Teacher Onboarding. |

---

### 2.2 Settings (`/admin/settings/*` — 12 Sub-Modules)
- **`schools`**: Multi-campus list (`10` rows), School timings (`StudentsTimeIn`, `EmployeesTimeIn`, `EmployeesTimeOut`), `SmsMask`, `DefaultBankAccount`, Logo crop/upload, School Merge modal.
- **`classes` & `sections` & `sessions`**: Drag-sortable Class & Section masters (`Capacity`, multi-school checkboxes, composite `(Section, Class)` uniqueness), Academic Sessions (`StartDate`, `EndDate`, `IsLocked`, backup/restore).
- **`subjects`**: Title, Code, `cbClasses[]`, `TuitionFee` + `TaxableTuition`, `LabFee` + `TaxableLab`.
- **Reference Masters (`religions`, `nationalities`, `cities`, `towns`, `occupations`)**: Standard TableDnD CRUD + composite `(Town, City)` uniqueness.
- **`banks` & `bank-accounts`**: Bank master with `BillingAPI` flag + logo; Bank Account master (`Bank`, `AccountTitle`, `AccountNo` unique max 30, `Address`, `Phone`, `Fax`).

---

### 2.3 Students (`/admin/students/*` — 23 Nav + 1 Unlisted + Student 360 + 8 Modals)

#### Student 360 Profile (`/admin/students/:id` — `students/profile.php?Id=`)
Verified live on `Id=806` (`Abdul Basit`, `000806`):
- **Header Summary Card:** Photo, Name, School, Class/Section, Registration #, Registration Date, Joining Date, Current Session, Status (`Active`/`Defaulter` balance + `Security Deposit` balance), Address, Phone, Mobile, Email.
- **9 Profile Tabs** *(controlled by `cbStudentTabs[8]` + fixed `History`)*:
  1. `Profile` (`#tabs-1`): Personal Info (`DOB`, `Birth Place`, `Disability`, `B-Form #`, `Weight`, `Height`, `Blood Group`, `Hand`, `Religion`, `Nationality`), Father Info, Mother Info, Emergency Contact.
  2. `Siblings` (`#tabs-2`): Linked siblings list.
  3. `Attendance` (`#tabs-3`): `Last 15 Attendance Records` (`Date`, `Time IN`) + `Attendance Summary` (`Month`, `Presents`, `Absents`, `Leaves`, `Holidays`, `Late Comings`, `Avg. Time IN`).
  4. `Leaves` (`#tabs-4`): `#`, `From Date`, `To Date`, `Details`, `Status`, attachment download.
  5. `Exams` (`#tabs-5`): Exam score cards & report card downloads per session/exam.
  6. `Billing` (`#tabs-6`): Active `Fee Concessions` table + Session-grouped `Fee Bills` accordions (`Bill #`, `Billing Period`, `Amount`, `Due Date`, `Paid Date`, `Fine`, `Options`: Info, `View`, `Export PDF`, `Edit Due Date`, `Print Receipt`) + `Final Settlements`.
  7. `Documents` (`#tabs-7`): `#`, `Document`, `Title`, `Details`, `Options` (download, delete). *(Verified hidden/omitted on `Id=806` when restricted or empty, rendered via `get-documents.php` table).*
  8. `Comments` (`#tabs-8`): Color-tinted comment cards (`.lightGreen`/red/neutral based on `Nature`) showing Title, Comment, Date, Posted By, Delete icon.
  9. `History` (`#tabs-9`): Lifecycle log (`#`, `Action` [`Joining`/`Transfer`/etc.], `Date`, `School`, `Class/Section`, `Registration/Roll No`, `Session`).
- **All 8 Quick-Action Modals (`students/profile.js`, verified live):**
  1. `Edit Profile` (`edit-student.php`): Full 6-accordion student editor *(RBAC-restricted on demo)*.
  2. `Fee Concession` (`fee-concession.php`): `ddConcession`, `txtStartDate`, `txtEndDate`, `txtComments`, `fileDocument`.
  3. `Custom Fee` (`custom-fee.php`): `txtIssueDate`, `txtDueDate`, `ddPaid` (`N`/`Y` -> `txtPaidDate`, `txtFine`, `ddPaymentMode` [`CA/BC/BT`], `ddBankAccount`, `txtChequeNo`), `txtBillTitle`, `ddBillingMonth`, `ddBillingYear` (fixing `1..2027` bug!), repeatable `ddFeeCategory[i]` + `txtAmount[i]`.
  4. `Send SMS` (`send-sms.php`): `cbRecipients[]` (`Student`, `Father`, `Mother`), `txtSms`, `ddLanguage` (`English`/`Urdu`).
  5. `Send App Notification` (`send-app-notification.php`): `cbRecipients[]` (`Father`, `Mother`), `txtTitle` (max 200), `txtMessage`.
  6. `Write Comments` (`write-comments.php`): `txtTitle` (max 250), `txtComments`, `txtDate`, **`ddNature`** (`2: Excellent`, `1: Good`, `0: Normal` [default], `-1: Bad`, `-2: Worst`).
  7. `Manage Portal Login` (`manage-login.php`): Father (`FatherAccount`, `txtFatherUsername` max 20, `txtFatherPassword` max 20, `ddFatherStatus` `A/I`) & Mother (`MotherAccount`, `txtMotherUsername`, `txtMotherPassword`, `ddMotherStatus`) — shows `"Please first update Mother Profile"` alert if Mother profile incomplete.
  8. `Add Document` (`add-document.php`): `MAX_FILE_SIZE`, `txtTitle` (max 100), `txtDetails`, `fileDocument`.

#### Remaining Students Screens
- **`/admin/students` (Dashboard & Navigator)**: `7` Recharts widgets (`Month-wise Student Stats` Area, `Class-wise Strength` Composed Bar+Area, `Nationalities`/`Religions`/`Genders` Pies, `Graduates` Line, `Locations` Bar) + `navigator` photo-card search + CSV/XLSX export.
- **`/admin/students/inquiry-statuses` & `inquiry-sources` *(unlisted `200`)***: TableDnD lookup CRUDs (`check-inquiry-source.php`, `toggle-inquiry-source.php`, `delete-inquiry-source.php`, `edit-inquiry-source.php`).
- **`/admin/students/inquiries`, `registrations`, `students`**:
  - `students.php` Form (`75` inputs across 6 logical groups): Personal (`txtName`, `ddGender`, `txtDob`, `txtBirthPlace`, `txtDisability`, `txtBformNo`, `filePicture`, `txtWeight`, `txtHeight`, `ddBloodGroup`, `ddHand`, `ddReligion`, `ddNationality`), Contact (`txtAddress`, `ddLocation`, `txtPostalCode`, `#BtnSame`, `txtPhone`, `txtMobile`, `txtEmail`), Registration/Tax (`ddSchool`, `ddClass`, `txtRegistrationNo`, `txtRegistrationDate`, `txtJoiningDate`, `txtRollNo`, `txtSchoolEmail`, `txtSchoolPassword` [invite-only in v2!], `txtPreviousSchool`, `txtPreviousClass`, `ddTaxExemption`, `ddTaxPayer` [`F/M`]), Father (`15` fields incl. `txtFatherNtn`), Mother (`15` fields incl. `txtMotherNtn`), Emergency (`6` fields) + `Quick Entry` tab.
- **`/admin/students/attendance` & `leaves`**: 3-tab Attendance (`Today's Summary`, `Attendance Reports`, `Mark Attendance` supporting Daily `P/A/L/H + TimeIn` vs Monthly Matrix locking `L` cells + Subject-wise toggle + Father/Mother absent SMS) & Leaves CRUD (`138` rows).
- **`/admin/students/transfers`, `withdrawals`, `rejoins`, `graduates`, `promotions`**: Complete lifecycle transitions + Withdrawal SLC A4 Landscape PDF + Bulk Promotion grid (`P/D/G/T/W`).
- **`/admin/students/homework` (+ `homework-comments` & `homework-assignments`)**:
  - Homework CRUD (`Lesson` vs `Assignment` + `DueDateTime`, CKEditor -> TipTap/RichText, 20 attachments fixing `sType=="Picture" && !checkDocument` bug).
  - `homework-comments.php`: Threaded comments viewer/poster (`HomeworkId`, `CommentsId`, `txtComments`).
  - `homework-assignments.php`: Student submissions review & 5-star grading modal (`AssignmentId`, `rbStars` `1..5`, `txtRemarks`, Mark Checked / Cancel Checked).
- **`/admin/students/revisions`**: `4` live rows (`Student`/`Father`/`Mother` requests); `view-revision.php` shows `Field Name | Requested Value`; `edit-revision.php` shows `Field Name | Current Value | Requested Value | Check All | Clear` selective per-field checkboxes!
- **`/admin/students/notices`, `sms-templates`, `sms`, `notifications`, `statistics`, `lists` (`72` fields), `reports` (`9` types)**: Full feature parity (removing `school_password` from `lists` export).

---

### 2.4 Billing (`/admin/billing/*` — 13 Sub-Modules + View/Edit/Collect Modals)
- **`/admin/billing` (Dashboard)**: `Day-wise Fee Collection` Line, `Category wise Fee Collection` (Amount vs Concession), `Month-wise` & `Year-wise Billing Summary` (`Billed`, `Paid`, `Un-Paid`, `Default`, `Fine Received`) Recharts + Security Deposits & Active Concessions KPIs.
- **`/admin/billing/navigator` + `view-fee` + `edit-fee` + `edit-fee-due-date` *(fixing 404)*:**
  - `view-fee.php?FeeId=`: Bill ID, Fee Type, Student, Billing Title, Month, Issue/Due Date, School, Class, Session, Line Items (`# | Fee Category | Amount | Concession | Total`), Net Total, and PDF Challan export (`export-fee.php`).
  - `edit-fee.php?FeeId=`: Editable `txtIssueDate`, `txtDueDate`, `ddPaid` (`N/Y`), `txtTaxRate`, `txtPaidDate`, `txtFine`, `ddPaymentMode` (`CA/BC/BT/CH`), `ddBankAccount`, `txtChequeNo`, per-category `txtDueAmount[i]`, `ddInstallments[i]` (`1..6` installments!), `txtInstallmentAmount[i]_[1..6]`, `txtPayableAmount[i]`, `rbInstallmentsType` (`V`: Create New Voucher(s) vs `I`: Include in Next Bill(s)), dynamic add line item (`ddFeeCategory` + `"Other"`), `txtComments`.
- **`/admin/billing/fee-collection` & `collect-fee.php?BillNo=`**:
  - Barcode/Bill No scan -> `collect-fee.php`: Displays bill metadata + line items + calculated late fine (`txtFine` capped at `MaxFeeFine`), `txtPaidAmount` (respecting `acceptPartialFee="Y|N"` and showing `Amount Received` & `Remaining Payment`), `ddPaymentMode` (`CA/BC/BT/CH`), `ddBankAccount`, `txtChequeNo`, Thermal Receipt print trigger + Bulk Bank Collection Excel Import.
- **Remaining Billing Screens:** `fee-categories` (`98` rows), `fee-structure` (`31` rows, View/Edit/Clone), `fee-concessions` (`84` rows), `fee-revision` & `fee-concession` (Interactive Grid Preview + Excel upload), `regular-fee` (Batch `1..12` months, `5%` tax, installments), `custom-fee` (fixing `1..2027` year bug), `bank-reconciliation`, `final-settlements` (`47` rows, `Balance = SecurityDeposit - UnpaidFee - Deductions`, A4 PDF), `api-logs` (`Bill Inquiry`, `Bill Payment`, `Bill Reversal`), **`reports` (All 15 reconciled report types; fixing `#BtnView`)**.

---

### 2.5 Exams, Timetable & eCalendar (`/admin/exams/*`, `/admin/timetable/*`, `/admin/ecalendar/*`)
- **Exams (`8` screens):** `subjects` (class or individual elective + Lab/Additional Course), `class-teachers` (`124` rows), `grades` (Class+Subject `%` bands), `comments` (merge tags), `exams` (`Marking`, `Published`), `marks` (bulk Total, auto `%`/Grade, Absent toggle), `report-cards` (`Class Marks Sheet` + `export-student-report-card` + `export-class-marks-sheet`), `analysis` (Grade matrix + PieChart + Top/Low performers).
- **Timetable (`5` screens):** `periods`, `seasons`, `timetables`, `scheduler` (drag-and-drop `Period × Day` with real-time server clash checks), `reports` (plus enhanced Teacher & Free-Teacher timetable views).
- **eCalendar (`6` screens):** `calendar` (fixing `Dec 1999` bug; adding Month/Week/Day views + Campus/Category/Event filters), `categories`, `events` (`55` rows + Organizers repeater), `tasks` (`14` rows), `photos` (`31` albums; replacing Plupload with modern chunked multi-upload), `videos` (`11` rows, Upload or URL).

---

### 2.6 HR & Payroll (`/admin/hr/*` — 26 Screens + HR 360 + `8` Modals; `/admin/payroll/*` — 12 Screens)

#### HR 360 Profile (`/admin/hr/:id` — `hr/profile.php?Id=`)
Verified live on `Id=25` (`Aabeel Ahmad`, `000025`):
- **Header Card:** Photo, Name, School, Department, Designation, Employee #, Group, Job Type, Teacher (`Yes`/`No`), Joining Date, Status, Education, Experience, Phone, Mobile, Email, Address.
- **11 Profile Tabs** *(controlled by `cbEmployeeTabs[10]` + fixed `History`)*:
  1. `Profile` (`#tabs-1`): Father/Mother, CNIC/Expiry, EOBI #, SS #, NTN, Active Tax Payer, Hand, DOB, Birth Place, Disability, Marital Status, Spouse, Children, Address, Emergency Contact.
  2. `Subjects` (`#tabs-2`): Assigned Class -> Subjects list (`IX: English, Urdu, Chemistry...`).
  3. `Education` (`#tabs-3`): `#`, `Degree`, `Institute`, `Year`, `Details`.
  4. `Experience` (`#tabs-4`): `#`, `Company`, `Designation`, `Year`, `Details`.
  5. `Attendance` (`#tabs-5`): `Last 12 Days Attendance` (`Date`, `Time IN`, `Time OUT`) + `Attendance Summary` (`Month`, `Presents`, `Absents`, `Leaves`, `Holidays`, `Late Comings`, `Avg. Time IN`, `Avg. Time OUT`, `Avg. Working Hrs`).
  6. `Leaves` (`#tabs-6`): `#`, `Leave Type`, `From Date`, `To Date`, `Details`, `Status`.
  7. `Children` (`#tabs-7`): Linked enrolled student children.
  8. `Salary` (`#tabs-8`): Salary Revisions table (`#`, `Gross Salary`, `Payment Mode`, `Effective Date`, `EOBI Applicable`, `SS Applicable`, `Details`) + Yearly Payroll History accordions (`#`, `Month`, `Gross Salary`, `Basic Salary`, `Medical Allowance`, `Income Tax`, `Payable Salary`, `Payment Mode`, `Details`).
  9. `Documents` (`#tabs-9`): `#`, `Document`, `Title`, `Details`, `Options`.
  10. `Comments` (`#tabs-10`): Color-tinted comment cards.
  11. `History` (`#tabs-11`): `#`, `Action`, `Date`, `School`, `Department`, `Designation`.
- **All 8 Quick-Action Modals (`hr/profile.js`, verified live):**
  `edit-employee.php`, `manage-login.php`, `write-comments.php` (`ddNature`: `2.. -2`), `send-app-notification.php` (`txtTitle`, `txtMessage`), `send-sms.php` (`txtSms`, `ddLanguage`), `add-education.php` (`txtDegree`, `txtInstitute`, `ddFromMonth/Year`, `ddToMonth/Year`, `txtDetails`), `add-experience.php` (`txtCompany`, `txtDesignation`, `ddFromMonth/Year`, `ddToMonth/Year`, `txtDetails`), `add-document.php` (`txtTitle`, `txtDetails`, `fileDocument`).
- **Remaining HR & Payroll Screens:**
  - `hr/` Dashboard (fixing HTTP `500` crash!), `employees` (6 groups, 48-col export minus `school_password`), `departments`, `groups`, `designations` (fixing double toggle bug), `attendance`, `leave-types` (fixing `ddddProrated` & Status col index), `rosters`, `leaves` (`157` rows), `leave-quotas`, `transfers`, `promotions`, `resignations` (linking Exit Clearance checklist!), `rejoins`, `assets` (unified with Inventory Custody!), `holidays`, `sms-templates`, `sms`, `notices` (fixing `sType=="Picture"`), `notifications`, `statistics`, `reports`.
  - `payroll/` Dashboard (`3` Recharts), `social-security` (enforcing `Max >= Min`), `eobi`, `provident-fund`, `income-tax`, `salaries` (`155` rows, validating `ddPfApplicable`), `loans` (`52` rows, EMI remainder-first, PDF Loan Voucher), `bonus-types`, `bonuses`, `monthly-adjustments`, `payroll` (`3,220` rows + `view-payroll` + `edit-payroll` + Pay Slip PDF), `final-settlement`, `reports` (`14` types, fixing 5-arg `getEmployeesList` bug).

---

### 2.7 Petty Cash, Accounts, Library & Inventory (`/admin/pettycash/*`, `/admin/accounts/*`, `/admin/library/*`, `/admin/inventory/*`)
- **Petty Cash (`4` screens):** `categories` (`55` rows), `receipts` (`148` rows + PDF), `expenses` (`198` rows + PDF + Cheque Book), `reports` (`Day Book`, `Cash Flow`).
- **Accounts (`11` screens):** `accounts` (`244` rows COA), `vouchers` (`583` rows reconciled, `JV/PV/RV/CV` + PDF), `settings` (5-tab GL mapping), `ledger-statement` (`# | Particular | Date | Debit | Credit | Balance` + 6 drilldown modals), `cheque-books` (`4` rows), `balance-sheet` (`Account Name | Code | Balance (PKR)`), `profit-n-loss` (`Account Name | Code | Balance (PKR)`), `trial-balance` (6-col Opening/Tx/Closing DR/CR), `general-ledger` (per-ledger blocks + voucher drilldowns), `closings` (`2012-13`..`2025-26` + closing JV modal), `depreciation` *(unlisted `200` -> promoted to nav: inline `%` + Expense Ledger autocomplete + monthly batch depreciation voucher generator)*.
- **Library (`13` screens):** `navigator`, `types`, `categories` (`3`-char code), `languages`, `authors`, `publishers` (fixing `"Author Name"` header bug), `editions`, `books` (`51` titles, TokenInput authors), `copies` (`414` copies), `reservations`, `issues`, `returns` (`min(days*50, 500)`, fixing missing `CH` option), `reports` (`9` types, fixing duplicate `#ddEdition`).
- **Inventory (`9` screens):** `categories` (`28` rows), `brands`, `suppliers`, `attributes`, `items` (`53` rows), `inventory` (`81` batches), `transfers` (`68` rows), `adjustments` (`4,163` serialized units `C###-I####-#####`), `reports` (`4` types, restoring `#BtnView` print preview).

---

## 3. Parent Web Portal — Sitemap & Screen Specs (`/parent/*`)

Replaces the legacy `/parent/` login page (`#frmLogin` `txtUsername`, `txtPassword`, `cbRemember`, `#ForgotPassword` -> `#frmPassword`) and brings 100% parity with `eSchool for Parents` APK (`v1.0.20.10.2026`):

| Route | Source APK Screen / Web | Key Fields, Actions & Feature Flags |
| :--- | :--- | :--- |
| `/parent/login` | `/parent/` + `App` / `ReConnect` | School/Tenant selector (if multi-tenant) or auto-resolved subdomain, `Username`, `Password`, `Remember Me`, Forgot Password link. |
| `/parent/setup-account` | `Account` (`4`-Step PIN) | Step 1 School -> Step 2 `Type` (`Father|Mother`), `CnicNo`, `MobileNo`, `VoucherNo` -> Step 3 6-digit `PinCode` (`5/day` limit) -> Step 4 Set `Password`. *(Respects `signup_username_mode`: `Mobile` vs `CNIC`).* |
| `/parent/reset-password` | `ResetPassword` (`4`-Step PIN) | Same 4 steps omitting `VoucherNo` -> sets new password. |
| `/parent` | `HomeDashboard` + `HomeChilds` | Multi-child switcher cards (`Name`, `RegNo`, `Class/Section`, `School`, `Status`: `Active`/`Active (Defaulter)`/`Withdrawn`/`Graduated`, Photo), quick links to Feeds & Billing alerts. |
| `/parent/children/:id/profile` | `StudentProfile` + `Edit` | Tabs: Personal Info, Emergency Contact, Father Info, Mother Info. When `portal.parent.profile_edit == true`, opens edit form (`Phone`, `Mobile`, `Email`, `City`/`Town`, `Address`, `PostalCode`, `DOB`, `BloodGroup`, `Hand`, `Religion`, `Nationality`, `Emergency*`, Photo upload) creating a pending Admin `Profile Revision` (`RevisionRequest = "Y"`). |
| `/parent/children/:id/attendance` | `StudentAttendance` / `Subject` | Default: Monthly Calendar Grid (`42` slots `P/A/L/H` + summary counts). If `subject_wise_attendance` flag true: Subject cards -> per-subject dated attendance list. |
| `/parent/children/:id/billing` | `StudentBilling` + `PayOnline` | Conditional banners (`DefaultAmount`/`PayableAmount` or `AdvanceFee` per tenant flag), Voucher cards (`VoucherNo`, `Title`, `Issue/Due/Paid Date`, `Amount`, `Concession`, `Fine`, `Defaulter`, `FeeDetails[]`), **Download Challan PDF**, and **Pay Now** checkout drawer (`Alpha`, `Card`, `JazzCash`, `Blinq`, `KuickPay` via authenticated payment session). |
| `/parent/children/:id/exams` | `StudentExams` | Published exam list (`Total`, `Marks`, `Status`, `Comments`, `Subjects[]` with `Subject`, `Teacher`, `Marks`, `Total`, `Grade`, `DateSheet`/`Syllabus`/`ReportCard` PDF viewers). |
| `/parent/children/:id/homework` | `StudentHomework` | Label `"Homework"` or `"Classwork"` per tenant flag; paginated feed (`Subject`, `Date`, `Topic`, rich HTML `Details`, `Attachments[]` image/video/link/PDF viewers) + submission upload & comments when enabled. |
| `/parent/children/:id/weekly-plans` | `StudentWeeklyPlans` | *(Gated on `weekly_plans_enabled`)* Week list -> `WeekNo`, `Date`, `Comments`, `Details[{Subject, Details}]`, PDF download. |
| `/parent/children/:id/daily-reports` | `StudentDailyReport` | *(Gated on `daily_report_enabled`)* Monthly/range daily report PDF list (`Month`, `Year`, `FromDate`, `ToDate`, `DownloadUrl`). |
| `/parent/children/:id/timetable` | `StudentTimetable` | Day tabs (`MON`–`SAT`, plus `SUN` if `timetable_sunday_enabled`) showing `Timing`, `Subject`, `Teacher`, `Picture`. |
| `/parent/children/:id/documents` | `StudentDocuments` | Download/inline view student PDF & image documents. |
| `/parent/children/:id/comments` | `StudentComments` | Color-coded teacher/admin remarks (`-2 Worst`, `-1 Bad`, `0 Normal`, `1 Good`, `2 Excellent`). |
| `/parent/leaves` | `HomeLeaves` + `LeaveApplication` | History list (`Status`, attachments) + Multi-child Leave Application (`Students[]` checkboxes, `FromDate`, `ToDate`, `Details`). |
| `/parent/ptm` & `/parent/ptm/:id` | `HomePtm` + `RequestPtm` | *(Gated on `ptm_enabled`)* PTM requests list, new PTM form (`Student`, `DateTime`, `Details`), and real-time/threaded chat (`Type=="A"` Admin reply highlighted). |
| `/parent/notices`, `/events`, `/blog`, `/social` | `HomeNotices/Events/Blog/FB` | Paginated Notices + Attachments, Upcoming/Past Events, School Blog + Comments (`Blog` flag), Facebook Feed (`Facebook` flag). |
| `/parent/settings` | `HomeSettings` | Change password (`OldPassword`, `NewPassword`), web push notification preferences. |

---

## 4. Teacher Web Portal — Sitemap & Screen Specs (`/teacher/*`)

Replaces legacy `/teacher/` login page (`txtUsername` min 10/11 chars, `txtPassword` min 6 chars -> `ajax/login.php`) and brings 100% parity with `eSchool for Teachers` APK (`v1.0.07.10.2026`):

| Route | Source APK Screen / Web | Key Fields, Actions & Feature Flags |
| :--- | :--- | :--- |
| `/teacher/login` | `/teacher/` + `App` / `ReConnect` | `Username` (`03xx...` or `GH` profile per tenant flag), `Password`, Forgot Password / Reset PIN links. |
| `/teacher/setup-account` & `/reset-password` | `Account` / `ResetPassword` | 4-Step PIN onboarding (`School -> Gender [Male|Female], CNIC, Mobile, EmployeeId [Setup only] -> 6-digit PIN -> Set Password`). |
| `/teacher` | `HomeDashboard` | Teacher profile banner (`Name`, `EmployeeId`, `Department`, `Designation`), Quick Class Cards, Today's Timetable & Pending Attendance/Notices summary. |
| `/teacher/classes` | `HomeClasses` | Assigned Classes/Sections (`School`, `Class`, `Section`, `Subject`, `Code`, `Attendance: Y|N`, `Subjects[]`). |
| `/teacher/classes/:sectionId/students` | `StudentsList` | Enrolled student roster (`RegistrationNo`, `Name`, `Picture`). |
| `/teacher/classes/:sectionId/attendance` | `StudentsAttendance` | Subject selector (if subject-wise), Date selector (restricted within `AttendanceDays`, e.g. 7 days), Bulk `P/A/L/H` marking supporting `AttendanceTime` (`0` status-only, `1` `Time`, `2` `TimeIn`+`TimeOut`). |
| `/teacher/classes/:sectionId/homework` | `StudentsHomework` + `Entry` | Date & Subject filter, `Holiday` indicator, Homework cards (`UserId == current` enables Edit/Delete), Rich editor (`Details`), Multi-attachment uploader (`Link`, `Picture`, `File` via `multipart/form-data`), plus grading/comment drawer parity. |
| `/teacher/timetable` | `HomeTimetable` | Day tabs (`MON`–`SAT` + optional `SUN`) showing `Timing`, `Subject`, `Class`. |
| `/teacher/lesson-plans` | `HomeLessonPlans` | *(Gated on `lesson_plans_enabled`)* Lesson plan archive (`Month`, `Year`, `Date`, `FileName`, PDF viewer/download). |
| `/teacher/self-attendance` | `HomeAttendance` | Monthly calendar grid (`P/A/L/H`, `TimeIn`, `TimeOut`, `Late`, `Remarks`) + monthly summary counters. |
| `/teacher/leaves` | `HomeLeaves` + `LeaveApplication` | Optional `Quota[]` balance cards (`Quota`, `Availed`, `Available`), Leave history (`Paid: Y|N`, `Status`), Apply Leave form (`LeaveType`, `FromDate`, `ToDate`, `Details`). |
| `/teacher/payroll` | `HomePayroll` | Salary slips list (`GrossSalary`, `BasicSalary`, `MedicalAllowance`, `IncomeTax`, `AdditionalTax`, `Eobi`, `ProvidentFund`, `LoanAdjustments`, `LeaveDeductions`, `OtherDeductions`, `Reimbursement`, `PayableSalary`, `Bonuses[]`, `Allowances[]`, `PaymentMode`) + **Download Pay Slip A4 PDF**. |
| `/teacher/loans` | `HomeLoans` | Active/past loans (`Type`, `Amount`, `Refundable`, `PaymentMode`, `NoOfInstallments`, `ReturnedAmount`, `BalanceAmount`) + installment schedule (`Month`, `Amount`, `Paid`, `PaidDate`). |
| `/teacher/appraisals` | `HomeAppraisals` | *(Gated on `appraisals_enabled`)* Performance appraisals (`Session`, `Period`, `TotalScore`, `ObtainedScore`, `Comments`, Appraisal PDF). |
| `/teacher/notices`, `/events`, `/blog`, `/social` | `HomeNotices/Events/Blog/FB` | Same rich feeds & comments as Parent Portal (`Blog`/`Events`/`Facebook` flags). |
| `/teacher/settings` | `HomeSettings` | Change password (`OldPassword`, `NewPassword`), profile summary. |
