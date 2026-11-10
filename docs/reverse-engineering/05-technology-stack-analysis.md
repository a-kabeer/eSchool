# Phase 4: Technology Stack & Architecture Analysis

**Project**: eSchool Complete Reverse Engineering & Modernization Blueprint  
**Application**: eSchool (School Management System)  
**Target URL**: `https://demo.eschool.com.pk/`  
**Audit Type**: Client-Side DOM & Observable Network Fingerprinting  

---

## 1. Architectural Pattern Overview

eSchool is built upon a **Classical Multi-Page Application (MPA)** architectural model developed originally in the mid-to-late 2000s and iteratively patched over time. Every major system operation navigates to dedicated PHP endpoints (`.php`), returning monolithic server-rendered HTML pages augmented by jQuery, jQuery UI plugins, and iframe-based modal overlays.

```
+-------------------------------------------------------------------------+
|                          Client Browser Layer                           |
|  - HTML5 / CSS2.1 / CSS3                                                |
|  - jQuery v2.2.4 + jQuery UI 1.11.4 (Redmond Theme)                     |
|  - DataTables v1.10.x (Client-side DOM sorting & pagination)            |
|  - Colorbox jQuery plugin (Iframe modal popups)                         |
|  - Google Charts SVG Loader (Dashboard metrics)                         |
|  - EasyPieChart (Attendance circular gauges)                            |
+-------------------------------------------------------------------------+
                                    |
                            HTTP/1.1 / TLS 1.3
                    (Synchronous POSTs & Polled AJAX)
                                    v
+-------------------------------------------------------------------------+
|                        Web Server & Gateway                             |
|  - Apache 2.4+ / Nginx reverse proxy                                    |
|  - Standard security headers: X-Frame-Options, XSS, HSTS, CSP           |
+-------------------------------------------------------------------------+
                                    |
                               FastCGI / mod_php
                                    v
+-------------------------------------------------------------------------+
|                     Server-Side Application Runtime                     |
|  - PHP 7.x / 8.x Procedural / Modular MVC Scripting                     |
|  - Session-based state management (`PHPSESSID`)                         |
|  - Server-side script execution per page (e.g. `students.php`)          |
|  - File-based media & document uploads                                  |
+-------------------------------------------------------------------------+
                                    |
                             SQL Driver (PDO / MySQLi)
                                    v
+-------------------------------------------------------------------------+
|                          Relational Database                            |
|  - MySQL / MariaDB Relational Database Management System                |
|  - Normalized multi-table schema with foreign key constraints           |
+-------------------------------------------------------------------------+
```

---

## 2. Technology Fingerprint & Evidence Inventory

### 2.1 Backend Runtime & Server Environment
| Component | Identified Technology | Evidence & Observational Source | Confidence |
| :--- | :--- | :--- | :---: |
| **Server Language** | PHP | `.php` file extensions in all URLs, `set-cookie: PHPSESSID`, header `Expires: Thu, 19 Nov 1981 08:52:00 GMT` | **Confirmed** |
| **Web Server** | Apache / Nginx | Standard `Keep-Alive: timeout=5, max=100`, HTTP/1.1 and HTTP/3 support (`alt-svc: h3=":443"`) | **Confirmed** |
| **Database** | MySQL / MariaDB | Standard standard relational naming conventions, classic PHP/MySQL LAMP stack architecture | **High (Inferred)** |
| **Operating System** | Linux (Ubuntu / RHEL / CentOS) | Typical LAMP deployment structure, path casing in web assets | **High (Inferred)** |

