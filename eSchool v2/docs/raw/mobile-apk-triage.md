# Phase 1B — Mobile APK DEX Triage Inventory

**Capture Date:** 2026-11-10
**Method:** Non-destructive read-only inspection of ZIP entries and DEX string pools (`classes.dex` .. `classes4.dex`).

---

## 1. eSchool for Parents (`eSchool-for-Parents_1.0.20.10.2026_apkcube.apk`)

- **File Size:** `15,511,747` bytes
- **Package / Technology:** Native Android (Kotlin/Java), 4 DEX files, AndroidX DataStore, Firebase Cloud Messaging, Google Play Services Maps / App Update / Review, Glide.
- **Obfuscation Status:** Core `com.sw3solutions.eschoolforparents` Activities, Adapters, `API`, `Common`, and `classes/*` domain models are **unobfuscated**.
- **Base URLs Observed in DEX Strings:**
  - `https://demo.eschool.com.pk/api/parents/`
  - `https://eschool-parents-app.mt-shahzad.workers.dev/`
- **Domain Model Classes (`com/sw3solutions/eschoolforparents/classes/`):**
  - `BlogPost`, `Child`, `DayReport`, `FacebookPost`, `Homework`, `KeyValue`, `Leave`, `Notice`, `PtmRequest`, `School`, `WeeklyPlan`
- **Activity / Screen Classes:**
  - `Account`, `ResetPassword`, `Home`, `HomeDashboard`, `HomeChilds`, `HomeAbout`, `HomeContact`, `HomeSettings`, `HomeBlog`, `HomeBlogPost`, `HomeEvents`, `HomeFacebook`, `HomeFacebookPost`, `HomeLeaves`, `LeaveApplication`, `HomeNotices`, `HomeNoticesDetail`, `HomePtm`, `HomePtmDetail`, `RequestPtm`
  - `Student`, `StudentDashboard`, `StudentProfile`, `StudentProfileEdit`, `StudentParents`, `StudentParentsEdit`, `StudentParentsFather`, `StudentParentsMother`, `StudentAttendance`, `StudentAttendanceSubjectListing`, `StudentAttendanceSubjectDetails`, `StudentBilling`, `StudentComments`, `StudentDailyReport`, `StudentDocuments`, `StudentExams`, `StudentHomework`, `StudentHomeworkDetail`, `StudentTimetable`, `StudentTimetableDay`, `StudentWeeklyPlans`, `StudentWeeklyPlansDetail`
  - Payment Screens: `PayOnline`, `PayViaAlpha`, `PayViaBlinq`, `PayViaCard`, `PayViaJazzCash`, `PayViaKuickPay`
  - Media / Infra: `PdfViewer`, `PictureViewer`, `VideoPlayer`, `FcmNotification`, `FcmNotificationService`, `InternetReceiver`, `Offline`, `ReConnect`
- **40 PHP Endpoints Observed:**
  - `attendance.php`
  - `billing.php`
  - `blinq/index.php?VoucherNo=`
  - `comments.php`
  - `daily-report.php`
  - `documents.php`
  - `download-fee.php?FeeId=`
  - `events.php`
  - `exams.php`
  - `facebook.php`
  - `generate-account-pin-code.php`
  - `generate-pin-code.php`
  - `get-parents-profile.php`
  - `get-student-profile.php`
  - `homework.php`
  - `kuickpay/index.php?VoucherNo=`
  - `leaves.php`
  - `login.php`
  - `logout.php`
  - `notices.php`
  - `post-comments.php`
  - `posts.php`
  - `ptm-comments.php`
  - `ptm-requests.php`
  - `reset-password.php`
  - `save-comments.php`
  - `save-leave.php`
  - `save-parents-profile.php`
  - `save-ptm-comments.php`
  - `save-ptm-request.php`
  - `save-student-profile.php`
  - `schools.php`
  - `setup-account.php`
  - `students.php`
  - `timetable.php`
  - `update-password.php`
  - `verify-account-pin-code.php`
  - `verify-pin-code.php`
  - `version.php`
  - `weekly-plans.php`

---

## 2. eSchool for Teachers (`eSchool-for-Teachers_1.0.07.10.2026_apkcube.apk`)

- **File Size:** `15,061,424` bytes
- **Package / Technology:** Native Android (Kotlin/Java), 4 DEX files, AndroidX DataStore, Firebase Cloud Messaging, Google Play Services Maps / App Update / Review, Glide.
- **Obfuscation Status:** Core `com.sw3solutions.eschoolforteachers` Activities, Adapters, `API`, `Common`, and `classes/*` domain models are **unobfuscated**.
- **Base URL Observed in DEX Strings:**
  - `https://demo.eschool.com.pk/api/teachers/`
- **Domain Model Classes (`com/sw3solutions/eschoolforteachers/classes/`):**
  - `Appraisal`, `BlogPost`, `FacebookPost`, `Homework`, `KeyValue`, `Leave`, `LessonPlan`, `Loan`, `Notice`, `Salary`, `School`
- **Activity / Screen Classes:**
  - `Account`, `ResetPassword`, `Home`, `HomeDashboard`, `HomeAbout`, `HomeContact`, `HomeSettings`, `HomeAppraisals`, `HomeAttendance`, `HomeBlog`, `HomeBlogPost`, `HomeClasses`, `HomeEvents`, `HomeFacebook`, `HomeFacebookPost`, `HomeLeaves`, `LeaveApplication`, `HomeLessonPlans`, `HomeLoans`, `HomeNotices`, `HomeNoticesDetail`, `HomePayroll`, `HomeTimetable`, `HomeTimetableDay`
  - `StudentsList`, `StudentsAttendance`, `StudentsHomework`, `StudentsHomeworkDetail`, `StudentsHomeworkEntry`
  - Media / Infra: `PdfViewer`, `PictureViewer`, `VideoPlayer`, `FcmNotification`, `FcmNotificationService`, `InternetReceiver`, `Offline`, `ReConnect`
- **32 PHP Endpoints Observed:**
  - `appraisals.php`
  - `attendance.php`
  - `classes.php`
  - `delete-homework.php`
  - `download-salary-slip.php?SalaryId=`
  - `events.php`
  - `facebook.php`
  - `generate-account-pin-code.php`
  - `generate-pin-code.php`
  - `homework.php`
  - `leaves.php`
  - `lesson-plans.php`
  - `loans.php`
  - `login.php`
  - `logout.php`
  - `notices.php`
  - `payroll.php`
  - `post-comments.php`
  - `posts.php`
  - `reset-password.php`
  - `save-attendance.php`
  - `save-comments.php`
  - `save-homework.php`
  - `save-leave.php`
  - `schools.php`
  - `setup-account.php`
  - `students.php`
  - `timetable.php`
  - `update-password.php`
  - `verify-account-pin-code.php`
  - `verify-pin-code.php`
  - `version.php`
