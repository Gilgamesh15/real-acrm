import * as sizesService from "db/services/sizes.service";

import { db } from "~/lib/db";

import {
  type AdminResource,
  type AnyoneResource,
  AppResponse,
  adminOnly,
  anyone,
  combineActions,
  createAction,
  createLoader,
} from "../shared";
import type { Route } from "./+types/sizes.handlers";
import { sizesContract } from "./sizes.contract";

export const loader = createLoader<
  Route.LoaderArgs,
  AnyoneResource,
  typeof sizesContract.get.query
>(sizesContract.get.query, anyone, async ({ args, logger, user }) => {
  const sizes = await sizesService.getSizes({ db, logger, user }, args);

  return AppResponse.to(
    { sizes },
    {
      headers: {
        ...(args.cache
          ? { "Cache-Control": `public, max-age=${args.cache}` }
          : {}),
      },
      status: 200,
    }
  );
});

export const action = combineActions({
  POST: createAction<
    Route.ActionArgs,
    AdminResource,
    typeof sizesContract.create.body
  >(sizesContract.create.body, adminOnly, async ({ args, logger, user }) => {
    const size = await sizesService.createSize({ db, logger, user }, args);

    return AppResponse.to({ size }, { status: 201 });
  }),
});
