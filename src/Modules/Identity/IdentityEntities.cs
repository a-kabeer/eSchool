using eSchool.SharedKernel;

namespace eSchool.Modules.Identity;

public class School : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // e.g. LHE, ISB, KHI
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserSchoolAccess> UserAccess { get; set; } = new List<UserSchoolAccess>();
}

public class UserType : BaseEntity
{
    public string Title { get; set; } = string.Empty; // Super Administrator, Administrator, Acountant, etc.
    public string Status { get; set; } = "Active"; // Active, Inactive
    public bool IsSystem { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserTypePermission> Permissions { get; set; } = new List<UserTypePermission>();
    public ICollection<User> Users { get; set; } = new List<User>();
}

public class UserTypePermission : BaseEntity
{
    public Guid UserTypeId { get; set; }
    public UserType? UserType { get; set; }
    public string PageKey { get; set; } = string.Empty; // e.g. Students.Inquiries, Billing.FeeCounter
    public bool CanView { get; set; }
    public bool CanAdd { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanExport { get; set; }
}

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string UserType { get; set; } = "Super Admin"; // Legacy string title
    public Guid? RoleId { get; set; }
    public UserType? Role { get; set; }
    public bool IsActive { get; set; } = true;
    public bool TwoFactorEnabled { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserSchoolAccess> SchoolAccess { get; set; } = new List<UserSchoolAccess>();
    public ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
    public ICollection<UserOverrideRight> OverrideRights { get; set; } = new List<UserOverrideRight>();
    public ICollection<UserDashboardAccess> DashboardAccess { get; set; } = new List<UserDashboardAccess>();
    public ICollection<UserMiscRight> MiscRights { get; set; } = new List<UserMiscRight>();
    public ICollection<UserStudentTabAccess> StudentTabAccess { get; set; } = new List<UserStudentTabAccess>();
    public ICollection<UserEmployeeTabAccess> EmployeeTabAccess { get; set; } = new List<UserEmployeeTabAccess>();
}

public class UserOverrideRight : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string PageKey { get; set; } = string.Empty;
    public bool? CanView { get; set; }
    public bool? CanAdd { get; set; }
    public bool? CanEdit { get; set; }
    public bool? CanDelete { get; set; }
    public bool? CanExport { get; set; }
}

public class UserDashboardAccess : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string DashboardKey { get; set; } = string.Empty; // Main, Students, Billing, HR, Payroll, PettyCash
    public bool IsVisible { get; set; } = true;
}

public class UserMiscRight : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string RightKey { get; set; } = string.Empty; // RegistrationStatus, DueDateRevision, BulkFeeRevision, etc.
    public bool IsAllowed { get; set; }
}

public class UserStudentTabAccess : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string TabKey { get; set; } = string.Empty; // Profile, Siblings, Attendance, Leaves, Exams, Billing, Documents, Comments
    public bool IsVisible { get; set; } = true;
}

public class UserEmployeeTabAccess : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string TabKey { get; set; } = string.Empty; // Profile, Subjects, Education, Experience, Attendance, Leaves, Children, Salary, Documents, Comments
    public bool IsVisible { get; set; } = true;
}

public class UserSchoolAccess : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid SchoolId { get; set; }
    public School? School { get; set; }
    public bool IsDefault { get; set; }
}

public class UserPermission : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string ModuleName { get; set; } = string.Empty;
    public bool CanView { get; set; }
    public bool CanAdd { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanExport { get; set; }
}

public class DataLock : AuditableTenantEntity
{
    public string SectionKey { get; set; } = string.Empty; // e.g. Students.Inquiries, Billing.FeeCollection
    public string SectionName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime LockDate { get; set; }
}
