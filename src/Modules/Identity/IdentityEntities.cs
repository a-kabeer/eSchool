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

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string UserType { get; set; } = "Administrator"; // Super Admin, Administrator, Coordinator, Accountant, Teacher
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserSchoolAccess> SchoolAccess { get; set; } = new List<UserSchoolAccess>();
    public ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
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
    public string ModuleName { get; set; } = string.Empty; // Students, Fees, Accounts, Attendance, etc.
    public bool CanView { get; set; }
    public bool CanAdd { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanExport { get; set; }
}
