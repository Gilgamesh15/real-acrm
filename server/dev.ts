import { Hono } from "hono";
import { isbot } from "isbot";
import { createServer as createHttpServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import { Readable } from "node:stream";
import { createRequestHandler } from "react-router";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT) || 5173;

const httpServer = createHttpServer();

// middlewareMode: true makes @react-router/dev skip its own (context-less) SSR
// handler, so we can provide our own with proper logger + session context.
const vite = await createViteServer({
  server: { middlewareMode: true },
});

const root = process.cwd();

// Helpers to load server modules lazily via Vite (resolves ~/ aliases, caches).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadAuth(): Promise<any> {
  const mod = await vite.ssrLoadModule(
    resolve(root, "app/lib/auth.server.tsx")
  );
  return mod.auth;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadLogger(): Promise<any> {
  const mod = await vite.ssrLoadModule(
    resolve(root, "app/lib/logger.server.ts")
  );
  return mod.logger;
}

const app = new Hono<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Variables: { logger: any; session: any };
}>();

// Logging middleware — mirrors server/app.ts
app.use("*", async (c, next) => {
  const logger = await loadLogger();
  const requestId = c.req.header("x-request-id") ?? crypto.randomUUID();
  const url = new URL(c.req.url);

  const reqLogger = logger.child({
    requestId,
    method: c.req.method,
    path: url.pathname,
  });

  c.set("logger", reqLogger);
  reqLogger.info("Request started");
  const start = performance.now();

  await next();

  const duration = Math.round(performance.now() - start);
  reqLogger.info("Request completed", { status: c.res.status, duration });
});

// Session middleware — mirrors server/app.ts
app.use("*", async (c, next) => {
  c.set("session", null);
  const userAgent = c.req.header("user-agent");
  const url = new URL(c.req.url);

  if (!isbot(userAgent) && !url.pathname.startsWith("/api/webhooks")) {
    const auth = await loadAuth();
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    c.set("session", session);
  }

  await next();
});

// React Router SSR handler — loads build fresh each request for HMR support
app.all("*", async (c) => {
  const build = await vite.ssrLoadModule("virtual:react-router/server-build");
  const handler = createRequestHandler(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    build as any,
    "development"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handler(c.req.raw, { logger: c.get("logger"), session: c.get("session") } as any);
});

function fromNodeRequest(nodeReq: IncomingMessage): Request {
  const host = nodeReq.headers.host ?? `localhost:${PORT}`;
  const url = `http://${host}${nodeReq.url ?? "/"}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeReq.headers)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }

  const init: RequestInit & { duplex?: string } = {
    method: nodeReq.method ?? "GET",
    headers,
  };

  if (nodeReq.method !== "GET" && nodeReq.method !== "HEAD") {
    init.body = Readable.toWeb(nodeReq) as ReadableStream;
    init.duplex = "half";
  }

  return new Request(url, init);
}

async function sendWebResponse(
  nodeRes: ServerResponse,
  webRes: Response
): Promise<void> {
  nodeRes.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => nodeRes.setHeader(key, value));
  if (webRes.body) {
    // ReadableStream is async iterable in Node 18+ but TS DOM types lag behind
    for await (const chunk of webRes.body as unknown as AsyncIterable<Uint8Array>) {
      nodeRes.write(chunk);
    }
  }
  nodeRes.end();
}

// Vite handles static assets / HMR; Hono handles all SSR requests
httpServer.on("request", (req, res) => {
  vite.middlewares(req, res, async () => {
    try {
      const webReq = fromNodeRequest(req);
      const webRes = await app.fetch(webReq);
      await sendWebResponse(res, webRes);
    } catch (err) {
      console.error("[dev-server]", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end(String(err));
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`[dev-server] ➜  Local:   http://localhost:${PORT}/`);
});
