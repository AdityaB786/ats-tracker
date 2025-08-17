import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import Application from "../models/Application";
import Job from "../models/Job";
import { AuthRequest } from "../types";
import { authGuard, authorize } from "../middleware/auth";
import { uploadResume } from "../middleware/upload";

import {
  createApplicationSchema,
  updateApplicationSchema,
  paginationSchema,
} from "../utils/validators";

const router = Router();

// Debug endpoint to count applications
router.get("/count", async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Application.countDocuments();
    const applications = await Application.find()
      .select("-resumeData") // Exclude resumeData
      .limit(10)
      .lean();
    res.json({
      totalCount: count,
      applications: applications.map((app) => ({
        _id: app._id,
        applicantName: app.applicantName,
        status: app.status,
        createdAt: app.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to count applications" });
  }
});

// Create application
router.post(
  "/",
  authGuard,
  authorize("applicant"),
  uploadResume,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        jobId,
        applicantName,
        applicantEmail,
        applicantPhone,
        yearsOfExperience,
        currentRole,
        coverLetter,
      } = req.body;

      if (
        !jobId ||
        !applicantName ||
        !applicantEmail ||
        !applicantPhone ||
        yearsOfExperience === undefined
      ) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const job = await Job.findById(jobId);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }
      if (new Date() > job.deadline) {
        res.status(400).json({ error: "Job application deadline has passed" });
        return;
      }

      const existingApplication = await Application.findOne({
        jobId,
        applicantId: req.user?.id,
      });
      if (existingApplication) {
        res.status(409).json({ error: "You have already applied to this job" });
        return;
      }

      const applicationData: any = {
        jobId,
        applicantId: req.user?.id,
        applicantName,
        applicantEmail,
        applicantPhone,
        yearsOfExperience: Number(yearsOfExperience),
        currentRole,
        coverLetter,
        status: "APPLIED",
      };

      if (req.file) {
        applicationData.resumeData = req.file.buffer.toString("base64");
        applicationData.resumeFileName = req.file.originalname;
      }

      const application = new Application(applicationData);
      await application.save();

      await application.populate([
        { path: "jobId", select: "title location" },
        { path: "applicantId", select: "name email" },
      ]);

      res.status(201).json({ application });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({ error: "You have already applied to this job" });
        return;
      }
      res
        .status(500)
        .json({ error: error.message || "Failed to create application" });
    }
  }
);

// Get my applications
router.get(
  "/me",
  authGuard,
  authorize("applicant"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page = "1", pageSize = "10" } = paginationSchema.parse(req.query);

      const pageNum = parseInt(String(page), 10);
      const size = parseInt(String(pageSize), 10);

      const skip = (pageNum - 1) * size;

      const query = { applicantId: req.user?.id };

      const [applications, total] = await Promise.all([
        Application.find(query)
          .populate("jobId")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(size),
        Application.countDocuments(query),
      ]);

      res.json({
        items: applications,
        page: pageNum,
        pageSize: size,
        total,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  }
);

// Get single application
router.get(
  "/:id",
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const application = await Application.findById(req.params.id)
        .populate("jobId")
        .populate("applicantId", "name email");

      if (!application) {
        res.status(404).json({ error: "Application not found" });
        return;
      }

      // Fix: just compare ObjectIds with toString
      if (req.user?.role === "applicant") {
        if (application.applicantId.toString() !== req.user.id) {
          res.status(403).json({ error: "You can only view your own applications" });
          return;
        }
      }

      if (req.user?.role === "recruiter") {
        const job = await Job.findById(application.jobId);
        if (job?.recruiterId.toString() !== req.user.id) {
          res.status(403).json({ error: "You can only view applications for your own jobs" });
          return;
        }
      }

      res.json({ application });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch application" });
    }
  }
);

// Update application
router.patch(
  "/:id",
  authGuard,
  authorize("recruiter"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = updateApplicationSchema.parse(req.body);

      const application = await Application.findById(req.params.id);
      if (!application) {
        res.status(404).json({ error: "Application not found" });
        return;
      }

      const job = await Job.findById(application.jobId);
      if (!job || job.recruiterId.toString() !== req.user?.id) {
        res.status(403).json({ error: "You can only update applications for your own jobs" });
        return;
      }

      if (validatedData.status) application.status = validatedData.status;
      if (validatedData.notes !== undefined)
        application.notes = validatedData.notes;

      await application.save();
      await application.populate(["jobId", "applicantId"]);

      res.json({ application });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update application" });
    }
  }
);

// Download resume
router.get("/:id/resume", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = (req.query.token as string) || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let user;
    try {
      const { verifyToken } = require("../utils/auth");
      const decoded = verifyToken(token);
      user = { id: decoded.sub, role: decoded.role };
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const application = await Application.findById(req.params.id)
      .select("+resumeData resumeFileName")
      .populate("jobId");

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    if (user.role === "applicant" && application.applicantId.toString() !== user.id) {
      res.status(403).json({ error: "You can only view your own resume" });
      return;
    }

    if (user.role === "recruiter") {
      const job = await Job.findById(application.jobId);
      if (!job || job.recruiterId.toString() !== user.id) {
        res.status(403).json({ error: "You can only view resumes for your own jobs" });
        return;
      }
    }

    if (!application.resumeData || !application.resumeFileName) {
      res.status(404).json({ error: "No resume found for this application" });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${application.resumeFileName}"`);
    const buffer = Buffer.from(application.resumeData, "base64");
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: "Failed to download resume" });
  }
});

export default router;
