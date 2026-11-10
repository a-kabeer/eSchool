using eSchool.Infrastructure;
using eSchool.Modules.Students;
using eSchool.SharedKernel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/v1/admissions")]
public class AdmissionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IDataLockGuard _dataLockGuard;

    public AdmissionsController(AppDbContext db, ITenantContext tenantContext, IDataLockGuard dataLockGuard)
    {
        _db = db;
        _tenantContext = tenantContext;
        _dataLockGuard = dataLockGuard;
    }

    [HttpGet("inquiries")]
    public async Task<IActionResult> GetInquiries([FromQuery] string? status, [FromQuery] string? search)
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var query = _db.StudentInquiries.Where(i => i.SchoolId == schoolId);

        if (!string.IsNullOrEmpty(status) && status != "ALL")
        {
            query = query.Where(i => i.Status == status);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(i => i.CandidateName.Contains(search) ||
                                     i.FatherName.Contains(search) ||
                                     i.InquiryNumber.Contains(search) ||
                                     i.FatherMobile.Contains(search));
        }

        var items = await query.OrderByDescending(i => i.InquiryDate).ToListAsync();

        if (items.Count == 0 && string.IsNullOrEmpty(search))
        {
            items = SeedSampleInquiries(schoolId);
            _db.StudentInquiries.AddRange(items);
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            total = items.Count,
            items = items.Select(i => new
            {
                i.Id,
                i.InquiryNumber,
                i.CandidateName,
                i.FatherName,
                i.FatherMobile,
                i.TargetGrade,
                i.InquiryDate,
                i.Source,
                i.Status,
                i.Remarks
            })
        });
    }

    [HttpPost("inquiries")]
    public async Task<IActionResult> CreateInquiry([FromBody] CreateInquiryRequest request)
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var inquiryDate = request.InquiryDate ?? DateTime.UtcNow;

        // Data Lock Guard verification
        await _dataLockGuard.EnsureUnlockedAsync(schoolId, "Students.Inquiries", inquiryDate);

        var count = await _db.StudentInquiries.CountAsync(i => i.SchoolId == schoolId) + 1;
        var inqNo = $"INQ-{DateTime.UtcNow.Year}-{count:D4}";

        var inquiry = new StudentInquiry
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            InquiryNumber = inqNo,
            CandidateName = request.CandidateName,
            FatherName = request.FatherName,
            FatherMobile = request.FatherMobile,
            TargetGrade = request.TargetGrade,
            InquiryDate = inquiryDate,
            Source = request.Source ?? "Walk-in",
            Status = "Open",
            Remarks = request.Remarks,
            CreatedAt = DateTime.UtcNow
        };

        _db.StudentInquiries.Add(inquiry);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInquiries), new { id = inquiry.Id }, inquiry);
    }

    [HttpPut("inquiries/{id}/status")]
    public async Task<IActionResult> UpdateInquiryStatus(Guid id, [FromBody] UpdateInquiryStatusRequest request)
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var inquiry = await _db.StudentInquiries.FirstOrDefaultAsync(i => i.Id == id && i.SchoolId == schoolId);
        if (inquiry == null) return NotFound();

        inquiry.Status = request.Status;
        if (!string.IsNullOrEmpty(request.Remarks))
        {
            inquiry.Remarks = (inquiry.Remarks + " | " + request.Remarks).Trim();
        }
        await _db.SaveChangesAsync();

        return Ok(inquiry);
    }

    [HttpPost("inquiries/{id}/convert")]
    public async Task<IActionResult> ConvertInquiryToRegistration(Guid id)
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var inquiry = await _db.StudentInquiries.FirstOrDefaultAsync(i => i.Id == id && i.SchoolId == schoolId);
        if (inquiry == null) return NotFound();

        await _dataLockGuard.EnsureUnlockedAsync(schoolId, "Students.Registrations", DateTime.UtcNow);

        var regCount = await _db.StudentRegistrations.CountAsync(r => r.SchoolId == schoolId) + 1;
        var regNo = $"REG-{DateTime.UtcNow.Year}-{regCount:D4}";

        var reg = new StudentRegistration
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            RegistrationNumber = regNo,
            InquiryId = inquiry.Id,
            CandidateName = inquiry.CandidateName,
            DateOfBirth = DateTime.UtcNow.AddYears(-12),
            Gender = "Male",
            BFormNo = "35201-9988771-1",
            FatherName = inquiry.FatherName,
            FatherCnic = "35201-1122334-5",
            FatherMobile = inquiry.FatherMobile,
            TargetGrade = inquiry.TargetGrade,
            RegistrationFee = 2500,
            IsFeePaid = true,
            Status = "New",
            RegistrationDate = DateTime.UtcNow
        };

        inquiry.Status = "Converted";
        _db.StudentRegistrations.Add(reg);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"Inquiry {inquiry.InquiryNumber} successfully converted to Registration {regNo}.",
            registration = reg
        });
    }

    [HttpGet("registrations")]
    public async Task<IActionResult> GetRegistrations([FromQuery] string? status, [FromQuery] string? search)
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var query = _db.StudentRegistrations.Where(r => r.SchoolId == schoolId);

        if (!string.IsNullOrEmpty(status) && status != "ALL")
        {
            query = query.Where(r => r.Status == status);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(r => r.CandidateName.Contains(search) ||
                                     r.FatherName.Contains(search) ||
                                     r.RegistrationNumber.Contains(search) ||
                                     r.BFormNo.Contains(search));
        }

        var items = await query.OrderByDescending(r => r.RegistrationDate).ToListAsync();

        if (items.Count == 0 && string.IsNullOrEmpty(search))
        {
            items = SeedSampleRegistrations(schoolId);
            _db.StudentRegistrations.AddRange(items);
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            total = items.Count,
            items = items.Select(r => new
            {
                r.Id,
                r.RegistrationNumber,
                r.InquiryId,
                r.CandidateName,
                r.DateOfBirth,
                r.Gender,
                r.BFormNo,
                r.FatherName,
                r.FatherCnic,
                r.FatherMobile,
                r.TargetGrade,
                r.RegistrationFee,
                r.IsFeePaid,
                r.Status,
                r.RegistrationDate,
                r.ApprovedJoiningDate
            })
        });
    }

    [HttpPost("registrations")]
    public async Task<IActionResult> CreateRegistration([FromBody] CreateRegistrationRequest request)
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var regDate = request.RegistrationDate ?? DateTime.UtcNow;

        await _dataLockGuard.EnsureUnlockedAsync(schoolId, "Students.Registrations", regDate);

        var regCount = await _db.StudentRegistrations.CountAsync(r => r.SchoolId == schoolId) + 1;
        var regNo = $"REG-{DateTime.UtcNow.Year}-{regCount:D4}";

        var reg = new StudentRegistration
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            RegistrationNumber = regNo,
            CandidateName = request.CandidateName,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender ?? "Male",
            BFormNo = request.BFormNo,
            FatherName = request.FatherName,
            FatherCnic = request.FatherCnic,
            FatherMobile = request.FatherMobile,
            TargetGrade = request.TargetGrade,
            RegistrationFee = request.RegistrationFee > 0 ? request.RegistrationFee : 2500,
            IsFeePaid = request.IsFeePaid,
            Status = "New",
            RegistrationDate = regDate,
            CreatedAt = DateTime.UtcNow
        };

        _db.StudentRegistrations.Add(reg);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRegistrations), new { id = reg.Id }, reg);
    }

    [HttpPost("registrations/{id}/approve")]
    public async Task<IActionResult> ApproveAndEnroll(Guid id)
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var reg = await _db.StudentRegistrations.FirstOrDefaultAsync(r => r.Id == id && r.SchoolId == schoolId);
        if (reg == null) return NotFound();

        if (reg.Status == "Approved")
        {
            return BadRequest(new { message = "Registration has already been approved and enrolled." });
        }

        // Data Lock Check for Admissions
        await _dataLockGuard.EnsureUnlockedAsync(schoolId, "Students.Admissions", DateTime.UtcNow);

        // 1. Create Student
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
            Status = "Active",
            Nationality = "Pakistani",
            Religion = "Islam"
        };
        _db.Students.Add(student);

        // 2. Normalize Guardian
        var guardian = await _db.Guardians.FirstOrDefaultAsync(g => g.Cnic == reg.FatherCnic && g.SchoolId == schoolId);
        if (guardian == null)
        {
            guardian = new Guardian
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                FullName = reg.FatherName,
                GuardianType = "Father",
                Cnic = reg.FatherCnic,
                MobileNumber = reg.FatherMobile,
                Address = "House 12, Street 4, Phase 5 DHA, Lahore",
                IsAlive = true
            };
            _db.Guardians.Add(guardian);
        }

        // 3. Link Student to Guardian
        var link = new StudentGuardianLink
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            GuardianId = guardian.Id,
            Relationship = "Father",
            IsPrimaryContact = true,
            IsFeePayer = true,
            IsEmergencyContact = true
        };
        _db.StudentGuardianLinks.Add(link);

        // Also add backwards-compatible StudentGuardian
        _db.StudentGuardians.Add(new StudentGuardian
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            StudentId = student.Id,
            FullName = reg.FatherName,
            Relationship = "Father",
            Cnic = reg.FatherCnic,
            MobileNumber = reg.FatherMobile,
            Address = "House 12, Street 4, Phase 5 DHA, Lahore",
            IsPrimaryContact = true
        });

        // 4. Enroll Student
        var enrollment = new StudentEnrollment
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            StudentId = student.Id,
            AcademicSessionId = Guid.NewGuid(),
            ClassLevelId = Guid.NewGuid(),
            SectionId = Guid.NewGuid(),
            RollNumber = reg.RegistrationNumber.Replace("REG-", ""),
            EnrollmentDate = DateTime.UtcNow,
            IsActive = true
        };
        _db.StudentEnrollments.Add(enrollment);

        // 5. Update Registration status
        reg.Status = "Approved";
        reg.ApprovedJoiningDate = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"Candidate {reg.CandidateName} approved! Student {student.FullName} enrolled with ID {student.RegistrationNumber}.",
            studentId = student.Id,
            registrationNumber = student.RegistrationNumber
        });
    }

    private static List<StudentInquiry> SeedSampleInquiries(Guid schoolId)
    {
        return new List<StudentInquiry>
        {
            new()
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                InquiryNumber = "INQ-2026-0012",
                CandidateName = "Ali Raza Khan",
                FatherName = "Tahir Raza Khan",
                FatherMobile = "+92-301-8422119",
                TargetGrade = "Grade 8",
                InquiryDate = DateTime.UtcNow.AddDays(-3),
                Source = "Walk-in",
                Status = "Open",
                Remarks = "Interested in STEM curriculum & boarding facility."
            },
            new()
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                InquiryNumber = "INQ-2026-0013",
                CandidateName = "Fatima Noor",
                FatherName = "Noor Muhammad",
                FatherMobile = "+92-321-9876543",
                TargetGrade = "Grade 6",
                InquiryDate = DateTime.UtcNow.AddDays(-2),
                Source = "Social Media",
                Status = "FollowUp",
                Remarks = "Scheduled campus visit for Monday 10:00 AM."
            },
            new()
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                InquiryNumber = "INQ-2026-0014",
                CandidateName = "Hassan Tariq",
                FatherName = "Tariq Mahmood",
                FatherMobile = "+92-300-8451234",
                TargetGrade = "Grade 8",
                InquiryDate = DateTime.UtcNow.AddDays(-5),
                Source = "Referral",
                Status = "Converted",
                Remarks = "Older brother Hamza is already studying in Grade 8."
            }
        };
    }

    private static List<StudentRegistration> SeedSampleRegistrations(Guid schoolId)
    {
        return new List<StudentRegistration>
        {
            new()
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                RegistrationNumber = "REG-2026-0081",
                CandidateName = "Zaid Ahmed",
                DateOfBirth = new DateTime(2013, 3, 21),
                Gender = "Male",
                BFormNo = "35201-4433221-3",
                FatherName = "Ahmed Bilal",
                FatherCnic = "35201-1234567-9",
                FatherMobile = "+92-333-4567890",
                TargetGrade = "Grade 7",
                RegistrationFee = 2500,
                IsFeePaid = true,
                Status = "New",
                RegistrationDate = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                RegistrationNumber = "REG-2026-0082",
                CandidateName = "Ayesha Siddiqui",
                DateOfBirth = new DateTime(2014, 7, 10),
                Gender = "Female",
                BFormNo = "35201-5566778-2",
                FatherName = "Siddiq Akbar",
                FatherCnic = "35201-7654321-1",
                FatherMobile = "+92-302-1234567",
                TargetGrade = "Grade 5",
                RegistrationFee = 2500,
                IsFeePaid = true,
                Status = "Approved",
                RegistrationDate = DateTime.UtcNow.AddDays(-4),
                ApprovedJoiningDate = DateTime.UtcNow.AddDays(-2)
            }
        };
    }
}

public record CreateInquiryRequest(
    string CandidateName,
    string FatherName,
    string FatherMobile,
    string TargetGrade,
    string? Source,
    string? Remarks,
    DateTime? InquiryDate
);

public record UpdateInquiryStatusRequest(
    string Status,
    string? Remarks
);

public record CreateRegistrationRequest(
    string CandidateName,
    DateTime DateOfBirth,
    string? Gender,
    string BFormNo,
    string FatherName,
    string FatherCnic,
    string FatherMobile,
    string TargetGrade,
    decimal RegistrationFee,
    bool IsFeePaid,
    DateTime? RegistrationDate
);
