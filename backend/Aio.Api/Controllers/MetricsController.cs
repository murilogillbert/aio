using Aio.Api.Dtos;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/metricas")]
public sealed class MetricsController(AioDbContext db) : ControllerBase
{
    [Authorize(Roles = "admin,profissional")]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MetricsDto>>> Get(CancellationToken cancellationToken)
    {
        var data = await db.MetricsSnapshots.AsNoTracking().OrderBy(x => x.Id).ToListAsync(cancellationToken);
        return Ok(data.Select(x => new MetricsDto(x.MonthLabel, x.Revenue, x.Profit, x.Appointments, x.TicketAverage, x.OccupancyRate, x.CancellationRate, x.NewPatients)).ToList());
    }

    [Authorize(Roles = "admin")]
    [HttpGet("custos")]
    public async Task<ActionResult<IReadOnlyList<CostDto>>> GetCosts(CancellationToken cancellationToken)
    {
        var costs = await db.Costs.AsNoTracking().ToListAsync(cancellationToken);
        return Ok(costs.Select(x => new CostDto(x.Id.ToString(), x.MonthLabel, x.Type == CostType.Fixo ? "fixo" : "variavel", x.Name, x.Value)).ToList());
    }

    [Authorize(Roles = "admin,profissional")]
    [HttpGet("breakdowns")]
    public async Task<ActionResult<object>> GetBreakdowns(CancellationToken cancellationToken)
    {
        var services = await db.Payments
            .Include(x => x.Appointment).ThenInclude(x => x.Service)
            .AsNoTracking()
            .GroupBy(x => x.Appointment.Service.Name)
            .Select(x => new { label = x.Key, value = x.Sum(p => p.GrossAmount) })
            .ToListAsync(cancellationToken);
        var professionals = await db.Commissions
            .Include(x => x.Professional)
            .AsNoTracking()
            .GroupBy(x => x.Professional.Name)
            .Select(x => new { label = x.Key, value = x.Sum(p => p.Amount) })
            .ToListAsync(cancellationToken);

        return Ok(new { serviceRankingMock = services, professionalRankingMock = professionals });
    }

    [Authorize(Roles = "admin")]
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardMetricsDto>> Dashboard([FromQuery] string periodo = "30d", CancellationToken cancellationToken = default)
    {
        var (start, end) = ParsePeriod(periodo);
        var rangeDays = end.DayNumber - start.DayNumber + 1;
        var (prevStart, prevEnd) = (start.AddDays(-rangeDays), start.AddDays(-1));

        var current = await SummarizePeriod(start, end, cancellationToken);
        var previous = await SummarizePeriod(prevStart, prevEnd, cancellationToken);
        var snapshots = await db.MetricsSnapshots.AsNoTracking().OrderBy(x => x.Id).Select(x => new MetricsPointDto(x.MonthLabel, x.Revenue, x.Profit, x.Appointments)).ToListAsync(cancellationToken);

        var nowUtc = DateTime.UtcNow;
        var todayFloor = DateOnly.FromDateTime(nowUtc);
        var pendingToday = await db.Appointments.AsNoTracking()
            .Where(x => x.Date == todayFloor && (x.Status == AppointmentStatus.Confirmado || x.Status == AppointmentStatus.Agendado || x.Status == AppointmentStatus.Pendente))
            .Include(x => x.Patient).ThenInclude(x => x.User)
            .Include(x => x.Professional)
            .Include(x => x.Service)
            .OrderBy(x => x.Time)
            .ToListAsync(cancellationToken);

        var waiting = pendingToday
            .Where(x => x.Time <= TimeOnly.FromDateTime(nowUtc.ToLocalTime()))
            .Take(5)
            .Select(x => new WaitingPatientDto(
                x.Id.ToString(),
                x.Patient.User.FullName,
                x.Professional.Name,
                x.Service.Name,
                BuildIso(x.Date, x.Time),
                Math.Max(0, (int)Math.Floor((DateTime.Now - x.Date.ToDateTime(x.Time)).TotalMinutes))))
            .ToList();

        var upcoming = pendingToday
            .Where(x => x.Time > TimeOnly.FromDateTime(nowUtc.ToLocalTime()))
            .Take(5)
            .Select(x => new UpcomingDto(x.Id.ToString(), x.Patient.User.FullName, x.Professional.Name, x.Service.Name, BuildIso(x.Date, x.Time)))
            .ToList();

        return Ok(new DashboardMetricsDto(
            current.Revenue,
            current.Profit,
            current.Appointments,
            current.TicketAverage,
            current.Occupancy,
            current.CancellationRate,
            current.NewPatients,
            Trend(previous.Revenue, current.Revenue),
            Trend(previous.Appointments, current.Appointments),
            Trend(previous.Profit, current.Profit),
            snapshots,
            waiting,
            upcoming));
    }

