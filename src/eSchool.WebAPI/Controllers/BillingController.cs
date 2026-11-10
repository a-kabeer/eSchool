using eSchool.Infrastructure;
using eSchool.Modules.Billing;
using eSchool.WebAPI.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BillingController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<CounterHub> _counterHub;

    public BillingController(AppDbContext context, IHubContext<CounterHub> counterHub)
    {
        _context = context;
        _counterHub = counterHub;
    }

    [HttpGet("invoices")]
    public async Task<IActionResult> GetInvoices(
        [FromQuery] Guid? schoolId,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var effectiveSchoolId = schoolId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");

        var query = _context.FeeInvoices
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .Where(i => i.SchoolId == effectiveSchoolId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(i => i.Status == status);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(i => i.IssueDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                i.Id,
                i.InvoiceNumber,
                i.Barcode,
                i.StudentName,
                i.ClassSection,
                i.BillingMonth,
                i.IssueDate,
                i.DueDate,
                i.NetPayable,
                i.PaidAmount,
                i.Balance,
                i.Status
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("invoices/barcode/{barcode}")]
    public async Task<IActionResult> GetInvoiceByBarcode(string barcode)
    {
        var invoice = await _context.FeeInvoices
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Barcode == barcode || i.InvoiceNumber == barcode);

        if (invoice == null)
            return NotFound(new { message = $"Invoice with barcode '{barcode}' not found." });

        return Ok(new
        {
            invoice.Id,
            invoice.SchoolId,
            invoice.InvoiceNumber,
            invoice.Barcode,
            invoice.StudentId,
            invoice.StudentName,
            invoice.ClassSection,
            invoice.BillingMonth,
            invoice.IssueDate,
            invoice.DueDate,
            invoice.TotalFee,
            invoice.Arrears,
            invoice.Concession,
            invoice.LateSurcharge,
            invoice.NetPayable,
            invoice.PaidAmount,
            invoice.Balance,
            invoice.Status,
            Items = invoice.Items.Select(item => new { item.HeadName, item.Amount }),
            Payments = invoice.Payments.Select(p => new { p.ReceiptNumber, p.PaymentDate, p.AmountPaid, p.PaymentMethod })
        });
    }

    public record CollectPaymentRequest(
        Guid InvoiceId,
        decimal AmountPaid,
        string PaymentMethod,
        string ReceivedBy,
        string? ReferenceNumber
    );

    [HttpPost("payments")]
    public async Task<IActionResult> CollectPayment([FromBody] CollectPaymentRequest req)
    {
        var invoice = await _context.FeeInvoices
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == req.InvoiceId);

        if (invoice == null)
            return NotFound(new { message = "Invoice not found." });

        if (req.AmountPaid <= 0)
            return BadRequest(new { message = "Payment amount must be greater than zero." });

        var paymentCount = await _context.FeePayments.CountAsync(p => p.SchoolId == invoice.SchoolId);
        var receiptNumber = $"RCP-{DateTime.UtcNow:yyyyMM}-{1001 + paymentCount}";

        var payment = new FeePayment
        {
            Id = Guid.NewGuid(),
            SchoolId = invoice.SchoolId,
            FeeInvoiceId = invoice.Id,
            ReceiptNumber = receiptNumber,
            AmountPaid = req.AmountPaid,
            PaymentMethod = req.PaymentMethod,
            ReceivedBy = string.IsNullOrWhiteSpace(req.ReceivedBy) ? "Cashier Counter" : req.ReceivedBy,
            ReferenceNumber = req.ReferenceNumber,
            PaymentDate = DateTime.UtcNow
        };

        invoice.PaidAmount += req.AmountPaid;
        invoice.Status = invoice.PaidAmount >= invoice.NetPayable ? "PAID" : "PARTIAL";

        _context.FeePayments.Add(payment);
        await _context.SaveChangesAsync();

        // Broadcast real-time payment event via SignalR CounterHub
        await _counterHub.Clients.Group($"Counter_{invoice.SchoolId}").SendAsync("OnFeePaymentReceived", new
        {
            ReceiptNumber = payment.ReceiptNumber,
            InvoiceNumber = invoice.InvoiceNumber,
            StudentName = invoice.StudentName,
            AmountPaid = payment.AmountPaid,
            RemainingBalance = invoice.Balance,
            Status = invoice.Status,
            Timestamp = DateTime.UtcNow
        });

        return Ok(new
        {
            payment.Id,
            payment.ReceiptNumber,
            payment.AmountPaid,
            invoice.InvoiceNumber,
            invoice.PaidAmount,
            invoice.Balance,
            invoice.Status
        });
    }
}
