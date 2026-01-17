import { stripeClient } from "@better-auth/stripe/client";
import type { BetterAuthClientPlugin } from "better-auth";
import { betterAuthLocalizationClientPlugin } from "better-auth-localization";
import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  anonymousClient,
  customSessionClient,
} from "better-auth/client/plugins";

import type { Auth } from "./auth";

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
