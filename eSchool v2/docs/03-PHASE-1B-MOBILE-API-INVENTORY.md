# eSchool v2 — Phase 1B Deep Mobile Decompilation & API Extraction

> **Scope & Provenance:** Reverse-engineered statically via `jadx` v1.5.6 (`Azul Zulu JRE 11.0.33`) from the official production/demo Android APKs supplied in `D:\eSchool v2\Mobile APK\`.  
> **Non-Assumption & Security Policy:** Every endpoint, HTTP method, header, parameter, JSON key, delimiter format, validation rule, and class reference in this document is strictly verified against decompiled bytecode/Java source and Android resources. Any server-generated behavior, enum exhaustive list, or external portal page not determinable from client APKs is explicitly marked `[UNRESOLVED]` with code evidence. Hardcoded keys, tokens, credentials, and PINs are **excluded/redacted**.

---

## 1. Decompiled Target Metadata

| Property | eSchool for Parents | eSchool for Teachers |
| :--- | :--- | :--- |
| **APK Filename** | `eSchool-for-Parents_1.0.20.10.2026_apkcube.apk` | `eSchool-for-Teachers_1.0.07.10.2026_apkcube.apk` |
| **Application ID** | `com.sw3solutions.eschoolforparents` | `com.sw3solutions.eschoolforteachers` |
| **Version Name / Code** | `1.0.20.10.2026` / `156` (`BuildConfig.java:8-9`) | `1.0.07.10.2026` / `66` (`BuildConfig.java:8-9`) |
| **Default Base API URL (`App.API_SERVER`)** | `https://demo.eschool.com.pk/api/parents/` (`App.java:36`) | `https://demo.eschool.com.pk/api/teachers/` (`App.java:33`) |
| **Per-Tenant Base URL (`App.sServer`)** | Selected dynamically from `schools.php` (`HttpHeaders.SERVER` = `"Server"`) and persisted in `SharedPreferences("AppInfo")` | Selected dynamically from `schools.php` (`"Server"`) and persisted in `SharedPreferences("AppInfo")` |
| **Relay Fallback Server (`App.RELAY_SERVER`)** | `https://eschool-parents-app.mt-shahzad.workers.dev/` (`App.java:57`) | Not present |
| **Shared Assets / Base CSS** | `<base href="https://www.eschool.pk/" />`, `https://demo.eschool.com.pk/api/css/default.css` | `<base href="https://www.eschool.pk/" />`, notices hardcode `https://www.eschool.pk/css/default.css` (`HomeNoticesDetail.java:74`) |
| **App Local Directory (`APP_FOLDER`)** | `eschoolForParents` | `eschoolForTeachers` |
| **Local Cache Duration (`CACHE_TIME`)** | `60000` ms (`60s`, `App.java:42`) | `300000` ms (`5m`, `App.java:39`) |

---

## 2. Transport Layer, Headers, Relay Routing & Network Configuration

### 2.1 HTTP Client Architecture (`API.java`)

Both applications wrap `OkHttpClient` synchronously inside Android `AsyncTask` workers (`doInBackground`), returning raw response strings (or JSON error objects formatted on client exceptions).

| Mechanism | eSchool for Parents (`API.java`) | eSchool for Teachers (`API.java`) |
| :--- | :--- | :--- |
| **HTTP Methods Used by `API`** | `API.POST(endpoint, ContentValues)` only (`API.GET` does not exist) | `API.GET(endpoint)` and `API.POST(endpoint, ContentValues)` (`API.java:15-54`) |
| **Content-Type (`POST`)** | `application/x-www-form-urlencoded` (`okhttp3.FormBody.Builder`) | `application/x-www-form-urlencoded` (`okhttp3.FormBody.Builder`) |
| **Timeouts (`OkHttpClient.Builder`)** | Connect `10s`, Write `60s`, Read `300s` (`API.java:168-170`) | Connect `10s`, Write `300s`, Read `300s` (`API.java:19-21, 34-37`) |
| **TLS & Connection Specs** | Explicitly sets `ConnectionSpec.MODERN_TLS`, `ConnectionSpec.COMPATIBLE_TLS`, `retryOnConnectionFailure(true)` (`API.java:171-172`) | Default OkHttp `Builder` settings |
| **Custom Request Headers** | 1. Interceptor `defpackage.e`: `User-Agent: eSchoolForParents/1.0.20.10.2026 (Android <Build.VERSION.RELEASE>)` (`e.java:12`)<br>2. When routing via Cloudflare Worker relay: `X-App-Key: [REDACTED - App.RELAY_API_KEY]` (`API.java:124`) | None added explicitly by `API` |
| **Auto-Appended POST Form Fields** | Always adds `Device="Android"`; adds `TokenId=App.sTokenId` when `App.sTokenId != null` (`API.java:55-59`) | Always adds `Device="Android"` and `TokenId=App.sTokenId` (`API.java:51-52`) |
| **Global Directory Server Routing (`getApiServer`)** | Routes `version.php`, `schools.php`, `facebook.php` to `App.API_SERVER`; all other endpoints resolve against `App.sServer` when non-empty (`API.java:205-223`) | Routes `version.php`, `schools.php` to `App.API_SERVER`; all other endpoints (including `facebook.php`) resolve against `App.sServer` (`API.java:56-74`) |
| **Relay Proxy Fallback (`RELAY_SERVER`)** | Tries direct vs relay in order `[false, true]`, or `[true, false]` while `System.currentTimeMillis() < b` (`RELAY_STICKY_TIME = 7200000` ms / `2 hours`). Rewrites `https://<host>/<path>?<query>` to `https://eschool-parents-app.mt-shahzad.workers.dev/<host><encodedPath><encodedQuery>`. Retries alternate route on `ConnectException`, `UnknownHostException`, `NoRouteToHostException`, connect timeouts, or sticky relay HTTP `502`/`403` (`API.java:60-125, 177-183`). | None |
| **Response Envelope Validation** | Requires HTTP 2xx AND trimmed body starting with `{` or `[`; otherwise throws `defpackage.f` and synthesizes `{"Status":"ERROR","Message":...}` (`API.java:133-199`) | Returns `response.body().string()`; on `Exception` returns `"{'Status':'ERROR','Message':'Request failed due to time-out. please try again'}"` (`API.java:25-27, 43-53`) |

### 2.2 Secondary HTTP Transports (`GET` Outside `OkHttp`)

In addition to form-encoded `API.POST`/`API.GET`, both APKs initiate standard HTTP `GET` requests through Android system components:
1. **`WebView.loadUrl` (`GET`):**
   - Payment gateway checkout flows (`PayViaAlpha`, `PayViaCard`, `PayViaJazzCash`, `PayViaBlinq`, `PayViaKuickPay`) in Parents.
   - PDF fallback viewer (`PdfViewer.loadWebView()`): `https://drive.google.com/viewer?embedded=true&url=<sPdf>` (Parents JS-removes `[role="toolbar"]` in `l1.java:70`; Teachers `e2.java:23`).
   - Inline HTML rendering via `WebView.loadData(..., "base64")` loads `<base href="https://www.eschool.pk/" />` and external CSS `default.css`.
2. **`PdfRendererView.initWithUrl` (`com.rajat.pdfviewer`):**
   - Parents `PdfViewer.java:182-186` appends `?Inline=Y` or `&Inline=Y` to the target URL (`new HeaderData()`, no auth headers).
   - Teachers `PdfViewer.java:173` loads `sPdf` directly without appending `Inline=Y` (`new HeaderData()`).
3. **`DownloadManager` (`Common.addToDownloads`):**
   - Enqueues `GET` requests to OS `DownloadManager` over Wi-Fi/Mobile (`AllowedNetworkTypes(3)`, roaming disabled) for documents, fee vouchers (`download-fee.php?FeeId=`), exam PDFs, salary slips, appraisal reports, weekly plans, daily reports, and homework/notice/leave attachments.

### 2.3 Cleartext & Network Security Configuration

- Both manifests declare `android:usesCleartextTraffic="true"` and `@xml/network_security_config`.
- `res/xml/network_security_config.xml` explicitly permits cleartext HTTP (`cleartextTrafficPermitted="true"`) with `includeSubdomains="true"` for multi-tenant school hosts:
  - Core platform domains: `eschool.pk`, `eschool.com.pk`, `eschool.net.pk`, `sw3solutions.com`, `sw3solutions.net`
  - School client domains: `darulquran.org`, `appleschools.pk`, `beats.com.pk`, `si.edu.pk`, `scholastic.edu.pk`, `learningalliance.edu.pk`, `mgs.edu.pk`, `edn.com.pk`, `t.edu.pk`, `dnkeducation.com`, `americanlycetuffschool.com`, `sss.edu.pk`, `egcacademy.com`, `ghazischolars.com`, `aimschool.edu.pk`
  - Third-party: `google.com`, `googleapis.com`, `firebase.com`

---

## 3. Authentication, Session, PIN Onboarding & Token Flows

### 3.1 Session Model (No JWT / No Bearer Auth)

Neither APK uses JWTs, OAuth2 Bearer headers, cookies (`CookieJar`), or HTTP `Authorization` headers in API requests:
1. **Identity Token (`AccountId`):** Upon `login.php` success, the server returns `AccountId` (string/numeric identifier) alongside profile metadata and feature flags (`Facebook`, `Blog`, `Events`, `Edit`). The client saves these in `SharedPreferences("AppInfo")` (`App.APP_INFO`) and static globals `App.s*`.
2. **Per-Request Authorization:** Subsequent authenticated API calls pass `AccountId` inside the `x-www-form-urlencoded` POST body (`ContentValues.put("AccountId", App.sAccountId)`), plus `Device="Android"` and `TokenId` (FCM registration token).
3. **Server-Forced Session Invalidation (`Logout: "Y"`):** Almost every authenticated `onPostExecute` handler checks:
   ```java
   jSONObject.getString("Status").equalsIgnoreCase("ERROR")
       && jSONObject.has("Logout")
       && jSONObject.getString("Logout").equalsIgnoreCase("Y")
   ```
   When triggered, the app displays `Message` and calls `Common.logout(context)`, clearing `AccountId` (and role/profile prefs) and restarting `App` (login screen).
