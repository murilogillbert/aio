using System.Security.Claims;
using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/prontuarios")]
[Authorize(Roles = "admin,recepcao,profissional")]
public sealed class MedicalRecordsController(AioDbContext db) : ControllerBase
{
    [HttpGet("pacientes/{patientId}")]
    public async Task<ActionResult<MedicalRecordDto>> GetRecord(string patientId, CancellationToken cancellationToken)
    {
        var patient = await ResolvePatient(patientId, cancellationToken);
        if (patient is null) return NotFound(new { message = "Paciente nao encontrado." });
        if (!await CanAccessPatient(patient.Id, cancellationToken)) return Forbid();

        var record = await GetOrCreateRecord(patient, cancellationToken);
        return Ok(MapRecord(record, patient.User?.FullName ?? "", IsRestricted()));
    }

    [HttpPut("pacientes/{patientId}")]
    [Authorize(Roles = "admin,profissional")]
    public async Task<ActionResult<MedicalRecordDto>> UpdateRecord(string patientId, [FromBody] MedicalRecordUpsertDto body, CancellationToken cancellationToken)
    {
        var patient = await ResolvePatient(patientId, cancellationToken);
        if (patient is null) return NotFound(new { message = "Paciente nao encontrado." });
        if (!await CanAccessPatient(patient.Id, cancellationToken)) return Forbid();

        var record = await GetOrCreateRecord(patient, cancellationToken);
        record.BloodType = body.BloodType ?? "";
        record.Allergies = body.Allergies ?? "";
        record.ChronicConditions = body.ChronicConditions ?? "";
        record.CurrentMedications = body.CurrentMedications ?? "";
        record.FamilyHistory = body.FamilyHistory ?? "";
        record.SurgicalHistory = body.SurgicalHistory ?? "";
        record.Habits = body.Habits ?? "";
        record.HeightCm = body.HeightCm;
        record.WeightKg = body.WeightKg;
        record.UpdatedAt = DateTime.UtcNow;
        record.UpdatedByUserId = CurrentUserId();

        db.MovementLogs.Add(new MovementLog
        {
            Id = Guid.NewGuid(),
            EventType = "MEDICAL_RECORD_UPDATED",
            Description = $"Prontuario atualizado para {patient.User?.FullName ?? patient.Id.ToString()}.",
            UserId = CurrentUserId(),
            CreatedAt = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(cancellationToken);
        return Ok(MapRecord(record, patient.User?.FullName ?? "", IsRestricted()));
    }

    [HttpGet("pacientes/{patientId}/evolucoes")]
    public async Task<ActionResult<IReadOnlyList<SessionNoteDto>>> ListNotes(string patientId, CancellationToken cancellationToken)
    {
        var patient = await ResolvePatient(patientId, cancellationToken);
        if (patient is null) return NotFound(new { message = "Paciente nao encontrado." });
        if (!await CanAccessPatient(patient.Id, cancellationToken)) return Forbid();

        var query = db.SessionNotes.AsNoTracking()
            .Include(x => x.MedicalRecord)
            .Include(x => x.Appointment).ThenInclude(x => x.Service)
            .Include(x => x.Professional)
            .Where(x => x.MedicalRecord.PatientId == patient.Id);

        var professionalId = await CurrentProfessionalId(cancellationToken);
        if (IsProfessional() && professionalId.HasValue)
            query = query.Where(x => x.ProfessionalId == professionalId.Value);

        var notes = await query.OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);
        return Ok(notes.Select(x => MapNote(x, IsRestricted())).ToList());
    }

    [HttpGet("agendamentos/{appointmentId}/evolucao")]
    [Authorize(Roles = "admin,profissional")]
    public async Task<ActionResult<SessionNoteDto>> GetNoteByAppointment(string appointmentId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(appointmentId, out var appointmentGuid)) return BadRequest();
        var appointment = await LoadAppointment(appointmentGuid, cancellationToken);
        if (appointment is null) return NotFound(new { message = "Agendamento nao encontrado." });
        if (!await CanAccessAppointment(appointment, cancellationToken)) return Forbid();

        var note = await db.SessionNotes.AsNoTracking()
            .Include(x => x.MedicalRecord)
            .Include(x => x.Appointment).ThenInclude(x => x.Service)
            .Include(x => x.Professional)
            .FirstOrDefaultAsync(x => x.AppointmentId == appointmentGuid, cancellationToken);

        if (note is not null) return Ok(MapNote(note, false));

        return Ok(new SessionNoteDto(
            "",
            appointment.Id.ToString(),
            appointment.PatientId.ToString(),
            ApiIds.Professional(appointment.ProfessionalId),
            appointment.Professional?.Name ?? "",
            appointment.Service?.Name ?? "",
            appointment.Date.ToDateTime(appointment.Time).ToString("O"),
            appointment.Status.ToString(),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            DateTime.UtcNow.ToString("O"),
            null,
            false));
    }

