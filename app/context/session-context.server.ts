import { createContext } from "react-router";

import type { ServerSession } from "~/lib/types";

export const sessionContext = createContext<ServerSession>();
