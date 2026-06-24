import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

// In dev, use the Vite proxy (relative /api/trpc) so the browser
// sends requests to the same origin where Vite forwards them.
// In production, use Rork's injected backend URL.
const trpcUrl: string = import.meta.env.DEV
  ? "/api/trpc"
  : `${import.meta.env.EXPO_PUBLIC_RORK_API_BASE_URL ?? ""}/api/trpc`;

const getAuthToken = (): string | null => {
  return localStorage.getItem("admin_token");
};

export const trpcClient = createTRPCClient({
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