4. **Security Implication for Phase 2+ (.NET 10):** Because legacy endpoints authenticate solely via body parameter `AccountId` with no cryptographic signature or bearer token, the Phase 2+ `.NET 10` backend **must** replace this pattern with standard `Authorization: Bearer <JWT>` (`JWT Bearer Authentication`) and server-side ownership checks.

### 3.2 Login & Multi-School ReConnect Flows

- **Parents Primary Login (`App.java:86-118`, `k.java`):**
  - Client validation: `Username.length() >= 5`, `Password.length() >= 5`. (Input filter in `Common.setUsernameInputFormatting` enforces length `15` and `ad0` filter).
  - Calls `POST login.php` with `{ Username, Password }` (+ auto `Device`, `TokenId`).
  - Note: If first `login.php` response in `k.java:50` is blank/null and `!app.O`, it auto-retries `btnLogin.callOnClick()` once.
- **Parents `ReConnect` (`ReConnect.java`, `r1.java`):**
  - Used when an already-installed user selects another school/role (`Father` | `Mother`).
  - Calls `POST schools.php` (`o1.java`), filters schools, validates `Username >= 5`, `Password >= 5`, then `POST login.php` with `{ Type, Username, Password }`.
- **Teachers Primary Login (`App.java:83-115`, `k.java`):**
  - Client validation: `Username.length() >= 11 && Username.startsWith("03")`, `Password.length() >= 5`.
  - Calls `POST login.php` with `{ Username, Password }`.
- **Teachers `ReConnect` (`k2.java`):**
  - Sends `{ Gender, Username, Password }` to `POST login.php` (`Gender` = `"Male"` | `"Female"`).

### 3.3 Account Setup & Forgot Password (4-Step PIN Flows)

Both `Account` (new mobile account setup) and `ResetPassword` (forgot password) implement an identical 4-step wizard (`iStep = 1..4`):

1. **Step 1 — School Selection (`schools.php`):**
   - Loads school directory from `App.API_SERVER`.
   - Parents checks `school.sAndroid.startsWith("com.sw3solutions.")` (`p1.java:29`, `y1.java:29`); if matched, launches or redirects Play Store to that school's white-label standalone APK instead of proceeding inline! If `school.sServer` is blank, shows "This School is not Linked with the App yet".
2. **Step 2 — Generate PIN (`generate-pin-code.php` / `generate-account-pin-code.php`):**
   - **Local Rate Limit (5/day):** Before calling the API, both APKs check `SharedPreferences("AppInfo")` key `<dd-MM-yyyyy>-<MobileNo>` (`SimpleDateFormat("dd-MM-yyyyy")` — literal 5-digit year pattern in original source, e.g., `Account.java:93`, `c.java:31`, `w1.java:31`) and block if count `>= 5` for 24 hours.
   - **Parents Validation (`Account.java:51-85`):** `Type` (`Father`|`Mother`), `CnicNo` length `>= 13`, `MobileNo` length `>= 5`, `VoucherNo` length `>= 6` (any Fee Voucher No, `Account` only; `ResetPassword` omits `VoucherNo`).
   - **Teachers Validation (`Account.java:53-88`, `ResetPassword.java:61-95`):** `Gender` (`Male`|`Female`), `EmployeeId` length `>= 6` (`Account` only; `ResetPassword` omits `EmployeeId`). If `App.sServer.contains("eschoolghana.com")`, relaxes `CnicNo` (`National ID`) to length `>= 9` and `MobileNo` to length `>= 10` without `"03"` prefix; otherwise requires `CnicNo >= 13`, `MobileNo >= 11 && startsWith("03")`.
   - **PIN Delivery Channel:** Response returns `Code` (server-side challenge/reference ID stored in `sCode`). Inferred from `verify-pin-code.php` clearing `NotificationTitle`/`NotificationMessage` prefs (`h.java:29-32`, `b2.java:29-32`): the PIN is delivered via FCM push notification (`FcmNotification`) and/or SMS `[UNRESOLVED server SMS gateway behavior]`.
3. **Step 3 — Verify PIN (`verify-pin-code.php` / `verify-account-pin-code.php`):**
   - Requires `PinCode` length `>= 6`; submits `PinCode`, `MobileNo`, `CnicNo`, `Type`/`Gender` (note: `b2.java`/`s2.java` reset PIN verification omits `CnicNo`), and `Code`. Clears cached notification prefs.
4. **Step 4 — Set Password (`setup-account.php` / `reset-password.php`):**
   - Requires `Password` length `>= 5` and matching confirm password (`equalsIgnoreCase` in client!).
   - Tenant quirk (`isc.eschool.pk` in Parents `g.java:60`, `h.java:55`, `b2.java:56`, `a2.java:65`): sets prefilled/saved `Username` to `sCnicNo` instead of `sMobileNo`.

### 3.4 Firebase Cloud Messaging (FCM) Token & Notification Flow

- On app startup (`App.java`, `Home.java`, `FcmNotification.java`), both apps subscribe to FCM topic matching package name (`com.sw3solutions.eschoolforparents` / `com.sw3solutions.eschoolforteachers`) and asynchronously populate `App.sTokenId` via `pb1.onComplete` (Parents, `pb1.java:273-277`) / `jb1.onComplete` (Teachers, `jb1.java:292-296`) / `f41.onComplete` (Parents `Home`/`FcmNotification`).
- **Push Data Keys (`FcmNotificationService.java` in both apps):**
  - Data payload (`remoteMessage.getData()`): reads `"Title"`, `"Message"`, `"Summary"`, `"Website"`. If `App.sAccountId` is non-empty, persists `"NotificationTitle"` and `"NotificationMessage"` into `SharedPreferences("AppInfo")` (later checked on `Home.onResume()`).
  - Fallback notification payload (`remoteMessage.getNotification()`): reads `getTitle()`, `getBody()`.
  - Channels: `"eSchoolForParents"` / `"eSchool"` (Parents) and `"eSchoolForTeachers"` / `"eSchool"` (Teachers).
  - Viewer (`FcmNotification.java`): Renders `sTitle` via `Html.fromHtml` and `sMessage` inside a `WebView` wrapped with `<base href="https://www.eschool.pk/" />` + `css/default.css`.

---

## 4. Cryptography, Hashing, Encoding & Request Signing Audit

| Mechanism | Purpose & Location | Technical Assessment & Migration Notes |
| :--- | :--- | :--- |
| **Payload Encryption** | **None identified** | All request params and JSON responses travel over TLS (or cleartext HTTP for listed `network_security_config` domains) without application-layer encryption. |
| **Request Signing / HMAC** | **None identified** | Requests carry no HMAC, timestamp nonce, or bearer JWT. Only `X-App-Key` static header is sent when Parents uses `RELAY_SERVER`. |
| **MD5 Hashing (`Common.md5`)** | Parents: `PayViaAlpha.java:45`, `PayViaCard.java:45`, `PayViaJazzCash.java:45`<br>Teachers: defined in `Common.java:414-430`, no active caller identified | Lowercase 32-char hex MD5 digest of UTF-8 `VoucherNo`, used directly in WebView checkout URL: `<serverBase>/pay/<md5(VoucherNo)>/`. **Risk:** MD5 without salt allows fee voucher URL enumeration; replace in Phase 2+ with opaque signed/random payment session tokens or authenticated payment endpoints. |
| **Base64 Encoding** | 1. **File Uploads (`Common.getFileData`):** Encodes image/file byte streams into Base64 strings sent inside `x-www-form-urlencoded` POST fields (`PictureData`, `AttachmentData{i}`).<br>   - Parents `Common.java:223, 517`: uses `Base64.DEFAULT` (`0`, includes line wraps).<br>   - Teachers `Common.java:309`: `Uri` overload uses `Base64.DEFAULT` (`0`), whereas `String path` overload (`Common.java:646`) uses `Base64.NO_WRAP` (`2`).<br>2. **WebView Rendering:** HTML strings encoded via `Base64.encodeToString(..., 0)` and loaded via `loadData(..., "text/html; charset=utf-8", "base64")`. | In Phase 2+ `.NET 10` APIs, replace inline Base64-in-form-body uploads with `multipart/form-data` (`IFormFile`) endpoints with strict MIME, extension, and size validation. |
| **Client Image Pre-Processing** | Parents `StudentProfileEdit` (`r4.java:70`): resizes to max `1200px` JPEG (quality `90`, copying 17 EXIF tags).<br>Teachers `StudentsHomeworkEntry` (`m3.java:69`): resizes `png`/`jpg`/`jpeg` to `App.MAX_IMAGE_DIMENSION = 1600`, quality `90`. | Preserve JPEG EXIF orientation normalization (`Common.resetPictureAngle`) on client/server pipelines. |
| **Redacted Static Secrets** | 1. `App.RELAY_API_KEY` (`parents/.../App.java:56`) → **`[REDACTED - App.RELAY_API_KEY]`**<br>2. `com.google.android.geo.API_KEY` (`AndroidManifest.xml`) → **`[REDACTED - Google Maps API Key]`** | Do not copy legacy hardcoded keys into React/.NET codebases. Store all keys in environment variables / secret managers. |

---

## 5. Complete API Inventory — eSchool for Parents (`com.sw3solutions.eschoolforparents`)

> **Global Automatic Fields on ALL `API.POST` Calls:** `Device="Android"`, and `TokenId=App.sTokenId` (if non-null).  
> **Global Error / Logout Envelope:** `{"Status": "ERROR", "Message": "<text>", "Logout"?: "Y" | "N"}`.

### 5.1 Master Endpoint & Web/Download Index (Parents)