    [HttpPost("agendamentos/{appointmentId}/evolucao")]
    [Authorize(Roles = "admin,profissional")]
    public async Task<ActionResult<SessionNoteDto>> CreateNote(string appointmentId, [FromBody] SessionNoteUpsertDto body, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(appointmentId, out var appointmentGuid)) return BadRequest();
        var appointment = await LoadAppointment(appointmentGuid, cancellationToken);
        if (appointment is null) return NotFound(new { message = "Agendamento nao encontrado." });
        if (!await CanAccessAppointment(appointment, cancellationToken)) return Forbid();

        if (await db.SessionNotes.AnyAsync(x => x.AppointmentId == appointmentGuid, cancellationToken))
            return Conflict(new { message = "Este agendamento ja possui evolucao." });

        var patient = await db.Patients.Include(x => x.User).FirstAsync(x => x.Id == appointment.PatientId, cancellationToken);
        var record = await GetOrCreateRecord(patient, cancellationToken);
        var note = new SessionNote
        {
            Id = Guid.NewGuid(),
            MedicalRecordId = record.Id,
            AppointmentId = appointment.Id,
            ProfessionalId = appointment.ProfessionalId,
            ChiefComplaint = body.ChiefComplaint ?? "",
            Subjective = body.Subjective ?? "",
            Objective = body.Objective ?? "",
            Assessment = body.Assessment ?? "",
            Plan = body.Plan ?? "",
            Diagnosis = body.Diagnosis ?? "",
            DiagnosisCode = body.DiagnosisCode ?? "",
            Prescription = body.Prescription ?? "",
            VitalSignsJson = body.VitalSignsJson ?? "",
            CreatedAt = DateTime.UtcNow,
        };
        db.SessionNotes.Add(note);
        db.MovementLogs.Add(new MovementLog
        {
            Id = Guid.NewGuid(),
            EventType = "SESSION_NOTE_CREATED",
            Description = $"Evolucao criada para {patient.User?.FullName ?? patient.Id.ToString()}.",
            UserId = CurrentUserId(),
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);

        var loaded = await LoadNote(note.Id, cancellationToken);
        return Ok(MapNote(loaded!, false));
    }

    [HttpPut("evolucoes/{id}")]
    [Authorize(Roles = "admin,profissional")]
    public async Task<ActionResult<SessionNoteDto>> UpdateNote(string id, [FromBody] SessionNoteUpsertDto body, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var note = await db.SessionNotes.Include(x => x.Appointment).FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (note is null) return NotFound(new { message = "Evolucao nao encontrada." });
        if (!await CanAccessAppointment(note.Appointment, cancellationToken)) return Forbid();
        if (note.IsSigned) return BadRequest(new { message = "Evolucao assinada nao pode ser editada." });

        note.ChiefComplaint = body.ChiefComplaint ?? "";
        note.Subjective = body.Subjective ?? "";
        note.Objective = body.Objective ?? "";
        note.Assessment = body.Assessment ?? "";
        note.Plan = body.Plan ?? "";
        note.Diagnosis = body.Diagnosis ?? "";
        note.DiagnosisCode = body.DiagnosisCode ?? "";
        note.Prescription = body.Prescription ?? "";
        note.VitalSignsJson = body.VitalSignsJson ?? "";
        note.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        var loaded = await LoadNote(note.Id, cancellationToken);
        return Ok(MapNote(loaded!, false));
    }