    [Authorize(Roles = "admin")]
    [HttpGet("faturamento")]
    public async Task<ActionResult<FaturamentoDto>> Faturamento([FromQuery] string periodo = "30d", CancellationToken cancellationToken = default)
    {
        var (start, end) = ParsePeriod(periodo);
        var rangeDays = end.DayNumber - start.DayNumber + 1;
        var (prevStart, prevEnd) = (start.AddDays(-rangeDays), start.AddDays(-1));

        var payments = await db.Payments
            .Include(x => x.Appointment).ThenInclude(x => x.Service)
            .Include(x => x.Appointment).ThenInclude(x => x.Plan)
            .Include(x => x.Appointment).ThenInclude(x => x.Professional)
            .AsNoTracking()
            .Where(x => x.PaidAt >= start.ToDateTime(TimeOnly.MinValue) && x.PaidAt <= end.ToDateTime(TimeOnly.MaxValue))
            .ToListAsync(cancellationToken);

        var prevPayments = await db.Payments.AsNoTracking()
            .Where(x => x.PaidAt >= prevStart.ToDateTime(TimeOnly.MinValue) && x.PaidAt <= prevEnd.ToDateTime(TimeOnly.MaxValue))
            .SumAsync(x => (decimal?)x.GrossAmount, cancellationToken) ?? 0m;

        var commissions = await db.Commissions
            .Include(x => x.Professional)
            .Include(x => x.Appointment).ThenInclude(x => x.Service)
            .AsNoTracking()
            .Where(x => x.Appointment.Date >= start && x.Appointment.Date <= end)
            .ToListAsync(cancellationToken);

        var custos = await db.Costs.AsNoTracking().ToListAsync(cancellationToken);
        var totalRevenue = payments.Sum(x => x.GrossAmount);
        var totalPayout = commissions.Sum(x => x.Amount);
        var totalCustos = custos.Sum(x => x.Value);
        var netRevenue = totalRevenue - totalPayout - totalCustos;
        var margem = totalRevenue > 0 ? Math.Round(netRevenue / totalRevenue * 100, 2) : 0;
        var totalAppointments = payments.Count;
        var completed = payments.Count(x => x.Appointment.Status == AppointmentStatus.Realizado);
        var ticket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;
        var delinquency = await db.Appointments.AsNoTracking()
            .Where(x => x.Date >= start && x.Date <= end && x.Status == AppointmentStatus.Realizado)
            .Where(x => !db.Payments.Any(p => p.AppointmentId == x.Id))
            .Include(x => x.Service)
            .SumAsync(x => (decimal?)x.Service.BasePrice, cancellationToken) ?? 0m;

        var byMethod = payments.GroupBy(x => string.IsNullOrEmpty(x.Method) ? "Não informado" : x.Method)
            .Select(g => new DistributionDto(g.Key, g.Sum(x => x.GrossAmount))).OrderByDescending(x => x.Value).ToList();
        var byPlan = payments.GroupBy(x => x.Appointment.Plan?.Name ?? "Sem convênio")
            .Select(g => new DistributionDto(g.Key, g.Sum(x => x.GrossAmount))).OrderByDescending(x => x.Value).ToList();
        var custosByCategory = custos.GroupBy(x => x.Type == CostType.Fixo ? "Fixos" : "Variáveis")
            .Select(g => new DistributionDto(g.Key, g.Sum(x => x.Value))).ToList();
        var payouts = commissions.GroupBy(x => x.Professional)
            .Select(g => new PayoutDto(
                ApiIds.Professional(g.Key.Id),
                g.Key.Name,
                g.Key.Specialty,
                g.Count(),
                payments.Where(p => p.Appointment.ProfessionalId == g.Key.Id).Sum(p => p.GrossAmount),
                g.Average(x => x.Percent),
                g.Sum(x => x.Amount)))
            .OrderByDescending(x => x.Net).ToList();

        var monthly = await db.MetricsSnapshots.AsNoTracking().OrderBy(x => x.Id)
            .Select(x => new MonthlyRevenueDto(x.MonthLabel, x.Revenue, 0, 0, x.Profit))
            .ToListAsync(cancellationToken);

        return Ok(new FaturamentoDto(
            totalRevenue,
            totalPayout,
            totalCustos,
            custos.Count,
            netRevenue,
            margem,
            Trend(prevPayments, totalRevenue),
            totalAppointments,
            completed,
            Math.Round(ticket, 2),
            delinquency,
            byMethod,
            byPlan,
            custosByCategory,
            payouts,
            monthly));
    }

