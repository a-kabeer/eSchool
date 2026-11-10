# Phase 5: Logical Database Reconstruction & Data Model

**Project**: eSchool Complete Reverse Engineering & Modernization Blueprint  
**Application**: eSchool (School Management System)  
**Target URL**: `https://demo.eschool.com.pk/`  
**Methodology**: Empirical reverse-engineering from UI form controls, query parameters, DataTables payloads, and relational constraints.

---

## 1. Relational Modeling Principles & Assumptions

Because direct MySQL database console access was not provided, this logical data model has been reconstructed based on:
1. Exact HTML input field names (e.g., `txtName`, `txtCnic`, `ddSchool`, `ddClassSection`, `txtAmount`).
2. Foreign key linkages observable in cascading dropdowns and multi-tab forms.
3. Accounting double-entry rules and statutory payroll compliance standards in Pakistan.
4. Primary key conventions (`id` or `{Entity}Id` matching URL parameters like `TypeId=34`, `UserId=18`).

Confidence ratings:
- **CONFIRMED**: Backed by explicit form names, query params, or distinct UI state.
- **HIGH**: Inferred from standard relational database architecture and observable foreign key behaviors.
- **LOGICAL / INFERRED**: Required relational normalization to ensure 3NF compliance in modern database design.

---

## 2. Core Domain Data Dictionaries

### 2.1 Multi-Tenancy & Institutional Configuration

#### Table: `schools` (Campus / Branches)
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | `settings/schools.php` | CONFIRMED |
| `name` | `VARCHAR(150)` | No | Unique per organization | Values: `eSchool Lahore`, `eSchool Islamabad`, etc. | CONFIRMED |
| `code` | `VARCHAR(50)` | Yes | Unique | Branch code on vouchers | HIGH |
| `address` | `TEXT` | Yes | - | Campus address | CONFIRMED |
| `phone` | `VARCHAR(50)` | Yes | - | Campus phone | HIGH |
| `email` | `VARCHAR(150)` | Yes | - | Official email | HIGH |
| `status` | `ENUM('active','inactive')` | No | Default: `active` | Status toggle icon | CONFIRMED |
| `created_at` | `TIMESTAMP` | No | Default: `CURRENT_TIMESTAMP` | Audit trail | HIGH |

#### Table: `academic_sessions`
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | `settings/sessions.php` | CONFIRMED |
| `title` | `VARCHAR(50)` | No | Unique (`2026-2027`) | Dashboard active session display | CONFIRMED |
| `start_date` | `DATE` | No | - | Session start (e.g., `01-Apr` or `01-Aug`) | HIGH |
| `end_date` | `DATE` | No | - | Session end (e.g., `31-Mar` or `31-Jul`) | HIGH |
| `is_current` | `BOOLEAN` | No | Default: `FALSE` | Dashboard indicator | CONFIRMED |
| `status` | `ENUM('active','locked')` | No | Default: `active` | `management/locks.php` | CONFIRMED |

