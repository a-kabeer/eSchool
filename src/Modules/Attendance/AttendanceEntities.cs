using eSchool.SharedKernel;

namespace eSchool.Modules.Attendance;

public class AttendanceRecord : AuditableTenantEntity
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string ClassSection { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;
    public string Status { get; set; } = "Present"; // Present, Absent, Leave, Late
    public string? Remarks { get; set; }
    public bool SmsAlertDispatched { get; set; }
}

public class StaffAttendanceRecord : AuditableTenantEntity
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;
    public TimeSpan? CheckInTime { get; set; }
    public TimeSpan? CheckOutTime { get; set; }
    public string Status { get; set; } = "Present"; // Present, Absent, Leave, Late
    public int LateMinutes { get; set; }
}
