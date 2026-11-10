using eSchool.SharedKernel;
using Microsoft.EntityFrameworkCore;

namespace eSchool.Infrastructure.Services;

public class DataLockGuard : IDataLockGuard
{
    private readonly AppDbContext _db;

    public DataLockGuard(AppDbContext db)
    {
        _db = db;
    }

    public async Task EnsureUnlockedAsync(Guid schoolId, string sectionKey, DateTime transactionDate, CancellationToken cancellationToken = default)
    {
        var dataLock = await _db.DataLocks
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.SchoolId == schoolId && l.SectionKey == sectionKey, cancellationToken);

        if (dataLock != null && transactionDate.Date <= dataLock.LockDate.Date)
        {
            throw new DataLockViolationException(sectionKey, dataLock.LockDate, transactionDate);
        }
    }
}
