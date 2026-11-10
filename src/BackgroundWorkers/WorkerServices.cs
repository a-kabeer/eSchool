using System.Threading.Channels;
using eSchool.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace eSchool.Workers;

public record GenerateInvoicesJob(Guid SchoolId, string BillingMonth, DateTime DueDate, string RequestedByUserId);
public record NotificationJob(Guid SchoolId, string Recipient, string Channel, string MessageBody);
public record BiometricLogJob(Guid SchoolId, Guid EmployeeOrStudentId, DateTime Timestamp, string DeviceId);

public class InvoiceBatchBackgroundService : BackgroundService
{
    private readonly ChannelReader<GenerateInvoicesJob> _reader;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<InvoiceBatchBackgroundService> _logger;

    public InvoiceBatchBackgroundService(
        Channel<GenerateInvoicesJob> channel,
        IServiceProvider serviceProvider,
        ILogger<InvoiceBatchBackgroundService> logger)
    {
        _reader = channel.Reader;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("InvoiceBatchBackgroundService initialized and listening for jobs.");

        await foreach (var job in _reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                _logger.LogInformation("Starting batch invoice generation for School {SchoolId}, Month {Month}", job.SchoolId, job.BillingMonth);

                var activeStudents = await dbContext.Students
                    .Include(s => s.Enrollments)
                    .Where(s => s.SchoolId == job.SchoolId && s.Status == "Active")
                    .ToListAsync(stoppingToken);

                int count = 0;
                foreach (var student in activeStudents)
                {
                    var exists = await dbContext.FeeInvoices
                        .AnyAsync(i => i.StudentId == student.Id && i.BillingMonth == job.BillingMonth, stoppingToken);

                    if (exists) continue;

                    var invoice = new Modules.Billing.FeeInvoice
                    {
                        Id = Guid.NewGuid(),
                        SchoolId = job.SchoolId,
                        StudentId = student.Id,
                        StudentName = student.FullName,
                        ClassSection = "Enrolled",
                        BillingMonth = job.BillingMonth,
                        IssueDate = DateTime.UtcNow,
                        DueDate = job.DueDate,
                        TotalFee = 8500,
                        NetPayable = 8500,
                        Status = "UNPAID",
                        InvoiceNumber = $"INV-{job.BillingMonth.Replace("-", "")}-{1000 + count}",
                        Barcode = $"{job.BillingMonth.Replace("-", "")}{1000 + count}"
                    };

                    invoice.Items.Add(new Modules.Billing.FeeInvoiceItem
                    {
                        HeadName = $"Tuition Fee ({job.BillingMonth})",
                        Amount = 7500
                    });
                    invoice.Items.Add(new Modules.Billing.FeeInvoiceItem
                    {
                        HeadName = "Lab & Development Fund",
                        Amount = 1000
                    });

                    dbContext.FeeInvoices.Add(invoice);
                    count++;
                }

                await dbContext.SaveChangesAsync(stoppingToken);
                _logger.LogInformation("Generated {Count} fee invoices for Month {Month}", count, job.BillingMonth);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing invoice generation job for School {SchoolId}", job.SchoolId);
            }
        }
    }
}

public class NotificationDispatchWorker : BackgroundService
{
    private readonly ChannelReader<NotificationJob> _reader;
    private readonly ILogger<NotificationDispatchWorker> _logger;

    public NotificationDispatchWorker(
        Channel<NotificationJob> channel,
        ILogger<NotificationDispatchWorker> logger)
    {
        _reader = channel.Reader;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("NotificationDispatchWorker listening for alert dispatches.");

        await foreach (var job in _reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                // Dispatches to WhatsApp Cloud API or local SMS Gateway
                _logger.LogInformation("[DISPATCH {Channel}] To: {Recipient} | Message: {Body}", 
                    job.Channel, job.Recipient, job.MessageBody);
                await Task.Delay(50, stoppingToken); // Simulate rate limiter
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error dispatching notification to {Recipient}", job.Recipient);
            }
        }
    }
}
