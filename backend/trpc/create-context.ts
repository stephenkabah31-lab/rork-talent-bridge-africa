import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";

interface DecodedToken {
  userId: string;
  email: string;
  type: string;
  iat: number;
}

function verifyToken(token: string): DecodedToken | null {
  try {
    if (!token || !token.startsWith('token_') && !token.startsWith('admin_token_')) {
      return null;
    }
    
    const userId = token.replace('token_', '').replace('admin_token_', '');
    return {
      userId,
      email: '',
      type: token.startsWith('admin_token_') ? 'admin' : 'user',
      iat: Date.now(),
    };
  } catch {
    return null;
  }
}

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  let user: DecodedToken | null = null;
  if (token) {
    user = verifyToken(token);
  }

  return {
    req: opts.req,
    token,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
