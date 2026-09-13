import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.get(
  "/vagas",
  asyncHandler(async (_req, res) => {
    const jobs = await prisma.jobOpening.findMany();
    res.json(
      jobs.map((job) => ({
        id: job.id,
        title: job.title,
        department: job.department,
        description: job.description,
        status: job.status,
      })),
    );
  }),
);

router.get(
  "/candidaturas",
  asyncHandler(async (_req, res) => {
    const applications = await prisma.jobApplication.findMany();
    res.json(
      applications.map((application) => ({
        id: application.id,
        jobId: application.jobOpeningId ?? undefined,
        candidate: application.candidate,
        email: application.email,
        message: application.message,
        createdAt: application.createdAt.toISOString(),
      })),
    );
  }),
);

export default router;
