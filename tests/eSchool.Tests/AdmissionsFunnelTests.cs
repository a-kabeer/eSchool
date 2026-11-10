using eSchool.Infrastructure;
using eSchool.Infrastructure.Services;
using eSchool.Modules.Identity;
using eSchool.Modules.Students;
using eSchool.SharedKernel;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace eSchool.Tests;

public class AdmissionsFunnelTests
{
    private (AppDbContext db, TestTenantContext tenant) CreateInMemoryDbContext(Guid? schoolId = null)
    {
        var targetSchoolId = schoolId ?? Guid.NewGuid();
        var tenant = new TestTenantContext { CurrentSchoolId = targetSchoolId };
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return (new AppDbContext(options, tenant), tenant);
    }

    [Fact]
    public async Task Converting_Inquiry_Creates_Candidate_Registration_And_Marks_Converted()
    {
        var schoolId = Guid.NewGuid();
        var (db, _) = CreateInMemoryDbContext(schoolId);
        using (db)
        {
            var inquiry = new StudentInquiry
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                InquiryNumber = "INQ-2026-0001",
                CandidateName = "Mustafa Ali",
                FatherName = "Tariq Ali",
                FatherMobile = "+92-300-1122334",
                TargetGrade = "Grade 8",
                InquiryDate = DateTime.UtcNow,
                Status = "Open"
            };
            db.StudentInquiries.Add(inquiry);
            await db.SaveChangesAsync();

            // Perform conversion logic
            var reg = new StudentRegistration
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                RegistrationNumber = "REG-2026-0001",
                InquiryId = inquiry.Id,
                CandidateName = inquiry.CandidateName,
                DateOfBirth = DateTime.UtcNow.AddYears(-13),
                Gender = "Male",
                BFormNo = "35201-9988112-1",
                FatherName = inquiry.FatherName,
                FatherCnic = "35201-1234567-3",
                FatherMobile = inquiry.FatherMobile,
                TargetGrade = inquiry.TargetGrade,
                RegistrationFee = 2500,
                IsFeePaid = true,
                Status = "New",
                RegistrationDate = DateTime.UtcNow
            };
            inquiry.Status = "Converted";
            db.StudentRegistrations.Add(reg);
            await db.SaveChangesAsync();

            var updatedInquiry = await db.StudentInquiries.FindAsync(inquiry.Id);
            var savedReg = await db.StudentRegistrations.FindAsync(reg.Id);

            Assert.NotNull(updatedInquiry);
            Assert.Equal("Converted", updatedInquiry.Status);
            Assert.NotNull(savedReg);
            Assert.Equal(inquiry.Id, savedReg.InquiryId);
            Assert.Equal("REG-2026-0001", savedReg.RegistrationNumber);
        }
    }

    [Fact]
    public async Task Approving_Registration_Creates_Student_Normalized_Guardian_And_Enrollment()
    {
        var schoolId = Guid.NewGuid();
        var (db, _) = CreateInMemoryDbContext(schoolId);
        using (db)
        {
            var reg = new StudentRegistration
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                RegistrationNumber = "REG-2026-0088",
                CandidateName = "Zainab Fatima",
                DateOfBirth = new DateTime(2013, 8, 25),
                Gender = "Female",
                BFormNo = "35201-7766554-2",
                FatherName = "Muhammad Usman",
                FatherCnic = "35201-3344556-7",
                FatherMobile = "+92-333-9876543",
                TargetGrade = "Grade 7",
                RegistrationFee = 2500,
                IsFeePaid = true,
                Status = "New",
                RegistrationDate = DateTime.UtcNow
            };
            db.StudentRegistrations.Add(reg);
            await db.SaveChangesAsync();

            // Approval & Enrollment Workflow
            var names = reg.CandidateName.Split(' ', 2);
            var student = new Student
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                RegistrationNumber = reg.RegistrationNumber,
                FirstName = names[0],
                LastName = names.Length > 1 ? names[1] : string.Empty,
                DateOfBirth = reg.DateOfBirth,
                Gender = reg.Gender,
                BFormOrCnic = reg.BFormNo,
                AdmissionDate = DateTime.UtcNow,
                Status = "Active"
            };
            db.Students.Add(student);

            // Normalized Guardian
            var guardian = new Guardian
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                FullName = reg.FatherName,
                GuardianType = "Father",
                Cnic = reg.FatherCnic,
                MobileNumber = reg.FatherMobile,
                Address = "House 55, Sector F, Islamabad"
            };
            db.Guardians.Add(guardian);

            // Guardian Link
            var link = new StudentGuardianLink
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                GuardianId = guardian.Id,
                Relationship = "Father",
                IsPrimaryContact = true,
                IsFeePayer = true
            };
            db.StudentGuardianLinks.Add(link);

            // Enrollment
            var enrollment = new StudentEnrollment
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                StudentId = student.Id,
                RollNumber = "0088",
                EnrollmentDate = DateTime.UtcNow,
                IsActive = true
            };
            db.StudentEnrollments.Add(enrollment);

            reg.Status = "Approved";
            await db.SaveChangesAsync();

            // Verification
            var enrolledStudent = await db.Students.FindAsync(student.Id);
            var savedGuardian = await db.Guardians.FirstOrDefaultAsync(g => g.Cnic == reg.FatherCnic);
            var savedLink = await db.StudentGuardianLinks.FirstOrDefaultAsync(l => l.StudentId == student.Id);
            var savedEnrollment = await db.StudentEnrollments.FirstOrDefaultAsync(e => e.StudentId == student.Id);

            Assert.NotNull(enrolledStudent);
            Assert.Equal("Zainab Fatima", enrolledStudent.FullName);
            Assert.Equal("35201-7766554-2", enrolledStudent.BFormOrCnic);
            Assert.NotNull(savedGuardian);
            Assert.NotNull(savedLink);
            Assert.Equal(guardian.Id, savedLink.GuardianId);
            Assert.NotNull(savedEnrollment);
            Assert.True(savedEnrollment.IsActive);
        }
    }

    [Fact]
    public async Task Inquiry_Or_Registration_Before_Data_Lock_Throws_Violation()
    {
        var schoolId = Guid.NewGuid();
        var (db, _) = CreateInMemoryDbContext(schoolId);
        using (db)
        {
            var guard = new DataLockGuard(db);

            db.DataLocks.Add(new DataLock
            {
                SchoolId = schoolId,
                SectionKey = "Students.Inquiries",
                SectionName = "Student Inquiries",
                Category = "Students",
                LockDate = new DateTime(2024, 6, 30),
                CreatedBy = "Admin"
            });
            await db.SaveChangesAsync();

            // Attempting transaction before lock date throws
            await Assert.ThrowsAsync<DataLockViolationException>(async () =>
            {
                await guard.EnsureUnlockedAsync(schoolId, "Students.Inquiries", new DateTime(2024, 4, 15));
            });

            // Attempting transaction after lock date succeeds
            await guard.EnsureUnlockedAsync(schoolId, "Students.Inquiries", new DateTime(2026, 11, 10));
        }
    }
}
