using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eSchool.Infrastructure;
using eSchool.Modules.Identity;
using eSchool.Modules.Students;
using eSchool.SharedKernel;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace eSchool.Tests;

public class TestTenantContext : ITenantContext
{
    public Guid CurrentSchoolId { get; set; }
    public IReadOnlyList<Guid> AccessibleSchoolIds { get; set; } = Array.Empty<Guid>();
    public bool IsSuperAdmin { get; set; } = false;

    public void SetTenant(Guid schoolId, IReadOnlyList<Guid> accessibleSchoolIds, bool isSuperAdmin)
    {
        CurrentSchoolId = schoolId;
        AccessibleSchoolIds = accessibleSchoolIds;
        IsSuperAdmin = isSuperAdmin;
    }
}

public class MultiTenantIsolationTests
{
    [Fact]
    public async Task AppDbContext_GlobalQueryFilter_ShouldIsolateStudentsBySchoolId()
    {
        // Arrange
        var lahoreCampusId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var karachiCampusId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        var tenantContext = new TestTenantContext { CurrentSchoolId = lahoreCampusId };

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"eSchool_Tenant_Test_{Guid.NewGuid()}")
            .Options;

        using (var db = new AppDbContext(options, tenantContext))
        {
            // Seed Lahore Student
            db.Students.Add(new Student
            {
                Id = Guid.NewGuid(),
                SchoolId = lahoreCampusId,
                RegistrationNumber = "LHE-REG-001",
                FirstName = "Ali",
                LastName = "Khan",
                DateOfBirth = new DateTime(2012, 1, 1),
                Gender = "Male",
                Status = "Active"
            });

            // Seed Karachi Student
            db.Students.Add(new Student
            {
                Id = Guid.NewGuid(),
                SchoolId = karachiCampusId,
                RegistrationNumber = "KHI-REG-001",
                FirstName = "Zainab",
                LastName = "Bibi",
                DateOfBirth = new DateTime(2012, 2, 2),
                Gender = "Female",
                Status = "Active"
            });

            await db.SaveChangesAsync();
        }

        // Act: Query with Lahore campus context
        using (var db = new AppDbContext(options, tenantContext))
        {
            var students = await db.Students.ToListAsync();

            // Assert: Only Lahore student should be returned by EF Core global query filter
            Assert.Single(students);
            Assert.Equal("LHE-REG-001", students[0].RegistrationNumber);
            Assert.Equal("Ali", students[0].FirstName);
        }

        // Switch to Karachi context
        tenantContext.CurrentSchoolId = karachiCampusId;
        using (var db = new AppDbContext(options, tenantContext))
        {
            var students = await db.Students.ToListAsync();

            // Assert: Only Karachi student should be returned
            Assert.Single(students);
            Assert.Equal("KHI-REG-001", students[0].RegistrationNumber);
            Assert.Equal("Zainab", students[0].FirstName);
        }
    }
}
