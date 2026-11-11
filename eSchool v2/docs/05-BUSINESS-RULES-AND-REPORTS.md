# eSchool v2 — Business Rules, Printable Documents, Reports & Defect Register

> **Provenance:** Synthesized from Phase 1A Web Admin Baseline (`reverse-engineering.rar`), Live CDP Gap-Closure & Deep Forensic Captures (`docs/raw/gap-batch1..4.json`, `gap-followup.json`, `gap-batch5-deep-forensics.json`, `gap-batch6-surgical.json`, `gap-batch7-final-forensics.json`, `gap-batch8-verify.json`), and Phase 1B Mobile Decompilation (`docs/03-PHASE-1B-MOBILE-API-INVENTORY.md`).  
> **Execution Guardrail:** Pure specification document (`HOLD` on application/implementation code active). Any server-side PHP/SQL formula or third-party bank/gateway contract not directly inspectable via browser/APK capture is explicitly marked **`[VERIFY]`** rather than guessed.

---

## 1. Core Domain Business Rules & Calculations

### 1.1 System Settings Governance (`management/settings.php`)
All tenant-wide thresholds and toggles reside in `SYSTEM_SETTINGS` and `TENANT_FEATURE_FLAGS` (retiring hardcoded APK host checks):

| Domain | Verified Keys & Observed Behavior |
| :--- | :--- |
| **Security & Password Policy** | `ddPasswordChangeDays` (`0` Never, `30`, `60`, `90` days), `ddPasswordReuse` (`0` No Restriction, `1` Last, `2` Last 2, `3` Last 3 prior passwords disallowed), `ThermalPrinterIp` (max 15 chars), `ddDateFormat` (`d-M-Y`, `d-m-Y`, `m/d/Y`, `d/m/Y`), `ddTimeFormat` (`h:i A`, `H:i:s`), `ddImageResize` (`C` Center & Crop, `F` Fit to Size). |
| **Billing Defaults** | `ddAdvanceIncomeTax` (`Y`/`N`), `txtTaxableFeeAmount` (minimum annual fee threshold, max 8), `txtFeeTaxRate` (%), `txtLateFeeFine` (per day), `txtMaxFeeFine` (cap), `txtLastFeeDay` *(if Student Joining Day > LastFeeDay, monthly fee is not charged)*, `txtRegistrationFee`, `cbFeeCollectionMethods[]` (`CA`, `BC`, `BT`, `CH`, `OL`), `ddAcceptPartialFee` (`Y`/`N`), `ddCashFeeReceipt` (`Y`/`N` thermal auto-print), `ddIncludeUnpaidVouchers` (`Y`/`N`). |
| **Payroll & Statutory** | `txtNonPermanentSalaryTaxRate` (%), `txtContractTaxPayerRate` (%), `txtContractNonTaxPayerRate` (%), `txtMaleEobiExemptionAge` (2 digits), `txtFemaleEobiExemptionAge` (2 digits), `ddPayrollStartDay` (`1..31`). |
| **Library Policy** | `txtNoOfBooks` (concurrent borrow limit), `txtIssueDays` (loan duration), `txtLateReturnFine` (per day), `txtMaxReturnFine` (cap). |
| **Hidden Campus / Attendance Flags** | `ddSefMode`, `ddStartYear`, `WebsiteMode` (`ddWebsiteMode`), `txtFbPageId`, `ddStudentsSaturday`, `ddEmployeesSaturday`, `txtStudentsTimeInMargin` (minutes), `txtEmployeesTimeInMargin` (minutes), `ddStudentsAttendance`, `ddSubjectWiseAttendance`. |

---

### 1.2 Billing, Fee Engine & Collections
1. **Fee Category & Frequency Rules:**
   - Types: `Monthly`, `Once`, `Yearly`; optional `Taxable` (`Y`/`N`).
   - Uniqueness per `(TenantId, Title)` `[VERIFY]`; categories referenced by structures or bills cannot be hard-deleted.
2. **Joining Cutoff (`txtLastFeeDay`):**
   - Observed rule on Settings label: *"If Joining is after this Day, Monthly Fee will not be charged."* Applies during pro-rata/first-month Regular Fee generation `[VERIFY exact inclusive vs strictly-greater boundary on LastFeeDay]`.
3. **Concessions & Installments (`billing/edit-fee.php`, `edit-fee.js`):**
   - Each line item has `DueAmount`, `Concession`, and `PayableAmount = DueAmount - Concession`.
   - Line items can be split into **`ddInstallments[i]` = `1` (`No`) through `6` installments** (`txtInstallmentAmount[i]_[1..6]`) whenever `(DueAmount - Concession) > 0`.
   - Two installment strategies (`rbInstallmentsType`):
     - `V`: **Create New Voucher(s)** immediately for future installments.
     - `I`: **Include in Next Bill(s)** on upcoming monthly cycles `[VERIFY exact scheduling across subsequent regular-fee runs]`.
4. **Advance Income Tax Threshold & Rate:**
   - When `ddAdvanceIncomeTax == 'Y'`, if a payer's (`Father` / `Mother` per `ddTaxPayer`, not `ddTaxExemption`) annualized taxable fee exceeds `txtTaxableFeeAmount`, `txtFeeTaxRate` (%) is added to taxable items `[VERIFY exact annualization & mid-session exemption recalculation in PHP]`.
