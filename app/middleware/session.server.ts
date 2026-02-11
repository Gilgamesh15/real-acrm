import { isbot } from "isbot";
import { type MiddlewareFunction } from "react-router";

import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { auth } from "~/lib/auth.server";

export const sessionMiddleware: MiddlewareFunction = async (
  { request, context },
  next
) => {
  const logger = context.get(loggerContext);

  // Skip sessions for bots
  if (isbot(request.headers.get("user-agent"))) {
    logger.info("Skipping session creation: bot detected");
    return (await next()) as Response;
  }

  const url = new URL(request.url);

  // Skip sessions for webhooks
  if (url.pathname.startsWith("/api/webhooks")) {
    logger.info("Skipping session creation: webhook route detected", {
      pathname: url.pathname,
    });
    return (await next()) as Response;
  }

  let session = await auth.api.getSession({
    headers: request.headers,
  });

  context.set(sessionContext, session);

  return await next();
};
