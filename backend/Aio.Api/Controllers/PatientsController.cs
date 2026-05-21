using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/pacientes")]
[Authorize(Roles = "admin,recepcao")]
public sealed class PatientsController(AioDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PatientRichDto>>> Search([FromQuery] string? search = null, [FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = db.Patients.AsNoTracking().Include(x => x.User).Include(x => x.Dependents).AsQueryable();
        if (!includeInactive) query = query.Where(x => x.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            var digits = new string(term.Where(char.IsDigit).ToArray());
            query = query.Where(x =>
                x.User.FullName.ToLower().Contains(term)
                || x.User.Email.ToLower().Contains(term)
                || (digits.Length > 0 && (x.Cpf.Replace(".", "").Replace("-", "").Contains(digits) || x.User.Phone.Replace("(", "").Replace(")", "").Replace(" ", "").Replace("-", "").Contains(digits))));
        }
        var items = await query.OrderBy(x => x.User.FullName).Take(200).ToListAsync(cancellationToken);
        return Ok(items.Select(Map).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PatientRichDto>> Get(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var patient = await db.Patients.AsNoTracking().Include(x => x.User).Include(x => x.Dependents).FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (patient is null) return NotFound();
        return Ok(Map(patient));
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] PatientUpsertDto body, [FromQuery] bool force = false, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(body.Name) || string.IsNullOrWhiteSpace(body.Email))
            return BadRequest(new { message = "Nome e e-mail obrigatórios." });

        if (!force)
        {
            var duplicates = await FindDuplicates(body, Guid.Empty, cancellationToken);
            if (duplicates.Count > 0)
                return Conflict(new DuplicateMatchDto(duplicates));
        }

        var generatedPassword = GeneratePassword();
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = body.Name,
            Email = body.Email.Trim(),
            Phone = body.Phone,
            PasswordHash = $"seed:{generatedPassword}",
            CreatedAt = DateTime.UtcNow,
        };
        var pacienteRoleId = await db.Roles.Where(x => x.Name == "paciente").Select(x => x.Id).FirstAsync(cancellationToken);
        db.Users.Add(user);
        db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = pacienteRoleId });

        var patient = new Patient
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            User = user,
            Cpf = body.Cpf ?? "",
            BirthDate = DateTime.TryParse(body.BirthDate, out var bd) ? bd : null,
            Address = body.Address ?? "",
            City = body.City ?? "",
            State = body.State ?? "",
            PostalCode = body.PostalCode ?? "",
            Notes = body.Notes ?? "",
            IsActive = true,
        };
        db.Patients.Add(patient);
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new PatientCreateResultDto(Map(patient), generatedPassword));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PatientRichDto>> Update(string id, [FromBody] PatientUpsertDto body, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var patient = await db.Patients.Include(x => x.User).Include(x => x.Dependents).FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (patient is null) return NotFound();

        patient.User.FullName = body.Name;
        patient.User.Email = body.Email.Trim();
        patient.User.Phone = body.Phone;
        patient.Cpf = body.Cpf ?? "";
        patient.BirthDate = DateTime.TryParse(body.BirthDate, out var bd) ? bd : null;
        patient.Address = body.Address ?? "";
        patient.City = body.City ?? "";
        patient.State = body.State ?? "";
        patient.PostalCode = body.PostalCode ?? "";
        patient.Notes = body.Notes ?? "";

        await db.SaveChangesAsync(cancellationToken);
        return Ok(Map(patient));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var patient = await db.Patients.FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (patient is null) return NotFound();
        patient.IsActive = false;
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<List<PatientRichDto>> FindDuplicates(PatientUpsertDto body, Guid editingId, CancellationToken cancellationToken)
    {
        var email = body.Email?.Trim().ToLower() ?? "";
        var cpfDigits = new string((body.Cpf ?? "").Where(char.IsDigit).ToArray());
        var phoneDigits = new string((body.Phone ?? "").Where(char.IsDigit).ToArray());
        if (string.IsNullOrEmpty(email) && string.IsNullOrEmpty(cpfDigits) && string.IsNullOrEmpty(phoneDigits)) return [];
        var candidates = await db.Patients.AsNoTracking().Include(x => x.User).Include(x => x.Dependents)
            .Where(x => x.Id != editingId)
            .ToListAsync(cancellationToken);
        return candidates.Where(x =>
        {
            var pCpf = new string((x.Cpf ?? "").Where(char.IsDigit).ToArray());
            var pPhone = new string((x.User?.Phone ?? "").Where(char.IsDigit).ToArray());
            return (!string.IsNullOrEmpty(email) && (x.User?.Email ?? "").ToLower() == email)
                || (!string.IsNullOrEmpty(cpfDigits) && pCpf == cpfDigits)
                || (!string.IsNullOrEmpty(phoneDigits) && pPhone == phoneDigits);
        }).Select(Map).ToList();
    }

    private static string GeneratePassword()
    {
        const string chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        var rnd = Random.Shared;
        return new string(Enumerable.Range(0, 10).Select(_ => chars[rnd.Next(chars.Length)]).ToArray());
    }

    private static PatientRichDto Map(Patient p) => new(
        p.Id.ToString(),
        p.UserId.ToString(),
        p.User?.FullName ?? "",
        p.User?.Email ?? "",
        p.User?.Phone ?? "",
        p.Cpf ?? "",
        p.BirthDate?.ToString("yyyy-MM-dd"),
        p.Address ?? "",
        p.City ?? "",
        p.State ?? "",
        p.PostalCode ?? "",
        p.Notes ?? "",
        p.IsActive,
        p.Dependents?.Count ?? 0);
}
