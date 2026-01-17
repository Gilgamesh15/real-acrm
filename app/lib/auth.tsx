import { stripe as stripePlugin } from "@better-auth/stripe";
import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { localization } from "better-auth-localization";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous, customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import * as schema from "~/../db/schema";
import ResetPasswordEmail from "~/components/emails/reset-password-email";
import VerifyEmailEmail from "~/components/emails/verify-email-email";
import { db } from "~/lib/db";

import { resend } from "./resend";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./schemas";
import { stripe as stripeClient } from "./stripe";

export const auth = betterAuth({
  secret: process.env["BETTER_AUTH_SECRET"]!,
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      defaultLockerName: {
        type: "string",
        required: false,
        input: false,
      },
      acceptedTerms: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      acceptedMarketing: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      acceptedPrivacy: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      firstName: {
        type: "string",
        required: false,
        input: true,
      },
      lastName: {
        type: "string",
        required: false,
        input: true,
      },
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env["GOOGLE_CLIENT_ID"]!,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
    },
    facebook: {
      prompt: "select_account",
      clientId: process.env["FACEBOOK_CLIENT_ID"]!,
      clientSecret: process.env["FACEBOOK_CLIENT_SECRET"]!,
    },
  },
  trustedOrigins: [
    process.env["VITE_APP_URL"]!,
    "http://localhost:5173",
  ].filter(Boolean),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    sendResetPassword: async ({ user, token }) => {
      void resend.emails.send({
        to: user.email,
        from: process.env["FROM_EMAIL"]!,
        subject: "ACRM - Resetuj hasło",
        react: (
          <ResetPasswordEmail
            resetUrl={`${process.env["VITE_APP_URL"]}/resetuj-haslo/${token}`}
          />
        ),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      void resend.emails.send({
        to: user.email,
        from: process.env["FROM_EMAIL"]!,
        subject: "ACRM - Potwierdź swój adres email",
        react: (
          <VerifyEmailEmail
            verifyUrl={`${process.env["VITE_APP_URL"]}/potwierdz-email?token=${token}&email=${user.email}`}
          />
        ),
      });
    },
  },
  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        await db.transaction(async (tx) => {
          await tx
            .update(schema.orders)
            .set({
              userId: newUser.user.id,
            })
            .where(eq(schema.orders.userId, anonymousUser.user.id));

          await tx
            .update(schema.pieces)
            .set({
              reservedByUserId: newUser.user.id,
            })
            .where(eq(schema.pieces.reservedByUserId, anonymousUser.user.id));
        });
      },
    }),
    localization({
      defaultLocale: "pl-PL",
      fallbackLocale: "pl-PL",
    }),
    admin(),
    stripePlugin({
      stripeClient,
      stripeWebhookSecret: process.env["STRIPE_WEBHOOK_SECRET"]!,
      createCustomerOnSignUp: true,
    }) as unknown as BetterAuthPlugin,
    customSession(async ({ user, session }) => {
      const typedUser = user as typeof schema.users.$inferSelect;
      return {
        user: typedUser,
        session,
      };
    }),
  ],
});

export type Auth = typeof auth;
