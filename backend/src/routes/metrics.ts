import { Router } from "express";
import type { Professional } from "@prisma/client";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { combineIso, dateOnly, dateOnlyString, toMinutes } from "../lib/datetime.js";
import { getPeriodRange, getPreviousRange, trend, type PeriodRange } from "../lib/period.js";
import { myProfessionalId } from "../lib/actor.js";

const router = Router();

const TERMINAL_NON_ATTENDED = new Set(["Cancelado", "NaoCompareceu"]);

const revenueForAppointments = async (patientRange: object) => {
  const payments = await prisma.payment.findMany({ where: { appointment: patientRange } });
  return payments.reduce((sum, payment) => sum + Number(payment.grossAmount), 0);
};

const countAppointmentsInRange = (range: PeriodRange, extra: object = {}) => ({
  date: { gte: range.start, lt: range.end },
  ...extra,
});

const firstAppointmentDates = async () => {
  const grouped = await prisma.appointment.groupBy({ by: ["patientId"], _min: { date: true } });
  return grouped;
};

const estimateAvailableMinutes = (days: number, professionalCount = 1) =>
  (days / 7) * 5 * 8 * 60 * professionalCount;

router.get(
  "/",
  requireAuth,
  requireRole("admin", "profissional"),
  asyncHandler(async (_req, res) => {
    const snapshots = await prisma.metricsSnapshot.findMany();
    res.json(
      snapshots.map((snapshot) => ({
        month: snapshot.monthLabel,
        revenue: Number(snapshot.revenue),
        profit: Number(snapshot.profit),
        appointments: snapshot.appointments,
        ticketAverage: Number(snapshot.ticketAverage),
        occupancy: Number(snapshot.occupancyRate),
        cancellationRate: Number(snapshot.cancellationRate),
        newPatients: snapshot.newPatients,
      })),
    );
  }),
);

router.get(
  "/custos",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const costs = await prisma.cost.findMany();
    res.json(
      costs.map((cost) => ({
        id: cost.id,
        month: cost.monthLabel,
        type: cost.type === "Fixo" ? "fixo" : "variavel",
        name: cost.name,
        value: Number(cost.value),
      })),
    );
  }),
);

router.get(
  "/breakdowns",
  requireAuth,
  requireRole("admin", "profissional"),
  asyncHandler(async (_req, res) => {
    const payments = await prisma.payment.findMany({ include: { appointment: { include: { service: true } } } });
    const commissions = await prisma.commission.findMany({ include: { professional: true } });

    const byService = new Map<string, number>();
    payments.forEach((payment) => {
      const name = payment.appointment.service.name;
      byService.set(name, (byService.get(name) ?? 0) + Number(payment.grossAmount));
    });

    const byProfessional = new Map<string, number>();
    commissions.forEach((commission) => {
      const name = commission.professional.name;
      byProfessional.set(name, (byProfessional.get(name) ?? 0) + Number(commission.amount));
    });

    const toRanking = (map: Map<string, number>) =>
      [...map.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));

    res.json({ serviceRankingMock: toRanking(byService), professionalRankingMock: toRanking(byProfessional) });
  }),
);

