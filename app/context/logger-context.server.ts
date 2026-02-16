import { createContext } from "react-router";

import type { Logger } from "~/lib/logger.server";

export type LoggerContext = Logger;

export const loggerContext = createContext<LoggerContext>();
