import type { DBUser } from "db/schema";

import type { DbClient } from "~/lib/db";
import type { Logger } from "~/lib/logger.server";

type BaseAppState = {
  db: DbClient;
  logger: Logger;
};

export type UnauthenticatedAppState = BaseAppState & {
  user?: DBUser;
};

export type AuthenticatedAppState = BaseAppState & {
  user: DBUser;
};

export type AdminAppState = BaseAppState & {
  user: DBUser;
};
