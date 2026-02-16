import * as schema from "db/schema";
import { eq, inArray } from "drizzle-orm";
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
import { DiscountFormSchema, type DiscountFormSchemaType } from "~/lib/schemas";
import { cn, convertFormDataToObjectUnsafe } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-discounts-edit.page";

// ========================== LOADING ==========================

export async function loader({ context, params }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const { discountId } = params;

  const discount = await db.query.discounts.findFirst({
    where: eq(schema.discounts.id, discountId),
  });

  if (!discount) {
    throw data({}, { status: 404 });
  }

  const [products, pieces, discountProductIds, discountPieceIds] =
    await Promise.all([
      db.query.products.findMany({
        columns: { id: true, name: true },
      }),
      db.query.pieces.findMany({
        columns: { id: true, name: true },
      }),
      db.query.products
        .findMany({
          where: eq(schema.products.discountId, discountId),
          columns: { id: true },
        })
        .then((result) => result.map((product) => product.id)),
      db.query.pieces
        .findMany({
          where: eq(schema.pieces.discountId, discountId),
          columns: { id: true },
        })
        .then((result) => result.map((piece) => piece.id)),
    ]);

  return data(
    { products, pieces, discount, discountProductIds, discountPieceIds },
    { status: 200 }
  );
}

// ========================== ACTIONS ==========================

export async function action({ request, context, params }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;
  const { discountId } = params;

  try {
    const args = convertFormDataToObjectUnsafe(
      DiscountFormSchema,
      await request.formData()
    );

    const { success, error } = DiscountFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Discount validation failed", {
        adminId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          discount: null,
        },
        { status: 400 }
      );
    }

    // Prepare values based on discount type
    const discountValues =
      args.discountType === "percentage"
        ? {
            name: args.name,
            percentOff: args.percentOff!,
            amountOffInGrosz: null,
          }
        : {
            name: args.name,
            percentOff: null,
            amountOffInGrosz: args.amountOffInGrosz!,
          };

    const updatedDiscount = await db.transaction(async (tx) => {
      const updatedDiscount = await tx
        .update(schema.discounts)
        .set({
          ...discountValues,
        })
        .where(eq(schema.discounts.id, discountId))
        .returning()
        .then((result) => result[0]);

      if (args.productIds.length > 0) {
        await tx
          .update(schema.products)
          .set({
            discountId: null,
          })
          .where(eq(schema.products.discountId, discountId));
        await tx
          .update(schema.products)
          .set({
            discountId: discountId,
          })
          .where(inArray(schema.products.id, args.productIds));
      }

      if (args.pieceIds.length > 0) {
        await tx
          .update(schema.pieces)
          .set({
            discountId: null,
          })
          .where(eq(schema.pieces.discountId, discountId));
        await tx
          .update(schema.pieces)
          .set({
            discountId: discountId,
          })
          .where(inArray(schema.pieces.id, args.pieceIds));
      }

      return updatedDiscount;
    });

    logger.info("Discount updated", {
      adminId,
      discountId,
      discountName: updatedDiscount?.name,
    });

    return data(
      {
        success: true,
        discount: updatedDiscount,
        error: null,
        message: "Zniżka została zaktualizowana",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to update discount", { error, adminId, discountId });
    throw data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        discount: null,
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

const DISCOUNT_FORM_ID = "discount-form";

export default function AdminDiscountsEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { products, pieces, discount, discountProductIds, discountPieceIds } =
    loaderData;
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: discount.name,
      discountType: discount.percentOff ? "percentage" : "fixed",
      percentOff: discount.percentOff,
      amountOffInGrosz: discount.amountOffInGrosz,
      productIds: discountProductIds,
      pieceIds: discountPieceIds,
    } as DiscountFormSchemaType,
    validators: {
      onSubmit: DiscountFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(DiscountFormSchema, value), {
        method: "post",
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate(`/admin/discounts/`);
    }
  }, [fetcher.data, navigate]);

  const isUpdating = fetcher.state === "submitting";

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={DISCOUNT_FORM_ID} type="reset">
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
          id={DISCOUNT_FORM_ID}
        >
          <FieldSet>
            <FieldLegend>Podstawowe informacje</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa zniżki"
                    description="Unikalna nazwa identyfikująca zniżkę"
                  />
                )}
              </form.AppField>

              <form.AppField name="discountType">
                {(field) => (
                  <>
                    <field.SelectField
                      label="Typ zniżki"
                      description="Wybierz czy zniżka ma być procentowa czy kwotowa"
                      options={[
                        { label: "Procentowa", value: "percentage" },
                        { label: "Kwotowa", value: "fixed" },
                      ]}
                    />

                    {field.state.value === "percentage" && (
                      <form.AppField name="percentOff">
                        {(percentField) => (
                          <percentField.NumberField
                            label="Procent zniżki"
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
                            label="Kwota zniżki (w groszach)"
                            description="Stała kwota zniżki w groszach (np. 5000 = 50 zł)"
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
              <form.AppField name="productIds">
                {(field) => (
                  <field.MultiComboboxField
                    label="Produkty"
                    description="Wybierz produkty, na które ma być zniżka"
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
                    description="Wybierz elementy, na które ma być zniżka"
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
          to="/admin/discounts/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót do listy
        </Link>

        <Button
          size="sm"
          type="submit"
          form={DISCOUNT_FORM_ID}
          disabled={isUpdating}
        >
          {isUpdating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zaktualizuj zniżkę</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
