# Phase 2: Module Functional Specifications & Deep Reverse Engineering

**Project**: eSchool Complete Reverse Engineering & Modernization Blueprint  
**Application**: eSchool (School Management System)  
**Target URL**: `https://demo.eschool.com.pk/`  
**Audit Type**: Deep Functional & Workflow Specification  

---

## 1. Executive Functional Scope

This specification details the core operational domains reverse-engineered from the live eSchool application. For each primary module, it provides the exhaustive CRUD capabilities, data dictionary of form controls, validation rules, dependent dropdown cascades, and complete end-to-end business workflows.

---

## 2. Student Lifecycle Management (`/admin/students/`)

### 2.1 Tabular Directory & Filters (`students.php`)
- **Filters**:
  - `Date Range`: `txtFromDate` to `txtToDate` (jQuery UI Datepicker format: `DD-Mon-YYYY`)
  - `School`: Dropdown of campuses (`eSchool Lahore`, `eSchool Islamabad`, `eSchool Karachi`)
  - `Class / Section`: Cascading dropdown (e.g., `I » A`, `X » B`, `OL-II » A`)
  - `Session`: Academic annual term (`2026-2027`, `2025-2026`, etc., or `All Sessions`)
  - `Status`: Student status tag (`Active`, `New Admission`, `Defaulter`, `Withdrawn`, `Graduated`, `Any Status`)
  - `Search Box`: Real-time text search querying student name, registration number, father name, or roll number.
