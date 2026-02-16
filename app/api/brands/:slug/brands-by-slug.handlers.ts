import * as brandsService from "db/services/brands.service";

import { db } from "~/lib/db";

import { brandsContract } from "../../brands/brands.contract";
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
import type { Route } from "./+types/brands-by-slug.handlers";

export const loader = createLoader<
  Route.LoaderArgs,
  AnyoneResource,
  typeof brandsContract.bySlug.get.query
>(
  brandsContract.bySlug.get.query,
  anyone,
  async ({ args, logger, user, params }) => {
    const { slug } = params;
    const brand = await brandsService.getBrandBySlug(
      { db, logger, user },
      slug
    );

    return AppResponse.to(
      { brand },
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
    typeof brandsContract.bySlug.update.body
  >(
    brandsContract.bySlug.update.body,
    adminOnly,
    async ({ args, logger, params, user }) => {
      const { slug } = params;
      const brand = await brandsService.updateBrand(
        { db, logger, user },
        slug,
        args
      );

      return AppResponse.to({ brand }, { status: 200 });
    }
  ),
  DELETE: createAction<Route.ActionArgs, AdminResource>(
    undefined,
    adminOnly,
    async ({ user, logger, params }) => {
      const { slug } = params;
      const brand = await brandsService.deleteBrand({ db, logger, user }, slug);

      return AppResponse.to({ brand }, { status: 200 });
    }
  ),
});