| # | Endpoint / URL Pattern | Method | Base Pool | Calling Class (`Task`) | Request Inputs | Response Root / Action |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- |
| 1 | `version.php` | `POST` | `API_SERVER` | `App` (`j`) | None (+ global) | `Status`, `Version`, `Code` |
| 2 | `schools.php` | `POST` | `API_SERVER` | `Account` (`d`), `ReConnect` (`o1`), `ResetPassword` (`x1`) | None (+ global) | `Status`, `Schools[]` |
| 3 | `login.php` | `POST` | `sServer` | `App` (`k`), `ReConnect` (`r1`) | `Username`, `Password`, optional `Type` | `Status`, `AccountId`, `Username`, `Type`, flags, `Students[]` |
| 4 | `logout.php` | `POST` | `sServer` | `Home` (`ar1`) | `AccountId` | `Status` |
| 5 | `generate-pin-code.php` | `POST` | `sServer` | `Account` (`c`) | `Type`, `CnicNo`, `MobileNo`, `VoucherNo` | `Status`, `Code` |
| 6 | `verify-pin-code.php` | `POST` | `sServer` | `Account` (`h`) | `PinCode`, `MobileNo`, `CnicNo`, `Type`, `Code` | `Status`, `Message` |
| 7 | `setup-account.php` | `POST` | `sServer` | `Account` (`g`) | `Type`, `CnicNo`, `MobileNo`, `Password` | `Status`, `Message` |
| 8 | `generate-account-pin-code.php` | `POST` | `sServer` | `ResetPassword` (`w1`) | `Type`, `CnicNo`, `MobileNo` | `Status`, `Code` |
| 9 | `verify-account-pin-code.php` | `POST` | `sServer` | `ResetPassword` (`b2`) | `PinCode`, `MobileNo`, `Type`, `Code` | `Status`, `Message` |
| 10 | `reset-password.php` | `POST` | `sServer` | `ResetPassword` (`a2`) | `Type`, `MobileNo`, `Password` | `Status`, `Message` |
| 11 | `update-password.php` | `POST` | `sServer` | `HomeSettings` (`i1`) | `AccountId`, `Username`, `OldPassword`, `NewPassword` | `Status`, `Message` |
| 12 | `facebook.php` | `POST` | `API_SERVER` | `HomeFacebook` (`l0`) | `AccountId` | `Status`, `Posts[]` (`facebook.json`) |
| 13 | `posts.php` | `POST` | `sServer` | `HomeBlog` (`s`) | `AccountId`, `LastPost`, `RequestType` | `Status`, `Posts[]` (`posts.json` / cache bug `blog.json`) |
| 14 | `post-comments.php` | `POST` | `sServer` | `HomeBlog` (`t`) | `AccountId`, `Post`, `LastComment` | `Status`, `Comments[]` |
| 15 | `save-comments.php` | `POST` | `sServer` | `HomeBlog` (`w`) | `AccountId`, `Post`, `Comments` | `Status`, `Id`, `Name`, `DateTime`, `Comments`, `Picture`, `Count` |
| 16 | `events.php` | `POST` | `sServer` | `HomeEvents` (`f0`) | `AccountId` | `Status`, `UpcomingEvents[]`, `PastEvents[]` (`events.json`) |
| 17 | `notices.php` | `POST` | `sServer` | `HomeNotices` (`u0`) | `AccountId`, `PageNo` | `Status`, `Notices[]` (`notices.json`) |
| 18 | `students.php` | `POST` | `sServer` | `HomeChilds` (`y`) | `AccountId` | `Status`, flags, `Students[]` (`students.json`) |
| 19 | `leaves.php` | `POST` | `sServer` | `HomeLeaves` (`o0`) | `AccountId` | `Status`, `Leaves[]` (`leaves.json`) |
| 20 | `save-leave.php` | `POST` | `sServer` | `LeaveApplication` (`k1`) | `AccountId`, `Students` (CSV), `FromDate`, `ToDate`, `Details` | `Status`, `Leaves[]` |
| 21 | `ptm-requests.php` | `POST` | `sServer` | `HomePtm` (`c1`) | `AccountId` | `Status`, `Requests[]` (`ptm.json`) |
| 22 | `save-ptm-request.php` | `POST` | `sServer` | `RequestPtm` (`t1`) | `AccountId`, `Student`, `DateTime`, `Details` | `Status`, `Request{}` |
| 23 | `ptm-comments.php` | `POST` | `sServer` | `HomePtmDetail` (`f1`) | `AccountId`, `Request` | `Status`, `Comments[]` |
| 24 | `save-ptm-comments.php` | `POST` | `sServer` | `HomePtmDetail` (`g1`) | `AccountId`, `Request`, `Comments` | `Status`, `Message` |
| 25 | `get-student-profile.php` | `POST` | `sServer` | `StudentProfileEdit` (`q4`) | `AccountId`, `Student` | `Status`, profile fields + `Locations[]`, `Religions[]`, `Nationalities[]` |
| 26 | `save-student-profile.php` | `POST` | `sServer` | `StudentProfileEdit` (`r4`) | `AccountId`, `Student`, personal/emergency fields, optional `PictureName` + `PictureData` | `Status`, `Message` |
| 27 | `get-parents-profile.php` | `POST` | `sServer` | `StudentParentsEdit` (`b4`) | `AccountId`, `Student`, `Type` | `Status`, parent fields + `Locations[]`, `Occupations[]` |
| 28 | `save-parents-profile.php` | `POST` | `sServer` | `StudentParentsEdit` (`c4`) | `AccountId`, `Student`, `Type`, parent fields | `Status`, `Message` |
| 29 | `weekly-plans.php` | `POST` | `sServer` | `StudentWeeklyPlans` (`z4`) | `AccountId`, `Student`, `PageNo` | `Status`, `WeeklyPlans[]` (`weekly-plans-<id>.json`) |
| 30 | `daily-report.php` | `POST` | `sServer` | `StudentDailyReport` (`w2`) | `AccountId`, `Student` | `Status`, `DailyReport[]` (`daily-report-<id>.json`) |
| 31 | `homework.php` | `POST` | `sServer` | `StudentHomework` (`q3`) | `AccountId`, `Student`, `PageNo` | `Status`, `Homework[]` (`homework-<id>.json`) |
| 32 | `timetable.php` | `POST` | `sServer` | `StudentTimetable` (`t4`) | `AccountId`, `Student` | `Status`, `Timetable.Day1..Day7[]` (`timetable-<id>.json`) |
| 33 | `attendance.php` (Monthly) | `POST` | `sServer` | `StudentAttendance` (`e2`) | `AccountId`, `Student`, `YearMonth` | `Status`, counts, `Attendance[]` (`attendance-<id>-<ym>.json`) |
| 34 | `attendance.php` (Subject-Wise) | `POST` | `sServer` | `StudentAttendanceSubjectListing` (`i2`) | `AccountId`, `Student` | `Status`, `Subjects[]` (`attendance-<id>.json`) |
| 35 | `billing.php` | `POST` | `sServer` | `StudentBilling` (`p2`) | `AccountId`, `Student` | `Status`, optional `DefaultAmount`/`PayableAmount`/`AdvanceFee`, `Vouchers[]` (`billing-<id>.json`) |
| 36 | `exams.php` | `POST` | `sServer` | `StudentExams` (`l3`) | `AccountId`, `Student` | `Status`, `Exams[]` (`exams-<id>.json`) |
| 37 | `documents.php` | `POST` | `sServer` | `StudentDocuments` (`e3`) | `AccountId`, `Student` | `Status`, `Documents[]` (`documents-<id>.json`) |
| 38 | `comments.php` | `POST` | `sServer` | `StudentComments` (`s2`) | `AccountId`, `Student` | `Status`, `Comments[]` (`comments-<id>.json`) |
| 39 | `download-fee.php?FeeId=<id>` | `GET` (DM / PDF) | `sServer` | `Common.addToDownloads`, `PdfViewer` | Query `FeeId` (+ optional `Inline=Y` in `PdfViewer`) | Binary PDF fee voucher (`<id>.pdf`) |
| 40 | `<base>/pay/<md5(VoucherNo)>/` | `GET` (WebView) | `sServer.replace("parents/","")` | `PayViaAlpha`, `PayViaCard`, `PayViaJazzCash` | Path param `Common.md5(VoucherNo)` | Gateway checkout HTML page |
| 41 | `<base>/payments/blinq/index.php?VoucherNo=<no>` | `GET` (WebView) | `sServer.replace("parents/","payments/")` | `PayViaBlinq` | Query `VoucherNo` | BLINQ checkout HTML page |
| 42 | `<base>/payments/kuickpay/index.php?VoucherNo=<no>` | `GET` (WebView) | `sServer.replace("parents/","payments/")` | `PayViaKuickPay` | Query `VoucherNo` | KuickPay checkout HTML page |

---

### 5.2 Exact Request & Response Schemas (Parents)

#### A. Version Check & Multi-Tenant School Discovery
- **`POST version.php`** (`App` -> `j.java`)
  - Request: `{ Device: "Android", TokenId?: string }`
  - Response:
    ```json
    {
      "Status": "OK",
      "Version": "1.0.20.10.2026",
      "Code": "156"
    }
    ```
    Compares installed `versionCode` vs `Integer.parseInt(Code)` (`j.java:36-44`).
- **`POST schools.php`** (`d.java`, `o1.java`, `x1.java`)
  - Request: `{ Device: "Android", TokenId?: string }`
  - Response (`School.java`):
    ```json
    {
      "Status": "OK",
      "Schools": [
        {
          "Id": 1,
          "Name": "string",
          "Organization": "string",
          "Logo": "https://...",
          "Server": "https://<tenant>/api/parents/",
          "Android": "com.sw3solutions.<custom_app_or_empty>",
          "iOS": "string"
        }
      ]
    }
    ```

#### B. Login, Logout, PIN Verification & Account Setup/Reset
- **`POST login.php`** (`App` -> `k.java`, `ReConnect` -> `r1.java`)
  - Request (`k.java`): `{ Username, Password }`
  - Request (`r1.java` from `ReConnect`): `{ Type: "Father" | "Mother", Username, Password }`
  - Response:
    ```json
    {
      "Status": "OK",
      "Message": "string (on error)",
      "Username": "string",
      "Type": "Father | Mother",
      "AccountId": "string",
      "Blog": "Y | N",
      "Events": "Y | N",
      "Facebook": "Y | N",
      "Edit": "Y | N",
      "Students": [ ...Child objects matching students.php... ]
    }
    ```
    *Note:* `r1.java:55` retains `reConnect.sUsername` instead of reading `jSONObject.getString("Username")`.
- **`POST logout.php`** (`Home` -> `ar1.java`)
  - Request: `{ AccountId }`
  - Response: `{ "Status": "OK" }`
