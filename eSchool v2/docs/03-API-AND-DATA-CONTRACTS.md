# eSchool v2 — API Architecture & Data Contracts (`.NET 10` `/api/v1/...`)

> **Provenance:** Combines Phase 1A Live CDP Network/Payload Captures (`docs/raw/gap-batch1..4.json`, `docs/raw/gap-followup.json`), Phase 1A Baseline (`04-api-endpoint-inventory.md`), and Phase 1B Mobile Decompilation (`03-PHASE-1B-MOBILE-API-INVENTORY.md`).  
> **Target Stack:** **ASP.NET Core (.NET 10) Modular Monolith + C# + EF Core 10 + PostgreSQL 17 + JWT Bearer Authentication + ASP.NET Core Authorization + OpenAPI + API Versioning (`/api/v1/...`)**.  
> **Non-Assumption Policy:** All unverified external gateway signatures, webhook HMACs, and PHP server internal formulas are tagged `[VERIFY]`. Zero credentials, passwords, or private keys are included.

---

## 1. Legacy Protocol Evidence (Verified Live) vs. `.NET 10` Target

| Dimension | Legacy PHP / Mobile v1 Behavior (Observed) | Target `.NET 10` Modular Monolith (`/api/v1/...`) |
| :--- | :--- | :--- |
| **Web Admin Auth** | `PHPSESSID` cookie (`HttpOnly; Secure`), reCAPTCHA v3 `Token`, TOTP 2FA | `Authorization: Bearer <JWT>` (`15m`) + rotating Refresh Token (`HttpOnly` cookie for web / secure body for future mobile) + TOTP 2FA |
| **Parent/Teacher Mobile Auth** | **No JWT / No Cookies:** passed unverified `AccountId` in POST body (`x-www-form-urlencoded`) | Standard **JWT Bearer (`Portal:Parent` / `Portal:Teacher`)** with server-side `STUDENT_GUARDIANS` & `EMPLOYEES` ownership claims |
| **Web Admin AJAX Format** | Pipe-delimited text `status\|-\|message`, dropdown `id\|\|label\|-\|...`, DataTables SSP JSON containing raw HTML `<img>`/`<a>` strings inside `aaData` | Typed **JSON** (`System.Text.Json`), **`PagedResult<T>`**, **`LookupOptionDto`**, and **`RFC 7807` `ProblemDetails`** |
| **File Uploads** | Plupload `1mb` chunks (`/admin/plugins/plupload/upload.php`), Base64 inside `x-www-form-urlencoded` (`PictureData`, `AttachmentData{i}` with `DEFAULT`/`NO_WRAP` inconsistency) | Unified **`multipart/form-data` (`IFormFile`)** upload endpoints with server-side MIME, extension, size, and EXIF orientation checks |
| **Parent/Teacher Web Portals** | `/parent/ajax/{login,password}.php` and `/teacher/ajax/login.php` using `\|-\|` text responses | Unified `/api/v1/auth/*`, `/api/v1/parent/*`, `/api/v1/teacher/*` JSON APIs shared across React web portals & future mobile apps |
| **API Versioning & Docs** | Unversioned `.php` scripts | **`Asp.Versioning`** (`/api/v1/...`) + **`Microsoft.AspNetCore.OpenApi`** (OpenAPI 3.1 + Scalar) |

### 1.1 Verified Live Raw Legacy Payloads (Captured in `docs/raw/gap-batch3-ssp-ajax-reports.json`)