router.get(
  "/dashboard",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const range = getPeriodRange(req.query.periodo as string | undefined);
    const previous = getPreviousRange(range);

    const [appointments, previousAppointments] = await Promise.all([
      prisma.appointment.findMany({ where: countAppointmentsInRange(range), include: { service: true } }),
      prisma.appointment.findMany({ where: countAppointmentsInRange(previous), include: { service: true } }),
    ]);

    const revenue = await revenueForAppointments(countAppointmentsInRange(range));
    const previousRevenue = await revenueForAppointments(countAppointmentsInRange(previous));
    const payout = await prisma.commission
      .findMany({ where: { appointment: countAppointmentsInRange(range) } })
      .then((rows) => rows.reduce((sum, row) => sum + Number(row.amount), 0));
    const previousPayout = await prisma.commission
      .findMany({ where: { appointment: countAppointmentsInRange(previous) } })
      .then((rows) => rows.reduce((sum, row) => sum + Number(row.amount), 0));

    const profit = revenue - payout;
    const previousProfit = previousRevenue - previousPayout;

    const completed = appointments.filter((a) => a.status === "Realizado").length;
    const cancelled = appointments.filter((a) => a.status === "Cancelado").length;
    const minutesWorked = appointments
      .filter((a) => a.status !== "Cancelado")
      .reduce((sum, a) => sum + a.service.durationMinutes, 0);
    const professionalCount = Math.max(1, await prisma.professional.count({ where: { providesCare: true } }));
    const occupancy = Math.min(
      100,
      Math.round((minutesWorked / estimateAvailableMinutes(range.days, professionalCount)) * 10000) / 100,
    );

    const firstDates = await firstAppointmentDates();
    const newPatients = firstDates.filter(
      (row) => row._min.date && row._min.date >= range.start && row._min.date < range.end,
    ).length;

    const snapshots = await prisma.metricsSnapshot.findMany();
    const today = dateOnlyString(new Date());
    const now = new Date();
    const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

    const todaysAppointments = await prisma.appointment.findMany({
      where: { date: dateOnly(today) },
      include: { patient: { include: { user: true } }, professional: true, service: true },
      orderBy: { time: "asc" },
    });

    const waitingList = todaysAppointments
      .filter((a) => !TERMINAL_NON_ATTENDED.has(a.status) && a.status !== "Realizado" && toMinutes(a.time) < nowMinutes)
      .slice(0, 5)
      .map((a) => ({
        appointmentId: a.id,
        patientName: a.patient.user.fullName,
        professionalName: a.professional.name,
        service: a.service.name,
        startTime: combineIso(today, a.time),
        waitMinutes: nowMinutes - toMinutes(a.time),
      }));

    const upcoming = todaysAppointments
      .filter((a) => a.status !== "Cancelado" && toMinutes(a.time) >= nowMinutes)
      .slice(0, 5)
      .map((a) => ({
        appointmentId: a.id,
        patientName: a.patient.user.fullName,
        professionalName: a.professional.name,
        service: a.service.name,
        startTime: combineIso(today, a.time),
      }));

    res.json({
      revenue,
      profit,
      appointments: appointments.length,
      ticketAverage: completed > 0 ? Math.round((revenue / completed) * 100) / 100 : 0,
      occupancy,
      cancellationRate: appointments.length > 0 ? Math.round((cancelled / appointments.length) * 10000) / 100 : 0,
      newPatients,
      revenueTrend: trend(previousRevenue, revenue),
      appointmentsTrend: trend(previousAppointments.length, appointments.length),
      profitTrend: trend(previousProfit, profit),
      monthlySeries: snapshots.map((s) => ({
        month: s.monthLabel,
        revenue: Number(s.revenue),
        profit: Number(s.profit),
        appointments: s.appointments,
      })),
      waitingList,
      upcoming,
    });
  }),
);

