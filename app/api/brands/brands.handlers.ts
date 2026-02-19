import * as brandsService from "db/services/brands.service";

import { db } from "~/lib/db";

import type { AdminResource, AnyoneResource } from "../shared";
import {
  AppResponse,
  adminOnly,
  anyone,
  combineActions,
  createAction,
  createLoader,
} from "../shared";
import type { Route } from "./+types/brands.handlers";
import { brandsContract } from "./brands.contract";

export const loader = createLoader<
  Route.LoaderArgs,
  AnyoneResource,
  typeof brandsContract.get.query
>(brandsContract.get.query, anyone, async ({ args, logger, user }) => {
  const brands = await brandsService.getBrands({ db, logger, user }, args);

  return AppResponse.to(
    { brands },
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
    typeof brandsContract.create.body
  >(brandsContract.create.body, adminOnly, async ({ args, logger, user }) => {
    const brand = await brandsService.createBrand({ db, logger, user }, args);

    return AppResponse.to({ brand }, { status: 201 });
  }),
});
