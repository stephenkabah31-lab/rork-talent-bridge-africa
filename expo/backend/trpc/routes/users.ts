import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import {
  getUserById,
  getUsersForSearch,
  addConnection,
  findConnection,
  getConnectionsByUserId,
  getConnectionById,
} from "../data-store";

export const usersRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const user = getUserById(input.userId);
      return user || null;
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.enum(["all", "professional", "recruiter", "company"]).optional(),
      }),
    )
    .query(({ input }) => {
      const queryLower = input.query.toLowerCase();
      let users = getUsersForSearch();

      if (input.type && input.type !== "all") {
        users = users.filter((u) => u.type === input.type);
      }

      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(queryLower) ||
          u.bio?.toLowerCase().includes(queryLower) ||
          u.skills?.some((s) => s.toLowerCase().includes(queryLower)),
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
      }),
    )
    .mutation(({ input, ctx }) => {
      const user = getUserById(input.userId);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (input.userId !== ctx.user?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized action",
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
      }),
    )
    .mutation(({ input, ctx }) => {
      if (input.userId !== ctx.user?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized action",
        });
      }

      const existingConnection = findConnection(input.userId, input.targetUserId);

      if (existingConnection) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Connection already exists",
        });
      }

      const connection = {
        id: Date.now().toString(),
        userId: input.userId,
        connectedUserId: input.targetUserId,
        status: "pending" as const,
        createdAt: new Date(),
      };

      addConnection(connection);

      console.log(`Connection request from ${input.userId} to ${input.targetUserId}`);

      return {
        success: true,
        connection,
      };
    }),

  getConnections: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const conns = getConnectionsByUserId(input.userId);

      const connectedUserIds = conns.map((c) =>
        c.userId === input.userId ? c.connectedUserId : c.userId,
      );

      const connectedUsers = connectedUserIds
        .map((id) => getUserById(id))
        .filter((u): u is NonNullable<typeof u> => u !== undefined && u !== null);

      return connectedUsers;
    }),

  acceptConnection: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(({ input, ctx }) => {
      const connection = getConnectionById(input.connectionId);

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found",
        });
      }

      if (connection.connectedUserId !== ctx.user?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized action",
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
