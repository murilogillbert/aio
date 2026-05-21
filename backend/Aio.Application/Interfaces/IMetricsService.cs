using Aio.Domain.Entities;

namespace Aio.Application.Interfaces;

public interface IMetricsService
{
    Task<IReadOnlyList<MetricsSnapshot>> GetSnapshotsAsync(CancellationToken cancellationToken = default);
}
