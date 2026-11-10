using eSchool.Infrastructure;
using eSchool.Modules.Accounting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountingController : ControllerBase
{
    private readonly AppDbContext _context;

    public AccountingController(AppDbContext context) => _context = context;

    [HttpGet("chart-of-accounts")]
    public async Task<IActionResult> GetChartOfAccounts([FromQuery] Guid? schoolId)
    {
        var effectiveSchoolId = schoolId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");

        var accounts = await _context.AccountHeads
            .Where(a => a.SchoolId == effectiveSchoolId && a.IsActive)
            .OrderBy(a => a.AccountCode)
            .Select(a => new
            {
                a.Id,
                a.AccountCode,
                a.AccountName,
                a.AccountType,
                a.Level,
                a.ParentCode,
                a.CurrentBalance
            })
            .ToListAsync();

        return Ok(accounts);
    }

    [HttpGet("vouchers")]
    public async Task<IActionResult> GetVouchers(
        [FromQuery] Guid? schoolId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var effectiveSchoolId = schoolId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");

        var total = await _context.Vouchers.CountAsync(v => v.SchoolId == effectiveSchoolId);
        var items = await _context.Vouchers
            .Include(v => v.Entries)
            .ThenInclude(e => e.Account)
            .Where(v => v.SchoolId == effectiveSchoolId)
            .OrderByDescending(v => v.VoucherDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => new
            {
                v.Id,
                v.VoucherNumber,
                v.VoucherType,
                v.VoucherDate,
                v.TotalAmount,
                v.Narration,
                v.IsPosted,
                EntriesCount = v.Entries.Count
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    public record VoucherEntryDto(Guid AccountId, decimal Debit, decimal Credit, string? Narration);
    public record CreateVoucherRequest(
        Guid SchoolId,
        string VoucherType,
        DateTime VoucherDate,
        string Narration,
        string? ChequeNumber,
        List<VoucherEntryDto> Entries
    );

    [HttpPost("vouchers")]
    public async Task<IActionResult> PostVoucher([FromBody] CreateVoucherRequest req)
    {
        if (req.Entries == null || req.Entries.Count == 0)
            return BadRequest(new { message = "Voucher must contain at least one line entry." });

        var totalDebit = req.Entries.Sum(e => e.Debit);
        var totalCredit = req.Entries.Sum(e => e.Credit);

        // Strict Invariant: Sum(Debit) == Sum(Credit)
        if (totalDebit != totalCredit)
        {
            return BadRequest(new
            {
                message = $"Voucher is out of balance. Total Debit ({totalDebit}) must equal Total Credit ({totalCredit}). Discrepancy: {Math.Abs(totalDebit - totalCredit)}."
            });
        }

        var voucherCount = await _context.Vouchers.CountAsync(v => v.SchoolId == req.SchoolId);
        var voucherNumber = $"{req.VoucherType}-{DateTime.UtcNow:yyyy}-{1001 + voucherCount}";

        var voucher = new Voucher
        {
            Id = Guid.NewGuid(),
            SchoolId = req.SchoolId,
            VoucherNumber = voucherNumber,
            VoucherType = req.VoucherType,
            VoucherDate = req.VoucherDate,
            TotalAmount = totalDebit,
            Narration = req.Narration,
            ChequeNumber = req.ChequeNumber,
            IsPosted = true,
            PostedAt = DateTime.UtcNow
        };

        foreach (var entryDto in req.Entries)
        {
            voucher.Entries.Add(new VoucherEntry
            {
                Id = Guid.NewGuid(),
                AccountId = entryDto.AccountId,
                Debit = entryDto.Debit,
                Credit = entryDto.Credit,
                Narration = entryDto.Narration
            });

            // Update running account balance
            var account = await _context.AccountHeads.FindAsync(entryDto.AccountId);
            if (account != null)
            {
                if (account.AccountType is "Asset" or "Expense")
                    account.CurrentBalance += (entryDto.Debit - entryDto.Credit);
                else
                    account.CurrentBalance += (entryDto.Credit - entryDto.Debit);
            }
        }

        _context.Vouchers.Add(voucher);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            voucher.Id,
            voucher.VoucherNumber,
            voucher.TotalAmount,
            voucher.IsPosted,
            voucher.PostedAt
        });
    }
}
