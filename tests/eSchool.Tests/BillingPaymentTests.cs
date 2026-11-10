using System;
using System.Collections.Generic;
using eSchool.Modules.Billing;
using Xunit;

namespace eSchool.Tests;

public class BillingPaymentTests
{
    [Fact]
    public void FeeInvoice_PartialPayment_ShouldUpdateBalanceAndStatus()
    {
        // Arrange
        var schoolId = Guid.NewGuid();
        var invoice = new FeeInvoice
        {
            SchoolId = schoolId,
            InvoiceNumber = "INV-202411-1001",
            Barcode = "2024111001",
            StudentId = Guid.NewGuid(),
            BillingMonth = "2024-11",
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(15),
            TotalFee = 8500m,
            Arrears = 0m,
            LateSurcharge = 500m,
            NetPayable = 8500m,
            PaidAmount = 0m,
            Status = "UNPAID",
            Items = new List<FeeInvoiceItem>
            {
                new() { HeadName = "Tuition Fee", Amount = 7500m },
                new() { HeadName = "Lab Fund", Amount = 1000m }
            }
        };

        // Act: Cashier collects partial payment of PKR 5,000
        decimal payment = 5000m;
        invoice.PaidAmount += payment;
        invoice.Status = invoice.Balance == 0 ? "PAID" : "PARTIAL";

        // Assert
        Assert.Equal(5000m, invoice.PaidAmount);
        Assert.Equal(3500m, invoice.Balance);
        Assert.Equal("PARTIAL", invoice.Status);
    }

    [Fact]
    public void FeeInvoice_FullPayment_ShouldMarkStatusAsPaid()
    {
        // Arrange
        var invoice = new FeeInvoice
        {
            SchoolId = Guid.NewGuid(),
            InvoiceNumber = "INV-202411-1002",
            Barcode = "2024111002",
            StudentId = Guid.NewGuid(),
            BillingMonth = "2024-11",
            IssueDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(15),
            TotalFee = 8500m,
            NetPayable = 8500m,
            PaidAmount = 0m,
            Status = "UNPAID"
        };

        // Act: Full payment of PKR 8,500 collected
        decimal fullPayment = 8500m;
        invoice.PaidAmount += fullPayment;
        invoice.Status = invoice.Balance == 0 ? "PAID" : "PARTIAL";

        // Assert
        Assert.Equal(8500m, invoice.PaidAmount);
        Assert.Equal(0m, invoice.Balance);
        Assert.Equal("PAID", invoice.Status);
    }
}