- **`POST generate-pin-code.php`** (`Account` -> `c.java`)
  - Request: `{ Type, CnicNo, MobileNo, VoucherNo }`
  - Response: `{ "Status": "OK", "Code": "string", "Message"?: "string" }`
- **`POST verify-pin-code.php`** (`Account` -> `h.java`)
  - Request: `{ PinCode, MobileNo, CnicNo, Type, Code }`
  - Response: `{ "Status": "OK", "Message"?: "string" }`
- **`POST setup-account.php`** (`Account` -> `g.java`)
  - Request: `{ Type, CnicNo, MobileNo, Password }`
  - Response: `{ "Status": "OK", "Message"?: "string" }`
- **`POST generate-account-pin-code.php`** (`ResetPassword` -> `w1.java`)
  - Request: `{ Type, CnicNo, MobileNo }`
  - Response: `{ "Status": "OK", "Code": "string", "Message"?: "string" }`
- **`POST verify-account-pin-code.php`** (`ResetPassword` -> `b2.java`)
  - Request: `{ PinCode, MobileNo, Type, Code }`
  - Response: `{ "Status": "OK", "Message"?: "string" }`
- **`POST reset-password.php`** (`ResetPassword` -> `a2.java`)
  - Request: `{ Type, MobileNo, Password }`
  - Response: `{ "Status": "OK", "Message"?: "string" }`
- **`POST update-password.php`** (`HomeSettings` -> `i1.java`)
  - Request: `{ AccountId, Username, OldPassword, NewPassword }`
  - Response: `{ "Status": "OK" | "ERROR", "Logout"?: "Y", "Message"?: "string" }`

#### C. Home Dashboard Feeds (Facebook, Blog, Events, Notices)
- **`POST facebook.php`** (`l0.java`, `m0.java`, `HomeFacebook.java`, `HomeFacebookPost.java`)
  - Request: `{ AccountId }`
  - Response (`Posts[]` -> `facebook.json`):
    ```json
    {
      "Status": "OK",
      "Posts": [
        {
          "Index": 1,
          "Title": "string",
          "Details": "HTML string",
          "DateTime": "string",
          "Picture": "https://... or empty",
          "Attachments": [
            {
              "Type": "Photo | Album | Video | Link",
              "Image": "https://... (for Photo/Album)",
              "URL": "https://... (for Video/Link)",
              "Title": "string (for Video/Link)"
            }
          ]
        }
      ]
    }
    ```
- **`POST posts.php`** (`s.java`, `u.java`, `HomeBlogPost.java`)
  - Request: `{ AccountId, LastPost: int (0 initially or last Id), RequestType: "" | "N" | ... }`
  - Response (`Posts[]` -> `posts.json`):
    ```json
    {
      "Status": "OK",
      "Posts": [
        {
          "Id": 10,
          "Title": "string",
          "Category": "string",
          "DateTime": "string",
          "Summary": "HTML string",
          "Details": "HTML string",
          "Picture1": "url or ''",
          "Picture2": "url or ''",
          "Picture3": "url or ''",
          "VideoUrl": "mp4 or youtube url or ''",
          "Count": 5,
          "Comments": [
            { "Id": 1, "Name": "string", "DateTime": "string", "Comments": "string", "Picture": "url" }
          ],
          "Pictures": ["https://..."],
          "PostUrl": "https://..."
        }
      ]
    }
    ```
- **`POST post-comments.php`** (`t.java`)
  - Request: `{ AccountId, Post: int, LastComment: int }`
  - Response: `{ "Status": "OK", "Comments": [ { "Id": int, "Name": "string", "DateTime": "string", "Comments": "string", "Picture": "url" } ], "Message"?: "string" }`
- **`POST save-comments.php`** (`w.java`)
  - Request: `{ AccountId, Post: int, Comments: string }`
  - Response: `{ "Status": "OK", "Id": int, "Name": "string", "DateTime": "string", "Comments": "string", "Picture": "url", "Count": int, "Message"?: "string" }`
- **`POST events.php`** (`f0.java`, `g0.java`)
  - Request: `{ AccountId }`
  - Response (`events.json`):
    ```json
    {
      "Status": "OK",
      "UpcomingEvents": [
        {
          "Id": "12",
          "Category": "string",
          "Title": "string",
          "School": "string",
          "Class": "string",
          "StartDate": "string",
          "EndDate": "string",
          "StartTime": "string",
          "EndTime": "string",
          "Day": "string",
          "Venue": "string",
          "Details": "string"
        }
      ],
      "PastEvents": [ /* same schema */ ]
    }
    ```
- **`POST notices.php`** (`u0.java`, `x0.java`, `w0.java`, `HomeNoticesDetail.java`)
  - Request: `{ AccountId, PageNo: int (1-based, page size 25) }`
  - Response (`Notices[]` -> `notices.json`):
    ```json
    {
      "Status": "OK",
      "Notices": [
        {
          "Id": 1,
          "Title": "string",
          "Notice": "HTML body rendered in WebView",
          "Date": "string",
          "Attachments": [
            { "Type": "P | V | L | F", "URL": "https://...", "Title": "string" }
          ]
        }
      ]
    }
    ```

#### D. Children List, Student Profile & Parent Profiles
- **`POST students.php`** (`y.java`, `z.java`, `StudentProfile.java`, `StudentParentsFather.java`, `StudentParentsMother.java`)
  - Request: `{ AccountId }`
  - Response (`students.json`):
    ```json
    {
      "Status": "OK",
      "Blog": "Y | N",
      "Events": "Y | N",
      "Facebook": "Y | N",
      "Edit": "Y | N",
      "Students": [
        {
          "Id": "123",
          "Name": "string",
          "RegistrationNo": "string",
          "Class": "string",
          "Section": "string",
          "School": "string",
          "Gender": "Male | Female",
          "Status": "Active | Active (Defaulter) | Withdrawn | Graduated",
          "Picture": "https://...",
          "PersonalInfo": {
            "RegistrationDate": "string",
            "JoiningDate": "string",
            "Session": "string",
            "ClassTeacher": "string (optional)",
            "Phone": "string",
            "Mobile": "string",
            "Email": "string",
            "StreetAddress": "string",
            "TownCity": "string",
            "PostalCode": "string",
            "DateOfBirth": "yyyy-MM-dd",
            "Disability": "string",
            "BloodGroup": "string",
            "Hand": "Left | Right",
            "Religion": "string",
            "Nationality": "string",
            "RevisionRequest": "Y | N (optional, defaults 'Y' if absent)"
          },
          "EmergencyInfo": {
            "ContactName": "string",
            "Relation": "string",
            "Phone": "string",
            "Mobile": "string",
            "StreetAddress": "string",
            "TownCity": "string"
          },
          "FatherInfo": {
            "Name": "string",
            "CnicNo": "string",
            "MaritalStatus": "Married | Separated | Divorced",
            "Phone": "string",
            "Mobile": "string",
            "Email": "string",
            "StreetAddress": "string",
            "TownCity": "string",
            "PostalCode": "string",
            "Qualification": "string",
            "Occupation": "string",
            "Company": "string",
            "Department": "string",
            "Designation": "string",
            "RevisionRequest": "Y | N (optional)"
          },
          "MotherInfo": { /* Identical schema to FatherInfo */ }
        }
      ]
    }
    ```
- **`POST get-student-profile.php`** (`q4.java`)
  - Request: `{ AccountId, Student: int }`
  - Response:
    ```json
    {
      "Status": "OK",
      "Phone": "", "Mobile": "", "Email": "",
      "City": "id", "Town": "id", "Address": "", "PostalCode": "",
      "DateOfBirth": "yyyy-MM-dd", "Disability": "",
      "BloodGroup": "|A+|A-|B+|B-|O+|O-|AB+|AB-",
      "Hand": "Left | Right", "Religion": "id", "Nationality": "id",
      "EmergencyName": "", "EmergencyRelation": "",
      "EmergencyPhone": "", "EmergencyMobile": "",
      "EmergencyCity": "id", "EmergencyTown": "id", "EmergencyAddress": "",
      "Locations": [
        { "id": "1", "name": "City Name", "towns": "[{\"id\":\"10\",\"name\":\"Town\"}]" }
      ],
      "Religions": [ { "id": "1", "name": "string" } ],
      "Nationalities": [ { "id": "1", "name": "string" } ]
    }
    ```
    *Note nested JSON-in-string:* `Locations[i].towns` is parsed by calling `new JSONArray(getString("towns"))` (`q4.java:146,174`).
- **`POST save-student-profile.php`** (`r4.java`)
  - Request: `{ AccountId, Student, Phone, Mobile, Email, Town, Address, PostalCode, DateOfBirth, Disability, BloodGroup, Hand, Religion, Nationality, EmergencyName, EmergencyRelation, EmergencyPhone, EmergencyMobile, EmergencyTown, EmergencyAddress, PictureName?, PictureData? }` (`PictureData` is Base64 JPEG resized max `1200px`, `r4.java:70-75`).
  - Response: `{ "Status": "OK", "Message"?: "string" }`. Updates local `students.json` `PersonalInfo.RevisionRequest = "Y"`.
- **`POST get-parents-profile.php`** (`b4.java`)
  - Request: `{ AccountId, Student: int, Type: "F" | "M" }`
  - Response: `{ "Status": "OK", "Name", "CnicNo", "MaritalStatus", "Phone", "Mobile", "Email", "City", "Town", "Address", "PostalCode", "Qualification", "Occupation", "Company", "Department", "Designation", "Locations": [...], "Occupations": [{ "id", "name" }] }`
- **`POST save-parents-profile.php`** (`c4.java`)
  - Request: `{ AccountId, Student: int, Type: "F" | "M", Name, CnicNo, MaritalStatus, Phone, Mobile, Email, Town, Address, PostalCode, Qualification, Occupation, Company, Department, Designation }`
  - Response: `{ "Status": "OK", "Message"?: "string" }`. Updates local `students.json` `FatherInfo`/`MotherInfo.RevisionRequest = "Y"`.

