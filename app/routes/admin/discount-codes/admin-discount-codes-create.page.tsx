import * as schema from "db/schema";
import { CheckCircleIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react";
import React from "react";
import { Link, useFetcher, useNavigate } from "react-router";
import { data, redirect } from "react-router";
import { toast } from "sonner";

import { Button, buttonVariants } from "~/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";

import {
  AdminPageActions,
  AdminPageContainer,
  AdminPageContent,
  AdminPageFooter,
  AdminPageHeader,
} from "~/components/features/admin-page-layout/admin-page-layout";
import { useAppForm } from "~/components/shared/form";
import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
import {
  DiscountCodeFormSchema,
  type DiscountCodeFormSchemaType,
} from "~/lib/schemas";
import { stripe } from "~/lib/stripe";
import { cn, convertFormDataToObjectUnsafe } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-discount-codes-create.page";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin/discount-codes");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const [coupons, users] = await Promise.all([
    db.query.coupons.findMany({
      columns: {
        id: true,
        name: true,
        amountOffInGrosz: true,
        percentOff: true,
      },
    }),
    db.query.users.findMany({
      columns: { id: true, name: true, email: true },
    }),
  ]);

  return data({ coupons, users }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const args = convertFormDataToObjectUnsafe(
      DiscountCodeFormSchema,
      await request.formData()
    );

    const { success, error } = DiscountCodeFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Discount code validation failed", {
        adminId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          discountCode: null,
        },
        { status: 400 }
      );
    }

    // Validate that couponId exists
    const coupon = await db.query.coupons.findFirst({
      where: (coupons, { eq }) => eq(coupons.id, args.couponId),
    });

    if (!coupon) {
      logger.warn("Discount code creation failed - coupon not found", {
        adminId,
        couponId: args.couponId,
      });
      throw data(
        {
          success: false,
          message: "Wybrany kupon nie istnieje",
          error: "Kupon nie został znaleziony",
          discountCode: null,
        },
        { status: 400 }
      );
    }

    // Validate that userId exists if provided
    if (args.redeemableByUserId) {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, args.redeemableByUserId!),
      });

      if (!user) {
        logger.warn("Discount code creation failed - user not found", {
          adminId,
          userId: args.redeemableByUserId,
        });
        throw data(
          {
            success: false,
            message: "Wybrany użytkownik nie istnieje",
            error: "Użytkownik nie został znaleziony",
            discountCode: null,
          },
          { status: 400 }
        );
      }
    }

    // Prepare values based on discount type
    const discountCodeValues: typeof schema.promotionCodes.$inferInsert = {
      code: args.code,
      couponId: args.couponId,
      redeemableByUserId: args.redeemableByUserId,
      maxUsages: args.maxUsages,
      firstTimeTransaction: args.firstTimeTransaction,
      minimumAmountInGrosz: args.minimumAmountInGrosz,
    };

    const createdDiscountCode = await db.transaction(async (tx) => {
      const createdDiscountCode = await tx
        .insert(schema.promotionCodes)
        .values({
          ...discountCodeValues,
        })
        .returning()
        .then((result) => result[0]);

      await stripe.promotionCodes.create({
        promotion: {
          type: "coupon",
          coupon: args.couponId,
        },
        code: args.code,
        customer: args.redeemableByUserId,
        max_redemptions: args.maxUsages,
        restrictions: {
          first_time_transaction: args.firstTimeTransaction,
          minimum_amount: args.minimumAmountInGrosz,
          minimum_amount_currency: "pln",
        },
      });

      return createdDiscountCode;
    });

    logger.info("Discount code created", {
      adminId,
      discountCodeCode: createdDiscountCode?.code,
    });

    return data(
      {
        success: true,
        discountCode: createdDiscountCode,
        error: null,
        message: "Kod promocyjny został utworzony",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create discount code", { error, adminId });
    throw data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        discountCode: null,
      },
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

// ========================== PAGE ==========================

const DISCOUNT_CODE_FORM_ID = "discount-code-form";

export default function AdminDiscountCodesCreatePage({
  loaderData,
}: Route.ComponentProps) {
  const { coupons, users } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      code: "",
      couponId: "",
      redeemableByUserId: undefined,
      maxUsages: undefined,
      firstTimeTransaction: false,
      minimumAmountInGrosz: undefined,
    } as DiscountCodeFormSchemaType,
    validators: {
      onSubmit: DiscountCodeFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(
        convertObjectToFormDataUnsafe(DiscountCodeFormSchema, value),
        {
          method: "post",
        }
      );
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate(`/admin/kody-rabatowe`);
    }
  }, [fetcher.data, navigate]);

  const isCreating = fetcher.state === "submitting";

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={DISCOUNT_CODE_FORM_ID} type="reset">
            <RotateCcwIcon />
          </Button>
        </AdminPageActions>
      </AdminPageHeader>
      <AdminPageContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          id={DISCOUNT_CODE_FORM_ID}
        >
          <FieldSet>
            <FieldLegend>Podstawowe informacje</FieldLegend>
            <FieldGroup>
              <form.AppField name="code">
                {(field) => (
                  <field.TextField
                    label="Kod promocyjny"
                    description="Unikalny kod promocyjny"
                  />
                )}
              </form.AppField>

              <form.AppField name="couponId">
                {(field) => (
                  <>
                    <field.ComboboxField
                      label="Kupon"
                      description="Wybierz kupon, na który ma być zastosowany kod promocyjny"
                      placeholder="Wybierz kupon"
                      searchPlaceholder="Wyszukaj kupon"
                      emptyStateMessage="Brak kuponów"
                      options={coupons.map((coupon) => ({
                        label:
                          coupon.name ??
                          `${coupon.id} - ${coupon.amountOffInGrosz ?? coupon.percentOff ?? 0}%`,
                        value: coupon.id,
                      }))}
                    />

                    <form.AppField name="redeemableByUserId">
                      {(field) => (
                        <field.ComboboxField
                          label="Użytkownik"
                          description="Wybierz użytkownika, który może użyć kodu promocyjnego"
                          placeholder="Wybierz użytkownika"
                          searchPlaceholder="Wyszukaj użytkownika"
                          emptyStateMessage="Brak użytkowników"
                          options={users.map((user) => ({
                            label: user.name ?? user.email,
                            value: user.id,
                          }))}
                        />
                      )}
                    </form.AppField>
                  </>
                )}
              </form.AppField>
            </FieldGroup>
            <FieldGroup>
              <form.AppField name="maxUsages">
                {(field) => (
                  <field.NumberField
                    label="Maksymalna liczba użyć"
                    description="Maksymalna liczba użyć kuponu"
                    min={1}
                    stepper={1}
                  />
                )}
              </form.AppField>
            </FieldGroup>

            <FieldGroup>
              <form.AppField name="minimumAmountInGrosz">
                {(field) => (
                  <field.NumberField
                    label="Minimalna kwota"
                    description="Minimalna kwota, na którą można użyć kodu promocyjnego"
                    placeholder="Minimalna kwota"
                    min={0}
                    stepper={100}
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldLegend>Ograniczenia</FieldLegend>
            <FieldGroup>
              <form.AppField name="firstTimeTransaction">
                {(field) => (
                  <field.SelectField
                    label="Transakcja pierwsza"
                    description="Czy kod promocyjny może być użyty tylko raz przez użytkownika"
                    options={[
                      { label: "Tak", value: "true" },
                      { label: "Nie", value: "false" },
                    ]}
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </form>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/kody-rabatowe"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót do listy
        </Link>

        <Button
          size="sm"
          type="submit"
          form={DISCOUNT_CODE_FORM_ID}
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Utwórz kod promocyjny</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
