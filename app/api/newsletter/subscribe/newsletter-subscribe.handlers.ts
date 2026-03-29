import * as newsletterService from "db/services/newsletter-subscribers.service";

import { db } from "~/lib/db";
import { resend } from "~/lib/resend";
import { stripe } from "~/lib/stripe";

import type { AnyoneResource } from "../../shared";
import {
  AppResponse,
  anyone,
  combineActions,
  createAction,
} from "../../shared";
import { newsletterContract } from "../newsletter.contract";
import type { Route } from "./+types/newsletter-subscribe.handlers";

export const action = combineActions({
  POST: createAction<
    Route.ActionArgs,
    AnyoneResource,
    typeof newsletterContract.subscribe.body
  >(
    newsletterContract.subscribe.body,
    anyone,
    async ({ args, logger, user }) => {
      const subscriber = await newsletterService.subscribeToNewsletter(
        { db, logger, user, emailClient: resend, stripe },
        args
      );

      return AppResponse.to({ subscriber }, { status: 201 });
    }
  ),
});