5. **Late Payment Fine & Prior Arrears (`billing/collect-fee.js`):**
   - For each overdue bill (current bill + any `.tdPrevFee` prior unpaid bills when `ddIncludeUnpaidVouchers == 'Y'`):
     $$\text{OverdueDays} = \max\left(0,\; \text{PaidDate} - \text{DueDate}\right)$$
     $$\text{Fine} = \text{OverdueDays} \times \text{PerDayFine}$$
     $$\text{CappedFine} = (\text{MaxFine} > 0)\; ?\; \min(\text{Fine},\; \text{MaxFine}) : \text{Fine}$$
   - *Note:* Live `billing/export-fee.php?FeeId=22791` PDF printed uncapped `25 * 106 = 2,650`, whereas live `collect-fee.php?BillNo=022791` calculated and pre-filled `500` (`MaxFeeFine`). `.NET 10` rebuild must apply the **same configured `MaxFine` cap consistently** on both printed Fee Challan late-fee text and collection calculations `[VERIFY if tenant-configurable per bank vs global]`.
6. **Partial Fee Acceptance (`ddAcceptPartialFee`):**
   - When `N`: Payable is locked client- and server-side to `NetTotal + CappedFine`.
   - When `Y`: Staff may collect `0 < PaidAmount <= NetTotal + CappedFine`; UI displays `Amount Received` and `Remaining Payment = (NetTotal + CappedFine) - PaidAmount`.
   - **`[VERIFY]` Partial Allocation & Excess Carry-Forward:** Exact PHP allocation order across `[Arrears vs Late Fine vs Current Categories]` on partial payment and accounting of `AdvanceFee` (observed on `oneiro.eschool.pk` Parent Billing).
7. **Final Settlement (`billing/export-final-settlement.php`, `get-final-settlement-details.php`):**
   - Eligible only for `Withdrawal Approved` or `Graduated` students.
   - Verified formula on live A4 Settlement PDF:
     $$\text{Balance Amount} = \text{Security Deposit} - \text{Unpaid Fee} - \text{Other Deductions}$$
