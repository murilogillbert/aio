using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/agendamentos")]
[Authorize(Roles = "admin,recepcao,profissional")]
public sealed class AppointmentsController(AioDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AppointmentRichDto>>> List(
        [FromQuery] string start,
        [FromQuery] string end,
        [FromQuery] string? professionalId = null,
        CancellationToken cancellationToken = default)
    {
        if (!DateTime.TryParse(start, out var startDt) || !DateTime.TryParse(end, out var endDt))
            return BadRequest(new { message = "start/end inválidos. Use ISO." });
        var startDate = DateOnly.FromDateTime(startDt);
        var endDate = DateOnly.FromDateTime(endDt);
        var professionalGuid = string.IsNullOrWhiteSpace(professionalId) ? (Guid?)null : ApiIds.Professional(professionalId);

        var query = db.Appointments.AsNoTracking()
            .Where(x => x.Date >= startDate && x.Date <= endDate);
        if (professionalGuid.HasValue) query = query.Where(x => x.ProfessionalId == professionalGuid.Value);

        var items = await query
            .Include(x => x.Patient).ThenInclude(x => x.User)
            .Include(x => x.Professional)
            .Include(x => x.Service)
            .Include(x => x.Room)
            .OrderBy(x => x.Date).ThenBy(x => x.Time)
            .ToListAsync(cancellationToken);

        var paymentMap = await db.Payments.AsNoTracking().Where(x => items.Select(i => i.Id).Contains(x.AppointmentId))
            .ToDictionaryAsync(x => x.AppointmentId, cancellationToken);

        return Ok(items.Select(x =>
        {
            paymentMap.TryGetValue(x.Id, out var payment);
            return Map(x, payment);
        }).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentRichDto>> Get(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var appointment = await LoadDetail(guid, cancellationToken);
        if (appointment is null) return NotFound();
        var payment = await db.Payments.AsNoTracking().FirstOrDefaultAsync(x => x.AppointmentId == guid, cancellationToken);
        return Ok(Map(appointment, payment));
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] AppointmentCreateDto body, CancellationToken cancellationToken)
    {
        if (!DateTime.TryParse(body.StartTime, out var startDt))
            return BadRequest(new { message = "startTime inválido." });

        var patientId = Guid.TryParse(body.PatientId, out var pid) ? pid : ApiIds.User(body.PatientId);
        // resolve patient by user id if necessary
        var patient = await db.Patients.AsNoTracking().FirstOrDefaultAsync(x => x.Id == patientId, cancellationToken)
            ?? await db.Patients.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == patientId, cancellationToken);
        if (patient is null) return BadRequest(new { message = "Paciente não encontrado." });

        var professionalId = ApiIds.Professional(body.ProfessionalId);
        var serviceId = ApiIds.Service(body.ServiceId);
        var service = await db.Services.AsNoTracking().FirstOrDefaultAsync(x => x.Id == serviceId, cancellationToken);
        if (service is null) return BadRequest(new { message = "Serviço inválido." });

        var duration = body.DurationMinutes ?? service.DurationMinutes;
        if (duration < 5) duration = service.DurationMinutes;

        var dates = new List<DateTime> { startDt };
        if (body.Recurrence is { Weekly: true, DurationDays: > 0 })
        {
            for (var add = 7; add <= body.Recurrence.DurationDays; add += 7)
                dates.Add(startDt.AddDays(add));
        }

        var created = new List<Appointment>();
        var skipped = new List<string>();

        foreach (var slot in dates)
        {
            var date = DateOnly.FromDateTime(slot);
            var time = TimeOnly.FromDateTime(slot);
            var conflict = await HasConflict(professionalId, body.RoomId, body.EquipmentIds, date, time, duration, cancellationToken);
            if (conflict)
            {
                skipped.Add(slot.ToString("O"));
                continue;
            }
            var appointment = new Appointment
            {
                Id = Guid.NewGuid(),
                PatientId = patient.Id,
                ProfessionalId = professionalId,
                ServiceId = serviceId,
                RoomId = Guid.TryParse(body.RoomId, out var roomGuid) ? roomGuid : null,
                PlanId = Guid.TryParse(body.PlanId, out var planGuid) ? planGuid : null,
                Date = date,
                Time = time,
                Status = AppointmentStatus.Agendado,
                Type = Enum.TryParse<AppointmentType>(body.AppointmentType, true, out var t) ? t : AppointmentType.Presencial,
                Notes = body.Notes ?? "",
                CreatedAt = DateTime.UtcNow,
                RecurrenceGroupId = dates.Count > 1 ? (created.FirstOrDefault()?.RecurrenceGroupId ?? Guid.NewGuid()) : null,
            };
            // Garantir mesmo RecurrenceGroupId para todos da série
            if (dates.Count > 1 && created.Count == 0) appointment.RecurrenceGroupId = Guid.NewGuid();
            else if (dates.Count > 1) appointment.RecurrenceGroupId = created[0].RecurrenceGroupId;

            db.Appointments.Add(appointment);

            if (body.EquipmentIds is { Count: > 0 })
            {
                foreach (var equipmentId in body.EquipmentIds)
                {
                    if (Guid.TryParse(equipmentId, out var eqGuid))
                        db.AppointmentEquipments.Add(new AppointmentEquipment { AppointmentId = appointment.Id, EquipmentId = eqGuid });
                }
            }

            db.AppointmentStatusLogs.Add(new AppointmentStatusLog
            {
                Id = Guid.NewGuid(),
                AppointmentId = appointment.Id,
                Status = AppointmentStatus.Agendado,
                ChangedAt = DateTime.UtcNow,
                ChangedByUserId = CurrentUserId(),
            });
            db.MovementLogs.Add(new MovementLog
            {
                Id = Guid.NewGuid(),
                EventType = "NEW_APPOINTMENT",
                Description = $"Agendamento criado para {patient.Id} com {service.Name}.",
                UserId = CurrentUserId(),
                CreatedAt = DateTime.UtcNow,
            });
            created.Add(appointment);
        }

        await db.SaveChangesAsync(cancellationToken);

        if (created.Count == 1 && skipped.Count == 0)
        {
            var detail = await LoadDetail(created[0].Id, cancellationToken);
            return Ok(Map(detail!, null));
        }
        var message = skipped.Count == 0
            ? $"{created.Count} agendamentos criados."
            : $"{created.Count} agendamentos criados, {skipped.Count} pulados por conflito.";
        return Ok(new RecurrenceResultDto(created.Count, skipped.Count, skipped, message));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AppointmentRichDto>> Update(string id, [FromBody] AppointmentUpdateDto body, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var appointment = await db.Appointments.FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (appointment is null) return NotFound();

        if (body.PatientId is not null)
        {
            var patientGuid = Guid.TryParse(body.PatientId, out var pid) ? pid : Guid.Empty;
            if (patientGuid != Guid.Empty) appointment.PatientId = patientGuid;
        }
        if (body.ProfessionalId is not null) appointment.ProfessionalId = ApiIds.Professional(body.ProfessionalId);
        if (body.ServiceId is not null) appointment.ServiceId = ApiIds.Service(body.ServiceId);
        if (body.RoomId is not null) appointment.RoomId = Guid.TryParse(body.RoomId, out var roomGuid) ? roomGuid : (body.RoomId == "" ? null : appointment.RoomId);
        if (body.PlanId is not null) appointment.PlanId = Guid.TryParse(body.PlanId, out var planGuid) ? planGuid : (body.PlanId == "" ? null : appointment.PlanId);
        if (body.StartTime is not null && DateTime.TryParse(body.StartTime, out var startDt))
        {
            appointment.Date = DateOnly.FromDateTime(startDt);
            appointment.Time = TimeOnly.FromDateTime(startDt);
        }
        if (body.Notes is not null) appointment.Notes = body.Notes;
        if (body.AppointmentType is not null && Enum.TryParse<AppointmentType>(body.AppointmentType, true, out var t)) appointment.Type = t;

        await db.SaveChangesAsync(cancellationToken);
        var detail = await LoadDetail(guid, cancellationToken);
        var payment = await db.Payments.AsNoTracking().FirstOrDefaultAsync(x => x.AppointmentId == guid, cancellationToken);
        return Ok(Map(detail!, payment));
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<AppointmentRichDto>> PatchStatus(string id, [FromBody] StatusPatchDto body, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        if (!Enum.TryParse<AppointmentStatus>(body.Status, true, out var status))
            return BadRequest(new { message = "Status inválido." });
        var appointment = await db.Appointments.FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (appointment is null) return NotFound();

        appointment.Status = status;
        if (status == AppointmentStatus.Cancelado)
        {
            appointment.CancelledAt = DateTime.UtcNow;
            if (Enum.TryParse<CancellationSource>(body.CancellationSource, true, out var src)) appointment.CancellationSource = src;
        }
        db.AppointmentStatusLogs.Add(new AppointmentStatusLog { Id = Guid.NewGuid(), AppointmentId = guid, Status = status, ChangedAt = DateTime.UtcNow, ChangedByUserId = CurrentUserId() });
        if (status == AppointmentStatus.Cancelado)
            db.MovementLogs.Add(new MovementLog { Id = Guid.NewGuid(), EventType = "APPOINTMENT_CANCELLED", Description = $"Agendamento {guid} cancelado.", UserId = CurrentUserId(), CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync(cancellationToken);
        var detail = await LoadDetail(guid, cancellationToken);
        var payment = await db.Payments.AsNoTracking().FirstOrDefaultAsync(x => x.AppointmentId == guid, cancellationToken);
        return Ok(Map(detail!, payment));
    }

    [HttpPatch("{id}/confirmacao")]
    public async Task<ActionResult<AppointmentRichDto>> PatchConfirmation(string id, [FromBody] ConfirmationPatchDto body, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        if (!Enum.TryParse<PatientConfirmation>(body.Value, true, out var confirmation))
            return BadRequest(new { message = "Confirmação inválida." });
        var appointment = await db.Appointments.FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (appointment is null) return NotFound();
        appointment.PatientConfirmation = confirmation;
        await db.SaveChangesAsync(cancellationToken);
        var detail = await LoadDetail(guid, cancellationToken);
        var payment = await db.Payments.AsNoTracking().FirstOrDefaultAsync(x => x.AppointmentId == guid, cancellationToken);
        return Ok(Map(detail!, payment));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var appointment = await db.Appointments.FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (appointment is null) return NotFound();
        var logs = await db.AppointmentStatusLogs.Where(x => x.AppointmentId == guid).ToListAsync(cancellationToken);
        var equipments = await db.AppointmentEquipments.Where(x => x.AppointmentId == guid).ToListAsync(cancellationToken);
        db.AppointmentStatusLogs.RemoveRange(logs);
        db.AppointmentEquipments.RemoveRange(equipments);
        db.Appointments.Remove(appointment);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id}/futuros")]
    public async Task<ActionResult<object>> DeleteFuture(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var appointment = await db.Appointments.FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (appointment is null) return NotFound();
        if (appointment.RecurrenceGroupId is null)
            return BadRequest(new { message = "Agendamento não pertence a uma série recorrente." });
        var future = await db.Appointments.Where(x => x.RecurrenceGroupId == appointment.RecurrenceGroupId && x.Date >= appointment.Date).ToListAsync(cancellationToken);
        var ids = future.Select(x => x.Id).ToList();
        var logs = await db.AppointmentStatusLogs.Where(x => ids.Contains(x.AppointmentId)).ToListAsync(cancellationToken);
        var equipments = await db.AppointmentEquipments.Where(x => ids.Contains(x.AppointmentId)).ToListAsync(cancellationToken);
        db.AppointmentStatusLogs.RemoveRange(logs);
        db.AppointmentEquipments.RemoveRange(equipments);
        db.Appointments.RemoveRange(future);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { count = future.Count, message = $"{future.Count} agendamentos da série foram removidos." });
    }

    [HttpPost("{id}/checkin")]
    public async Task<ActionResult<CheckinResultDto>> Checkin(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var appointment = await db.Appointments.FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (appointment is null) return NotFound();
        db.MovementLogs.Add(new MovementLog { Id = Guid.NewGuid(), EventType = "CHECK_IN", Description = $"Check-in no agendamento {guid}.", UserId = CurrentUserId(), CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new CheckinResultDto(true, "Check-in registrado."));
    }

    [HttpPost("{id}/pagamento")]
    public async Task<ActionResult<object>> Pagar(string id, [FromBody] PaymentRequestDto body, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var appointment = await db.Appointments.Include(x => x.Service).Include(x => x.Professional).FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (appointment is null) return NotFound();

        var existing = await db.Payments.FirstOrDefaultAsync(x => x.AppointmentId == guid, cancellationToken);
        if (existing != null) return BadRequest(new { message = "Pagamento já registrado para este agendamento." });

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            AppointmentId = guid,
            GrossAmount = body.Amount,
            Method = body.Method,
            PaidAt = DateTime.UtcNow,
        };
        db.Payments.Add(payment);

        // Calcula comissão baseada em ProfessionalService rule
        var rule = await db.ProfessionalServices.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProfessionalId == appointment.ProfessionalId && x.ServiceId == appointment.ServiceId, cancellationToken);
        decimal commissionAmount;
        decimal commissionPct;
        if (rule?.CompensationType == "fixed_value" && rule.CompensationValue.HasValue)
        {
            commissionAmount = rule.CompensationValue.Value;
            commissionPct = body.Amount > 0 ? Math.Round(commissionAmount / body.Amount * 100, 2) : 0;
        }
        else if (rule?.CompensationType == "custom_percent" && rule.CompensationValue.HasValue)
        {
            commissionPct = rule.CompensationValue.Value;
            commissionAmount = Math.Round(body.Amount * commissionPct / 100, 2);
        }
        else
        {
            commissionPct = appointment.Professional.DefaultCommissionPercent;
            commissionAmount = Math.Round(body.Amount * commissionPct / 100, 2);
        }
        db.Commissions.Add(new Commission { Id = Guid.NewGuid(), AppointmentId = guid, ProfessionalId = appointment.ProfessionalId, Amount = commissionAmount, Percent = commissionPct });

        db.MovementLogs.Add(new MovementLog { Id = Guid.NewGuid(), EventType = "PAYMENT_CONFIRMED", Description = $"Pagamento de {body.Amount:C} via {body.Method}.", UserId = CurrentUserId(), CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { paymentId = payment.Id.ToString(), commissionAmount, commissionPct, message = "Pagamento registrado." });
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private async Task<bool> HasConflict(Guid professionalId, string? roomId, IReadOnlyList<string>? equipmentIds, DateOnly date, TimeOnly time, int duration, CancellationToken cancellationToken)
    {
        var endTime = time.AddMinutes(duration);
        var dayAppts = await db.Appointments.AsNoTracking()
            .Include(x => x.Service)
            .Where(x => x.Date == date && x.Status != AppointmentStatus.Cancelado)
            .ToListAsync(cancellationToken);
        // Profissional ocupado
        if (dayAppts.Any(a => a.ProfessionalId == professionalId && Overlap(a.Time, a.Time.AddMinutes(a.Service.DurationMinutes), time, endTime))) return true;
        // Sala ocupada
        if (Guid.TryParse(roomId, out var roomGuid) && dayAppts.Any(a => a.RoomId == roomGuid && Overlap(a.Time, a.Time.AddMinutes(a.Service.DurationMinutes), time, endTime))) return true;
        // Equipamento ocupado
        if (equipmentIds is { Count: > 0 })
        {
            var apptIds = dayAppts.Select(x => x.Id).ToList();
            var eqUsage = await db.AppointmentEquipments.AsNoTracking()
                .Where(x => apptIds.Contains(x.AppointmentId))
                .ToListAsync(cancellationToken);
            foreach (var eqId in equipmentIds.Select(x => Guid.TryParse(x, out var g) ? g : Guid.Empty).Where(g => g != Guid.Empty))
            {
                var clashing = eqUsage.Where(u => u.EquipmentId == eqId).Select(u => u.AppointmentId);
                if (dayAppts.Any(a => clashing.Contains(a.Id) && Overlap(a.Time, a.Time.AddMinutes(a.Service.DurationMinutes), time, endTime))) return true;
            }
        }
        // Bloqueio do profissional
        var blocks = await db.ProfessionalBlocks.AsNoTracking()
            .Where(x => x.ProfessionalId == professionalId)
            .ToListAsync(cancellationToken);
        var slotStart = date.ToDateTime(time);
        var slotEnd = date.ToDateTime(endTime);
        if (blocks.Any(b => slotStart < b.EndAt && slotEnd > b.StartAt)) return true;
        return false;
    }

    private static bool Overlap(TimeOnly aStart, TimeOnly aEnd, TimeOnly bStart, TimeOnly bEnd)
        => aStart < bEnd && bStart < aEnd;

    private Task<Appointment?> LoadDetail(Guid id, CancellationToken cancellationToken)
        => db.Appointments.AsNoTracking()
            .Include(x => x.Patient).ThenInclude(x => x.User)
            .Include(x => x.Professional)
            .Include(x => x.Service)
            .Include(x => x.Room)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    private Guid? CurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var guid) ? guid : null;
    }

    private static AppointmentRichDto Map(Appointment a, Payment? payment) => new(
        a.Id.ToString(),
        a.Patient.User != null ? ApiIds.User(a.Patient.UserId) : a.PatientId.ToString(),
        a.Patient?.User?.FullName ?? "",
        ApiIds.Professional(a.ProfessionalId),
        a.Professional?.Name ?? "",
        ApiIds.Service(a.ServiceId),
        a.Service?.Name ?? "",
        a.RoomId?.ToString(),
        a.Room?.Name,
        a.PlanId?.ToString(),
        a.Date.ToDateTime(a.Time).ToString("O"),
        a.Date.ToDateTime(a.Time.AddMinutes(a.Service?.DurationMinutes ?? 30)).ToString("O"),
        a.Status.ToString(),
        a.PatientConfirmation.ToString(),
        a.Type.ToString(),
        a.CancellationSource?.ToString(),
        a.RecurrenceGroupId?.ToString(),
        a.Notes,
        string.IsNullOrWhiteSpace(a.Service?.Color) ? "#C2410C" : a.Service.Color,
        payment is null ? null : (payment.PaidAt > DateTime.MinValue ? "PAID" : "PENDING"),
        payment?.GrossAmount);
}
