import type { ConsentRecord } from "components/cookie-consent";
import * as schema from "db/schema";
import { data } from "react-router";

import { loggerContext } from "~/context/logger-context.server";
import { db } from "~/lib/db";

import type { Route } from "./+types/google-consent-traceability";

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);

  const record = (await request.json()) as ConsentRecord;
  logger.info("Google consent traceability record", { record });

  try {
    await db.insert(schema.consentRecords).values({
      visitorId: record.visitorId,
      consentId: record.consentId,
      categories: record.categories,
      timestamp: new Date(record.timestamp),
    });

    return data({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Failed to insert consent record", { error });
    return data(
      { success: false, error: "Failed to insert consent record" },
      { status: 500 }
    );
  }
}