8. **Payment Modes & Bank/Online Channels:**
   - Supported codes: `CA` (Cash), `BC` (Bank Counter), `BT` (Bank Transfer), `CH` (Cheque + Cheque #), `OL` (Online Credit/Debit/Wallet).
   - Bank APIs (`get-api-logs.php`, `Bank al habib limited`, `Meezan BanK`): `Inquiry`, `Payment`, `Reversal` logging full request/response payloads.
   - Online Gateways (APK): `Alpha`, `Card`, `JazzCash`, `Blinq`, `KuickPay`. Live probe on `demo.eschool.com.pk` confirmed `/pay/<md5(VoucherNo)>/`, `/payments/blinq/index.php`, and `/payments/kuickpay/index.php` return `HTTP 404` on the demo host *(active only on configured production payment hosts such as `eschool.com.pk`)*. **`[VERIFY]` all Bank API HMAC/auth headers, response code tables, and Payment Gateway merchant callbacks.**

---

### 1.3 Payroll, Statutory Deductions, Loans & Settlements
1. **Basic vs. Medical Salary Breakdown (Observed Live Across `payroll/view-payroll.php?PayrollId=522`, `payslip` PDF & HR 360):**
   - Consistent across every observed record (`121,212 -> 110,193 + 11,019`; `62,000 -> 56,364 + 5,636`; `15,000 -> 13,636 + 1,364`; `2,000 -> 1,818 + 182`; `50,000 -> 45,454 + 4,546`):
     $$\text{BasicSalary} = \text{RoundHalfUp}\!\left(\frac{\text{GrossSalary}}{1.10}\right), \qquad \text{MedicalAllowance} = \text{GrossSalary} - \text{BasicSalary}$$
     *(Medical Allowance = `10%` of Basic Salary, tax-exempt up to Pakistani statutory `10%` threshold `1/11` of Gross; verify `50,000` rounding `45,454` = `floor`/`round-half-even` `[VERIFY]`).*
2. **Payable Salary Recalculation (`payroll/edit-payroll.js`):**
   - Verified live client formula on tax edits:
     $$\text{NewPayable} = \text{PrevPayable} + \text{OrigIncomeTax} + \text{OrigAdditionalTax} - \text{NewIncomeTax} - \text{NewAdditionalTax}$$
   - Overall Payroll Slip identity (`payslip` PDF #522 / `Feb 2019`):
     $$\text{NetPay} = \text{GrossPay} + \text{Mobile/Fuel/Allowances} + \text{Bonuses} + \text{Reimbursement} - (\text{EOBI} + \text{IncomeTax} + \text{AdditionalTax} + \text{LeaveDeductions} + \text{LoanDeduction} + \text{ProvidentFund} + \text{OtherDeductions})$$
3. **Employee Loan Installment Splitting & Recovery (`payroll/loans.js` + Ledger `188` Proven Live):**
   - For refundable loans split across `N = NoOfInstallments`:
     $$\text{BaseEMI} = \left\lfloor \frac{\text{LoanAmount}}{N} \right\rfloor, \qquad \text{FirstEMI} = \text{BaseEMI} + (\text{LoanAmount} \bmod N)$$
   - Remainder is front-loaded onto EMI `#1` (**empirically verified** in FY `2026-27` Ledger Statement: `L000076` `40,000 / 3 -> LP000382 = 13,334`, and `LP000372 = 3,334` = `10,000 / 3`). During Payroll generation, `Skip Loan` (`Y/N`) pauses scheduled deduction for that cycle.
4. **Statutory Slabs & Payroll Forensics (Observed Across `18` Historical & `14` Recent `2025–2026` Runs):**
   - **Income Tax (`payroll/income-tax.php`):** Bracket table columns `[MinimumAmount, MaximumAmount, Tax (%), Tax (Fixed), SurchargeLimit, SurchargeRate (%)]` verified across FY `2017-18`..`2023-24` (e.g., `2019`: `0-600k: 0%`, `600k-1.2M: 5%+0`, `1.2M-1.8M: 10%+30k`, ..., up to `75M+: 35%+21.42M`). Live payslips confirm monthly YTD rebalancing (`Amna`: Standard `840` vs Feb `1,976` / Mar `2,470`; `Azam`: Standard `1,771` vs Mar `3,453`) plus `NonPermanentSalaryTaxRate`, `ContractTaxPayerRate`, `ContractNonTaxPayerRate` `[VERIFY exact PHP YTD remaining-months & allowance/bonus taxability formula]`.
   - **EOBI (`payroll/eobi.php`):** Fixed monthly PKR pairs `(Employee, Employer)` per Month/Year (e.g., `Feb/Mar 2019`: Employee `200`; `Jul 2025`: Employee `320`; `Sep 2026`: `100/1,000`), skipped when employee `EobiApplicable = N` or `Age >= MaleEobiExemptionAge / FemaleEobiExemptionAge` `[VERIFY age cutoff evaluation date]`.
   - **Provident Fund (`payroll/provident-fund.php`):** Fiscal-year ascending `(Max Salary -> Fixed Contribution)` tiers (e.g. `2026-27`: `40k -> 4,000`, `50k -> 5,000`). Live `Aug 2026` payslips prove salaries above the top threshold (`70k`, `80k`, `121,212` -> `PF = 5,000`) **cap at the top tier**, while `Jul 2025` (`70k`, `80k`, `121,212` -> `PF = 1,000`) used `1,000` `[VERIFY exact employer match & Basic-vs-Gross tier lookup]`.
   - **Social Security (`payroll/social-security.php`):** Monthly `(Minimum, Maximum, Contribution %)` band (must enforce `Max >= Min` CHECK constraint to block legacy `95/55` & `50,000/10,000` inverted rows).
   - **Monthly Adjustments & Leave Deductions (Verified Live on `PID=3838` `Jul 2025`):** `Basic 72,727 + Medical 7,273 + Mobile/Fuel 1,000 = Gross 81,000`, minus `(320 EOBI + 1,000 Leave Deduction + 21,000 Loan + 1,000 PF + 1,000 Others = 24,320)` = **`56,680` Net Pay** (`1 PKR` exact!).
   - **HR Leave Policies (`hr/leave-types.php` Edit Modals):** Verified `ddWeightage` (`1` Full Day / `0.5` Half Day), `ddClMerge` (Merge in Casual Leaves), `ddServiceLength` (`Years+Months`), `ddNoOfRequests` (`0..10`), `ddGap` (`Years+Months`), **`ddSandwich` (`N` No | `S` Single-End [if any connected day ON] | `B` Double-End [if both connected days ON])**, `ddCarryForward` (`Y/N`, `1..30` max), and `ddProrated` (`Y/N`) `[VERIFY exact PHP daily divisor Gross/30 vs WorkingDays & leave proration math]`.
   - **Payroll Final Settlement (`payroll/final-settlement.php`):** Final month range deductions/adjustments + Bonus (`Fixed`/`%`) + Loan payoff `[VERIFY exact PHP pro-rata days formula]`.

---

### 1.4 Attendance, Timetable, Library, Comments & Data Locks
1. **Attendance Rules (`AttendanceTime` & Tolerances):**
   - Teacher Mobile / Portal `AttendanceTime`: `0` = Status (`P/A/L/H`) only; `1` = Status + `Time`; `2` = Status + `TimeIn` + `TimeOut`.
   - Teacher backdate edit window bounded by tenant `AttendanceDays` (e.g., `7` days); Admin marking enforces active `Data Lock` cutoff dates.
   - **Pre-Approved Leave Protection:** If an approved Leave covers the attendance date, Admin Student Monthly Matrix locks that cell to `L` (`Disabled`) to prevent accidental overwrite.
   - **Late Arrival:** Evaluated against `School.StudentsTimeIn + StudentsTimeInMargin` (minutes) and `School.EmployeesTimeIn + EmployeesTimeInMargin` or assigned Shift `Roster` (`Mon`–`Sun` + Summer/Winter seasons) `[VERIFY exact grace boundary]`.
2. **Timetable Clash Prevention (`timetable/scheduler.js`):**
   - Drag/drop scheduling executes `POST update-schedule`: a teacher **cannot** be assigned to two different Class/Sections in the same `(Season, DayOfWeek, PeriodSlot)`, returning `HTTP 409` / error banner and reverting UI card.
3. **Library Circulation Rules (`management/settings.php` + Library):**
   - Max concurrent active issues per Borrower (`Student` or `Employee`): `txtNoOfBooks` (e.g., `2`).
   - Issue duration: `txtIssueDays` (e.g., `3` days).
   - Overdue Return Fine: `min(max(0, ReturnDate - DueDate) * txtLateReturnFine, txtMaxReturnFine)` (e.g., `min(days * 50, 500)`).
   - Accession barcode format: `CAT-BOOK-COPY` (Category 3-char code + Book ID + Copy ID).
4. **Student & HR Comments `Nature` Scale (Verified Live in `write-comments.php`):**
   - `2` = **Excellent**, `1` = **Good**, `0` = **Normal** (default), `-1` = **Bad**, `-2` = **Worst**.
   - Displayed with green (`> 0`), neutral (`0`), and red/rose (`< 0`) visual badges across Admin 360 and Parent Portal.
5. **Accounts GL Automation, Single-FY Rules & Financial Year Closings (Empirically Verified):**
   - **Voucher Integrity:** Total observed vouchers **`583` = `JV (239) + PV (322) + RV (17) + CV (5)`**, balancing `SUM(Debit) == SUM(Credit) > 0`. Cheque Books track `Available -> Issued -> Bounced/Cancelled`.
   - **Single Fiscal-Year Bound:** Live `accounts/ledger-statement.php` enforces one Financial Year (`Jul 01 – Jun 30`), clipping multi-year ranges to closing `Jun 30`.
   - **Accounts Settings Mappings (`accounts/settings.php` Tabs 1–5 Captured Live):**
     - *Accounts:* `Profit/Loss (10009)`, `Accumulative Depreciation (30046)`, `Fixed Assets (30046)`, `Expense Depreciation (50044)`, `ZeroTransactionLedgers (Hide/Show)`.
     - *Billing:* `FeeReceivable (30049)`, `Fine (40015)`, `RegistrationFee (40016)`, `SecurityDeposit (20010)`, `BadDebts (50057)`, + `149` Fee Category -> Income Ledger mappings (`Monthly Fee -> 40011`, `Academy Fee -> 40017`, `Admission Fee -> 40012`).
     - *Payroll:* `Salary (20007)`, `EOBI (20012)`, `PF (20011)`, `SS (20013)`, `IncomeTax (20004003)`, `Mobile (50047)`, `Fuel (50046)`, `Bonus (50045)`, `Loans (30051)`.
   - **Empirically Proved Auto-GL Journal Rules (Matched Across `Bill -> Ledger Statement` FY `2026-27`):**
     - **Fee Bill Generation Accrual (`SF022491 = 15,600`):** `DR Monthly Fee Receivable (30049)` `15,600`; `CR` each mapped Fee Category Income Ledger (`40011: 14,700`, `40017: 400`, Library: `500`).
     - **Arrears Carry-Forward Exclusion (`SF021731`):** Carried-forward unpaid voucher line items (`Jun 2026 Voucher # 022919 = 7,375`) are **excluded from re-accrual** (`30049` debits ONLY new `15,500`, preventing double-counted revenue/receivables!).
     - **Late Fine Credit (`SF019969`):** `CR Student Fee Fine (40015)` posted on collection `PaidDate`. *(Collection DR Cash/Bank vs CR Receivable, Payroll Expense DR + Depreciation `Cost` vs `WDV` formulas remain `[VERIFY]`).*
     - **Employee Loans (`L000075/76`, `LP000372/382`):** `DR Loan allocated to Employee (30051)` on issue; `CR 30051` on Payroll deduction.
6. **41 Period & Section Data Locks (`management/locks.php`):**
   - Every transaction module (`Inquiries`, `Registrations`, `Student Joining`, `Student Attendance`, `Student Leaves`, `Transfers`, `Withdrawals`, `Rejoins`, `Graduations`, `Regular Fee`, `Custom Fee`, `Fee Collection`, `Fee Due Date`, `Final Settlements`, `Employee Joining`, `HR Attendance`, `HR Leaves`, `Loans`, `Monthly Adjustments`, `Payroll`, `Vouchers`, `Petty Cash Receipts/Expenses`, `Book Issues/Returns`, `Inventory Purchases/Transfers/Adjustments`, etc. — **41 sections total**) enforces `TransactionDate > LockDate` on both client datepickers and `.NET 10` `IDataLockGuard` (`HTTP 422`).

---

## 2. Printable Documents & PDF Layout Specifications

All `10` captured live PDFs (`#1–#9` + `#11 Student Report Card`) plus `#12 Class Marks Sheet` (`.xlsx`) were extracted and parsed from `docs/raw/gap-batch4-printables-pdfs.json`, `gap-followup.json`, `gap-batch5-deep-forensics.json`, and `gap-batch6-surgical.json`, alongside Thermal Print JS and Mobile-only APK PDFs:

| # | Document Name | Legacy Endpoint | Paper Size & Orientation | Verified Exact Layout Structure & Sections |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Fee Challan (3-Copy)** | `billing/export-fee.php?FeeId=` | **A4 Portrait** (`210 x 297 mm`) | 3 vertical perforated slips: **`BANK COPY`**, **`SCHOOL COPY`**, **`PARENT'S COPY`**. Each slip displays: Campus Header + Address/Phone/URL, `Period`, `Issue Date`, `Due Date`, `Bill No.`, `Registration #`, `Student Name + S/O Father`, `Class / Section`, `Description \| Amount` table, `Total Payable by Due Date`, `Late Payment Fine @ Rs <X>/Day = <Fine>`, `Total Payable after Due Date`. *(v2: enforce configured `MaxFeeFine` cap on late fee line!).* |
| **2** | **Registration Fee Receipt** | `students/export-registration-fee.php?Id=` | **A4 Portrait** (`210 x 297 mm`) | Header: **`RECEIPT VOUCHER`**, `Voucher No. R<5-digit>`, `School`, `Date`. Grid: `A/C. Head \| Particulars \| Amount` (`Registration Fee \| <Student> s/o d/o <Father> \| <Amt>`), `Total`, `Rupees in words: ... Only`, Signature: `Accounts Officer`. |
| **3** | **School Leaving Certificate (SLC)** | `students/export-withdrawal-certificate.php?WithdrawalId=` | **A4 Landscape** (`297 x 210 mm`) | Centered formal title **`SCHOOL LEAVING CERTIFICATE`** with underlined blank/fill narrative: Student Name `s/o d/o` Father Name, `school registration no`, `admitted date`, `left date`, `class`, `"All school dues on his/her account have been paid."`, `date of birth`, best wishes line, `Issue Date`, Signature row: `School Stamp \| Date \| Head of Institution`. |
| **4** | **Employee Pay Slip** | `payroll/export-pay-slip.php?School=&Employee=&Year=&Month=` | **A4 Portrait** (`210 x 297 mm`) | School Name, **`Pay Slip`**, `For the Month | Employee Type | Working Days`, `Employee ID | Designation | Employee Name | Joining Date | Department`. Side-by-side comparison matrix (`Pay & Allowances` vs `Deduction Items` across `Standard | Current Month | YTD`): Income (`Basic Pay`, `Medical Allowance`, `Mobile/Fuel Expense`, `Bonus/Others`, `Reimbursment`) vs Deductions (`EOBI`, `Income Tax`, `Additional Tax`, `Leave(s) Deduction`, `Loan/Advance Deduction`, `Provident Fund`, `Others`), `Total`, `Gross Pay | Total Deductions`, `Net Pay` + `(Amount in Words)`, `Deposited to A/C`, Footer: *"This slip is system generated and does not require any signature. Please notify us within 3 days..."* *(Also fix `"Reimbursment"` spelling in v2!)* |
| **5** | **Billing Final Settlement** | `billing/export-final-settlement.php?Id=` | **A4 Portrait** (`210 x 297 mm`) | School Name, **`FINAL SETTLEMENT`**, `Student Name`, `Father's Name`, `Registration No`, `Class/Section`, 3-row table (`# \| Particulars \| Amount`: `1 Security Deposit`, `2 Unpaid Fee`, `3 Other Deductions`, `Balance Amount`), `Received By`, `Receipt Mode`, `Comments`, `Accounts Officer`, `Settlement Date`. |
| **6** | **Loan Payment Voucher** | `payroll/export-loan.php?LoanId=` | **A4 Landscape** (`297 x 210 mm`) | `Voucher No: L<6-digit>`, **`Payment Voucher`**, `Voucher Date`, `Cheque Date`, Campus, `Payee Name`, Accounting table (`A/C CODE \| ACCOUNT DESCRIPTION \| PARTICULAR \| DEBIT \| CREDIT`), `TOTAL`, `Amount in words`, Sign-off row (`Prepared By \| Checked By \| Approved By \| Payees Acknowledgement`). |
| **7** | **Accounts Voucher (`JV/PV/RV/CV`)** | `accounts/export-voucher.php?VoucherId=` | **A4 Landscape** (`297 x 210 mm`) | `Voucher No: <CV/JV/PV/RV><YY><Period><4-digit>`, Type Code (`CV`/`JV`/`PV`/`RV`), `Voucher Date`, Campus, (`Cheque #` / `Payee` when applicable), `A/C CODE \| ACCOUNT DESCRIPTION \| PARTICULAR \| DEBIT \| CREDIT`, `TOTAL`, `Amount in words`, `Prepared By` name, 4-column signature footer (`Prepared By \| Checked By \| Approved By \| Payees Acknowledgement`). |
| **8** | **Petty Cash Receipt Voucher** | `pettycash/export-receipt.php?Id=` | **A4 Portrait** (`210 x 297 mm`) | **`RECEIPT VOUCHER`**, `Voucher No.`, `School`, `Date`, `A/C. Head \| Particulars \| Amount`, `Total`, `Rupees in words: ... Only`, `Accounts Officer`. |
| **9** | **Petty Cash Payment Voucher** | `pettycash/export-expense.php?Id=` | **A4 Portrait** (`210 x 297 mm`) | **`PAYMENT VOUCHER`**, `Voucher No.`, `School`, `Date`, `A/C. Head \| Particulars \| Amount`, `Total`, `Rupees in words: ... Only`, Signature footer: `Accounts Officer \| Approved By \| Paid to`. |
| **10** | **Thermal Fee & Petty Cash Receipts** | `ajax/billing/print-fee-receipt.php`, `ajax/pettycash/print-receipt.php` | **80mm Roll** `[VERIFY]` | Legacy dispatches ESC/POS TCP socket commands directly from PHP server to `txtThermalPrinterIp` returning `status\|-\|message`. *(v2: return structured thermal receipt JSON + browser 80mm CSS `@media print` / optional local print agent bridge `[VERIFY exact ESC/POS line template]`).* |
| **11** | **Student Report Card** | `exams/export-student-report-card.php` | **A4 Portrait** (`210 x 297 mm` PDF) | *(Captured live on `Student=1064, Exam=40`):* Campus Title, Exam Title, `Student Name`, `Father's Name`, `Registration No`, `Class/Section`, Table `# \| Subject \| Teacher \| Maximum \| Obtained \| Grade`, `Comments:`, Signature `Examination Controller`, `Date`. |
| **12** | **Class Marks Sheet** | `exams/export-class-marks-sheet.php` | **Excel `.xlsx`** *(Frozen `D7`)* | *(Captured live on `Exam=65, Class=9`):* Attachment `<Class> - <Section> Marks Sheet.xlsx` with Campus/Exam/Class headers + repeating multi-subject column matrix `# \| Student Name \| Registration # \| <Subject>(Total \| Marks \| % \| Grade)... \| Total \| Marks \| % \| Grade \| Status`. |
| **13** | **Mobile-Only PDFs (`Weekly Plan`, `Daily Report`, `Appraisal`)** | Parent/Teacher APK `DownloadUrl`s | **A4 PDF `[VERIFY]`** | Exact PDF visual styling/headers observed in APK endpoint schemas only; visual sample templates `[VERIFY]`. |

---

## 3. Complete Reports & Statements Inventory

### 3.1 Financial Statements (`accounts/*` — Verified Live Columns & Drilldowns)
1. **Ledger Statement (`accounts/ledger-statement.php`):** `# | Particular | Date | Debit (PKR) | Credit (PKR) | Balance (PKR)` with `Opening Balance`, period entries, closing `Ledger Balance`, and **6 interactive source drilldowns** (`studentFee`, `payroll`, `loan`, `registrationFee`, `finalSettlement`, `voucher`).
2. **Trial Balance (`accounts/trial-balance.php`):** `Account Name | Code | Opening Balance (Debit / Credit) | Transactions (Debit / Credit) | Closing Balance (Debit / Credit)` (`DR == CR` invariant enforced!).
3. **Profit & Loss (`accounts/profit-n-loss.php`):** `Account Name | Code | Balance (PKR)` (`CR`/`DR`) across Income vs Expense hierarchy.
4. **Balance Sheet (`accounts/balance-sheet.php`):** `Account Name | Code | Balance (PKR)` across Assets vs Liabilities/Equity.
5. **General Ledger (`accounts/general-ledger.php`):** Multi-account grouped blocks (`Code | Name` header + `Date | Particular | Voucher # | Debit (PKR) | Credit (PKR) | Balance (PKR)`).

### 3.2 Module Parameterized Reports (Excel / PDF / In-App HTML Print)

| Module | Verified Count | Verified Report Types & Filters |
| :--- | :---: | :--- |
| **Students (`students/reports.php`)** | **`9`** | Daily Strength, Class-wise Strength, Session Summary, Admissions Summary, Withdrawals, Transfers, Re-Joins, Graduates, Category/Location Demographics *(plus **`72`-column `students/lists.php` custom field exporter**, stripping `school_password` in v2!)* |
| **Students Attendance (`students/attendance.php`)** | **`2`** | Date-wise & Month-wise Student Attendance Reports (`School`, `Class/Section`, `Date Range`, `Absent/Late` breakdown). |
| **Billing (`billing/reports.php`)** | **`15`** *(Reconciled!)* | **Reconciled from live `#ddReportType` (resolves `09`'s count of `13`):** (1) `billing-summary`, (2) `bill-not-generated`, (3) `challan-distribution-list`, (4) `defaulters-list`, (5) `defaulters-list-month-wise`, (6) `fee-bills-log`, (7) `fee-bills-receipt`, (8) `fee-collection-details`, (9) `fee-concession-details`, (10) `fee-concession-summary`, (11) `fee-generation-details`, (12) `fee-generation-summary` *(Grade wise)*, (13) `final-settlements`, (14) `security-fee-deposits`, (15) `staff-fee-concession-details`. *(Filters: `School[]`, `DateField` [`month_year`/`issue_date`/`due_date`/`paid_date`/`session`/`overall`/`ss.date`], `PaymentMode`, `BankAccount`, `FeeConcession`, `Session`; `#BtnView` fixed to hit `billing` instead of `students`!).* |
| **Exams (`exams/report-cards.php`, `analysis.php`)** | **`3+`** | Class Marks Sheet, Individual Student Report Card PDF, Grade-wise & Top/Low Performer Exam Analysis. |
| **Timetable (`timetable/reports.php`)** | **`2+`** | Class/Section Weekly Timetable, Teacher-wise & Free-Teacher Availability Reports. |
| **HR (`hr/reports.php`, `lists.php`, `attendance.php`, `statistics.php`)** | **`4 + Exports`** | **`reports.php` (`4` types):** `hiring`, `resignations`, `transfers-in`, `transfers-out`; plus `statistics` exports (`dept`, `city/town`, `movements`), Attendance reports (`2`), and **`48`-column `hr/lists.php` exporter** (minus plaintext password). |
| **Payroll (`payroll/reports.php`)** | **`14`** | All `14` verified report types: `salaries-sheet`, `salary-revisions`, `pay-slips`, `payroll-sheet`, `payroll-summary`, `bank-transfer-letter`, `cash-salaries`, `cheque-salaries`, `salary-not-generated`, `loan-details`, `eobi`, `social-security`, `employee-gl`, `employee-pf` *(fixing 5-arg `getEmployeesList` JS bug breaking `employee-gl`/`employee-pf`)*. |
| **Petty Cash (`pettycash/reports.php`)** | **`2`** | Day Book, Cash Flow Statement. |
| **Library (`library/reports.php`)** | **`9`** | Book Catalog, Copy Inventory, Issued Books, Overdue Books, Returned Books & Fines, Reserved Books, Category/Subject/Edition breakdowns *(fixing duplicate `#ddEdition` bug!)*. |
| **Inventory (`inventory/reports.php`)** | **`4`** | Stock Summary, Stock Batches, Campus/Class Transfers, Serialized Asset Adjustments (`#BtnView` restored!). |

---

## 4. Complete Legacy Defect & Security Register (Must Be Fixed in v2)

| # | Area / File | Confirmed Root Cause Observed | Target v2 Resolution |
| :-: | :--- | :--- | :--- |
| **D1** | **HR Dashboard (`hr/index.php`)** | **`HTTP 500`** crash mid-render after first chart script | Rewrite via `.NET 10` EF Core `HRDashboard` aggregation + Recharts |
| **D2** | **Billing Reports (`billing/reports.js`)** | `#BtnView` opens `students/export-report.php` instead of `billing/export-report.php` (verified verbatim in JS capture) | Route HTML preview & PDF/XLSX export to unified `/api/v1/admin/billing/reports/export` |
| **D3** | **Main Dashboard (`dashboard.js`)** | Calls missing `setupPettyCashChart()` causing uncaught `ReferenceError` | Dedicated React widget fetching `/api/v1/admin/pettycash/summary` |
| **D4** | **Students Lists Export (`students/lists.php`)** | Exports plaintext `school_password` (`40+41`) in downloadable Excel | Hard-block all credential fields from export DTOs; store only `Argon2id` hash |
| **D5** | **Billing Edit Due Date** | Missing `edit-fee-due-date.php` returns **`HTTP 404`** | Implement `PATCH /api/v1/admin/billing/bills/{id}/due-date` + modal |
| **D6** | **eCalendar (`ecalendar/calendar.php`)** | Loads `December 1999` instead of current month/year | Default to current tenant timezone date + add Month/Week/Day views |
| **D7** | **Social Security Slabs (`payroll/social-security.php`)** | Allows inverted ranges (`Min 95 / Max 55`, `50,000 / 10,000`) | Enforce DB `CHECK (max_amount IS NULL OR max_amount >= min_amount)` + FluentValidation |
| **D8** | **Payrolls (`payroll/reports.js`)** | `getEmployeesList()` called with 5 args (`Department` + `Employees`) instead of 6 | Strongly-typed React cascaded `<EmployeeSelect />` component |
| **D9** | **Custom Fee (`billing/custom-fee.php`)** | Year dropdown starts at `1..2027` (`0001..2027`) | Bound year selectors dynamically `[currentYear - 5 .. currentYear + 2]` |
| **D10** | **Homework (`students/homework.js`)** | Validation bug `sType == "Picture" && !checkDocument` validates `.gif/.png` instead of doc extensions | Clean MIME + magic-byte validation per attachment type |
| **D11** | **Student Notices (`hr/notices.js`, `students/notices.js`)** | Checks `sType == "Picture"` missing `Image` option handling | Unified attachment discriminator (`File | Picture | Video | Url`) |
| **D12** | **HR Designations (`hr/designations.php`)** | Status change executes `.icnToggle` click handler twice | Single debounced React mutation hook |
| **D13** | **HR Leave Types (`hr/leave-types.php`)** | `#ddddProrated` typo skips validation & inline row update targets wrong `Status` column | Strongly typed Zod form + TypeScript column keys |
| **D14** | **Payroll Salaries (`payroll/salaries.js`)** | Validates `#ddPfApplicable` which does not exist in DOM | Align form schema & field names 1:1 |
| **D15** | **Library Publishers (`library/publishers.php`)** | Edit modal displays `"Author Name"` label/text | Correct label to `"Publisher Name"` |
| **D16** | **Library Returns (`library/returns.php`)** | Payment mode lacks `CH` (Cheque), breaking dependent JS | Provide consistent `CA/BC/BT/CH` selector across Billing & Library |
| **D17** | **Library Reports (`library/reports.php`)** | Duplicate `#ddEdition` ID breaks selector binding | Distinct React component state per filter |
| **D18** | **SMS Services (`management/sms-services.js`)** | Status toggle image swap has `"success.ong"` typo | Declarative Tailwind status badge |
| **D19** | **Payment Collection (`billing/collect-fee.js`)** | `parseInt($("#txtPaidAmount")) < 0` misses `.val()` (`NaN`, dead negative check) | Server + Zod numeric validation (`amount >= 0`) |
| **D20** | **Students Lists UI (`students/lists.php`)** | `Select All` button only selects fields inside first accordion | Section-level & Global Select All controls |
| **D21** | **Bulk Fee Concession & Revision (`billing/`)** | Dead `#BtnView` / missing interactive table | Full interactive Grid Preview before batch apply |
| **D22** | **Inventory Reports (`inventory/reports.php`)** | `#BtnView` print preview missing compared to other reports | Standardized Print Preview + XLSX/PDF export |
| **D23** | **Management Email Templates** | `management/email-templates.php` returns **`HTTP 404`** | Implement active Email Template CRUD + variables preview |
| **D24** | **HR Assets vs Inventory** | `hr/assets.php` stores free-text assets unlinked from Inventory `C###-I####-#####` units | Unify under `ASSET_CUSTODY_LOGS` referencing serialized `INVENTORY_UNITS` |
| **D25** | **COA Unbalanced Openings & Typography** | Unbalanced Opening DR/CR across legacy COA (`diff 140k+`); role `"Acountant"` typo; `"Reimbursment"` payslip typo | Enforce balanced opening migration script + clean copy |
| **D26** | **Mobile APK Security & Client Bugs** | Zero JWT/session auth (`AccountId` spoofable), `md5(VoucherNo)` payment URLs, Base64 `DEFAULT` vs `NO_WRAP`, `"dd-MM-yyyyy"` broken PIN 5/day throttle, JSON-in-string `towns`, plaintext credentials in SharedPrefs, `12` hardcoded domain strings | Unified JWT Bearer API, opaque payment sessions, server-side 5/day PIN throttling, native JSON DTOs, `TENANT_FEATURE_FLAGS` |

---

## 5. Master `[VERIFY]` Server-Side Logic & Integration Register (Clean-Room Configurable Boundaries)

*(Note: After Batches 5–8 empirical forensics solved tax/PF/SS/EOBI slab structures, Leave Sandwich enum, Billing Accrual GL rules, Remainder-first Loans, Student Report Card PDF, and Class Marks Sheet XLSX, only the strict server-code/private-gateway items below require Domain Owner / PHP / SQL confirmation during Phase 0–1 UAT):*

1. **Income Tax YTD Rounding & Bonus Taxability:** Exact PHP annualization divisor, allowance/bonus taxability flags, and remaining-months YTD rebalancing formula (`[VERIFY]` as configurable `PayrollTaxEngine` policy).
2. **PF Employer Match & Leave Deduction Proration Divisor:** Employer PF % match rule, `Base` vs `Gross` bracket comparison, EOBI age cutoff evaluation date (`PayMonth end` vs `1st of month`), and Leave Salary daily divisor (`Gross/30` vs `Gross/DaysInMonth` vs `WorkingDays`) `[VERIFY]`.
3. **Partial Fee Sub-Category Allocation & Advance Fee:** Sub-category allocation precedence when `PaidAmount < NetTotal`, timing of `ddAdvanceIncomeTax` on monthly vs annual bills, `Next Bill (I)` installment scheduling, and `AdvanceFee` (`oneiro.eschool.pk`) ledger accounting `[VERIFY]`.
4. **Remaining Auto-GL Journal Templates & Depreciation Basis:** Fee Collection cash/bank clearing leg, Payroll Expense + Liability multi-department breakdown, Petty Cash & Inventory batch auto-posting, and Depreciation `Cost` vs `WDV` calculation basis `[VERIFY]`.
5. **External Bank & Payment Gateway Webhooks + Thermal ESC/POS:** Auth/HMAC specs & callbacks for Bank Al Habib, Meezan Bank, 1Link, Alpha, Card, JazzCash, Blinq, and KuickPay *(return `404` on demo)*, plus raw 80mm ESC/POS byte layout sent by `print-fee-receipt.php` `[VERIFY]`.
6. **RBAC-Locked & Private Portal Views:** Server HTML views blocked on demo `TypeId=2` (`accounts/depreciation`, `backups`, `payment-methods`, `inquiry-sources` — JS logic captured), authenticated `/parent/` & `/teacher/` web views *(API parity covered via APK)*, and Mobile-only PDFs (`Weekly Plan`, `Daily Report`, `Appraisal`) `[VERIFY]`.
7. **Student Self-Service Scope:** Whether `STUDENTS.school_email` / invite-only credential should power a restricted read-only Student route in Phase 2 `[VERIFY]`.
