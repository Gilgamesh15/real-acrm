import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";

import { PasswordInput } from "~/components/shared/forms/password-input/password-input";
import { authClient } from "~/lib/auth-client";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "~/lib/schemas";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/login.page";
import GoogleIcon from "/google.svg";
import MetaIcon from "/meta.svg";

const PAGE_TITLE = "Zaloguj się | ACRM";

const LoginSchema = z.object({
  email: z.email({ error: "Nieprawidłowy format email" }),
  password: z
    .string({ error: "Nieprawidłowe hasło" })
    .min(PASSWORD_MIN_LENGTH, { error: "Nieprawidłowe hasło" })
    .max(PASSWORD_MAX_LENGTH, {
      error: "Nieprawidłowe hasło",
    }),
  rememberMe: z.boolean(),
});

export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

export default function LoginPage() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onSubmit: LoginSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      toast.promise(
        async () => {
          const { data, error } = await authClient.signIn.email({
            email: value.email,
            password: value.password,
            rememberMe: value.rememberMe,
          });

          if (error) {
            throw new Error(error.message);
          }

          return data.user;
        },
        {
          loading: "Trwa logowanie...",
          error: (err) => {
            formApi.setFieldValue("password", "");
            return err instanceof Error
              ? {
                  message: "Wystąpił błąd podczas logowania.",
                  description: err.message,
                }
              : {
                  message: "Wystąpił nieoczekiwany błąd podczas logowania.",
                  description: "Odśwież stronę i spróbuj ponownie.",
                };
          },
          success: () => {
            // Track login event
            window.gtag?.("event", "login", {
              method: "email",
            });
            navigate("/");
            return "Pomyślnie zalogowano!";
          },
        }
      );
    },
  });

  const isLoading = form.state.isSubmitting;

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
      });
      if (error) {
        throw new Error(error.message);
      }
      // Track login event for Google
      window.gtag?.("event", "login", {
        method: "google",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "Wystąpił nieoczekiwany błąd podczas logowania przez Google."
        );
      }
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const { error } = await authClient.signIn.social({
        provider: "facebook",
      });
      if (error) {
        throw new Error(error.message);
      }
      // Track login event for Facebook
      window.gtag?.("event", "login", {
        method: "facebook",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "Wystąpił nieoczekiwany błąd podczas logowania przez Facebook."
        );
      }
    }
  };

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
              <h1 className="text-2xl font-bold">
                Zaloguj się do swojego konta
              </h1>
              <p className="text-muted-foreground text-sm text-balance">
                Wpisz swój email i hasło, aby kontynuować
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
                      disabled={isLoading}
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
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent className="flex flex-row items-center justify-between">
                      <FieldLabel htmlFor={field.name}>Hasło</FieldLabel>
                      <Link
                        className="text-xs text-muted-foreground hover:underline"
                        to="/zapomniales-hasla"
                      >
                        Zapomniałeś hasła?
                      </Link>
                    </FieldContent>
                    <PasswordInput
                      disabled={isLoading}
                      variant="current-password"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(value) => field.handleChange(value)}
                      aria-invalid={isInvalid}
                      placeholder="Wpisz swoje hasło"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="rememberMe"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <Checkbox
                      disabled={isLoading}
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked === true)
                      }
                    />
                    <FieldLabel htmlFor={field.name} className="font-normal">
                      Zapamiętaj mnie
                    </FieldLabel>
                  </Field>
                );
              }}
            />

            <Field>
              <Button disabled={isLoading} type="submit">
                {isLoading && <Spinner />}
                Zaloguj się
              </Button>
            </Field>
            <FieldSeparator>lub zaloguj się przez</FieldSeparator>
            <Field>
              <FieldContent className="flex flex-row gap-2">
                <Button
                  disabled={isLoading}
                  variant="outline"
                  type="button"
                  className="flex-1"
                  onClick={handleGoogleSignIn}
                >
                  <img src={GoogleIcon} alt="Google" className="invert" />
                </Button>
                <Button
                  disabled={isLoading}
                  variant="outline"
                  type="button"
                  className="flex-1"
                  onClick={handleFacebookSignIn}
                >
                  <img src={MetaIcon} alt="Meta" className="invert" />
                </Button>
              </FieldContent>
              <FieldDescription className="px-6 text-center">
                Nie masz jeszcze konta?{" "}
                <Link to="/zarejestruj-sie">Zarejestruj się</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
