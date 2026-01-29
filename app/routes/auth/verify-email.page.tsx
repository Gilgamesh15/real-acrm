import { CheckCircle, Send, XOctagon } from "lucide-react";
import React from "react";
import {
  Link,
  type LoaderFunctionArgs,
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
  useSearchParams,
} from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { buttonVariants } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Error,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";

import { useCountdown } from "~/hooks/use-countdown";
import { auth } from "~/lib/auth";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/verify-email.page";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const token = new URL(request.url).searchParams.get("token") || undefined;

  if (!token) {
    return;
  }

  await auth.api.verifyEmail({
    query: {
      token,
    },
  });
};

const COUNTDOWN_DURATION = 60;
const PAGE_TITLE = "Potwierdź email | ACRM";
// this will either be pending or success it will not be error ever also meaning that token is irrelevant here
export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? undefined;
  // if has token then its valid and we show success state otherwise an error must have occured or no token was provided
  const hasToken = searchParams.get("token") === null ? false : true;

  const [countdown, { startCountdown }] = useCountdown({
    countStart: COUNTDOWN_DURATION,
  });
  const [redirectCountdown, { startCountdown: startRedirectCountdown }] =
    useCountdown({
      countStart: 5,
    });

  const handleResend = () => {
    if (!email) return;
    if (countdown > 0) {
      toast.warning(
        `Poczekaj ${countdown} sekund przed ponownym wysłaniem linku.`
      );
      return;
    }

    toast.promise(
      async () => {
        const { error } = await authClient.sendVerificationEmail({
          email: email,
        });

        if (error) {
          throw error;
        }
      },
      {
        loading: "Trwa wysyłanie linku aktywacyjnego...",
        success: () => {
          startCountdown();
          return "Link aktywacyjny został wysłany!";
        },
        error: (err) => {
          return err instanceof Error
            ? {
                message: "Wystąpił błąd podczas wysyłania linku aktywacyjnego.",
                description: (err as Error).message,
              }
            : {
                message:
                  "Wystąpił nieoczekiwany błąd podczas wysyłania linku aktywacyjnego.",
                description: "Odśwież stronę i spróbuj ponownie.",
              };
        },
      }
    );
  };

  React.useEffect(() => {
    if (hasToken) {
      startRedirectCountdown();
    }
  }, [hasToken, startRedirectCountdown]);

  React.useEffect(() => {
    if (hasToken && redirectCountdown === 0) {
      navigate("/zaloguj-sie");
    }
  }, [hasToken, redirectCountdown, navigate]);

  React.useEffect(() => {
    window.gtag?.("event", "page_view", {
      page_title: PAGE_TITLE,
      page_location: window.location.href,
    });
  }, []);

  if (hasToken) {
    return (
      <Empty>
        <EmptyMedia variant="icon" className="mb-4">
          <CheckCircle className="size-10 text-success-foreground" />
        </EmptyMedia>

        <EmptyHeader className="max-w-xl">
          <EmptyTitle className="text-2xl/tight font-semibold tracking-tight">
            Twój adres email jest zweryfikowany!
          </EmptyTitle>
          <EmptyDescription className="text-base/7 mt-2">
            Możesz teraz przejść do logowania.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="mt-8">
          <Button variant="default" size="default" className="w-full">
            Zaloguj się
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty>
      <EmptyMedia variant="icon" className="mb-4">
        <Send className="size-10 text-info-foreground" />
      </EmptyMedia>

      <EmptyHeader className="max-w-xl">
        <EmptyTitle className="text-2xl/tight font-semibold tracking-tight">
          Sprawdź swój adres email
        </EmptyTitle>
        <EmptyDescription className="text-base/7 mt-4">
          Wysłaliśmy link aktywacyjny na adres:
          <br />
          <span className="font-medium text-info-foreground mt-1 block">
            {email}
          </span>
          <span className="text-sm text-muted-foreground mt-2 block">
            Sprawdź również folder <strong>Spam</strong>, jeśli nie widzisz
            wiadomości
          </span>
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent className="mt-8">
        <Button
          variant="outline"
          size="default"
          className="w-full"
          onClick={handleResend}
        >
          Wyślij ponownie
        </Button>
      </EmptyContent>

      <Link
        to="/zarejestruj-sie"
        className={cn(
          buttonVariants({
            variant: "link",
            size: "sm",
            className: "text-muted-foreground",
          })
        )}
      >
        Podaj inny adres email
      </Link>
    </Empty>
  );
}

