using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public sealed class AdminController(AioDbContext db) : ControllerBase
{
    [HttpGet("usuarios")]
    public async Task<ActionResult<IReadOnlyList<SafeUserDto>>> GetUsers(CancellationToken cancellationToken)
    {
        var users = await db.Users.Include(x => x.UserRoles).ThenInclude(x => x.Role).AsNoTracking().ToListAsync(cancellationToken);
        return Ok(users.Select(x => new SafeUserDto(ApiIds.User(x.Id), x.FullName, x.Email, x.Phone, x.UserRoles.Select(r => r.Role.Name).FirstOrDefault() ?? "paciente")).ToList());
    }

    [HttpGet("crud/{resource}")]
    public async Task<ActionResult<IReadOnlyList<AdminCrudItemDto>>> List(string resource, CancellationToken cancellationToken)
    {
        switch (resource)
        {
            case "profissionais":
            {
                var items = await db.Professionals.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(ApiIds.Professional(x.Id), x.Name, x.Specialty, x.ProvidesCare ? "profissional" : "equipe", new Dictionary<string, string>
                {
                    ["name"] = x.Name,
                    ["specialty"] = x.Specialty,
                    ["bio"] = x.Bio,
                    ["photoUrl"] = x.PhotoUrl,
                    ["defaultCommission"] = x.DefaultCommissionPercent.ToString(),
                    ["monthlyFixedPayment"] = x.MonthlyFixedPayment == null ? "" : x.MonthlyFixedPayment.ToString()!,
                    ["providesCare"] = x.ProvidesCare ? "true" : "false"
                })).ToList());
            }
            case "servicos":
            {
                var items = await db.Services.Include(x => x.ServiceCategories).ThenInclude(x => x.Category).AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(ApiIds.Service(x.Id), x.Name, x.ServiceCategories.Select(c => c.Category.Name).FirstOrDefault() ?? "", x.BasePrice.ToString(), new Dictionary<string, string>
                {
                    ["name"] = x.Name,
                    ["category"] = x.ServiceCategories.Select(c => c.Category.Name).FirstOrDefault() ?? "",
                    ["shortDescription"] = x.ShortDescription,
                    ["description"] = x.Description,
                    ["durationMinutes"] = x.DurationMinutes.ToString(),
                    ["basePrice"] = x.BasePrice.ToString()
                })).ToList());
            }
            case "vagas":
            {
                var items = await db.JobOpenings.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Title, x.Department, x.Status, new Dictionary<string, string> { ["title"] = x.Title, ["department"] = x.Department, ["description"] = x.Description, ["status"] = x.Status })).ToList());
            }
            case "categorias":
            {
                var items = await db.Categories.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Name, x.Type, "", new Dictionary<string, string> { ["name"] = x.Name, ["type"] = x.Type })).ToList());
            }
            case "salas":
            {
                var items = await db.Rooms.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Name, $"Capacidade {x.Capacity}", "", new Dictionary<string, string> { ["name"] = x.Name, ["capacity"] = x.Capacity.ToString(), ["notes"] = x.Notes })).ToList());
            }
            case "equipamentos":
            {
                var items = await db.Equipments.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Name, x.Category, x.Quantity.ToString(), new Dictionary<string, string> { ["name"] = x.Name, ["category"] = x.Category, ["quantity"] = x.Quantity.ToString(), ["unitValue"] = x.UnitValue.ToString() })).ToList());
            }
            case "templates":
            {
                var items = await db.MessageTemplates.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Occasion, x.Channel, "", new Dictionary<string, string> { ["occasion"] = x.Occasion, ["channel"] = x.Channel, ["body"] = x.Body })).ToList());
            }
            case "notificacoes":
            {
                var items = await db.NotificationRules.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Trigger, x.LeadTime, x.Active ? "ativo" : "inativo", new Dictionary<string, string> { ["trigger"] = x.Trigger, ["leadTime"] = x.LeadTime, ["channel"] = x.Channel, ["templateId"] = x.TemplateId.ToString(), ["active"] = x.Active ? "true" : "false" })).ToList());
            }
            case "planos":
            {
                var items = await db.Plans.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Name, x.Description, "", new Dictionary<string, string> { ["name"] = x.Name, ["description"] = x.Description })).ToList());
            }
            case "integracoes":
            {
                var items = await db.AppSettings.AsNoTracking().Where(x => x.ValueType == "integration").ToListAsync(cancellationToken);
                return Ok(items.Select(x =>
                {
                    var fields = IntegrationFields(x);
                    return new AdminCrudItemDto(x.Id.ToString(), Get(fields, "name", x.Key), Get(fields, "description"), Get(fields, "status", "mock"), fields);
                }).ToList());
            }
            case "chat-interno":
            {
                var items = await db.MessagingChannels.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Name, x.ParticipantRule, "", new Dictionary<string, string> { ["name"] = x.Name, ["participantRule"] = x.ParticipantRule })).ToList());
            }
            case "banners":
            {
                var items = await db.Banners.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Title, x.Subtitle, x.Active ? "ativo" : "inativo", new Dictionary<string, string> { ["title"] = x.Title, ["subtitle"] = x.Subtitle, ["ctaText"] = x.CtaText, ["ctaUrl"] = x.CtaUrl, ["imageUrl"] = x.ImageUrl, ["order"] = x.SortOrder.ToString(), ["active"] = x.Active ? "true" : "false" })).ToList());
            }
            case "custos":
            {
                var items = await db.Costs.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.Name, x.MonthLabel, x.Value.ToString(), new Dictionary<string, string> { ["name"] = x.Name, ["month"] = x.MonthLabel, ["type"] = x.Type == CostType.Fixo ? "fixo" : "variavel", ["value"] = x.Value.ToString() })).ToList());
            }
            case "movimento":
            {
                var items = await db.MovementLogs.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);
                return Ok(items.Select(x => new AdminCrudItemDto(x.Id.ToString(), x.EventType, x.Description, x.CreatedAt.ToString("yyyy-MM-dd HH:mm"), new Dictionary<string, string> { ["eventType"] = x.EventType, ["description"] = x.Description, ["createdAt"] = x.CreatedAt.ToString("yyyy-MM-ddTHH:mm") })).ToList());
            }
            default:
                return NotFound(new { message = "Recurso administrativo nao encontrado." });
        }
    }

    [HttpPost("crud/{resource}")]
    public async Task<ActionResult<AdminCrudItemDto>> Create(string resource, AdminCrudSaveDto request, CancellationToken cancellationToken)
    {
        var fields = request.Fields;
        var createdId = "";
        switch (resource)
        {
            case "profissionais":
                var professionalId = Guid.NewGuid();
                db.Professionals.Add(new Professional
                {
                    Id = professionalId,
                    Name = Get(fields, "name", "Novo profissional"),
                    Specialty = Get(fields, "specialty"),
                    Bio = Get(fields, "bio"),
                    PhotoUrl = Get(fields, "photoUrl"),
                    DefaultCommissionPercent = Decimal(fields, "defaultCommission"),
                    MonthlyFixedPayment = NullableDecimal(fields, "monthlyFixedPayment"),
                    ProvidesCare = Bool(fields, "providesCare", true)
                });
                createdId = ApiIds.Professional(professionalId);
                break;
            case "servicos":
                var serviceId = Guid.NewGuid();
                var service = new Service
                {
                    Id = serviceId,
                    Name = Get(fields, "name", "Novo servico"),
                    ShortDescription = Get(fields, "shortDescription"),
                    Description = Get(fields, "description"),
                    DurationMinutes = Int(fields, "durationMinutes", 60),
                    BasePrice = Decimal(fields, "basePrice")
                };
                db.Services.Add(service);
                await AttachCategory(service.Id, Get(fields, "category"), cancellationToken);
                createdId = ApiIds.Service(serviceId);
                break;
            case "vagas":
                createdId = Guid.NewGuid().ToString();
                db.JobOpenings.Add(new JobOpening { Id = Guid.Parse(createdId), Title = Get(fields, "title", "Nova vaga"), Department = Get(fields, "department"), Description = Get(fields, "description"), Status = Get(fields, "status", "aberta") });
                break;
            case "categorias":
                createdId = Guid.NewGuid().ToString();
                db.Categories.Add(new Category { Id = Guid.Parse(createdId), Name = Get(fields, "name", "Nova categoria"), Type = Get(fields, "type", "geral") });
                break;
            case "salas":
                createdId = Guid.NewGuid().ToString();
                db.Rooms.Add(new Room { Id = Guid.Parse(createdId), Name = Get(fields, "name", "Nova sala"), Capacity = Int(fields, "capacity", 1), Notes = Get(fields, "notes") });
                break;
            case "equipamentos":
                createdId = Guid.NewGuid().ToString();
                db.Equipments.Add(new Equipment { Id = Guid.Parse(createdId), Name = Get(fields, "name", "Novo equipamento"), Category = Get(fields, "category"), Quantity = Int(fields, "quantity", 1), UnitValue = Decimal(fields, "unitValue") });
                break;
            case "templates":
                createdId = Guid.NewGuid().ToString();
                db.MessageTemplates.Add(new MessageTemplate { Id = Guid.Parse(createdId), Occasion = Get(fields, "occasion", "Ocasião"), Channel = Get(fields, "channel", "WhatsApp"), Body = Get(fields, "body") });
                break;
            case "notificacoes":
                createdId = Guid.NewGuid().ToString();
                db.NotificationRules.Add(new NotificationRule { Id = Guid.Parse(createdId), Trigger = Get(fields, "trigger", "Lembrete"), LeadTime = Get(fields, "leadTime", "24h antes"), Channel = Get(fields, "channel", "WhatsApp"), TemplateId = await TemplateId(fields, cancellationToken), Active = Bool(fields, "active", true) });
                break;
            case "planos":
                createdId = Guid.NewGuid().ToString();
                db.Plans.Add(new Plan { Id = Guid.Parse(createdId), Name = Get(fields, "name", "Novo plano"), Description = Get(fields, "description") });
                break;
            case "integracoes":
                createdId = Guid.NewGuid().ToString();
                db.AppSettings.Add(new AppSetting { Id = Guid.Parse(createdId), Key = $"integration.{Guid.NewGuid():N}", Value = IntegrationValue(fields), ValueType = "integration" });
                break;
            case "chat-interno":
                createdId = Guid.NewGuid().ToString();
                db.MessagingChannels.Add(new MessagingChannel { Id = Guid.Parse(createdId), Name = Get(fields, "name", "Novo canal"), ParticipantRule = Get(fields, "participantRule", "role:admin") });
                break;
            case "banners":
                createdId = Guid.NewGuid().ToString();
                db.Banners.Add(new Banner { Id = Guid.Parse(createdId), Title = Get(fields, "title", "Novo banner"), Subtitle = Get(fields, "subtitle"), CtaText = Get(fields, "ctaText", "Saiba mais"), CtaUrl = Get(fields, "ctaUrl", "/"), ImageUrl = Get(fields, "imageUrl"), SortOrder = Int(fields, "order", 99), Active = Bool(fields, "active", true) });
                break;
            case "custos":
                createdId = Guid.NewGuid().ToString();
                db.Costs.Add(new Cost { Id = Guid.Parse(createdId), Name = Get(fields, "name", "Novo custo"), MonthLabel = Get(fields, "month", "Mai/26"), Type = Get(fields, "type") == "variavel" ? CostType.Variavel : CostType.Fixo, Value = Decimal(fields, "value") });
                break;
            case "movimento":
                createdId = Guid.NewGuid().ToString();
                db.MovementLogs.Add(new MovementLog { Id = Guid.Parse(createdId), EventType = Get(fields, "eventType", "evento"), Description = Get(fields, "description"), CreatedAt = Date(fields, "createdAt", DateTime.UtcNow) });
                break;
            default:
                return NotFound(new { message = "Recurso administrativo nao encontrado." });
        }

        await db.SaveChangesAsync(cancellationToken);
        var list = await List(resource, cancellationToken);
        if (list.Result is OkObjectResult ok && ok.Value is IReadOnlyList<AdminCrudItemDto> items)
        {
            return Ok(items.FirstOrDefault(x => x.Id == createdId));
        }
        return Ok();
    }

    [HttpPut("crud/{resource}/{id}")]
    public async Task<IActionResult> Update(string resource, string id, AdminCrudSaveDto request, CancellationToken cancellationToken)
    {
        var fields = request.Fields;
        switch (resource)
        {
            case "profissionais":
                var professional = await db.Professionals.FindAsync([ApiIds.Professional(id)], cancellationToken);
                if (professional is null) return NotFound();
                professional.Name = Get(fields, "name", professional.Name);
                professional.Specialty = Get(fields, "specialty", professional.Specialty);
                professional.Bio = Get(fields, "bio", professional.Bio);
                professional.PhotoUrl = Get(fields, "photoUrl", professional.PhotoUrl);
                professional.DefaultCommissionPercent = Decimal(fields, "defaultCommission", professional.DefaultCommissionPercent);
                professional.MonthlyFixedPayment = NullableDecimal(fields, "monthlyFixedPayment");
                professional.ProvidesCare = Bool(fields, "providesCare", professional.ProvidesCare);
                break;
            case "servicos":
                var service = await db.Services.FindAsync([ApiIds.Service(id)], cancellationToken);
                if (service is null) return NotFound();
                service.Name = Get(fields, "name", service.Name);
                service.ShortDescription = Get(fields, "shortDescription", service.ShortDescription);
                service.Description = Get(fields, "description", service.Description);
                service.DurationMinutes = Int(fields, "durationMinutes", service.DurationMinutes);
                service.BasePrice = Decimal(fields, "basePrice", service.BasePrice);
                break;
            case "vagas":
                var job = await db.JobOpenings.FindAsync([Guid.Parse(id)], cancellationToken);
                if (job is null) return NotFound();
                job.Title = Get(fields, "title", job.Title); job.Department = Get(fields, "department", job.Department); job.Description = Get(fields, "description", job.Description); job.Status = Get(fields, "status", job.Status);
                break;
            case "categorias":
                var category = await db.Categories.FindAsync([Guid.Parse(id)], cancellationToken);
                if (category is null) return NotFound();
                category.Name = Get(fields, "name", category.Name); category.Type = Get(fields, "type", category.Type);
                break;
            case "salas":
                var room = await db.Rooms.FindAsync([Guid.Parse(id)], cancellationToken);
                if (room is null) return NotFound();
                room.Name = Get(fields, "name", room.Name); room.Capacity = Int(fields, "capacity", room.Capacity); room.Notes = Get(fields, "notes", room.Notes);
                break;
            case "equipamentos":
                var equipment = await db.Equipments.FindAsync([Guid.Parse(id)], cancellationToken);
                if (equipment is null) return NotFound();
                equipment.Name = Get(fields, "name", equipment.Name); equipment.Category = Get(fields, "category", equipment.Category); equipment.Quantity = Int(fields, "quantity", equipment.Quantity); equipment.UnitValue = Decimal(fields, "unitValue", equipment.UnitValue);
                break;
            case "templates":
                var template = await db.MessageTemplates.FindAsync([Guid.Parse(id)], cancellationToken);
                if (template is null) return NotFound();
                template.Occasion = Get(fields, "occasion", template.Occasion); template.Channel = Get(fields, "channel", template.Channel); template.Body = Get(fields, "body", template.Body);
                break;
            case "notificacoes":
                var rule = await db.NotificationRules.FindAsync([Guid.Parse(id)], cancellationToken);
                if (rule is null) return NotFound();
                rule.Trigger = Get(fields, "trigger", rule.Trigger); rule.LeadTime = Get(fields, "leadTime", rule.LeadTime); rule.Channel = Get(fields, "channel", rule.Channel); rule.TemplateId = await TemplateId(fields, cancellationToken); rule.Active = Bool(fields, "active", rule.Active);
                break;
            case "planos":
                var plan = await db.Plans.FindAsync([Guid.Parse(id)], cancellationToken);
                if (plan is null) return NotFound();
                plan.Name = Get(fields, "name", plan.Name); plan.Description = Get(fields, "description", plan.Description);
                break;
            case "integracoes":
                var integration = await db.AppSettings.FirstOrDefaultAsync(x => x.Id == Guid.Parse(id) && x.ValueType == "integration", cancellationToken);
                if (integration is null) return NotFound();
                integration.Value = IntegrationValue(fields);
                break;
            case "chat-interno":
                var channel = await db.MessagingChannels.FindAsync([Guid.Parse(id)], cancellationToken);
                if (channel is null) return NotFound();
                channel.Name = Get(fields, "name", channel.Name); channel.ParticipantRule = Get(fields, "participantRule", channel.ParticipantRule);
                break;
            case "banners":
                var banner = await db.Banners.FindAsync([Guid.Parse(id)], cancellationToken);
                if (banner is null) return NotFound();
                banner.Title = Get(fields, "title", banner.Title); banner.Subtitle = Get(fields, "subtitle", banner.Subtitle); banner.CtaText = Get(fields, "ctaText", banner.CtaText); banner.CtaUrl = Get(fields, "ctaUrl", banner.CtaUrl); banner.ImageUrl = Get(fields, "imageUrl", banner.ImageUrl); banner.SortOrder = Int(fields, "order", banner.SortOrder); banner.Active = Bool(fields, "active", banner.Active);
                break;
            case "custos":
                var cost = await db.Costs.FindAsync([Guid.Parse(id)], cancellationToken);
                if (cost is null) return NotFound();
                cost.Name = Get(fields, "name", cost.Name); cost.MonthLabel = Get(fields, "month", cost.MonthLabel); cost.Type = Get(fields, "type") == "variavel" ? CostType.Variavel : CostType.Fixo; cost.Value = Decimal(fields, "value", cost.Value);
                break;
            case "movimento":
                var movement = await db.MovementLogs.FindAsync([Guid.Parse(id)], cancellationToken);
                if (movement is null) return NotFound();
                movement.EventType = Get(fields, "eventType", movement.EventType); movement.Description = Get(fields, "description", movement.Description); movement.CreatedAt = Date(fields, "createdAt", movement.CreatedAt);
                break;
            default:
                return NotFound(new { message = "Recurso administrativo nao encontrado." });
        }
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("crud/{resource}/{id}")]
    public async Task<IActionResult> Delete(string resource, string id, CancellationToken cancellationToken)
    {
        object? entity = resource switch
        {
            "profissionais" => await db.Professionals.FindAsync([ApiIds.Professional(id)], cancellationToken),
            "servicos" => await db.Services.FindAsync([ApiIds.Service(id)], cancellationToken),
            "vagas" => await db.JobOpenings.FindAsync([Guid.Parse(id)], cancellationToken),
            "categorias" => await db.Categories.FindAsync([Guid.Parse(id)], cancellationToken),
            "salas" => await db.Rooms.FindAsync([Guid.Parse(id)], cancellationToken),
            "equipamentos" => await db.Equipments.FindAsync([Guid.Parse(id)], cancellationToken),
            "templates" => await db.MessageTemplates.FindAsync([Guid.Parse(id)], cancellationToken),
            "notificacoes" => await db.NotificationRules.FindAsync([Guid.Parse(id)], cancellationToken),
            "planos" => await db.Plans.FindAsync([Guid.Parse(id)], cancellationToken),
            "integracoes" => await db.AppSettings.FirstOrDefaultAsync(x => x.Id == Guid.Parse(id) && x.ValueType == "integration", cancellationToken),
            "chat-interno" => await db.MessagingChannels.FindAsync([Guid.Parse(id)], cancellationToken),
            "banners" => await db.Banners.FindAsync([Guid.Parse(id)], cancellationToken),
            "custos" => await db.Costs.FindAsync([Guid.Parse(id)], cancellationToken),
            "movimento" => await db.MovementLogs.FindAsync([Guid.Parse(id)], cancellationToken),
            _ => null
        };
        if (entity is null) return NotFound();
        db.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task AttachCategory(Guid serviceId, string categoryName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(categoryName)) return;
        var category = await db.Categories.FirstOrDefaultAsync(x => x.Name == categoryName, cancellationToken);
        if (category is null)
        {
            category = new Category { Id = Guid.NewGuid(), Name = categoryName, Type = "servico" };
            db.Categories.Add(category);
        }
        db.ServiceCategories.Add(new ServiceCategory { ServiceId = serviceId, CategoryId = category.Id });
    }

    private async Task<Guid> TemplateId(Dictionary<string, string> fields, CancellationToken cancellationToken)
    {
        if (Guid.TryParse(Get(fields, "templateId"), out var parsed)) return parsed;
        return await db.MessageTemplates.Select(x => x.Id).FirstAsync(cancellationToken);
    }

    private static string Get(Dictionary<string, string> fields, string key, string fallback = "") => fields.TryGetValue(key, out var value) ? value : fallback;
    private static int Int(Dictionary<string, string> fields, string key, int fallback = 0) => int.TryParse(Get(fields, key), out var value) ? value : fallback;
    private static decimal Decimal(Dictionary<string, string> fields, string key, decimal fallback = 0) => decimal.TryParse(Get(fields, key), out var value) ? value : fallback;
    private static decimal? NullableDecimal(Dictionary<string, string> fields, string key) => decimal.TryParse(Get(fields, key), out var value) ? value : null;
    private static bool Bool(Dictionary<string, string> fields, string key, bool fallback = false) => bool.TryParse(Get(fields, key), out var value) ? value : fallback;
    private static DateTime Date(Dictionary<string, string> fields, string key, DateTime fallback) => DateTime.TryParse(Get(fields, key), out var value) ? value : fallback;
    private static string IntegrationValue(Dictionary<string, string> fields) => JsonSerializer.Serialize(new Dictionary<string, string>
    {
        ["name"] = Get(fields, "name", "Nova integracao"),
        ["status"] = Get(fields, "status", "mock"),
        ["description"] = Get(fields, "description")
    });

    private static Dictionary<string, string> IntegrationFields(AppSetting setting)
    {
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(setting.Value) ?? new Dictionary<string, string>();
        }
        catch (JsonException)
        {
            return new Dictionary<string, string> { ["name"] = setting.Key.Replace("integration.", ""), ["status"] = "mock", ["description"] = setting.Value };
        }
    }
}

public sealed record AdminCrudItemDto(string Id, string Title, string Subtitle, string Status, Dictionary<string, string> Fields);
public sealed record AdminCrudSaveDto(Dictionary<string, string> Fields);


