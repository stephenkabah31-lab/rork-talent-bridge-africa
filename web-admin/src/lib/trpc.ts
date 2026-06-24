import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

// In dev, use the Vite proxy (relative /api/trpc) so the browser
// sends requests to the same origin where Vite forwards them.
// In production, call the Cloudflare Functions backend Worker.
const PRODUCTION_API_ORIGIN = import.meta.env.EXPO_PUBLIC_RORK_FUNCTIONS_URL ?? "https://hire-me-africa-backend.rork.app";
const trpcUrl: string = import.meta.env.DEV
  ? "/api/trpc"
  : `${PRODUCTION_API_ORIGIN}/api/trpc`;

const getAuthToken = (): string | null => {
  // Auth-context stores under "talentbridge_token" — must match
  return localStorage.getItem("talentbridge_token");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const raw: any = createTRPCClient({
  links: [
    httpBatchLink({
      url: trpcUrl,
      transformer: superjson,
      headers() {
        const token = getAuthToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

export { raw as trpcClient, raw as trpc };
