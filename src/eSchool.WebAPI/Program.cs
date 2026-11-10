using System.Threading.Channels;
using eSchool.Infrastructure;
using eSchool.Infrastructure.Services;
using eSchool.SharedKernel;
using eSchool.WebAPI.Hubs;
using eSchool.Workers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers & OpenAPI
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 2. Add DbContext (PostgreSQL if connection string provided, else InMemory for instant self-contained testing)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseInMemoryDatabase("eSchool_Local_Db");
    }
});

// 3. Multi-Tenant Context & Data Lock Guard
builder.Services.AddScoped<ITenantContext, TenantContext>();
builder.Services.AddScoped<IDataLockGuard, DataLockGuard>();

// 4. SignalR Real-Time Communication
builder.Services.AddSignalR();

// 5. High-Throughput In-Memory Bounded Channels for Background Workers
builder.Services.AddSingleton(Channel.CreateBounded<GenerateInvoicesJob>(new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait
}));
builder.Services.AddSingleton(Channel.CreateBounded<NotificationJob>(new BoundedChannelOptions(1000)
{
    FullMode = BoundedChannelFullMode.Wait
}));

// 6. .NET Hosted Background Services
builder.Services.AddHostedService<InvoiceBatchBackgroundService>();
builder.Services.AddHostedService<NotificationDispatchWorker>();

// 7. CORS for React Client
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Seed initial database records
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DataSeeder.SeedAsync(db);
}

app.UseCors("AllowReactApp");

// RFC 7807 Data Lock Violation Middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (DataLockViolationException ex)
    {
        context.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(new
        {
            type = "https://tools.ietf.org/html/rfc7807",
            title = "Data Lock Violation",
            status = 422,
            detail = ex.Message,
            code = "DATA_LOCK_VIOLATION",
            sectionKey = ex.SectionKey,
            lockDate = ex.LockDate.ToString("yyyy-MM-dd"),
            transactionDate = ex.TransactionDate.ToString("yyyy-MM-dd")
        });
    }
});

app.UseAuthentication();
app.UseAuthorization();

// Map REST API Controllers
app.MapControllers();

// Map SignalR Hub Endpoints
app.MapHub<CounterHub>("/hubs/counter");
app.MapHub<AttendanceHub>("/hubs/attendance");
app.MapHub<NotificationHub>("/hubs/notifications");

// Root Healthcheck Endpoint
app.MapGet("/", () => Results.Ok(new
{
    service = "eSchool Modular Monolith API",
    status = "Healthy",
    version = "1.0.0",
    architecture = "ASP.NET Core (.NET 8/9/10) + PostgreSQL + EF Core + SignalR",
    timestamp = DateTime.UtcNow
}));

app.Run();
