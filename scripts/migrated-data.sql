-- =============================================================================
-- eSchool Legacy MySQL -> PostgreSQL 16 Migration Script
-- Generated At: 2026-11-10T17:25:08.865455+00:00 UTC
-- Target Architecture: ASP.NET Core Modular Monolith + EF Core Multi-Tenant
-- =============================================================================
BEGIN TRANSACTION;
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_encoding = 'UTF8';

-- 1. Multi-Tenant Campuses (Schools)
INSERT INTO "Schools" ("Id", "Name", "Code", "Address", "Phone", "Email", "IsActive", "CreatedAtUtc")
VALUES ('11111111-1111-1111-1111-111111111111', 'eSchool Model Town Campus (Lahore)', 'LHR-01', 'Model Town Block C, Lahore', '042-35889901', 'lahore@eschool.edu.pk', true, NOW())
ON CONFLICT ("Id") DO UPDATE SET "Name" = EXCLUDED."Name", "Code" = EXCLUDED."Code";
INSERT INTO "Schools" ("Id", "Name", "Code", "Address", "Phone", "Email", "IsActive", "CreatedAtUtc")
VALUES ('22222222-2222-2222-2222-222222222222', 'eSchool F-8 Campus (Islamabad)', 'ISB-01', 'Sector F-8/4, Islamabad', '051-2287102', 'islamabad@eschool.edu.pk', true, NOW())
ON CONFLICT ("Id") DO UPDATE SET "Name" = EXCLUDED."Name", "Code" = EXCLUDED."Code";
INSERT INTO "Schools" ("Id", "Name", "Code", "Address", "Phone", "Email", "IsActive", "CreatedAtUtc")
VALUES ('33333333-3333-3333-3333-333333333333', 'eSchool Clifton Campus (Karachi)', 'KHI-01', 'Block 5, Clifton, Karachi', '021-35874411', 'karachi@eschool.edu.pk', true, NOW())
ON CONFLICT ("Id") DO UPDATE SET "Name" = EXCLUDED."Name", "Code" = EXCLUDED."Code";
-- 2. Students & Academic Enrollments
INSERT INTO "Students" (
    "Id", "SchoolId", "RegistrationNo", "RollNo", "FullName", "Gender", 
    "DateOfBirth", "BFormNo", "FatherName", "FatherCnic", "FatherMobile", 
    "Status", "EnrolledDateUtc", "CreatedAtUtc"
) VALUES (
    '8bc943c2-9842-5d86-92b8-1ba8be365e90', '11111111-1111-1111-1111-111111111111', '2024-LHR-001', '101', 'Muhammad Hamza Ali', 'Male', 
    '2012-05-15', '35202-8819201-1', 'Tariq Mehmood Ali', '35202-1456789-1', '+92-300-8451290', 
    'ACTIVE', '2024-08-01T00:00:00Z', NOW()
) ON CONFLICT ("Id") DO UPDATE SET "FullName" = EXCLUDED."FullName", "Status" = EXCLUDED."Status";
INSERT INTO "Students" (
    "Id", "SchoolId", "RegistrationNo", "RollNo", "FullName", "Gender", 
    "DateOfBirth", "BFormNo", "FatherName", "FatherCnic", "FatherMobile", 
    "Status", "EnrolledDateUtc", "CreatedAtUtc"
) VALUES (
    '6353133b-feac-5bd6-ac3f-ebc3946f3c2c', '11111111-1111-1111-1111-111111111111', '2024-LHR-002', '102', 'Ayesha Fatima', 'Female', 
    '2012-05-15', '35202-9928172-2', 'Dr. Farhan Qureshi', '35202-7718290-3', '+92-321-4567890', 
    'ACTIVE', '2024-08-01T00:00:00Z', NOW()
) ON CONFLICT ("Id") DO UPDATE SET "FullName" = EXCLUDED."FullName", "Status" = EXCLUDED."Status";
INSERT INTO "Students" (
    "Id", "SchoolId", "RegistrationNo", "RollNo", "FullName", "Gender", 
    "DateOfBirth", "BFormNo", "FatherName", "FatherCnic", "FatherMobile", 
    "Status", "EnrolledDateUtc", "CreatedAtUtc"
) VALUES (
    '383d8060-347e-57ca-a8ae-0e0db98db74d', '22222222-2222-2222-2222-222222222222', '2024-ISB-001', '201', 'Zainab Bibi', 'Female', 
    '2012-05-15', '61101-1234567-4', 'Col. Imran Khan', '61101-9988776-5', '+92-333-5566778', 
    'ACTIVE', '2024-08-01T00:00:00Z', NOW()
) ON CONFLICT ("Id") DO UPDATE SET "FullName" = EXCLUDED."FullName", "Status" = EXCLUDED."Status";
INSERT INTO "Students" (
    "Id", "SchoolId", "RegistrationNo", "RollNo", "FullName", "Gender", 
    "DateOfBirth", "BFormNo", "FatherName", "FatherCnic", "FatherMobile", 
    "Status", "EnrolledDateUtc", "CreatedAtUtc"
) VALUES (
    '63dd82f2-1cab-5605-bc94-70a7ca96ea69', '33333333-3333-3333-3333-333333333333', '2024-KHI-001', '301', 'Bilal Ahmed', 'Male', 
    '2012-05-15', '42101-4455667-1', 'Kamran Ahmed', '42101-2233445-7', '+92-301-2345678', 
    'ACTIVE', '2024-08-01T00:00:00Z', NOW()
) ON CONFLICT ("Id") DO UPDATE SET "FullName" = EXCLUDED."FullName", "Status" = EXCLUDED."Status";
-- 3. Billing Invoices (Fee Challans & Bank Vouchers)
INSERT INTO "FeeInvoices" (
    "Id", "SchoolId", "StudentId", "ChallanNo", "BillingMonth", "BillingYear",
    "IssueDate", "DueDate", "GrossAmount", "DiscountAmount", "LateFineAmount",
    "NetPayable", "PaidAmount", "Status", "CreatedAtUtc"
) VALUES (
    '2897e24f-8a8d-5a06-a469-6462f2e7b2df', '11111111-1111-1111-1111-111111111111', '8bc943c2-9842-5d86-92b8-1ba8be365e90', 'CHAL-202411084', 11, 2026,
    '2026-11-01', '2026-11-10', 14500.00, 1000.00, 500.00,
    13500.00, 13500.00, 'PAID', NOW()
) ON CONFLICT ("Id") DO UPDATE SET "PaidAmount" = EXCLUDED."PaidAmount", "Status" = EXCLUDED."Status";
INSERT INTO "FeeInvoices" (
    "Id", "SchoolId", "StudentId", "ChallanNo", "BillingMonth", "BillingYear",
    "IssueDate", "DueDate", "GrossAmount", "DiscountAmount", "LateFineAmount",
    "NetPayable", "PaidAmount", "Status", "CreatedAtUtc"
) VALUES (
    '10cb0361-595d-5b07-a417-a5cd6c28739c', '11111111-1111-1111-1111-111111111111', '6353133b-feac-5bd6-ac3f-ebc3946f3c2c', 'CHAL-202411085', 11, 2026,
    '2026-11-01', '2026-11-10', 15000.00, 0.00, 500.00,
    15000.00, 0.00, 'UNPAID', NOW()
) ON CONFLICT ("Id") DO UPDATE SET "PaidAmount" = EXCLUDED."PaidAmount", "Status" = EXCLUDED."Status";
INSERT INTO "FeeInvoices" (
    "Id", "SchoolId", "StudentId", "ChallanNo", "BillingMonth", "BillingYear",
    "IssueDate", "DueDate", "GrossAmount", "DiscountAmount", "LateFineAmount",
    "NetPayable", "PaidAmount", "Status", "CreatedAtUtc"
) VALUES (
    'ed13046a-cea1-5ba2-b2db-38f30a2dd629', '22222222-2222-2222-2222-222222222222', '383d8060-347e-57ca-a8ae-0e0db98db74d', 'CHAL-202411086', 11, 2026,
    '2026-11-01', '2026-11-10', 16000.00, 1500.00, 500.00,
    14500.00, 5000.00, 'PARTIAL', NOW()
) ON CONFLICT ("Id") DO UPDATE SET "PaidAmount" = EXCLUDED."PaidAmount", "Status" = EXCLUDED."Status";
-- 4. Double-Entry General Ledger Vouchers & Journal Entries
INSERT INTO "Vouchers" (
    "Id", "SchoolId", "VoucherNo", "VoucherType", "VoucherDate", "TotalAmount",
    "Narration", "IsPosted", "CreatedAtUtc"
) VALUES (
    'ad7e5b68-980a-5b05-8f74-7effbeab9818', '11111111-1111-1111-1111-111111111111', 'CRV-202611-001', 'CRV', '2026-11-08', 13500.00,
    'Fee collection via HBL cash counter for Challan #CHAL-202411084', true, NOW()
) ON CONFLICT ("Id") DO UPDATE SET "IsPosted" = true;
INSERT INTO "VoucherEntries" (
    "Id", "VoucherId", "AccountCode", "Debit", "Credit", "Particular"
) VALUES (
    '2b0f0432-3933-4409-968c-2b5a0b799438', 'ad7e5b68-980a-5b05-8f74-7effbeab9818', '100101', 13500.00, 0.00, 'HBL Collection Account'
);
INSERT INTO "VoucherEntries" (
    "Id", "VoucherId", "AccountCode", "Debit", "Credit", "Particular"
) VALUES (
    'b0981069-5898-4c09-8282-787a1cabd410', 'ad7e5b68-980a-5b05-8f74-7effbeab9818', '400101', 0.00, 13500.00, 'Tuition Fee Revenue'
);
INSERT INTO "Vouchers" (
    "Id", "SchoolId", "VoucherNo", "VoucherType", "VoucherDate", "TotalAmount",
    "Narration", "IsPosted", "CreatedAtUtc"
) VALUES (
    '9b2e7293-3a81-572a-bab1-b7e71378d16f', '11111111-1111-1111-1111-111111111111', 'BPV-202611-002', 'BPV', '2026-11-09', 201000.00,
    'Monthly Faculty Salary Disbursement November 2026', true, NOW()
) ON CONFLICT ("Id") DO UPDATE SET "IsPosted" = true;
INSERT INTO "VoucherEntries" (
    "Id", "VoucherId", "AccountCode", "Debit", "Credit", "Particular"
) VALUES (
    '2b78a057-82d0-42b6-9329-13f52415056c', '9b2e7293-3a81-572a-bab1-b7e71378d16f', '500101', 201000.00, 0.00, 'Teaching Staff Gross Salaries'
);
INSERT INTO "VoucherEntries" (
    "Id", "VoucherId", "AccountCode", "Debit", "Credit", "Particular"
) VALUES (
    'fe361c68-3bf8-46bc-ba5c-2f6efc8993c1', '9b2e7293-3a81-572a-bab1-b7e71378d16f', '200301', 0.00, 15550.00, 'FBR Withholding Tax Payable u/s 149'
);
INSERT INTO "VoucherEntries" (
    "Id", "VoucherId", "AccountCode", "Debit", "Credit", "Particular"
) VALUES (
    'f668f92f-f09c-4e1e-b3ce-c04da178ec51', '9b2e7293-3a81-572a-bab1-b7e71378d16f', '200302', 0.00, 1300.00, 'EOBI Employee Contribution Payable'
);
INSERT INTO "VoucherEntries" (
    "Id", "VoucherId", "AccountCode", "Debit", "Credit", "Particular"
) VALUES (
    'b904841d-3d27-4255-af46-6f00936440ca', '9b2e7293-3a81-572a-bab1-b7e71378d16f', '100102', 0.00, 184150.00, 'Bank Alfalah Operating Account'
);

COMMIT;
-- =============================================================================
-- Migration Complete. Validation Errors: 0
-- Statistics: {'students': 4, 'invoices': 3, 'vouchers': 2, 'ledger_entries': 6, 'attendance': 0}
-- =============================================================================