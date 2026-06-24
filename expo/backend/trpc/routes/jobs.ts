import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import {
  getAllJobs,
  getJobById,
  createJob,
  getAllJobApplications,
  getApplicationsByUser,
  getApplicationsByJob,
  createJobApplication,
  getApplicationById,
  incrementJobApplicants,
} from "../data-store";
import type { Job } from "../data-store";

export const jobsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        filter: z
          .enum(["all", "full-time", "part-time", "contract", "remote"])
          .optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      let filteredJobs = [...(await getAllJobs())];

      if (input.filter && input.filter !== "all") {
        filteredJobs = filteredJobs.filter(
          (job) => job.type.toLowerCase() === input.filter?.replace("-", " "),
        );
      }

      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.title.toLowerCase().includes(searchLower) ||
            job.company.toLowerCase().includes(searchLower) ||
            job.location.toLowerCase().includes(searchLower),
        );
      }

      console.log(`Fetching jobs, found ${filteredJobs.length}`);

      return filteredJobs;
    }),

  getById: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const job = await getJobById(input.jobId);
      return job || null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        company: z.string().min(1),
        location: z.string().min(1),
        type: z.enum(["Full-time", "Part-time", "Contract", "Remote"]),
        salary: z.string().optional(),
        description: z.string().min(1),
        requirements: z.array(z.string()),
        postedBy: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const newJob: Job = {
        id: Date.now().toString(),
        ...input,
        postedAt: new Date(),
        applicants: 0,
        status: "active",
      };

      await createJob(newJob);

      console.log(`Created job ${newJob.id}: ${newJob.title}`);

      return {
        success: true,
        job: newJob,
      };
    }),

  apply: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        userId: z.string(),
        coverLetter: z.string(),
        resume: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const job = await getJobById(input.jobId);

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (input.userId !== ctx.user?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized action",
        });
      }

      const existingApplications = await getApplicationsByJob(input.jobId);
      const existingApplication = existingApplications.find(
        (app) => app.userId === input.userId,
      );

      if (existingApplication) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already applied to this job",
        });
      }

      const application = {
        id: Date.now().toString(),
        jobId: input.jobId,
        userId: input.userId,
        coverLetter: input.coverLetter,
        resume: input.resume,
        appliedAt: new Date(),
        status: "pending" as const,
      };

      await createJobApplication(application);
      await incrementJobApplicants(input.jobId);

      console.log(`User ${input.userId} applied to job ${input.jobId}`);

      return {
        success: true,
        application,
      };
    }),

  getApplications: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        jobId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      let applications = [...(await getAllJobApplications())];

      if (input.userId) {
        applications = await getApplicationsByUser(input.userId);
      }

      if (input.jobId) {
        applications = applications.filter((app) => app.jobId === input.jobId);
      }

      return applications;
    }),

  updateApplicationStatus: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        status: z.enum([
          "pending",
          "reviewing",
          "shortlisted",
          "accepted",
          "rejected",
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const application = await getApplicationById(input.applicationId);

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const job = await getJobById(application.jobId);
      if (job && job.postedBy !== ctx.user?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized action",
        });
      }

      application.status = input.status;

      console.log(
        `Updated application ${input.applicationId} status to ${input.status}`,
      );

      return {
        success: true,
        application,
      };
    }),
});
