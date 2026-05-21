using System.Linq.Expressions;
using Aio.Application.Interfaces;
using Aio.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Aio.Infrastructure.Repositories;

public sealed class EfRepository<T>(AioDbContext dbContext) : IRepository<T> where T : class
{
    public async Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Set<T>().AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await dbContext.Set<T>().AsNoTracking().Where(predicate).ToListAsync(cancellationToken);
    }

    public Task<T?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return dbContext.Set<T>().FindAsync([id], cancellationToken).AsTask();
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await dbContext.Set<T>().AddAsync(entity, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
