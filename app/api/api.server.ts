import { type ApiFetcherArgs, initClient, tsRestFetchApi } from "@ts-rest/core";
import { data } from "react-router";
import superjson, { type SuperJSONResult } from "superjson";

import { rootContract } from "./root-contract-legacy";

export const api = initClient(rootContract, {
  baseUrl: `${process.env.VITE_APP_URL}/api`,
  credentials: "include",
  throwOnUnknownStatus: true,
  api: async (args: ApiFetcherArgs) => {
    const result = await tsRestFetchApi(args);

    if (result.status >= 400) {
      throw data(result.body, {
        status: result.status,
        headers: result.headers,
      });
    }

    return {
      status: result.status,
      body: superjson.deserialize(result.body as SuperJSONResult),
      headers: result.headers,
    };
  },
  validateResponse: false,
});