    [Authorize(Roles = "admin")]
    [HttpGet("profissionais")]
    public async Task<ActionResult<IReadOnlyList<ProfessionalMetricDto>>> Profissionais([FromQuery] string periodo = "30d", CancellationToken cancellationToken = default)
    {
        var (start, end) = ParsePeriod(periodo);
        var rangeDays = end.DayNumber - start.DayNumber + 1;
        var (prevStart, prevEnd) = (start.AddDays(-rangeDays), start.AddDays(-1));

        var professionals = await db.Professionals.AsNoTracking().Where(x => x.ProvidesCare).ToListAsync(cancellationToken);
        var appointments = await db.Appointments.AsNoTracking()
            .Where(x => x.Date >= start && x.Date <= end)
            .Include(x => x.Service)
            .Include(x => x.Patient)
            .ToListAsync(cancellationToken);
        var prevAppointments = await db.Appointments.AsNoTracking()
            .Where(x => x.Date >= prevStart && x.Date <= prevEnd)
            .Include(x => x.Service)
            .ToListAsync(cancellationToken);
        var payments = await db.Payments.AsNoTracking()
            .Where(x => x.PaidAt >= start.ToDateTime(TimeOnly.MinValue) && x.PaidAt <= end.ToDateTime(TimeOnly.MaxValue))
            .Include(x => x.Appointment)
            .ToListAsync(cancellationToken);
        var commissions = await db.Commissions.AsNoTracking()
            .Include(x => x.Appointment)
            .Where(x => x.Appointment.Date >= start && x.Appointment.Date <= end)
            .ToListAsync(cancellationToken);

        var firstAppointments = await db.Appointments.AsNoTracking()
            .GroupBy(x => x.PatientId)
            .Select(g => new { PatientId = g.Key, FirstDate = g.Min(x => x.Date) })
            .ToListAsync(cancellationToken);
        var firstByPatient = firstAppointments.ToDictionary(x => x.PatientId, x => x.FirstDate);

        var result = professionals.Select(pro =>
        {
            var proAppts = appointments.Where(x => x.ProfessionalId == pro.Id).ToList();
            var prevProAppts = prevAppointments.Where(x => x.ProfessionalId == pro.Id).ToList();
            var revenue = payments.Where(x => x.Appointment.ProfessionalId == pro.Id).Sum(x => x.GrossAmount);
            var prevRevenue = 0m;
            var commission = commissions.Where(x => x.ProfessionalId == pro.Id).ToList();
            var netPayout = commission.Sum(x => x.Amount);
            var commissionPct = commission.Count > 0 ? commission.Average(x => x.Percent) : pro.DefaultCommissionPercent;
            var completed = proAppts.Count(x => x.Status == AppointmentStatus.Realizado);
            var cancelled = proAppts.Count(x => x.Status == AppointmentStatus.Cancelado);
            var noShow = proAppts.Count(x => x.Status == AppointmentStatus.NaoCompareceu);
            var total = proAppts.Count;
            var cancellationRate = total > 0 ? Math.Round((decimal)(cancelled + noShow) / total * 100, 2) : 0;
            var ticket = total > 0 ? revenue / total : 0;
            var newPatients = proAppts.Count(x => firstByPatient.TryGetValue(x.PatientId, out var first) && first >= start && first <= end);
            var returning = proAppts.Select(x => x.PatientId).Distinct().Count() - newPatients;
            var revenueTrend = Trend(prevRevenue, revenue);
            var status = CalcStatus(cancellationRate, revenue, prevRevenue);
            return new ProfessionalMetricDto(
                ApiIds.Professional(pro.Id),
                pro.Name,
                pro.Specialty,
                total,
                completed,
                cancelled,
                noShow,
                CalcOccupancy(proAppts, start, end, pro),
                revenue,
                netPayout,
                Math.Round(commissionPct, 2),
                Math.Round(ticket, 2),
                cancellationRate,
                newPatients,
                Math.Max(0, returning),
                0,
                revenueTrend,
                status);
        }).OrderByDescending(x => x.Revenue).ToList();
        return Ok(result);
    }

