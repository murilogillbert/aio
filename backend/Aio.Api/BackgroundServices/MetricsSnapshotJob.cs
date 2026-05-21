namespace Aio.Api.Services;

public sealed class MetricsSnapshotJob(ILogger<MetricsSnapshotJob> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            logger.LogDebug("Metrics snapshot job heartbeat. Snapshot generation is ready for production rules.");
            await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
        }
    }
}
