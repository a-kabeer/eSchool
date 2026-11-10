using eSchool.Infrastructure;
using eSchool.Modules.Operations;
using eSchool.SharedKernel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/v1/operations")]
public class OperationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IDataLockGuard? _dataLockGuard;

    public OperationsController(AppDbContext db, ITenantContext tenantContext, IDataLockGuard? dataLockGuard = null)
    {
        _db = db;
        _tenantContext = tenantContext;
        _dataLockGuard = dataLockGuard;
    }

    // =========================================================================
    // 1. LEAVE POLICY & SANDWICH RULE ENGINE
    // =========================================================================

    [HttpGet("leave-types")]
    public async Task<IActionResult> GetLeaveTypes()
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var types = await _db.LeaveTypes.Where(t => t.SchoolId == schoolId).ToListAsync();

        if (types.Count == 0)
        {
            types = SeedSampleLeaveTypes(schoolId);
            _db.LeaveTypes.AddRange(types);
            await _db.SaveChangesAsync();
        }

        return Ok(types);
    }

    public record ApplyLeaveRequest(
        Guid EmployeeId,
        string EmployeeName,
        string EmployeeCode,
        Guid LeaveTypeId,
        DateTime StartDate,
        DateTime EndDate,
        string Reason,
        decimal GrossSalary
    );

    [HttpPost("leaves/apply")]
    public async Task<IActionResult> ApplyLeave([FromBody] ApplyLeaveRequest req)
    {
        var schoolId = _tenantContext.CurrentSchoolId;

        if (_dataLockGuard != null)
        {
            await _dataLockGuard.EnsureUnlockedAsync(schoolId, "HR.LeaveApplications", req.StartDate);
        }

        var leaveType = await _db.LeaveTypes.FirstOrDefaultAsync(t => t.Id == req.LeaveTypeId && t.SchoolId == schoolId)
            ?? new LeaveType { Name = "Casual Leave", SandwichRule = "S", IsPaidLeave = false };

        var (sandwichDays, deduction) = StaffLeaveApplication.EvaluateSandwichAndDeductions(
            req.StartDate,
            req.EndDate,
            leaveType.SandwichRule,
            leaveType.IsPaidLeave,
            req.GrossSalary
        );

        var calendarDays = (int)(req.EndDate.Date - req.StartDate.Date).TotalDays + 1;

        var application = new StaffLeaveApplication
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            EmployeeId = req.EmployeeId,
            EmployeeName = req.EmployeeName,
            EmployeeCode = req.EmployeeCode,
            LeaveTypeId = req.LeaveTypeId,
            LeaveTypeName = leaveType.Name,
            StartDate = req.StartDate,
            EndDate = req.EndDate,
            CalendarDays = calendarDays,
            SandwichDaysApplied = sandwichDays,
            Reason = req.Reason,
            GrossSalary = req.GrossSalary,
            SalaryDeduction = deduction,
            Status = "Approved",
            ApprovedBy = "Principal & Senior Headmaster",
            ActionDate = DateTime.UtcNow
        };

        _db.StaffLeaveApplications.Add(application);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"Leave applied. {calendarDays} calendar days + {sandwichDays} sandwich days = {application.TotalDeductedDays} billable days. Deduction: PKR {deduction:N2}.",
            application
        });
    }

    [HttpGet("leaves")]
    public async Task<IActionResult> GetStaffLeaves()
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var leaves = await _db.StaffLeaveApplications
            .Where(l => l.SchoolId == schoolId)
            .OrderByDescending(l => l.StartDate)
            .ToListAsync();

        return Ok(leaves);
    }

    // =========================================================================
    // 2. BARCODED LIBRARY CIRCULATION (CAT-BOOK-COPY)
    // =========================================================================

    [HttpGet("library/books")]
    public async Task<IActionResult> GetLibraryBooks([FromQuery] string? search)
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var query = _db.LibraryBooks.Include(b => b.Copies).Where(b => b.SchoolId == schoolId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(b => b.Title.Contains(search) || b.Author.Contains(search) || b.BookCode.Contains(search));
        }

        var books = await query.ToListAsync();
        if (books.Count == 0 && string.IsNullOrEmpty(search))
        {
            books = SeedSampleLibrary(schoolId);
            _db.LibraryBooks.AddRange(books);
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            total = books.Count,
            items = books.Select(b => new
            {
                b.Id,
                b.BookCode,
                b.Title,
                b.Author,
                b.Category,
                b.TotalCopies,
                b.AvailableCopies,
                copies = b.Copies.Select(c => new
                {
                    c.Barcode,
                    c.CopyNumber,
                    c.Condition,
                    c.IsIssued
                })
            })
        });
    }

    public record IssueBookRequest(
        string CopyBarcode,
        string BorrowerType, // Student or Staff
        string BorrowerName,
        string BorrowerIdentifier,
        int DueDays = 14
    );

    [HttpPost("library/issue")]
    public async Task<IActionResult> IssueBook([FromBody] IssueBookRequest req)
    {
        var schoolId = _tenantContext.CurrentSchoolId;

        if (_dataLockGuard != null)
        {
            await _dataLockGuard.EnsureUnlockedAsync(schoolId, "Library.Circulation", DateTime.UtcNow);
        }

        var copy = await _db.LibraryBookCopies
            .Include(c => c.LibraryBook)
            .FirstOrDefaultAsync(c => c.Barcode == req.CopyBarcode);

        if (copy == null) return NotFound(new { message = $"Book copy with barcode '{req.CopyBarcode}' not found." });
        if (copy.IsIssued) return BadRequest(new { message = $"Book copy '{req.CopyBarcode}' is already issued." });

        // Enforce max 2 books for students
        if (req.BorrowerType == "Student")
        {
            var activeIssues = await _db.LibraryCirculations
                .CountAsync(c => c.BorrowerIdentifier == req.BorrowerIdentifier && !c.IsReturned && c.SchoolId == schoolId);
            if (activeIssues >= 2)
            {
                return BadRequest(new { message = $"Borrowing limit reached: Student '{req.BorrowerName}' already has {activeIssues} books issued (Max allowed is 2)." });
            }
        }

        copy.IsIssued = true;
        if (copy.LibraryBook != null)
        {
            copy.LibraryBook.AvailableCopies = Math.Max(0, copy.LibraryBook.AvailableCopies - 1);
        }

        var circulation = new LibraryCirculation
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            CopyBarcode = copy.Barcode,
            BookTitle = copy.LibraryBook?.Title ?? "Library Book",
            BorrowerType = req.BorrowerType,
            BorrowerName = req.BorrowerName,
            BorrowerIdentifier = req.BorrowerIdentifier,
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(req.DueDays > 0 ? req.DueDays : 14),
            IsReturned = false
        };

        _db.LibraryCirculations.Add(circulation);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"Book '{circulation.BookTitle}' copy {copy.Barcode} successfully issued to {req.BorrowerName}. Due date: {circulation.DueDate:yyyy-MM-dd}.",
            circulation
        });
    }

    public record ReturnBookRequest(
        string CopyBarcode,
        DateTime? ReturnDate
    );

    [HttpPost("library/return")]
    public async Task<IActionResult> ReturnBook([FromBody] ReturnBookRequest req)
    {
        var schoolId = _tenantContext.CurrentSchoolId;

        var circulation = await _db.LibraryCirculations
            .FirstOrDefaultAsync(c => c.CopyBarcode == req.CopyBarcode && !c.IsReturned && c.SchoolId == schoolId);

        if (circulation == null)
            return NotFound(new { message = $"No active issue found for barcode '{req.CopyBarcode}'." });

        var returnDate = req.ReturnDate ?? DateTime.UtcNow;
        var fine = circulation.CalculateOverdueFine(returnDate);
        var overdueDays = Math.Max(0, (int)(returnDate.Date - circulation.DueDate.Date).TotalDays);

        circulation.IsReturned = true;
        circulation.ReturnDate = returnDate;
        circulation.OverdueDays = overdueDays;
        circulation.FineAmount = fine;

        var copy = await _db.LibraryBookCopies
            .Include(c => c.LibraryBook)
            .FirstOrDefaultAsync(c => c.Barcode == req.CopyBarcode);

        if (copy != null)
        {
            copy.IsIssued = false;
            if (copy.LibraryBook != null)
            {
                copy.LibraryBook.AvailableCopies = Math.Min(copy.LibraryBook.TotalCopies, copy.LibraryBook.AvailableCopies + 1);
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = fine > 0
                ? $"Book returned {overdueDays} days late. Overdue fine imposed: PKR {fine:N2} (Capped ceiling: PKR 500)."
                : "Book returned on time. No overdue fines incurred.",
            circulationId = circulation.Id,
            overdueDays,
            fineAmount = fine,
            returnDate
        });
    }

    [HttpGet("library/circulations")]
    public async Task<IActionResult> GetCirculations()
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var items = await _db.LibraryCirculations
            .Where(c => c.SchoolId == schoolId)
            .OrderByDescending(c => c.IssueDate)
            .ToListAsync();

        return Ok(items);
    }

    // =========================================================================
    // 3. UNIFIED SERIALIZED INVENTORY & ASSET CUSTODY
    // =========================================================================

    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventory()
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var items = await _db.InventoryUnits
            .Include(i => i.CustodyLogs)
            .Where(i => i.SchoolId == schoolId)
            .ToListAsync();

        if (items.Count == 0)
        {
            items = SeedSampleInventory(schoolId);
            _db.InventoryUnits.AddRange(items);
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            total = items.Count,
            items = items.Select(i => new
            {
                i.Id,
                i.AssetTag,
                i.ItemName,
                i.Category,
                i.SerialNumber,
                i.Location,
                i.PurchaseDate,
                i.PurchaseCost,
                i.Status,
                i.CurrentCustodian,
                custodyLogs = i.CustodyLogs.Select(c => new
                {
                    c.EmployeeName,
                    c.EmployeeCode,
                    c.IssuedDate,
                    c.ReturnedDate,
                    c.Remarks
                })
            })
        });
    }

    public record IssueCustodyRequest(
        Guid AssetId,
        string EmployeeName,
        string EmployeeCode,
        string Remarks
    );

    [HttpPost("inventory/custody-issue")]
    public async Task<IActionResult> IssueAssetCustody([FromBody] IssueCustodyRequest req)
    {
        var schoolId = _tenantContext.CurrentSchoolId;
        var asset = await _db.InventoryUnits.FirstOrDefaultAsync(i => i.Id == req.AssetId && i.SchoolId == schoolId);

        if (asset == null) return NotFound(new { message = "Asset not found." });
        if (asset.Status != "Available")
            return BadRequest(new { message = $"Asset '{asset.AssetTag}' is currently in state '{asset.Status}' and cannot be issued." });

        asset.Status = "Issued";
        asset.CurrentCustodian = $"{req.EmployeeName} ({req.EmployeeCode})";

        var log = new AssetCustodyLog
        {
            Id = Guid.NewGuid(),
            InventoryUnitId = asset.Id,
            EmployeeName = req.EmployeeName,
            EmployeeCode = req.EmployeeCode,
            IssuedDate = DateTime.UtcNow,
            Remarks = req.Remarks
        };

        _db.AssetCustodyLogs.Add(log);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"Asset {asset.AssetTag} ({asset.ItemName}) issued to {req.EmployeeName}.",
            asset
        });
    }

    private static List<LeaveType> SeedSampleLeaveTypes(Guid schoolId)
    {
        return new List<LeaveType>
        {
            new()
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                Name = "Casual Leave",
                Code = "CL",
                AnnualQuota = 10,
                SandwichRule = "S", // Weekend sandwich
                Weightage = 1.0m,
                IsPaidLeave = true,
                Description = "Short notice leave for personal emergencies; Friday-Monday spans trigger weekend sandwich."
            },
            new()
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                Name = "Medical / Sick Leave",
                Code = "ML",
                AnnualQuota = 10,
                SandwichRule = "N", // No sandwich
                Weightage = 1.0m,
                IsPaidLeave = true,
                Description = "Supported by medical certificate; excluded from sandwich penalties."
            },
            new()
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                Name = "Leave Without Pay (LWP)",
                Code = "LWP",
                AnnualQuota = 30,
                SandwichRule = "B", // Both weekend and holidays
                Weightage = 1.0m,
                IsPaidLeave = false,
                Description = "Unpaid leave with Gross/30 daily salary deduction divisor."
            }
        };
    }

    private static List<LibraryBook> SeedSampleLibrary(Guid schoolId)
    {
        var b1 = new LibraryBook
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            BookCode = "BK-ENG-0012",
            Title = "Oxford Progressive English Book 8",
            Author = "Rachel Redford",
            Isbn = "978-0199062345",
            Category = "English Literature",
            Publisher = "Oxford University Press",
            Edition = 3,
            TotalCopies = 3,
            AvailableCopies = 2
        };

        b1.Copies.Add(new LibraryBookCopy
        {
            Id = Guid.NewGuid(),
            LibraryBookId = b1.Id,
            Barcode = "CAT-ENG-0012-01",
            CopyNumber = 1,
            Condition = "Good",
            IsIssued = true
        });
        b1.Copies.Add(new LibraryBookCopy
        {
            Id = Guid.NewGuid(),
            LibraryBookId = b1.Id,
            Barcode = "CAT-ENG-0012-02",
            CopyNumber = 2,
            Condition = "Good",
            IsIssued = false
        });
        b1.Copies.Add(new LibraryBookCopy
        {
            Id = Guid.NewGuid(),
            LibraryBookId = b1.Id,
            Barcode = "CAT-ENG-0012-03",
            CopyNumber = 3,
            Condition = "New",
            IsIssued = false
        });

        var b2 = new LibraryBook
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            BookCode = "BK-PHY-0045",
            Title = "Physics for Matriculation & O-Levels",
            Author = "Dr. M. Akram",
            Isbn = "978-9694941123",
            Category = "Physics Lab",
            Publisher = "Punjab Textbook Board",
            Edition = 2,
            TotalCopies = 2,
            AvailableCopies = 2
        };

        b2.Copies.Add(new LibraryBookCopy
        {
            Id = Guid.NewGuid(),
            LibraryBookId = b2.Id,
            Barcode = "CAT-PHY-0045-01",
            CopyNumber = 1,
            Condition = "Good",
            IsIssued = false
        });
        b2.Copies.Add(new LibraryBookCopy
        {
            Id = Guid.NewGuid(),
            LibraryBookId = b2.Id,
            Barcode = "CAT-PHY-0045-02",
            CopyNumber = 2,
            Condition = "Good",
            IsIssued = false
        });

        return new List<LibraryBook> { b1, b2 };
    }

    private static List<InventoryUnit> SeedSampleInventory(Guid schoolId)
    {
        var item1 = new InventoryUnit
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            AssetTag = "AST-LAB-2026-0042",
            ItemName = "Dell OptiPlex 7090 Desktop Core i7 16GB",
            Category = "IT Equipment",
            SerialNumber = "SN-DLL-881920",
            Location = "Computer Lab 1",
            PurchaseDate = new DateTime(2025, 8, 15),
            PurchaseCost = 145000,
            Status = "Issued",
            CurrentCustodian = "Prof. Tariq Mehmood (EMP-1001)"
        };

        item1.CustodyLogs.Add(new AssetCustodyLog
        {
            Id = Guid.NewGuid(),
            InventoryUnitId = item1.Id,
            EmployeeName = "Prof. Tariq Mehmood",
            EmployeeCode = "EMP-1001",
            IssuedDate = new DateTime(2025, 8, 16),
            Remarks = "Assigned for Senior Physics Lab Simulation Station"
        });

        var item2 = new InventoryUnit
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            AssetTag = "AST-LAB-2026-0043",
            ItemName = "Binocular Biological Compound Microscope 1000x",
            Category = "Physics Lab",
            SerialNumber = "SN-MIC-44211",
            Location = "Biology Senior Lab",
            PurchaseDate = new DateTime(2025, 9, 1),
            PurchaseCost = 65000,
            Status = "Available"
        };

        return new List<InventoryUnit> { item1, item2 };
    }
}
