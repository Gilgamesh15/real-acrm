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
} from "../../shared";
import { sizesContract } from "../../sizes/sizes.contract";
import type { Route } from "./+types/sizes-by-slug.handlers";

export const loader = createLoader<
  Route.LoaderArgs,
  AnyoneResource,
  typeof sizesContract.bySlug.get.query
>(
  sizesContract.bySlug.get.query,
  anyone,
  async ({ args, logger, user, params }) => {
    const { slug } = params;
    const size = await sizesService.getSizeBySlug({ db, logger, user }, slug);

    return AppResponse.to(
      { size },
      {
        headers: {
          ...(args.cache
            ? { "Cache-Control": `public, max-age=${args.cache}` }
            : {}),
        },
        status: 200,
      }
    );
  }
);

export const action = combineActions({
  PUT: createAction<
    Route.ActionArgs,
    AdminResource,
    typeof sizesContract.bySlug.update.body
  >(
    sizesContract.bySlug.update.body,
    adminOnly,
    async ({ args, logger, params, user }) => {
      const { slug } = params;
      const size = await sizesService.updateSize(
        { db, logger, user },
        slug,
        args
      );

      return AppResponse.to({ size }, { status: 200 });
    }
  ),
  DELETE: createAction<Route.ActionArgs, AdminResource>(
    undefined,
    adminOnly,
    async ({ user, logger, params }) => {
      const { slug } = params;
      const size = await sizesService.deleteSize({ db, logger, user }, slug);

      return AppResponse.to({ size }, { status: 200 });
    }
  ),
});
