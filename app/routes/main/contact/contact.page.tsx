import { useForm } from "@tanstack/react-form";
import { SendIcon } from "lucide-react";
import React from "react";
import { data, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";

import { ContactUsEmail } from "~/components/emails/contact-us-email";
import { loggerContext } from "~/context/logger-context.server";
import { resend } from "~/lib/resend";
import {
  convertFormDataToObjectUnsafe,
  convertObjectToFormDataUnsafe,
} from "~/lib/utils";

import type { Route } from "./+types/contact.page";

export const meta: Route.MetaFunction = () => [
  { title: "Kontakt | ACRM" },
  { name: "description", content: "Skontaktuj się z nami." },
  { tagName: "link", rel: "canonical", href: "https://www.acrm.pl/kontakt" },
];

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const formData = await request.formData();

  const args = convertFormDataToObjectUnsafe(ContactFormSchema, formData);

  const { name, email, message } = args;

  try {
    await resend.emails.send({
      to: "kontakt@acrm.pl",
      from: email,
      subject: "Kontakt z formularza kontaktowego",
      react: <ContactUsEmail name={name} email={email} message={message} />,
    });

    return data(
      {
        success: true,
        message: "Wiadomość została wysłana",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to send contact email", { error });
    return data(
      { success: false, message: "Wiadomość nie została wysłana", error },
      { status: 500 }
    );
  }
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const result = await serverAction();

  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }

  return result;
}

const ContactFormSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  message: z.string().min(1),
});

export default function ContactPage() {
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    validators: {
      onSubmit: ContactFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(ContactFormSchema, value), {
        method: "POST",
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate(`/kontakt/sukces`);
    }
  }, [fetcher.data, navigate]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="py-16 md:py-32 w-full">
        <div className="container">
          <h1 className="text-5xl font-semibold tracking-tight lg:text-8xl">
            Skontaktuj się z nami<sup>*</sup>
          </h1>
          <div className="mt-20 flex flex-col justify-between gap-10 lg:flex-row">
            <div className="w-full max-w-md">
              <p className="tracking-tight text-muted-foreground/50">
                Masz pytania o konkretny produkt? Jesteśmy tu, żeby pomóc.
              </p>
              <div className="mt-10 flex justify-between">
                <a
                  className="flex items-center gap-1 text-foreground/40 hover:text-foreground"
                  href="tel:+48453450597"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-smartphone h-4 w-4"
                    aria-hidden="true"
                  >
                    <rect width={14} height={20} x={5} y={2} rx={2} ry={2} />
                    <path d="M12 18h.01" />
                  </svg>{" "}
                  +48 453 450 597
                </a>
                <a
                  className="flex items-center gap-1 text-foreground/40 hover:text-foreground"
                  href="mailto:kontakt@acrm.pl"
                >
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-mail h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                    <rect x={2} y={4} width={20} height={16} rx={2} />
                  </svg>{" "}
                  kontakt@acrm.pl
                </a>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="col-span-4 flex w-full flex-col gap-2 lg:pl-30"
            >
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Imię i nazwisko
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Imię i nazwisko"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Adres e-mail</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Adres e-mail"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="message"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Wiadomość</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Wiadomość (Opisz swoje pytanie lub problem)"
                        className="min-h-[120px]"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <Button
                type="submit"
                className="mt-2"
                disabled={form.state.isSubmitting}
              >
                {form.state.isSubmitting ? (
                  <Spinner />
                ) : (
                  <>
                    Wyślij wiadomość
                    <SendIcon />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