export function ErrorBoundary() {
  const navigate = useNavigate();
  const error = useRouteError();

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? undefined;

  const [countdown, { startCountdown }] = useCountdown({
    countStart: COUNTDOWN_DURATION,
  });

  const handleResend = () => {
    if (!email) return;
    if (countdown > 0) {
      toast.warning(
        `Poczekaj ${countdown} sekund przed ponownym wysłaniem linku.`
      );
      return;
    }

    toast.promise(
      async () => {
        const { error } = await authClient.sendVerificationEmail({
          email: email,
        });

        if (error) {
          throw error;
        }
      },
      {
        loading: "Trwa wysyłanie linku aktywacyjnego...",
        success: () => {
          startCountdown();

          return "Link aktywacyjny został wysłany!";
        },
        error: (err) => {
          return err instanceof Error
            ? {
                message: "Wystąpił błąd podczas wysyłania linku aktywacyjnego.",
                description: (err as Error).message,
              }
            : {
                message:
                  "Wystąpił nieoczekiwany błąd podczas wysyłania linku aktywacyjnego.",
                description: "Odśwież stronę i spróbuj ponownie.",
              };
        },
      }
    );
  };

  const handleRefresh = () => {
    navigate(0);
  };

  const handleSignOut = () => {
    authClient.signOut();
    navigate("/zarejestruj-sie");
  };

  if (isRouteErrorResponse(error) && error instanceof Error) {
    const errorType = (error as Error).body?.code as
      | "TOKEN_EXPIRED"
      | "INVALID_TOKEN"
      | "USER_NOT_FOUND"
      | "INVALID_USER"
      | "FAILED_TO_CREATE_SESSION";

    const title = error.body?.message ?? "Coś poszło nie tak";
    const description = {
      TOKEN_EXPIRED:
        "Link weryfikacyjny jest ważny przez 24 godziny. Wyślij nowy link, aby dokończyć weryfikację.",
      INVALID_TOKEN: "Link weryfikacyjny jest nieprawidłowy. Spróbuj ponownie.",
      USER_NOT_FOUND: "Nie możemy zweryfować adresu. Spróbuj ponownie.",
      INVALID_USER: "Nie możemy zweryfować adresu. Spróbuj ponownie.",
      FAILED_TO_CREATE_SESSION:
        "Nie możemy zweryfować adresu. Spróbuj ponownie.",
    }[errorType];

    const primaryAction = {
      TOKEN_EXPIRED: email ? handleResend : undefined,
      INVALID_TOKEN: email ? handleResend : undefined,
      USER_NOT_FOUND: () => navigate("/zarejestruj-sie"),
      INVALID_USER: handleSignOut,
      FAILED_TO_CREATE_SESSION: handleRefresh,
    }[errorType];

    const primaryActionText = {
      TOKEN_EXPIRED: "Wyślij ponownie",
      INVALID_TOKEN: "Wyślij ponownie",
      USER_NOT_FOUND: "Zarejestruj się",
      INVALID_USER: "Wyloguj się",
      FAILED_TO_CREATE_SESSION: "Odśwież stronę",
    }[errorType];

    const secondaryAction = {
      TOKEN_EXPIRED: () => navigate("/zarejestruj-sie"),
      INVALID_TOKEN: () => navigate("/zarejestruj-sie"),
      USER_NOT_FOUND: undefined,
      INVALID_USER: undefined,
      FAILED_TO_CREATE_SESSION: undefined,
    }[errorType];

    const secondaryActionText = {
      TOKEN_EXPIRED: "Zarejestruj się",
      INVALID_TOKEN: "Zarejestruj się",
      USER_NOT_FOUND: undefined,
      INVALID_USER: undefined,
      FAILED_TO_CREATE_SESSION: undefined,
    }[errorType];

    return (
      <Error>
        <ErrorMedia className="mb-4">
          <XOctagon
            className={cn(
              "size-10 text-destructive",
              (errorType === "TOKEN_EXPIRED" ||
                errorType === "INVALID_TOKEN") &&
                "text-warning-foreground"
            )}
          />
        </ErrorMedia>

        <ErrorContent className="max-w-xl">
          <ErrorTitle className="text-2xl/tight font-semibold tracking-tight">
            {title}
          </ErrorTitle>
          <ErrorDescription className="text-base/7 mt-2">
            {description}
          </ErrorDescription>
        </ErrorContent>

        <Button
          variant="outline"
          size="default"
          className="w-full"
          onClick={primaryAction}
        >
          {primaryActionText}
        </Button>

        <Link
          to="/zarejestruj-sie"
          className={cn(
            buttonVariants({
              variant: "link",
              size: "sm",
              className: "text-muted-foreground",
            })
          )}
        >
          {secondaryActionText}
        </Link>
      </Error>
    );
  }

  return null;
}
