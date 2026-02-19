import type { ApiFetcherArgs } from "@ts-rest/core";
import { initClient, tsRestFetchApi } from "@ts-rest/core";
import type { SuperJSONResult } from "superjson";
import superjson from "superjson";

import { rootContract } from "./root-contract";

export const api = initClient(rootContract, {
  baseUrl: `${import.meta.env.VITE_APP_URL}/api`,
  baseHeaders: {},
  throwOnUnknownStatus: true,
  api: async (args: ApiFetcherArgs) => {
    const result = await tsRestFetchApi(args);

    return {
      status: result.status,
      body: superjson.deserialize(result.body as SuperJSONResult),
      headers: result.headers,
    };
  },
  validateResponse: false,
});
