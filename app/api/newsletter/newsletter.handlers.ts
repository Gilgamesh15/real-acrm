import * as newsletterService from "db/services/newsletter-subscribers.service";

import { db } from "~/lib/db";

import type { AdminResource } from "../shared";
import { AppResponse, adminOnly, createLoader } from "../shared";
import type { Route } from "./+types/newsletter.handlers";
import { newsletterContract } from "./newsletter.contract";

export const loader = createLoader<
  Route.LoaderArgs,
  AdminResource,
  typeof newsletterContract.get.query
>(newsletterContract.get.query, adminOnly, async ({ args, logger, user }) => {
  const subscribers = await newsletterService.getNewsletterSubscribers(
    { db, logger, user },
    args
  );

  return AppResponse.to(
    { subscribers },
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
