using System.Security.Cryptography;
using System.Text;
using eSchool.Modules.Academics;
using eSchool.Modules.Accounting;
using eSchool.Modules.Billing;
using eSchool.Modules.Identity;
using eSchool.Modules.Students;
using Microsoft.EntityFrameworkCore;

namespace eSchool.Infrastructure;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Schools.AnyAsync())
            return; // Already seeded

        // 1. Seed Campuses
        var lahoreCampus = new School
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Lahore Main Campus",
            Code = "LHE-MAIN",
            Address = "Plot 42-A, Gulberg III, Lahore, Pakistan",
            PhoneNumber = "+92-42-35712345",
            Email = "lahore@eschool.com.pk",
            IsActive = true
        };

        var islamabadCampus = new School
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Islamabad Campus",
            Code = "ISB-SECT",
            Address = "Sector F-8/2, Islamabad, Pakistan",
            PhoneNumber = "+92-51-2856789",
            Email = "islamabad@eschool.com.pk",
            IsActive = true
        };

        var karachiCampus = new School
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Karachi Campus",
            Code = "KHI-CLIF",
            Address = "Block 4, Clifton, Karachi, Pakistan",
            PhoneNumber = "+92-21-35890123",
            Email = "karachi@eschool.com.pk",
            IsActive = true
        };

        context.Schools.AddRange(lahoreCampus, islamabadCampus, karachiCampus);

        // 2. Seed Super Admin User (Password: demo)
        var superAdmin = new User
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            Email = "demo@eschool.com.pk",
            PasswordHash = HashPassword("demo"),
            FullName = "eSchool System Administrator",
            PhoneNumber = "+92-300-1234567",
            UserType = "Super Admin",
            IsActive = true
        };

        context.Users.Add(superAdmin);

        context.UserSchoolAccess.AddRange(
            new UserSchoolAccess { UserId = superAdmin.Id, SchoolId = lahoreCampus.Id, IsDefault = true },
            new UserSchoolAccess { UserId = superAdmin.Id, SchoolId = islamabadCampus.Id, IsDefault = false },
            new UserSchoolAccess { UserId = superAdmin.Id, SchoolId = karachiCampus.Id, IsDefault = false }
        );

        // 3. Seed Academic Sessions & Classes
        var currentSession = new AcademicSession
        {
            Id = Guid.NewGuid(),
            SchoolId = lahoreCampus.Id,
            Name = "2024-2025",
            StartDate = new DateTime(2024, 8, 1),
            EndDate = new DateTime(2025, 6, 30),
            IsActive = true
        };
        context.AcademicSessions.Add(currentSession);

        var grade8 = new ClassLevel
        {
            Id = Guid.NewGuid(),
            SchoolId = lahoreCampus.Id,
            Name = "Grade 8",
            NumericLevel = 8
        };
        var sectionA = new Section
        {
            Id = Guid.NewGuid(),
            SchoolId = lahoreCampus.Id,
            ClassLevelId = grade8.Id,
            Name = "Section A",
            Capacity = 35
        };
        grade8.Sections.Add(sectionA);
        context.ClassLevels.Add(grade8);

        // 4. Seed Chart of Accounts
        context.AccountHeads.AddRange(
            new AccountHead { SchoolId = lahoreCampus.Id, AccountCode = "3010001", AccountName = "Cash in Hand", AccountType = "Asset", Level = 4, CurrentBalance = 150000 },
            new AccountHead { SchoolId = lahoreCampus.Id, AccountCode = "3010002", AccountName = "Bank Al-Habib Main Operating", AccountType = "Asset", Level = 4, CurrentBalance = 1850000 },
            new AccountHead { SchoolId = lahoreCampus.Id, AccountCode = "3020001", AccountName = "Accounts Receivable - Students", AccountType = "Asset", Level = 4, CurrentBalance = 450000 },
            new AccountHead { SchoolId = lahoreCampus.Id, AccountCode = "4010001", AccountName = "Monthly Tuition Fees", AccountType = "Income", Level = 4, CurrentBalance = 2400000 },
            new AccountHead { SchoolId = lahoreCampus.Id, AccountCode = "5010001", AccountName = "Teaching Staff Salaries", AccountType = "Expense", Level = 4, CurrentBalance = 1200000 },
            new AccountHead { SchoolId = lahoreCampus.Id, AccountCode = "5020002", AccountName = "Generator Fuel & Maintenance", AccountType = "Expense", Level = 4, CurrentBalance = 85000 }
        );

        // 5. Seed Students & Fee Invoices
        var student1 = new Student
        {
            Id = Guid.NewGuid(),
            SchoolId = lahoreCampus.Id,
            RegistrationNumber = "REG-2024-1084",
            FirstName = "Ali",
            LastName = "Khan",
            DateOfBirth = new DateTime(2011, 5, 14),
            Gender = "Male",
            BloodGroup = "B+",
            BFormOrCnic = "35201-1234567-1",
            Status = "Active"
        };
        student1.Guardians.Add(new StudentGuardian
        {
            SchoolId = lahoreCampus.Id,
            FullName = "Tariq Mahmood Khan",
            Relationship = "Father",
            Cnic = "35201-9876543-1",
            MobileNumber = "+92-300-8451234",
            Address = "House 18, Block G, Model Town, Lahore",
            IsPrimaryContact = true
        });
        student1.Enrollments.Add(new StudentEnrollment
        {
            SchoolId = lahoreCampus.Id,
            AcademicSessionId = currentSession.Id,
            ClassLevelId = grade8.Id,
            SectionId = sectionA.Id,
            RollNumber = "104",
            IsActive = true
        });

        var student2 = new Student
        {
            Id = Guid.NewGuid(),
            SchoolId = lahoreCampus.Id,
            RegistrationNumber = "REG-2024-1085",
            FirstName = "Fatima",
            LastName = "Zahra",
            DateOfBirth = new DateTime(2011, 9, 21),
            Gender = "Female",
            BloodGroup = "O+",
            BFormOrCnic = "35202-7654321-2",
            Status = "Active"
        };
        student2.Guardians.Add(new StudentGuardian
        {
            SchoolId = lahoreCampus.Id,
            FullName = "Muhammad Zahid",
            Relationship = "Father",
            Cnic = "35202-3456789-1",
            MobileNumber = "+92-321-4567890",
            Address = "Plaza 3, DHA Phase 5, Lahore",
            IsPrimaryContact = true
        });

        context.Students.AddRange(student1, student2);

        // Fee Invoices
        var invoice1 = new FeeInvoice
        {
            Id = Guid.NewGuid(),
            SchoolId = lahoreCampus.Id,
            InvoiceNumber = "INV-202411-1084",
            StudentId = student1.Id,
            StudentName = student1.FullName,
            ClassSection = "Grade 8 - Section A",
            BillingMonth = "2024-11",
            IssueDate = new DateTime(2024, 11, 1),
            DueDate = new DateTime(2024, 11, 15),
            TotalFee = 8500,
            Arrears = 0,
            Concession = 0,
            LateSurcharge = 500,
            NetPayable = 8500,
            PaidAmount = 0,
            Status = "UNPAID",
            Barcode = "202411084"
        };
        invoice1.Items.Add(new FeeInvoiceItem { HeadName = "Tuition Fee (Nov 2024)", Amount = 7500 });
        invoice1.Items.Add(new FeeInvoiceItem { HeadName = "Computer & Lab Fund", Amount = 1000 });

        var invoice2 = new FeeInvoice
        {
            Id = Guid.NewGuid(),
            SchoolId = lahoreCampus.Id,
            InvoiceNumber = "INV-202411-1085",
            StudentId = student2.Id,
            StudentName = student2.FullName,
            ClassSection = "Grade 8 - Section A",
            BillingMonth = "2024-11",
            IssueDate = new DateTime(2024, 11, 1),
            DueDate = new DateTime(2024, 11, 15),
            TotalFee = 8500,
            Arrears = 8500, // Oct arrears
            Concession = 1000, // Concession
            LateSurcharge = 500,
            NetPayable = 16000,
            PaidAmount = 0,
            Status = "UNPAID",
            Barcode = "202411085"
        };
        invoice2.Items.Add(new FeeInvoiceItem { HeadName = "Tuition Fee (Nov 2024)", Amount = 7500 });
        invoice2.Items.Add(new FeeInvoiceItem { HeadName = "Computer & Lab Fund", Amount = 1000 });
        invoice2.Items.Add(new FeeInvoiceItem { HeadName = "Arrears (Oct 2024)", Amount = 8500 });

        context.FeeInvoices.AddRange(invoice1, invoice2);

        await context.SaveChangesAsync();
    }

    public static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    public static bool VerifyPassword(string password, string hash)
    {
        var computed = HashPassword(password);
        return computed == hash;
    }
}
