import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { badRequest } from "../lib/httpError.js";
import { supabase } from "../lib/supabase.js";
import { env } from "../env.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.post(
  "/",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest("Envie um arquivo no campo 'file'.");

    const extension = req.file.originalname.includes(".") ? req.file.originalname.split(".").pop() : undefined;
    const path = `${req.user!.id}/${randomUUID()}${extension ? `.${extension}` : ""}`;

    const { error } = await supabase.storage
      .from(env.supabaseStorageBucket)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype });
    if (error) throw badRequest(`Falha ao enviar arquivo: ${error.message}`);

    const { data } = supabase.storage.from(env.supabaseStorageBucket).getPublicUrl(path);
    res.json({ url: data.publicUrl });
  }),
);

export default router;