    [HttpPost("evolucoes/{id}/assinar")]
    [Authorize(Roles = "admin,profissional")]
    public async Task<ActionResult<SessionNoteDto>> SignNote(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var note = await db.SessionNotes.Include(x => x.Appointment).FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (note is null) return NotFound(new { message = "Evolucao nao encontrada." });
        if (!await CanAccessAppointment(note.Appointment, cancellationToken)) return Forbid();
        if (note.IsSigned) return BadRequest(new { message = "Evolucao ja assinada." });

        note.IsSigned = true;
        note.SignedAt = DateTime.UtcNow;
        note.UpdatedAt = DateTime.UtcNow;
        if (note.Appointment.Status is not AppointmentStatus.Cancelado and not AppointmentStatus.Realizado)
            note.Appointment.Status = AppointmentStatus.Realizado;

        db.MovementLogs.Add(new MovementLog
        {
            Id = Guid.NewGuid(),
            EventType = "SESSION_NOTE_SIGNED",
            Description = $"Evolucao assinada para agendamento {note.AppointmentId}.",
            UserId = CurrentUserId(),
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);

        var loaded = await LoadNote(note.Id, cancellationToken);
        return Ok(MapNote(loaded!, false));
    }

    [HttpGet("pacientes/{patientId}/anexos")]
    public async Task<ActionResult<IReadOnlyList<MedicalAttachmentDto>>> ListAttachments(string patientId, CancellationToken cancellationToken)
    {
        var patient = await ResolvePatient(patientId, cancellationToken);
        if (patient is null) return NotFound(new { message = "Paciente nao encontrado." });
        if (!await CanAccessPatient(patient.Id, cancellationToken)) return Forbid();
        var record = await GetOrCreateRecord(patient, cancellationToken);
        var attachments = await db.MedicalAttachments.AsNoTracking()
            .Where(x => x.MedicalRecordId == record.Id)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
        return Ok(attachments.Select(x => new MedicalAttachmentDto(x.Id.ToString(), patient.Id.ToString(), x.Title, x.FileUrl, x.FileType, x.CreatedAt.ToString("O"))).ToList());
    }

    [HttpPost("pacientes/{patientId}/anexos")]
    public async Task<ActionResult<MedicalAttachmentDto>> CreateAttachment(string patientId, [FromBody] MedicalAttachmentUpsertDto body, CancellationToken cancellationToken)
    {
        var patient = await ResolvePatient(patientId, cancellationToken);
        if (patient is null) return NotFound(new { message = "Paciente nao encontrado." });
        if (!await CanAccessPatient(patient.Id, cancellationToken)) return Forbid();
        if (string.IsNullOrWhiteSpace(body.Title) || string.IsNullOrWhiteSpace(body.FileUrl))
            return BadRequest(new { message = "Titulo e URL sao obrigatorios." });
        var record = await GetOrCreateRecord(patient, cancellationToken);
        var attachment = new MedicalAttachment
        {
            Id = Guid.NewGuid(),
            MedicalRecordId = record.Id,
            Title = body.Title,
            FileUrl = body.FileUrl,
            FileType = body.FileType,
            UploadedByUserId = CurrentUserId(),
            CreatedAt = DateTime.UtcNow,
        };
        db.MedicalAttachments.Add(attachment);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new MedicalAttachmentDto(attachment.Id.ToString(), patient.Id.ToString(), attachment.Title, attachment.FileUrl, attachment.FileType, attachment.CreatedAt.ToString("O")));
    }

