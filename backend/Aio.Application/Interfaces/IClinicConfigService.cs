namespace Aio.Application.Interfaces;

public interface IClinicConfigService
{
    Task<IReadOnlyDictionary<string, string>> GetSettingsAsync(CancellationToken cancellationToken = default);
}
