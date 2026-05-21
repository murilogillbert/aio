using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/agenda")]
public sealed class AgendaController(AioDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AgendaSlotDto>>> GetAgenda([FromQuery] string? profissionalId, [FromQuery] string? mes, CancellationToken cancellationToken)
    {
        var professionalGuid = string.IsNullOrWhiteSpace(profissionalId) ? (Guid?)null : ApiIds.Professional(profissionalId);
        var schedules = await db.ProfessionalSchedules
            .Where(x => professionalGuid == null || x.ProfessionalId == professionalGuid)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        var appointments = await db.Appointments
            .Where(x => professionalGuid == null || x.ProfessionalId == professionalGuid)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var start = DateOnly.FromDateTime(DateTime.Today);
        if (!string.IsNullOrWhiteSpace(mes) && DateOnly.TryParse($"{mes}-01", out var monthDate))
        {
            start = monthDate;
        }

        var slots = new List<AgendaSlotDto>();
        for (var offset = 0; offset < 30; offset++)
        {
            var date = start.AddDays(offset);
            var weekday = (int)date.DayOfWeek;
            foreach (var schedule in schedules.Where(x => x.Weekday == weekday))
            {
                for (var time = schedule.StartTime; time < schedule.EndTime; time = time.AddHours(1))
                {
                    var appointment = appointments.FirstOrDefault(x => x.ProfessionalId == schedule.ProfessionalId && x.Date == date && x.Time == time);
                    slots.Add(new AgendaSlotDto(
                        $"{ApiIds.Professional(schedule.ProfessionalId)}-{date:yyyy-MM-dd}-{time:HH\\:mm}",
                        ApiIds.Professional(schedule.ProfessionalId),
                        date.ToString("yyyy-MM-dd"),
                        time.ToString("HH:mm"),
                        appointment is null,
                        appointment?.Id.ToString()));
                }
            }
        }

        return Ok(slots);
    }

    [Authorize]
    [HttpPost("agendamentos")]
    public async Task<ActionResult<AppointmentDto>> Create(BookingRequest request, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var patient = await db.Patients.Include(x => x.User).FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (patient is null && !string.IsNullOrWhiteSpace(request.PatientId))
        {
            var requestedUserId = ApiIds.User(request.PatientId);
            patient = await db.Patients.Include(x => x.User).FirstOrDefaultAsync(x => x.UserId == requestedUserId, cancellationToken);
        }
        if (patient is null) return BadRequest(new { message = "Paciente nao encontrado para o usuario autenticado." });

        var professionalId = ApiIds.Professional(request.ProfessionalId ?? "");
        var serviceId = ApiIds.Service(request.ServiceId ?? "");
        if (professionalId == Guid.Empty || serviceId == Guid.Empty || !DateOnly.TryParse(request.Date, out var date) || !TimeOnly.TryParse(request.Time, out var time))
        {
            return BadRequest(new { message = "Dados de agendamento invalidos." });
        }

        var dependentId = Guid.TryParse(request.PatientTarget, out var parsedDependent) ? parsedDependent : (Guid?)null;
        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            PatientId = patient.Id,
            DependentId = dependentId,
            ProfessionalId = professionalId,
            ServiceId = serviceId,
            Date = date,
            Time = time,
            Status = AppointmentStatus.Agendado
        };
        db.Appointments.Add(appointment);
        db.AppointmentStatusLogs.Add(new AppointmentStatusLog
        {
            Id = Guid.NewGuid(),
            AppointmentId = appointment.Id,
            Status = AppointmentStatus.Agendado,
            ChangedAt = DateTime.UtcNow,
            ChangedByUserId = userId
        });
        await db.SaveChangesAsync(cancellationToken);

        appointment.Patient = patient;
        return Ok(appointment.ToDto());
    }
}
