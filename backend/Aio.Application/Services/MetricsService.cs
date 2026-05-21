using Aio.Application.Interfaces;
using Aio.Domain.Entities;

namespace Aio.Application.Services;

public sealed class MetricsService(IRepository<MetricsSnapshot> metricsRepository) : IMetricsService
{
    public Task<IReadOnlyList<MetricsSnapshot>> GetSnapshotsAsync(CancellationToken cancellationToken = default)
    {
        return metricsRepository.ListAsync(cancellationToken);
    }
}
