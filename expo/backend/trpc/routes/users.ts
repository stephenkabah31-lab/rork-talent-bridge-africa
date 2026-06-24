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
    .query(async ({ input }) => {
      const user = await getUserById(input.userId);
      return user || null;
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.enum(["all", "professional", "recruiter", "company"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      const queryLower = input.query.toLowerCase();
      let users = await getUsersForSearch();

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
    .mutation(async ({ input, ctx }) => {
      const user = await getUserById(input.userId);

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
    .mutation(async ({ input, ctx }) => {
      if (input.userId !== ctx.user?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized action",
        });
      }

      const existingConnection = await findConnection(input.userId, input.targetUserId);

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

      await addConnection(connection);

      console.log(`Connection request from ${input.userId} to ${input.targetUserId}`);

      return {
        success: true,
        connection,
      };
    }),

  getConnections: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const conns = await getConnectionsByUserId(input.userId);

      const connectedUserIds = conns.map((c) =>
        c.userId === input.userId ? c.connectedUserId : c.userId,
      );

      const connectedUsers = await Promise.all(
        connectedUserIds.map((id) => getUserById(id)),
      );

      return connectedUsers.filter(
        (u): u is NonNullable<typeof u> => u !== undefined && u !== null,
      );
    }),

  acceptConnection: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const connection = await getConnectionById(input.connectionId);

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
