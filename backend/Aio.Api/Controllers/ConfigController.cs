using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/configuracoes")]
public sealed class ConfigController(AioDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ClinicConfigDto>> Get(CancellationToken cancellationToken)
    {
        return Ok(await BuildConfig(cancellationToken));
    }

    [Authorize(Roles = "admin")]
    [HttpPut]
    public async Task<ActionResult<ClinicConfigDto>> Save(ClinicConfigDto request, CancellationToken cancellationToken)
    {
        await Upsert("clinicName", request.ClinicName, "string", cancellationToken);
        await Upsert("logoUrl", request.LogoUrl, "string", cancellationToken);
        await Upsert("theme.primary", request.Theme.Primary, "color", cancellationToken);
        await Upsert("theme.primaryLight", request.Theme.PrimaryLight, "color", cancellationToken);
        await Upsert("theme.bgBase", request.Theme.BgBase, "color", cancellationToken);
        await Upsert("theme.bgSecondary", request.Theme.BgSecondary, "color", cancellationToken);
        await Upsert("theme.brownDark", request.Theme.BrownDark, "color", cancellationToken);
        await Upsert("theme.brownMid", request.Theme.BrownMid, "color", cancellationToken);
        await Upsert("theme.surface", request.Theme.Surface, "color", cancellationToken);
        await Upsert("theme.headingFont", request.Theme.HeadingFont, "font", cancellationToken);
        await Upsert("theme.bodyFont", request.Theme.BodyFont, "font", cancellationToken);
        await Upsert("address", request.Address, "string", cancellationToken);
        await Upsert("coordinates.lat", request.Coordinates.Lat.ToString(System.Globalization.CultureInfo.InvariantCulture), "decimal", cancellationToken);
        await Upsert("coordinates.lng", request.Coordinates.Lng.ToString(System.Globalization.CultureInfo.InvariantCulture), "decimal", cancellationToken);
        await Upsert("whatsappUrl", request.WhatsappUrl, "url", cancellationToken);
        await Upsert("instagramUrl", request.InstagramUrl, "url", cancellationToken);
        await Upsert("openingHours", request.OpeningHours, "string", cancellationToken);
        await Upsert("about.text", request.About.Text, "text", cancellationToken);

        db.HistoricMilestones.RemoveRange(await db.HistoricMilestones.ToListAsync(cancellationToken));
        db.HistoricMilestones.AddRange(request.About.Milestones.Select((item, index) => new HistoricMilestone
        {
            Id = Guid.NewGuid(),
            YearLabel = item.Date,
            Title = item.Title,
            Description = item.Description,
            SortOrder = index + 1
        }));

        var mvv = await db.MissionVisionValues.FirstOrDefaultAsync(cancellationToken);
        if (mvv is null)
        {
            db.MissionVisionValues.Add(new MissionVisionValue { Id = Guid.NewGuid(), Mission = request.About.Mvv.Mission, Vision = request.About.Mvv.Vision, Values = request.About.Mvv.Values });
        }
        else
        {
            mvv.Mission = request.About.Mvv.Mission;
            mvv.Vision = request.About.Mvv.Vision;
            mvv.Values = request.About.Mvv.Values;
        }

        db.AboutGalleryItems.RemoveRange(await db.AboutGalleryItems.ToListAsync(cancellationToken));
        db.AboutGalleryItems.AddRange(request.About.Gallery.Select((imageUrl, index) => new AboutGalleryItem
        {
            Id = Guid.NewGuid(),
            ImageUrl = imageUrl,
            SortOrder = index + 1
        }));

        await db.SaveChangesAsync(cancellationToken);
        return Ok(await BuildConfig(cancellationToken));
    }

    private async Task Upsert(string key, string value, string valueType, CancellationToken cancellationToken)
    {
        var setting = await db.AppSettings.FirstOrDefaultAsync(x => x.Key == key, cancellationToken);
        if (setting is null)
        {
            db.AppSettings.Add(new AppSetting { Id = Guid.NewGuid(), Key = key, Value = value, ValueType = valueType });
        }
        else
        {
            setting.Value = value;
            setting.ValueType = valueType;
        }
    }

    private async Task<ClinicConfigDto> BuildConfig(CancellationToken cancellationToken)
    {
        var settings = await db.AppSettings.AsNoTracking().ToDictionaryAsync(x => x.Key, x => x.Value, cancellationToken);
        var banners = await db.Banners.AsNoTracking().OrderBy(x => x.SortOrder).ToListAsync(cancellationToken);
        var milestones = await db.HistoricMilestones.AsNoTracking().OrderBy(x => x.SortOrder).ToListAsync(cancellationToken);
        var mvv = await db.MissionVisionValues.AsNoTracking().FirstAsync(cancellationToken);
        var gallery = await db.AboutGalleryItems.AsNoTracking().OrderBy(x => x.SortOrder).ToListAsync(cancellationToken);
        var templates = await db.MessageTemplates.AsNoTracking().ToListAsync(cancellationToken);
        var rules = await db.NotificationRules.AsNoTracking().ToListAsync(cancellationToken);
        var configuredIntegrations = await db.AppSettings.AsNoTracking().Where(x => x.ValueType == "integration").ToListAsync(cancellationToken);

        string S(string key, string fallback = "") => settings.GetValueOrDefault(key, fallback);
        decimal D(string key) => decimal.Parse(S(key, "0"), System.Globalization.CultureInfo.InvariantCulture);

        return new ClinicConfigDto(
            S("clinicName"),
            S("logoUrl"),
            new ThemeConfigDto(S("theme.primary"), S("theme.primaryLight"), S("theme.bgBase"), S("theme.bgSecondary"), S("theme.brownDark"), S("theme.brownMid"), S("theme.surface"), S("theme.headingFont"), S("theme.bodyFont")),
            S("address"),
            new CoordinatesDto(D("coordinates.lat"), D("coordinates.lng")),
            S("whatsappUrl"),
            S("instagramUrl"),
            S("openingHours"),
            banners.Select(x => new BannerDto(x.Id.ToString(), x.Title, x.Subtitle, x.CtaText, x.CtaUrl, x.ImageUrl, x.SortOrder, x.Active)).ToList(),
            new AboutContentDto(S("about.text"), milestones.Select(x => new MilestoneDto(x.YearLabel, x.Title, x.Description)).ToList(), new MvvDto(mvv.Mission, mvv.Vision, mvv.Values), gallery.Select(x => x.ImageUrl).ToList()),
            templates.Select(x => new MessageTemplateDto(x.Id.ToString(), x.Occasion, x.Channel, x.Body)).ToList(),
            rules.Select(x => new NotificationRuleDto(x.Id.ToString(), x.Trigger, x.LeadTime, x.Channel, x.TemplateId.ToString(), x.Active)).ToList(),
            configuredIntegrations.Count > 0 ? configuredIntegrations.Select(ToIntegration).ToList() : new[]
            {
                new IntegrationDto("gmail-oauth", "Gmail OAuth", "mock", "Autorizacao de caixa postal para envio e leitura de mensagens."),
                new IntegrationDto("mercado-pago", "Mercado Pago", "mock", "Cobrancas, links de pagamento e conciliacao."),
                new IntegrationDto("whatsapp-business", "WhatsApp Business API", "mock", "Mensagens transacionais e conversas operacionais.")
            });
    }

    private static IntegrationDto ToIntegration(AppSetting setting)
    {
        try
        {
            var fields = JsonSerializer.Deserialize<Dictionary<string, string>>(setting.Value) ?? new Dictionary<string, string>();
            string Get(string key, string fallback = "") => fields.TryGetValue(key, out var value) ? value : fallback;
            return new IntegrationDto(setting.Id.ToString(), Get("name", setting.Key), Get("status", "mock"), Get("description"));
        }
        catch (JsonException)
        {
            return new IntegrationDto(setting.Id.ToString(), setting.Key.Replace("integration.", ""), "mock", setting.Value);
        }
    }
}
