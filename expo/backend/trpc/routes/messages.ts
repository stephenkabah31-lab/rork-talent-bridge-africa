import * as z from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import {
  getConversationsByUser,
  getMessagesByConversation,
  sendMessage,
  createConversation,
  getConversationById,
  type Message,
  type Conversation,
} from "../data-store";

export const messagesRouter = createTRPCRouter({
  getConversations: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return getConversationsByUser(input.userId);
    }),

  getMessages: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input }) => {
      return getMessagesByConversation(input.conversationId);
    }),

  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        senderId: z.string(),
        recipientId: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.senderId !== ctx.user?.userId) {
        throw new Error("Unauthorized");
      }

      const msg: Message = {
        id: Date.now().toString(),
        conversationId: input.conversationId,
        senderId: input.senderId,
        recipientId: input.recipientId,
        content: input.content,
        createdAt: new Date(),
        read: false,
      };

      await sendMessage(msg);
      return { success: true, message: msg };
    }),

  createConversation: protectedProcedure
    .input(
      z.object({
        participantIds: z.array(z.string()).min(2).max(2),
        jobTitle: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const conv: Conversation = {
        id: Date.now().toString(),
        participantIds: input.participantIds,
        lastMessage: "Conversation started",
        lastMessageAt: new Date(),
        jobTitle: input.jobTitle,
      };

      await createConversation(conv);
      return { success: true, conversation: conv };
    }),
});
