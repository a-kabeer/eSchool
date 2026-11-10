using System.Threading.Channels;
using eSchool.Infrastructure;
using eSchool.Modules.Attendance;
using eSchool.WebAPI.Hubs;
using eSchool.Workers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<AttendanceHub> _attendanceHub;
    private readonly Channel<NotificationJob> _notifyChannel;

    public AttendanceController(
        AppDbContext context,
        IHubContext<AttendanceHub> attendanceHub,
        Channel<NotificationJob> notifyChannel)
    {
        _context = context;
        _attendanceHub = attendanceHub;
        _notifyChannel = notifyChannel;
    }

    [HttpGet("daily-register")]
    public async Task<IActionResult> GetDailyRegister([FromQuery] Guid? schoolId, [FromQuery] DateTime? date)
    {
        var effectiveSchoolId = schoolId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        var targetDate = (date ?? DateTime.UtcNow).Date;

        var students = await _context.Students
            .Where(s => s.SchoolId == effectiveSchoolId && s.Status == "Active")
            .OrderBy(s => s.FirstName)
            .Select(s => new
            {
                s.Id,
                s.RegistrationNumber,
                Name = s.FullName
            })
            .ToListAsync();

        var existingRecords = await _context.AttendanceRecords
            .Where(a => a.SchoolId == effectiveSchoolId && a.Date == targetDate)
            .ToDictionaryAsync(a => a.StudentId, a => a.Status);

        var list = students.Select(s => new
        {
            s.Id,
            s.RegistrationNumber,
            s.Name,
            Status = existingRecords.TryGetValue(s.Id, out var status) ? status : "Present"
        });

        return Ok(list);
    }

    public record MarkAttendanceItem(Guid StudentId, string StudentName, string Status, string? Remarks);
    public record MarkAttendanceRequest(Guid SchoolId, DateTime Date, List<MarkAttendanceItem> Items);

    [HttpPost("mark-daily")]
    public async Task<IActionResult> MarkDailyAttendance([FromBody] MarkAttendanceRequest req)
    {
        var targetDate = req.Date.Date;

        foreach (var item in req.Items)
        {
            var record = await _context.AttendanceRecords
                .FirstOrDefaultAsync(a => a.SchoolId == req.SchoolId && a.StudentId == item.StudentId && a.Date == targetDate);

            if (record == null)
            {
                record = new AttendanceRecord
                {
                    Id = Guid.NewGuid(),
                    SchoolId = req.SchoolId,
                    StudentId = item.StudentId,
                    StudentName = item.StudentName,
                    Date = targetDate,
                    Status = item.Status,
                    Remarks = item.Remarks
                };
                _context.AttendanceRecords.Add(record);
            }
            else
            {
                record.Status = item.Status;
                record.Remarks = item.Remarks;
            }

            // If absent, dispatch notification job
            if (item.Status == "Absent" && !record.SmsAlertDispatched)
            {
                var guardianPhone = await _context.StudentGuardians
                    .Where(g => g.StudentId == item.StudentId && g.IsPrimaryContact)
                    .Select(g => g.MobileNumber)
                    .FirstOrDefaultAsync() ?? "+92-300-0000000";

                await _notifyChannel.Writer.WriteAsync(new NotificationJob(
                    req.SchoolId,
                    guardianPhone,
                    "WhatsApp",
                    $"Dear Parent, {item.StudentName} has been marked ABSENT on {targetDate:dd-MMM-yyyy}."
                ));

                record.SmsAlertDispatched = true;
            }
        }

        await _context.SaveChangesAsync();

        // Broadcast real-time attendance update via SignalR
        await _attendanceHub.Clients.Group($"Attendance_{req.SchoolId}").SendAsync("OnAttendanceUpdated", new
        {
            Date = targetDate,
            TotalMarked = req.Items.Count,
            PresentCount = req.Items.Count(i => i.Status == "Present"),
            AbsentCount = req.Items.Count(i => i.Status == "Absent")
        });

        return Ok(new { message = "Attendance register updated and alerts queued successfully." });
    }
}
