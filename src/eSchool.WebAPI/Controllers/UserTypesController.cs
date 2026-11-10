using eSchool.Infrastructure;
using eSchool.Modules.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/v1/management/user-types")]
public class UserTypesController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserTypesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("catalog")]
    public IActionResult GetPageCatalog()
    {
        return Ok(new
        {
            total = RbacCatalog.All152Pages.Count,
            pages = RbacCatalog.All152Pages
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllRoles()
    {
        var roles = await _db.UserTypes
            .Include(r => r.Permissions)
            .OrderBy(r => r.Title)
            .ToListAsync();

        // If no roles exist yet, seed the baseline 7 roles
        if (!roles.Any())
        {
            roles = SeedBaselineRoles();
            _db.UserTypes.AddRange(roles);
            await _db.SaveChangesAsync();
        }

        var result = roles.Select(r => new
        {
            r.Id,
            r.Title,
            r.Status,
            r.IsSystem,
            PermissionCount = r.Permissions.Count,
            ViewCount = r.Permissions.Count(p => p.CanView),
            AddCount = r.Permissions.Count(p => p.CanAdd),
            EditCount = r.Permissions.Count(p => p.CanEdit),
            DeleteCount = r.Permissions.Count(p => p.CanDelete),
            ExportCount = r.Permissions.Count(p => p.CanExport),
            r.CreatedAt
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoleById(Guid id)
    {
        var role = await _db.UserTypes
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
            return NotFound(new { message = $"UserType with ID {id} not found." });

        var permMap = role.Permissions.ToDictionary(p => p.PageKey);

        var allPagesWithPermissions = RbacCatalog.All152Pages.Select(page =>
        {
            if (permMap.TryGetValue(page.PageKey, out var p))
            {
                return new
                {
                    page.PageKey,
                    page.Module,
                    page.SubModule,
                    page.Title,
                    p.CanView,
                    p.CanAdd,
                    p.CanEdit,
                    p.CanDelete,
                    p.CanExport
                };
            }
            return new
            {
                page.PageKey,
                page.Module,
                page.SubModule,
                page.Title,
                CanView = false,
                CanAdd = false,
                CanEdit = false,
                CanDelete = false,
                CanExport = false
            };
        });

        return Ok(new
        {
            role.Id,
            role.Title,
            role.Status,
            role.IsSystem,
            permissions = allPagesWithPermissions
        });
    }

    [HttpPut("{id}/permissions")]
    public async Task<IActionResult> UpdateRolePermissions(Guid id, [FromBody] UpdateRolePermissionsDto dto)
    {
        var role = await _db.UserTypes
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
            return NotFound(new { message = $"UserType with ID {id} not found." });

        // Update permissions
        _db.UserTypePermissions.RemoveRange(role.Permissions);

        foreach (var p in dto.Permissions)
        {
            role.Permissions.Add(new UserTypePermission
            {
                UserTypeId = role.Id,
                PageKey = p.PageKey,
                CanView = p.CanView,
                CanAdd = p.CanAdd,
                CanEdit = p.CanEdit,
                CanDelete = p.CanDelete,
                CanExport = p.CanExport
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"Permissions updated successfully for role '{role.Title}'.",
            roleId = role.Id,
            updatedCount = dto.Permissions.Count
        });
    }

    private static List<UserType> SeedBaselineRoles()
    {
        var superAdmin = new UserType
        {
            Id = Guid.NewGuid(),
            Title = "Super Administrator",
            Status = "Active",
            IsSystem = true
        };
        // Super Admin gets VAEDX on all 152 pages
        foreach (var page in RbacCatalog.All152Pages)
        {
            superAdmin.Permissions.Add(new UserTypePermission
            {
                UserTypeId = superAdmin.Id,
                PageKey = page.PageKey,
                CanView = true,
                CanAdd = true,
                CanEdit = true,
                CanDelete = true,
                CanExport = true
            });
        }

        var administrator = new UserType
        {
            Id = Guid.NewGuid(),
            Title = "Administrator",
            Status = "Active",
            IsSystem = true
        };
        foreach (var page in RbacCatalog.All152Pages)
        {
            // Administrator gets all except high-level system config
            bool isRestricted = page.PageKey is "Management.Settings" or "Management.PaymentMethods" or "Management.EmailTemplates";
            administrator.Permissions.Add(new UserTypePermission
            {
                UserTypeId = administrator.Id,
                PageKey = page.PageKey,
                CanView = true,
                CanAdd = !isRestricted,
                CanEdit = !isRestricted,
                CanDelete = !isRestricted,
                CanExport = true
            });
        }

        var accountant = new UserType
        {
            Id = Guid.NewGuid(),
            Title = "Acountant",
            Status = "Active",
            IsSystem = false
        };
        foreach (var page in RbacCatalog.All152Pages)
        {
            bool isAccounting = page.Module is "Accounting" or "Billing" or "Petty Cash";
            if (isAccounting)
            {
                accountant.Permissions.Add(new UserTypePermission
                {
                    UserTypeId = accountant.Id,
                    PageKey = page.PageKey,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = page.PageKey != "Accounting.Settings",
                    CanExport = true
                });
            }
        }

        var examCoord = new UserType
        {
            Id = Guid.NewGuid(),
            Title = "Exam Coordinator",
            Status = "Active",
            IsSystem = false
        };
        foreach (var page in RbacCatalog.All152Pages)
        {
            if (page.Module is "Exams" or "Students")
            {
                examCoord.Permissions.Add(new UserTypePermission
                {
                    UserTypeId = examCoord.Id,
                    PageKey = page.PageKey,
                    CanView = true,
                    CanAdd = page.Module == "Exams",
                    CanEdit = page.Module == "Exams",
                    CanDelete = false,
                    CanExport = true
                });
            }
        }

        var teacher = new UserType
        {
            Id = Guid.NewGuid(),
            Title = "Teacher",
            Status = "Active",
            IsSystem = false
        };
        foreach (var page in RbacCatalog.All152Pages)
        {
            if (page.PageKey is "Students.Attendance" or "Students.Homework" or "Timetable.ClassTimetable" or "Timetable.TeacherTimetable" or "HR.LessonPlans")
            {
                teacher.Permissions.Add(new UserTypePermission
                {
                    UserTypeId = teacher.Id,
                    PageKey = page.PageKey,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanExport = false
                });
            }
        }

        return new List<UserType> { superAdmin, administrator, accountant, examCoord, teacher };
    }
}

public record PermissionInputDto(string PageKey, bool CanView, bool CanAdd, bool CanEdit, bool CanDelete, bool CanExport);
public record UpdateRolePermissionsDto(List<PermissionInputDto> Permissions);
