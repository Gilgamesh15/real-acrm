import { useForm } from "@tanstack/react-form";
import { Send } from "lucide-react";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { Button, buttonVariants } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";

import { useCountdown } from "~/hooks/use-countdown";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/forgot-password.page";

const COUNTDOWN_DURATION = 60;
const PAGE_TITLE = "Zapomniałeś hasła? | ACRM";
const ForgotPasswordSchema = z.object({
  email: z.email({ error: "Nieprawidłowy format email" }),
});

export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

export default function ZapomnialesHasla() {
  const [countdown, { startCountdown }] = useCountdown({
    countStart: COUNTDOWN_DURATION,
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: ForgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        async () => {
          const { data, error } = await authClient.requestPasswordReset({
            email: value.email,
          });

          if (error) {
            throw error;
          }

          return data.message;
        },
        {
          loading: "Trwa wysyłanie linku resetowania hasła...",
          error: (err) => {
            return err instanceof Error
              ? {
                  message:
                    "Wystąpił błąd podczas wysyłania linku resetowania hasła.",
                  description: err.message,
                }
              : {
                  message:
                    "Wystąpił nieoczekiwany błąd podczas wysyłania linku resetowania hasła.",
                  description: "Odśwież stronę i spróbuj ponownie.",
                };
          },
          success: (res) => {
            return res;
          },
        }
      );
    },
  });

  const handleResend = () => {
    if (!form.state.values.email) return;
    if (countdown > 0) {
      toast.warning(
        `Poczekaj ${countdown} sekund przed ponownym wysłaniem linku.`
      );
      return;
    }

    toast.promise(
      async () => {
        const { data, error } = await authClient.requestPasswordReset({
          email: form.state.values.email,
        });

        if (error) {
          throw error;
        }
        return data.message;
      },
      {
        loading: "Trwa wysyłanie linku resetowania hasła...",
        success: (res) => {
          startCountdown();
          return res;
        },
        error: (err) => {
          return err instanceof Error
            ? {
                message:
                  "Wystąpił błąd podczas wysyłania linku resetowania hasła.",
                description: err.message,
              }
            : {
                message:
                  "Wystąpił nieoczekiwany błąd podczas wysyłania linku resetowania hasła.",
                description: "Odśwież stronę i spróbuj ponownie.",
              };
        },
      }
    );
  };

  const isLoading = form.state.isSubmitting;
  const isSuccess = form.state.isSubmitSuccessful;

  if (isSuccess) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Send />
        </EmptyMedia>

        <EmptyHeader>
          <EmptyTitle>Sprawdź swój adres email</EmptyTitle>
          <EmptyDescription>
            {form.state.values.email ? (
              <>
                Wysłaliśmy link resetowania hasła na adres:
                <br />
                <span className="font-medium text-info-foreground mt-1 block">
                  {form.state.values.email}
                </span>
              </>
            ) : (
              "Wysłaliśmy link resetowania hasła na podany adres email."
            )}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Button
            variant="outline"
            className="w-full max-w-xs"
            onClick={handleResend}
            disabled={countdown > 0}
          >
            Wyślij ponownie
            <ArrowRightIcon />
          </Button>
        </EmptyContent>

        <Link
          to="/zapomniales-hasla"
          className={cn(
            buttonVariants({
              variant: "link",
              size: "sm",
              className: "text-muted-foreground size-fit p-0 m-0 inline",
            })
          )}
        >
          Powrót do strony logowania
        </Link>
      </Empty>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className={cn("flex flex-col gap-6")}
        >
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Zapomniałeś hasła?</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Wpisz swój email, aby otrzymać link resetowania hasła.
              </p>
            </div>
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="jan.kowalski@gmail.com"
                      type="email"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <Field>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner />}
                Wyślij link resetowania hasła
              </Button>
            </Field>
            <Field>
              <FieldDescription className="px-6 text-center">
                Pamiętasz hasło? <Link to="/zaloguj-sie">Zaloguj się</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
