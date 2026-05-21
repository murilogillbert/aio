using Aio.Application.Interfaces;
using Aio.Domain.Entities;

namespace Aio.Application.Services;

public sealed class ClinicConfigService(IRepository<AppSetting> settingsRepository) : IClinicConfigService
{
    public async Task<IReadOnlyDictionary<string, string>> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await settingsRepository.ListAsync(cancellationToken);
        return settings.ToDictionary(setting => setting.Key, setting => setting.Value);
    }
}