    [Authorize(Roles = "admin")]
    [HttpGet("servicos")]
    public async Task<ActionResult<IReadOnlyList<ServiceMetricDto>>> Servicos([FromQuery] string periodo = "30d", CancellationToken cancellationToken = default)
    {
        var (start, end) = ParsePeriod(periodo);
        var services = await db.Services.AsNoTracking().ToListAsync(cancellationToken);
        var appointments = await db.Appointments.AsNoTracking().Where(x => x.Date >= start && x.Date <= end).Include(x => x.Service).ToListAsync(cancellationToken);
        var payments = await db.Payments.AsNoTracking()
            .Where(x => x.PaidAt >= start.ToDateTime(TimeOnly.MinValue) && x.PaidAt <= end.ToDateTime(TimeOnly.MaxValue))
            .Include(x => x.Appointment).ToListAsync(cancellationToken);

        var result = services.Select(svc =>
        {
            var svcAppts = appointments.Where(x => x.ServiceId == svc.Id).ToList();
            var volume = svcAppts.Count;
            var revenue = payments.Where(x => x.Appointment.ServiceId == svc.Id).Sum(x => x.GrossAmount);
            var completed = svcAppts.Count(x => x.Status == AppointmentStatus.Realizado);
            var cancelled = svcAppts.Count(x => x.Status == AppointmentStatus.Cancelado || x.Status == AppointmentStatus.NaoCompareceu);
            var cancellationRate = volume > 0 ? Math.Round((decimal)cancelled / volume * 100, 2) : 0;
            var conversionRate = volume > 0 ? Math.Round((decimal)completed / volume * 100, 2) : 0;
            return new ServiceMetricDto(
                ApiIds.Service(svc.Id),
                svc.Name,
                volume,
                revenue,
                completed,
                cancelled,
                svc.DurationMinutes,
                svc.DurationMinutes,
                cancellationRate,
                conversionRate);
        }).OrderByDescending(x => x.Revenue).ToList();
        return Ok(result);
    }

