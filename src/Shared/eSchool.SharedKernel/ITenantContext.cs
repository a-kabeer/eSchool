namespace eSchool.SharedKernel;

public interface ITenantContext
{
    Guid CurrentSchoolId { get; }
    IReadOnlyList<Guid> AccessibleSchoolIds { get; }
    bool IsSuperAdmin { get; }
    void SetTenant(Guid schoolId, IReadOnlyList<Guid> accessibleSchoolIds, bool isSuperAdmin);
}

public class TenantContext : ITenantContext
{
    public Guid CurrentSchoolId { get; private set; }
    public IReadOnlyList<Guid> AccessibleSchoolIds { get; private set; } = Array.Empty<Guid>();
    public bool IsSuperAdmin { get; private set; }

    public void SetTenant(Guid schoolId, IReadOnlyList<Guid> accessibleSchoolIds, bool isSuperAdmin)
    {
        CurrentSchoolId = schoolId;
        AccessibleSchoolIds = accessibleSchoolIds;
        IsSuperAdmin = isSuperAdmin;
    }
}
