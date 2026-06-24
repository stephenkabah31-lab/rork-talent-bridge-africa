import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "../expo/backend/trpc/app-router";
import { createContext } from "../expo/backend/trpc/create-context";

// app is mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: (origin) => origin,
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));

// Mount tRPC at /trpc -> accessible at /api/trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "TalentBridge API is running" });
});

export default app;
