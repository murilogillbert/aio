import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { badRequest, forbidden, notFound } from "../lib/httpError.js";

const router = Router();
router.use(requireAuth);

const toConversationDto = (
  conversation: {
    id: string;
    title: string;
    channel: string;
    participants: { userId: string; user: { id: string; fullName: string; userRoles: { role: { name: string } }[] } }[];
    messages: { id: string; authorUserId: string | null; authorName: string; body: string; sentAt: Date }[];
  },
  currentUserId: string,
) => {
  const others = conversation.participants.filter((p) => p.userId !== currentUserId).map((p) => p.user);
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  return {
    id: conversation.id,
    title: conversation.title || others.map((o) => o.fullName).join(", ") || "Conversa",
    participants: others.map((o) => ({ id: o.id, fullName: o.fullName, role: o.userRoles[0]?.role.name ?? "" })),
    lastMessage: lastMessage
      ? { body: lastMessage.body, sentAt: lastMessage.sentAt.toISOString(), authorName: lastMessage.authorName }
      : null,
  };
};

const usersByRole = async (roleName: string) => {
  const rows = await prisma.user.findMany({
    where: { userRoles: { some: { role: { name: roleName } } } },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });
  return rows.map((r) => ({ id: r.id, fullName: r.fullName, role: roleName }));
};

router.get(
  "/destinatarios",
  asyncHandler(async (req, res) => {
    const role = req.user!.role;
    if (role === "paciente" || role === "profissional") {
      res.json(await usersByRole("recepcao"));
      return;
    }
    if (role === "recepcao") {
      const [professionals, admins] = await Promise.all([usersByRole("profissional"), usersByRole("admin")]);
      res.json([...professionals, ...admins]);
      return;
    }
    // admin
    const [professionals, receptionists] = await Promise.all([usersByRole("profissional"), usersByRole("recepcao")]);
    res.json([...professionals, ...receptionists]);
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user!.id } } },
      include: {
        participants: { include: { user: { include: { userRoles: { include: { role: true } } } } } },
        messages: { orderBy: { sentAt: "desc" }, take: 1 },
      },
    });
    res.json(conversations.map((c) => toConversationDto(c, req.user!.id)));
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { participantUserIds, title } = req.body as { participantUserIds?: string[]; title?: string };
    if (!participantUserIds || participantUserIds.length === 0) throw badRequest("Informe ao menos um destinatário.");

    const allParticipantIds = Array.from(new Set([req.user!.id, ...participantUserIds]));

    if (allParticipantIds.length === 2) {
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: allParticipantIds.map((userId) => ({ participants: { some: { userId } } })),
        },
        include: {
          participants: { include: { user: { include: { userRoles: { include: { role: true } } } } } },
          messages: { orderBy: { sentAt: "desc" }, take: 1 },
        },
      });
      if (existing && existing.participants.length === 2) {
        res.json(toConversationDto(existing, req.user!.id));
        return;
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: title ?? "",
        participants: { create: allParticipantIds.map((userId) => ({ userId })) },
      },
      include: {
        participants: { include: { user: { include: { userRoles: { include: { role: true } } } } } },
        messages: { orderBy: { sentAt: "desc" }, take: 1 },
      },
    });
    res.status(201).json(toConversationDto(conversation, req.user!.id));
  }),
);

const requireParticipant = async (conversationId: string, userId: string) => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) throw forbidden("Você não participa desta conversa.");
};

router.get(
  "/:id/mensagens",
  asyncHandler(async (req, res) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conversation) throw notFound("Conversa não encontrada.");
    await requireParticipant(conversation.id, req.user!.id);

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { sentAt: "asc" },
    });
    res.json(
      messages.map((m) => ({
        id: m.id,
        authorUserId: m.authorUserId,
        authorName: m.authorName,
        body: m.body,
        sentAt: m.sentAt.toISOString(),
        mine: m.authorUserId === req.user!.id,
      })),
    );
  }),
);

router.post(
  "/:id/mensagens",
  asyncHandler(async (req, res) => {
    const { body } = req.body as { body?: string };
    if (!body || !body.trim()) throw badRequest("Mensagem vazia.");

    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conversation) throw notFound("Conversa não encontrada.");
    await requireParticipant(conversation.id, req.user!.id);

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        authorUserId: req.user!.id,
        authorName: req.user!.fullName,
        body: body.trim(),
      },
    });
    res.status(201).json({
      id: message.id,
      authorUserId: message.authorUserId,
      authorName: message.authorName,
      body: message.body,
      sentAt: message.sentAt.toISOString(),
      mine: true,
    });
  }),
);

export default router;
