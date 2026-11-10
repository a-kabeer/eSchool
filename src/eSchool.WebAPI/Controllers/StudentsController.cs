using eSchool.Infrastructure;
using eSchool.Modules.Students;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StudentsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetStudents(
        [FromQuery] Guid? schoolId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var effectiveSchoolId = schoolId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");

        var query = _context.Students
            .Include(s => s.Guardians)
            .Include(s => s.Enrollments)
            .Where(s => s.SchoolId == effectiveSchoolId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s =>
                s.FirstName.ToLower().Contains(term) ||
                s.LastName.ToLower().Contains(term) ||
                s.RegistrationNumber.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.Id,
                s.RegistrationNumber,
                Name = s.FullName,
                s.Gender,
                s.DateOfBirth,
                s.BloodGroup,
                s.BFormOrCnic,
                s.Status,
                GuardianName = s.Guardians.Where(g => g.IsPrimaryContact).Select(g => g.FullName).FirstOrDefault() ?? "-",
                GuardianPhone = s.Guardians.Where(g => g.IsPrimaryContact).Select(g => g.MobileNumber).FirstOrDefault() ?? "-"
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            total,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)total / pageSize)
        });
    }

    public record CreateStudentAdmissionRequest(
        Guid SchoolId,
        string FirstName,
        string LastName,
        DateTime DateOfBirth,
        string Gender,
        string? BloodGroup,
        string? BFormOrCnic,
        string GuardianName,
        string GuardianRelationship,
        string GuardianPhone,
        string GuardianAddress,
        Guid? ClassLevelId,
        Guid? SectionId
    );

    [HttpPost]
    public async Task<IActionResult> CreateStudent([FromBody] CreateStudentAdmissionRequest req)
    {
        var studentCount = await _context.Students.CountAsync(s => s.SchoolId == req.SchoolId);
        var regNo = $"REG-{DateTime.UtcNow.Year}-{1001 + studentCount}";

        var student = new Student
        {
            Id = Guid.NewGuid(),
            SchoolId = req.SchoolId,
            RegistrationNumber = regNo,
            FirstName = req.FirstName,
            LastName = req.LastName,
            DateOfBirth = req.DateOfBirth,
            Gender = req.Gender,
            BloodGroup = req.BloodGroup,
            BFormOrCnic = req.BFormOrCnic,
            Status = "Active",
            AdmissionDate = DateTime.UtcNow
        };

        student.Guardians.Add(new StudentGuardian
        {
            SchoolId = req.SchoolId,
            FullName = req.GuardianName,
            Relationship = req.GuardianRelationship,
            MobileNumber = req.GuardianPhone,
            Address = req.GuardianAddress,
            IsPrimaryContact = true
        });

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStudentById), new { id = student.Id }, new
        {
            student.Id,
            student.RegistrationNumber,
            Name = student.FullName,
            student.Status
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetStudentById(Guid id)
    {
        var student = await _context.Students
            .Include(s => s.Guardians)
            .Include(s => s.Enrollments)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (student == null) return NotFound();

        return Ok(student);
    }
}
