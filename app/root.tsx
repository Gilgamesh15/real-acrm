import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Analytics } from "@vercel/analytics/react";
import { GoogleConsentMode } from "components/cookie-consent";
import { CookieBanner } from "components/cookie-consent/cookie-banner";
import { CookieConsentProvider } from "components/cookie-consent/cookie-provider";
import { CookieSettings } from "components/cookie-consent/cookie-settings";
import { CookieTrigger } from "components/cookie-consent/cookie-trigger";
import { AlertCircleIcon } from "lucide-react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import type { MiddlewareFunction } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import {
  Error,
  ErrorCode,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "./components/ui/error";
import { Toaster } from "./components/ui/sonner";
import { loggingMiddleware } from "./middleware/logging.server";
import { sessionMiddleware } from "./middleware/session.server";

const GOOGLE_VERIFICATION = import.meta.env.VITE_GOOGLE_VERIFICATION;

export const meta: Route.MetaFunction = () => [
  { title: "ACRM | Fashion Projects" },
  { name: "description", content: "Sklep z projektami mody z second-handu." },
  { property: "og:site_name", content: "ACRM | Fashion Projects" },
  { property: "og:locale", content: "pl_PL" },
  { name: "twitter:card", content: "summary_large_image" },
];

export const middleware: MiddlewareFunction[] = [
  loggingMiddleware,
  sessionMiddleware,
];

// ========================== ACTIONS ==========================

const queryClient = new QueryClient();

export function links() {
  return [
    // Preconnect to Cloudinary for faster LCP image loading
    { rel: "preconnect", href: "https://res.cloudinary.com" },
    { rel: "dns-prefetch", href: "https://res.cloudinary.com" },
    {
      rel: "preload",
      href: "/fonts/tektur.woff2",
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    },
    {
      rel: "preload",
      href: "/fonts/poiret-one.woff2",
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    },
    {
      rel: "preload",
      href: "/fonts/inter.woff2",
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
  ];
}

export function Layout() {
  return (
    <html lang="pl" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="format-detection" content="telephone=no" />
        {GOOGLE_VERIFICATION && (
          <meta name="google-site-verification" content={GOOGLE_VERIFICATION} />
        )}
        <meta name="og:locale" content="pl_PL" />
        <meta name="og:site_name" content="ACRM | Fashion Projects" />

        <GoogleConsentMode />

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-L5Z39N51Z1"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-L5Z39N51Z1');
            `,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        <NuqsAdapter
          processUrlSearchParams={(search) => {
            const entries = new URLSearchParams();

            // sort
            Array.from(search.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .forEach(([key, value]) => {
                entries.set(key, value);
              });

            return entries;
          }}
        >
          <QueryClientProvider client={queryClient}>
            <CookieConsentProvider
              config={{
                consentVersion: "1.0.0",
                privacyPolicyUrl: "/polityka-prywatnosci",
                traceability: {
                  enabled: true,
                  endpoint: "/api/google-consent-traceability",
                  method: "POST",
                  //  headers?: Record<string, string>
                  // getVisitorId?: () => string | Promise<string>
                  //includeUserAgent?: boolean
                  retryOnFailure: true,
                  maxRetries: 3,
                  //  onSuccess?: (record: ConsentRecord) => void
                  //  onError?: (error: Error, record: ConsentRecord) => void
                },
                googleConsentMode: {
                  enabled: true,
                },
              }}
            >
              <div className="min-h-svh max-w-screen overflow-x-hidden flex flex-col">
                <Outlet />
              </div>
              <CookieBanner />
              <CookieSettings />
              <CookieTrigger />
            </CookieConsentProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </NuqsAdapter>

        <Toaster richColors />
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <Error>
        <ErrorMedia>
          <AlertCircleIcon />
        </ErrorMedia>
        <ErrorContent>
          <ErrorTitle>Error</ErrorTitle>
          <ErrorDescription>{JSON.stringify(error.data)}</ErrorDescription>
        </ErrorContent>
        <ErrorCode>{error.status}</ErrorCode>
      </Error>
    );
  }

  return (
    <Error>
      <ErrorMedia>
        <AlertCircleIcon />
      </ErrorMedia>
      <ErrorContent>
        <ErrorTitle>Wystąpił błąd</ErrorTitle>
        <ErrorDescription>Spróbuj ponownie później.</ErrorDescription>
      </ErrorContent>
      <ErrorCode>500</ErrorCode>
    </Error>
  );
}