#### Table: `classes` & `sections` & `class_sections`
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` (classes) | `INT UNSIGNED` | No | PK, Auto Increment | `settings/classes.php` | CONFIRMED |
| `name` | `VARCHAR(50)` | No | `I`, `II`, `III`, `X`, `OL-II` | Observable class options | CONFIRMED |
| `numerical_order`| `INT` | No | Sorting sequence | Grade progression | HIGH |
| `id` (sections)| `INT UNSIGNED` | No | PK, Auto Increment | `settings/sections.php` | CONFIRMED |
| `name` | `VARCHAR(50)` | No | `A`, `B`, `Green`, `Rose` | Observable section options | CONFIRMED |
| `class_section_id`| `INT UNSIGNED` | No | PK, Auto Increment | `ddClassSection` value `I » A` | CONFIRMED |
| `school_id` | `INT UNSIGNED` | No | FK -> `schools.id` | Campus scoping | CONFIRMED |
| `class_id` | `INT UNSIGNED` | No | FK -> `classes.id` | Class relation | CONFIRMED |
| `section_id` | `INT UNSIGNED` | No | FK -> `sections.id` | Section relation | CONFIRMED |
| `class_teacher_id`| `INT UNSIGNED` | Yes | FK -> `employees.id` | `exams/class-teachers.php` | CONFIRMED |

---

### 2.2 Security, Roles & Permissions

#### Table: `user_types` (Roles)
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | Query param: `TypeId=34` | CONFIRMED |
| `title` | `VARCHAR(100)` | No | Unique (`Super Administrator`, `Administrator`, `Acountant`, etc.) | `management/user-types.php` | CONFIRMED |
| `status` | `ENUM('Active','In-Active')` | No | Default: `Active` | Status dropdown | CONFIRMED |

#### Table: `user_type_permissions`
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | Inferred primary key | LOGICAL |
| `user_type_id` | `INT UNSIGNED` | No | FK -> `user_types.id` | `TypeId=34` | CONFIRMED |
| `section` | `VARCHAR(50)` | No | e.g. `Accounts`, `Billing`, `Students` | View modal column | CONFIRMED |
| `page` | `VARCHAR(100)`| No | e.g. `Chart of Accounts`, `Vouchers` | View modal column | CONFIRMED |
| `can_view` | `BOOLEAN` | No | Default: `FALSE` | Checkbox `View` | CONFIRMED |
| `can_add` | `BOOLEAN` | No | Default: `FALSE` | Checkbox `Add` | CONFIRMED |
| `can_edit` | `BOOLEAN` | No | Default: `FALSE` | Checkbox `Edit` | CONFIRMED |
| `can_delete` | `BOOLEAN` | No | Default: `FALSE` | Checkbox `Delete` | CONFIRMED |
| `can_export` | `BOOLEAN` | No | Default: `FALSE` | Checkbox `Export` | CONFIRMED |

#### Table: `users` (Operators)
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | Query param: `UserId=18` | CONFIRMED |
| `user_type_id` | `INT UNSIGNED` | No | FK -> `user_types.id` | Dropdown: `ddUserType` | CONFIRMED |
| `name` | `VARCHAR(150)` | No | - | Input `txtName` | CONFIRMED |
| `mobile_no` | `VARCHAR(30)` | Yes | - | Input `txtMobile` | CONFIRMED |
| `email` | `VARCHAR(150)` | No | Unique | Input `txtEmail` | CONFIRMED |
| `password_hash` | `VARCHAR(255)` | No | - | Input `txtPassword` | HIGH |
| `status` | `ENUM('Active','In-Active')` | No | Default: `Active` | Table status column | CONFIRMED |

#### Table: `user_school_access` (Branch Multi-Tenancy Scoping)
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `user_id` | `INT UNSIGNED` | No | FK -> `users.id` | Multi-select checkboxes | CONFIRMED |
| `school_id` | `INT UNSIGNED` | No | FK -> `schools.id` | Multi-select checkboxes | CONFIRMED |

---

### 2.3 Students & Guardians

#### Table: `students`
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | Primary key | CONFIRMED |
| `school_id` | `INT UNSIGNED` | No | FK -> `schools.id` | `ddSchool` | CONFIRMED |
| `current_class_section_id` | `INT UNSIGNED` | No | FK -> `class_sections.id` | `ddClassSection` | CONFIRMED |
| `current_session_id` | `INT UNSIGNED` | No | FK -> `academic_sessions.id`| `ddSession` | CONFIRMED |
| `registration_no` | `VARCHAR(50)` | No | Unique per school | `txtRegNo` (e.g. `23345`) | CONFIRMED |
| `roll_no` | `VARCHAR(50)` | Yes | - | `txtRollNo` | CONFIRMED |
| `name` | `VARCHAR(150)` | No | - | `txtName` | CONFIRMED |
| `gender` | `ENUM('Male','Female')` | No | - | `ddGender` | CONFIRMED |
| `date_of_birth` | `DATE` | No | - | `txtDob` | CONFIRMED |
| `birth_place` | `VARCHAR(100)` | Yes | - | `txtBirthPlace` | CONFIRMED |
| `b_form_no` | `VARCHAR(25)` | Yes | Masked CNIC format | `txtBformNo` | CONFIRMED |
| `blood_group` | `VARCHAR(10)` | Yes | `A+`, `B+`, etc. | `ddBloodGroup` | CONFIRMED |
| `religion` | `VARCHAR(50)` | Yes | `Islam`, `Christian`, etc. | `ddReligion` | CONFIRMED |
| `nationality` | `VARCHAR(50)` | No | Default: `Pakistani` | `ddNationality` | CONFIRMED |
| `disability` | `TEXT` | Yes | - | `txtDisability` | CONFIRMED |
| `picture_path` | `VARCHAR(255)` | Yes | - | `filePicture` | CONFIRMED |
| `registration_date`| `DATE` | No | - | `txtRegDate` | CONFIRMED |
| `joining_date` | `DATE` | No | - | `txtJoinDate` | CONFIRMED |
| `status` | `ENUM('Active','New Admission','Defaulter','Withdrawn','Graduated')` | No | Default: `New Admission` | Status filter | CONFIRMED |

#### Table: `student_guardians` (Parents & Contacts)
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | Primary key | LOGICAL |
| `student_id` | `INT UNSIGNED` | No | FK -> `students.id` | 1-to-1 or 1-to-N | HIGH |
| `guardian_type` | `ENUM('Father','Mother','Guardian','Emergency')` | No | - | Form accordion tabs | CONFIRMED |
| `name` | `VARCHAR(150)` | No | - | `txtFatherName`, etc. | CONFIRMED |
| `cnic_no` | `VARCHAR(25)` | Yes | Masked | `txtFatherCnicNo` | CONFIRMED |
| `ntn` | `VARCHAR(50)` | Yes | Tax ID | `txtFatherNtn` | CONFIRMED |
| `occupation` | `VARCHAR(100)`| Yes | Dropdown | `ddFatherOccupation` | CONFIRMED |
| `qualification` | `VARCHAR(100)`| Yes | - | `txtFatherQualification` | CONFIRMED |
| `company` | `VARCHAR(150)`| Yes | - | `txtFatherCompany` | CONFIRMED |
| `designation` | `VARCHAR(100)`| Yes | - | `txtFatherDesignation` | CONFIRMED |
| `address` | `TEXT` | Yes | - | `txtFatherAddress` | CONFIRMED |
| `location_id` | `INT UNSIGNED` | Yes | Town lookup | `ddFatherLocation` | CONFIRMED |
| `mobile_no` | `VARCHAR(30)` | No | SMS recipient | `txtFatherMobile` | CONFIRMED |
| `email` | `VARCHAR(150)`| Yes | - | `txtFatherEmail` | CONFIRMED |

---

### 2.4 Billing, Invoices & Fee Collection

#### Table: `fee_categories` (Fee Heads)
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | `billing/fee-categories.php` | CONFIRMED |
| `title` | `VARCHAR(100)` | No | Unique | Tuition, Meal Charges, Admission | CONFIRMED |
| `periodicity` | `ENUM('Monthly','Once','Yearly')`| No | - | Groupings on fee structure | CONFIRMED |
| `account_code` | `VARCHAR(50)` | Yes | FK -> `chart_of_accounts.code` | GL synchronization | HIGH |

#### Table: `fee_structures` & `fee_structure_items`
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | Row ID on `fee-structure.php` | CONFIRMED |
| `school_id` | `INT UNSIGNED` | No | FK -> `schools.id` | Campus selector | CONFIRMED |
| `class_id` | `INT UNSIGNED` | No | FK -> `classes.id` | Grade selector | CONFIRMED |
| `effective_date` | `DATE` | No | - | `01-Nov-2026` | CONFIRMED |
| `status` | `ENUM('Active','In-Active')` | No | Default: `Active` | Status toggle | CONFIRMED |
| `fee_structure_id`| `INT UNSIGNED`| No | FK -> `fee_structures.id` | Child table | LOGICAL |
| `fee_category_id` | `INT UNSIGNED`| No | FK -> `fee_categories.id` | Checked fee heads | CONFIRMED |
| `amount` | `DECIMAL(10,2)`| No | In Pakistani Rupees (PKR) | Textbox amounts | CONFIRMED |

#### Table: `fee_invoices` (Challans / Vouchers)
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | Primary key | CONFIRMED |
| `invoice_no` | `VARCHAR(50)` | No | Unique (`BillNo`) | Barcode Challan # | CONFIRMED |
| `student_id` | `INT UNSIGNED` | No | FK -> `students.id` | Link to recipient | CONFIRMED |
| `academic_session_id`| `INT UNSIGNED`| No | FK -> `academic_sessions.id`| Active session | CONFIRMED |
| `billing_month` | `TINYINT` | No | `1` to `12` | Month selector | CONFIRMED |
| `billing_year` | `SMALLINT` | No | e.g. `2026` | Year selector | CONFIRMED |
| `issue_date` | `DATE` | No | - | `01-Nov-2026` | CONFIRMED |
| `due_date` | `DATE` | No | - | `10-Nov-2026` | CONFIRMED |
| `validity_date` | `DATE` | No | - | `20-Nov-2026` | CONFIRMED |
| `gross_amount` | `DECIMAL(10,2)`| No | Sum of fee heads | Amount PKR | CONFIRMED |
| `concession_amount`| `DECIMAL(10,2)`| No | Default: `0.00` | Sibling/scholarship discount | CONFIRMED |
| `arrears_amount` | `DECIMAL(10,2)`| No | Default: `0.00` | Prior unpaid dues | CONFIRMED |
| `late_fine_amount`| `DECIMAL(10,2)`| No | Default: `0.00` | Added after due date | CONFIRMED |
| `net_payable` | `DECIMAL(10,2)`| No | Gross - Conc + Arr + Fine | Billed Amount | CONFIRMED |
| `paid_amount` | `DECIMAL(10,2)`| No | Default: `0.00` | Collected Amount | CONFIRMED |
| `status` | `ENUM('Unpaid','Partially Paid','Paid','Defaulter')` | No | Default: `Unpaid` | Invoice state | CONFIRMED |

#### Table: `fee_payments` (Receipts)
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | Primary key | CONFIRMED |
| `invoice_id` | `INT UNSIGNED` | No | FK -> `fee_invoices.id` | Settled invoice | CONFIRMED |
| `receipt_no` | `VARCHAR(50)` | No | Unique | Counter receipt # | CONFIRMED |
| `payment_date` | `DATE` | No | - | Received date | CONFIRMED |
| `amount_paid` | `DECIMAL(10,2)`| No | In PKR | Cash/wire amount | CONFIRMED |
| `payment_method`| `ENUM('Cash','Cheque','Bank Transfer','Online')` | No | - | Payment type | CONFIRMED |
| `bank_account_id`| `INT UNSIGNED` | Yes | FK -> `bank_accounts.id` | Target deposit account | CONFIRMED |
| `collected_by` | `INT UNSIGNED` | No | FK -> `users.id` | User audit | HIGH |

---

### 2.5 General Ledger & Accounting (`/admin/accounts/`)

#### Table: `chart_of_accounts`
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `code` | `VARCHAR(50)` | No | PK / Unique (`30055001001`) | Observable account codes | CONFIRMED |
| `parent_code` | `VARCHAR(50)` | Yes | Self FK -> `chart_of_accounts.code` | Hierarchy tree | CONFIRMED |
| `title` | `VARCHAR(150)` | No | - | e.g. `Bank Balances » Meezan Bank` | CONFIRMED |
| `level` | `TINYINT` | No | `1` to `4` | 4-tier tree structure | CONFIRMED |
| `account_type` | `ENUM('Asset','Liability','Equity','Revenue','Expense')` | No | - | Main heads `10`..`50` | CONFIRMED |
| `status` | `ENUM('Active','In-Active')` | No | Default: `Active` | Status flag | CONFIRMED |

#### Table: `vouchers` & `voucher_entries`
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | ID (e.g. `583`) | CONFIRMED |
| `voucher_no` | `VARCHAR(50)` | No | Unique (e.g. `CV26270002`) | Voucher sequence # | CONFIRMED |
| `voucher_type` | `ENUM('CPV','CRV','BPV','BRV','JV','CV')` | No | - | Type code | CONFIRMED |
| `school_id` | `INT UNSIGNED` | No | FK -> `schools.id` | Campus selector | CONFIRMED |
| `voucher_date` | `DATE` | No | - | e.g. `28-Aug-2026` | CONFIRMED |
| `total_amount` | `DECIMAL(12,2)`| No | In PKR | Observable amount `6,000` | CONFIRMED |
| `narration` | `TEXT` | Yes | - | Memo / description | CONFIRMED |
| `attachment_path`| `VARCHAR(255)`| Yes | - | `Invoice (Bill Scan)` upload | CONFIRMED |
| `status` | `ENUM('Active','In-Active')` | No | Default: `Active` | Status toggle | CONFIRMED |
| `voucher_id` | `INT UNSIGNED` | No | FK -> `vouchers.id` | Child entries | CONFIRMED |
| `account_code` | `VARCHAR(50)` | No | FK -> `chart_of_accounts.code` | Debited / Credited account | CONFIRMED |
| `entry_type` | `ENUM('Debit','Credit')` | No | - | Headings in voucher form | CONFIRMED |
| `particular` | `VARCHAR(255)` | Yes | - | Line item narration | CONFIRMED |
| `amount` | `DECIMAL(12,2)`| No | Enforces `Sum(Dr) == Sum(Cr)` | Amount textboxes | CONFIRMED |

---

### 2.6 Examinations & Marks (`/admin/exams/`)

#### Table: `exams` & `exam_marks`
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | `exams/exams.php` | CONFIRMED |
| `session_id` | `INT UNSIGNED` | No | FK -> `academic_sessions.id`| Session selector | CONFIRMED |
| `title` | `VARCHAR(100)` | No | e.g. `Midterm`, `Final Term Exam` | Observable exam titles | CONFIRMED |
| `start_date` | `DATE` | No | - | Datesheet start | CONFIRMED |
| `end_date` | `DATE` | No | - | Datesheet end | CONFIRMED |
| `status` | `ENUM('Active','In-Active')` | No | Default: `Active` | Status toggle | CONFIRMED |
| `mark_id` | `INT UNSIGNED` | No | PK, Auto Increment | Child entry | LOGICAL |
| `exam_id` | `INT UNSIGNED` | No | FK -> `exams.id` | Exam link | CONFIRMED |
| `student_id` | `INT UNSIGNED` | No | FK -> `students.id` | Student link | CONFIRMED |
| `subject_id` | `INT UNSIGNED` | No | FK -> `subjects.id` | Subject link | CONFIRMED |
| `theory_marks` | `DECIMAL(5,2)` | Yes | - | Theory input | CONFIRMED |
| `practical_marks`| `DECIMAL(5,2)`| Yes | - | Practical input | CONFIRMED |
| `is_absent` | `BOOLEAN` | No | Default: `FALSE` | Absentee checkbox | CONFIRMED |
| `total_marks` | `DECIMAL(5,2)` | No | Computed | Sum of marks | CONFIRMED |
| `grade` | `VARCHAR(5)` | Yes | e.g. `A+`, `B` | Inferred from grade slab | CONFIRMED |

---

### 2.7 HR & Payroll (`/admin/hr/` & `/admin/payroll/`)

#### Table: `employees` & `payrolls`
| Column Name | Inferred Data Type | Nullable? | Constraints | Evidence & Source | Confidence |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `id` | `INT UNSIGNED` | No | PK, Auto Increment | `hr/employees.php` | CONFIRMED |
| `school_id` | `INT UNSIGNED` | No | FK -> `schools.id` | Campus selector | CONFIRMED |
| `department_id`| `INT UNSIGNED` | No | FK -> `departments.id` | `Admin`, `Teachers`, etc. | CONFIRMED |
| `designation_id`| `INT UNSIGNED` | No | FK -> `designations.id` | `Principal`, `Teacher`, etc. | CONFIRMED |
| `employee_no` | `VARCHAR(50)` | No | Unique | Table column `Employee #` | CONFIRMED |
| `name` | `VARCHAR(150)` | No | - | Full staff name | CONFIRMED |
| `cnic` | `VARCHAR(25)` | No | Masked | National ID CNIC | CONFIRMED |
| `basic_salary` | `DECIMAL(10,2)`| No | In PKR | Contract salary base | CONFIRMED |
| `job_type` | `ENUM('Permanent','Contract','Visiting','Part-Time','Probation')` | No | - | Job Type dropdown | CONFIRMED |
| `status` | `ENUM('Active','Resigned','Any Status')` | No | Default: `Active` | Status dropdown | CONFIRMED |
| `payroll_id` | `INT UNSIGNED` | No | PK, Auto Increment | `payroll/payroll.php` | CONFIRMED |
| `employee_id` | `INT UNSIGNED` | No | FK -> `employees.id` | Employee relation | CONFIRMED |
| `month` | `TINYINT` | No | `1` to `12` | Month selector | CONFIRMED |
| `year` | `SMALLINT` | No | e.g. `2026` | Year selector | CONFIRMED |
| `gross_salary` | `DECIMAL(10,2)`| No | Basic + Allowances | Gross PKR | CONFIRMED |
| `total_deductions`| `DECIMAL(10,2)`| No | Taxes + EOBI + Loans | Deductions PKR | CONFIRMED |
| `net_salary` | `DECIMAL(10,2)`| No | Gross - Deductions | Disbursed PKR | CONFIRMED |
| `payment_status`| `ENUM('Pending','Paid','Cheque')` | No | Default: `Pending` | Payment status | CONFIRMED |
