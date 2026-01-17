import { useForm } from "@tanstack/react-form";
import * as schema from "db/schema";
import { orderService } from "db/services/order.service";
import { eq } from "drizzle-orm";
import { XOctagon } from "lucide-react";
import { data, redirect, useFetcher } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Error,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";
import { Spinner } from "~/components/ui/spinner";

import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
import { stripe } from "~/lib/stripe";
import {
  convertFormDataToObjectUnsafe,
  convertObjectToFormDataUnsafe,
} from "~/lib/utils";

import type { Route } from "./+types/profile.page";

// ========================== LOADERS ==========================
export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    return redirect("/zaloguj-sie");
  }

  return {
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    phoneNumber: session.user.phoneNumber,
    acceptMarketing: session.user.acceptedMarketing,
  };
}

// ========================== ACTIONS ==========================
const ChangeProfileDataSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().min(1),
  acceptMarketing: z.boolean(),
});
export const action = async ({ request, context }: Route.ActionArgs) => {
  try {
    const logger = context.get(loggerContext);
    const session = context.get(sessionContext);

    if (session.user.isAnonymous) {
      throw redirect("/zaloguj-sie", { status: 302 });
    }

    const userId = session.user.id;

    const args = convertFormDataToObjectUnsafe(
      ChangeProfileDataSchema,
      await request.formData()
    );

    const updatedUser = await db.transaction(async (tx) => {
      const updatedUser = await tx
        .update(schema.users)
        .set(args)
        .where(eq(schema.users.id, userId))
        .returning()
        .then((result) => result[0]!);

      const stripeCustomerId =
        await orderService.confirmStripeCustomerId(userId);

      if (!stripeCustomerId) {
        throw data(
          {
            success: false,
            message: "Failed to confirm stripe customer id",
            error: "Failed to confirm stripe customer id",
            data: null,
          },
          { status: 500 }
        );
      }

      await stripe.customers.update(stripeCustomerId, {
        email: updatedUser.email,
        phone: updatedUser.phoneNumber ?? undefined,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      });

      return updatedUser;
    });

    logger.info("User profile updated", { userId });

    return data(
      {
        success: true,
        message: "Dane profilu zostały zaktualizowane",
        error: null,
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    const session = context.get(sessionContext);
    const userId = session?.user?.id;
    const logger = context.get(loggerContext);
    logger.error("Failed to update profile", { error, userId });

    return data(
      {
        success: false,
        message: "Nie udało się zaktualizować danych profilu",
        data: null,
        error,
      },
      { status: 500 }
    );
  }
};

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  try {
    const result = await serverAction();

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    return result;
  } catch (error) {
    return data(
      {
        success: false,
        message: "Nie udało się zaktualizować danych profilu",
        data: null,
        error,
      },
      { status: 500 }
    );
  }
}

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  const { firstName, lastName, phoneNumber, acceptMarketing } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isLoading = fetcher.state !== "idle";

  const form = useForm({
    defaultValues: {
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      phoneNumber: phoneNumber ?? "",
      acceptMarketing: acceptMarketing ?? false,
    },
    validators: {
      onSubmit: ChangeProfileDataSchema,
    },
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      fetcher.submit(
        convertObjectToFormDataUnsafe(ChangeProfileDataSchema, value),
        {
          method: "POST",
        }
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Item variant="outline">
        <ItemHeader className="flex-col items-start">
          <ItemTitle>Dane konta</ItemTitle>
          <ItemDescription>
            Te dane są używane do przyśpieszenia procesu zamówienia.
          </ItemDescription>
        </ItemHeader>
        <ItemContent className="flex flex-col gap-6 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
            <form.Field
              name="firstName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Imię</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Jan"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />{" "}
            <form.Field
              name="lastName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nazwisko</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Kowalski"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </div>

          <form.Field
            name="phoneNumber"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Numer telefonu</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="123456789"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="acceptMarketing"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <FieldSet>
                  <FieldGroup data-slot="checkbox-group">
                    <Field orientation="horizontal" data-invalid={isInvalid}>
                      <Checkbox
                        id={field.name}
                        name={field.name}
                        checked={field.state.value ?? false}
                        onCheckedChange={(checked) =>
                          field.handleChange(checked === true)
                        }
                        disabled
                      />
                      <FieldLabel htmlFor={field.name} className="font-normal">
                        Wyrażam zgodę na używanie mojego adresu e-mail przez
                        Sprzedawcę ACRM sp. z o. o. Nad Sudołem 24/22, 31-228
                        Kraków do celów przesyłania informacji handlowej w
                        rozumieniu przepisów ustawy z dnia 18 lipca 2002 r. o
                        świadczeniu usług drogą elektroniczną, w tym marketingu
                        bezpośredniego, za pośrednictwem poczty elektronicznej.
                      </FieldLabel>
                    </Field>
                  </FieldGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldSet>
              );
            }}
          />
        </ItemContent>

        <ItemFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner />
                <span>Zapisywanie...</span>
              </>
            ) : (
              <span>Zaktualizuj profil</span>
            )}
          </Button>
        </ItemFooter>
      </Item>
    </form>
  );
}

export function ErrorBoundary() {
  return (
    <Error>
      <ErrorMedia>
        <XOctagon />
      </ErrorMedia>
      <ErrorContent>
        <ErrorTitle>Wystąpił błąd</ErrorTitle>
        <ErrorDescription>Spróbuj ponownie później.</ErrorDescription>
      </ErrorContent>
    </Error>
  );
}
