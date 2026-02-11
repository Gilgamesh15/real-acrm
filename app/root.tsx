import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Analytics } from "@vercel/analytics/react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRevalidator,
} from "react-router";
import type { MiddlewareFunction } from "react-router";

import { GoogleConsentMode } from "~/components/features/cookie-consent";
import { CookieBanner } from "~/components/features/cookie-consent/cookie-banner";
import { CookieConsentProvider } from "~/components/features/cookie-consent/cookie-provider";
import { CookieSettings } from "~/components/features/cookie-consent/cookie-settings";
import { CookieTrigger } from "~/components/features/cookie-consent/cookie-trigger";

import type { Route } from "./+types/root";
import "./app.css";
import { Button } from "./components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./components/ui/empty";
import { Toaster } from "./components/ui/sonner";
import { SpecialText } from "./components/ui/special-text";
import { sessionContext } from "./context/session-context.server";
import { loggingMiddleware } from "./middleware/logging.server";
import { sessionMiddleware } from "./middleware/session.server";

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

const queryClient = new QueryClient();

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  return {
    session,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="dark">
      <head>
        {/* meta */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="format-detection" content="telephone=no" />
        {import.meta.env.VITE_GOOGLE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={import.meta.env.VITE_GOOGLE_VERIFICATION}
          />
        )}
        <meta name="og:locale" content="pl_PL" />
        <meta name="og:site_name" content="ACRM | Fashion Projects" />
        <Meta />

        {/* links */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link
          rel="preload"
          href="/fonts/tektur.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/poiret-one.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <Links />

        {/* google analytics */}
        <GoogleConsentMode />

        {import.meta.env.VITE_GOOGLE_ANALYTICS_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GOOGLE_ANALYTICS_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', '${import.meta.env.VITE_GOOGLE_ANALYTICS_ID}');
                `,
              }}
            />
          </>
        )}
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
                  retryOnFailure: true,
                  maxRetries: 3,
                },
                googleConsentMode: {
                  enabled: true,
                },
              }}
            >
              <div className="min-h-svh max-w-screen overflow-x-hidden flex flex-col">
                {children}
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
  const revalidator = useRevalidator();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          <SpecialText>
            {isRouteErrorResponse(error) ? error.status : "500"}
          </SpecialText>
        </EmptyMedia>
        <EmptyTitle className="text-2xl font-bold">Wystąpił błąd</EmptyTitle>
        {isRouteErrorResponse(error) && (
          <EmptyDescription className="text-sm text-muted-foreground">
            {error.statusText}
          </EmptyDescription>
        )}
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={revalidator.revalidate} variant="default" size="lg">
          Odśwież stronę
        </Button>
      </EmptyContent>
    </Empty>
  );
}