#### E. Leaves & PTM
- **`POST leaves.php`** (`o0.java`, `r0.java`, `HomeLeaves.java`)
  - Request: `{ AccountId }`
  - Response (`Leaves[]` -> `leaves.json`):
    ```json
    {
      "Status": "OK",
      "Leaves": [
        {
          "Id": 1,
          "Student": "string",
          "Class": "string",
          "Details": "HTML/string",
          "FromDate": "string",
          "ToDate": "string",
          "Status": "string",
          "Attachments": [ { "Type": "P | F | ...", "URL": "https://...", "Title": "string" } ]
        }
      ]
    }
    ```
- **`POST save-leave.php`** (`LeaveApplication.java`, `k1.java`)
  - Request: `{ AccountId, Students: "<id1>,<id2>,..." (comma-separated active child IDs), FromDate: "yyyy-MM-dd", ToDate: "yyyy-MM-dd", Details }`
  - Response: `{ "Status": "OK", "Leaves": [ /* updated Leaves[] */ ], "Logout"?: "Y", "Message"?: "string" }`
- **`POST ptm-requests.php`** (`c1.java`, `d1.java`, gated on server host `unity.eschool.pk`)
  - Request: `{ AccountId }`
  - Response (`ptm.json`): `{ "Status": "OK", "Requests": [ { "Id": int, "Student": "string", "Class": "string", "Details": "string", "DateTime": "string", "Status": "string", "Comments": int } ] }`
- **`POST save-ptm-request.php`** (`RequestPtm.java`, `t1.java`)
  - Request: `{ AccountId, Student: "<studentId>", DateTime: "yyyy-MM-dd HH:mm:00", Details }`
  - Response: `{ "Status": "OK", "Request": { /* single PtmRequest object */ }, "Logout"?: "Y", "Message"?: "string" }`
- **`POST ptm-comments.php`** (`f1.java`)
  - Request: `{ AccountId, Request: int }`
  - Response: `{ "Status": "OK", "Comments": [ { "Id": int, "Type": "A | ...", "User": "string", "DateTime": "string", "Comments": "string" } ] }` *(When `Type == "A"`, highlights row `#ffffe6` as Admin/Staff reply).*
- **`POST save-ptm-comments.php`** (`g1.java`)
  - Request: `{ AccountId, Request: int, Comments: string }`
  - Response: `{ "Status": "OK", "Message"?: "string" }`

#### F. Student Academic, Attendance, Billing, Exams & Documents
- **`POST attendance.php` (Monthly Calendar Mode)** (`StudentAttendance` -> `e2.java`, `f2.java`)
  - Request: `{ AccountId, Student: int, YearMonth: "yyyy-MM" }`
  - Response (`attendance-<id>-<ym>.json`):
    ```json
    {
      "Status": "OK",
      "MonthYear": "November 2026",
      "PrevMonth": "2026-10 or ''",
      "NextMonth": "'' or yyyy-MM",
      "Presents": "20", "Absents": "1", "Leaves": "0", "Holidays": "2",
      "Attendance": [
        { "Day": "1 | ' '", "Status": "P | A | L | H | ''" }
      ]
    }
    ```
    *Note:* Iterates up to 42 calendar grid slots (`f2.java:65`).
- **`POST attendance.php` (Subject-Wise Mode — `ahp.eschool.pk`)** (`StudentAttendanceSubjectListing` -> `i2.java`, `j2.java`, `StudentAttendanceSubjectDetails.java`)
  - Request: `{ AccountId, Student: int }` (omits `YearMonth`)
  - Response (`Subjects[]` -> `attendance-<id>.json`):
    ```json
    {
      "Status": "OK",
      "Subjects": [
        {
          "Subject": "Mathematics",
          "Attendance": [
            "2026-11-01=P",
            "2026-11-02=A",
            "2026-11-03=L",
            "2026-11-04=H"
          ]
        }
      ]
    }
    ```
    **Delimiter format (`StudentAttendanceSubjectDetails.java:75-91`):** Each array item is split on `"="` into `[date, statusCode]` where `statusCode` maps `P`→Present, `A`→Absent, `L`→Leave, `H`→Holiday.
- **`POST billing.php`** (`p2.java`, `q2.java`, `StudentBilling.java`)
  - Request: `{ AccountId, Student: int }`
  - Response (`billing-<id>.json`):
    ```json
    {
      "Status": "OK",
      "DefaultAmount": "string (conditional: cis.eschool.pk)",
      "PayableAmount": "string (conditional: cis.eschool.pk)",
      "AdvanceFee": "string (conditional: oneiro.eschool.pk)",
      "Vouchers": [
        {
          "Id": 1001,
          "VoucherNo": "string",
          "Title": "string",
          "Session": "string",
          "School": "string",
          "Class": "string",
          "Section": "string",
          "IssueDate": "string",
          "DueDate": "string",
          "PaidDate": "string (empty if unpaid)",
          "Concession": "string (optional/empty)",
          "Amount": "string",
          "Fine": "string ('0' hides row)",
          "Defaulter": "Y | N",
          "VoucherUrl": "https://.../download-fee.php?FeeId=1001",
          "FeeDetails": [
            { "Category": "string", "Comments": "string", "Amount": "string" }
          ]
        }
      ]
    }
    ```
    *Pay Online UI Gate:* Visible when `PaidDate` is empty AND `App.sServer.contains("eschool.com.pk")` (`StudentBilling.java:231-238`).
- **`POST exams.php`** (`l3.java`, `m3.java`, `StudentExams.java`)
  - Request: `{ AccountId, Student: int }`
  - Response (`Exams[]` -> `exams-<id>.json`):
    ```json
    {
      "Status": "OK",
      "Exams": [
        {
          "Id": 1,
          "Title": "string", "Session": "string", "School": "string",
          "Class": "string", "Section": "string",
          "Total": "string", "Marks": "string",
          "Status": "Pass | Fail | ...", "Comments": "string",
          "Published": "Y | N",
          "DateSheet": "https://...pdf or ''",
          "Syllabus": "https://...pdf or ''",
          "ReportCard": "https://...pdf or ''",
          "Subjects": [
            { "Subject": "string", "Teacher": "string", "Marks": "string", "Total": "string", "Grade": "string" }
          ]
        }
      ]
    }
    ```
- **`POST homework.php`** (`q3.java`, `u3.java`, `StudentHomeworkDetail.java`)
  - Request: `{ AccountId, Student: int, PageNo: int (1-based, page size 25) }`
  - Response (`Homework[]` -> `homework-<id>.json`):
    ```json
    {
      "Status": "OK",
      "Homework": [
        {
          "Id": 1,
          "Subject": "string",
          "Date": "string",
          "Topic": "string (optional)",
          "Details": "HTML string rendered in WebView",
          "Attachments": [ { "Type": "P | V | L | F", "URL": "https://...", "Title": "string" } ]
        }
      ]
    }
    ```
- **`POST weekly-plans.php`** (`z4.java`, `b5.java`, `StudentWeeklyPlansDetail.java`; UI gated on `esc.eschool.pk`)
  - Request: `{ AccountId, Student: int, PageNo: int }`
  - Response (`WeeklyPlans[]` -> `weekly-plans-<id>.json`):
    ```json
    {
      "Status": "OK",
      "WeeklyPlans": [
        {
          "Id": 1,
          "WeekNo": "string",
          "Date": "string",
          "Comments": "string",
          "DownloadUrl": "relative path appended to App.sServer (StudentWeeklyPlansDetail.java:84)",
          "Details": [ { "Subject": "string", "Details": "string" } ]
        }
      ]
    }
    ```
- **`POST daily-report.php`** (`w2.java`, `x2.java`; UI gated on `noon.eschool.pk` or `babulilm.eschool.pk`)
  - Request: `{ AccountId, Student: int }`
  - Response (`DailyReport[]` -> `daily-report-<id>.json`):
    ```json
    {
      "Status": "OK",
      "DailyReport": [
        { "Id": 1, "Month": "string", "Year": "string", "FromDate": "string", "ToDate": "string", "FileName": "string", "DownloadUrl": "string" }
      ]
    }
    ```
- **`POST timetable.php`** (`t4.java`, `v4.java`)
  - Request: `{ AccountId, Student: int }`
  - Response (`timetable-<id>.json`):
    ```json
    {
      "Status": "OK",
      "Timetable": {
        "Day1": [
          { "Id": 1, "Timing": "string", "Subject": "string", "Teacher": "string", "Gender": "string", "Picture": "url" }
        ],
        "Day2": [], "Day3": [], "Day4": [], "Day5": [], "Day6": [],
        "Day7": []
      }
    }
    ```
    *Note:* `Day7` (`SUN`) is only rendered if `App.sServer.contains("taaleem.eschool.pk")` (`StudentTimetable.java:104`).
- **`POST documents.php`** (`e3.java`, `f3.java`, `d3.java`)
  - Request: `{ AccountId, Student: int }`
  - Response (`Documents[]` -> `documents-<id>.json`):
    ```json
    {
      "Status": "OK",
      "Documents": [
        { "Id": 1, "Title": "string", "Details": "string", "File": "https://... (PDFs open in PdfViewer; others DownloadManager)" }
      ]
    }
    ```
- **`POST comments.php`** (`s2.java`, `t2.java`, `StudentComments.java`)
  - Request: `{ AccountId, Student: int }`
  - Response (`Comments[]` -> `comments-<id>.json`):
    ```json
    {
      "Status": "OK",
      "Comments": [
        { "Id": 1, "Title": "string", "Date": "string", "Comment": "HTML string", "Nature": -2 | -1 | 0 | 1 | 2 }
      ]
    }
    ```
    `Nature` tints the card background in `StudentComments.java:177-196` (`-2`/`-1` red shades, `1`/`2` green shades, `0` neutral `[UNRESOLVED exact server label enum]`).

---

## 6. Complete API Inventory — eSchool for Teachers (`com.sw3solutions.eschoolforteachers`)

> **Global Automatic Fields on `API.POST`:** `Device="Android"` and `TokenId=App.sTokenId`. **`API.GET` sends no parameters or custom headers.**

### 6.1 Master Endpoint Index (Teachers)