router.get(
  "/faturamento",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const range = getPeriodRange(req.query.periodo as string | undefined);
    const previous = getPreviousRange(range);

    const payments = await prisma.payment.findMany({
      where: { appointment: countAppointmentsInRange(range) },
      include: { appointment: { include: { service: true, plan: true } } },
    });
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.grossAmount), 0);
    const previousRevenue = await revenueForAppointments(countAppointmentsInRange(previous));

    const commissions = await prisma.commission.findMany({
      where: { appointment: countAppointmentsInRange(range) },
      include: { professional: true, appointment: { include: { payment: true } } },
    });
    const totalPayout = commissions.reduce((sum, c) => sum + Number(c.amount), 0);

    const costs = await prisma.cost.findMany();
    const totalCustos = costs.reduce((sum, c) => sum + Number(c.value), 0);
    const netRevenue = totalRevenue - totalPayout - totalCustos;

    const appointments = await prisma.appointment.findMany({
      where: countAppointmentsInRange(range),
      include: { service: true, payment: true },
    });
    const completedAppointments = appointments.filter((a) => a.status === "Realizado").length;
    const delinquency = appointments
      .filter((a) => a.status === "Realizado" && !a.payment)
      .reduce((sum, a) => sum + Number(a.service.basePrice), 0);

    const byMethod = new Map<string, number>();
    payments.forEach((p) => byMethod.set(p.method || "Outro", (byMethod.get(p.method || "Outro") ?? 0) + Number(p.grossAmount)));

    const byPlan = new Map<string, number>();
    payments.forEach((p) => {
      const label = p.appointment.plan?.name ?? "Sem convênio";
      byPlan.set(label, (byPlan.get(label) ?? 0) + Number(p.grossAmount));
    });

    const custosByCategory = new Map<string, number>();
    costs.forEach((c) => {
      const label = c.type === "Fixo" ? "Fixos" : "Variáveis";
      custosByCategory.set(label, (custosByCategory.get(label) ?? 0) + Number(c.value));
    });

    const payoutByProfessional = new Map<string, { professionalId: string; name: string; specialty: string; appointments: number; gross: number; pctSum: number; net: number }>();
    commissions.forEach((c) => {
      const entry = payoutByProfessional.get(c.professionalId) ?? {
        professionalId: c.professionalId,
        name: c.professional.name,
        specialty: c.professional.specialty,
        appointments: 0,
        gross: 0,
        pctSum: 0,
        net: 0,
      };
      entry.appointments += 1;
      entry.gross += c.appointment.payment ? Number(c.appointment.payment.grossAmount) : 0;
      entry.pctSum += Number(c.percent);
      entry.net += Number(c.amount);
      payoutByProfessional.set(c.professionalId, entry);
    });

    const snapshots = await prisma.metricsSnapshot.findMany();

    res.json({
      totalRevenue,
      totalPayout,
      totalCustos,
      custosCount: costs.length,
      netRevenue,
      margemLiquida: totalRevenue > 0 ? Math.round((netRevenue / totalRevenue) * 10000) / 100 : 0,
      revenueTrend: trend(previousRevenue, totalRevenue),
      totalAppointments: appointments.length,
      completedAppointments,
      ticketMedio: completedAppointments > 0 ? Math.round((totalRevenue / completedAppointments) * 100) / 100 : 0,
      delinquency,
      byMethod: [...byMethod.entries()].map(([label, value]) => ({ label, value })),
      byPlan: [...byPlan.entries()].map(([label, value]) => ({ label, value })),
      custosByCategory: [...custosByCategory.entries()].map(([label, value]) => ({ label, value })),
      payouts: [...payoutByProfessional.values()].map((p) => ({
        professionalId: p.professionalId,
        name: p.name,
        specialty: p.specialty,
        appointments: p.appointments,
        gross: p.gross,
        commissionPct: p.appointments > 0 ? Math.round((p.pctSum / p.appointments) * 100) / 100 : 0,
        net: p.net,
      })),
      monthlyRevenue: snapshots.map((s) => ({
        month: s.monthLabel,
        revenue: Number(s.revenue),
        payout: 0,
        custos: 0,
        netRevenue: Number(s.profit),
      })),
    });
  }),
);

const computeProfessionalMetric = async (
  professional: Professional,
  range: PeriodRange,
  firstDateByPatient: Map<string, Date | null>,
) => {
  const appointments = await prisma.appointment.findMany({
    where: countAppointmentsInRange(range, { professionalId: professional.id }),
    include: { service: true, payment: true },
  });
  const commissions = await prisma.commission.findMany({
    where: { professionalId: professional.id, appointment: countAppointmentsInRange(range) },
  });

  const completedCount = appointments.filter((a) => a.status === "Realizado").length;
  const cancelledCount = appointments.filter((a) => a.status === "Cancelado").length;
  const noShowCount = appointments.filter((a) => a.status === "NaoCompareceu").length;
  const revenue = appointments.reduce((sum, a) => sum + (a.payment ? Number(a.payment.grossAmount) : 0), 0);
  const netPayout = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const minutesWorked = appointments
    .filter((a) => a.status !== "Cancelado")
    .reduce((sum, a) => sum + a.service.durationMinutes, 0);
  const occupancy = Math.min(100, Math.round((minutesWorked / estimateAvailableMinutes(range.days)) * 10000) / 100);

  const patientIds = [...new Set(appointments.map((a) => a.patientId))];
  let newPatients = 0;
  patientIds.forEach((patientId) => {
    const firstDate = firstDateByPatient.get(patientId);
    if (firstDate && firstDate >= range.start && firstDate < range.end) newPatients += 1;
  });

  const cancellationRate = appointments.length > 0 ? Math.round((cancelledCount / appointments.length) * 10000) / 100 : 0;
  const status = cancellationRate > 30 ? "critico" : cancellationRate > 15 ? "atencao" : trend(0, revenue) === 100 && revenue > 0 ? "destaque" : "estavel";

  return {
    professionalId: professional.id,
    name: professional.name,
    specialty: professional.specialty,
    appointments: appointments.length,
    completedCount,
    cancelledCount,
    noShowCount,
    occupancy,
    revenue,
    netPayout,
    commissionPct:
      commissions.length > 0
        ? Math.round((commissions.reduce((sum, c) => sum + Number(c.percent), 0) / commissions.length) * 100) / 100
        : Number(professional.defaultCommissionPercent),
    ticket: completedCount > 0 ? Math.round((revenue / completedCount) * 100) / 100 : 0,
    cancellationRate,
    newPatients,
    returningPatients: patientIds.length - newPatients,
    rating: 4.8,
    revenueTrend: trend(0, revenue),
    status,
  };
};

