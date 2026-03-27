import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";
import { postsRouter } from "./routes/posts";
import { usersRouter } from "./routes/users";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  posts: postsRouter,
  jobs: jobsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
