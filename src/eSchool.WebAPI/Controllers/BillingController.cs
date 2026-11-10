using eSchool.Infrastructure;
using eSchool.Modules.Billing;
using eSchool.SharedKernel;
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
    private readonly IDataLockGuard? _dataLockGuard;

    public BillingController(AppDbContext context, IHubContext<CounterHub> counterHub, IDataLockGuard? dataLockGuard = null)
    {
        _context = context;
        _counterHub = counterHub;
        _dataLockGuard = dataLockGuard;
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

    public record SplitInstallmentsRequest(
        int InstallmentsCount,
        string Mode, // "V" = New Vouchers, "I" = Next Bill
        List<DateTime>? DueDates
    );

    [HttpPost("invoices/{id}/split-installments")]
    public async Task<IActionResult> SplitInstallments(Guid id, [FromBody] SplitInstallmentsRequest req)
    {
        var invoice = await _context.FeeInvoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) return NotFound(new { message = "Invoice not found." });

        if (invoice.Balance <= 0)
            return BadRequest(new { message = "Invoice has no outstanding balance to split." });

        if (req.InstallmentsCount < 2 || req.InstallmentsCount > 6)
            return BadRequest(new { message = "Installment count must be between 2 and 6." });

        if (_dataLockGuard != null)
        {
            await _dataLockGuard.EnsureUnlockedAsync(invoice.SchoolId, "Billing.ChallanGeneration", DateTime.UtcNow);
        }

        var balance = invoice.Balance;
        var n = req.InstallmentsCount;
        var baseAmount = Math.Floor(balance / n);
        var remainder = balance - (baseAmount * n);

        var childInvoices = new List<FeeInvoice>();
        var dueDates = req.DueDates ?? Enumerable.Range(1, n)
            .Select(i => invoice.DueDate.AddMonths(i - 1))
            .ToList();

        for (int i = 1; i <= n; i++)
        {
            var installmentAmount = (i == 1) ? (baseAmount + remainder) : baseAmount;
            var childBarcode = $"{invoice.Barcode}{i}";
            var childInvNo = $"{invoice.InvoiceNumber}-INS{i}";

            var child = new FeeInvoice
            {
                Id = Guid.NewGuid(),
                SchoolId = invoice.SchoolId,
                ParentInvoiceId = invoice.Id,
                InstallmentNumber = i,
                TotalInstallments = n,
                InstallmentMode = req.Mode ?? "V",
                InvoiceNumber = childInvNo,
                Barcode = childBarcode,
                StudentId = invoice.StudentId,
                StudentName = invoice.StudentName,
                ClassSection = invoice.ClassSection,
                BillingMonth = invoice.BillingMonth,
                IssueDate = DateTime.UtcNow,
                DueDate = dueDates.Count >= i ? dueDates[i - 1] : invoice.DueDate.AddMonths(i - 1),
                TotalFee = installmentAmount,
                NetPayable = installmentAmount,
                PaidAmount = 0,
                Status = "UNPAID",
                LateFinePerDay = invoice.LateFinePerDay,
                MaxLateFine = invoice.MaxLateFine
            };

            child.Items.Add(new FeeInvoiceItem
            {
                Id = Guid.NewGuid(),
                FeeInvoiceId = child.Id,
                HeadName = $"Tuition Installment {i}/{n}",
                Amount = installmentAmount
            });

            childInvoices.Add(child);
        }

        invoice.Status = "SPLIT";
        _context.FeeInvoices.AddRange(childInvoices);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Invoice {invoice.InvoiceNumber} successfully split into {n} installments.",
            parentInvoiceId = invoice.Id,
            installments = childInvoices.Select(c => new
            {
                c.Id,
                c.InvoiceNumber,
                c.Barcode,
                c.InstallmentNumber,
                c.TotalInstallments,
                c.NetPayable,
                c.DueDate,
                c.Status
            })
        });
    }

    [HttpGet("bank-api/inquiry")]
    public async Task<IActionResult> BankBillInquiry([FromQuery] string consumer_number, [FromQuery] string bank_mnemonic = "1Link")
    {
        if (string.IsNullOrWhiteSpace(consumer_number))
            return BadRequest(new { response_code = "01", message = "Consumer number required." });

        var invoice = await _context.FeeInvoices
            .FirstOrDefaultAsync(i => i.Barcode == consumer_number || i.InvoiceNumber == consumer_number);

        var log = new BankApiLog
        {
            Id = Guid.NewGuid(),
            SchoolId = invoice?.SchoolId ?? Guid.Empty,
            ConsumerNumber = consumer_number,
            BankMnemonic = bank_mnemonic,
            Action = "INQUIRY",
            RequestPayload = $"consumer_number={consumer_number}&bank={bank_mnemonic}"
        };

        if (invoice == null)
        {
            log.ResponseCode = "01";
            log.IsSuccess = false;
            log.ResponsePayload = "Bill Not Found";
            _context.BankApiLogs.Add(log);
            await _context.SaveChangesAsync();
            return NotFound(new { response_code = "01", message = "Bill consumer number not found in eSchool registry." });
        }

        var isPaid = invoice.Status == "PAID";
        var cappedFine = invoice.CalculateCappedLateFine(DateTime.UtcNow);
        var amountWithinDueDate = invoice.NetPayable;
        var amountAfterDueDate = invoice.NetPayable + cappedFine;

        log.ResponseCode = isPaid ? "02" : "00";
        log.ResponsePayload = $"Status={(isPaid ? "P" : "U")}|Due={invoice.DueDate:yyyy-MM-dd}|Amt={amountWithinDueDate}";
        _context.BankApiLogs.Add(log);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            response_code = isPaid ? "02" : "00",
            consumer_number = consumer_number,
            bill_status = isPaid ? "P" : "U", // P = Paid, U = Unpaid
            student_name = invoice.StudentName,
            class_section = invoice.ClassSection,
            billing_month = invoice.BillingMonth,
            due_date = invoice.DueDate.ToString("yyyy-MM-dd"),
            amount_within_due_date = amountWithinDueDate,
            amount_after_due_date = amountAfterDueDate,
            late_fine = cappedFine
        });
    }

    public record BankPaymentRequest(
        string consumer_number,
        decimal amount_paid,
        string tran_auth_id,
        string? bank_mnemonic
    );

    [HttpPost("bank-api/payment")]
    public async Task<IActionResult> BankBillPayment([FromBody] BankPaymentRequest req)
    {
        var invoice = await _context.FeeInvoices
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Barcode == req.consumer_number || i.InvoiceNumber == req.consumer_number);

        var log = new BankApiLog
        {
            Id = Guid.NewGuid(),
            SchoolId = invoice?.SchoolId ?? Guid.Empty,
            ConsumerNumber = req.consumer_number,
            BankMnemonic = req.bank_mnemonic ?? "1Link",
            TransactionReference = req.tran_auth_id,
            Action = "PAYMENT",
            RequestPayload = $"consumer={req.consumer_number}|amt={req.amount_paid}|auth={req.tran_auth_id}"
        };

        if (invoice == null)
        {
            log.ResponseCode = "01";
            log.IsSuccess = false;
            log.ResponsePayload = "Bill Not Found";
            _context.BankApiLogs.Add(log);
            await _context.SaveChangesAsync();
            return NotFound(new { response_code = "01", message = "Bill consumer number not found." });
        }

        if (invoice.Status == "PAID")
        {
            log.ResponseCode = "02";
            log.IsSuccess = false;
            log.ResponsePayload = "Already Paid";
            _context.BankApiLogs.Add(log);
            await _context.SaveChangesAsync();
            return BadRequest(new { response_code = "02", message = "Bill is already paid in full." });
        }

        var receiptNumber = $"BNK-{DateTime.UtcNow:yyyyMM}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        var payment = new FeePayment
        {
            Id = Guid.NewGuid(),
            SchoolId = invoice.SchoolId,
            FeeInvoiceId = invoice.Id,
            ReceiptNumber = receiptNumber,
            AmountPaid = req.amount_paid,
            PaymentMethod = req.bank_mnemonic ?? "1Link",
            ReferenceNumber = req.tran_auth_id,
            ReceivedBy = $"API Gateway ({req.bank_mnemonic ?? "1Link"})",
            PaymentDate = DateTime.UtcNow
        };

        invoice.PaidAmount += req.amount_paid;
        invoice.Status = invoice.PaidAmount >= invoice.NetPayable ? "PAID" : "PARTIAL";

        _context.FeePayments.Add(payment);
        log.ResponseCode = "00";
        log.ResponsePayload = $"Success|Receipt={receiptNumber}|NewBalance={invoice.Balance}";
        _context.BankApiLogs.Add(log);
        await _context.SaveChangesAsync();

        // Broadcast real-time payment to Counter Hub
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
            response_code = "00",
            message = "Payment posted successfully via 1Link/Online banking API.",
            receipt_number = receiptNumber,
            tran_auth_id = req.tran_auth_id,
            amount_paid = req.amount_paid,
            remaining_balance = invoice.Balance,
            status = invoice.Status
        });
    }

    public record BankReversalRequest(
        string consumer_number,
        string tran_auth_id
    );

    [HttpPost("bank-api/reversal")]
    public async Task<IActionResult> BankBillReversal([FromBody] BankReversalRequest req)
    {
        var invoice = await _context.FeeInvoices
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Barcode == req.consumer_number || i.InvoiceNumber == req.consumer_number);

        var log = new BankApiLog
        {
            Id = Guid.NewGuid(),
            SchoolId = invoice?.SchoolId ?? Guid.Empty,
            ConsumerNumber = req.consumer_number,
            TransactionReference = req.tran_auth_id,
            Action = "REVERSAL",
            RequestPayload = $"reversal|consumer={req.consumer_number}|auth={req.tran_auth_id}"
        };

        if (invoice == null)
        {
            log.ResponseCode = "01";
            _context.BankApiLogs.Add(log);
            await _context.SaveChangesAsync();
            return NotFound(new { response_code = "01", message = "Invoice not found." });
        }

        var payment = invoice.Payments.FirstOrDefault(p => p.ReferenceNumber == req.tran_auth_id);
        if (payment == null)
        {
            log.ResponseCode = "03";
            log.ResponsePayload = "Payment reference not found for reversal";
            _context.BankApiLogs.Add(log);
            await _context.SaveChangesAsync();
            return BadRequest(new { response_code = "03", message = "Original payment reference not found." });
        }

        invoice.PaidAmount -= payment.AmountPaid;
        invoice.Status = invoice.PaidAmount <= 0 ? "UNPAID" : "PARTIAL";
        _context.FeePayments.Remove(payment);

        log.ResponseCode = "00";
        log.ResponsePayload = "Reversed successfully";
        _context.BankApiLogs.Add(log);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            response_code = "00",
            message = "Transaction reversed successfully.",
            invoice_status = invoice.Status,
            balance = invoice.Balance
        });
    }

    [HttpGet("loans")]
    public async Task<IActionResult> GetLoans([FromQuery] Guid? schoolId)
    {
        var effectiveSchoolId = schoolId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        var loans = await _context.EmployeeLoans
            .Include(l => l.Schedules)
            .Where(l => l.SchoolId == effectiveSchoolId)
            .OrderByDescending(l => l.DisbursedDate)
            .ToListAsync();

        if (loans.Count == 0)
        {
            var sampleLoan = CreateSampleLoan(effectiveSchoolId);
            _context.EmployeeLoans.Add(sampleLoan);
            await _context.SaveChangesAsync();
            loans.Add(sampleLoan);
        }

        return Ok(new
        {
            total = loans.Count,
            items = loans.Select(l => new
            {
                l.Id,
                l.LoanNumber,
                l.EmployeeName,
                l.EmployeeCode,
                l.LoanAmount,
                l.TenureMonths,
                l.BaseEmi,
                l.Remainder,
                l.FirstEmi,
                l.RecoveredAmount,
                l.OutstandingBalance,
                l.Status,
                l.Purpose,
                schedules = l.Schedules.OrderBy(s => s.InstallmentNo).Select(s => new
                {
                    s.InstallmentNo,
                    s.DueDate,
                    s.EmiAmount,
                    s.IsRecovered,
                    s.RecoveredDate,
                    s.PayrollMonth
                })
            })
        });
    }

    public record CreateLoanRequest(
        Guid? SchoolId,
        Guid EmployeeId,
        string EmployeeName,
        string EmployeeCode,
        decimal LoanAmount,
        int TenureMonths,
        string? Purpose
    );

    [HttpPost("loans")]
    public async Task<IActionResult> CreateLoan([FromBody] CreateLoanRequest req)
    {
        var effectiveSchoolId = req.SchoolId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");

        if (req.LoanAmount <= 0) return BadRequest(new { message = "Loan amount must be positive." });
        if (req.TenureMonths <= 0) return BadRequest(new { message = "Tenure must be at least 1 month." });

        if (_dataLockGuard != null)
        {
            await _dataLockGuard.EnsureUnlockedAsync(effectiveSchoolId, "Payroll.LoanRecovery", DateTime.UtcNow);
        }

        var count = await _context.EmployeeLoans.CountAsync(l => l.SchoolId == effectiveSchoolId) + 1;
        var loanNo = $"LN-{DateTime.UtcNow.Year}-{count:D4}";

        // Remainder-First Algorithm: Base = floor(Amount / N), Remainder = Amount mod N, FirstEMI = Base + Remainder
        var n = req.TenureMonths;
        var baseEmi = Math.Floor(req.LoanAmount / n);
        var remainder = req.LoanAmount - (baseEmi * n);
        var firstEmi = baseEmi + remainder;

        var loan = new EmployeeLoan
        {
            Id = Guid.NewGuid(),
            SchoolId = effectiveSchoolId,
            LoanNumber = loanNo,
            EmployeeId = req.EmployeeId != Guid.Empty ? req.EmployeeId : Guid.NewGuid(),
            EmployeeName = req.EmployeeName,
            EmployeeCode = req.EmployeeCode,
            LoanAmount = req.LoanAmount,
            TenureMonths = n,
            BaseEmi = baseEmi,
            Remainder = remainder,
            FirstEmi = firstEmi,
            RecoveredAmount = 0,
            Status = "ACTIVE",
            Purpose = req.Purpose ?? "Emergency Advance",
            DisbursedDate = DateTime.UtcNow
        };

        for (int i = 1; i <= n; i++)
        {
            loan.Schedules.Add(new EmployeeLoanSchedule
            {
                Id = Guid.NewGuid(),
                EmployeeLoanId = loan.Id,
                InstallmentNo = i,
                DueDate = DateTime.UtcNow.AddMonths(i),
                EmiAmount = (i == 1) ? firstEmi : baseEmi,
                IsRecovered = false,
                PayrollMonth = DateTime.UtcNow.AddMonths(i).ToString("yyyy-MM")
            });
        }

        _context.EmployeeLoans.Add(loan);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Loan {loanNo} created with remainder-first schedule. First EMI = PKR {firstEmi:N0}, subsequent = PKR {baseEmi:N0}.",
            loan
        });
    }

    private static EmployeeLoan CreateSampleLoan(Guid schoolId)
    {
        var loan = new EmployeeLoan
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            LoanNumber = "LN-2026-0001",
            EmployeeId = Guid.NewGuid(),
            EmployeeName = "Ms. Ayesha Siddiqui",
            EmployeeCode = "EMP-1002",
            LoanAmount = 100000,
            TenureMonths = 3,
            BaseEmi = 33333,
            Remainder = 1,
            FirstEmi = 33334,
            RecoveredAmount = 33334,
            Status = "ACTIVE",
            Purpose = "Medical Emergency & Home Maintenance",
            DisbursedDate = DateTime.UtcNow.AddMonths(-1)
        };

        loan.Schedules.Add(new EmployeeLoanSchedule
        {
            Id = Guid.NewGuid(),
            EmployeeLoanId = loan.Id,
            InstallmentNo = 1,
            DueDate = DateTime.UtcNow.AddMonths(-1),
            EmiAmount = 33334,
            IsRecovered = true,
            RecoveredDate = DateTime.UtcNow.AddMonths(-1),
            PayrollMonth = DateTime.UtcNow.AddMonths(-1).ToString("yyyy-MM")
        });

        loan.Schedules.Add(new EmployeeLoanSchedule
        {
            Id = Guid.NewGuid(),
            EmployeeLoanId = loan.Id,
            InstallmentNo = 2,
            DueDate = DateTime.UtcNow,
            EmiAmount = 33333,
            IsRecovered = false,
            PayrollMonth = DateTime.UtcNow.ToString("yyyy-MM")
        });

        loan.Schedules.Add(new EmployeeLoanSchedule
        {
            Id = Guid.NewGuid(),
            EmployeeLoanId = loan.Id,
            InstallmentNo = 3,
            DueDate = DateTime.UtcNow.AddMonths(1),
            EmiAmount = 33333,
            IsRecovered = false,
            PayrollMonth = DateTime.UtcNow.AddMonths(1).ToString("yyyy-MM")
        });

        return loan;
    }
}
