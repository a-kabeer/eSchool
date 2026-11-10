# Phase 4: Backend Access Gaps & Unknown Limitations Report

**Project**: eSchool Complete Reverse Engineering & Modernization Blueprint  
**Application**: eSchool (School Management System)  
**Target URL**: `https://demo.eschool.com.pk/`  
**Document Purpose**: Strict technical separation of confirmed observational facts vs. hidden backend implementations requiring client verification.

---

## 1. Context & Verification Boundary

In accordance with strict reverse-engineering principles, this audit was conducted strictly via authenticated, read-only browser exploration and developer tooling. Direct access to server infrastructure (SSH shell, Apache/Nginx configuration files, PHP codebase, or MySQL database schemas) was **not** provided.

This document inventories critical backend mechanisms that cannot be definitively established from client-side behavior alone, highlighting where owner confirmation is mandatory prior to production implementation.

---

## 2. Confirmed Findings vs. Inferred Backend Logic

```
+-----------------------------------+     +-----------------------------------+
|     CONFIRMED CLIENT-SIDE FACTS   |     |    INFERRED / UNVERIFIED BACKEND  |
| - 13 Core Modules & 141 Endpoints |     | - Exact MySQL table definitions   |
| - URL routing patterns (.php)     |     | - Stored procedures & triggers    |
| - Form fields & UI input types    |     | - Cron jobs & automated tasks     |
| - 7 User Types & permission matrix|     | - Third-party SMS API credentials |
| - Session cookies & auth headers  |     | - Banking 1Link/KuickPay API specs|
+-----------------------------------+     +-----------------------------------+
```

---

## 3. Detailed Gaps Analysis Matrix

### 3.1 Database Schema & Integrity Rules
| System Area | What Was Observed in Browser | Missing Backend Knowledge | Business Impact if Unverified |
| :--- | :--- | :--- | :--- |
| **Primary Keys & Types** | Row IDs in URL query params (`TypeId=34`, `UserId=18`, `StudentId=...`) indicate auto-increment integer keys. | Exact column types (`INT`, `BIGINT`, `VARCHAR(x)`), collation (`utf8mb4_general_ci`), indexing strategies, and table naming conventions (singular vs plural). | Low-to-Medium (Can be designed cleanly in modern schema). |
| **Foreign Keys & Cascades** | Deleting a class or student warns about dependent records. | Whether cascading deletes (`ON DELETE CASCADE`) or soft deletes (`deleted_at`, `is_deleted`) are enforced via database foreign keys or manual PHP script logic. | **High**: Risk of data orphan creation or accidental mass deletion during data migration. |
| **Stored Procedures / Triggers**| Complex multi-step actions (e.g., student fee invoice generation, salary computation). | Are calculations performed inside MySQL Stored Procedures, Views, Triggers, or pure procedural PHP application code? | **High**: Reimplementation could miss obscure database triggers calculating tax or discounts. |

### 3.2 Financial & Payroll Business Formulas
| System Area | What Was Observed in Browser | Missing Backend Knowledge | Business Impact if Unverified |
| :--- | :--- | :--- | :--- |
| **Fee Defaulter & Fine Calculation** | Late fee fines of `PKR 200` and defaulting amounts appear on the dashboard after due dates. | The exact mathematical formula, grace periods, public holiday exemptions, and auto-compounding rules for overdue fees. | **Critical**: Incorrect fee penalties cause parent disputes and accounting discrepancies. |
| **Payroll Tax & Statutory Slabs** | Slabs exist for EOBI, Social Security, and Income Tax withholding. | Year-to-date cumulative tax adjustments, exemptions, tax year transitions (July 1 to June 30), and company vs. employee contribution percentages. | **Critical**: Non-compliance with Pakistan Federal Board of Revenue (FBR) regulations. |
| **Double-Entry Sync** | Vouchers link to General Ledger accounts. | Detailed mapping matrix between automated billing collections, payroll checks, and default Chart of Accounts codes (`accounts/settings.php`). | **Critical**: Financial imbalance between sub-ledgers and the general balance sheet. |

### 3.3 Background Daemons & Scheduled Cron Jobs
| Workflow | Client-Side Visible Behavior | Missing Backend Architecture |
| :--- | :--- | :--- |
| **Daily Attendance Absence SMS** | Parents receive automated SMS when a student is marked absent. | Is SMS dispatched immediately on form submission, or queued in a database table and processed asynchronously via a scheduled Linux cron job? |
| **Recurring Monthly Invoicing** | Vouchers are generated monthly for active sessions. | Is voucher generation executed manually by an accountant via batch action, or automatically generated on the 1st of each month via background cron? |
| **Data Locks** | `management/locks.php` freezes past records. | Mechanism enforcing the lock (database user permissions, table read-only flags, or PHP conditional checks). |

### 3.4 Third-Party Integrations & Gateways
| Integration | Evidence in Application | Missing Integration Details |
| :--- | :--- | :--- |
| **SMS Gateway Provider** | `management/sms-services.php` allows configuring SMS gateways. | Specific telco API protocol (HTTP REST, SOAP, SMPP), vendor provider (e.g., Jazz, Telenor, Zong, BrandSMS), and webhook callback handling. |
| **Bank API & Reconciliation** | `billing/api-logs.php` and `billing/bank-reconciliation.php`. | 1Link, KuickPay, or direct banking partner API specs, encryption standards (AES/HMAC), IP whitelisting rules, and webhook payload schemas. |
| **Biometric Attendance Machines** | `hr/attendance.php` mentions clock-in data. | Device hardware models (ZKTeco, Realand, etc.), connection type (Push SDK, Direct TCP/IP socket polling, or manual CSV import). |

---

## 4. Rebuild Risk Assessment

| Risk Domain | Risk Level | Description & Consequence | Recommended Mitigation |
| :--- | :---: | :--- | :--- |
| **Data Migration Risk** | **HIGH** | Attempting to export and import legacy data without an SQL dump or schema dictionary could corrupt complex historical relational dependencies (e.g., student-to-voucher-to-payment mappings). | Request a sanitized MySQL `.sql` schema dump from the client before beginning data migration. |
| **Calculation Drift** | **HIGH** | Discrepancies between legacy PHP math and modern rebuild math for payroll tax or fee installments. | Run dual-entry shadow accounting tests comparing legacy outputs with new system outputs over one billing cycle. |
| **Integration Failure** | **MEDIUM** | Breaking bank webhook callbacks or SMS deliveries during transition. | Obtain official API documentation and sandbox credentials from bank and SMS partners. |

---

## 5. Owner-Provided Access Request Checklist

To bridge these gaps prior to implementation planning, the system owner should be requested to provide:

1. [ ] **MySQL Database DDL Dump**: Full schema definition (`mysqldump --no-data`) including table structures, foreign keys, triggers, and views.
2. [ ] **Cron Tab Schedule**: Copy of server crontab (`crontab -l`) detailing scheduled automated scripts.
3. [ ] **SMS Gateway Documentation**: Active gateway provider endpoint documentation, API keys, and balance query protocol.
4. [ ] **Bank Integration Specifications**: 1Link / KuickPay / partner bank integration agreements, IP whitelists, and sample payment payloads.
5. [ ] **Biometric Device Model & Protocol**: Details on hardware deployed at campus gates.
6. [ ] **Sample Anonymized Data Extract**: A 1-month sanitized dataset to validate financial balance sheets and report card generation.
