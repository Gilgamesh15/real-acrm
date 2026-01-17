import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { Button } from "~/components/ui/button";
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
import { PasswordSchema } from "~/lib/schemas";
import { cn } from "~/lib/utils";

import GoogleIcon from "/google.svg";
import MetaIcon from "/meta.svg";

const RegisterSchema = z
  .object({
    email: z.email({ error: "Email jest wymagany" }),
    password: PasswordSchema,
    confirmPassword: z
      .string({ error: "Potwierdzenie hasła jest wymagane" })
      .min(1, { error: "Potwierdzenie hasła jest wymagane" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Hasła nie pasują do siebie",
    path: ["confirmPassword"],
  })
  .transform(({ confirmPassword, ...data }) => data);

export default function ZarejestrujSie() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: RegisterSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      toast.promise(
        async () => {
          const { data, error } = await authClient.signUp.email({
            name: "better auth won't let me leave name empty",
            email: value.email,
            password: value.password,
          });

          if (error) {
            throw new Error(error.message);
          }

          // ignore errors from sending verification email
          try {
            await authClient.sendVerificationEmail({
              email: data?.user.email,
            });
          } catch (error) {}

          return data.user;
        },
        {
          loading: "Trwa rejestracja...",
          error: (err) => {
            formApi.setFieldValue("password", "");
            formApi.setFieldValue("confirmPassword", "");
            return err instanceof Error
              ? {
                  message: "Wystąpił błąd podczas rejestracji.",
                  description: err.message,
                }
              : {
                  message: "Wystąpił nieoczekiwany błąd podczas rejestracji.",
                  description: "Odśwież stronę i spróbuj ponownie.",
                };
          },
          success: (res) => {
            navigate(`/potwierdz-email?email=${res?.email}`);
            return "Pomyślnie zarejestrowano konto!";
          },
        }
      );
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          "Wystąpił błąd podczas logowania przez Google. Spróbuj ponownie.",
          {
            description: error.message,
          }
        );
      } else {
        toast.error(
          "Wystąpił nieoczekiwany błąd podczas logowania przez Google.",
          {
            description: "Odśwież stronę i spróbuj ponownie.",
          }
        );
      }
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "facebook",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          "Wystąpił błąd podczas logowania przez Facebook. Spróbuj ponownie.",
          {
            description: error.message,
          }
        );
      } else {
        toast.error(
          "Wystąpił nieoczekiwany błąd podczas logowania przez Facebook.",
          {
            description: "Odśwież stronę i spróbuj ponownie.",
          }
        );
      }
    }
  };

  const isLoading = form.state.isSubmitting;

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
              <h1 className="text-2xl font-bold">Utwórz swoje konto</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Wypełnij formularz poniżej, aby kontynuować
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
                Utwórz konto
              </Button>
            </Field>
            <FieldSeparator>lub zarejestruj się przez</FieldSeparator>
            <Field>
              <FieldContent className="flex flex-row gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="flex-1"
                  onClick={handleGoogleSignIn}
                >
                  <img src={GoogleIcon} alt="Google" className="invert" />
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="flex-1"
                  onClick={handleFacebookSignIn}
                >
                  <img src={MetaIcon} alt="Meta" className="invert" />
                </Button>
              </FieldContent>
              <FieldDescription className="px-6 text-center">
                Masz już konto? <Link to="/zaloguj-sie">Zaloguj się</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
