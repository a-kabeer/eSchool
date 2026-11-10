using eSchool.SharedKernel;

namespace eSchool.Modules.Operations;

public class LeaveType : AuditableTenantEntity
{
    public string Name { get; set; } = string.Empty; // e.g. "Casual Leave", "Sick / Medical Leave", "Earned Leave"
    public string Code { get; set; } = "CL"; // CL, ML, EL, LWP
    public int AnnualQuota { get; set; } = 10;
    public string SandwichRule { get; set; } = "N"; // "N" = Normal, "S" = Weekend Sandwich, "B" = Weekend & Public Holiday Sandwich
    public decimal Weightage { get; set; } = 1.0m; // 1.0 = Full day, 0.5 = Half day
    public bool CanMergeWithCasual { get; set; } = false;
    public bool IsPaidLeave { get; set; } = true;
    public string Description { get; set; } = string.Empty;
}

public class StaffLeaveApplication : AuditableTenantEntity
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public Guid LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = "Casual Leave";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int CalendarDays { get; set; } = 1;
    public int SandwichDaysApplied { get; set; } = 0;
    public decimal TotalDeductedDays => (CalendarDays + SandwichDaysApplied);
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public decimal GrossSalary { get; set; } = 65000;
    public decimal SalaryDeduction { get; set; } = 0; // Calculated via (Gross / 30) * BillableDays
    public string? ApprovedBy { get; set; }
    public DateTime? ActionDate { get; set; }

    public static (int sandwichDays, decimal deduction) EvaluateSandwichAndDeductions(
        DateTime start,
        DateTime end,
        string sandwichRule,
        bool isPaidLeave,
        decimal grossSalary)
    {
        var calendarDays = (int)(end.Date - start.Date).TotalDays + 1;
        var sandwichDays = 0;

        // If Friday through Monday: weekend (Saturday + Sunday) count as leaves under Sandwich Rule
        if (sandwichRule == "S" || sandwichRule == "B")
        {
            if (start.DayOfWeek == DayOfWeek.Friday && end.DayOfWeek == DayOfWeek.Monday)
            {
                sandwichDays = 2; // Saturday + Sunday
            }
            else if (start.DayOfWeek == DayOfWeek.Thursday && end.DayOfWeek == DayOfWeek.Monday)
            {
                sandwichDays = 2;
            }
        }

        var totalDays = calendarDays + sandwichDays;
        var dailyRate = grossSalary / 30.0m;
        var deduction = isPaidLeave ? 0 : Math.Round(totalDays * dailyRate, 2);

        return (sandwichDays, deduction);
    }
}

public class LibraryBook : AuditableTenantEntity
{
    public string BookCode { get; set; } = string.Empty; // e.g. "BK-ENG-0012"
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Isbn { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public string Publisher { get; set; } = "Oxford University Press";
    public int Edition { get; set; } = 1;
    public int TotalCopies { get; set; } = 1;
    public int AvailableCopies { get; set; } = 1;

    public ICollection<LibraryBookCopy> Copies { get; set; } = new List<LibraryBookCopy>();
}

public class LibraryBookCopy : BaseEntity
{
    public Guid LibraryBookId { get; set; }
    public LibraryBook? LibraryBook { get; set; }
    public string Barcode { get; set; } = string.Empty; // e.g. "CAT-ENG-0012-01"
    public int CopyNumber { get; set; } = 1;
    public string Condition { get; set; } = "Good"; // New, Good, Worn, Damaged
    public bool IsIssued { get; set; } = false;
}

public class LibraryCirculation : AuditableTenantEntity
{
    public string CopyBarcode { get; set; } = string.Empty; // "CAT-ENG-0012-01"
    public string BookTitle { get; set; } = string.Empty;
    public string BorrowerType { get; set; } = "Student"; // Student, Staff
    public string BorrowerName { get; set; } = string.Empty;
    public string BorrowerIdentifier { get; set; } = string.Empty; // Roll No or Emp Code
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(14);
    public DateTime? ReturnDate { get; set; }
    public int OverdueDays { get; set; } = 0;
    public decimal FineAmount { get; set; } = 0;
    public bool IsReturned { get; set; } = false;
    public decimal FinePerDay { get; set; } = 50;
    public decimal MaxFine { get; set; } = 500;

    public decimal CalculateOverdueFine(DateTime returnDate)
    {
        if (returnDate <= DueDate) return 0;
        var overdueDays = (int)(returnDate.Date - DueDate.Date).TotalDays;
        return Math.Min(overdueDays * FinePerDay, MaxFine);
    }
}

public class InventoryUnit : AuditableTenantEntity
{
    public string AssetTag { get; set; } = string.Empty; // e.g. "AST-LAB-2026-0042"
    public string ItemName { get; set; } = string.Empty;
    public string Category { get; set; } = "IT Equipment"; // IT Equipment, Physics Lab, Chemistry Lab, Furniture, Facilities
    public string SerialNumber { get; set; } = string.Empty;
    public string Location { get; set; } = "Computer Lab 1";
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
    public decimal PurchaseCost { get; set; }
    public string Status { get; set; } = "Available"; // Available, Issued, UnderMaintenance, Scrapped
    public string? CurrentCustodian { get; set; }

    public ICollection<AssetCustodyLog> CustodyLogs { get; set; } = new List<AssetCustodyLog>();
}

public class AssetCustodyLog : BaseEntity
{
    public Guid InventoryUnitId { get; set; }
    public InventoryUnit? InventoryUnit { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public DateTime IssuedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ReturnedDate { get; set; }
    public string Remarks { get; set; } = string.Empty;
}
