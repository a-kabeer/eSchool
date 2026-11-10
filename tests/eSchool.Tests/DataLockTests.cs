using eSchool.Infrastructure;
using eSchool.Infrastructure.Services;
using eSchool.Modules.Identity;
using eSchool.SharedKernel;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace eSchool.Tests;

public class DataLockTests
{
    private (AppDbContext db, TestTenantContext tenant) CreateInMemoryDbContext(Guid? schoolId = null)
    {
        var targetSchoolId = schoolId ?? Guid.NewGuid();
        var tenant = new TestTenantContext { CurrentSchoolId = targetSchoolId };
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return (new AppDbContext(options, tenant), tenant);
    }

    [Fact]
    public async Task Transaction_On_Or_Before_Lock_Date_Throws_DataLockViolationException()
    {
        var schoolId = Guid.NewGuid();
        var (db, _) = CreateInMemoryDbContext(schoolId);
        using (db)
        {
            var guard = new DataLockGuard(db);

            // Configure lock date for Billing.FeeCollection to 2024-06-30
            db.DataLocks.Add(new DataLock
            {
                SchoolId = schoolId,
                SectionKey = "Billing.FeeCollection",
                SectionName = "Fee Collection",
                Category = "Billing",
                LockDate = new DateTime(2024, 6, 30),
                CreatedBy = "Admin"
            });
            await db.SaveChangesAsync();

            // 1. Transaction on the exact lock date should throw
            var exactDate = new DateTime(2024, 6, 30);
            var ex1 = await Assert.ThrowsAsync<DataLockViolationException>(async () =>
            {
                await guard.EnsureUnlockedAsync(schoolId, "Billing.FeeCollection", exactDate);
            });
            Assert.Equal("Billing.FeeCollection", ex1.SectionKey);
            Assert.Equal(new DateTime(2024, 6, 30), ex1.LockDate);

            // 2. Transaction before the lock date should throw
            var pastDate = new DateTime(2024, 5, 15);
            var ex2 = await Assert.ThrowsAsync<DataLockViolationException>(async () =>
            {
                await guard.EnsureUnlockedAsync(schoolId, "Billing.FeeCollection", pastDate);
            });
            Assert.Equal("Billing.FeeCollection", ex2.SectionKey);
        }
    }

    [Fact]
    public async Task Transaction_After_Lock_Date_Succeeds()
    {
        var schoolId = Guid.NewGuid();
        var (db, _) = CreateInMemoryDbContext(schoolId);
        using (db)
        {
            var guard = new DataLockGuard(db);

            db.DataLocks.Add(new DataLock
            {
                SchoolId = schoolId,
                SectionKey = "Accounting.JournalVouchers",
                SectionName = "Journal Vouchers",
                Category = "Accounting",
                LockDate = new DateTime(2024, 6, 30),
                CreatedBy = "Admin"
            });
            await db.SaveChangesAsync();

            // Transaction after the lock date (2024-07-01) should succeed with no exception
            var validDate = new DateTime(2024, 7, 1);
            var exception = await Record.ExceptionAsync(async () =>
            {
                await guard.EnsureUnlockedAsync(schoolId, "Accounting.JournalVouchers", validDate);
            });

            Assert.Null(exception);
        }
    }

    [Fact]
    public async Task Unlocked_Section_Allows_Any_Date()
    {
        var schoolId = Guid.NewGuid();
        var (db, _) = CreateInMemoryDbContext(schoolId);
        using (db)
        {
            var guard = new DataLockGuard(db);

            // Section with no active lock record should allow any historical date
            var historicalDate = new DateTime(2020, 1, 1);
            var exception = await Record.ExceptionAsync(async () =>
            {
                await guard.EnsureUnlockedAsync(schoolId, "Students.Inquiries", historicalDate);
            });

            Assert.Null(exception);
        }
    }
}
