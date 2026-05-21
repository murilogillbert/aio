using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/admin/clinica")]
[Authorize(Roles = "admin")]
public sealed class ClinicController(AioDbContext db) : ControllerBase
{
    [HttpGet("integracoes")]
    public async Task<ActionResult<IntegrationsDto>> Get(CancellationToken cancellationToken)
    {
        var clinic = await Clinic(cancellationToken);
        return Ok(Map(clinic));
    }

    [HttpPut("integracoes")]
    public async Task<ActionResult<IntegrationsDto>> Update([FromBody] IntegrationsPatchDto patch, CancellationToken cancellationToken)
    {
        var clinic = await Clinic(cancellationToken);
        ApplyPatch(clinic, patch);
        clinic.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(Map(clinic));
    }

    [HttpPost("integracoes/gmail/test")]
    public async Task<ActionResult<TestResultDto>> TestGmail(CancellationToken cancellationToken)
    {
        var clinic = await Clinic(cancellationToken);
        if (string.IsNullOrWhiteSpace(clinic.GmailClientId) || string.IsNullOrWhiteSpace(clinic.GmailClientSecret))
            return BadFail("Gmail", "Configure Client ID e Client Secret antes de testar.");
        if (string.IsNullOrWhiteSpace(clinic.GmailAccessToken))
        {
            clinic.GmailConnected = false;
            await db.SaveChangesAsync(cancellationToken);
            return Ok(new TestResultDto(false, "Credenciais salvas. Conecte uma conta Google pelo fluxo OAuth para ativar.", "OAuth callback pendente"));
        }
        clinic.GmailConnected = true;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new TestResultDto(true, "Gmail conectado.", $"Token expira {(clinic.GmailTokenExpiresAt?.ToString("O") ?? "—")}"));
    }

    [HttpPost("integracoes/pubsub/test")]
    public async Task<ActionResult<TestResultDto>> TestPubSub(CancellationToken cancellationToken)
    {
        var clinic = await Clinic(cancellationToken);
        if (string.IsNullOrWhiteSpace(clinic.PubSubProjectId) || string.IsNullOrWhiteSpace(clinic.PubSubTopicName))
            return BadFail("Pub/Sub", "Informe Project ID e nome do tópico.");
        if (string.IsNullOrWhiteSpace(clinic.PubSubServiceAccount))
            return BadFail("Pub/Sub", "Cole o JSON da service account.");
        if (!LooksLikeJson(clinic.PubSubServiceAccount))
            return BadFail("Pub/Sub", "Service Account deve ser um JSON válido.");
        clinic.PubSubConnected = true;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new TestResultDto(true, "Pub/Sub configurado.", $"Tópico {clinic.PubSubTopicName}"));
    }

    [HttpPost("integracoes/whatsapp/test")]
    public async Task<ActionResult<TestResultDto>> TestWhatsApp(CancellationToken cancellationToken)
    {
        var clinic = await Clinic(cancellationToken);
        if (string.IsNullOrWhiteSpace(clinic.WaPhoneNumberId) || string.IsNullOrWhiteSpace(clinic.WaWabaId) || string.IsNullOrWhiteSpace(clinic.WaAccessToken))
            return BadFail("WhatsApp", "Preencha Phone Number ID, WABA ID e Access Token.");
        if (clinic.WaAccessToken.Length < 40)
            return BadFail("WhatsApp", "Access Token parece curto demais para um token da Cloud API.");
        clinic.WaConnected = true;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new TestResultDto(true, "WhatsApp Business conectado.", $"WABA {clinic.WaWabaId}"));
    }

    [HttpPost("integracoes/mercadopago/test")]
    public async Task<ActionResult<TestResultDto>> TestMercadoPago(CancellationToken cancellationToken)
    {
        var clinic = await Clinic(cancellationToken);
        var token = clinic.MpSandboxMode ? clinic.MpAccessTokenSandbox : clinic.MpAccessTokenProd;
        if (string.IsNullOrWhiteSpace(token))
            return BadFail("Mercado Pago", clinic.MpSandboxMode ? "Token sandbox obrigatório no modo de testes." : "Token de produção obrigatório.");
        if (string.IsNullOrWhiteSpace(clinic.MpPublicKey))
            return BadFail("Mercado Pago", "Informe a Public Key.");
        if (!token.StartsWith("APP_USR") && !token.StartsWith("TEST"))
            return BadFail("Mercado Pago", "Access Token deve começar com APP_USR ou TEST.");
        clinic.MpConnected = true;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new TestResultDto(true, $"Mercado Pago conectado em {(clinic.MpSandboxMode ? "sandbox" : "produção")}.", "Use o link de pagamento na agenda."));
    }

    [HttpPost("integracoes/resend/test")]
    public async Task<ActionResult<TestResultDto>> TestResend([FromBody] TestResendDto body, CancellationToken cancellationToken)
    {
        var clinic = await Clinic(cancellationToken);
        if (string.IsNullOrWhiteSpace(clinic.ResendApiKey))
            return BadFail("Resend", "API Key obrigatória.");
        if (string.IsNullOrWhiteSpace(clinic.ResendFromEmail))
            return BadFail("Resend", "Remetente obrigatório.");
        if (!IsEmail(clinic.ResendFromEmail))
            return BadFail("Resend", "Remetente inválido.");
        if (!string.IsNullOrWhiteSpace(body.TestEmail) && !IsEmail(body.TestEmail))
            return BadFail("Resend", "E-mail de teste inválido.");
        if (clinic.ResendApiKey.StartsWith("re_") == false)
            return BadFail("Resend", "API Key do Resend começa com 're_'.");
        clinic.ResendConnected = true;
        await db.SaveChangesAsync(cancellationToken);
        var detail = string.IsNullOrWhiteSpace(body.TestEmail) ? "Pronto para enviar e-mails." : $"Mock: e-mail de teste seria enviado para {body.TestEmail}.";
        return Ok(new TestResultDto(true, "Resend conectado.", detail));
    }

    [HttpPost("integracoes/smtp/test")]
    public async Task<ActionResult<TestResultDto>> TestSmtp(CancellationToken cancellationToken)
    {
        var clinic = await Clinic(cancellationToken);
        if (string.IsNullOrWhiteSpace(clinic.SmtpHost) || !clinic.SmtpPort.HasValue || string.IsNullOrWhiteSpace(clinic.SmtpUsername) || string.IsNullOrWhiteSpace(clinic.SmtpPassword))
            return BadFail("SMTP", "Host, porta, usuário e senha são obrigatórios.");
        if (clinic.SmtpPort is < 1 or > 65535)
            return BadFail("SMTP", "Porta fora do intervalo permitido (1-65535).");
        if (string.IsNullOrWhiteSpace(clinic.SmtpFrom) || !IsEmail(clinic.SmtpFrom))
            return BadFail("SMTP", "Remetente inválido.");
        clinic.SmtpConnected = true;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new TestResultDto(true, "SMTP configurado.", $"{clinic.SmtpHost}:{clinic.SmtpPort}"));
    }

    [HttpPost("integracoes/instagram/test")]
    public async Task<ActionResult<TestResultDto>> TestInstagram(CancellationToken cancellationToken)
    {
        var clinic = await Clinic(cancellationToken);
        if (string.IsNullOrWhiteSpace(clinic.IgAccountId) || string.IsNullOrWhiteSpace(clinic.IgPageId) || string.IsNullOrWhiteSpace(clinic.IgAccessToken))
            return BadFail("Instagram", "Account ID, Page ID e Access Token são obrigatórios.");
        if (clinic.IgAccessToken.Length < 40)
            return BadFail("Instagram", "Access Token muito curto.");
        clinic.IgConnected = true;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new TestResultDto(true, "Instagram Direct conectado.", $"Conta {clinic.IgAccountId}"));
    }

    private async Task<Clinic> Clinic(CancellationToken cancellationToken)
    {
        var clinic = await db.Clinics.FirstOrDefaultAsync(cancellationToken);
        if (clinic is null)
        {
            clinic = new Clinic { Id = Guid.NewGuid(), Name = "Clínica", MpSandboxMode = true, RemindersEnabled = true, CreatedAt = DateTime.UtcNow };
            db.Clinics.Add(clinic);
            await db.SaveChangesAsync(cancellationToken);
        }
        return clinic;
    }

    private static IntegrationsDto Map(Clinic c) => new(
        new GmailIntegrationDto(c.GmailClientId, Mask(c.GmailClientSecret), Mask(c.GmailAccessToken), c.GmailTokenExpiresAt, c.GmailConnected),
        new PubSubIntegrationDto(c.PubSubProjectId, c.PubSubTopicName, Mask(c.PubSubServiceAccount), c.PubSubConnected),
        new WhatsAppIntegrationDto(c.WaPhoneNumberId, c.WaWabaId, Mask(c.WaAccessToken), Mask(c.WaVerifyToken), Mask(c.WaAppSecret), c.WaConnected),
        new MercadoPagoIntegrationDto(Mask(c.MpAccessTokenProd), Mask(c.MpAccessTokenSandbox), c.MpPublicKey, c.MpSandboxMode, c.MpConnected),
        new ResendIntegrationDto(Mask(c.ResendApiKey), c.ResendFromEmail, c.ResendFromName, c.ResendConnected),
        new SmtpIntegrationDto(c.SmtpHost, c.SmtpPort, c.SmtpUsername, Mask(c.SmtpPassword), c.SmtpFrom, c.SmtpConnected),
        new InstagramIntegrationDto(c.IgAccountId, c.IgPageId, Mask(c.IgAccessToken), Mask(c.IgAppSecret), Mask(c.IgVerifyToken), c.IgConnected),
        c.RemindersEnabled);

    private static string? Mask(string? value)
    {
        if (string.IsNullOrEmpty(value)) return null;
        if (value.Length <= 4) return "••••";
        return $"••••{value[^4..]}";
    }

    private static void ApplyPatch(Clinic clinic, IntegrationsPatchDto patch)
    {
        if (patch.Gmail is { } g)
        {
            if (g.ClientId is not null) clinic.GmailClientId = Normalize(g.ClientId);
            if (g.ClientSecret is not null && !IsMasked(g.ClientSecret)) clinic.GmailClientSecret = Normalize(g.ClientSecret);
            ResetConnectedIfChanged(g.ClientId, g.ClientSecret, () => clinic.GmailConnected = false);
        }
        if (patch.PubSub is { } ps)
        {
            var changed = false;
            if (ps.ProjectId is not null)
            {
                var normalized = Normalize(ps.ProjectId);
                if (!string.Equals(clinic.PubSubProjectId, normalized, StringComparison.Ordinal)) { clinic.PubSubProjectId = normalized; changed = true; }
            }
            if (ps.TopicName is not null)
            {
                var normalized = Normalize(ps.TopicName);
                if (!string.Equals(clinic.PubSubTopicName, normalized, StringComparison.Ordinal)) { clinic.PubSubTopicName = normalized; changed = true; }
            }
            if (ps.ServiceAccount is not null && !IsMasked(ps.ServiceAccount))
            {
                clinic.PubSubServiceAccount = Normalize(ps.ServiceAccount);
                changed = true;
            }
            if (changed) clinic.PubSubConnected = false;
        }
        if (patch.WhatsApp is { } w)
        {
            if (w.PhoneNumberId is not null) clinic.WaPhoneNumberId = Normalize(w.PhoneNumberId);
            if (w.WabaId is not null) clinic.WaWabaId = Normalize(w.WabaId);
            if (w.AccessToken is not null && !IsMasked(w.AccessToken)) clinic.WaAccessToken = Normalize(w.AccessToken);
            if (w.VerifyToken is not null && !IsMasked(w.VerifyToken)) clinic.WaVerifyToken = Normalize(w.VerifyToken);
            if (w.AppSecret is not null && !IsMasked(w.AppSecret)) clinic.WaAppSecret = Normalize(w.AppSecret);
            ResetConnectedIfChanged(w.PhoneNumberId, w.AccessToken, () => clinic.WaConnected = false);
        }
        if (patch.MercadoPago is { } mp)
        {
            if (mp.AccessTokenProd is not null && !IsMasked(mp.AccessTokenProd)) clinic.MpAccessTokenProd = Normalize(mp.AccessTokenProd);
            if (mp.AccessTokenSandbox is not null && !IsMasked(mp.AccessTokenSandbox)) clinic.MpAccessTokenSandbox = Normalize(mp.AccessTokenSandbox);
            if (mp.PublicKey is not null) clinic.MpPublicKey = Normalize(mp.PublicKey);
            if (mp.SandboxMode.HasValue) clinic.MpSandboxMode = mp.SandboxMode.Value;
            ResetConnectedIfChanged(mp.AccessTokenProd, mp.AccessTokenSandbox, () => clinic.MpConnected = false);
        }
        if (patch.Resend is { } r)
        {
            if (r.ApiKey is not null && !IsMasked(r.ApiKey)) { clinic.ResendApiKey = Normalize(r.ApiKey); clinic.ResendConnected = false; }
            if (r.FromEmail is not null) { clinic.ResendFromEmail = Normalize(r.FromEmail); clinic.ResendConnected = false; }
            if (r.FromName is not null) clinic.ResendFromName = Normalize(r.FromName);
        }
        if (patch.Smtp is { } s)
        {
            if (s.Host is not null) clinic.SmtpHost = Normalize(s.Host);
            if (s.Port.HasValue) clinic.SmtpPort = s.Port.Value;
            if (s.Username is not null) clinic.SmtpUsername = Normalize(s.Username);
            if (s.Password is not null && !IsMasked(s.Password)) clinic.SmtpPassword = Normalize(s.Password);
            if (s.From is not null) clinic.SmtpFrom = Normalize(s.From);
            if (s.Host is not null || s.Port.HasValue || s.Username is not null || s.From is not null || (s.Password is not null && !IsMasked(s.Password)))
                clinic.SmtpConnected = false;
        }
        if (patch.Instagram is { } ig)
        {
            if (ig.AccountId is not null) clinic.IgAccountId = Normalize(ig.AccountId);
            if (ig.PageId is not null) clinic.IgPageId = Normalize(ig.PageId);
            if (ig.AccessToken is not null && !IsMasked(ig.AccessToken)) clinic.IgAccessToken = Normalize(ig.AccessToken);
            if (ig.AppSecret is not null && !IsMasked(ig.AppSecret)) clinic.IgAppSecret = Normalize(ig.AppSecret);
            if (ig.VerifyToken is not null && !IsMasked(ig.VerifyToken)) clinic.IgVerifyToken = Normalize(ig.VerifyToken);
            ResetConnectedIfChanged(ig.AccessToken, ig.AccountId, () => clinic.IgConnected = false);
        }
        if (patch.RemindersEnabled.HasValue) clinic.RemindersEnabled = patch.RemindersEnabled.Value;
    }

    // Helpers
    private static string? Normalize(string value) => string.IsNullOrEmpty(value) ? null : value.Trim();
    private static bool IsMasked(string value) => value.StartsWith("••") || value.StartsWith("**");
    private static bool LooksLikeJson(string value) { try { System.Text.Json.JsonDocument.Parse(value); return true; } catch { return false; } }
    private static bool IsEmail(string value) => System.Text.RegularExpressions.Regex.IsMatch(value, "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private ActionResult<TestResultDto> BadFail(string label, string message) => Ok(new TestResultDto(false, $"{label}: {message}", null));
    private static void ResetConnectedIfChanged(string? a, string? b, Action reset) { if (a is not null || b is not null) reset(); }
}
