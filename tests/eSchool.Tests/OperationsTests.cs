using eSchool.Modules.Operations;
using Xunit;

namespace eSchool.Tests;

public class OperationsTests
{
    [Fact]
    public void Sandwich_Rule_Friday_Through_Monday_Adds_Weekend_Sandwich()
    {
        // 2026-11-06 is Friday, 2026-11-09 is Monday
        var friday = new DateTime(2026, 11, 6);
        var monday = new DateTime(2026, 11, 9);
        decimal grossSalary = 60000;

        // 1. Unpaid Leave with Sandwich Rule "S"
        var (sandwichDays, deduction) = StaffLeaveApplication.EvaluateSandwichAndDeductions(
            friday,
            monday,
            "S",
            isPaidLeave: false,
            grossSalary: grossSalary
        );

        // 4 calendar days (Fri, Sat, Sun, Mon) + 2 sandwich penalty days = 6 days total
        Assert.Equal(2, sandwichDays);

        // Daily rate: 60,000 / 30 = 2,000/day. Total 6 days * 2,000 = 12,000
        Assert.Equal(12000m, deduction);
    }

    [Fact]
    public void Normal_Leave_Rule_Does_Not_Incur_Sandwich_Penalty()
    {
        var friday = new DateTime(2026, 11, 6);
        var monday = new DateTime(2026, 11, 9);
        decimal grossSalary = 60000;

        var (sandwichDays, _) = StaffLeaveApplication.EvaluateSandwichAndDeductions(
            friday,
            monday,
            "N", // Normal policy
            isPaidLeave: true,
            grossSalary: grossSalary
        );

        Assert.Equal(0, sandwichDays);
    }

    [Theory]
    [InlineData(0, 0)]      // Returned on due date -> 0 fine
    [InlineData(-2, 0)]     // Returned 2 days early -> 0 fine
    [InlineData(3, 150)]    // 3 days overdue * 50 = 150
    [InlineData(7, 350)]    // 7 days overdue * 50 = 350
    [InlineData(10, 500)]   // 10 days overdue * 50 = 500 (hits cap)
    [InlineData(25, 500)]   // 25 days overdue -> capped at 500
    public void Library_Circulation_Overdue_Fine_Respects_Pakistani_Ceiling(int daysPastDue, decimal expectedFine)
    {
        var baseDate = new DateTime(2026, 11, 1);
        var circulation = new LibraryCirculation
        {
            DueDate = baseDate,
            FinePerDay = 50,
            MaxFine = 500
        };

        var returnDate = baseDate.AddDays(daysPastDue);
        var fine = circulation.CalculateOverdueFine(returnDate);

        Assert.Equal(expectedFine, fine);
    }

    [Fact]
    public void Library_Barcode_Conforms_To_Cat_Book_Copy_Pattern()
    {
        var copy = new LibraryBookCopy
        {
            Barcode = "CAT-ENG-0012-01",
            CopyNumber = 1
        };

        Assert.StartsWith("CAT-", copy.Barcode);
        Assert.EndsWith("-01", copy.Barcode);
    }
}