- **Table Columns**:
  1. `#` (Record selector checkbox & numerical sequence)
  2. `Student` (Thumbnail avatar, Full Name, Father's Name)
  3. `Registration #` (Unique alphanumeric student ID, e.g., `23345`, `000781`)
  4. `Class/Section` (Current academic enrollment)
  5. `Options` (Actions: View `view.gif`, Edit `edit.gif`, Delete `delete.gif`, Fee Profile `fee.gif`)
- **Data Operations**:
  - `Pagination`: Client-side DataTables pagination (10, 25, 50, 100 entries per page).
  - `Sorting`: Ascending/Descending on all columns.
  - `Bulk Actions`: Multi-select checkboxes with `Delete Selected Rows`.
  - `Export`: Pre-formatted printable class rosters and CSV/Excel exports via `students/lists.php`.

### 2.2 Student Admission Form (`students.php#tabs-2`)
The admission form is organized into 10 structured accordion panels:

#### A. Personal Information
| Field Name | HTML Name | Control Type | Required? | Validation Rules & Options |
| :--- | :--- | :---: | :---: | :--- |
| **Student Name** | `txtName` | `text` | **Yes** | Max 100 chars, letters and spaces only. |
| **Gender** | `ddGender` | `select` | **Yes** | Options: `Male`, `Female`. |
| **Date of Birth** | `txtDob` | `text` (date) | **Yes** | Date format `DD-Mon-YYYY`, must be historical date. |
| **Birth Place** | `txtBirthPlace` | `text` | No | City or district of birth. |
| **Any Disability** | `txtDisability` | `text` | No | Free-text medical or physical impairment description. |
| **B-Form # / CNIC**| `txtBformNo` | `text` | No | Masked format: `99999-9999999-9` (13 digits). |
| **Picture** | `filePicture` | `file` | No | Image file upload (`.jpg`, `.jpeg`, `.png`), max 2MB. |
| **Weight** | `txtWeight` | `text` | No | Numerical weight in kilograms. |
| **Height** | `txtHeight` | `text` | No | Height in feet/inches or centimeters. |
| **Blood Group** | `ddBloodGroup` | `select` | No | Options: `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`. |
| **Hand Preference**| `ddHand` | `select` | No | Options: `Right-Handed`, `Left-Handed`. |
| **Religion** | `ddReligion` | `select` | No | Options: `Islam`, `Christian`, `Sikh`, `Hindu`, `Non-Muslim`, `Other`. |
| **Nationality** | `ddNationality` | `select` | **Yes** | Default: `Pakistani`, options include foreign nationalities. |

#### B. Registration Information
| Field Name | HTML Name | Control Type | Required? | Validation Rules & Options |
| :--- | :--- | :---: | :---: | :--- |
| **School Campus** | `ddSchool` | `select` | **Yes** | Master campus list. Selecting triggers AJAX reload of classes. |
| **Class / Section**| `ddClassSection`| `select` | **Yes** | Dependent dropdown populated based on selected `ddSchool`. |
| **Registration No**| `txtRegNo` | `text` | No | Auto-generated sequential ID if left blank. |
| **Registration Date**| `txtRegDate` | `text` (date) | **Yes** | Date of formal enrollment. Default: Today. |
| **Joining Date** | `txtJoinDate` | `text` (date) | **Yes** | Official first day in classroom. |
| **Roll Number** | `txtRollNo` | `text` | No | Class-specific roll sequence identifier. |
| **School Email** | `txtSchoolEmail` | `text` (email)| No | Institutional email address for portal and Google Classroom. |
| **School Password**| `txtSchoolPassword`| `password` | No | Portal access credentials. |

#### C. Contact Information
- `txtAddress`: Street address line (Textarea/Text).
- `ddLocation`: Dependent geopolitical town/neighborhood selector (e.g., `Johar Town`, `Gulberg`, `DHA`, `Model Town`).
- `txtPostalCode`: 5-digit postal code.
- Quick copy button: `Make Father/Mother Address` (copies parents' residence to student record).

#### D. Father & Mother Information
- `txtFatherName` (**Required**), `txtFatherCnicNo` (Masked CNIC), `txtFatherNtn` (National Tax Number).
- `ddFatherMaritalStatus` (`Married`, `Separated`, `Divorced`, `Widower`).
- `txtFatherQualification`, `ddFatherOccupation` (Doctor, Engineer, Teacher, Businessman, etc.).
- `txtFatherCompany`, `txtFatherDepartment`, `txtFatherDesignation`.
- `txtFatherAddress`, `ddFatherLocation`, `txtFatherPhone`, `txtFatherMobile` (**Required for SMS**), `txtFatherEmail`.
- Identical mirror fields provided for Mother's profile.

#### E. Emergency Contact & Guardian
- `txtEmergencyName`: Name of designated emergency contact person.
- `ddEmergencyRelation`: Dropdown relationship (`Father`, `Mother`, `Grand Father`, `Grand Mother`, `Uncle`, `Aunt`, `Brother`, `Sister`, `Other`).
- `txtEmergencyPhone`: Landline telephone.
- `txtEmergencyMobile`: Cellular contact number.

---

## 3. Fee & Billing Management Subsystem (`/admin/billing/`)

### 3.1 Fee Structure Architecture (`billing/fee-structure.php`)
eSchool structures tuition and auxiliary charges through periodic multi-head fee schedules:

```
Fee Structure Definition (Per School Campus & Grade Level)
├── 1. Monthly Fee Heads (Recurring each month)
│   ├── Monthly Tuition Fee (e.g., PKR 5,000)
│   ├── Meal Charges (e.g., PKR 1,500)
│   ├── Transport Fee
│   └── ICT / AI Learning Fee (e.g., PKR 500)
├── 2. Once Fee Heads (Charged once at admission/registration)
│   ├── Registration Fee (e.g., PKR 2,000)
│   ├── Admission Fee (e.g., PKR 15,000)
│   ├── Security Deposit (Refundable upon withdrawal)
│   └── Learning Integration Fee (LIF)
└── 3. Yearly Fee Heads (Charged annually at session start)
    ├── Annual Charges / Development Fund
    ├── Examination & Paper Fund
    └── Stationery & Activity Charges
```

- **Operations on Fee Structure**:
  - `New Fee Structure`: Form with `ddSchool`, `ddClass`, `txtEffectiveDate`, checkboxes for fee heads with dedicated PKR amount textboxes.
  - `Clone Fee Structure`: Copies an existing grade's fee schedule to another grade or school branch with one click.
  - `Toggle Status`: Activates or deactivates fee schedules without deleting historical billing records.

### 3.2 Monthly Batch Voucher Generation (`billing/regular-fee.php`)
- **Generation Form Fields**:
  - `ddSchool`: Target school branch.
  - `ddClassSection`: Specific section or `All Classes`.
  - `ddMonth` & `ddYear`: Target billing cycle (e.g., `November 2026`).
  - `txtIssueDate`: Date printed on challan (e.g., `01-Nov-2026`).
  - `txtDueDate`: Normal payment deadline (e.g., `10-Nov-2026`).
  - `txtValidityDate`: Late payment expiry date (e.g., `20-Nov-2026`).
  - `txtLateFine`: Late fee surcharge (default: `PKR 200`).
- **Generation Engine Workflow**:
  1. Queries all active students in the selected class cohort.
  2. Pulls applicable active fee structure heads.
  3. Applies individual student concessions (`billing/fee-concessions.php`, e.g., 20% sibling discount, 50% staff child).
  4. Checks for unpaid arrears or default balances from prior billing cycles.
  5. Generates unique 10-digit Challan/Voucher numbers (e.g., `149 vouchers totaling PKR 1,627,026`).
  6. Produces multi-part printable fee challans (School Copy, Bank Copy, Student Copy).

### 3.3 Counter Fee Collection & Barcode Scan (`billing/fee-collection.php`)
- **Input Identifier**: Single scan/entry input field `#BillNo`.
- **Workflow**:
  1. Operator scans the barcode or inputs the Challan Number / Student Registration Number.
  2. The system triggers an AJAX fetch populating the student voucher breakdown:
     - Student Name, Class, Section, Guardian Name.
     - Current Month Tuition & Fee Heads.
     - Arrears / Previous Unpaid Balances.
     - Late Fee Fine (auto-computed if current date > Due Date).
     - Net Payable Amount.
  3. Operator enters:
     - `Received Amount` (Supports exact payment, partial payment, or overpayment).
     - `Payment Method` (`Cash`, `Cheque`, `Online / Direct Bank Transfer`).
     - `Bank Account` (Selected from corporate school bank accounts).
     - `Receipt Date` & `Receipt No`.
  4. System executes transaction:
     - Updates invoice status (`Paid`, `Partially Paid`).
     - Generates printable thermal or A5 paper fee receipt.
     - Automatically creates double-entry accounting Cash/Bank Receipt Voucher (`CRV`/`BRV`) syncing to Accounts General Ledger.

---

## 4. Student Attendance Subsystem (`/admin/students/attendance.php`)

### 4.1 Daily Attendance Register Interface
- **Selector Controls**:
  - `School`: Dropdown (`eSchool Lahore`, etc.).
  - `Class / Section`: Selecting dynamically populates student roster via AJAX.
  - `Date`: Dropdown triad (`Date: 1-31`, `Month: January-December`, `Year: 2026`).
- **Attendance Grid**:
  - Lists all active students in the section with Registration # and Student Name.
  - Status Radio Buttons per row:
    - `P` - **Present** (Green)
    - `A` - **Absent** (Red)
    - `L` - **Leave** (Yellow, checked against approved records in `students/leaves.php`)
    - `H` - **Holiday** (Blue, default on weekends and gazetted holidays)
  - Bulk Action Controls:
    - `Mark All Present` (Sets all students to `P` with one click).
    - `Mark All Absent` / `Mark All Holiday`.
- **Automated Communication Trigger**:
  - Checkbox: `Send SMS to Absent Students` (`chkSendSms`).
  - When checked upon saving, the system compiles merge-tag SMS messages (*"Dear Parent, your child [StudentName] was marked absent on [Date]..."*) and queues them via the SMS service engine (`students/sms.php`).

---

## 5. Examinations & Grading Subsystem (`/admin/exams/`)

### 5.1 Examination Setup & Datesheet
- `exams/exams.php`: Defines examination terms (`First Term`, `Midterm`, `Final Term Exam`).
- Parameters: Session, Start Date, End Date, Publish Status, Include in Cumulative Final Result flag.

### 5.2 Subject Assignment & Marks Entry (`exams/marks.php`)
- **Filters**: `School`, `Session`, `Class/Section`, `Exam`, `Subject`.
- **Marks Entry Grid**:
  - Lists all students enrolled in the class.
  - Input Columns:
    - `Theory Marks` (max validated against subject master passing/total marks).
    - `Practical / Lab Marks` (for science subjects).
    - `Viva / Oral Marks`.
    - `Absentee Flag` (`chkAbsent`, overrides numerical score and marks student absent).
- **Automated Grading Engine**:
  - Compares aggregate percentage against configured grade slabs (`exams/grades.php`):
    - `90% - 100%`: Grade `A+` (GPA 4.0, Outstanding)
    - `80% - 89%`: Grade `A` (GPA 3.7, Excellent)
    - `70% - 79%`: Grade `B` (GPA 3.0, Good)
    - `60% - 69%`: Grade `C` (GPA 2.0, Satisfactory)
    - `50% - 59%`: Grade `D` (GPA 1.0, Pass)
    - `Below 50%`: Grade `F` (Fail)
- **Report Card Generation (`exams/report-cards.php`)**:
  - Formats terminal academic transcripts with institutional crest, subject-wise marks, class average, highest marks, overall grade, class rank/position, teacher remarks, and attendance percentage.

---

## 6. Human Resources & Payroll (`/admin/hr/` & `/admin/payroll/`)

### 6.1 Employee Master Directory (`hr/employees.php`)
- Employee record captures: Full Name, CNIC, Mobile, Email, Permanent Address, Educational Qualifications, Emergency Contact.
- Institutional Details: Department (`Admin`, `Science Faculty`, `IT`, etc.), Designation (`Principal`, `Senior Teacher`, `Accountant`), Group (`Teaching`, `Non-Teaching`), Job Type (`Permanent`, `Contract`, `Visiting`, `Part-Time`, `Probation`).
- Salary Configuration: Base monthly salary, bank account number, EOBI number, NTN.

### 6.2 Monthly Payroll Computation Workflow (`payroll/payroll.php`)
1. **Initiation**: Finance officer selects `Month` and `Year` and clicks `Generate Payroll`.
2. **Gross Salary Aggregation**:
   - `Basic Salary` + `House Rent Allowance` + `Medical Allowance` + `Conveyance Allowance` + `Special Allowance`.
   - Adds approved performance or seasonal bonuses (`payroll/bonuses.php`).
3. **Statutory & Policy Deductions**:
   - `Attendance / Unpaid Leave Deductions`: Computed using `hr/attendance.php` and `hr/leaves.php` for unapproved absences.
   - `Loan Installment`: Auto-deducted from active loan schedule (`payroll/loans.php`).
   - `Provident Fund`: Contributory employee share (`payroll/provident-fund.php`).
   - `EOBI`: Fixed statutory employee contribution.
   - `Social Security`: PESSI/SESSI slab deduction.
   - `Income Tax`: Monthly withholding tax calculated via FBR annual salary tax brackets (`payroll/income-tax.php`).
4. **Net Pay Calculation**: `Gross Earnings` minus `Total Deductions`.
5. **Finalization & Lock**: Operator reviews the draft payroll sheet, verifies payment method (`Bank Transfer` or `Cash`), and executes `Lock Payroll`. Once locked, payslips become printable and the transaction automatically posts an Expense Voucher (`CPV`/`BPV`) to General Ledger Accounts.

---

## 7. Accounts & Double-Entry General Ledger (`/admin/accounts/`)

### 7.1 Chart of Accounts (COA) Hierarchy (`accounts/accounts.php`)
Implements standard multi-tier accounting:
- **Level 1 (Main Head)**: `10 - Capital & Equity`, `20 - Liabilities`, `30 - Assets`, `40 - Income`, `50 - Expenses`.
- **Level 2 (Sub-Head)**: e.g., `30055 - Current Assets`, `50014 - Salaries Expense`.
- **Level 3 (Control Account)**: e.g., `30055001 - Bank Balances`.
- **Level 4 (Transactional Ledger)**: e.g., `30055001001 - Meezan Bank Main Campus Account`.

### 7.2 Voucher Entry Engine (`accounts/vouchers.php`)
- **Supported Voucher Types**:
  1. `CPV` (Cash Payment Voucher) - Outflow from cash in hand.
  2. `CRV` (Cash Receipt Voucher) - Inflow to cash in hand.
  3. `BPV` (Bank Payment Voucher) - Outflow via bank cheque or electronic wire.
  4. `BRV` (Bank Receipt Voucher) - Inflow deposited into bank account.
  5. `JV` (Journal Voucher) - Non-cash adjustments, accruals, depreciation.
  6. `CV` (Contra Voucher) - Internal transfers between cash and bank accounts.
- **Entry Verification Rules**:
  - Each voucher supports unlimited dynamic Debit lines and Credit lines.
  - Line items require: `A/C Code & Description`, `Particular / Narration`, `Amount`.
  - **Enforced Balance Rule**: `Total Debit Amount == Total Credit Amount`. The `Save Voucher` button is locked or rejects submission if debit does not equal credit.
  - Document Attachment: Supports uploading scanned paper invoices or receipts (`Invoice (Bill Scan)`).