1. **DataTables SSP JSON Payload (`GET /admin/ajax/students/get-students.php?sEcho=1&iDisplayStart=0&iDisplayLength=2`):**
   ```json
   {
     "sEcho": 1,
     "iTotalRecords": 287,
     "iTotalDisplayRecords": 287,
     "aaData": [
       [1, "<a href=\"students/profile.php?Id=806\" target=\"_blank\">Abdul Basit</a>", "000806", "X &raquo; A", "eSchool Lahore", "2024-2025", "Active", "<img class=\"icon details\" id=\"806\" ... /> ..."]
     ]
   }
   ```
   *(Verified live SSP totals: `logs = 23,589`, `payroll = 3,220`, `vouchers = 583` [reconciling `07`'s erroneous `6,547`], `registrations = 310`, `students = 287`, `expenses = 198`, `receipts = 148`, `resignations = 69`, `withdrawals = 55`, `loans = 52`, `final-settlements = 47`, `api-logs = 1`.)*
2. **Bank API Log Live Payload (`GET /admin/ajax/billing/get-api-logs.php`):**
   - `Date/Time`: `06-Feb-2025 06:10 PM` | `Bill No`: `123470` | `Action`: `Inquiry`
   - `Request`: `BillNo = 123470`
   - `Response`: `Code = 00` | `Status = INVALID` | `Message = An input parameter is missing or having invalid value.`
3. **Toolbar Filter HTML (`POST /admin/ajax/billing/get-api-log-filters.php`):**
   ```html
   <select id="Bank"><option value="">All Banks</option><option value="Bank al habib limited">Bank al habib limited</option><option value="Meezan BanK">Meezan BanK</option></select>
   <select id="Action"><option value="">All Actions</option><option value="Inquiry">Bill Inquiry</option><option value="Payment">Bill Payment</option><option value="Reversal">Bill Reversal</option></select>
   ```
4. **Pipe-Delimited Dropdowns & Lookups (`POST /admin/ajax/*.php`):**
   - `ajax/get-classes.php` (`Schools=1&Type=S`): `"2||I|-|31||II|-|33||III|-|..."`
   - `ajax/get-employees.php`: `"|-|0||Admin department|-|168||ALI HAIDER (000168)|-|..."` (`0||Label` creates `<optgroup>`)
   - `ajax/payroll/get-salary-bank-account.php` (`Employee=25`): `"OK|-|4|-|123|-|25896445326565632"` (`Status|-|BankId|-|BranchCode|-|AccountNo`)
   - `ajax/billing/get-final-settlement-details.php`: `"info|-|No Student Withdrawal Approved or Graduated Record found..."` (error/info banner) vs `SecurityDeposit|-|UnpaidFee|-|GraduateDate|-|Deductions|-|Balance`
   - `ajax/timetable/update-schedule.php`: `"OK|..."` vs `"ERROR|<clash message>"` (triggers 3s revert in `scheduler.js`)
   - `ajax/management/toggle-sms-service-status.php`: Confirmed param `{ ServiceId }` (`sms-services.js`)
5. **Mobile Public Directory (`GET` & `POST` `/api/parents/{version,schools}.php` and `/api/teachers/{version,schools}.php`):**
   - Confirmed **both `GET` and `POST`** return `HTTP 200` `application/json`:
     - `version.php`: `{"Status":"OK","Version":"1.0.19.10.2026","Code":"155"}` (Parents) / `"67"` (Teachers)
     - `schools.php`: `{"Status":"OK","Schools":[{"Id":1,"Name":"eSchool Demo","Code":"SW3","Organization":"SW3 Solutions","Logo":"...","Server":"https://demo.eschool.com.pk/api/parents/","Android":"","iOS":""}, ...]}`

---

## 2. Standard `.NET 10` REST API Conventions

### 2.1 Versioning, Headers & Auth Claims
- **Base Route:** `/api/v1/{bounded-context}/{resource}` (`ApiVersion(1, 0)`).
- **JWT Claims:**
  - `sub` (`userId`), `tenant_id`, `portal` (`Admin` | `Parent` | `Teacher`), `role_id`, `school_ids` (`int[]`), `guardian_type` (`Father` | `Mother`), `employee_id`, `perm` (Admin page rights / misc flags).
- **Standard Response & Pagination Contracts (C# DTOs):**
  ```csharp
  public sealed record PagedQuery(int Page = 1, int PageSize = 25, string? Search = null, string? SortBy = null, string? SortDir = "desc");
  public sealed record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
  public sealed record LookupOptionDto(long Id, string Label, string? Group = null, string? Code = null);
  ```
- **Error Contract (`RFC 7807` `ProblemDetails`):**
  - `400 Bad Request`: Validation errors (`errors` dictionary).
  - `401 Unauthorized`: Expired/missing JWT (`code: "AUTH_SESSION_EXPIRED"`).
  - `403 Forbidden`: Missing RBAC permission, campus scope, or child/class ownership (`code: "RBAC_DENIED"`).
  - `404 Not Found`: Missing entity or invalid route.
  - `409 Conflict`: Uniqueness collision (`RegistrationNo`, `BillNo`, `AccountNo`, `Town+City`, timetable clash).
  - `422 Unprocessable Entity`: Business rule or **Data Lock** violation (`code: "DATA_LOCK_VIOLATION"`, `lockDate`, `section`).

---

## 3. Complete `/api/v1/...` Endpoint & DTO Catalog

### 3.1 Authentication, PIN Onboarding & Tenant Discovery (`/api/v1/auth`, `/api/v1/directory`)
| Method & Endpoint | Replaces Legacy | Request DTO | Response DTO / Notes |
| :--- | :--- | :--- | :--- |
| `GET /api/v1/directory/schools` | `api/{parents,teachers}/schools.php` | `?portal=Parent\|Teacher` | `SchoolDirectoryItemDto[]` (`Id`, `Name`, `Code`, `Organization`, `LogoUrl`, `WebPortalUrl`, `Capabilities`) |
| `GET /api/v1/directory/version` | `api/{parents,teachers}/version.php` | `?platform=web\|android\|ios` | `AppVersionDto(Version, BuildCode, ForceUpdate)` |
| `POST /api/v1/auth/admin/login` | `/admin/ajax/login.php` | `AdminLoginRequest(Email, Password, CaptchaToken?)` | `AuthResponse(Requires2Fa, AccessToken?, User?, Capabilities)` |
| `POST /api/v1/auth/admin/verify-2fa` | `/admin/ajax/verify-2fa.php` | `Verify2FaRequest(ChallengeToken, Code)` | `AuthResponse` |
| `POST /api/v1/auth/admin/email-2fa` | `/admin/ajax/email-2fa.php` | `Email2FaRequest(ChallengeToken)` | `202 Accepted` |
| `POST /api/v1/auth/portal/login` | `/parent/ajax/login.php`, `/teacher/ajax/login.php`, `api/*/login.php` | `PortalLoginRequest(TenantId, Portal, Username, Password, RoleType?, DeviceToken?)` | `PortalAuthResponse(AccessToken, User, FeatureFlags, Children[] \| Classes[])` |
| `POST /api/v1/auth/portal/pin/request` | `generate-pin-code.php`, `generate-account-pin-code.php` | `RequestPinRequest(TenantId, Portal, Flow [Setup\|Reset], RoleTypeOrGender, CnicOrNationalId, MobileNo, VerificationRef?)` | `PinChallengeDto(ChallengeId, ExpiresAt, RemainingDailyAttempts)` *(5/day server rate limit; `VerificationRef` = `VoucherNo` for Parent Setup or `EmployeeId` for Teacher Setup)* |
| `POST /api/v1/auth/portal/pin/verify` | `verify-pin-code.php`, `verify-account-pin-code.php` | `VerifyPinRequest(ChallengeId, MobileNo, RoleTypeOrGender, PinCode)` | `PinVerifiedDto(ResetToken)` |
| `POST /api/v1/auth/portal/pin/complete` | `setup-account.php`, `reset-password.php` | `CompleteOnboardingRequest(ResetToken, NewPassword)` | `200 OK` |
| `POST /api/v1/auth/refresh` / `logout` | `logout.php` | Refresh token / Bearer | Revokes refresh token & FCM device registration |
| `POST /api/v1/auth/password/forgot` | `ajax/password.php` | `ForgotPasswordRequest(Email, Portal)` | `202 Accepted` |
| `PUT /api/v1/auth/me/password` | `save-password.php`, `update-password.php` | `ChangePasswordRequest(OldPassword, NewPassword)` | Enforces `PasswordReuse` history & complexity |
| `GET/PUT /api/v1/auth/me/preferences` | `my-account.php`, `save-settings.php` | `UserPreferencesDto(RecordsPerPage, Theme)` | Updated profile |
| `POST /api/v1/auth/me/2fa/enable\|disable` | `enable-2fa.php`, `disable-2fa.php` | `Enable2FaRequest(Code)` | QR URI + recovery status |

---

### 3.2 Admin Portal APIs (`/api/v1/admin/...` — 14 Modules + Unlisted RBAC)

#### A. Management, RBAC & Settings
- **System Settings & Feature Flags:** `GET / PUT /api/v1/admin/management/settings` (`SystemSettingsDto` covering all 6 tabs + `TenantFeatureFlagsDto` replacing 12 hardcoded APK domain gates).
- **SMS Gateways:** `GET /api/v1/admin/management/sms-services`, `PUT .../{id}`, `PATCH .../{id}/status` *(replaces `{ServiceId}`)*, `POST .../{id}/test` (`SendTestSmsRequest(Mobile, Message, Language)`).
- **Email Templates & Payment Methods *(Unlisted RBAC)*:** `GET/POST/PUT /api/v1/admin/management/email-templates`, `GET/PUT/PATCH /api/v1/admin/management/payment-methods` (`edit-payment-method.php`, `toggle-payment-method-status.php`).
- **Backups *(Unlisted RBAC)*:** `GET /api/v1/admin/management/backups`, `POST .../trigger`, `POST .../{id}/restore`, `DELETE ...` *(bulk)*.
- **Roles & Users:** `GET/POST/PUT/DELETE /api/v1/admin/management/user-types` (`152` rights matrix `PermissionEntryDto(PageKey, View, Add, Edit, Delete, Export)`), `GET/POST/PUT/DELETE /api/v1/admin/management/users` (incl. `cbSchools[]`, `cbDashboards[]`, `cbMiscRights[]`, `cbStudentTabs[]`, `cbEmployeeTabs[]`, `POST .../{id}/disable-2fa`, `GET .../export`), `GET /api/v1/admin/management/logs` (SSP replacement), `GET/PUT /api/v1/admin/management/locks` (`41` section locks).
- **Campus & Reference Settings:** Standard CRUD + `PATCH .../reorder` + `PATCH .../{id}/toggle-status` on `/api/v1/admin/settings/{schools,classes,sections,sessions,subjects,religions,nationalities,cities,towns,occupations,banks,bank-accounts}` + `POST .../schools/merge` + `POST .../sessions/{id}/lock`.

#### B. Students & Admissions (`/api/v1/admin/students/...`)
- **Lookups & Inquiries:** `CRUD /api/v1/admin/students/inquiry-statuses`, `inquiry-sources` *(unlisted `200` route)*, `transfer-reasons`, `withdrawal-reasons`, `inquiries` (`POST .../{id}/convert-registration`).
- **Registrations:** `GET/POST/PUT/DELETE /api/v1/admin/students/registrations`, `PATCH .../{id}/status` (`ApproveRegistrationRequest(SessionId, SectionId, JoiningDate, RollNo?, Comments?)`), `GET .../{id}/receipt-pdf`.
- **Students & Student 360:**
  - `GET /api/v1/admin/students` (Navigator & Directory SSP replacement), `POST /api/v1/admin/students` (full 6-group or Quick), `POST .../import`, `POST .../export-list` (`72` fields minus `school_password`), `POST .../export-report` (`9` reports).
  - `GET /api/v1/admin/students/{id}` (full **Student 360** bundle: `Profile`, `Siblings`, `AttendanceSummary`, `Leaves`, `Exams`, `Billing`, `Documents`, `Comments`, `History`).
  - **Student 360 Modal Endpoints:**
    - `PUT /api/v1/admin/students/{id}` (`edit-student`)
    - `POST/DELETE /api/v1/admin/students/{id}/concessions` (`fee-concession`)
    - `POST /api/v1/admin/students/{id}/custom-fee` (`custom-fee`)
    - `POST /api/v1/admin/students/{id}/send-sms`, `POST .../{id}/send-notification`
    - `POST/DELETE /api/v1/admin/students/{id}/comments` (`CommentNature` enum: `-2 Worst, -1 Bad, 0 Normal, 1 Good, 2 Excellent`)
    - `GET/PUT /api/v1/admin/students/{id}/portal-logins` (`FatherAccount`, `MotherAccount` — password set/reset without returning plaintext!)
    - `POST/DELETE /api/v1/admin/students/{id}/documents` (`multipart/form-data`)
- **Attendance, Leaves & Lifecycle:**
  - `GET /api/v1/admin/students/attendance/summary`, `GET /api/v1/admin/students/attendance/grid` (Daily vs Subject-wise vs Monthly Matrix), `POST /api/v1/admin/students/attendance` (`SaveStudentAttendanceRequest(SchoolId, SectionId, SubjectId?, Date, Entries[], SendFatherSms, SendMotherSms)`), `DELETE /api/v1/admin/students/attendance`, `GET .../export`.
  - `CRUD /api/v1/admin/students/{leaves,transfers,withdrawals,rejoins,graduates}` + `GET .../withdrawals/{id}/slc-pdf` + `POST /api/v1/admin/students/promotions` (`Promoted|Detained|Graduated|Transferred|Withdrawn`).
- **Homework, Revisions, Notices & SMS:**
  - `CRUD /api/v1/admin/students/homework` (`multipart/form-data` attachments), `GET/POST/DELETE .../homework/{id}/comments`, `GET/PUT .../homework/{id}/submissions` (`Stars 1..5`, `Remarks`).
  - `GET /api/v1/admin/students/revisions`, `GET .../{id}` (field diff), `PUT .../{id}/process` (`ApproveFields[]` selective approval!).
  - `CRUD /api/v1/admin/students/{sms-templates,sms,notices}`, `POST .../notifications`, `GET .../statistics`.

#### C. Billing & Fee Collection (`/api/v1/admin/billing/...`)
- `CRUD /api/v1/admin/billing/{fee-categories,fee-structures,fee-concessions}` (+ `POST .../fee-structures/{id}/clone`).
- `POST /api/v1/admin/billing/bulk-revision/preview` & `/apply` (supports both Excel upload & interactive UI grid!), `POST .../bulk-concessions`.
- `POST /api/v1/admin/billing/regular-fee/generate`, `POST .../custom-fee`.
- `GET /api/v1/admin/billing/bills` (`navigator.php`), `GET/PUT/DELETE .../bills/{id}` (`view-fee`/`edit-fee` incl. `Installments 1..6` & `NewVoucher|NextBill`), `PATCH .../bills/{id}/due-date` *(fixes 404!)*, `PATCH .../bills/bulk-due-date`, `POST .../bills/bulk-adjust`, `GET .../bills/{id}/challan-pdf`.
- `GET /api/v1/admin/billing/collect/lookup?billNo=`, `POST .../collect` (`PaidDate`, `Fine`, `PaidAmount`, `PaymentMode`, `BankAccountId`, `ChequeNo`), `POST .../collect/import`, `POST .../bills/{id}/thermal-receipt` (returns receipt DTO + optional printer dispatch).
- `GET/PATCH /api/v1/admin/billing/bank-reconciliation`, `CRUD /api/v1/admin/billing/final-settlements` (+ `GET .../preview?studentId=`, `GET .../{id}/pdf`), `GET /api/v1/admin/billing/api-logs`, `POST /api/v1/admin/billing/reports/export` (**15** report types).

#### D. Academics, Timetable & eCalendar (`/api/v1/admin/{exams,timetable,ecalendar}/...`)
- **Exams:** `GET/PUT /api/v1/admin/exams/subjects`, `CRUD .../class-teachers`, `CRUD .../grades`, `CRUD .../comments`, `CRUD .../exams` (`Marking`, `Published`), `GET/POST .../marks`, `GET .../report-cards`, `GET .../export-student-report-card`, `GET .../export-class-marks-sheet`, `GET .../analysis`.
- **Timetable:** `CRUD /api/v1/admin/timetable/{periods,seasons,timetables}`, `GET/PUT /api/v1/admin/timetable/{id}/schedule` (clash validation returning `409 Conflict` with conflicting class/teacher!), `GET .../reports`.
- **eCalendar:** `GET /api/v1/admin/ecalendar/calendar?year=&month=&schoolId=&categoryId=&eventId=` (defaults to current date!), `CRUD .../categories`, `CRUD .../events` (with `Organizers[]`), `CRUD .../tasks`, `CRUD .../photos` (multipart batch upload), `CRUD .../videos`.

#### E. HR, Payroll, Accounting, Petty Cash, Library & Inventory (`/api/v1/admin/{hr,payroll,accounts,pettycash,library,inventory}/...`)
- **HR:** `GET /api/v1/admin/hr/dashboard` (fixes 500!), `CRUD /api/v1/admin/hr/employees` (48 fields minus `school_password`), `GET /api/v1/admin/hr/employees/{id}` (**HR 360** 11 tabs + 8 modals `manage-login`, `write-comments`, `send-sms`, `send-app-notification`, `add-education`, `add-experience`, `add-document`), `CRUD .../hr/{departments,groups,designations,leave-types,rosters,leaves,leave-quotas,transfer-reasons,transfers,promotions,resignation-reasons,resignations,rejoins,asset-types,assets,holidays,sms-templates,sms,notices}`, `POST .../hr/attendance`, `POST .../hr/notifications`, `GET .../hr/statistics`, `POST .../hr/reports/export`.
- **Payroll:** `CRUD /api/v1/admin/payroll/{social-security,eobi,provident-fund,income-tax,salaries,loans,bonus-types,bonuses,monthly-adjustments}`, `GET /api/v1/admin/payroll/runs`, `POST .../runs/generate`, `GET/PUT/DELETE .../runs/{id}`, `GET .../runs/{id}/payslip-pdf`, `POST .../runs/salary-date`, `GET .../final-settlement/preview`, `POST .../final-settlement`, `GET .../loans/{id}/voucher-pdf`, `POST .../reports/export` (`14` types).
- **Accounts & Petty Cash:** `CRUD /api/v1/admin/accounts/{chart-of-accounts,vouchers,cheque-books,closings}`, `GET/PUT /api/v1/admin/accounts/settings` (5 tabs), `GET .../vouchers/{id}/pdf`, `GET .../statements/{ledger,balance-sheet,profit-loss,trial-balance,general-ledger}`, `GET/PUT/POST /api/v1/admin/accounts/depreciation` *(unlisted `200` route)*; `CRUD /api/v1/admin/pettycash/{categories,receipts,expenses}`, `GET .../{receipts,expenses}/{id}/pdf`, `POST .../pettycash/reports`.
- **Library & Inventory:** `CRUD /api/v1/admin/library/{types,categories,languages,authors,publishers,editions,books,copies,reservations,issues,returns}`, `POST .../library/reports`; `CRUD /api/v1/admin/inventory/{categories,brands,suppliers,attributes,items,batches,transfers,adjustments}`, `POST .../inventory/reports`.

---

### 3.3 Parent Portal & Shared Mobile Endpoints (`/api/v1/parent/...`)
*(Auth: `[Authorize(Policy = "Portal:Parent")]`; `studentId` ownership verified server-side via `STUDENT_GUARDIANS` — replaces all 40 Parents APK endpoints)*

| Method & Endpoint | Legacy APK Equivalent | Key Request / Response DTO |
| :--- | :--- | :--- |
| `GET /api/v1/parent/children` | `students.php` | `ParentHomeDto(FeatureFlags, Children: ChildSummaryDto[])` (`PersonalInfo`, `EmergencyInfo`, `FatherInfo`, `MotherInfo`, `RevisionRequest`) |
| `GET /api/v1/parent/children/{studentId}/profile` | `get-student-profile.php` | `EditableStudentProfileDto` (native nested `Locations[{Id, Name, Towns[]}]`, `Religions[]`, `Nationalities[]` — fixes legacy JSON-in-string `towns`!) |
| `POST /api/v1/parent/children/{studentId}/profile-revision` | `save-student-profile.php` | `multipart/form-data`: personal/emergency fields + optional `Picture` file (`IFormFile`) -> creates pending `STUDENT_PROFILE_REVISIONS` |
| `GET /api/v1/parent/children/{studentId}/guardian-profile` | `get-parents-profile.php` | `?type=Father\|Mother` -> `EditableGuardianProfileDto` + `Locations[]` + `Occupations[]` |
| `POST /api/v1/parent/children/{studentId}/guardian-revision` | `save-parents-profile.php` | `?type=Father\|Mother` -> creates pending `STUDENT_PROFILE_REVISIONS` |
| `GET /api/v1/parent/children/{studentId}/attendance` | `attendance.php` | `?yearMonth=yyyy-MM` (Calendar mode: `Presents/Absents/Leaves/Holidays`, `Days[]`) OR `?mode=subject` (`Subjects[{Subject, Entries[{Date, Status}]}]` — replaces `"YYYY-MM-DD=P"` string split!) |
| `GET /api/v1/parent/children/{studentId}/billing` | `billing.php` | `ParentBillingDto(DefaultAmount?, PayableAmount?, AdvanceFee?, Vouchers[{Id, VoucherNo, Title, IssueDate, DueDate, PaidDate, Concession, Amount, Fine, Defaulter, FeeDetails[]}])` |
| `GET /api/v1/parent/children/{studentId}/billing/{feeId}/pdf` | `download-fee.php?FeeId=` | Authenticated PDF stream (`Inline` or `Attachment`) |
| `POST /api/v1/parent/payments/session` | `/pay/<md5(VoucherNo)>/`, `blinq/`, `kuickpay/` | `CreatePaymentSessionRequest(FeeId, Gateway: Alpha\|Card\|JazzCash\|Blinq\|KuickPay)` -> `PaymentSessionDto(CheckoutUrl, OpaqueSessionToken)` *(eliminates enumerable `md5(VoucherNo)` URLs!)* |
| `GET /api/v1/parent/children/{studentId}/exams` | `exams.php` | `ParentExamDto[]` (`Subjects[]`, `DateSheetUrl`, `SyllabusUrl`, `ReportCardUrl`) |
| `GET /api/v1/parent/children/{studentId}/homework` | `homework.php` | `PagedResult<HomeworkItemDto>` (`Subject`, `Date`, `DueDate`, `Topic`, sanitized HTML `Details`, `Attachments[]`) |
| `GET /api/v1/parent/children/{studentId}/weekly-plans` | `weekly-plans.php` | `PagedResult<WeeklyPlanDto>` (`WeekNo`, `Date`, `Comments`, `DownloadUrl`, `Details[]`) |
| `GET /api/v1/parent/children/{studentId}/daily-reports` | `daily-report.php` | `DailyReportDto[]` (`Month`, `Year`, `FromDate`, `ToDate`, `FileName`, `DownloadUrl`) |
| `GET /api/v1/parent/children/{studentId}/timetable` | `timetable.php` | `WeeklyTimetableDto(Days[1..7])` |
| `GET /api/v1/parent/children/{studentId}/documents` | `documents.php` | `StudentDocumentDto[]` |
| `GET /api/v1/parent/children/{studentId}/comments` | `comments.php` | `StudentCommentDto[]` (`Nature: Worst\|Bad\|Normal\|Good\|Excellent`, `NatureCode: -2..2`) |
| `GET/POST /api/v1/parent/leaves` | `leaves.php`, `save-leave.php` | `CreateParentLeaveRequest(StudentIds: long[], FromDate, ToDate, Details, Attachment?)` |
| `GET/POST /api/v1/parent/ptm` | `ptm-requests.php`, `save-ptm-request.php` | `PtmRequestDto` + `CreatePtmRequest(StudentId, ScheduledAt, Details)` |
| `GET/POST /api/v1/parent/ptm/{requestId}/comments` | `ptm-comments.php`, `save-ptm-comments.php` | `PtmCommentDto(Id, SenderType [Admin\|Parent], UserName, SentAt, Comments)` |
| `GET /api/v1/portal/feeds/{notices,events,blog,facebook}` | `notices`, `events`, `posts`, `facebook` | Shared feed DTOs + `GET/POST /api/v1/portal/feeds/blog/{postId}/comments` (`save-comments.php`) |

---

### 3.4 Teacher Portal & Shared Mobile Endpoints (`/api/v1/teacher/...`)
*(Auth: `[Authorize(Policy = "Portal:Teacher")]`; `employeeId` resolved from JWT — replaces all 32 Teachers APK endpoints)*

| Method & Endpoint | Legacy APK Equivalent | Key Request / Response DTO |
| :--- | :--- | :--- |
| `GET /api/v1/teacher/classes` | `classes.php` | `TeacherClassDto[]` (`SchoolId`, `ClassId`, `SectionId`, `SubjectId`, `School`, `Class`, `Section`, `Subject`, `Code`, `CanMarkAttendance`, `Subjects[]`) |
| `GET /api/v1/teacher/classes/{sectionId}/students` | `students.php` | `?subjectId=&date=yyyy-MM-dd` -> `ClassAttendanceRosterDto(AttendanceDays, AttendanceTime [0\|1\|2], IsMarked, Message, Students[{StudentSessionId, Name, RegNo, PictureUrl, Status, Time, TimeIn, TimeOut}])` |
| `POST /api/v1/teacher/classes/{sectionId}/attendance` | `save-attendance.php` | `SaveTeacherAttendanceRequest(SchoolId, SectionId, SubjectId?, Date, Students[{StudentSessionId, Status, Time?, TimeIn?, TimeOut?}])` |
| `GET /api/v1/teacher/classes/{sectionId}/homework` | `homework.php` | `?subjectId=&date=yyyy-MM-dd` -> `TeacherHomeworkListDto(IsHoliday, Items[{Id, SubjectId, IsOwner, Subject, Code, Details, Status, Attachments[]}])` |
| `POST/PUT /api/v1/teacher/homework` | `save-homework.php` | `multipart/form-data`: `SchoolId`, `ClassId`, `SectionId`, `SubjectId`, `Date`, `Details`, `Attachments[]` (`IFormFile` + external URLs — fixes `AttachmentType/Name/Data{i}` Base64!) |
| `DELETE /api/v1/teacher/homework/{homeworkId}` | `delete-homework.php` | Owner check (`CreatedByEmployeeId == current`) |
| `GET /api/v1/teacher/timetable` | `timetable.php` | `TeacherTimetableDto(Days[1..7])` |
| `GET /api/v1/teacher/lesson-plans` | `lesson-plans.php` | `LessonPlanDto[]` (`Id`, `Month`, `Year`, `Date`, `FileName`, `DownloadUrl`) |
| `GET /api/v1/teacher/self-attendance` | `attendance.php` | `?yearMonth=yyyy-MM` -> `SelfAttendanceDto` (`Presents/Absents/Leaves/Holidays`, `Days[{Day, Status, TimeIn, TimeOut, Late, Remarks}]`) |
| `GET/POST /api/v1/teacher/leaves` | `leaves.php`, `save-leave.php` | `TeacherLeavesDto(Types[], Quota[], Leaves[{Paid, Status, ...}])` + `CreateTeacherLeaveRequest(LeaveTypeId, FromDate, ToDate, Details)` |
| `GET /api/v1/teacher/payroll` & `.../{payrollId}/slip-pdf` | `payroll.php`, `download-salary-slip.php` | `TeacherPayrollDto[]` (`GrossSalary`, `BasicSalary`, `MedicalAllowance`, `IncomeTax`, `AdditionalTax`, `Eobi`, `ProvidentFund`, `LoanAdjustments`, `LeaveDeductions`, `OtherDeductions`, `Reimbursement`, `PayableSalary`, `Bonuses[]`, `Allowances[]`, `PaymentMode`) + authenticated PDF |
| `GET /api/v1/teacher/loans` | `loans.php` | `TeacherLoanDto[]` (`Installments[]`) |
| `GET /api/v1/teacher/appraisals` | `appraisals.php` | `TeacherAppraisalDto[]` (`Session`, `Period`, `TotalScore`, `ObtainedScore`, `Comments`, `AppraisalUrl`) |
| `POST /api/v1/portal/devices/fcm-token` | Auto `TokenId` in POST body | Registers/refreshes web or mobile push token for authenticated user |

---

### 3.5 External Bank Billing & Payment Gateway Contracts (`[VERIFY]` Server Signing)
- `POST /api/v1/integrations/bank-billing/inquiry` (Bank Al Habib, Meezan Bank, 1Link): Receives `BillNo`, validates active unpaid/partial voucher, returns standard bank code/status (`00` / `INVALID` or bill amount/due date) and writes immutable `BANK_API_LOGS` entry `[VERIFY] exact bank auth header/HMAC & response codes`.
- `POST /api/v1/integrations/bank-billing/payment` & `/reversal`: Marks voucher paid/reversed atomically, posts GL receipt/reversal journal entry, logs payload `[VERIFY]`.
- `POST /api/v1/payments/webhook/{gateway}` (`Alpha`, `Card`, `JazzCash`, `Blinq`, `KuickPay`): Verifies gateway signature/checksum, reconciles `STUDENT_FEES` & `ONLINE_PAYMENTS`, issues GL Receipt Voucher `[VERIFY]`.

---

## 4. Legacy PHP Mobile Endpoint Deprecation Note
If existing legacy Android APKs (`v1.0.20.10.2026` / `v1.0.07.10.2026`) must remain supported during a rollout window before migrating to v2 mobile apps, a thin compatibility adapter controller (`/api/parents/*`, `/api/teachers/*`) may translate legacy form-encoded `AccountId` calls into internal Mediator commands while logging deprecation metrics `[VERIFY]` — **disabled by default in favor of `/api/v1/...` JWT Bearer**.
