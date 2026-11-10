using eSchool.SharedKernel;

namespace eSchool.Modules.Students;

public class Student : AuditableTenantEntity
{
    public string RegistrationNumber { get; set; } = string.Empty; // e.g. "REG-2024-1084"
    public DateTime AdmissionDate { get; set; } = DateTime.UtcNow;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = "Male";
    public string? BloodGroup { get; set; }
    public string? BFormOrCnic { get; set; }
    public string? Religion { get; set; }
    public string? Nationality { get; set; } = "Pakistani";
    public string? PhotoUrl { get; set; }
    public string Status { get; set; } = "Active"; // Active, Struck-Off, Graduated, Transferred

    public ICollection<StudentGuardian> Guardians { get; set; } = new List<StudentGuardian>();
    public ICollection<StudentEnrollment> Enrollments { get; set; } = new List<StudentEnrollment>();
}

public class StudentGuardian : AuditableTenantEntity
{
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Relationship { get; set; } = "Father"; // Father, Mother, Guardian
    public string? Cnic { get; set; }
    public string MobileNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Occupation { get; set; }
    public string Address { get; set; } = string.Empty;
    public bool IsPrimaryContact { get; set; } = true;
}

public class StudentEnrollment : AuditableTenantEntity
{
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public Guid AcademicSessionId { get; set; }
    public Guid ClassLevelId { get; set; }
    public Guid SectionId { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
