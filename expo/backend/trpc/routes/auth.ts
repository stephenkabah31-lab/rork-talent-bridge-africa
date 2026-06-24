import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../create-context";
import {
  createAuthUser,
  getAuthUserByEmail,
  getAuthUser,
  createProfessionalApplication,
  createRecruiterApplication,
  createCompanyApplication,
} from "../data-store";
import { supabase } from "../../../lib/supabase";

interface LoginAttemptEntry {
  count: number;
  lastAttempt: number;
}

const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts: Record<string, LoginAttemptEntry> = {};

function hashPassword(password: string): string {
  return `hashed_${password}`;
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashedPassword === `hashed_${password}`;
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts[identifier];

  if (!attempt) {
    loginAttempts[identifier] = { count: 1, lastAttempt: now };
    return true;
  }

  const timeSinceLastAttempt = now - attempt.lastAttempt;
  if (timeSinceLastAttempt > 15 * 60 * 1000) {
    loginAttempts[identifier] = { count: 1, lastAttempt: now };
    return true;
  }

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }

  attempt.count++;
  attempt.lastAttempt = now;
  return true;
}

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email().max(255),
        password: z.string().min(6).max(100),
        userType: z.enum(["professional", "recruiter", "company"]),
      }),
    )
    .mutation(async ({ input }) => {
      if (!checkRateLimit(input.email)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many login attempts. Please try again later.",
        });
      }

      const existingUser = await getAuthUserByEmail(input.email);

      if (!existingUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      if (!verifyPassword(input.password, existingUser.password)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      if (existingUser.type !== input.userType) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const { password, ...userWithoutPassword } = existingUser;

      console.log(`Successful login for ${input.email}`);

      return {
        success: true,
        user: userWithoutPassword,
        token: `token_${userWithoutPassword.id}`,
      };
    }),

  adminLogin: publicProcedure
    .input(
      z.object({
        username: z.string().min(1).max(100),
        password: z.string().min(6).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      // Look up admin user in the database
      const email = `${input.username}@talentbridge.com`;
      const { data: adminRow } = await supabase
        .from("auth_users")
        .select("*")
        .eq("email", email)
        .eq("is_admin", true)
        .maybeSingle();

      if (!adminRow) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const hashedInput = hashPassword(input.password);
      if (hashedInput !== (adminRow.password as string)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const adminUser = {
        id: adminRow.id as string,
        email: adminRow.email as string,
        name: adminRow.name as string,
        type: "admin" as const,
        isAdmin: true,
      };

      console.log(`Admin login: ${input.username}`);

      return {
        success: true,
        user: adminUser,
        token: `admin_token_${adminUser.id}`,
      };
    }),

  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email().max(255),
        password: z
          .string()
          .min(8)
          .max(100)
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
          ),
        fullName: z.string().min(1).max(100).optional(),
        companyName: z.string().min(1).max(100).optional(),
        phoneNumber: z.string().max(20).optional(),
        country: z.string().max(100).optional(),
        userType: z.enum(["professional", "recruiter", "company"]),
        acceptedTerms: z.boolean().refine((v) => v === true, {
          message: "You must accept the Terms of Service",
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const existingUser = await getAuthUserByEmail(input.email);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const hashedPassword = hashPassword(input.password);

      const userId = Date.now().toString();
      const user = {
        id: userId,
        email: input.email.toLowerCase(),
        name: input.fullName || input.companyName || input.email.split("@")[0],
        type: input.userType,
        fullName: input.fullName,
        companyName: input.companyName,
        phoneNumber: input.phoneNumber,
        country: input.country,
        password: hashedPassword,
      };

      await createAuthUser(user);

      // Auto-approve: create application entry with "approved" status
      const now = new Date().toISOString();
      try {
        if (input.userType === "professional") {
          await createProfessionalApplication({
            id: `pro-${userId}`,
            name: input.fullName || input.email.split("@")[0],
            email: input.email.toLowerCase(),
            phone: input.phoneNumber || "",
            location: input.country || "",
            title: "",
            experience: "",
            skills: [],
            status: "approved",
            createdAt: now,
          });
        } else if (input.userType === "recruiter") {
          await createRecruiterApplication({
            id: `rec-${userId}`,
            name: input.fullName || input.email.split("@")[0],
            email: input.email.toLowerCase(),
            phone: input.phoneNumber || "",
            company: input.companyName || "",
            location: input.country || "",
            status: "approved",
            createdAt: now,
          });
        } else if (input.userType === "company") {
          await createCompanyApplication({
            id: `com-${userId}`,
            companyName: input.companyName || input.fullName || "",
            contactPerson: input.fullName || "",
            email: input.email.toLowerCase(),
            phone: input.phoneNumber || "",
            location: input.country || "",
            industry: "",
            website: "",
            registrationNumber: "",
            status: "approved",
            createdAt: now,
          });
        }
      } catch (appErr) {
        console.error("[auth] Failed to create application entry:", appErr);
        // Non-fatal: the auth user was created successfully
      }

      console.log(`User registered (auto-approved): ${input.email} as ${input.userType}`);

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token: `token_${userWithoutPassword.id}`,
      };
    }),

  getCurrentUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const userData = await getAuthUser(input.userId);
      if (!userData) return null;

      const { password, ...user } = userData;
      return user;
    }),
});