### 2.2 Frontend Frameworks & UI Libraries
| Library / Framework | Exact Version | Primary Role in eSchool | Evidence |
| :--- | :---: | :--- | :--- |
| **jQuery** | `2.2.4` | Core DOM manipulation, event handling, AJAX orchestration | `<script src="js/jquery.js">` |
| **jQuery UI** | `1.11.4` | Redmond visual theme, accordions, tabs, datepickers, drag-and-drop | `<link href="css/themes/redmond/jquery.ui.css">` |
| **DataTables** | `1.10.x` | Grid table rendering, client-side pagination, text filtering, sorting | `<script src="js/jquery.datatables.js">` |
| **Colorbox** | `1.6.x` | Lightbox modal dialogs used for Add/Edit forms and detail views | `<script src="js/jquery.colorbox.js">` |
| **Google Charts** | `Loader v51` | Interactive SVG bar charts and revenue/attendance timeline graphs | `<script src="https://www.gstatic.com/charts/51/loader.js">` |
| **EasyPieChart** | `2.1.x` | Circular radial percentage meters for attendance and metrics | `<script src="js/jquery.easypiechart.js">` |
| **jQuery Timepicker**| `1.3.x` | Time slot input for period and attendance management | `<script src="js/jquery.timepicker.js">` |
| **jQuery TipTip** | `1.3.x` | Hover tooltips for action icons and data labels | `<script src="js/jquery.tiptip.js">` |
| **jQuery TableDnD** | `0.8.x` | Table row drag-and-drop reordering (e.g., class subject ordering) | `<script src="js/jquery.tablednd.js">` |
| **jQuery MaskedInput**| `1.4.x` | CNIC format masking (`99999-9999999-9`) and telephone masking | `<script src="js/jquery.maskedinput.js">` |
| **jQuery TokenInput** | `1.6.x` | Autocomplete tagging for SMS recipients and search queries | `<script src="js/jquery.tokeninput.js">` |
| **jQuery Ajaxq** | `0.0.1` | Sequential AJAX request queueing to prevent race conditions | `<script src="js/jquery.ajaxq.js">` |

### 2.3 Typography & Design Assets
- **Primary Font Family**: Google Font `Open Sans` (`weights: 300, 600, 700`) loaded via `https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700`.
- **System Icons**: Static PNG and animated GIF assets (`view.gif`, `edit.gif`, `delete.gif`, `home.png`, `management.png`, `settings.png`). No modern SVG icon sprites (e.g., Lucide, Feather, FontAwesome) are utilized.

---

## 3. Communication & Data Exchange Protocols

1. **Synchronous Page Requests**: The majority of page transitions, view switches, and module navigations invoke complete browser HTTP GET requests to dedicated `.php` scripts.
2. **Asynchronous (AJAX) Lookups**:
   - Dynamic dependent dropdown population (e.g., selecting a *School* triggers an AJAX GET/POST to fetch its child *Classes*; selecting a *Class* fetches child *Sections*).
   - Sequential request dispatch managed through `jquery.ajaxq.js`.
3. **Iframe-Based Form Modals**:
   - Rather than rendering client-side React/Vue modal components or JSON-driven dialogs, eSchool uses jQuery Colorbox to spawn an `<iframe>` embedding dedicated standalone PHP forms (e.g., `view-user-type.php?TypeId=34`, `view-user.php?UserId=18`).
   - Upon successful form submission inside the iframe, parent window refresh is triggered via `parent.location.reload()` or DOM table row updates.

---

## 4. Architectural Deficiencies & Modernization Drivers

1. **Monolithic Multi-Page Architecture**: Heavy full-page reloads degrade user experience on slower connections.
2. **Iframe Form Isolation**: Using iframes inside Colorbox modal dialogs creates cross-frame messaging fragility, makes automated testing cumbersome, breaks browser history navigation, and prevents responsive mobile scaling.
3. **Client-Side Heavy DataTables**: Many tables load all records directly into the HTML DOM and apply client-side filtering via DataTables. For schools with thousands of students and historical vouchers, this causes noticeable browser freeze and excessive memory consumption.
4. **Scattered Business Logic**: Validation rules are duplicated between client-side jQuery scripts (`validator.js`) and procedural server-side PHP scripts, leading to synchronization drift.
5. **Lack of RESTful / GraphQL API Contracts**: Data exchange is tightly coupled to PHP session cookies and server-rendered HTML rather than stateless, token-authenticated JSON APIs. Rebuilding with modern web and mobile apps will require establishing a clean, decoupled API architecture.
