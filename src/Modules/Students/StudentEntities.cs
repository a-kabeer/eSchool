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
    public string Status { get; set; } = "Active"; // Active, Active (Defaulter), Withdrawn, Graduated

    // Legacy flat guardians (backwards compatibility)
    public ICollection<StudentGuardian> Guardians { get; set; } = new List<StudentGuardian>();

    // Normalized Multi-Child Guardians
    public ICollection<StudentGuardianLink> GuardianLinks { get; set; } = new List<StudentGuardianLink>();

    public ICollection<StudentEnrollment> Enrollments { get; set; } = new List<StudentEnrollment>();
    public ICollection<StudentDisciplineComment> Comments { get; set; } = new List<StudentDisciplineComment>();
    public ICollection<StudentLeave> Leaves { get; set; } = new List<StudentLeave>();
}

public class Guardian : AuditableTenantEntity
{
    public string FullName { get; set; } = string.Empty;
    public string GuardianType { get; set; } = "Father"; // Father, Mother, Guardian
    public string Cnic { get; set; } = string.Empty; // 35201-XXXXXXX-X
    public string MobileNumber { get; set; } = string.Empty; // +92-300-XXXXXXX
    public string? Email { get; set; }
    public string? Occupation { get; set; }
    public string? Qualification { get; set; }
    public string? Company { get; set; }
    public string? Designation { get; set; }
    public string? Ntn { get; set; }
    public string Address { get; set; } = string.Empty;
    public bool IsAlive { get; set; } = true;

    public ICollection<StudentGuardianLink> StudentLinks { get; set; } = new List<StudentGuardianLink>();
}

public class StudentGuardianLink : BaseEntity
{
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public Guid GuardianId { get; set; }
    public Guardian? Guardian { get; set; }
    public string Relationship { get; set; } = "Father";
    public bool IsPrimaryContact { get; set; } = true;
    public bool IsEmergencyContact { get; set; } = true;
    public bool IsFeePayer { get; set; } = true;
}

public class StudentGuardian : AuditableTenantEntity
{
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Relationship { get; set; } = "Father";
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

public class StudentInquiry : AuditableTenantEntity
{
    public string InquiryNumber { get; set; } = string.Empty; // e.g. "INQ-2026-001"
    public string CandidateName { get; set; } = string.Empty;
    public string FatherName { get; set; } = string.Empty;
    public string FatherMobile { get; set; } = string.Empty;
    public string TargetGrade { get; set; } = "Grade 8";
    public DateTime InquiryDate { get; set; } = DateTime.UtcNow;
    public string Source { get; set; } = "Walk-in"; // Walk-in, Social Media, Referral, Banner
    public string Status { get; set; } = "Open"; // Open, FollowUp, Converted, Dropped
    public string? Remarks { get; set; }
}

public class StudentRegistration : AuditableTenantEntity
{
    public string RegistrationNumber { get; set; } = string.Empty; // e.g. "REG-2026-001"
    public Guid? InquiryId { get; set; }
    public StudentInquiry? Inquiry { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = "Male";
    public string BFormNo { get; set; } = string.Empty;
    public string FatherName { get; set; } = string.Empty;
    public string FatherCnic { get; set; } = string.Empty;
    public string FatherMobile { get; set; } = string.Empty;
    public string TargetGrade { get; set; } = "Grade 8";
    public decimal RegistrationFee { get; set; } = 2000;
    public bool IsFeePaid { get; set; } = true;
    public string Status { get; set; } = "New"; // New, Processing, Hold, Approved, Rejected
    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedJoiningDate { get; set; }
}

public class StudentDisciplineComment : AuditableTenantEntity
{
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public int Nature { get; set; } = 0; // -2 = Worst, -1 = Bad, 0 = Normal, 1 = Good, 2 = Excellent
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string AuthorRole { get; set; } = "Class Teacher";
    public DateTime CommentDate { get; set; } = DateTime.UtcNow;
}

public class StudentLeave : AuditableTenantEntity
{
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Approved"; // Pending, Approved, Rejected
    public string ApprovedBy { get; set; } = "Class Teacher";
}
