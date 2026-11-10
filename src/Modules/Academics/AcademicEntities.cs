using eSchool.SharedKernel;

namespace eSchool.Modules.Academics;

public class AcademicSession : AuditableTenantEntity
{
    public string Name { get; set; } = string.Empty; // e.g. "2024-2025"
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}

public class ClassLevel : AuditableTenantEntity
{
    public string Name { get; set; } = string.Empty; // e.g. "Grade 8"
    public int NumericLevel { get; set; } // 8
    public ICollection<Section> Sections { get; set; } = new List<Section>();
}

public class Section : AuditableTenantEntity
{
    public Guid ClassLevelId { get; set; }
    public ClassLevel? ClassLevel { get; set; }
    public string Name { get; set; } = string.Empty; // e.g. "Section A"
    public int Capacity { get; set; } = 35;
}

public class Subject : AuditableTenantEntity
{
    public Guid ClassLevelId { get; set; }
    public ClassLevel? ClassLevel { get; set; }
    public string Name { get; set; } = string.Empty; // e.g. "Mathematics"
    public string Code { get; set; } = string.Empty; // e.g. "MATH-801"
    public decimal TotalMarks { get; set; } = 100;
    public decimal PassingMarks { get; set; } = 40;
}
