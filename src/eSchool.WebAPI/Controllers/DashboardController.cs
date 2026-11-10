using eSchool.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampusesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CampusesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetCampuses()
    {
        var campuses = await _context.Schools
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Code,
                s.Address,
                s.PhoneNumber,
                s.Email
            })
            .ToListAsync();

        return Ok(campuses);
    }
}

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context) => _context = context;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] Guid? schoolId)
    {
        var effectiveSchoolId = schoolId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");

        var totalStudents = await _context.Students
            .Where(s => s.SchoolId == effectiveSchoolId && s.Status == "Active")
            .CountAsync();

        var pendingInvoices = await _context.FeeInvoices
            .Where(i => i.SchoolId == effectiveSchoolId && i.Status != "PAID")
            .SumAsync(i => (decimal?)(i.NetPayable - i.PaidAmount)) ?? 0;

        var collectedThisMonth = await _context.FeePayments
            .Where(p => p.SchoolId == effectiveSchoolId)
            .SumAsync(p => (decimal?)p.AmountPaid) ?? 0;

        var totalVouchers = await _context.Vouchers
            .Where(v => v.SchoolId == effectiveSchoolId)
            .CountAsync();

        var recentStudents = await _context.Students
            .Where(s => s.SchoolId == effectiveSchoolId)
            .OrderByDescending(s => s.CreatedAt)
            .Take(5)
            .Select(s => new
            {
                s.Id,
                s.RegistrationNumber,
                Name = s.FullName,
                s.Gender,
                s.Status,
                s.AdmissionDate
            })
            .ToListAsync();

        return Ok(new
        {
            totalStudents,
            pendingFees = pendingInvoices,
            collectedThisMonth,
            totalVouchers,
            recentStudents
        });
    }
}
