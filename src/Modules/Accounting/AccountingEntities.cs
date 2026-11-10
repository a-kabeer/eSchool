using eSchool.SharedKernel;

namespace eSchool.Modules.Accounting;

public class AccountHead : AuditableTenantEntity
{
    public string AccountCode { get; set; } = string.Empty; // e.g. "3010001"
    public string AccountName { get; set; } = string.Empty; // e.g. "Cash in Hand"
    public string AccountType { get; set; } = "Asset"; // Asset, Liability, Equity, Income, Expense
    public int Level { get; set; } = 4; // 1: Class, 2: Group, 3: Sub-Group, 4: Detail
    public string? ParentCode { get; set; }
    public decimal CurrentBalance { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Voucher : AuditableTenantEntity
{
    public string VoucherNumber { get; set; } = string.Empty; // e.g. "CPV-2024-0012"
    public string VoucherType { get; set; } = "CPV"; // CPV, CRV, BPV, BRV, JV
    public DateTime VoucherDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public string? ChequeNumber { get; set; }
    public DateTime? ChequeDate { get; set; }
    public string Narration { get; set; } = string.Empty;
    public bool IsPosted { get; set; } = true;
    public DateTime PostedAt { get; set; } = DateTime.UtcNow;

    public ICollection<VoucherEntry> Entries { get; set; } = new List<VoucherEntry>();
}

public class VoucherEntry : BaseEntity
{
    public Guid VoucherId { get; set; }
    public Voucher? Voucher { get; set; }
    public Guid AccountId { get; set; }
    public AccountHead? Account { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string? Narration { get; set; }
}
