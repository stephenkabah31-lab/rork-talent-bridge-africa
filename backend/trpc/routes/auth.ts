import * as z from "zod";
import { TRPCError } from "@trpc/server";
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

const mockUsers: Record<string, User & { password: string }> = {};
const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};

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
      })
    )
    .mutation(({ input }) => {
      if (!checkRateLimit(input.email)) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many login attempts. Please try again later.',
        });
      }

      const existingUser = Object.values(mockUsers).find(
        u => u.email.toLowerCase() === input.email.toLowerCase()
      );

      if (!existingUser) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      if (!verifyPassword(input.password, existingUser.password)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      if (existingUser.type !== input.userType) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
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
      })
    )
    .mutation(({ input }) => {
      if (!checkRateLimit(`admin_${input.username}`)) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many login attempts. Please try again later.',
        });
      }

      if (input.username !== 'admin' || input.password !== 'admin123') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

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
      if (input.code !== '123456') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid verification code',
        });
      }

      console.log(`Admin verification successful`);

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
        email: z.string().email().max(255),
        password: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        fullName: z.string().min(1).max(100).optional(),
        companyName: z.string().min(1).max(100).optional(),
        phoneNumber: z.string().max(20).optional(),
        country: z.string().max(100).optional(),
        userType: z.enum(["professional", "recruiter", "company"]),
      })
    )
    .mutation(({ input }) => {
      const existingUser = Object.values(mockUsers).find(
        u => u.email.toLowerCase() === input.email.toLowerCase()
      );

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      const hashedPassword = hashPassword(input.password);

      const user: User = {
        id: Date.now().toString(),
        email: input.email.toLowerCase(),
        name: input.fullName || input.companyName || input.email.split("@")[0],
        type: input.userType,
        fullName: input.fullName,
        companyName: input.companyName,
        phoneNumber: input.phoneNumber,
        country: input.country,
      };

      mockUsers[user.id] = { ...user, password: hashedPassword };

      console.log(`User registered: ${input.email}`);

      return {
        success: true,
        user,
        token: `token_${user.id}`,
      };
    }),

  getCurrentUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const userData = mockUsers[input.userId];
      if (!userData) return null;
      
      const { password, ...user } = userData;
      return user;
    }),
});