router.get(
  "/profissionais",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const range = getPeriodRange(req.query.periodo as string | undefined);
    const professionals = await prisma.professional.findMany({ where: { providesCare: true } });
    const firstDates = await firstAppointmentDates();
    const firstDateByPatient = new Map(firstDates.map((row) => [row.patientId, row._min.date]));

    const result = await Promise.all(
      professionals.map((professional) => computeProfessionalMetric(professional, range, firstDateByPatient)),
    );

    res.json(result);
  }),
);

router.get(
  "/profissionais/me",
  requireAuth,
  requireRole("profissional"),
  asyncHandler(async (req, res) => {
    const professionalId = await myProfessionalId(req.user!);
    if (!professionalId) return res.json(null);

    const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
    if (!professional) return res.json(null);

    const offset = Number(req.query.offset ?? 0) || 0;
    const range = getPeriodRange(req.query.periodo as string | undefined, offset);
    const firstDates = await firstAppointmentDates();
    const firstDateByPatient = new Map(firstDates.map((row) => [row.patientId, row._min.date]));

    res.json(await computeProfessionalMetric(professional, range, firstDateByPatient));
  }),
);

router.get(
  "/servicos",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const range = getPeriodRange(req.query.periodo as string | undefined);
    const services = await prisma.service.findMany({ where: { isActive: true } });

    const result = await Promise.all(
      services.map(async (service) => {
        const appointments = await prisma.appointment.findMany({
          where: countAppointmentsInRange(range, { serviceId: service.id }),
          include: { payment: true },
        });
        const completedCount = appointments.filter((a) => a.status === "Realizado").length;
        const cancelledCount = appointments.filter((a) => a.status === "Cancelado" || a.status === "NaoCompareceu").length;
        const revenue = appointments.reduce((sum, a) => sum + (a.payment ? Number(a.payment.grossAmount) : 0), 0);
        const volume = appointments.length;

        return {
          serviceId: service.id,
          name: service.name,
          volume,
          revenue,
          completedCount,
          cancelledCount,
          avgDurationMinutes: service.durationMinutes,
          estimatedDurationMinutes: service.durationMinutes,
          cancellationRate: volume > 0 ? Math.round((cancelledCount / volume) * 10000) / 100 : 0,
          conversionRate: volume > 0 ? Math.round((completedCount / volume) * 10000) / 100 : 0,
        };
      }),
    );

    res.json(result);
  }),
);

