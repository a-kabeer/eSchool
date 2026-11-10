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
    
    public string Status { get; set; } = "UNPAID"; // UNPAID, PARTIAL, PAID
    public string Barcode { get; set; } = string.Empty; // 1D Code-128 barcode number

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
