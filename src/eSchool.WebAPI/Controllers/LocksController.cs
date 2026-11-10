using eSchool.Infrastructure;
using eSchool.Modules.Identity;
using eSchool.SharedKernel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/v1/management/locks")]
public class LocksController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IDataLockGuard _dataLockGuard;

    public LocksController(AppDbContext db, ITenantContext tenantContext, IDataLockGuard dataLockGuard)
    {
        _db = db;
        _tenantContext = tenantContext;
        _dataLockGuard = dataLockGuard;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllLocks()
    {
        var schoolId = _tenantContext.CurrentSchoolId;

        var existingLocks = await _db.DataLocks
            .Where(l => l.SchoolId == schoolId)
            .ToDictionaryAsync(l => l.SectionKey);

        var result = new List<object>();

        // Ensure all 41 sections exist for this campus
        bool hasNew = false;
        foreach (var def in RbacCatalog.AllDataLocks)
        {
            if (existingLocks.TryGetValue(def.SectionKey, out var existing))
            {
                result.Add(new
                {
                    existing.Id,
                    existing.SectionKey,
                    existing.SectionName,
                    existing.Category,
                    def.Description,
                    existing.LockDate,
                    ModifiedBy = existing.UpdatedBy ?? existing.CreatedBy ?? "System",
                    ModifiedAt = existing.UpdatedAt ?? existing.CreatedAt
                });
            }
            else
            {
                // Default lock date set to 2024-06-30
                var newLock = new DataLock
                {
                    SchoolId = schoolId,
                    SectionKey = def.SectionKey,
                    SectionName = def.Title,
                    Category = def.Module,
                    LockDate = new DateTime(2024, 6, 30),
                    CreatedBy = "System",
                    UpdatedBy = "System",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.DataLocks.Add(newLock);
                hasNew = true;

                result.Add(new
                {
                    newLock.Id,
                    newLock.SectionKey,
                    newLock.SectionName,
                    newLock.Category,
                    def.Description,
                    newLock.LockDate,
                    ModifiedBy = "System",
                    ModifiedAt = DateTime.UtcNow
                });
            }
        }

        if (hasNew)
        {
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            total = result.Count,
            schoolId,
            locks = result
        });
    }

    [HttpPut("{sectionKey}")]
    public async Task<IActionResult> UpdateLockDate(string sectionKey, [FromBody] UpdateLockDto dto)
    {
        var schoolId = _tenantContext.CurrentSchoolId;

        var dataLock = await _db.DataLocks
            .FirstOrDefaultAsync(l => l.SchoolId == schoolId && l.SectionKey == sectionKey);

        if (dataLock == null)
        {
            var def = RbacCatalog.AllDataLocks.FirstOrDefault(d => d.SectionKey == sectionKey);
            dataLock = new DataLock
            {
                SchoolId = schoolId,
                SectionKey = sectionKey,
                SectionName = def?.Title ?? sectionKey,
                Category = def?.Module ?? "General",
                LockDate = dto.LockDate,
                CreatedBy = dto.ModifiedBy ?? "Admin",
                UpdatedBy = dto.ModifiedBy ?? "Admin",
                UpdatedAt = DateTime.UtcNow
            };
            _db.DataLocks.Add(dataLock);
        }
        else
        {
            dataLock.LockDate = dto.LockDate;
            dataLock.UpdatedBy = dto.ModifiedBy ?? "Admin";
            dataLock.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"Data lock updated for section '{sectionKey}' to {dto.LockDate:yyyy-MM-dd}",
            sectionKey,
            lockDate = dataLock.LockDate,
            modifiedBy = dataLock.UpdatedBy,
            modifiedAt = dataLock.UpdatedAt
        });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyLock([FromBody] VerifyLockDto dto)
    {
        var schoolId = _tenantContext.CurrentSchoolId;

        try
        {
            await _dataLockGuard.EnsureUnlockedAsync(schoolId, dto.SectionKey, dto.TransactionDate);
            return Ok(new
            {
                allowed = true,
                sectionKey = dto.SectionKey,
                transactionDate = dto.TransactionDate,
                message = "Transaction date is permitted (after the active lock cutoff)."
            });
        }
        catch (DataLockViolationException ex)
        {
            return StatusCode(422, new
            {
                allowed = false,
                code = "DATA_LOCK_VIOLATION",
                sectionKey = ex.SectionKey,
                lockDate = ex.LockDate,
                transactionDate = ex.TransactionDate,
                message = ex.Message
            });
        }
    }
}

public record UpdateLockDto(DateTime LockDate, string? ModifiedBy);
public record VerifyLockDto(string SectionKey, DateTime TransactionDate);
