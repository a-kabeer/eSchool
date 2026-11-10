# Phase 0: Access and Environment Report

**Project**: eSchool Complete Reverse Engineering & Modernization Blueprint  
**Target Application**: eSchool (School Management System)  
**Target URL**: `https://demo.eschool.com.pk/`  
**Audit Date**: November 10, 2026  
**Auditor**: Antigravity Autonomous Engineering Agent  
**Scope**: Non-destructive, read-only operational audit & reverse engineering  

---

## 1. Executive Summary

This report documents the environment preparation, access validation, session establishment, and initial operational boundaries of the eSchool web application located at `https://demo.eschool.com.pk/`. The system was audited using authorized demo administrator credentials in a non-intrusive, read-only manner.

All primary administrative endpoints were successfully verified, operational metrics and widgets were captured, and the top-level navigation layout was cataloged.

---

## 2. Environment & Network Profile

| Attribute | Observed Setting / Value | Verification Source |
| :--- | :--- | :--- |
| **Public URL** | `https://demo.eschool.com.pk/` | HTTP 302 Redirect |
| **Administrative Entrypoint** | `https://demo.eschool.com.pk/admin/` (`index.php`) | Browser Location & HTTP Headers |
| **Authenticated Dashboard** | `https://demo.eschool.com.pk/admin/dashboard.php` | Post-login redirect |
| **Web Server / Gateway** | Apache HTTP Server / Nginx Reverse Proxy | HTTP Headers (`Keep-Alive`, `Connection`) |
| **Transport Security** | TLS 1.3 / TLS 1.2 with HSTS (`max-age=31536000; includeSubDomains; preload`) | Response Headers |
| **HTTP Protocols** | HTTP/1.1, HTTP/2, HTTP/3 (`h3=":443"; ma=2592000`) | Network negotiation |
| **Server-Side Runtime** | PHP (Classic procedural/MVC hybrid) | Set-Cookie: `PHPSESSID`, header `Expires: Thu, 19 Nov 1981` |
| **Content Security Policy** | Configured (`script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com *.google.com; ...`) | Response Header |
| **Frame Protection** | `X-Frame-Options: SAMEORIGIN` | Response Header |
| **XSS Protection** | `X-XSS-Protection: 1; mode=block` | Response Header |
| **MIME Sniffing Protection** | `X-Content-Type-Options: nosniff` | Response Header |

---

## 3. Authentication & Session Validation

### 3.1 Authentication Workflow
1. User accesses the root URL `https://demo.eschool.com.pk/`.
2. The server issues a `302 Found` redirection pointing to `https://demo.eschool.com.pk/admin/`.
3. An unauthenticated session presents a clean, centered login dialog with:
   - Email / Username field (`name="email"`)
   - Password field (`name="password"`)
   - Submit Action button (`Log In`)
   - Vendor branding: *School Management System* / *eSchool.pk by SW3 Solutions*
4. Submission executes an HTTP POST to `admin/index.php`.
5. Upon successful credential verification, the server sets authenticated session cookies and issues a `302 Found` or client-side redirect to `admin/dashboard.php`.

### 3.2 Session Management Details
- **Session Identifier**: Standard PHP session cookie (`PHPSESSID`) marked with `HttpOnly` and `Secure`.
- **Secondary State Tracking**: Client and server track active navigation state using helper cookies:
  - `AdminLastSection`: Stores the last visited module section path (e.g., `students/`).
  - `MainDashboard`: Toggle state flag (`0` for Grid Menu view, `1` for Metrics Dashboard view).
- **Session Expiry**: Inactive sessions terminate according to server PHP session timeout rules or upon explicit user sign-out via `admin/logout.php`.
- **Credential Safety Adherence**: In compliance with security directives, no cleartext credentials, tokens, or session IDs are recorded in this documentation or committed to repository files.

---

## 4. User Profile & Global Header Interface

### 4.1 Authenticated Identity
- **Display Name**: `Administrator`
- **Role Tier**: Super Administrator / Primary School Administrator
- **Avatar Location**: `admin/images/admins/thumbs/default.jpg`
- **Account Actions**:
  - `My Account`: `admin/my-account.php` (profile settings, password management, personal preferences)
  - `Logout`: `admin/logout.php` (terminates PHP session and resets auth cookies)

### 4.2 Top Bar Controls & Quick Actions
- **Home Icon**: Navigates to `admin/dashboard.php`.
- **Management Shortcut**: Direct link to System Management (`admin/management/`).
- **Settings Shortcut**: Direct link to System Settings (`admin/settings/`).
- **Full Screen Toggle**: Client-side JavaScript DOM toggle (`enter-full-screen.png` / `exit-full-screen.png`).
- **Active Academic Session**: Single-branch multi-session scope displaying `Current Session: 2026-2027`.
- **Global Alert Banner (`#PageMsg`)**: Dedicated alert container at top of viewports, currently silent (`display: none`), used for flash messages (success, warning, error) following CRUD transactions.

### 4.3 Dashboard View Modes
The dashboard offers a dual-mode presentation controlled by a sliding switch (`input.switch-input`):
1. **GRID MENU Mode**: An icon-driven operational matrix grouping all 13 modules into fieldsets with direct deep links to every management page.
2. **DASHBOARD Mode**: An executive analytics dashboard containing interactive Google Charts (revenue vs. expenses, billing status, monthly attendance, student headcount distribution, payroll summary, and recent admissions/inquiries).

---

## 5. Visual Evidence

The initial authentication and dashboard environments were verified and captured:

- **Login Screen**: [00-login-page.png](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/screenshots/00-login-page.png)  
  *Clean authentication card with username, password, vendor badge, and responsive wrapper.*
- **Main Dashboard (Grid Mode)**: [01-dashboard.png](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/screenshots/01-dashboard.png)  
  *Full administrative module matrix showing all 13 core subsystems and 141 functional deep links.*
- **Executive Analytics (Dashboard Mode)**: [01-dashboard-metrics.png](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/screenshots/01-dashboard-metrics.png)  
  *Live operational widgets, student distribution charts, attendance radial gauges, and financial summaries.*

---

## 6. Access Restrictions & Boundary Observations

1. **Multi-Tenancy / Branch Switching**: The administrative user has global visibility across `3` configured school campuses (`No. of Schools: 3`). Campus filtering is applied per-module using standard dropdown filters rather than a top-level branch tenancy switch.
2. **2-Factor Authentication (2FA)**: No mandatory OTP / SMS / Authenticator 2FA challenge was enforced during login for this demo environment. The system authenticated immediately via username and password.
3. **Data Modification Rule**: In accordance with project instructions, all audit actions are strictly read-only. No live student, financial, or academic records were altered, deleted, or inserted.
4. **Backend Accessibility**: Direct filesystem, SSH, and MySQL database connection access were not supplied. Logical schemas, entity relationships, and operational workflows are reverse-engineered purely via DOM analysis, client scripts, network traffic inspection, and observable server responses.