    [Authorize(Roles = "admin,recepcao")]
    [HttpGet("movimento")]
    public async Task<ActionResult<MovimentoDto>> Movimento([FromQuery] string? data = null, CancellationToken cancellationToken = default)
    {
        var date = DateOnly.TryParse(data ?? "", out var parsed) ? parsed : DateOnly.FromDateTime(DateTime.Today);
        var yesterday = date.AddDays(-1);

        var appointments = await db.Appointments.AsNoTracking().Where(x => x.Date == date)
            .Include(x => x.Patient).ThenInclude(x => x.User)
            .Include(x => x.Professional)
            .Include(x => x.Service)
            .ToListAsync(cancellationToken);
        var prevAppointments = await db.Appointments.AsNoTracking().Where(x => x.Date == yesterday).ToListAsync(cancellationToken);

        var payments = await db.Payments.AsNoTracking()
            .Include(x => x.Appointment)
            .Where(x => x.PaidAt >= date.ToDateTime(TimeOnly.MinValue) && x.PaidAt <= date.ToDateTime(TimeOnly.MaxValue))
            .ToListAsync(cancellationToken);
        var prevPayments = await db.Payments.AsNoTracking()
            .Where(x => x.PaidAt >= yesterday.ToDateTime(TimeOnly.MinValue) && x.PaidAt <= yesterday.ToDateTime(TimeOnly.MaxValue))
            .ToListAsync(cancellationToken);

        var events = await db.MovementLogs.AsNoTracking()
            .Where(x => x.CreatedAt.Date == date.ToDateTime(TimeOnly.MinValue).Date)
            .OrderByDescending(x => x.CreatedAt)
            .Take(100)
            .ToListAsync(cancellationToken);

        var total = appointments.Count;
        var scheduled = appointments.Count(x => x.Status == AppointmentStatus.Agendado);
        var confirmed = appointments.Count(x => x.Status == AppointmentStatus.Confirmado);
        var inProgress = appointments.Count(x => x.Status == AppointmentStatus.EmAndamento);
        var completed = appointments.Count(x => x.Status == AppointmentStatus.Realizado);
        var cancelled = appointments.Count(x => x.Status == AppointmentStatus.Cancelado);
        var noShow = appointments.Count(x => x.Status == AppointmentStatus.NaoCompareceu);
        var showRate = total > 0 ? Math.Round((decimal)completed / total * 100, 2) : 0;
        var revenueToday = payments.Sum(x => x.GrossAmount);
        var prevRevenueToday = prevPayments.Sum(x => x.GrossAmount);
        var pendingToday = appointments.Where(x => x.Status != AppointmentStatus.Realizado && x.Status != AppointmentStatus.Cancelado).Sum(x => x.Service.BasePrice);

        var statusBreakdown = new List<DistributionDto>
        {
            new("Agendado", scheduled),
            new("Confirmado", confirmed),
            new("Em atendimento", inProgress),
            new("Realizado", completed),
            new("Cancelado", cancelled),
            new("Não compareceu", noShow),
        };
        var revenueByMethod = payments.GroupBy(x => string.IsNullOrEmpty(x.Method) ? "Não informado" : x.Method)
            .Select(g => new DistributionDto(g.Key, g.Sum(x => x.GrossAmount))).ToList();
        var hourly = appointments.GroupBy(x => x.Time.Hour).Select(g => new HourlyDto(g.Key, g.Count())).OrderBy(x => x.Hour).ToList();
        var byProfessional = appointments.GroupBy(x => x.Professional.Name).Select(g => new DistributionDto(g.Key, g.Count())).ToList();

        var nowUtc = DateTime.UtcNow;
        var nowLocalTime = TimeOnly.FromDateTime(nowUtc.ToLocalTime());
        var upcoming = appointments
            .Where(x => x.Time >= nowLocalTime && (x.Status == AppointmentStatus.Agendado || x.Status == AppointmentStatus.Confirmado))
            .Take(8)
            .Select(x => new UpcomingDto(x.Id.ToString(), x.Patient.User.FullName, x.Professional.Name, x.Service.Name, BuildIso(x.Date, x.Time)))
            .ToList();

        var eventsDto = events.Select(x => new MovementEventDto(
            x.Id.ToString(),
            x.EventType,
            x.Description,
            null,
            null,
            null,
            x.CreatedAt.ToString("O"))).ToList();

        return Ok(new MovimentoDto(
            total, scheduled, confirmed, inProgress, completed, cancelled, noShow,
            showRate, revenueToday, pendingToday, 0, 0,
            Trend(prevAppointments.Count, total),
            Trend(prevRevenueToday, revenueToday),
            Trend(prevAppointments.Count(x => x.Status == AppointmentStatus.Realizado), completed),
            statusBreakdown, revenueByMethod, hourly, byProfessional, eventsDto, upcoming));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private async Task<(decimal Revenue, decimal Profit, int Appointments, decimal TicketAverage, decimal Occupancy, decimal CancellationRate, int NewPatients)> SummarizePeriod(DateOnly start, DateOnly end, CancellationToken cancellationToken)
    {
        var appointments = await db.Appointments.AsNoTracking().Where(x => x.Date >= start && x.Date <= end).Include(x => x.Service).ToListAsync(cancellationToken);
        var payments = await db.Payments.AsNoTracking()
            .Where(x => x.PaidAt >= start.ToDateTime(TimeOnly.MinValue) && x.PaidAt <= end.ToDateTime(TimeOnly.MaxValue))
            .ToListAsync(cancellationToken);
        var commissions = await db.Commissions.AsNoTracking()
            .Include(x => x.Appointment)
            .Where(x => x.Appointment.Date >= start && x.Appointment.Date <= end)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0m;
        var custos = await db.Costs.AsNoTracking().SumAsync(x => (decimal?)x.Value, cancellationToken) ?? 0m;
        var revenue = payments.Sum(x => x.GrossAmount);
        var profit = revenue - commissions - custos;
        var total = appointments.Count;
        var cancelled = appointments.Count(x => x.Status == AppointmentStatus.Cancelado || x.Status == AppointmentStatus.NaoCompareceu);
        var cancellationRate = total > 0 ? Math.Round((decimal)cancelled / total * 100, 2) : 0;
        var ticket = total > 0 ? Math.Round(revenue / total, 2) : 0;
        var firstByPatient = await db.Appointments.AsNoTracking().GroupBy(x => x.PatientId).Select(g => new { PatientId = g.Key, FirstDate = g.Min(x => x.Date) }).ToListAsync(cancellationToken);
        var newPatients = firstByPatient.Count(x => x.FirstDate >= start && x.FirstDate <= end);
        var daysInRange = Math.Max(1, (end.DayNumber - start.DayNumber + 1));
        var occupancy = total > 0 ? Math.Min(100, Math.Round((decimal)total / (daysInRange * 8) * 100, 2)) : 0;
        return (revenue, profit, total, ticket, occupancy, cancellationRate, newPatients);
    }

    private static decimal CalcOccupancy(List<Appointment> appts, DateOnly start, DateOnly end, Professional pro)
    {
        var minutesWorked = appts.Sum(x => x.Service.DurationMinutes);
        var daysInRange = Math.Max(1, end.DayNumber - start.DayNumber + 1);
        var weekdaysApprox = daysInRange * 5 / 7;
        var availableMinutes = weekdaysApprox * 8 * 60;
        return availableMinutes > 0 ? Math.Min(100, Math.Round((decimal)minutesWorked / availableMinutes * 100, 2)) : 0;
    }

    private static string CalcStatus(decimal cancellationRate, decimal revenue, decimal prevRevenue)
    {
        if (cancellationRate > 30) return "critico";
        if (cancellationRate > 15) return "atencao";
        if (revenue > prevRevenue * 1.1m && revenue > 0) return "destaque";
        return "estavel";
    }

    private static decimal Trend(decimal previous, decimal current)
    {
        if (previous <= 0) return current > 0 ? 100 : 0;
        return Math.Round((current - previous) / previous * 100, 2);
    }

    private static decimal Trend(int previous, int current) => Trend((decimal)previous, current);

    private static (DateOnly Start, DateOnly End) ParsePeriod(string periodo)
    {
        var end = DateOnly.FromDateTime(DateTime.Today);
        var days = periodo switch
        {
            "hoje" or "Hoje" or "1d" => 0,
            "7d" or "7 dias" => 7,
            "30d" or "30 dias" => 30,
            "3m" or "3 meses" => 90,
            "12m" or "12 meses" => 365,
            _ => 30
        };
        var start = end.AddDays(-days);
        return (start, end);
    }

    private static string BuildIso(DateOnly date, TimeOnly time) => date.ToDateTime(time).ToString("O");
}