router.get(
  "/movimento",
  requireAuth,
  requireRole("admin", "recepcao"),
  asyncHandler(async (req, res) => {
    const data = typeof req.query.data === "string" ? req.query.data : dateOnlyString(new Date());
    const yesterday = dateOnlyString(new Date(dateOnly(data).getTime() - 86400000));

    const loadDay = async (dateStr: string) =>
      prisma.appointment.findMany({
        where: { date: dateOnly(dateStr) },
        include: { patient: { include: { user: true } }, professional: true, service: true, payment: true },
      });

    const [todaysAppointments, yesterdaysAppointments] = await Promise.all([loadDay(data), loadDay(yesterday)]);

    const countBy = (status: string) => todaysAppointments.filter((a) => a.status === status).length;
    const scheduled = countBy("Agendado");
    const confirmed = countBy("Confirmado");
    const inProgress = countBy("EmAndamento");
    const completed = countBy("Realizado");
    const cancelled = countBy("Cancelado");
    const noShow = countBy("NaoCompareceu");
    const attendedBase = todaysAppointments.length - cancelled;

    const revenueToday = todaysAppointments.reduce((sum, a) => sum + (a.payment ? Number(a.payment.grossAmount) : 0), 0);
    const revenueYesterday = yesterdaysAppointments.reduce((sum, a) => sum + (a.payment ? Number(a.payment.grossAmount) : 0), 0);
    const pendingToday = todaysAppointments
      .filter((a) => a.status !== "Cancelado" && !a.payment)
      .reduce((sum, a) => sum + Number(a.service.basePrice), 0);

    const firstDates = await firstAppointmentDates();
    const newPatients = firstDates.filter((row) => row._min.date && dateOnlyString(row._min.date) === data).length;

    const messagesCount = await prisma.message.count({
      where: { sentAt: { gte: dateOnly(data), lt: dateOnly(dateOnlyString(new Date(dateOnly(data).getTime() + 86400000))) } },
    });

    const statusBreakdown = [
      { label: "Agendado", value: scheduled },
      { label: "Confirmado", value: confirmed },
      { label: "Em andamento", value: inProgress },
      { label: "Realizado", value: completed },
      { label: "Cancelado", value: cancelled },
      { label: "Não compareceu", value: noShow },
    ];

    const revenueByMethodMap = new Map<string, number>();
    todaysAppointments.forEach((a) => {
      if (!a.payment) return;
      const label = a.payment.method || "Outro";
      revenueByMethodMap.set(label, (revenueByMethodMap.get(label) ?? 0) + Number(a.payment.grossAmount));
    });

    const hourlyMap = new Map<number, number>();
    todaysAppointments.forEach((a) => {
      const hour = Math.floor(toMinutes(a.time) / 60);
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + 1);
    });

    const byProfessionalMap = new Map<string, number>();
    todaysAppointments.forEach((a) => {
      byProfessionalMap.set(a.professional.name, (byProfessionalMap.get(a.professional.name) ?? 0) + 1);
    });

    const dayEnd = new Date(dateOnly(data).getTime() + 86400000);
    const events = await prisma.movementLog.findMany({
      where: { createdAt: { gte: dateOnly(data), lt: dayEnd } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const now = new Date();
    const isToday = dateOnlyString(now) === data;
    const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const upcoming = todaysAppointments
      .filter((a) => a.status !== "Cancelado" && (!isToday || toMinutes(a.time) >= nowMinutes))
      .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
      .slice(0, 8)
      .map((a) => ({
        appointmentId: a.id,
        patientName: a.patient.user.fullName,
        professionalName: a.professional.name,
        service: a.service.name,
        startTime: combineIso(data, a.time),
      }));

    res.json({
      totalAppointments: todaysAppointments.length,
      scheduled,
      confirmed,
      inProgress,
      completed,
      cancelled,
      noShow,
      showRate: attendedBase > 0 ? Math.round((completed / attendedBase) * 10000) / 100 : 0,
      revenueToday,
      pendingToday,
      newPatients,
      messagesCount,
      appointmentsTrend: trend(yesterdaysAppointments.length, todaysAppointments.length),
      revenueTrend: trend(revenueYesterday, revenueToday),
      completedTrend: trend(yesterdaysAppointments.filter((a) => a.status === "Realizado").length, completed),
      statusBreakdown,
      revenueByMethod: [...revenueByMethodMap.entries()].map(([label, value]) => ({ label, value })),
      hourlyDistribution: [...hourlyMap.entries()].sort((a, b) => a[0] - b[0]).map(([hour, count]) => ({ hour, count })),
      byProfessional: [...byProfessionalMap.entries()].map(([label, value]) => ({ label, value })),
      events: events.map((event) => ({
        id: event.id,
        type: event.eventType,
        description: event.description,
        professional: null,
        patient: null,
        amount: null,
        createdAt: event.createdAt.toISOString(),
      })),
      upcoming,
    });
  }),
);

export default router;