| # | Endpoint / URL Pattern | Method | Base Pool | Calling Class (`Task`) | Request Inputs | Response Root / Cache |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- |
| 1 | `version.php` | **`GET`** | `API_SERVER` | `App` (`j`) | None | `Status`, `Version`, `Code` |
| 2 | `schools.php` | **`GET`** | `API_SERVER` | `Account` (`d`), `ReConnect` (`h2`), `ResetPassword` (`o2`) | None | `Status`, `Schools[]` (no `Android`/`iOS` fields read) |
| 3 | `login.php` | `POST` | `sServer` | `App` (`k`), `ReConnect` (`k2`) | `Username`, `Password`, optional `Gender` | `Status`, profile prefs, flags, `LeaveTypes[]`, `Classes[]` |
| 4 | `logout.php` | `POST` | `sServer` | `Home` (`rq1`) | `AccountId` | `Status` |
| 5 | `generate-pin-code.php` | `POST` | `sServer` | `Account` (`c`) | `Gender`, `CnicNo`, `MobileNo`, `EmployeeId`, `TokenId` | `Status`, `Code` |
| 6 | `verify-pin-code.php` | `POST` | `sServer` | `Account` (`h`) | `PinCode`, `MobileNo`, `CnicNo`, `Gender`, `Code` | `Status`, `Message` |
| 7 | `setup-account.php` | `POST` | `sServer` | `Account` (`g`) | `Gender`, `CnicNo`, `MobileNo`, `Password` | `Status`, `Message` |
| 8 | `generate-account-pin-code.php` | `POST` | `sServer` | `ResetPassword` (`n2`) | `Gender`, `CnicNo`, `MobileNo` | `Status`, `Code` |
| 9 | `verify-account-pin-code.php` | `POST` | `sServer` | `ResetPassword` (`s2`) | `PinCode`, `MobileNo`, `Gender`, `Code` | `Status`, `Message` |
| 10 | `reset-password.php` | `POST` | `sServer` | `ResetPassword` (`r2`) | `Gender`, `MobileNo`, `Password` | `Status`, `Message` |
| 11 | `update-password.php` | `POST` | `sServer` | `HomeSettings` (`z1`) | `AccountId`, `Username`, `OldPassword`, `NewPassword` | `Status`, `Message` |
| 12 | `facebook.php` | `POST` | **`sServer`** | `HomeFacebook` (`y0`) | `AccountId` | `Status`, `Posts[]` (`facebook.json`) |
| 13 | `posts.php` | `POST` | `sServer` | `HomeBlog` (`b0`) | `AccountId`, `LastPost`, `RequestType` | `Status`, `Posts[]` (`blog.json`) |
| 14 | `post-comments.php` | `POST` | `sServer` | `HomeBlog` (`c0`) | `AccountId`, `Post`, `LastComment` | `Status`, `Comments[]` |
| 15 | `save-comments.php` | `POST` | `sServer` | `HomeBlog` (`f0`) | `AccountId`, `Post`, `Comments` | `Status`, `Id`, `Name`, `DateTime`, `Comments`, `Picture`, `Count` |
| 16 | `events.php` | `POST` | `sServer` | `HomeEvents` (`s0`) | `AccountId` | `Status`, `UpcomingEvents[]`, `PastEvents[]` (`events.json`) |
| 17 | `notices.php` | `POST` | `sServer` | `HomeNotices` (`o1`) | `AccountId` (no `PageNo`) | `Status`, `Notices[]` (`notices.json`) |
| 18 | `classes.php` | `POST` | `sServer` | `HomeClasses` (`l0`) | `AccountId` | `Status`, `Classes[]` (`classes.json`) |
| 19 | `students.php` | `POST` | `sServer` | `StudentsList` (`o3`), `StudentsAttendance` (`t2`) | `AccountId`, `School`, `Class` (uses `iSection`), `Subject`, `Date` (`""` or `yyyy-MM-dd`) | `Status`, `Students[]`, optional `AttendanceDays`, `AttendanceTime`, `Marked`, `Message` |
| 20 | `save-attendance.php` | `POST` | `sServer` | `StudentsAttendance` (`u2`) | `AccountId`, `School`, `Class` (`iSection`), `Subject`, `Date`, `Students` (JSON string) | `Status`, `Message` |
| 21 | `homework.php` | `POST` | `sServer` | `StudentsHomework` (`b3`) | `AccountId`, `School`, `Class` (`iSection`), `Subject`, `Date` (`yyyy-MM-dd`) | `Status`, `Holiday`, `Homework[]` |
| 22 | `save-homework.php` | `POST` | `sServer` | `StudentsHomeworkEntry` (`m3`) | `AccountId`, `School`, `Class`, `Section`, `Subject`, `Details`, `Date`, `Attachments` (count), `AttachmentType{i}`/`Name{i}`/`Data{i}`, optional `HomeworkId` | `Status`, `Message` |
| 23 | `delete-homework.php` | `POST` | `sServer` | `StudentsHomework` (`a3`) | `AccountId`, `HomeworkId`, `Index`, `Date` | `Status`, `Index`, `Message` |
| 24 | `attendance.php` | `POST` | `sServer` | `HomeAttendance` (`t`) | `AccountId`, `YearMonth` | `Status`, counts, `Attendance[]` (`attendance-<acc>-<ym>.json`) |
| 25 | `timetable.php` | `POST` | `sServer` | `HomeTimetable` (`a2`) | `AccountId` | `Status`, `Timetable.Day1..Day7[]` (`timetable.json`) |
| 26 | `lesson-plans.php` | `POST` | `sServer` | `HomeLessonPlans` (`h1`) | `AccountId` | `Status`, `LessonPlans[]` (`lesson-plans.json`) |
| 27 | `leaves.php` | `POST` | `sServer` | `HomeLeaves` (`b1`) | `AccountId` | `Status`, `Types[]`, optional `Quota[]`, `Leaves[]` |
| 28 | `save-leave.php` | `POST` | `sServer` | `LeaveApplication` (`d2`) | `AccountId`, `LeaveType`, `FromDate`, `ToDate`, `Details` | `Status`, `Leaves[]`, `Message` |
| 29 | `payroll.php` | `POST` | `sServer` | `HomePayroll` (`u1`) | `AccountId` | `Status`, `Payroll[]` (`payroll.json`) |
| 30 | `download-salary-slip.php?SalaryId=<id>&AccountId=<acc>` | `GET` (PDF) | `sServer` | `HomePayroll` (`v1`, `x1`) | Fallback URL if `SalarySlipUrl` omitted | Binary PDF (`<MonthYear>.pdf`) |
| 31 | `loans.php` | `POST` | `sServer` | `HomeLoans` (`l1`) | `AccountId` | `Status`, `Loans[]` (`loans.json`) |
| 32 | `appraisals.php` | `POST` | `sServer` | `HomeAppraisals` (`p`) | `AccountId` | `Status`, `Appraisals[]` (`appraisals.json`) |

---

### 6.2 Key Teacher Request & Response Schemas

- **`GET version.php`** (`j.java`) & **`GET schools.php`** (`d.java`, `h2.java`, `o2.java`)
  - `schools.php` parses `{ Id, Name, Organization, Logo, Server }` per `Schools[]` element (`d.java:38`).
- **`POST login.php`** (`k.java`, `k2.java`)
  - Request: `{ Username, Password }` (or `{ Gender, Username, Password }` via `ReConnect`).
  - Response:
    ```json
    {
      "Status": "OK",
      "Username": "03...", "Gender": "Male | Female", "AccountId": "string",
      "Blog": "Y | N", "Events": "Y | N", "Facebook": "Y | N", "Edit": "Y | N",
      "Name": "string", "EmployeeId": "string", "Department": "string",
      "Designation": "string", "Picture": "https://...",
      "LeaveTypes": [ { "Id": "1", "Type": "Casual" } ],
      "Classes": [ /* matches classes.php */ ]
    }
    ```
- **`POST classes.php`** (`l0.java`, `m0.java`)
  - Response (`Classes[]` -> `classes.json`):
    ```json
    {
      "Status": "OK",
      "Classes": [
        {
          "Id": 1,
          "SchoolId": 1, "ClassId": 2, "SectionId": 3, "SubjectId": 0,
          "School": "string", "Class": "string", "Section": "string",
          "Subject": "string", "Code": "string", "Attendance": "Y | N",
          "Subjects": [ { "Id": "10", "Name": "English" } ]
        }
      ]
    }
    ```
- **`POST students.php`** (`t2.java` in `StudentsAttendance`, `o3.java` in `StudentsList`)
  - Request: `{ AccountId, School: int, Class: int (passes iSection!), Subject: int, Date: "yyyy-MM-dd" | "" }`
  - Response (`StudentsAttendance`):
    ```json
    {
      "Status": "OK",
      "AttendanceDays": 7,
      "AttendanceTime": 0 | 1 | 2,
      "Marked": "Y | N",
      "Message": "string",
      "Students": [
        {
          "Id": 1,
          "StudentSessionId": 500,
          "Student": "string",
          "RegistrationNo": "string",
          "Picture": "url",
          "Status": "P | A | L | H | ''",
          "Time": "HH:mm:ss (when AttendanceTime == 1)",
          "TimeIn": "HH:mm:ss (when AttendanceTime == 2)",
          "TimeOut": "HH:mm:ss (when AttendanceTime == 2)"
        }
      ]
    }
    ```
- **`POST save-attendance.php`** (`u2.java`)
  - Request: `{ AccountId, School, Class (iSection), Subject, Date: "yyyy-MM-dd", Students: "[...]" }`
  - `Students` serialized JSON array format:
    - Each object: `{ "Id": <StudentSessionId>, "Status": "P|A|L|..." (defaults "P" if empty) }`
    - If `AttendanceTime == 1`: adds `"Time": "<HH:mm:ss>"`
    - If `AttendanceTime == 2`: adds `"TimeIn": "<HH:mm:ss>"`, `"TimeOut": "<HH:mm:ss>"`
- **`POST homework.php`** (`StudentsHomework` -> `b3.java`)
  - Request: `{ AccountId, School, Class (iSection), Subject, Date: "yyyy-MM-dd" }`
  - Response:
    ```json
    {
      "Status": "OK",
      "Holiday": "Y | N",
      "Homework": [
        {
          "Id": 10, "SubjectId": 5, "UserId": "accountId (enables Edit/Delete if == App.sAccountId)",
          "Subject": "string", "Code": "string", "Details": "HTML string", "Status": "A | ...",
          "Attachments": [ { "Id": 1, "Type": "P | V | L | F", "Title": "string", "URL": "https://..." } ]
        }
      ]
    }
    ```
