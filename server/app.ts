import { Hono } from "hono";
import { isbot } from "isbot";
import { createRequestHandler } from "react-router";
import * as build from "virtual:react-router/server-build";

import { auth } from "~/lib/auth.server";
// 1. Import your existing server-side utilities
import { logger as baseLogger } from "~/lib/logger.server";
import type { Logger } from "~/lib/logger.server";
import type { ServerSession } from "~/lib/types";

type Env = {
  Variables: {
    logger: Logger;
    session: ServerSession | null;
  };
};

// 2. Define the types for your LoadContext so loaders stay type-safe

const app = new Hono<{ Variables: Env["Variables"] }>();

/**
 * LOGGING MIDDLEWARE (Hono Version)
 */
app.use("*", async (c, next) => {
  const requestId = c.req.header("x-request-id") || crypto.randomUUID();
  const url = new URL(c.req.url);

  const logger = baseLogger.child({
    requestId,
    method: c.req.method,
    path: url.pathname,
  });

  // Store the logger in Hono's context so it's accessible later
  c.set("logger", logger);

  logger.info("Request started");
  const start = performance.now();

  await next();

  const duration = Math.round(performance.now() - start);
  logger.info("Request completed", {
    status: c.res.status,
    duration,
  });
});

/**
 * SESSION MIDDLEWARE (Hono Version)
 */
app.use("*", async (c, next) => {
  c.set("session", null);
  const logger = c.get("logger");
  const userAgent = c.req.header("user-agent");
  const url = new URL(c.req.url);

  // Skip sessions for bots
  if (isbot(userAgent)) {
    logger.info("Skipping session creation: bot detected");
    return await next();
  }

  // Skip sessions for webhooks
  if (url.pathname.startsWith("/api/webhooks")) {
    logger.info("Skipping session creation: webhook route detected", {
      pathname: url.pathname,
    });
    return await next();
  }

  // better-auth / auth.server logic
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  c.set("session", session);
  await next();
});

/**
 * REACT ROUTER HANDLER
 */
const handler = createRequestHandler(build);

app.all("*", async (c) => {
  // We pass the data from Hono's context into React Router's context here
  return handler(c.req.raw, {
    logger: c.get("logger"),
    session: c.get("session"),
  });
});

export default app.fetch;
