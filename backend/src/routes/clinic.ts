import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { applyIntegrationsPatch, buildIntegrationsDto, getOrCreateClinic, testIntegration } from "../dto/clinic.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get(
  "/integracoes",
  asyncHandler(async (_req, res) => {
    res.json(buildIntegrationsDto(await getOrCreateClinic()));
  }),
);

router.put(
  "/integracoes",
  asyncHandler(async (req, res) => {
    res.json(await applyIntegrationsPatch(req.body));
  }),
);

router.post(
  "/integracoes/:type/test",
  asyncHandler(async (req, res) => {
    res.json(await testIntegration(req.params.type, req.body ?? {}));
  }),
);

export default router;
