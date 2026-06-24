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
  getProfessionals: publicProcedure.query(() => {
    return getAllProfessionalApplications();
  }),

  approveProfessional: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const app = updateProfessionalStatus(input.id, "approved");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Professional not found" });
      }
      return { success: true, application: app };
    }),

  rejectProfessional: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const app = updateProfessionalStatus(input.id, "rejected");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Professional not found" });
      }
      return { success: true, application: app };
    }),

  // ── Recruiter applications ─────────────────────────────────
  getRecruiters: publicProcedure.query(() => {
    return getAllRecruiterApplications();
  }),

  approveRecruiter: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const app = updateRecruiterStatus(input.id, "approved");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Recruiter not found" });
      }
      return { success: true, application: app };
    }),

  rejectRecruiter: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const app = updateRecruiterStatus(input.id, "rejected");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Recruiter not found" });
      }
      return { success: true, application: app };
    }),

  // ── Company applications ───────────────────────────────────
  getCompanies: publicProcedure.query(() => {
    return getAllCompanyApplications();
  }),

  approveCompany: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const app = updateCompanyStatus(input.id, "approved");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }
      return { success: true, application: app };
    }),

  rejectCompany: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const app = updateCompanyStatus(input.id, "rejected");
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }
      return { success: true, application: app };
    }),

  // ── Jobs ───────────────────────────────────────────────────
  getJobs: publicProcedure.query(() => {
    return getAllJobs();
  }),

  updateJobStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["active", "closed", "flagged"]),
      }),
    )
    .mutation(({ input }) => {
      const job = updateJobStatus(input.id, input.status);
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      return { success: true, job };
    }),

  getJobApplicants: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(({ input }) => {
      return getJobApplicantsByJobId(input.jobId);
    }),
});
