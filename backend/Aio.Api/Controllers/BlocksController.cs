using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/bloqueios")]
[Authorize(Roles = "admin,recepcao,profissional")]
public sealed class BlocksController(AioDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BlockDto>>> List([FromQuery] string? professionalId = null, [FromQuery] string? start = null, [FromQuery] string? end = null, CancellationToken cancellationToken = default)
    {
        var query = db.ProfessionalBlocks.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(professionalId))
            query = query.Where(x => x.ProfessionalId == ApiIds.Professional(professionalId));
        if (DateTime.TryParse(start, out var startDt))
            query = query.Where(x => x.EndAt >= startDt);
        if (DateTime.TryParse(end, out var endDt))
            query = query.Where(x => x.StartAt <= endDt);
        var items = await query.OrderBy(x => x.StartAt).ToListAsync(cancellationToken);
        return Ok(items.Select(Map).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<BlockDto>> Create([FromBody] BlockUpsertDto body, CancellationToken cancellationToken)
    {
        if (!DateTime.TryParse(body.StartAt, out var startDt) || !DateTime.TryParse(body.EndAt, out var endDt))
            return BadRequest(new { message = "Datas inválidas." });
        if (endDt <= startDt) return BadRequest(new { message = "Fim deve ser depois do início." });
        var block = new ProfessionalBlock
        {
            Id = Guid.NewGuid(),
            ProfessionalId = ApiIds.Professional(body.ProfessionalId),
            StartAt = startDt,
            EndAt = endDt,
            Reason = body.Reason ?? "",
            CreatedAt = DateTime.UtcNow,
        };
        db.ProfessionalBlocks.Add(block);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(Map(block));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var block = await db.ProfessionalBlocks.FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (block is null) return NotFound();
        db.ProfessionalBlocks.Remove(block);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static BlockDto Map(ProfessionalBlock b) => new(
        b.Id.ToString(),
        ApiIds.Professional(b.ProfessionalId),
        b.StartAt.ToString("O"),
        b.EndAt.ToString("O"),
        b.Reason ?? "");
}
