import * as schema from "db/schema";
import { inArray } from "drizzle-orm";
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

import type { Route } from "./+types/admin-discounts-create.page";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin/discounts");
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

    const createdDiscount = await db.transaction(async (tx) => {
      const discountId = crypto.randomUUID();
      const createdDiscount = await tx
        .insert(schema.discounts)
        .values({
          id: discountId,
          ...discountValues,
        })
        .returning()
        .then((result) => result[0]);

      if (args.productIds.length > 0) {
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
            discountId: discountId,
          })
          .where(inArray(schema.pieces.id, args.pieceIds));
      }

      return createdDiscount;
    });

    logger.info("Discount created", {
      adminId,
      discountId: createdDiscount?.id,
      discountName: createdDiscount?.name,
    });

    return data(
      {
        success: true,
        discount: createdDiscount,
        error: null,
        message: "Zniżka została utworzona",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create discount", { error, adminId });
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

export default function AdminDiscountsCreatePage({
  loaderData,
}: Route.ComponentProps) {
  const { products, pieces } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      discountType: "percentage" as "percentage" | "fixed",
      percentOff: undefined,
      amountOffInGrosz: undefined,
      productIds: [],
      pieceIds: [],
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
      navigate(`/admin/discounts`);
    }
  }, [fetcher.data, navigate]);

  const isCreating = fetcher.state === "submitting";

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
          to="/admin/rabaty"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót do listy
        </Link>

        <Button
          size="sm"
          type="submit"
          form={DISCOUNT_FORM_ID}
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Utwórz zniżkę</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
