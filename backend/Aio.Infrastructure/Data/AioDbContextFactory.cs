using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Aio.Infrastructure.Data;

public sealed class AioDbContextFactory : IDesignTimeDbContextFactory<AioDbContext>
{
    public AioDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AioDbContext>()
            .UseSqlServer(
                "Server=localhost,14330;Database=Aio;User Id=sa;Password=TroqueEstaSenha!2026;TrustServerCertificate=True;Encrypt=False;Connect Timeout=60",
                sql => sql.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null))
            .Options;

        return new AioDbContext(options);
    }
}
