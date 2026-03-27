import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary?: string;
  description: string;
  requirements: string[];
  postedBy: string;
  postedAt: Date;
  applicants: number;
  status: "active" | "closed";
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "TechCorp Africa",
    location: "Lagos, Nigeria",
    type: "Full-time",
    salary: "$60,000 - $90,000",
    description: "We are seeking a talented Senior Software Engineer to join our growing team.",
    requirements: ["5+ years experience", "React Native", "Node.js"],
    postedBy: "recruiter1",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    applicants: 45,
    status: "active",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "DesignHub",
    location: "Accra, Ghana",
    type: "Remote",
    salary: "$40,000 - $60,000",
    description: "Looking for a creative Product Designer to help shape our products.",
    requirements: ["3+ years experience", "Figma", "User Research"],
    postedBy: "company1",
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    applicants: 28,
    status: "active",
  },
];

interface Application {
  id: string;
  jobId: string;
  userId: string;
  coverLetter: string;
  resume?: string;
  appliedAt: Date;
  status: "pending" | "reviewing" | "shortlisted" | "accepted" | "rejected";
}

const mockApplications: Application[] = [];

export const jobsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        filter: z.enum(["all", "full-time", "part-time", "contract", "remote"]).optional(),
        search: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let filteredJobs = [...mockJobs];

      if (input.filter && input.filter !== "all") {
        filteredJobs = filteredJobs.filter((job) =>
          job.type.toLowerCase() === input.filter?.replace("-", " ")
        );
      }

      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.title.toLowerCase().includes(searchLower) ||
            job.company.toLowerCase().includes(searchLower) ||
            job.location.toLowerCase().includes(searchLower)
        );
      }

      console.log(`Fetching jobs, found ${filteredJobs.length}`);

      return filteredJobs;
    }),

  getById: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(({ input }) => {
      const job = mockJobs.find((j) => j.id === input.jobId);
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
      })
    )
    .mutation(({ input }) => {
      const newJob: Job = {
        id: Date.now().toString(),
        ...input,
        postedAt: new Date(),
        applicants: 0,
        status: "active",
      };

      mockJobs.unshift(newJob);

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
      })
    )
    .mutation(({ input, ctx }) => {
      const job = mockJobs.find((j) => j.id === input.jobId);

      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        });
      }

      if (input.userId !== ctx.user?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized action',
        });
      }

      const existingApplication = mockApplications.find(
        (app) => app.jobId === input.jobId && app.userId === input.userId
      );

      if (existingApplication) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Already applied to this job',
        });
      }

      const application: Application = {
        id: Date.now().toString(),
        jobId: input.jobId,
        userId: input.userId,
        coverLetter: input.coverLetter,
        resume: input.resume,
        appliedAt: new Date(),
        status: "pending",
      };

      mockApplications.push(application);
      job.applicants += 1;

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
      })
    )
    .query(({ input }) => {
      let applications = [...mockApplications];

      if (input.userId) {
        applications = applications.filter((app) => app.userId === input.userId);
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
        status: z.enum(["pending", "reviewing", "shortlisted", "accepted", "rejected"]),
      })
    )
    .mutation(({ input, ctx }) => {
      const application = mockApplications.find((app) => app.id === input.applicationId);

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found',
        });
      }

      const job = mockJobs.find((j) => j.id === application.jobId);
      if (job && job.postedBy !== ctx.user?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized action',
        });
      }

      application.status = input.status;

      console.log(`Updated application ${input.applicationId} status to ${input.status}`);

      return {
        success: true,
        application,
      };
    }),
});
