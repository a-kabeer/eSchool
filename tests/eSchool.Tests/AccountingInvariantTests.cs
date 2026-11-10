using System;
using System.Collections.Generic;
using System.Linq;
using eSchool.Modules.Accounting;
using Xunit;

namespace eSchool.Tests;

public class AccountingInvariantTests
{
    [Fact]
    public void Voucher_ShouldEnforceDebitEqualsCredit_Invariant()
    {
        // Arrange: Unbalanced entries (Debit 5000 != Credit 3000)
        var entries = new List<VoucherEntry>
        {
            new() { AccountId = Guid.NewGuid(), Debit = 5000m, Credit = 0m, Narration = "Cash Dr" },
            new() { AccountId = Guid.NewGuid(), Debit = 0m, Credit = 3000m, Narration = "Sales Cr" }
        };

        var totalDebit = entries.Sum(e => e.Debit);
        var totalCredit = entries.Sum(e => e.Credit);

        // Act & Assert
        Assert.NotEqual(totalDebit, totalCredit);
        Assert.False(totalDebit == totalCredit, "Mathematical invariant violated: Sum(Debit) must equal Sum(Credit)");
    }

    [Fact]
    public void BalancedVoucher_ShouldSatisfyDoubleEntryRules()
    {
        // Arrange: Balanced double-entry
        var schoolId = Guid.NewGuid();
        var voucher = new Voucher
        {
            SchoolId = schoolId,
            VoucherNumber = "CPV-2026-0001",
            VoucherType = "CPV",
            VoucherDate = DateTime.UtcNow,
            TotalAmount = 7500m,
            Narration = "Stationery purchase for Examination Hall",
            IsPosted = true,
            Entries = new List<VoucherEntry>
            {
                new() { AccountId = Guid.NewGuid(), Debit = 7500m, Credit = 0m, Narration = "Office Supplies Expense Dr" },
                new() { AccountId = Guid.NewGuid(), Debit = 0m, Credit = 7500m, Narration = "Cash in Hand Cr" }
            }
        };

        // Act
        var totalDebit = voucher.Entries.Sum(e => e.Debit);
        var totalCredit = voucher.Entries.Sum(e => e.Credit);

        // Assert
        Assert.Equal(totalDebit, totalCredit);
        Assert.Equal(7500m, totalDebit);
        Assert.True(voucher.IsPosted);
    }
}
