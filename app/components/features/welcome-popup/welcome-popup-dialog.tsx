import { useForm } from "@tanstack/react-form";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import z from "zod";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";

import { Logo } from "../logo/logo";
import { useWelcomePopup } from "./welcome-popup-provider";

export function WelcomePopupDialog() {
  const { open, isSubscribed, handleOpenChange, handleSubscribe } =
    useWelcomePopup();

  if (!open && !isSubscribed) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
          <Logo size="sm" className="mb-2" />
          <DialogTitle className="text-xl font-secondary tracking-wide">
            10% na pierwsze zamówienie
          </DialogTitle>
          <DialogDescription>
            Zapisz się do newslettera i odbierz kod rabatowy
          </DialogDescription>
        </DialogHeader>
        {isSubscribed ? (
          <SuccessContent />
        ) : (
          <FormContent onSubscribed={handleSubscribe} />
        )}

        <p className="text-xs text-muted-foreground text-center">
          Oferta jednorazowa – tylko dla nowych subskrybentów.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function FormContent({
  onSubscribed,
}: {
  onSubscribed: (email: string) => Promise<void>;
}) {
  const form = useForm({
    defaultValues: { email: "", consent: false },
    validators: {
      onSubmit: z.object({
        email: z.email(),
        consent: z.boolean(),
      }),
    },
    onSubmit: async ({ value }) => {
      await onSubscribed(value.email);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="jan.kowalski@gmail.com"
                autoComplete="email"
              />
              <FieldDescription>
                Wpisz swój adres email, aby otrzymać kod rabatowy
              </FieldDescription>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <form.Field
        name="consent"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <FieldSet>
              <FieldGroup>
                <Field orientation="horizontal" data-invalid={isInvalid}>
                  <Checkbox
                    id={field.name}
                    name={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                    aria-invalid={isInvalid}
                  />
                  <FieldLabel
                    htmlFor={field.name}
                    className="font-normal text-xs leading-relaxed"
                  >
                    <span>
                      Wyrażam zgodę na przetwarzanie moich danych osobowych w
                      celu wysyłki newslettera. Wiem, że mogę wycofać zgodę w
                      dowolnym momencie. Szczegóły znajdziesz w{" "}
                      <Link
                        to="/polityka-prywatnosci"
                        className="inline-block underline underline-offset-4 hover:text-foreground transition-colors"
                      >
                        Polityce Prywatności
                      </Link>
                      .
                    </span>
                  </FieldLabel>
                </Field>
              </FieldGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </FieldSet>
          );
        }}
      />

      <Field orientation="horizontal" className="mt-6">
        <Button className="w-full" type="submit">
          Zapisz się
        </Button>
      </Field>
    </form>
  );
}

function SuccessContent() {
  return (
    <div className="space-y-4 text-center py-2">
      <CheckCircle2 className="size-12 text-success-foreground mx-auto" />
      <p className="text-sm text-muted-foreground">
        Dziękujemy! Twój unikalny kod rabatowy został wysłany na Twój adres
        email. Sprawdź skrzynkę odbiorczą.
      </p>
    </div>
  );
}
