using eSchool.SharedKernel;

namespace eSchool.Modules.Billing;

public class FeeCategory : AuditableTenantEntity
{
    public string Name { get; set; } = string.Empty; // e.g. "Primary Wing", "Matric Wing"
    public string? Description { get; set; }
    public ICollection<FeeStructureItem> Items { get; set; } = new List<FeeStructureItem>();
}

public class FeeStructureItem : AuditableTenantEntity
{
    public Guid FeeCategoryId { get; set; }
    public FeeCategory? FeeCategory { get; set; }
    public string HeadName { get; set; } = string.Empty; // Tuition Fee, Lab Fund, Admission Fee
    public string Frequency { get; set; } = "Monthly"; // Monthly, Once, Yearly
    public decimal Amount { get; set; }
}

public class FeeInvoice : AuditableTenantEntity
{
    public string InvoiceNumber { get; set; } = string.Empty; // e.g. "INV-202411-1084"
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string ClassSection { get; set; } = string.Empty;
    public string BillingMonth { get; set; } = string.Empty; // e.g. "2024-11"
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    
    public decimal TotalFee { get; set; }
    public decimal Arrears { get; set; }
    public decimal Concession { get; set; }
    public decimal LateSurcharge { get; set; }
    public decimal NetPayable { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Balance => NetPayable - PaidAmount;
    
    public string Status { get; set; } = "UNPAID"; // UNPAID, PARTIAL, PAID, SPLIT
    public string Barcode { get; set; } = string.Empty; // 1D Code-128 barcode number

    // Installments Support (1..6 splits, V = New Vouchers, I = Next Bill)
    public Guid? ParentInvoiceId { get; set; }
    public int? InstallmentNumber { get; set; }
    public int? TotalInstallments { get; set; }
    public string? InstallmentMode { get; set; } // "V" = New Vouchers, "I" = Next Bill
    public decimal LateFinePerDay { get; set; } = 50;
    public decimal MaxLateFine { get; set; } = 1000;

    public decimal CalculateCappedLateFine(DateTime asOfDate)
    {
        if (asOfDate <= DueDate) return 0;
        var overdueDays = (int)(asOfDate.Date - DueDate.Date).TotalDays;
        return Math.Min(overdueDays * LateFinePerDay, MaxLateFine);
    }

    public ICollection<FeeInvoiceItem> Items { get; set; } = new List<FeeInvoiceItem>();
    public ICollection<FeePayment> Payments { get; set; } = new List<FeePayment>();
}

public class FeeInvoiceItem : BaseEntity
{
    public Guid FeeInvoiceId { get; set; }
    public FeeInvoice? FeeInvoice { get; set; }
    public string HeadName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class FeePayment : AuditableTenantEntity
{
    public string ReceiptNumber { get; set; } = string.Empty; // e.g. "RCP-202411-0042"
    public Guid FeeInvoiceId { get; set; }
    public FeeInvoice? FeeInvoice { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public decimal AmountPaid { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Cheque, Online, 1Link
    public string? ReferenceNumber { get; set; }
    public string ReceivedBy { get; set; } = string.Empty;
    public Guid? VoucherId { get; set; } // Linked General Ledger Voucher
}

public class BankApiLog : AuditableTenantEntity
{
    public string ConsumerNumber { get; set; } = string.Empty;
    public string BankMnemonic { get; set; } = "1Link"; // 1Link, Meezan, HBL, KuickPay, Alfalah
    public string TransactionReference { get; set; } = string.Empty;
    public string Action { get; set; } = "INQUIRY"; // INQUIRY, PAYMENT, REVERSAL
    public string RequestPayload { get; set; } = string.Empty;
    public string ResponsePayload { get; set; } = string.Empty;
    public string ResponseCode { get; set; } = "00"; // 00 = Success, 01 = Not Found, 02 = Already Paid
    public bool IsSuccess { get; set; } = true;
}

public class EmployeeLoan : AuditableTenantEntity
{
    public string LoanNumber { get; set; } = string.Empty; // e.g. "LN-2026-004"
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public decimal LoanAmount { get; set; }
    public int TenureMonths { get; set; } = 3;
    public decimal BaseEmi { get; set; }
    public decimal Remainder { get; set; }
    public decimal FirstEmi { get; set; }
    public decimal RecoveredAmount { get; set; }
    public decimal OutstandingBalance => LoanAmount - RecoveredAmount;
    public DateTime DisbursedDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, RECOVERED, DEFAULTED
    public string Purpose { get; set; } = "Personal / Emergency";

    public ICollection<EmployeeLoanSchedule> Schedules { get; set; } = new List<EmployeeLoanSchedule>();
}

public class EmployeeLoanSchedule : BaseEntity
{
    public Guid EmployeeLoanId { get; set; }
    public EmployeeLoan? EmployeeLoan { get; set; }
    public int InstallmentNo { get; set; }
    public DateTime DueDate { get; set; }
    public decimal EmiAmount { get; set; }
    public bool IsRecovered { get; set; }
    public DateTime? RecoveredDate { get; set; }
    public string? PayrollMonth { get; set; } // e.g. "2026-11"
}
