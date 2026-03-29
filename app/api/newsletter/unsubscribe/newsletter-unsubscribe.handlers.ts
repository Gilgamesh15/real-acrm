import * as newsletterService from "db/services/newsletter-subscribers.service";

import { db } from "~/lib/db";

import type { AnyoneResource } from "../../shared";
import {
  AppResponse,
  anyone,
  combineActions,
  createAction,
} from "../../shared";
import { newsletterContract } from "../newsletter.contract";
import type { Route } from "./+types/newsletter-unsubscribe.handlers";

export const action = combineActions({
  POST: createAction<
    Route.ActionArgs,
    AnyoneResource,
    typeof newsletterContract.unsubscribe.body
  >(
    newsletterContract.unsubscribe.body,
    anyone,
    async ({ args, logger, user }) => {
      const subscriber = await newsletterService.unsubscribeFromNewsletter(
        { db, logger, user },
        args
      );

      return AppResponse.to({ subscriber }, { status: 200 });
    }
  ),
});
