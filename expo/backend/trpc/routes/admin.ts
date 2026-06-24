import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../create-context";
import {
  getAllProfessionalApplications,
  getAllRecruiterApplications,
  getAllCompanyApplications,
  updateProfessionalStatus,
  updateRecruiterStatus,
  updateCompanyStatus,
  getAllJobs,
  updateJobStatus,
  getJobApplicantsByJobId,
} from "../data-store";

export const adminRouter = createTRPCRouter({
  // ── Professional applications ──────────────────────────────
  getProfessionals: publicProcedure.query(async () => {
    return getAllProfessionalApplications();
  }),

  approveProfessional: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const app = await updateProfessionalStatus(input.id, "approved");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Professional not found" });
      }
      return { success: true, application: app };
    }),

  rejectProfessional: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const app = await updateProfessionalStatus(input.id, "rejected");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Professional not found" });
      }
      return { success: true, application: app };
    }),

  // ── Recruiter applications ─────────────────────────────────
  getRecruiters: publicProcedure.query(async () => {
    return getAllRecruiterApplications();
  }),

  approveRecruiter: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const app = await updateRecruiterStatus(input.id, "approved");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Recruiter not found" });
      }
      return { success: true, application: app };
    }),

  rejectRecruiter: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const app = await updateRecruiterStatus(input.id, "rejected");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Recruiter not found" });
      }
      return { success: true, application: app };
    }),

  // ── Company applications ───────────────────────────────────
  getCompanies: publicProcedure.query(async () => {
    return getAllCompanyApplications();
  }),

  approveCompany: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const app = await updateCompanyStatus(input.id, "approved");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }
      return { success: true, application: app };
    }),

  rejectCompany: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const app = await updateCompanyStatus(input.id, "rejected");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }
      return { success: true, application: app };
    }),

  // ── Unified status update (for web admin) ──────────────────
  updateStatus: publicProcedure
    .input(
      z.object({
        type: z.enum(["professional", "recruiter", "company"]),
        id: z.string(),
        status: z.enum(["approved", "rejected"]),
      }),
    )
    .mutation(async ({ input }) => {
      let app;
      if (input.type === "professional") {
        app = await updateProfessionalStatus(input.id, input.status);
      } else if (input.type === "recruiter") {
        app = await updateRecruiterStatus(input.id, input.status);
      } else {
        app = await updateCompanyStatus(input.id, input.status);
      }
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }
      return { success: true, application: app };
    }),

  // ── Jobs ───────────────────────────────────────────────────
  getJobs: publicProcedure.query(async () => {
    return getAllJobs();
  }),

  updateJobStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["active", "closed", "flagged"]),
      }),
    )
    .mutation(async ({ input }) => {
      const job = await updateJobStatus(input.id, input.status);
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      return { success: true, job };
    }),

  getJobApplicants: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      return getJobApplicantsByJobId(input.jobId);
    }),
});
