import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

interface User {
  id: string;
  email: string;
  name: string;
  type: "professional" | "recruiter" | "company";
  fullName?: string;
  companyName?: string;
  phoneNumber?: string;
  country?: string;
  profilePicture?: string;
  isPremium?: boolean;
}

const mockUsers: Record<string, User> = {};

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        userType: z.enum(["professional", "recruiter", "company"]),
      })
    )
    .mutation(({ input }) => {
      console.log(`Login attempt for ${input.email} as ${input.userType}`);

      const user: User = {
        id: Date.now().toString(),
        email: input.email,
        name: input.email.split("@")[0],
        type: input.userType,
      };

      mockUsers[user.id] = user;

      return {
        success: true,
        user,
        token: `token_${user.id}`,
      };
    }),

  adminLogin: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(({ input }) => {
      console.log(`Admin login attempt for ${input.username}`);

      return {
        success: true,
        requiresVerification: true,
      };
    }),

  adminVerify: publicProcedure
    .input(
      z.object({
        code: z.string().length(6),
      })
    )
    .mutation(({ input }) => {
      console.log(`Admin verification with code ${input.code}`);

      const adminUser = {
        id: "admin_" + Date.now(),
        email: "admin@talentbridge.com",
        name: "Admin User",
        type: "admin" as const,
        isAdmin: true,
      };

      return {
        success: true,
        user: adminUser,
        token: `admin_token_${adminUser.id}`,
      };
    }),

  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        fullName: z.string().optional(),
        companyName: z.string().optional(),
        phoneNumber: z.string().optional(),
        country: z.string().optional(),
        userType: z.enum(["professional", "recruiter", "company"]),
      })
    )
    .mutation(({ input }) => {
      console.log(`Signup for ${input.email} as ${input.userType}`);

      const user: User = {
        id: Date.now().toString(),
        email: input.email,
        name: input.fullName || input.companyName || input.email.split("@")[0],
        type: input.userType,
        fullName: input.fullName,
        companyName: input.companyName,
        phoneNumber: input.phoneNumber,
        country: input.country,
      };

      mockUsers[user.id] = user;

      return {
        success: true,
        user,
        token: `token_${user.id}`,
      };
    }),

  getCurrentUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const user = mockUsers[input.userId];
      return user || null;
    }),
});
