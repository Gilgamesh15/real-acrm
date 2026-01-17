import { createContext } from "react-router";

import type { Logger } from "~/lib/logger.server";

export const loggerContext = createContext<Logger>();
