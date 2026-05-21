using Aio.Application.Interfaces;
using Aio.Application.Services;
using Aio.Infrastructure.Data;
using Aio.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aio.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=localhost,14330;Database=Aio;User Id=sa;Password=TroqueEstaSenha!2026;TrustServerCertificate=True;Encrypt=False";

        services.AddDbContext<AioDbContext>(options => options.UseSqlServer(
            connectionString,
            sql => sql.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorNumbersToAdd: null)));
        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        services.AddScoped<IClinicConfigService, ClinicConfigService>();
        services.AddScoped<IMetricsService, MetricsService>();

        return services;
    }
}
