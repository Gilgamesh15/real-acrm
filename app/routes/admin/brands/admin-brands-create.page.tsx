import { CheckCircleIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react";
import React from "react";
import { Link, useFetcher, useNavigate } from "react-router";
import { data, redirect } from "react-router";
import { toast } from "sonner";

import { Button, buttonVariants } from "~/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";

import * as schema from "~/../db/schema";
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
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { BrandFormSchema, type BrandFormSchemaType } from "~/lib/schemas";
import { cn, convertFormDataToObjectUnsafe } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-brands-create.page";

// ========================== LOADING ==========================

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const brandGroups = await db.query.brandGroups.findMany({});

  return data({ brandGroups }, { status: 200 });
}

// ========================== ACTIONS ==========================
export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const args = convertFormDataToObjectUnsafe(
      BrandFormSchema,
      await request.formData()
    );

    const { success, error } = BrandFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Brand validation failed", {
        adminId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          brand: null,
        },
        { status: 400 }
      );
    }

    const createdBrand = await db
      .insert(schema.brands)
      .values(args)
      .returning()
      .then((result) => result[0]);

    logger.info("Brand created", {
      adminId,
      brandId: createdBrand?.id,
      brandName: createdBrand?.name,
    });

    return data(
      {
        success: true,
        brand: createdBrand,
        error: null,
        message: "Marka została utworzona",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create brand", { error, adminId });
    throw data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        brand: null,
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

const BRAND_FORM_ID = "brand-form";

export default function AdminBrandsCreatePage({
  loaderData,
}: Route.ComponentProps) {
  const { brandGroups } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      groupId: undefined,
    } as BrandFormSchemaType,
    validators: {
      onSubmit: BrandFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(BrandFormSchema, value), {
        method: "post",
      });
    },
  });

  React.useEffect(() => {
    console.log(fetcher.data);
    if (fetcher.data?.success) {
      navigate(`/admin/marki`);
    }
  }, [fetcher.data, navigate]);

  const isCreating = fetcher.state === "submitting";

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={BRAND_FORM_ID} type="reset">
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
          id={BRAND_FORM_ID}
        >
          <FieldSet>
            <FieldLegend>Informacje o marce</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa marki"
                    description="Unikalwa nazwa marki, która będzie wyświetlana w sklepie"
                  />
                )}
              </form.AppField>
              <form.AppField name="groupId">
                {(field) => (
                  <field.ComboboxField
                    label="Grupa marki"
                    description="Przypisanie marki do grupy ułatwi organizację i filtrowanie"
                    placeholder="Wybierz grupę marki"
                    searchPlaceholder="Wyszukaj grupę marki"
                    emptyStateMessage="Brak grup marki"
                    options={brandGroups.map((brandGroup) => ({
                      value: brandGroup.id,
                      label: brandGroup.name,
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
          to="/admin/marki"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={BRAND_FORM_ID}
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz markę</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
