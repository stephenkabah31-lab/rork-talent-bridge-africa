import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../backend/trpc/app-router";
import { createContext } from "../../backend/trpc/create-context";
import { seedDatabase } from "../../backend/trpc/data-store";

let seeded = false;

const handler = async (req: Request): Promise<Response> => {
  // Seed demo data on first request (fire-and-forget, non-blocking after first call)
  if (!seeded) {
    seeded = true;
    seedDatabase().catch((err) =>
      console.error("[trpc-api] Seed failed:", err),
    );
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });
};

export { handler as GET, handler as POST, handler as OPTIONS };
