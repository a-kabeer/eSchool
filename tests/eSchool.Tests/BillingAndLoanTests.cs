using eSchool.Modules.Billing;
using Xunit;

namespace eSchool.Tests;

public class BillingAndLoanTests
{
    [Theory]
    [InlineData(100000, 3, 33333, 1, 33334)]
    [InlineData(50000, 7, 7142, 6, 7148)]
    [InlineData(75000, 4, 18750, 0, 18750)]
    [InlineData(10000, 6, 1666, 4, 1670)]
    public void Remainder_First_Loan_Recovery_Guarantees_Exact_Zero_Discrepancy(
        decimal loanAmount,
        int tenureMonths,
        decimal expectedBaseEmi,
        decimal expectedRemainder,
        decimal expectedFirstEmi)
    {
        // Remainder-First Formula
        var baseEmi = Math.Floor(loanAmount / tenureMonths);
        var remainder = loanAmount - (baseEmi * tenureMonths);
        var firstEmi = baseEmi + remainder;

        Assert.Equal(expectedBaseEmi, baseEmi);
        Assert.Equal(expectedRemainder, remainder);
        Assert.Equal(expectedFirstEmi, firstEmi);

        // Sum across all tenure months must EXACTLY equal loan amount
        var totalScheduled = firstEmi + (baseEmi * (tenureMonths - 1));
        Assert.Equal(loanAmount, totalScheduled);
    }

    [Fact]
    public void Fee_Invoice_Split_Installments_Matches_Total_Balance()
    {
        decimal balance = 25000;
        int installmentsCount = 3;

        var baseInstallment = Math.Floor(balance / installmentsCount);
        var remainder = balance - (baseInstallment * installmentsCount);
        var firstInstallment = baseInstallment + remainder;

        Assert.Equal(8333, baseInstallment);
        Assert.Equal(1, remainder);
        Assert.Equal(8334, firstInstallment);

        var total = firstInstallment + (baseInstallment * (installmentsCount - 1));
        Assert.Equal(balance, total);
    }

    [Fact]
    public void Capped_Late_Fine_Enforces_Pakistani_Regulatory_Ceiling()
    {
        var invoice = new FeeInvoice
        {
            DueDate = new DateTime(2026, 11, 1),
            LateFinePerDay = 50,
            MaxLateFine = 1000
        };

        // 1. On or before due date -> 0 fine
        var fineOnDueDate = invoice.CalculateCappedLateFine(new DateTime(2026, 11, 1));
        Assert.Equal(0, fineOnDueDate);

        // 2. 5 days overdue -> 5 * 50 = 250
        var fine5Days = invoice.CalculateCappedLateFine(new DateTime(2026, 11, 6));
        Assert.Equal(250, fine5Days);

        // 3. 30 days overdue -> min(30 * 50, 1000) = 1000 (capped!)
        var fine30Days = invoice.CalculateCappedLateFine(new DateTime(2026, 12, 1));
        Assert.Equal(1000, fine30Days);
    }
}
