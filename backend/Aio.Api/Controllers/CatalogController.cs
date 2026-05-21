using Aio.Api.Dtos;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/catalogo")]
public sealed class CatalogController(AioDbContext db) : ControllerBase
{
    [HttpGet("servicos")]
    public async Task<ActionResult<IReadOnlyList<ServiceDto>>> GetServices(CancellationToken cancellationToken)
    {
        var services = await db.Services
            .Include(x => x.ServiceCategories).ThenInclude(x => x.Category)
            .Include(x => x.ProfessionalServices)
            .Include(x => x.RoomServices)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Ok(services.Select(x => new ServiceDto(
            ApiIds.Service(x.Id),
            x.Name,
            x.ServiceCategories.Select(c => c.Category.Name).FirstOrDefault() ?? "",
            x.ShortDescription,
            x.Description,
            x.DurationMinutes,
            x.BasePrice,
            x.ProfessionalServices.Select(p => ApiIds.Professional(p.ProfessionalId)).ToList(),
            x.RoomServices.Select(r => r.RoomId.ToString()).ToList(),
            [])).ToList());
    }

    [HttpGet("servicos/{id}")]
    public async Task<ActionResult<ServiceDto>> GetService(string id, CancellationToken cancellationToken)
    {
        var guid = ApiIds.Service(id);
        var services = await GetServices(cancellationToken);
        var service = services.Value?.FirstOrDefault(x => x.Id == ApiIds.Service(guid));
        return service is null ? NotFound() : Ok(service);
    }

    [HttpGet("profissionais")]
    public async Task<ActionResult<IReadOnlyList<ProfessionalDto>>> GetProfessionals(CancellationToken cancellationToken)
    {
        var professionals = await db.Professionals
            .Include(x => x.ProfessionalServices).ThenInclude(x => x.Service).ThenInclude(x => x.ServiceCategories).ThenInclude(x => x.Category)
            .Include(x => x.Schedules)
            .Include(x => x.User).ThenInclude(x => x!.UserRoles).ThenInclude(x => x.Role)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Ok(professionals.Select(ToDto).ToList());
    }

    [HttpGet("profissionais/{id}")]
    public async Task<ActionResult<ProfessionalDto>> GetProfessional(string id, CancellationToken cancellationToken)
    {
        var guid = ApiIds.Professional(id);
        var professional = await db.Professionals
            .Include(x => x.ProfessionalServices).ThenInclude(x => x.Service).ThenInclude(x => x.ServiceCategories).ThenInclude(x => x.Category)
            .Include(x => x.Schedules)
            .Include(x => x.User).ThenInclude(x => x!.UserRoles).ThenInclude(x => x.Role)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);

        return professional is null ? NotFound() : Ok(ToDto(professional));
    }

    [HttpGet("profissionais/por-servico/{serviceId}")]
    public async Task<ActionResult<IReadOnlyList<ProfessionalDto>>> GetProfessionalsByService(string serviceId, CancellationToken cancellationToken)
    {
        var guid = ApiIds.Service(serviceId);
        var professionals = await db.Professionals
            .Include(x => x.ProfessionalServices).ThenInclude(x => x.Service).ThenInclude(x => x.ServiceCategories).ThenInclude(x => x.Category)
            .Include(x => x.Schedules)
            .Include(x => x.User).ThenInclude(x => x!.UserRoles).ThenInclude(x => x.Role)
            .Where(x => x.ProfessionalServices.Any(ps => ps.ServiceId == guid))
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Ok(professionals.Select(ToDto).ToList());
    }

    [HttpGet("categorias")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCategories(CancellationToken cancellationToken)
    {
        return Ok(await db.Categories.AsNoTracking().Select(x => x.Name).ToListAsync(cancellationToken));
    }

    private static ProfessionalDto ToDto(Aio.Domain.Entities.Professional professional)
    {
        var role = professional.User?.UserRoles.Select(x => x.Role.Name).FirstOrDefault()
            ?? (professional.ProvidesCare ? "profissional" : "administrativo");
        var categories = professional.ProfessionalServices
            .SelectMany(x => x.Service.ServiceCategories.Select(c => c.Category.Name))
            .Distinct()
            .ToList();

        return new ProfessionalDto(
            ApiIds.Professional(professional.Id),
            professional.Name,
            role,
            professional.PhotoUrl,
            professional.Bio,
            professional.Specialty,
            categories,
            professional.DefaultCommissionPercent,
            professional.ProfessionalServices.Select(x => ApiIds.Service(x.ServiceId)).ToList(),
            professional.Schedules.OrderBy(x => x.Weekday).Select(x => new WorkingHourDto(x.Weekday, x.StartTime.ToString("HH:mm"), x.EndTime.ToString("HH:mm"))).ToList(),
            professional.MonthlyFixedPayment);
    }
}
