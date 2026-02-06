import * as schema from "db/schema";
import { eq } from "drizzle-orm";
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
import { CouponFormSchema, type CouponFormSchemaType } from "~/lib/schemas";
import { stripe } from "~/lib/stripe";
import { cn, convertFormDataToObjectUnsafe } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-coupons-create.page";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin/kupony");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const [products, pieces] = await Promise.all([
    db.query.products.findMany({
      columns: { id: true, name: true },
    }),
    db.query.pieces.findMany({
      columns: { id: true, name: true },
    }),
  ]);

  return data({ products, pieces }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const args = convertFormDataToObjectUnsafe(
      CouponFormSchema,
      await request.formData()
    );

    const { success, error } = CouponFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Coupon validation failed", {
        adminId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          coupon: null,
        },
        { status: 400 }
      );
    }

    // Prepare values based on discount type
    const couponValues: typeof schema.coupons.$inferInsert =
      args.couponType === "percentage"
        ? {
            maxUsages: args.maxUsages,
            percentOff: args.percentOff!,
            name: args.name,
          }
        : {
            maxUsages: args.maxUsages,
            amountOffInGrosz: args.amountOffInGrosz!,
            name: args.name,
          };

    const createdCoupon = await db.transaction(async (tx) => {
      const couponId = crypto.randomUUID();

      const createdCoupon = await tx
        .insert(schema.coupons)
        .values({
          id: couponId,
          ...couponValues,
        })
        .returning()
        .then((result) => result[0]);

      if (args.productIds.length > 0) {
        await tx
          .delete(schema.couponsToProducts)
          .where(eq(schema.couponsToProducts.couponId, couponId));
        await tx.insert(schema.couponsToProducts).values(
          args.productIds.map((productId) => ({
            couponId: couponId,
            productId: productId,
          }))
        );
      }

      if (args.pieceIds.length > 0) {
        await tx
          .delete(schema.couponsToPieces)
          .where(eq(schema.couponsToPieces.couponId, couponId));
        await tx.insert(schema.couponsToPieces).values(
          args.pieceIds.map((pieceId) => ({
            couponId: couponId,
            pieceId: pieceId,
          }))
        );
      }

      await stripe.coupons.create({
        amount_off: args.amountOffInGrosz,
        applies_to: {
          products: [...args.productIds, ...args.pieceIds],
        },
        currency: "pln",
        id: couponId,
        max_redemptions: args.maxUsages,
        name: args.name,
        percent_off: args.percentOff,
      });

      return createdCoupon;
    });

    logger.info("Coupon created", {
      adminId,
      couponId: createdCoupon?.id,
      couponName: createdCoupon?.name,
    });

    return data(
      {
        success: true,
        coupon: createdCoupon,
        error: null,
        message: "Kupon został utworzony",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create coupon", { error, adminId });
    throw data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        coupon: null,
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

const COUPON_FORM_ID = "coupon-form";

export default function AdminCouponsCreatePage({
  loaderData,
}: Route.ComponentProps) {
  const { products, pieces } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      maxUsages: undefined,
      couponType: "percentage" as "percentage" | "fixed",
      percentOff: undefined,
      amountOffInGrosz: undefined,
      productIds: [],
      pieceIds: [],
    } as CouponFormSchemaType,
    validators: {
      onSubmit: CouponFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(CouponFormSchema, value), {
        method: "post",
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate(`/admin/kupony`);
    }
  }, [fetcher.data, navigate]);

  const isCreating = fetcher.state === "submitting";

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={COUPON_FORM_ID} type="reset">
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
          id={COUPON_FORM_ID}
        >
          <FieldSet>
            <FieldLegend>Podstawowe informacje</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa kuponu"
                    description="Unikalna nazwa identyfikująca kupon"
                  />
                )}
              </form.AppField>

              <form.AppField name="couponType">
                {(field) => (
                  <>
                    <field.SelectField
                      label="Typ kuponu"
                      description="Wybierz czy kupon ma być procentowy czy kwotowy"
                      options={[
                        { label: "Procentowa", value: "percentage" },
                        { label: "Kwotowa", value: "fixed" },
                      ]}
                    />

                    {field.state.value === "percentage" && (
                      <form.AppField name="percentOff">
                        {(percentField) => (
                          <percentField.NumberField
                            label="Procent kuponu"
                            description="Wartość od 1 do 100"
                            min={1}
                            max={100}
                            stepper={1}
                          />
                        )}
                      </form.AppField>
                    )}

                    {field.state.value === "fixed" && (
                      <form.AppField name="amountOffInGrosz">
                        {(amountField) => (
                          <amountField.NumberField
                            label="Kwota kuponu (w groszach)"
                            description="Stała kwota kuponu w groszach (np. 5000 = 50 zł)"
                            min={1}
                            stepper={100}
                          />
                        )}
                      </form.AppField>
                    )}
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
              <form.AppField name="productIds">
                {(field) => (
                  <field.MultiComboboxField
                    label="Produkty"
                    description="Wybierz produkty, na które ma być kupon"
                    placeholder="Wybierz produkty"
                    searchPlaceholder="Wyszukaj produkty"
                    emptyStateMessage="Brak produktów"
                    options={products.map((product) => ({
                      label: product.name,
                      value: product.id as string,
                    }))}
                  />
                )}
              </form.AppField>
            </FieldGroup>

            <FieldGroup>
              <form.AppField name="pieceIds">
                {(field) => (
                  <field.MultiComboboxField
                    label="Elementy"
                    description="Wybierz elementy, na które ma być kupon"
                    placeholder="Wybierz elementy"
                    searchPlaceholder="Wyszukaj elementy"
                    emptyStateMessage="Brak elementów"
                    options={pieces.map((piece) => ({
                      label: piece.name,
                      value: piece.id,
                    }))}
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </form>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/kupony"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót do listy
        </Link>

        <Button
          size="sm"
          type="submit"
          form={COUPON_FORM_ID}
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Utwórz kupon</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
