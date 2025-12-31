import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";

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
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  isPremium?: boolean;
  connections?: string[];
}

const mockUsers: Record<string, User> = {
  u1: {
    id: "u1",
    email: "amara@example.com",
    name: "Amara Okafor",
    type: "recruiter",
    fullName: "Amara Okafor",
    bio: "Talent Acquisition Lead helping companies find the best talent across Africa",
    isPremium: true,
    connections: [],
  },
  u2: {
    id: "u2",
    email: "kwame@example.com",
    name: "Kwame Mensah",
    type: "professional",
    fullName: "Kwame Mensah",
    bio: "Product Strategy Consultant | Digital Innovation",
    skills: ["Product Strategy", "Digital Innovation", "Consulting"],
    isPremium: false,
    connections: [],
  },
  u3: {
    id: "u3",
    email: "zainab@example.com",
    name: "Zainab Hassan",
    type: "professional",
    fullName: "Zainab Hassan",
    bio: "Design Lead at Digital Agency | UI/UX Expert",
    skills: ["UI/UX Design", "Product Design", "Design Systems"],
    isPremium: true,
    connections: [],
  },
};

interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

const mockConnections: Connection[] = [];

export const usersRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const user = mockUsers[input.userId];
      return user || null;
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.enum(["all", "professional", "recruiter", "company"]).optional(),
      })
    )
    .query(({ input }) => {
      const queryLower = input.query.toLowerCase();
      let users = Object.values(mockUsers);

      if (input.type && input.type !== "all") {
        users = users.filter((u) => u.type === input.type);
      }

      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(queryLower) ||
          u.bio?.toLowerCase().includes(queryLower) ||
          u.skills?.some((s) => s.toLowerCase().includes(queryLower))
      );

      console.log(`User search for "${input.query}", found ${users.length}`);

      return users;
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        fullName: z.string().optional(),
        bio: z.string().optional(),
        skills: z.array(z.string()).optional(),
        experience: z.string().optional(),
        education: z.string().optional(),
        phoneNumber: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const user = mockUsers[input.userId];

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (input.userId !== ctx.user?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized action',
        });
      }

      Object.assign(user, {
        fullName: input.fullName ?? user.fullName,
        bio: input.bio ?? user.bio,
        skills: input.skills ?? user.skills,
        experience: input.experience ?? user.experience,
        education: input.education ?? user.education,
        phoneNumber: input.phoneNumber ?? user.phoneNumber,
        country: input.country ?? user.country,
      });

      console.log(`Updated profile for user ${input.userId}`);

      return {
        success: true,
        user,
      };
    }),

  connect: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      if (input.userId !== ctx.user?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized action',
        });
      }

      const existingConnection = mockConnections.find(
        (c) =>
          (c.userId === input.userId && c.connectedUserId === input.targetUserId) ||
          (c.userId === input.targetUserId && c.connectedUserId === input.userId)
      );

      if (existingConnection) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Connection already exists',
        });
      }

      const connection: Connection = {
        id: Date.now().toString(),
        userId: input.userId,
        connectedUserId: input.targetUserId,
        status: "pending",
        createdAt: new Date(),
      };

      mockConnections.push(connection);

      console.log(`Connection request from ${input.userId} to ${input.targetUserId}`);

      return {
        success: true,
        connection,
      };
    }),

  getConnections: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const connections = mockConnections.filter(
        (c) =>
          (c.userId === input.userId || c.connectedUserId === input.userId) &&
          c.status === "accepted"
      );

      const connectedUserIds = connections.map((c) =>
        c.userId === input.userId ? c.connectedUserId : c.userId
      );

      const connectedUsers = connectedUserIds
        .map((id) => mockUsers[id])
        .filter((u) => u !== undefined);

      return connectedUsers;
    }),

  acceptConnection: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(({ input, ctx }) => {
      const connection = mockConnections.find((c) => c.id === input.connectionId);

      if (!connection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        });
      }

      if (connection.connectedUserId !== ctx.user?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized action',
        });
      }

      connection.status = "accepted";

      console.log(`Connection ${input.connectionId} accepted`);

      return {
        success: true,
        connection,
      };
    }),
});