- **`POST save-homework.php`** (`StudentsHomeworkEntry` -> `m3.java`)
  - Request: `{ AccountId, School, Class (iClass), Section (iSection), Subject, Details, Date, Attachments: int (count), HomeworkId?: int (when editing) }`
  - Note parameter naming asymmetry: `homework.php` sends `Class: iSection` without `Section`; `save-homework.php` sends both `Class: iClass` and `Section: iSection`.
  - Dynamic attachment indexing (`i3` loop on `jaAttachments` items with `Id <= 0`, `m3.java:52-89`; note index suffix uses `i4 = i3 + 1`):
    - `AttachmentType{i4}`: `"L"` | `"P"` | `"F"`
    - `AttachmentName{i4}`: attachment `Title` / filename
    - `AttachmentData{i4}`: external URL if `"L"`; Base64 JPEG/image (`NO_WRAP` flag `2`, resized max `1600px` for `png/jpg/jpeg`) if `"P"`; Base64 file bytes (`DEFAULT` flag `0`) if `"F"`.
- **`POST delete-homework.php`** (`a3.java`)
  - Request: `{ AccountId, HomeworkId, Index, Date }` -> Response: `{ "Status": "OK", "Index": int, "Message": "string" }`.
- **`POST attendance.php`** (Teacher Self-Attendance: `t.java`, `v.java`)
  - Request: `{ AccountId, YearMonth: "yyyy-MM" }`
  - Response (`attendance-<accId>-<ym>.json`): `{ "Status": "OK", "MonthYear", "PrevMonth", "NextMonth", "Presents", "Absents", "Leaves", "Holidays", "Attendance": [ { "Day", "Status", "TimeIn", "TimeOut", "Late", "Remarks" } ] }`
- **`POST timetable.php`** (`a2.java`, `b2.java`)
  - Request: `{ AccountId }` -> Response: `{ "Status": "OK", "Timetable": { "Day1".."Day7": [ { "Id": int, "Timing", "Subject", "Class" } ] } }` (`Day7` shown only for `taaleem.eschool.pk`).
- **`POST lesson-plans.php`** (`h1.java`, `j1.java`; UI gated on `anes.eschool.pk`)
  - Request: `{ AccountId }` -> Response: `{ "Status": "OK", "LessonPlans": [ { "Id": int, "Month", "Year", "Date", "FileName", "DownloadUrl" } ] }`
- **`POST leaves.php`** (`b1.java`, `e1.java`, `f1.java`) & **`POST save-leave.php`** (`d2.java`)
  - `leaves.php` Response:
    - `Types[]`: `[{ "Id": "1", "Type": "string" }]` (`leave-types.json`)
    - Optional `Quota[]`: `[{ "Type": "string", "Quota": int, "Availed": int, "Available": int }]` (`leaves-quota.json`)
    - `Leaves[]`: `[{ "Id": int, "Type": "string", "Details": "string", "FromDate": "string", "ToDate": "string", "Paid": "Y | N", "Status": "string", "Attachments": [...] }]` (`leaves.json`)
  - `save-leave.php` Request: `{ AccountId, LeaveType, FromDate, ToDate, Details }` -> Response: `{ "Status": "OK", "Leaves": [...], "Message"?: "string" }`.
- **`POST payroll.php`** (`u1.java`, `v1.java`, `HomePayroll.java`)
  - Response (`Payroll[]`): `{ "Id": int, "School", "Department", "Designation", "MonthYear", "GrossSalary", "BasicSalary", "MedicalAllowance", "IncomeTax", "AdditionalTax", "Eobi", "ProvidentFund", "LoanAdjustments", "LeaveDeductions", "OtherDeductions", "Reimbursement", "PayableSalary", "Bonuses": [{ "Title", "Amount" }], "Allowances": [{ "Title", "Amount" }], "PaymentMode": { "Mode", "ChequeNo", "BankName", "BankAccount" }, "SalarySlipUrl"?: "url" }`
  - If `SalarySlipUrl` is absent, client constructs `<sServer>download-salary-slip.php?SalaryId=<Id>&AccountId=<sAccountId>` (`v1.java:60-63`).
- **`POST loans.php`** (`l1.java`, `m1.java`, `HomeLoans.java`)
  - Response (`Loans[]`): `{ "Id": int, "School", "Department", "Designation", "Date", "Type", "Amount", "Refundable": "Yes | No | ...", "PaymentMode": { "Mode", "ChequeNo" }, "Details": "HTML/string", "NoOfInstallments", "ReturnedAmount", "BalanceAmount", "Installments": [{ "Month", "Amount", "Paid": "Y | N", "PaidDate" }] }`
- **`POST appraisals.php`** (`p.java`, `q.java`, `o.java`; UI gated on `aas.eschool.pk`)
  - Response (`Appraisals[]`): `{ "Id": int, "School", "Department", "Designation", "Session", "Period", "TotalScore", "ObtainedScore", "Comments", "AppraisalUrl": "https://...pdf" }`

---

## 7. Delimiter Formats, Tenant Feature Gates & Client Bugs

### 7.1 Delimiters & Hybrid Encodings Observed
1. **`"<date>=<P|A|L|H>"` Split on `"="`** (`StudentAttendanceSubjectDetails.java:75-91`): Used in Parent Subject-Wise Attendance (`attendance.php` without `YearMonth` on `ahp.eschool.pk`).
2. **Comma-Separated Student IDs (`id1,id2`)**: Parent `LeaveApplication.java:122-126` joins checked child IDs with `","` for `Students` param in `save-leave.php`.
3. **JSON-Array-Inside-JSON-String (`"towns"`)**: `get-student-profile.php` (`q4.java:146,174`) and `get-parents-profile.php` (`b4.java:83,109`) serialize each city's `towns` array as an escaped JSON string inside the `Locations[]` object rather than a native JSON array.
4. **Line Breaks in Homework Edit**: `StudentsHomeworkEntry.java:444` replaces `"<br />"` with `"\n"` when loading existing homework details into an `EditText`.
5. **Contrast with Web Admin (Phase 1A)**: Legacy Web Admin login (`ajax/login.php`, `ajax/verify-2fa.php`) uses `|-|` and `||` text delimiters, whereas Mobile APKs use JSON + `"="` in one array + CSV IDs + HTML fragments inside JSON fields.

### 7.2 Hardcoded Tenant Host Gates (`App.sServer.contains(...)`)

The legacy Android clients hardcode tenant-specific behavior checks against `App.sServer` (these MUST be replaced with database-driven tenant feature flags / subscription capabilities in the Phase 2+ `.NET 10` architecture):

| Substring Check | App(s) | Feature / Behavioral Override | Evidence |
| :--- | :---: | :--- | :--- |
| `unity.eschool.pk` | Parents | Shows PTM Request drawer menu & PTM module | `parents/Home.java:117` |
| `esc.eschool.pk` | Parents | Shows Weekly Plans ("Topics Covered") | `parents/Student.java:137`, `z2.java:27` |
| `noon.eschool.pk` / `babulilm.eschool.pk` | Parents | Shows Daily Report module; `babulilm.eschool.pk` also renames "Homework" → "Classwork" | `parents/Student.java:140-145`, `StudentHomework.java:340`, `StudentHomeworkDetail.java:56` |
| `ahp.eschool.pk` | Parents | Switches Attendance screen to Subject-Wise listing | `parents/Student.java:241`, `a3.java:77` |
| `isc.eschool.pk` | Parents | Uses CNIC instead of Mobile No as saved `Username` after PIN signup/reset | `parents/g.java:60`, `h.java:55`, `a2.java:65`, `b2.java:56` |
| `cis.eschool.pk` | Parents | Shows `DefaultAmount` & `PayableAmount` billing summary banners | `parents/p2.java:43` |
| `oneiro.eschool.pk` | Parents | Shows `AdvanceFee` billing summary banner | `parents/p2.java:57` |
| `eschool.com.pk` | Parents | Enables `Pay Now` online fee payment button on unpaid vouchers | `parents/StudentBilling.java:231` |
| `taaleem.eschool.pk` | Both | Adds 7th timetable tab `SUN` (`Day7`) | `parents/StudentTimetable.java:104`, `teachers/HomeTimetable.java:75` |
| `aas.eschool.pk` | Teachers | Shows Appraisals drawer menu & module | `teachers/Home.java:166` |
| `anes.eschool.pk` | Teachers | Shows Lesson Plans drawer menu & module | `teachers/Home.java:169` |
| `eschoolghana.com` | Teachers | Relaxes Reset Password ID/Phone validation (`National ID >= 9`, `Mobile >= 10` without `"03"` prefix) | `teachers/ResetPassword.java:61-77` |

### 7.3 Verified Bugs in Legacy APKs (Do Not Replicate in eSchool v2)
- **`Common.getModifiedTime` Key Mismatch (`parents/Common.java:256-259`, `teachers/Common.java:359-362`):** `setModifiedTime` stores `"<AccountId>-<Username>-<file>"`, while `getModifiedTime` checks `has("<Username>-<file>")`, causing `getModifiedTime` to always return `0L`.
- **Parents `HomeBlog` Cache Filename Mismatch:** `HomeBlog.java:100` checks `"blog.json"`, while `s.java` and `u.java` read/write `"posts.json"`.
- **`RequestPtm` Pre-Selection Resource Bug (`parents/s1.java:53`):** When opened with `Student > 0`, calls `findViewById(R.id.spnrReligion)` (non-existent in `request_ptm.xml`, throws `NullPointerException` caught silently) instead of `spnrStudent`.
- **PIN Rate-Limit Date Pattern (`"dd-MM-yyyyy"`):** 5 `y`'s in `SimpleDateFormat` (`e.g., 2026` becomes `02026`).

---

## 8. Activities, API Classes & Dependency Map

