import { createTRPCRouter } from "./create-context";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";
import { postsRouter } from "./routes/posts";
import { usersRouter } from "./routes/users";
import { messagesRouter } from "./routes/messages";
import { notificationsRouter } from "./routes/notifications";
import { callsRouter } from "./routes/calls";
import { paymentsRouter } from "./routes/payments";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  auth: authRouter,
  posts: postsRouter,
  jobs: jobsRouter,
  users: usersRouter,
  messages: messagesRouter,
  notifications: notificationsRouter,
  calls: callsRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
