namespace eSchool.SharedKernel;

public class DataLockViolationException : Exception
{
    public string SectionKey { get; }
    public DateTime LockDate { get; }
    public DateTime TransactionDate { get; }

    public DataLockViolationException(string sectionKey, DateTime lockDate, DateTime transactionDate)
        : base($"DATA_LOCK_VIOLATION: Section '{sectionKey}' is locked for all transactions on or before {lockDate:yyyy-MM-dd}. Attempted transaction date {transactionDate:yyyy-MM-dd} was rejected.")
    {
        SectionKey = sectionKey;
        LockDate = lockDate;
        TransactionDate = transactionDate;
    }
}

public interface IDataLockGuard
{
    Task EnsureUnlockedAsync(Guid schoolId, string sectionKey, DateTime transactionDate, CancellationToken cancellationToken = default);
}
