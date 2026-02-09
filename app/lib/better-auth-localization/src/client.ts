import type { BetterAuthClientPlugin } from "better-auth/client";

import type { BetterAuthLocalizationPlugin } from "./index.server";

export const betterAuthLocalizationClientPlugin =
  (): BetterAuthClientPlugin => {
    return {
      id: "localization",
      $InferServerPlugin: {} as ReturnType<BetterAuthLocalizationPlugin>,
    } satisfies BetterAuthClientPlugin;
  };
