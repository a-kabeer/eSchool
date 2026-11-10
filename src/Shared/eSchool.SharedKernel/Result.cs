namespace eSchool.SharedKernel;

public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string? Error { get; }

    protected Result(bool isSuccess, string? error)
    {
        if (isSuccess && !string.IsNullOrEmpty(error))
            throw new InvalidOperationException("Successful result cannot have an error.");
        if (!isSuccess && string.IsNullOrEmpty(error))
            throw new InvalidOperationException("Failed result must have an error.");

        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, null);
    public static Result Failure(string error) => new(false, error);
}

public class Result<T> : Result
{
    private readonly T? _value;

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Cannot access value of a failed result.");

    protected Result(T? value, bool isSuccess, string? error)
        : base(isSuccess, error)
    {
        _value = value;
    }

    public static Result<T> Success(T value) => new(value, true, null);
    public static new Result<T> Failure(string error) => new(default, false, error);
}

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public int PageIndex { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageIndex > 1;
    public bool HasNextPage => PageIndex < TotalPages;

    public PagedResult(IReadOnlyList<T> items, int count, int pageIndex, int pageSize)
    {
        Items = items;
        TotalCount = count;
        PageIndex = pageIndex;
        PageSize = pageSize;
    }
}
