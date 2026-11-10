namespace eSchool.SharedKernel;

public class AuditLog : BaseEntity, IMultiTenantEntity
{
    public Guid SchoolId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Added, Modified, Deleted
    public string RecordId { get; set; } = string.Empty;
    public string? OldValues { get; set; } // JSON serialized
    public string? NewValues { get; set; } // JSON serialized
    public string? UserId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
