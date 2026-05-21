using Aio.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/integracoes")]
[Authorize(Roles = "admin")]
public sealed class IntegrationsController : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<ExternalIntegrationDto>> Get()
    {
        return Ok(new[]
        {
            new ExternalIntegrationDto("gmail-oauth", "Gmail OAuth", "mock", "OAuth configurado como stub para fase 3."),
            new ExternalIntegrationDto("gmail-pubsub", "Gmail Pub/Sub", "mock", "Assinatura Pub/Sub preparada para implementacao real."),
            new ExternalIntegrationDto("gmail-resend", "Gmail Resend", "mock", "Reenvio transacional preparado como stub."),
            new ExternalIntegrationDto("mercado-pago", "Mercado Pago", "mock", "Checkout e conciliacao simulados."),
            new ExternalIntegrationDto("whatsapp-business", "WhatsApp Business API", "mock", "Mensagens de WhatsApp simuladas.")
        });
    }
}

[ApiController]
[Route("api/jobs")]
[Authorize(Roles = "admin")]
public sealed class JobsController : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<JobStatusDto>> Get()
    {
        return Ok(new[]
        {
            new JobStatusDto("disparo-notificacoes", "ativo", DateTime.UtcNow),
            new JobStatusDto("metricas-snapshot", "ativo", DateTime.UtcNow)
        });
    }
}
