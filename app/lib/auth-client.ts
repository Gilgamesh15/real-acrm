import { stripeClient } from "@better-auth/stripe/client";
import type { BetterAuthClientPlugin } from "better-auth";
import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  anonymousClient,
  customSessionClient,
} from "better-auth/client/plugins";

import { betterAuthLocalizationClientPlugin } from "~/lib/better-auth-localization/src/client";

import type { Auth } from "./auth.server";

export const authClient = createAuthClient({
  plugins: [
    anonymousClient(),
    stripeClient() as unknown as BetterAuthClientPlugin,
    adminClient(),
    customSessionClient<Auth>(),
    betterAuthLocalizationClientPlugin(),
  ],
});

export type AuthClient = typeof authClient;