- **Shared / Core Dependencies (Observed via Manifest & Imports):**
  - Networking: `OkHttp` (`okhttp3.OkHttpClient`, `FormBody`, `HttpUrl`, `ConnectionSpec`)
  - Images: `Glide` (`GlideApp`, `MyAppGlideModule`, `CircularImageTransform`)
  - Firebase: `FirebaseApp`, `FirebaseMessaging`, `FirebaseCrashlytics`, `GooglePlayServices` (`ProviderInstaller`)
  - Media / Viewers / Maps: `com.rajat.pdfviewer` (`PdfRendererView`), `com.google.android.youtube.player` (`YouTubePlayer`), `Google Maps SupportMapFragment`, `androidx.exifinterface.media.ExifInterface`, `com.google.android.play.core.appupdate` (`AppUpdateManager`), `com.tomergoldst.tooltips` (Teachers), `me.leolin.shortcutbadger` (Teachers)
- **Parents UI & API Architecture:**
  - Auth/Lifecycle: `App` (`j`, `k`), `Account` (`c`, `d`, `g`, `h`), `ResetPassword` (`w1`, `x1`, `a2`, `b2`), `ReConnect` (`o1`, `p1`, `r1`), `Offline`
  - Shell & Feeds: `Home` (`ar1`), `HomeDashboard`, `HomeFacebook` (`l0`, `m0`) → `HomeFacebookPost`, `HomeBlog` (`s`, `t`, `u`, `v`, `w`) → `HomeBlogPost`, `HomeEvents` (`f0`, `g0`), `HomeNotices` (`u0`, `w0`, `x0`) → `HomeNoticesDetail`, `HomeChilds` (`y`, `z`), `HomeLeaves` (`o0`, `r0`) + `LeaveApplication` (`j1`, `k1`), `HomePtm` (`c1`, `d1`) → `HomePtmDetail` (`f1`, `g1`) + `RequestPtm` (`s1`, `t1`), `HomeSettings` (`i1`), `HomeAbout`, `HomeContact`
  - Student Portal (`Student` → `StudentDashboard` (`z2`, `a3`)): `StudentProfile` → `StudentProfileEdit` (`q4`, `r4`), `StudentParents` (`StudentParentsFather`, `StudentParentsMother`) → `StudentParentsEdit` (`b4`, `c4`), `StudentWeeklyPlans` (`z4`, `a5`, `b5`) → `StudentWeeklyPlansDetail`, `StudentDailyReport` (`w2`, `x2`), `StudentHomework` (`q3`, `u3`, `v3`) → `StudentHomeworkDetail`, `StudentTimetable` (`t4`) → `StudentTimetableDay` (`v4`), `StudentAttendance` (`e2`, `f2`) / `StudentAttendanceSubjectListing` (`i2`, `j2`) → `StudentAttendanceSubjectDetails`, `StudentBilling` (`n2`, `o2`, `p2`, `q2`) → `PayOnline` → `PayViaAlpha`/`Blinq`/`Card`/`JazzCash`/`KuickPay`, `StudentExams` (`h3`, `i3`, `j3`, `l3`, `m3`), `StudentDocuments` (`d3`, `e3`, `f3`), `StudentComments` (`s2`, `t2`)
  - Shared Utilities/Viewers: `PdfViewer` (`l1`), `PictureViewer`, `VideoPlayer`, `FcmNotificationService`, `FcmNotification`
- **Teachers UI & API Architecture:**
  - Auth/Lifecycle: `App` (`j`, `k`), `Account` (`c`, `d`, `g`, `h`), `ResetPassword` (`n2`, `o2`, `r2`, `s2`), `ReConnect` (`h2`, `k2`)
  - Shell & HR: `Home` (`rq1`), `HomeDashboard`, `HomeFacebook` (`y0`, `z0`), `HomeBlog` (`b0`, `c0`, `d0`, `f0`), `HomeEvents` (`s0`, `t0`), `HomeNotices` (`o1`, `p1`, `q1`), `HomeClasses` (`l0`, `m0`), `HomeTimetable` (`a2`) → `HomeTimetableDay` (`b2`), `HomeLessonPlans` (`h1`, `j1`), `HomeAttendance` (`t`, `u`, `v`), `HomeLeaves` (`b1`, `e1`, `f1`) + `LeaveApplication` (`c2`, `d2`), `HomePayroll` (`u1`, `v1`, `x1`), `HomeLoans` (`l1`, `m1`), `HomeAppraisals` (`o`, `p`, `q`), `HomeSettings` (`z1`), `HomeAbout`, `HomeContact`
  - Class Operations: `StudentsList` (`o3`), `StudentsAttendance` (`t2`, `u2`), `StudentsHomework` (`b3`, `a3`) → `StudentsHomeworkDetail`, `StudentsHomeworkEntry` (`m3`, `n3`)

---

## 9. `[UNRESOLVED]` Register (Requires Live / Phase 1A Verification)

1. **`[UNRESOLVED]` Live Tenant Roster & Responses of `schools.php` / `version.php`:** Exact runtime JSON returned by `https://demo.eschool.com.pk/api/parents/schools.php` and `version.php` cannot be inspected statically without live execution; Parents issues `POST` (`d.java:26`) while Teachers issues `GET` (`d.java:26`). Note: Live `demo.eschool.com.pk` inspection can confirm whether `schools.php` and `version.php` handle both `GET` and `POST`.
2. **`[UNRESOLVED]` Cloudflare Relay Worker Internal Behavior (`RELAY_SERVER`):** `https://eschool-parents-app.mt-shahzad.workers.dev/` server-side forwarding, caching, or rate-limit logic cannot be inspected from the APK (`parents/API.java:108-125`).
3. **`[UNRESOLVED]` SMS vs Push PIN Delivery Mechanics (`generate-pin-code.php` / `generate-account-pin-code.php`):** APKs receive `Code` (`c.java:58`, `w1.java:59`) and clear local FCM notification cache before calling verify (`h.java:29-32`), but exact SMS/FCM dispatch logic and OTP expiry reside server-side.
4. **`[UNRESOLVED]` Payment Gateway Callback / Webhook Flows (`PayVia*`):** `/pay/<md5(VoucherNo)>/`, `payments/blinq/index.php`, and `payments/kuickpay/index.php` render remote HTML in `WebView` (`PayVia*.java:45`), so gateway merchant redirects and fee-voucher reconciliation callbacks exist strictly server-side.
5. **`[UNRESOLVED]` Server-Generated HTML & CSS Content:** Notice bodies (`Notice`), Blog `Summary`/`Details`, Facebook `Details`, Homework `Details`, Loan `Details`, Comment `Comment`, and `https://demo.eschool.com.pk/api/css/default.css` contain server-authored HTML/CSS markup (`HomeNoticesDetail.java:79-87`, `StudentHomeworkDetail.java:89-97`).
6. **`[UNRESOLVED]` Attachment & File Download Server Validation:** Whether `DownloadUrl`, `VoucherUrl`, `SalarySlipUrl`, `AppraisalUrl`, `download-fee.php?FeeId=`, `download-salary-slip.php?SalaryId=&AccountId=`, and PDF viewer URLs (`?Inline=Y`) enforce session/token validation on the server (`Common.java:53`, `v1.java:60`, `PdfViewer.java:185`).
7. **`[UNRESOLVED]` Exhaustive Enumerations:**
   - Exact list of `Leave.Status` values (only string display observed; `Paid` uses `"Y"` in Teachers `HomeLeaves.java:197`).
   - Exact semantic labels for `StudentComments` `Comments.Nature` values beyond UI color tints (`-2`, `-1`, `1`, `2`, `StudentComments.java:177-196`).
   - Complete server meanings of `AttendanceTime` in `students.php` beyond `1` (`Time`) and `2` (`TimeIn`/`TimeOut`) (`t2.java:124-136`, `u2.java:41-47`).
   - Exact difference between Teachers `save-homework.php` when `AttachmentType{i4}` would be `"F"` vs `"P"` Base64 flag handling on PHP backend (`Common.java:309` flag `0` vs `646` flag `2`).
8. **`[UNRESOLVED]` Client vs Server Field Naming Asymmetry:**
   - `save-student-profile.php` (`r4.java:42,55`) submits `Town` and `EmergencyTown` without `City` or `EmergencyCity` even though `get-student-profile.php` returns both (`q4.java:60,76`) — server resolution of city from town ID is inferred.
   - `save-parents-profile.php` (`c4.java:43`) similarly submits `Town` without `City`.
   - Teachers `Account.java` requires `EmployeeId` (`length >= 6`, `Account.java:81`) whereas `ResetPassword.java` omits `EmployeeId` and includes an `eschoolghana.com` validation relaxation branch not present in `Account.java`.

---

## 10. Compatibility & Merge Alignment with Phase 1A (Web Admin Crawl)

To merge Phase 1A (`demo.eschool.com.pk/admin/` Chrome DevTools MCP audit) seamlessly with these Phase 1B findings into `docs/03-API-AND-DATA-CONTRACTS.md` and `docs/04-DATABASE-ERD.md`:
1. **Cross-Map PHP Web Admin Tables ↔ Mobile DTOs:**
   - `Students` (`PersonalInfo`, `EmergencyInfo`, `FatherInfo`, `MotherInfo`), `Vouchers` + `FeeDetails`, `Exams` + `Subjects`, `Classes` + `Subjects` (`SectionId`/`SubjectId`), `Homework` + `Attachments`, `Leaves` + `LeaveTypes` + `Quota`, `Payroll` + `Allowances` + `Bonuses` + `PaymentMode`, `Loans` + `Installments`, `Appraisals`, `LessonPlans`, `WeeklyPlans`, `DailyReport`, `PtmRequests` + `Comments`, `StudentComments`.
2. **Unify Tenant Capability Flags:** Combine `schools.php` flags (`Blog`, `Events`, `Facebook`, `Edit`) + hardcoded APK domain checks (`unity`, `esc`, `noon`, `babulilm`, `ahp`, `isc`, `cis`, `oneiro`, `taaleem`, `aas`, `anes`, `eschoolghana`) with Web Admin school/tenant settings.
3. **Map Legacy PHP APIs to `.NET 10` `/api/v1/...` Modular Monolith:** Replace body `AccountId` auth with JWT Bearer claims, `x-www-form-urlencoded` Base64 uploads with `multipart/form-data`, `"="` attendance arrays with typed DTOs, and MD5 fee-pay URLs with authenticated payment intents.
