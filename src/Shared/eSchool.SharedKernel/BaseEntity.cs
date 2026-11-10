namespace eSchool.SharedKernel;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
}

public interface IMultiTenantEntity
{
    Guid SchoolId { get; set; }
}

public interface IAuditableEntity
{
    DateTime CreatedAt { get; set; }
    string? CreatedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
    string? UpdatedBy { get; set; }
}

public abstract class AuditableTenantEntity : BaseEntity, IMultiTenantEntity, IAuditableEntity
{
    public Guid SchoolId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
