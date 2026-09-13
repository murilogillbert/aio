import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { ClinicConfig } from "../dto/config.js";
import { buildClinicConfig, applyClinicConfig } from "../dto/config.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await buildClinicConfig());
  }),
);

router.put(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await applyClinicConfig(req.body as ClinicConfig);
    res.json(await buildClinicConfig());
  }),
);

export default router;
