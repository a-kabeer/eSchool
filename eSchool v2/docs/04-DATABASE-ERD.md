# eSchool v2 — Unified Logical & PostgreSQL 17 Database ERD

> **Provenance:** Consolidates Phase 1A Web Admin Domain (`07-logical-database-design.md`, `72` student export cols, `48` employee export cols, `accounts/settings.php`), Live CDP Gap Captures (`docs/raw/gap-batch1..4.json`, `docs/raw/gap-followup.json`), and Phase 1B Mobile Decompilation (`03-PHASE-1B-MOBILE-API-INVENTORY.md`).  
> **Target Engine:** **PostgreSQL 17** + **EF Core 10** (`Npgsql.EntityFrameworkCore.PostgreSQL`, `UseSnakeCaseNamingConvention()`, schema isolation per modular monolith bounded context, multi-tenant `tenant_id` global query filters).  
> **Non-Assumption Policy:** Legacy PHP/MySQL physical column types are inferred from observed UI contracts and exports (`[VERIFY]` on legacy migration mapping); target PostgreSQL 17 DDL designs below are normalized for clean rebuild.

---

## 1. PostgreSQL 17 & EF Core 10 Type & Integrity Standards

| Logical Type | PostgreSQL 17 Type | EF Core 10 / C# Mapping | Usage Notes |
| :--- | :--- | :--- | :--- |
| Primary / Foreign Keys | `bigint GENERATED ALWAYS AS IDENTITY` / `integer` | `long` / `int` | Surrogate keys across all entities; `uuid` (`gen_random_uuid()`) for public payment session tokens & OTP challenge IDs |
| Currency / Money | `numeric(14,2)` | `decimal` | All fees, concessions, fines, salaries, allowances, taxes, GL debits/credits, asset costs |
| Rates / Percentages | `numeric(7,4)` | `decimal` | Tax %, fee tax %, depreciation %, concession %, bonus %, social security % |
| Timestamps (Audit/UTC) | `timestamptz` | `DateTimeOffset` | All `created_at`, `updated_at`, `logged_at`, `sent_at`, `expires_at` stored in UTC |
| Business Dates & Times | `date` / `time` | `DateOnly` / `TimeOnly` | `dob`, `due_date`, `attendance_date`, `lock_date`, timetable/roster slots |
| Flexible / Structured Payloads | `jsonb` | `JsonDocument` / owned value object | `user_logs.old_data`/`new_data`, `bank_api_logs` payloads, `student_profile_revisions.requested_changes`, `inventory_batches.attribute_values` |
| Codes / Enums | `varchar(20)` + `CHECK` constraint | C# `enum` mapped via `.HasConversion<string>()` | Readable, indexable, safe against ordinal drift |

### 1.1 Critical Data Integrity & Modernization Fixes Enforced at DB Layer
1. **Normalized Guardians (`GUARDIANS` + `STUDENT_GUARDIANS`):** Moves Father (`16` cols) & Mother (`16` cols) attributes out of flat `STUDENTS` rows so multi-child families share one Guardian profile and Parent Portal credential (`PORTAL_ACCOUNTS`).
2. **Elimination of `school_password` Plaintext Exposure:** All admin, parent, teacher, and student credentials live in `USERS` / `PORTAL_ACCOUNTS` storing only `Argon2id` `password_hash` — never exportable in Excel lists.
3. **Unified Asset Registry (`INVENTORY_UNITS` + `ASSET_CUSTODY_LOGS`):** Retires the disconnected `hr/assets.php` table; serialized assets (`C###-I####-#####`) can be allocated to either `(school_id, class_id)` OR an `employee_id` custodian.
4. **Hard Financial & Statutory Constraints (`CHECK`):**
   - `statutory_slabs`: `CHECK (max_amount IS NULL OR max_amount >= min_amount)` (prevents legacy Social Security `95/55` & `50,000/10,000` inverted bands!).
   - `vouchers` & `voucher_entries`: Balanced `SUM(debit_amount) == SUM(credit_amount)` enforced on posting transaction + balanced `Opening Debit == Opening Credit` check on COA migration.
   - `data_locks`: `41` unique `(tenant_id, section_key)` freeze dates enforced in application & transaction guards.

---

