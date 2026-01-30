import { useForm } from "@tanstack/react-form";
import { APIError } from "better-auth";
import { XOctagon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { Button } from "~/components/ui/button";
import {
  Error,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";

import { PasswordInput } from "~/components/shared/forms/password-input/password-input";
import { authClient } from "~/lib/auth-client";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PasswordSchema,
} from "~/lib/schemas";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/reset-password.page";

const PAGE_TITLE = "Resetuj hasło | ACRM";

const ResetPasswordSchema = z.object({
  password: PasswordSchema,
  confirmPassword: z
    .string({ error: "Nieprawidłowe hasło" })
    .min(PASSWORD_MIN_LENGTH, { error: "Nieprawidłowe hasło" })
    .max(PASSWORD_MAX_LENGTH, {
      error: "Nieprawidłowe hasło",
    }),
});

export const meta: Route.MetaFunction = () => {
  return [{ title: PAGE_TITLE }];
};

export default function ResetujHaslo({ params }: Route.ComponentProps) {
  const { token } = params;
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: ResetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        async () => {
          const { error } = await authClient.resetPassword({
            newPassword: value.password,
            token: token,
          });

          if (error) {
            throw error;
          }
        },
        {
          loading: "Trwa resetowanie hasła...",
          error: (err) => {
            return err instanceof APIError
              ? {
                  message: "Wystąpił błąd podczas resetowania hasła.",
                  description: err.message,
                }
              : {
                  message:
                    "Wystąpił nieoczekiwany błąd podczas resetowania hasła.",
                  description: "Odśwież stronę i spróbuj ponownie.",
                };
          },
          success: () => {
            navigate(`/zaloguj-sie`);
            return "Hasło zostało zresetowane!";
          },
        }
      );
    },
  });

  const isLoading = form.state.isSubmitting;

  if (!token) {
    return (
      <Error>
        <ErrorMedia className="mb-4">
          <XOctagon className={cn("size-10 text-destructive")} />
        </ErrorMedia>

        <ErrorContent className="max-w-xl">
          <ErrorTitle className="text-2xl/tight font-semibold tracking-tight">
            Link resetowania hasła jest nieprawidłowy
          </ErrorTitle>
          <ErrorDescription className="text-base/7 mt-2">
            Link resetowania hasła jest nieprawidłowy. Spróbuj ponownie.
          </ErrorDescription>
        </ErrorContent>

        <Button variant="default" size="default" className="w-full">
          Powrót do strony logowania
        </Button>
      </Error>
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
              <h1 className="text-2xl font-bold">Resetuj hasło</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Wpisz nowe hasło.
              </p>
            </div>
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Hasło</FieldLabel>
                    <PasswordInput
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(value) => field.handleChange(value)}
                      aria-invalid={isInvalid}
                      placeholder="Wpisz nowe hasło"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Potwierdź hasło
                    </FieldLabel>
                    <Input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Wpisz ponownie hasło"
                      type="password"
                      autoComplete="new-password"
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
                Resetuj hasło
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
