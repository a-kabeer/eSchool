# eSchool Reverse Engineering Documentation Hub

This directory contains the complete technical audit, reverse engineering findings, and modernization architecture specifications for the eSchool web application (`https://demo.eschool.com.pk/`).

---

## Deliverables Directory

1. [**`00-access-and-environment-report.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/00-access-and-environment-report.md) — Environment profiling, network security headers, session configuration, and access boundaries.
2. [**`01-complete-module-inventory.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/01-complete-module-inventory.md) — Comprehensive catalog of all 13 core modules and 141 individual submodules and routes.
3. [**`02-module-functional-specifications.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/02-module-functional-specifications.md) — Deep functional workflows: SIS 10-accordion form, 3-period fee heads, barcode cashier payment, attendance SMS, grading formulas, and double-entry voucher rules.
4. [**`03-roles-and-permissions-matrix.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/03-roles-and-permissions-matrix.md) — Granular analysis of all 7 User Types, multi-campus scoping, CRUD checkboxes, and sub-profile permissions.
5. [**`04-api-endpoint-inventory.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/04-api-endpoint-inventory.md) — Complete inventory of 38+ procedural PHP endpoints, GET/POST parameter schemas, and RESTful resource mappings.
6. [**`05-technology-stack-analysis.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/05-technology-stack-analysis.md) — Technical fingerprinting of PHP backend, jQuery 2.2.4, jQuery UI 1.11.4 Redmond theme, DataTables 1.10, Colorbox iframes, and Google Charts v51.
7. [**`06-backend-access-gaps.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/06-backend-access-gaps.md) — Confirmed vs. inferred logic, MySQL trigger gaps, Pakistani statutory payroll/tax formula unknowns, crons, and client access checklist.
8. [**`07-logical-database-design.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/07-logical-database-design.md) — 3NF normalized data dictionary covering 25 entities across 7 domain groups with types, constraints, and relationships.
9. [**`07-database-erd.mmd`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/07-database-erd.mmd) — Mermaid Entity-Relationship Diagram modeling multi-campus multi-tenancy, academic sessions, fee structures, vouchers, and payroll.
10. [**`08-modernization-recommendations.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/08-modernization-recommendations.md) — UI/UX audit of legacy Redmond theme, iframe traps, and non-responsive tables; categorized into Preserved Core Functionality (Cat A), UX Overhauls (Cat B), and New Enterprise SaaS Features (Cat C).
11. [**`09-functional-testing-matrix.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/09-functional-testing-matrix.md) — Comprehensive verification matrix of 70 test scenarios across 11 functional categories with a 98.6% pass rate.
12. [**`10-rebuild-technical-blueprint.md`**](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/10-rebuild-technical-blueprint.md) — Complete enterprise rebuild blueprint: **ASP.NET Core (.NET 8/9 LTS)** + **React + TypeScript** + **PostgreSQL 16** with **EF Core + Npgsql**, **Modular Monolith** architecture (no microservices), **.NET Hosted Services (`BackgroundService`)**, **ASP.NET Core SignalR**, and **Docker** containerization.

---

## Visual Assets

Audit screenshots are stored in [`screenshots/`](file:///d:/My%20Folder/My%20Work/eSchool/docs/reverse-engineering/screenshots/):
* `00-login-page.png`
* `01-dashboard.png`
* `01-dashboard-metrics.png`
* `02-student-admission-form.png`
* `03-role-permissions-matrix.png`
* `03-user-management-profile.png`
* `04-fee-collection.png`
