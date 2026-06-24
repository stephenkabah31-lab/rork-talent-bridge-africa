import { createTRPCRouter } from "./create-context";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";
import { postsRouter } from "./routes/posts";
import { usersRouter } from "./routes/users";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  auth: authRouter,
  posts: postsRouter,
  jobs: jobsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
