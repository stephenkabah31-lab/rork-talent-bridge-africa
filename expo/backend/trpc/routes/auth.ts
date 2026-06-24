import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../create-context";
import {
  createAuthUser,
  getAuthUserByEmail,
  getAuthUser,
} from "../data-store";

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
    .mutation(({ input }) => {
      if (!checkRateLimit(input.email)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many login attempts. Please try again later.",
        });
      }

      const existingUser = getAuthUserByEmail(input.email);

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
    .mutation(({ input }) => {
      // Skip rate-limiting in dev so repeated attempts don't lock the user out.
      // In production this should use a proper rate-limiter with persistence.

      const isValidAdmin =
        (input.username === "admin" && input.password === "admin123") ||
        (input.username === "bridge.gh" && input.password === "bridge123");

      if (!isValidAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const adminUser = {
        id: `admin_${input.username}_${Date.now()}`,
        email: `${input.username}@talentbridge.com`,
        name: input.username === "bridge.gh" ? "Bridge Admin" : "Administrator",
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
      }),
    )
    .mutation(({ input }) => {
      const existingUser = getAuthUserByEmail(input.email);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const hashedPassword = hashPassword(input.password);

      const user = {
        id: Date.now().toString(),
        email: input.email.toLowerCase(),
        name: input.fullName || input.companyName || input.email.split("@")[0],
        type: input.userType,
        fullName: input.fullName,
        companyName: input.companyName,
        phoneNumber: input.phoneNumber,
        country: input.country,
        password: hashedPassword,
      };

      createAuthUser(user);

      console.log(`User registered: ${input.email}`);

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token: `token_${userWithoutPassword.id}`,
      };
    }),

  getCurrentUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const userData = getAuthUser(input.userId);
      if (!userData) return null;

      const { password, ...user } = userData;
      return user;
    }),
});
