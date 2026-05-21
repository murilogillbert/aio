namespace Aio.Api.Services;

public sealed class NotificationDispatchJob(ILogger<NotificationDispatchJob> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            logger.LogDebug("Notification dispatch job heartbeat. External providers are mocked in phase 3.");
            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }
}
