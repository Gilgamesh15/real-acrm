import * as newsletterService from "db/services/newsletter-subscribers.service";

import {
  type AnyoneResource,
  AppResponse,
  anyone,
  createLoader,
} from "~/api/shared";
import { db } from "~/lib/db";

import { newsletterContract } from "../newsletter.contract";
import type { Route } from "./+types/newsletter-by-email.handlers";

export const loader = createLoader<
  Route.LoaderArgs,
  AnyoneResource,
  typeof newsletterContract.byEmail.get.query
>(
  newsletterContract.byEmail.get.query,
  anyone,
  async ({ args, logger, user, params }) => {
    const { email } = params;
    const subscriber = await newsletterService.getNewsletterSubscriberByEmail(
      { db, logger, user },
      email
    );

    return AppResponse.to(
      { subscriber },
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