    [HttpDelete("anexos/{id}")]
    public async Task<IActionResult> DeleteAttachment(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return BadRequest();
        var attachment = await db.MedicalAttachments.Include(x => x.MedicalRecord).FirstOrDefaultAsync(x => x.Id == guid, cancellationToken);
        if (attachment is null) return NotFound();
        if (!await CanAccessPatient(attachment.MedicalRecord.PatientId, cancellationToken)) return Forbid();
        db.MedicalAttachments.Remove(attachment);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<Patient?> ResolvePatient(string id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var guid)) return null;
        return await db.Patients.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == guid || x.UserId == guid, cancellationToken);
    }

    private async Task<MedicalRecord> GetOrCreateRecord(Patient patient, CancellationToken cancellationToken)
    {
        var record = await db.MedicalRecords.FirstOrDefaultAsync(x => x.PatientId == patient.Id, cancellationToken);
        if (record is not null) return record;
        record = new MedicalRecord
        {
            Id = Guid.NewGuid(),
            PatientId = patient.Id,
            CreatedAt = DateTime.UtcNow,
        };
        db.MedicalRecords.Add(record);
        await db.SaveChangesAsync(cancellationToken);
        return record;
    }

    private async Task<bool> CanAccessPatient(Guid patientId, CancellationToken cancellationToken)
    {
        if (IsStaff()) return true;
        var professionalId = await CurrentProfessionalId(cancellationToken);
        return professionalId.HasValue && await db.Appointments.AsNoTracking()
            .AnyAsync(x => x.PatientId == patientId && x.ProfessionalId == professionalId.Value, cancellationToken);
    }

    private async Task<bool> CanAccessAppointment(Appointment appointment, CancellationToken cancellationToken)
    {
        if (IsStaff()) return true;
        var professionalId = await CurrentProfessionalId(cancellationToken);
        return professionalId.HasValue && appointment.ProfessionalId == professionalId.Value;
    }

    private async Task<Guid?> CurrentProfessionalId(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId();
        if (!userId.HasValue) return null;
        return await db.Professionals.AsNoTracking()
            .Where(x => x.UserId == userId.Value)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private Guid? CurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var guid) ? guid : null;
    }

    private bool IsProfessional() => User.IsInRole("profissional");
    private bool IsStaff() => User.IsInRole("admin") || User.IsInRole("recepcao");
    private bool IsRestricted() => User.IsInRole("recepcao");

    private Task<Appointment?> LoadAppointment(Guid id, CancellationToken cancellationToken)
        => db.Appointments
            .Include(x => x.Patient).ThenInclude(x => x.User)
            .Include(x => x.Professional)
            .Include(x => x.Service)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    private Task<SessionNote?> LoadNote(Guid id, CancellationToken cancellationToken)
        => db.SessionNotes.AsNoTracking()
            .Include(x => x.MedicalRecord).ThenInclude(x => x.Patient).ThenInclude(x => x.User)
            .Include(x => x.Appointment).ThenInclude(x => x.Service)
            .Include(x => x.Professional)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    private static MedicalRecordDto MapRecord(MedicalRecord record, string patientName, bool restricted)
        => new(
            record.Id.ToString(),
            record.PatientId.ToString(),
            patientName,
            record.BloodType,
            record.Allergies,
            restricted ? null : record.ChronicConditions,
            record.CurrentMedications,
            restricted ? null : record.FamilyHistory,
            restricted ? null : record.SurgicalHistory,
            restricted ? null : record.Habits,
            record.HeightCm,
            record.WeightKg,
            record.CreatedAt.ToString("O"),
            record.UpdatedAt?.ToString("O"),
            restricted);

    private static SessionNoteDto MapNote(SessionNote note, bool restricted)
        => new(
            note.Id.ToString(),
            note.AppointmentId.ToString(),
            note.MedicalRecord.PatientId.ToString(),
            ApiIds.Professional(note.ProfessionalId),
            note.Professional?.Name ?? "",
            note.Appointment?.Service?.Name ?? "",
            note.Appointment?.Date.ToDateTime(note.Appointment.Time).ToString("O") ?? note.CreatedAt.ToString("O"),
            note.Appointment?.Status.ToString() ?? "",
            restricted ? null : note.ChiefComplaint,
            restricted ? null : note.Subjective,
            restricted ? null : note.Objective,
            restricted ? null : note.Assessment,
            restricted ? null : note.Plan,
            restricted ? null : note.Diagnosis,
            restricted ? null : note.DiagnosisCode,
            restricted ? null : note.Prescription,
            restricted ? null : note.VitalSignsJson,
            note.IsSigned,
            note.SignedAt?.ToString("O"),
            note.CreatedAt.ToString("O"),
            note.UpdatedAt?.ToString("O"),
            restricted);
}
