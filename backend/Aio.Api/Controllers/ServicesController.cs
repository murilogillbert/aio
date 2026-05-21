using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/admin/servicos")]
[Authorize(Roles = "admin")]
public sealed class ServicesController(AioDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServiceSummaryDto>>> List(CancellationToken cancellationToken)
    {
        var items = await db.Services
            .AsNoTracking()
            .Select(x => new ServiceSummaryDto(
                ApiIds.Service(x.Id),
                x.Name,
                x.ShortDescription,
                x.DurationMinutes,
                x.BasePrice,
                x.Color,
                x.IsActive,
                x.ProfessionalServices.Count))
            .ToListAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceDetailDto>> Get(string id, CancellationToken cancellationToken)
    {
        var guid = ApiIds.Service(id);
        var service = await db.Services
            .AsNoTracking()
            .Include(x => x.ServiceCategories)
            .Include(x => x.ProfessionalServices)
            .Include(x => x.RoomServices)
            .Include(x => x.ServiceEquipments)
            .Include(x => x.Taxes)
            .Include(x => x.PlanServices)
            .FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (service is null) return NotFound();
        return Ok(Map(service));
    }

    [HttpGet("referencias")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> References(CancellationToken cancellationToken)
    {
        var categories = await db.Categories.AsNoTracking().Where(x => x.Type == "servico").Select(x => new CatalogReferenceDto(x.Id.ToString(), x.Name)).ToListAsync(cancellationToken);
        var rooms = await db.Rooms.AsNoTracking().Select(x => new CatalogReferenceDto(x.Id.ToString(), x.Name)).ToListAsync(cancellationToken);
        var equipments = await db.Equipments.AsNoTracking().Select(x => new CatalogReferenceDto(x.Id.ToString(), x.Name)).ToListAsync(cancellationToken);
        var plans = await db.Plans.AsNoTracking().Select(x => new CatalogReferenceDto(x.Id.ToString(), x.Name)).ToListAsync(cancellationToken);
        var professionals = await db.Professionals.AsNoTracking().Where(x => x.ProvidesCare).Select(x => new
        {
            Id = ApiIds.Professional(x.Id),
            x.Name,
            x.DefaultCommissionPercent,
            x.Specialty
        }).ToListAsync(cancellationToken);
        return Ok(new { categories, rooms, equipments, plans, professionals });
    }

    [HttpPost]
    public async Task<ActionResult<ServiceDetailDto>> Create([FromBody] ServiceUpsertDto body, CancellationToken cancellationToken)
    {
        var service = new Service { Id = Guid.NewGuid() };
        Apply(service, body);
        db.Services.Add(service);
        await ReplaceRelations(service, body, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(await GetDetail(service.Id, cancellationToken));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceDetailDto>> Update(string id, [FromBody] ServiceUpsertDto body, CancellationToken cancellationToken)
    {
        var guid = ApiIds.Service(id);
        var service = await db.Services
            .Include(x => x.ServiceCategories)
            .Include(x => x.ProfessionalServices)
            .Include(x => x.RoomServices)
            .Include(x => x.ServiceEquipments)
            .Include(x => x.Taxes)
            .Include(x => x.PlanServices)
            .FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (service is null) return NotFound();
        Apply(service, body);
        await ReplaceRelations(service, body, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(await GetDetail(service.Id, cancellationToken));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var guid = ApiIds.Service(id);
        var service = await db.Services.FindAsync([guid], cancellationToken);
        if (service is null) return NotFound();
        db.Services.Remove(service);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static void Apply(Service entity, ServiceUpsertDto body)
    {
        entity.Name = body.Name;
        entity.ShortDescription = body.ShortDescription;
        entity.Description = body.Description;
        entity.Preparation = body.Preparation;
        entity.Color = string.IsNullOrWhiteSpace(body.Color) ? "#C2410C" : body.Color;
        entity.DurationMinutes = body.DurationMinutes > 0 ? body.DurationMinutes : 60;
        entity.BasePrice = body.BasePrice;
        entity.RequiresRoom = body.RequiresRoom;
        entity.DefaultRoomId = Guid.TryParse(body.DefaultRoomId, out var roomId) ? roomId : null;
        entity.OnlineBooking = body.OnlineBooking;
        entity.ShowPrice = body.ShowPrice;
        entity.ShowDuration = body.ShowDuration;
        entity.IsActive = body.IsActive;
    }

    private async Task ReplaceRelations(Service service, ServiceUpsertDto body, CancellationToken cancellationToken)
    {
        db.ServiceCategories.RemoveRange(service.ServiceCategories);
        db.ProfessionalServices.RemoveRange(service.ProfessionalServices);
        db.RoomServices.RemoveRange(service.RoomServices);
        db.ServiceEquipments.RemoveRange(service.ServiceEquipments);
        db.ServiceTaxes.RemoveRange(service.Taxes);
        db.PlanServices.RemoveRange(service.PlanServices);

        foreach (var categoryId in body.CategoryIds.Distinct())
        {
            if (!Guid.TryParse(categoryId, out var parsed)) continue;
            db.ServiceCategories.Add(new ServiceCategory { ServiceId = service.Id, CategoryId = parsed });
        }
        foreach (var professional in body.Professionals.GroupBy(x => x.ProfessionalId).Select(g => g.First()))
        {
            var professionalId = ApiIds.Professional(professional.ProfessionalId);
            if (professionalId == Guid.Empty) continue;
            var type = professional.CompensationType switch
            {
                "custom_percent" => "custom_percent",
                "fixed_value" => "fixed_value",
                _ => "default_commission"
            };
            db.ProfessionalServices.Add(new ProfessionalService
            {
                ServiceId = service.Id,
                ProfessionalId = professionalId,
                CompensationType = type,
                CompensationValue = type == "default_commission" ? null : professional.CompensationValue
            });
        }
        foreach (var roomId in body.RoomIds.Distinct())
        {
            if (!Guid.TryParse(roomId, out var parsed)) continue;
            db.RoomServices.Add(new RoomService { ServiceId = service.Id, RoomId = parsed });
        }
        foreach (var equipment in body.Equipments.GroupBy(x => x.EquipmentId).Select(g => g.First()))
        {
            if (!Guid.TryParse(equipment.EquipmentId, out var parsed)) continue;
            db.ServiceEquipments.Add(new ServiceEquipment { ServiceId = service.Id, EquipmentId = parsed, Required = equipment.Required });
        }
        foreach (var tax in body.Taxes)
        {
            if (string.IsNullOrWhiteSpace(tax.Name)) continue;
            db.ServiceTaxes.Add(new ServiceTax { Id = Guid.NewGuid(), ServiceId = service.Id, Name = tax.Name, Percent = tax.Percent });
        }
        foreach (var plan in body.Plans.GroupBy(x => x.PlanId).Select(g => g.First()))
        {
            if (!Guid.TryParse(plan.PlanId, out var parsed)) continue;
            db.PlanServices.Add(new PlanService
            {
                ServiceId = service.Id,
                PlanId = parsed,
                CoverageRule = plan.CoverageRule ?? "",
                CustomPrice = plan.CustomPrice,
                ShowPrice = plan.ShowPrice
            });
        }
        await Task.CompletedTask;
    }

    private async Task<ServiceDetailDto> GetDetail(Guid id, CancellationToken cancellationToken)
    {
        var service = await db.Services
            .AsNoTracking()
            .Include(x => x.ServiceCategories)
            .Include(x => x.ProfessionalServices)
            .Include(x => x.RoomServices)
            .Include(x => x.ServiceEquipments)
            .Include(x => x.Taxes)
            .Include(x => x.PlanServices)
            .FirstAsync(x => x.Id == id, cancellationToken);
        return Map(service);
    }

    private static ServiceDetailDto Map(Service service) => new(
        ApiIds.Service(service.Id),
        service.Name,
        service.ShortDescription,
        service.Description,
        service.Preparation,
        string.IsNullOrWhiteSpace(service.Color) ? "#C2410C" : service.Color,
        service.DurationMinutes,
        service.BasePrice,
        service.RequiresRoom,
        service.DefaultRoomId?.ToString(),
        service.OnlineBooking,
        service.ShowPrice,
        service.ShowDuration,
        service.IsActive,
        service.ServiceCategories.Select(x => x.CategoryId.ToString()).ToList(),
        service.ProfessionalServices.Select(x => new ServiceProfessionalDto(ApiIds.Professional(x.ProfessionalId), x.CompensationType, x.CompensationValue)).ToList(),
        service.RoomServices.Select(x => x.RoomId.ToString()).ToList(),
        service.ServiceEquipments.Select(x => new ServiceEquipmentDto(x.EquipmentId.ToString(), x.Required)).ToList(),
        service.Taxes.Select(x => new ServiceTaxDto(x.Id.ToString(), x.Name, x.Percent)).ToList(),
        service.PlanServices.Select(x => new ServicePlanDto(x.PlanId.ToString(), x.CoverageRule, x.CustomPrice, x.ShowPrice)).ToList());
}
