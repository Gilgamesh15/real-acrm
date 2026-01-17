import type { MiddlewareFunction } from "react-router";

import { loggerContext } from "~/context/logger-context.server";
import { logger as baseLogger } from "~/lib/logger.server";

export const loggingMiddleware: MiddlewareFunction = async (
  { request, context },
  next
) => {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const url = new URL(request.url);

  const logger = baseLogger.child({
    requestId,
    method: request.method,
    path: url.pathname,
  });

  context.set(loggerContext, logger);

  logger.info("Request started");

  const start = performance.now();
  const response = (await next()) as Response;
  const duration = Math.round(performance.now() - start);

  logger.info("Request completed", {
    status: response.status,
    duration,
  });

  return response;
};
