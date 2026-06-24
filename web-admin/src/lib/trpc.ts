import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const getBaseUrl = (): string => {
  const url = import.meta.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!url) {
    throw new Error(
      "Rork did not set EXPO_PUBLIC_RORK_API_BASE_URL, please use support",
    );
  }
  return url;
};

const getAuthToken = (): string | null => {
  return localStorage.getItem("admin_token");
};

export const trpcClient = createTRPCClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        const token = getAuthToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
