using System.Reflection;
using eSchool.Modules.Academics;
using eSchool.Modules.Accounting;
using eSchool.Modules.Attendance;
using eSchool.Modules.Billing;
using eSchool.Modules.Identity;
using eSchool.Modules.Students;
using eSchool.SharedKernel;
using Microsoft.EntityFrameworkCore;

namespace eSchool.Infrastructure;

public class AppDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    // Identity
    public DbSet<School> Schools => Set<School>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserSchoolAccess> UserSchoolAccess => Set<UserSchoolAccess>();
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();

    // Academics
    public DbSet<AcademicSession> AcademicSessions => Set<AcademicSession>();
    public DbSet<ClassLevel> ClassLevels => Set<ClassLevel>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<Subject> Subjects => Set<Subject>();

    // Students
    public DbSet<Student> Students => Set<Student>();
    public DbSet<StudentGuardian> StudentGuardians => Set<StudentGuardian>();
    public DbSet<StudentEnrollment> StudentEnrollments => Set<StudentEnrollment>();

    // Billing
    public DbSet<FeeCategory> FeeCategories => Set<FeeCategory>();
    public DbSet<FeeStructureItem> FeeStructureItems => Set<FeeStructureItem>();
    public DbSet<FeeInvoice> FeeInvoices => Set<FeeInvoice>();
    public DbSet<FeeInvoiceItem> FeeInvoiceItems => Set<FeeInvoiceItem>();
    public DbSet<FeePayment> FeePayments => Set<FeePayment>();

    // Accounting
    public DbSet<AccountHead> AccountHeads => Set<AccountHead>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<VoucherEntry> VoucherEntries => Set<VoucherEntry>();

    // Attendance
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<StaffAttendanceRecord> StaffAttendanceRecords => Set<StaffAttendanceRecord>();

    // Audit
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply Global Multi-Tenant Query Filter to all IMultiTenantEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IMultiTenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(AppDbContext)
                    .GetMethod(nameof(ConfigureGlobalTenantFilter), BindingFlags.NonPublic | BindingFlags.Static)?
                    .MakeGenericMethod(entityType.ClrType);

                method?.Invoke(null, new object[] { modelBuilder, this });
            }
        }

        // Voucher & VoucherEntry relationships
        modelBuilder.Entity<Voucher>()
            .HasMany(v => v.Entries)
            .WithOne(e => e.Voucher)
            .HasForeignKey(e => e.VoucherId)
            .OnDelete(DeleteBehavior.Cascade);

        // FeeInvoice & FeeInvoiceItem relationships
        modelBuilder.Entity<FeeInvoice>()
            .HasMany(i => i.Items)
            .WithOne(item => item.FeeInvoice)
            .HasForeignKey(item => item.FeeInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FeeInvoice>()
            .HasMany(i => i.Payments)
            .WithOne(p => p.FeeInvoice)
            .HasForeignKey(p => p.FeeInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Student & Relationships
        modelBuilder.Entity<Student>()
            .HasMany(s => s.Guardians)
            .WithOne(g => g.Student)
            .HasForeignKey(g => g.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Student>()
            .HasMany(s => s.Enrollments)
            .WithOne(e => e.Student)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureGlobalTenantFilter<T>(ModelBuilder builder, AppDbContext context)
        where T : class, IMultiTenantEntity
    {
        builder.Entity<T>().HasQueryFilter(e =>
            context._tenantContext == null ||
            context._tenantContext.IsSuperAdmin ||
            context._tenantContext.CurrentSchoolId == Guid.Empty ||
            e.SchoolId == context._tenantContext.CurrentSchoolId);
    }
}