## 2. Complete Unified Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    TENANTS {
        bigint id PK
        string code UK
        string name
        string logo_url
        string primary_domain
        string status
    }

    TENANT_FEATURE_FLAGS {
        bigint id PK
        bigint tenant_id FK
        string feature_key
        string value_type
        string string_value
        boolean bool_value
    }

    SYSTEM_SETTINGS {
        bigint id PK
        bigint tenant_id UK
        string site_title
        string date_format
        string time_format
        string thermal_printer_ip
        int password_expiry_days
        int password_history_count
        boolean advance_income_tax
        numeric taxable_fee_threshold
        numeric fee_tax_rate
        numeric late_fee_per_day
        numeric max_late_fee
        int last_fee_day
        numeric registration_fee
        boolean accept_partial_fee
        int payroll_start_day
        numeric non_permanent_tax_rate
        int male_eobi_exempt_age
        int female_eobi_exempt_age
        int library_max_books
        int library_issue_days
        numeric library_late_fine
        numeric library_max_fine
        jsonb smtp_config
        jsonb website_config
    }

    SMS_SERVICES {
        bigint id PK
        bigint tenant_id FK
        string gateway_type
        jsonb encrypted_config
        int sort_order
        boolean is_active
    }

    EMAIL_TEMPLATES {
        bigint id PK
        bigint tenant_id FK
        string template_key
        string subject
        text body_html
        boolean is_active
    }

    PAYMENT_METHODS {
        bigint id PK
        bigint tenant_id FK
        string code
        string name
        jsonb gateway_config
        boolean is_active
    }

    BACKUPS {
        bigint id PK
        bigint tenant_id FK
        string file_name
        bigint size_bytes
        bigint created_by FK
        timestamptz created_at
    }

    USER_TYPES {
        bigint id PK
        bigint tenant_id FK
        string title
        int sort_order
        string status
    }

    USER_TYPE_RIGHTS {
        bigint id PK
        bigint user_type_id FK
        string page_key
        boolean can_view
        boolean can_add
        boolean can_edit
        boolean can_delete
        boolean can_export
    }

    USERS {
        bigint id PK
        bigint tenant_id FK
        bigint user_type_id FK
        string name
        string email UK
        string mobile
        string password_hash
        string theme
        int records_per_page
        boolean totp_enabled
        string totp_secret_encrypted
        jsonb dashboard_flags
        jsonb misc_rights_flags
        jsonb student_tab_flags
        jsonb employee_tab_flags
        timestamptz password_changed_at
        string status
    }

    USER_RIGHTS {
        bigint id PK
        bigint user_id FK
        string page_key
        boolean can_view
        boolean can_add
        boolean can_edit
        boolean can_delete
        boolean can_export
    }

    USER_SCHOOLS {
        bigint user_id FK
        bigint school_id FK
    }

    USER_LOGS {
        bigint id PK
        bigint tenant_id FK
        bigint user_id FK
        timestamptz logged_at
        string module
        string section
        string action
        jsonb old_data
        jsonb new_data
        string ip_address
    }

    DATA_LOCKS {
        bigint id PK
        bigint tenant_id FK
        string section_key UK
        date lock_date
        bigint modified_by FK
        timestamptz modified_at
    }

    PORTAL_ACCOUNTS {
        bigint id PK
        bigint tenant_id FK
        string portal_type
        string role_or_gender
        string username
        string password_hash
        bigint guardian_id FK
        bigint employee_id FK
        string status
        timestamptz last_login_at
    }

    OTP_CODES {
        uuid id PK
        bigint tenant_id FK
        string portal_type
        string flow_type
        string mobile_no
        string cnic_no
        string code_hash
        int attempts
        boolean is_verified
        timestamptz expires_at
        timestamptz created_at
    }

    PUSH_DEVICES {
        bigint id PK
        bigint portal_account_id FK
        string device_type
        string fcm_token
        boolean is_active
        timestamptz updated_at
    }

    SCHOOLS {
        bigint id PK
        bigint tenant_id FK
        string name
        string code UK
        string address
        string mobile
        string phone
        string email
        string sms_mask
        time students_time_in
        time employees_time_in
        time employees_time_out
        bigint default_bank_account_id FK
        int sort_order
        string status
    }

    ACADEMIC_SESSIONS {
        bigint id PK
        bigint tenant_id FK
        string title
        date start_date
        date end_date
        boolean is_locked
        int sort_order
        string status
    }

    CLASSES {
        bigint id PK
        bigint tenant_id FK
        string name
        boolean attendance_enabled
        int position_order
        string status
    }

    SECTIONS {
        bigint id PK
        bigint class_id FK
        string name
        int capacity
        string status
    }

    SUBJECTS {
        bigint id PK
        bigint tenant_id FK
        string title
        string code
        numeric tuition_fee
        boolean taxable_tuition
        numeric lab_fee
        boolean taxable_lab
        int sort_order
        string status
    }

    CITIES {
        bigint id PK
        bigint tenant_id FK
        string name
        string status
    }

    TOWNS {
        bigint id PK
        bigint city_id FK
        string name
        string status
    }

    BANKS {
        bigint id PK
        bigint tenant_id FK
        string title
        string code
        boolean billing_api_enabled
        int sort_order
        string status
    }

    BANK_ACCOUNTS {
        bigint id PK
        bigint bank_id FK
        string account_title
        string account_no UK
        string address
        string phone
        string status
    }

    INQUIRY_STATUSES {
        bigint id PK
        bigint tenant_id FK
        string title
        int sort_order
        string status
    }

    INQUIRY_SOURCES {
        bigint id PK
        bigint tenant_id FK
        string name
        int sort_order
        string status
    }

    INQUIRIES {
        bigint id PK
        bigint school_id FK
        bigint class_id FK
        bigint status_id FK
        bigint source_id FK
        bigint town_id FK
        string student_name
        string gender
        string father_name
        string cnic_no
        string mobile
        date inquiry_date
        text notes
    }

    REGISTRATIONS {
        bigint id PK
        bigint inquiry_id FK
        bigint school_id FK
        bigint session_id FK
        bigint class_id FK
        bigint section_id FK
        bigint source_id FK
        string registration_no UK
        date registration_date
        numeric fee_amount
        numeric fee_discount
        boolean fee_paid
        string status
    }

    GUARDIANS {
        bigint id PK
        bigint tenant_id FK
        string guardian_type
        string full_name
        string cnic_no
        string ntn
        string marital_status
        string qualification
        string occupation
        string company
        string department
        string designation
        string phone
        string mobile
        string email
        string address
        bigint town_id FK
        string postal_code
    }

    STUDENTS {
        bigint id PK
        bigint registration_id FK
        bigint school_id FK
        bigint session_id FK
        bigint section_id FK
        string registration_no UK
        string roll_no
        string name
        string gender
        date dob
        string bform_no
        string blood_group
        string hand
        bigint religion_id FK
        bigint nationality_id FK
        bigint town_id FK
        string address
        string mobile
        string email
        string thumb_code
        boolean tax_exemption
        string tax_payer
        date joining_date
        string status
    }

    STUDENT_GUARDIANS {
        bigint student_id FK
        bigint guardian_id FK
        string relation
        boolean is_primary
    }

    STUDENT_DOCUMENTS {
        bigint id PK
        bigint student_id FK
        string title
        text details
        string file_path
        bigint uploaded_by FK
        timestamptz created_at
    }

    STUDENT_COMMENTS {
        bigint id PK
        bigint student_id FK
        string title
        text comment_html
        date comment_date
        smallint nature
        bigint created_by FK
    }

    STUDENT_PROFILE_REVISIONS {
        bigint id PK
        bigint student_id FK
        bigint requested_by_account_id FK
        string target_type
        jsonb requested_changes
        jsonb approved_fields
        string status
        bigint processed_by FK
        timestamptz processed_at
    }

    STUDENT_ATTENDANCE {
        bigint id PK
        bigint student_id FK
        bigint school_id FK
        bigint section_id FK
        bigint subject_id FK
        date attendance_date
        string status
        time time_in
        time time_out
    }

    STUDENT_LEAVES {
        bigint id PK
        bigint student_id FK
        date from_date
        date to_date
        text details
        text remarks
        string attachment_path
        string status
    }

    STUDENT_MOVEMENTS {
        bigint id PK
        bigint student_id FK
        string movement_type
        bigint from_school_id FK
        bigint to_school_id FK
        bigint from_section_id FK
        bigint to_section_id FK
        bigint from_session_id FK
        bigint to_session_id FK
        bigint reason_id FK
        date application_date
        date effective_date
        string status
    }

    HOMEWORK {
        bigint id PK
        bigint school_id FK
        bigint class_id FK
        bigint subject_id FK
        bigint created_by_employee_id FK
        smallint hw_type
        date assigned_date
        timestamptz due_at
        string topic
        text details_html
        string status
    }

    HOMEWORK_ATTACHMENTS {
        bigint id PK
        bigint homework_id FK
        string attachment_type
        string title
        string file_or_url
        int sort_order
    }

    HOMEWORK_COMMENTS {
        bigint id PK
        bigint homework_id FK
        bigint author_user_id FK
        text comment_text
        timestamptz created_at
    }

    HOMEWORK_SUBMISSIONS {
        bigint id PK
        bigint homework_id FK
        bigint student_id FK
        string file_path
        smallint stars
        text remarks
        boolean is_checked
        timestamptz submitted_at
    }

    WEEKLY_PLANS {
        bigint id PK
        bigint school_id FK
        bigint section_id FK
        string week_no
        date plan_date
        text comments
        string download_path
    }

    WEEKLY_PLAN_ITEMS {
        bigint id PK
        bigint weekly_plan_id FK
        bigint subject_id FK
        text details
    }

    DAILY_REPORTS {
        bigint id PK
        bigint student_id FK
        int report_month
        int report_year
        date from_date
        date to_date
        string file_name
        string download_path
    }

    PTM_REQUESTS {
        bigint id PK
        bigint student_id FK
        bigint guardian_id FK
        timestamptz scheduled_at
        text details
        string status
        timestamptz created_at
    }

    PTM_COMMENTS {
        bigint id PK
        bigint ptm_request_id FK
        string sender_type
        string sender_name
        text comments
        timestamptz sent_at
    }

    FEE_CATEGORIES {
        bigint id PK
        bigint tenant_id FK
        string title
        smallint fee_type
        boolean taxable
        bigint income_ledger_id FK
        int sort_order
        string status
    }

    FEE_STRUCTURES {
        bigint id PK
        bigint tenant_id FK
        date effective_date
        string status
    }

    FEE_STRUCTURE_ITEMS {
        bigint id PK
        bigint fee_structure_id FK
        bigint fee_category_id FK
        numeric amount
    }

    FEE_CONCESSIONS {
        bigint id PK
        bigint tenant_id FK
        string title
        text details
        string status
    }

    STUDENT_CONCESSIONS {
        bigint id PK
        bigint student_id FK
        bigint fee_concession_id FK
        date start_date
        date end_date
        string attachment_path
        text comments
    }

    STUDENT_FEES {
        bigint id PK
        string bill_no UK
        bigint student_id FK
        bigint school_id FK
        bigint session_id FK
        bigint section_id FK
        string fee_type
        int billing_month
        int billing_year
        int billing_period_months
        date issue_date
        date due_date
        numeric tax_rate
        numeric gross_amount
        numeric discount_amount
        numeric fine_amount
        numeric tax_amount
        numeric net_payable
        numeric paid_amount
        boolean is_paid
        date paid_date
        string payment_mode
        bigint bank_account_id FK
        string cheque_no
        bigint parent_fee_id FK
    }

    STUDENT_FEE_ITEMS {
        bigint id PK
        bigint student_fee_id FK
        bigint fee_category_id FK
        string custom_label
        boolean is_taxable
        numeric amount
        numeric concession_amount
    }

    ONLINE_PAYMENTS {
        uuid id PK
        bigint student_fee_id FK
        string gateway
        string session_token UK
        numeric amount
        string gateway_ref
        string status
        jsonb callback_payload
        timestamptz created_at
        timestamptz settled_at
    }

    BANK_API_LOGS {
        bigint id PK
        bigint bank_id FK
        string bill_no
        string action
        jsonb request_payload
        jsonb response_payload
        timestamptz logged_at
    }

    FINAL_SETTLEMENTS {
        bigint id PK
        bigint student_id FK
        bigint school_id FK
        numeric security_deposit
        numeric unpaid_fee
        numeric other_deductions
        numeric balance_amount
        string payment_mode
        bigint bank_account_id FK
        bigint cheque_book_id FK
        string cheque_no
        string receiver_name
        date settlement_date
        text comments
    }

    CLASS_TEACHERS {
        bigint id PK
        bigint school_id FK
        bigint session_id FK
        bigint section_id FK
        bigint employee_id FK
        date effective_date
    }

    CLASS_SUBJECT_TEACHERS {
        bigint id PK
        bigint school_id FK
        bigint session_id FK
        bigint section_id FK
        bigint student_id FK
        bigint subject_id FK
        bigint employee_id FK
        boolean is_lab_fee
        boolean is_additional_course
    }

    EXAMS {
        bigint id PK
        bigint session_id FK
        string title
        text details
        boolean marking_enabled
        boolean is_published
        int sort_order
        string status
    }

    EXAM_GRADES {
        bigint id PK
        bigint class_id FK
        string grade_label
        string remarks
        numeric min_percent
        numeric max_percent
    }

    EXAM_MARKS {
        bigint id PK
        bigint exam_id FK
        bigint student_id FK
        bigint subject_id FK
        numeric total_marks
        numeric obtained_marks
        boolean is_absent
    }

    TIMETABLE_PERIODS {
        bigint id PK
        bigint tenant_id FK
        string title
        string active_days_mask
        string status
    }

    TIMETABLE_SEASONS {
        bigint id PK
        bigint tenant_id FK
        string title
        string status
    }

    TIMETABLES {
        bigint id PK
        bigint school_id FK
        bigint session_id FK
        bigint section_id FK
        bigint season_id FK
        string title
        date effective_date
        boolean is_locked
        string status
    }

    TIMETABLE_SLOTS {
        bigint id PK
        bigint timetable_id FK
        smallint day_of_week
        int slot_index
        time start_time
        time end_time
        bigint subject_id FK
        bigint employee_id FK
    }

    ECALENDAR_EVENTS {
        bigint id PK
        bigint school_id FK
        bigint category_id FK
        bigint incharge_employee_id FK
        string title
        string venue
        numeric budget
        string priority
        timestamptz start_at
        timestamptz end_at
        string status
    }

    ECALENDAR_TASKS {
        bigint id PK
        bigint event_id FK
        bigint organizer_employee_id FK
        string title
        string status
        numeric budget
        timestamptz start_at
        timestamptz end_at
    }

    ECALENDAR_MEDIA {
        bigint id PK
        bigint event_id FK
        string media_type
        string title
        string file_or_url
        date media_date
    }

    DEPARTMENTS {
        bigint id PK
        bigint tenant_id FK
        string name
        bigint salary_ledger_id FK
        bigint eobi_ledger_id FK
        bigint pf_ledger_id FK
        bigint ss_ledger_id FK
        int sort_order
        string status
    }

    DESIGNATIONS {
        bigint id PK
        bigint department_id FK
        string title
        int sort_order
        string status
    }

    EMPLOYEES {
        bigint id PK
        bigint tenant_id FK
        string employee_code UK
        bigint school_id FK
        bigint group_id FK
        bigint department_id FK
        bigint designation_id FK
        string job_type
        string name
        string father_name
        string gender
        date dob
        string cnic_no
        string ntn
        boolean active_tax_payer
        string eobi_no
        string ss_no
        string attendance_id
        string thumb_code
        string mobile
        string email
        boolean is_teacher
        date joining_date
        string status
    }

    EMPLOYEE_EDUCATION {
        bigint id PK
        bigint employee_id FK
        string degree
        string institute
        int from_month
        int from_year
        int to_month
        int to_year
        text details
    }

    EMPLOYEE_EXPERIENCE {
        bigint id PK
        bigint employee_id FK
        string company
        string designation
        int from_month
        int from_year
        int to_month
        int to_year
        text details
    }

    EMPLOYEE_DOCUMENTS {
        bigint id PK
        bigint employee_id FK
        string title
        text details
        string file_path
    }

    EMPLOYEE_COMMENTS {
        bigint id PK
        bigint employee_id FK
        string title
        text comment_html
        date comment_date
        smallint nature
        bigint created_by FK
    }

    LESSON_PLANS {
        bigint id PK
        bigint employee_id FK
        int plan_month
        int plan_year
        date plan_date
        string file_name
        string download_path
    }

    TEACHER_APPRAISALS {
        bigint id PK
        bigint employee_id FK
        bigint session_id FK
        string period
        numeric total_score
        numeric obtained_score
        text comments
        string appraisal_pdf_path
    }

    HR_ROSTERS {
        bigint id PK
        bigint tenant_id FK
        string title
        string roster_type
        int late_minutes
        int absent_minutes
        int early_minutes
        date effective_date
        date from_date
        date to_date
        string status
    }

    HR_ROSTER_DAYS {
        bigint id PK
        bigint roster_id FK
        smallint day_of_week
        boolean is_working_day
        time time_in
        time time_out
    }

    EMPLOYEE_ATTENDANCE {
        bigint id PK
        bigint employee_id FK
        date attendance_date
        string status
        time time_in
        time time_out
        boolean is_late
        text remarks
    }

    LEAVE_TYPES {
        bigint id PK
        bigint tenant_id FK
        string title
        numeric weightage
        boolean merge_in_cl
        string gender_mask
        string marital_mask
        string job_type_mask
        int min_days
        int max_days
        string sandwich_policy
        boolean carry_forward
        boolean prorated
        string status
    }

    LEAVE_QUOTAS {
        bigint id PK
        bigint tenant_id FK
        date from_date
        date to_date
        string status
    }

    LEAVE_QUOTA_ITEMS {
        bigint id PK
        bigint leave_quota_id FK
        bigint leave_type_id FK
        bigint employee_id FK
        numeric allocated_days
    }

    EMPLOYEE_LEAVES {
        bigint id PK
        bigint employee_id FK
        bigint leave_type_id FK
        boolean is_paid
        date from_date
        date to_date
        text details
        text remarks
        string attachment_path
        string status
    }

    HOLIDAYS {
        bigint id PK
        bigint tenant_id FK
        bigint school_id FK
        string title
        date from_date
        date to_date
        string scope
    }

    SALARIES {
        bigint id PK
        bigint employee_id FK
        numeric gross_salary
        numeric fuel_allowance
        numeric mobile_allowance
        boolean eobi_applicable
        boolean ss_applicable
        boolean pf_applicable
        string payment_mode
        bigint bank_id FK
        string branch_code
        string account_no
        date effective_date
    }

    EMPLOYEE_LOANS {
        bigint id PK
        bigint employee_id FK
        string loan_type
        boolean refundable
        numeric amount
        numeric paid_amount
        date loan_date
        int installments
        string payment_mode
        bigint bank_account_id FK
        bigint cheque_book_id FK
        string cheque_no
    }

    LOAN_INSTALLMENTS {
        bigint id PK
        bigint loan_id FK
        int month
        int year
        numeric amount
        boolean is_paid
        date paid_date
    }

    BONUS_TYPES {
        bigint id PK
        bigint tenant_id FK
        string title
        int sort_order
        string status
    }

    EMPLOYEE_BONUSES {
        bigint id PK
        bigint employee_id FK
        bigint bonus_type_id FK
        int month
        int year
        string calc_mode
        numeric value
        numeric computed_amount
    }

    MONTHLY_ADJUSTMENTS {
        bigint id PK
        bigint employee_id FK
        int month
        int year
        numeric leaves_deduction
        numeric other_deductions
        numeric mobile_allowance
        numeric fuel_allowance
        numeric reimbursement
        text remarks
    }

    PAYROLL_RUNS {
        bigint id PK
        bigint employee_id FK
        bigint school_id FK
        bigint department_id FK
        bigint salary_id FK
        int payroll_month
        int payroll_year
        numeric gross_salary
        numeric basic_salary
        numeric medical_allowance
        numeric leave_deductions
        numeric other_deductions
        numeric bonus_amount
        numeric loan_emi_deducted
        numeric eobi_contribution
        numeric pf_contribution
        numeric ss_contribution
        numeric income_tax
        numeric additional_tax
        numeric payable_salary
        string payment_mode
        bigint source_bank_account_id FK
        date salary_date
        boolean is_posted
        boolean is_final_settlement
    }

    STATUTORY_SLABS {
        bigint id PK
        bigint tenant_id FK
        string statutory_type
        int month
        int year
        string fiscal_year
        numeric min_amount
        numeric max_amount
        numeric rate_percent
        numeric fixed_amount
        numeric employer_amount
        numeric surcharge_limit
        numeric surcharge_percent
    }

    CHART_OF_ACCOUNTS {
        bigint id PK
        bigint tenant_id FK
        bigint parent_id FK
        string account_code UK
        string title
        string level_type
        string nature
        numeric opening_debit
        numeric opening_credit
        numeric depreciation_percent
        bigint depreciation_ledger_id FK
        boolean is_cash
        boolean is_bank
        bigint bank_account_id FK
        string status
    }

    ACCOUNTS_SETTINGS {
        bigint id PK
        bigint tenant_id UK
        string company_name
        string currency_code
        bigint profit_loss_ledger_id FK
        bigint accum_depr_ledger_id FK
        bigint fixed_assets_ledger_id FK
        bigint depr_expense_ledger_id FK
        bigint fee_receivable_ledger_id FK
        bigint fee_tax_ledger_id FK
        bigint fine_ledger_id FK
        bigint reg_fee_ledger_id FK
        bigint admission_fee_ledger_id FK
        bigint security_deposit_ledger_id FK
        bigint bad_debts_ledger_id FK
        date billing_effective_date
        bigint salary_ledger_id FK
        bigint eobi_ledger_id FK
        bigint pf_ledger_id FK
        bigint ss_ledger_id FK
        bigint income_tax_ledger_id FK
        bigint mobile_allowance_ledger_id FK
        bigint fuel_allowance_ledger_id FK
        bigint bonus_ledger_id FK
        bigint loans_ledger_id FK
        date payroll_effective_date
    }

    VOUCHERS {
        bigint id PK
        bigint tenant_id FK
        string voucher_no UK
        string voucher_type
        bigint school_id FK
        date voucher_date
        string payment_mode
        string payee_name
        bigint cheque_book_id FK
        string cheque_no
        date cheque_date
        text details
        string status
    }

    VOUCHER_ENTRIES {
        bigint id PK
        bigint voucher_id FK
        bigint ledger_id FK
        numeric debit_amount
        numeric credit_amount
        string particular
    }

    CHEQUE_BOOKS {
        bigint id PK
        bigint bank_account_id FK
        string first_leaf
        string last_leaf
        string status
    }

    FINANCIAL_CLOSINGS {
        bigint id PK
        bigint tenant_id FK
        string financial_year UK
        bigint generated_by FK
        timestamptz generated_at
    }

    PETTY_CASH_CATEGORIES {
        bigint id PK
        bigint tenant_id FK
        bigint parent_id FK
        bigint ledger_id FK
        string name
        string tx_scope
        string status
    }

    PETTY_CASH_TRANSACTIONS {
        bigint id PK
        bigint school_id FK
        bigint category_id FK
        string tx_type
        date tx_date
        numeric amount
        string payment_mode
        bigint bank_account_id FK
        bigint cheque_book_id FK
        string cheque_no
        bigint employee_id FK
        bigint student_id FK
        string party_name
        text details
        string status
    }

    NOTICES {
        bigint id PK
        bigint tenant_id FK
        string audience
        string title
        text body_html
        date notice_date
        boolean send_push
        jsonb attachments
    }

    BLOG_POSTS {
        bigint id PK
        bigint tenant_id FK
        string title
        string category
        text summary_html
        text details_html
        jsonb pictures
        string video_url
        timestamptz published_at
    }

    BLOG_COMMENTS {
        bigint id PK
        bigint blog_post_id FK
        bigint portal_account_id FK
        text comments
        timestamptz created_at
    }

    LIBRARY_BOOKS {
        bigint id PK
        bigint tenant_id FK
        string book_code UK
        string title
        bigint category_id FK
        bigint publisher_id FK
        string rack_no
        string status
    }

    LIBRARY_COPIES {
        bigint id PK
        bigint book_id FK
        bigint school_id FK
        string barcode UK
        numeric price
        date arrival_date
        string condition
        string status
    }

    LIBRARY_CIRCULATION {
        bigint id PK
        bigint copy_id FK
        string tx_type
        string borrower_type
        bigint student_id FK
        bigint employee_id FK
        date tx_date
        date due_date
        date return_date
        numeric late_fine
        string payment_mode
        string return_status
    }

    INVENTORY_ITEMS {
        bigint id PK
        bigint tenant_id FK
        bigint category_id FK
        string name
        string code
        string status
    }

    INVENTORY_BATCHES {
        bigint id PK
        bigint item_id FK
        bigint school_id FK
        bigint section_id FK
        bigint supplier_id FK
        int quantity
        numeric unit_cost
        string po_no
        date purchase_date
        jsonb attribute_values
    }

    INVENTORY_UNITS {
        bigint id PK
        bigint batch_id FK
        bigint school_id FK
        bigint section_id FK
        bigint custodian_employee_id FK
        string asset_code UK
        string condition
        string status
    }

    ASSET_CUSTODY_LOGS {
        bigint id PK
        bigint unit_id FK
        string action_type
        bigint from_school_id FK
        bigint to_school_id FK
        bigint from_employee_id FK
        bigint to_employee_id FK
        string condition_before
        string condition_after
        date action_date
        text notes
    }

    %% Relationships
    TENANTS ||--o{ TENANT_FEATURE_FLAGS : "configures"
    TENANTS ||--|| SYSTEM_SETTINGS : "holds"
    TENANTS ||--o{ SMS_SERVICES : "owns"
    TENANTS ||--o{ EMAIL_TEMPLATES : "owns"
    TENANTS ||--o{ PAYMENT_METHODS : "enables"
    TENANTS ||--o{ BACKUPS : "stores"
    TENANTS ||--o{ USER_TYPES : "defines"
    TENANTS ||--o{ DATA_LOCKS : "locks"
    TENANTS ||--o{ SCHOOLS : "operates"
    TENANTS ||--o{ ACADEMIC_SESSIONS : "defines"

    USER_TYPES ||--o{ USER_TYPE_RIGHTS : "grants"
    USER_TYPES ||--o{ USERS : "assigns"
    USERS ||--o{ USER_RIGHTS : "overrides"
    USERS ||--o{ USER_SCHOOLS : "scopes"
    SCHOOLS ||--o{ USER_SCHOOLS : "accessed_by"
    USERS ||--o{ USER_LOGS : "audits"

    GUARDIANS ||--o{ STUDENT_GUARDIANS : "linked"
    STUDENTS ||--o{ STUDENT_GUARDIANS : "has_guardians"
    GUARDIANS ||--o{ PORTAL_ACCOUNTS : "authenticates"
    EMPLOYEES ||--o{ PORTAL_ACCOUNTS : "authenticates"
    PORTAL_ACCOUNTS ||--o{ PUSH_DEVICES : "registers"

    BANKS ||--o{ BANK_ACCOUNTS : "owns"
    BANK_ACCOUNTS ||--o{ CHEQUE_BOOKS : "issues"
    SCHOOLS o|--o{ BANK_ACCOUNTS : "defaults"
    CITIES ||--o{ TOWNS : "contains"
    CLASSES ||--o{ SECTIONS : "has"

    INQUIRY_STATUSES ||--o{ INQUIRIES : "classifies"
    INQUIRY_SOURCES ||--o{ INQUIRIES : "origins"
    INQUIRIES o|--o{ REGISTRATIONS : "converts"
    REGISTRATIONS o|--o| STUDENTS : "admits"
    SCHOOLS ||--o{ STUDENTS : "enrolls"
    ACADEMIC_SESSIONS ||--o{ STUDENTS : "active_in"
    SECTIONS ||--o{ STUDENTS : "places"

    STUDENTS ||--o{ STUDENT_DOCUMENTS : "stores"
    STUDENTS ||--o{ STUDENT_COMMENTS : "receives"
    STUDENTS ||--o{ STUDENT_PROFILE_REVISIONS : "requests"
    STUDENTS ||--o{ STUDENT_ATTENDANCE : "marks"
    STUDENTS ||--o{ STUDENT_LEAVES : "applies"
    STUDENTS ||--o{ STUDENT_MOVEMENTS : "transitions"
    STUDENTS ||--o{ DAILY_REPORTS : "generates"
    STUDENTS ||--o{ PTM_REQUESTS : "schedules"
    PTM_REQUESTS ||--o{ PTM_COMMENTS : "threads"

    SECTIONS ||--o{ WEEKLY_PLANS : "publishes"
    WEEKLY_PLANS ||--o{ WEEKLY_PLAN_ITEMS : "details"
    CLASSES ||--o{ HOMEWORK : "assigns"
    HOMEWORK ||--o{ HOMEWORK_ATTACHMENTS : "attaches"
    HOMEWORK ||--o{ HOMEWORK_COMMENTS : "discusses"
    HOMEWORK ||--o{ HOMEWORK_SUBMISSIONS : "collects"
    STUDENTS ||--o{ HOMEWORK_SUBMISSIONS : "submits"

    FEE_STRUCTURES ||--o{ FEE_STRUCTURE_ITEMS : "contains"
    FEE_CATEGORIES ||--o{ FEE_STRUCTURE_ITEMS : "prices"
    CHART_OF_ACCOUNTS ||--o{ FEE_CATEGORIES : "income_gl"
    FEE_CONCESSIONS ||--o{ STUDENT_CONCESSIONS : "templates"
    STUDENTS ||--o{ STUDENT_CONCESSIONS : "receives"
    STUDENTS ||--o{ STUDENT_FEES : "billed"
    STUDENT_FEES ||--o{ STUDENT_FEE_ITEMS : "lines"
    STUDENT_FEES ||--o{ ONLINE_PAYMENTS : "checkout"
    BANKS ||--o{ BANK_API_LOGS : "logs"
    STUDENTS ||--o{ FINAL_SETTLEMENTS : "clears"

    SECTIONS ||--o{ CLASS_TEACHERS : "homeroom"
    EMPLOYEES ||--o{ CLASS_TEACHERS : "leads"
    SECTIONS ||--o{ CLASS_SUBJECT_TEACHERS : "assigns"
    SUBJECTS ||--o{ CLASS_SUBJECT_TEACHERS : "taught"
    EMPLOYEES ||--o{ CLASS_SUBJECT_TEACHERS : "teaches"
    ACADEMIC_SESSIONS ||--o{ EXAMS : "schedules"
    CLASSES ||--o{ EXAM_GRADES : "scales"
    EXAMS ||--o{ EXAM_MARKS : "scores"
    STUDENTS ||--o{ EXAM_MARKS : "achieves"

    TIMETABLE_SEASONS ||--o{ TIMETABLES : "templates"
    SECTIONS ||--o{ TIMETABLES : "schedules"
    TIMETABLES ||--o{ TIMETABLE_SLOTS : "assigns"

    SCHOOLS ||--o{ ECALENDAR_EVENTS : "hosts"
    ECALENDAR_EVENTS ||--o{ ECALENDAR_TASKS : "tracks"
    ECALENDAR_EVENTS ||--o{ ECALENDAR_MEDIA : "archives"

    DEPARTMENTS ||--o{ DESIGNATIONS : "contains"
    DEPARTMENTS ||--o{ EMPLOYEES : "assigns"
    DESIGNATIONS ||--o{ EMPLOYEES : "ranks"
    SCHOOLS ||--o{ EMPLOYEES : "employs"
    EMPLOYEES ||--o{ EMPLOYEE_EDUCATION : "holds"
    EMPLOYEES ||--o{ EMPLOYEE_EXPERIENCE : "worked"
    EMPLOYEES ||--o{ EMPLOYEE_DOCUMENTS : "stores"
    EMPLOYEES ||--o{ EMPLOYEE_COMMENTS : "receives"
    EMPLOYEES ||--o{ LESSON_PLANS : "uploads"
    EMPLOYEES ||--o{ TEACHER_APPRAISALS : "evaluated"

    HR_ROSTERS ||--o{ HR_ROSTER_DAYS : "defines_shift"
    EMPLOYEES ||--o{ EMPLOYEE_ATTENDANCE : "clocks"
    LEAVE_TYPES ||--o{ EMPLOYEE_LEAVES : "classifies"
    EMPLOYEES ||--o{ EMPLOYEE_LEAVES : "takes"
    LEAVE_QUOTAS ||--o{ LEAVE_QUOTA_ITEMS : "allocates"
    LEAVE_TYPES ||--o{ LEAVE_QUOTA_ITEMS : "limits"
    EMPLOYEES ||--o{ LEAVE_QUOTA_ITEMS : "entitled"
    SCHOOLS o|--o{ HOLIDAYS : "observes"

    EMPLOYEES ||--o{ SALARIES : "earns"
    EMPLOYEES ||--o{ EMPLOYEE_LOANS : "borrows"
    EMPLOYEE_LOANS ||--o{ LOAN_INSTALLMENTS : "schedules"
    BONUS_TYPES ||--o{ EMPLOYEE_BONUSES : "categorizes"
    EMPLOYEES ||--o{ EMPLOYEE_BONUSES : "awarded"
    EMPLOYEES ||--o{ MONTHLY_ADJUSTMENTS : "adjusted"
    EMPLOYEES ||--o{ PAYROLL_RUNS : "paid"
    SALARIES ||--o{ PAYROLL_RUNS : "bases"

    CHART_OF_ACCOUNTS ||--o{ CHART_OF_ACCOUNTS : "hierarchy"
    CHART_OF_ACCOUNTS ||--o{ ACCOUNTS_SETTINGS : "control_ledgers"
    VOUCHERS ||--o{ VOUCHER_ENTRIES : "lines"
    CHART_OF_ACCOUNTS ||--o{ VOUCHER_ENTRIES : "posts"
    PETTY_CASH_CATEGORIES ||--o{ PETTY_CASH_TRANSACTIONS : "classifies"

    BLOG_POSTS ||--o{ BLOG_COMMENTS : "threads"
    LIBRARY_BOOKS ||--o{ LIBRARY_COPIES : "stocks"
    LIBRARY_COPIES ||--o{ LIBRARY_CIRCULATION : "circulates"
    INVENTORY_ITEMS ||--o{ INVENTORY_BATCHES : "received"
    INVENTORY_BATCHES ||--o{ INVENTORY_UNITS : "serialized"
    INVENTORY_UNITS ||--o{ ASSET_CUSTODY_LOGS : "tracks"
    EMPLOYEES o|--o{ INVENTORY_UNITS : "custodian"
```

---

## 3. PostgreSQL 17 Schema Organization & Key Index Strategy

| PostgreSQL Schema | Bounded Context / Module | Key Tables & Unique / Performance Indexes |
| :--- | :--- | :--- |
| `identity` | Auth, RBAC, Audit & Locks | `users(tenant_id, email)`, `user_types`, `user_type_rights(user_type_id, page_key)`, `portal_accounts(tenant_id, portal_type, username)`, `otp_codes(mobile_no, created_at)`, `data_locks(tenant_id, section_key)`, `user_logs(tenant_id, logged_at DESC)` BRIN/B-tree |
| `tenancy` | Tenant, Settings & Campus Masters | `tenants`, `tenant_feature_flags(tenant_id, feature_key)`, `system_settings`, `schools(tenant_id, code)`, `classes`, `sections(class_id, name)`, `academic_sessions`, `subjects`, `cities`, `towns(city_id, name)`, `banks`, `bank_accounts(account_no)` |
| `students` | Admissions, Profiles, Attendance, Revisions, Homework, PTM | `inquiries`, `registrations(registration_no)`, `students(registration_no)`, `guardians`, `student_guardians(student_id, guardian_id)`, `student_attendance(student_id, attendance_date, subject_id)`, `student_profile_revisions(status, student_id)`, `homework`, `homework_submissions`, `ptm_requests`, `weekly_plans`, `daily_reports` |
| `billing` | Concessions, Challans, Gateways, Bank API, Settlements | `fee_categories`, `fee_structures`, `fee_concessions`, `student_fees(bill_no)`, `student_fees(student_id, is_paid, due_date)`, `online_payments(session_token)`, `bank_api_logs(bill_no, logged_at DESC)`, `final_settlements` |
| `academics` | Exams, Grading, Timetable, eCalendar | `class_teachers`, `class_subject_teachers`, `exams`, `exam_marks(exam_id, student_id, subject_id)`, `timetables`, `timetable_slots(timetable_id, day_of_week, slot_index)`, `ecalendar_events`, `ecalendar_tasks`, `ecalendar_media` |
| `hr` | Staff 360, Attendance, Rosters, Leaves, Holidays | `employees(employee_code)`, `departments`, `designations`, `hr_rosters`, `employee_attendance(employee_id, attendance_date)`, `leave_types`, `leave_quotas`, `employee_leaves`, `holidays`, `lesson_plans`, `teacher_appraisals` |
| `payroll` | Statutory Slabs, Loans, Bonuses, Monthly Payroll | `statutory_slabs(statutory_type, fiscal_year, month, year)`, `salaries`, `employee_loans`, `loan_installments(loan_id, year, month)`, `employee_bonuses`, `monthly_adjustments`, `payroll_runs(employee_id, payroll_year, payroll_month)` |
| `accounting` | Chart of Accounts, Vouchers, Petty Cash, Financial Closings | `chart_of_accounts(tenant_id, account_code)`, `accounts_settings`, `vouchers(tenant_id, voucher_no)`, `voucher_entries(voucher_id, ledger_id)`, `cheque_books`, `financial_closings(tenant_id, financial_year)`, `petty_cash_categories`, `petty_cash_transactions` |
| `operations` | Library, Unified Inventory & Asset Custody, Comms | `library_books(book_code)`, `library_copies(barcode)`, `library_circulation`, `inventory_items`, `inventory_batches`, `inventory_units(asset_code)`, `asset_custody_logs`, `notices`, `blog_posts`, `blog_comments` |
