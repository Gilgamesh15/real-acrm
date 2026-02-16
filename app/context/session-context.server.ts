import { createContext } from "react-router";

import type { ServerSession } from "~/lib/types";

export type SessionContext = ServerSession | null;

export const sessionContext = createContext<SessionContext>(null);
