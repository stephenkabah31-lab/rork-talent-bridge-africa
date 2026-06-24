import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import {
  getNotificationsByUser,
  createNotification,
  markNotificationsRead,
} from "../data-store";

export const notificationsRouter = createTRPCRouter({
  getByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return getNotificationsByUser(input.userId);
    }),

  markRead: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      await markNotificationsRead(input.userId);
      return { success: true };
    }),
});
