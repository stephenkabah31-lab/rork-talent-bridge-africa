import * as z from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import {
  getCallsByUser,
  createScheduledCall,
  type ScheduledCall,
} from "../data-store";

export const callsRouter = createTRPCRouter({
  getByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return getCallsByUser(input.userId);
    }),

  schedule: protectedProcedure
    .input(
      z.object({
        callerId: z.string(),
        recipientId: z.string(),
        recipientName: z.string(),
        type: z.enum(["audio", "video"]),
        scheduledAt: z.string(),
        jobTitle: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const call: ScheduledCall = {
        id: Date.now().toString(),
        callerId: input.callerId,
        recipientId: input.recipientId,
        recipientName: input.recipientName,
        type: input.type,
        status: "scheduled",
        scheduledAt: new Date(input.scheduledAt),
        jobTitle: input.jobTitle,
      };

      await createScheduledCall(call);
      return { success: true, call };
    }),
});
