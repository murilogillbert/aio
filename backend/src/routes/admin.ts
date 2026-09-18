import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getHandler } from "../dto/adminCrud.js";
import { buildSafeUser } from "../dto/user.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get(
  "/usuarios",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ select: { id: true }, take: 500 });
    const safeUsers = await Promise.all(users.map((user) => buildSafeUser(user.id)));
    res.json(safeUsers.filter(Boolean));
  }),
);

router.get(
  "/crud/:resource",
  asyncHandler(async (req, res) => {
    res.json(await getHandler(req.params.resource).list());
  }),
);

router.post(
  "/crud/:resource",
  asyncHandler(async (req, res) => {
    const { fields } = req.body as { fields?: Record<string, string> };
    res.json(await getHandler(req.params.resource).create(fields ?? {}));
  }),
);

router.put(
  "/crud/:resource/:id",
  asyncHandler(async (req, res) => {
    const { fields } = req.body as { fields?: Record<string, string> };
    await getHandler(req.params.resource).update(req.params.id, fields ?? {});
    res.status(204).send();
  }),
);

router.delete(
  "/crud/:resource/:id",
  asyncHandler(async (req, res) => {
    await getHandler(req.params.resource).remove(req.params.id);
    res.status(204).send();
  }),
);

export default router;
