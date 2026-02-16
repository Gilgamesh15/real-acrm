import { eq } from "drizzle-orm";
import { CheckCircleIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react";
import React from "react";
import {
  Link,
  isRouteErrorResponse,
  useFetcher,
  useNavigate,
} from "react-router";
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
import { db } from "~/lib/db";
import { BrandFormSchema, type BrandFormSchemaType } from "~/lib/schemas";
import { cn, convertFormDataToObjectUnsafe } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-brands-edit.page";

// ========================== LOADING ==========================

export async function loader({ params, context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const { brandId } = params;

  const brand = await db.query.brands.findFirst({
    where: eq(schema.brands.id, brandId),
  });

  if (!brand) {
    throw data({}, { status: 404 });
  }

  return data({ brand }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, params, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;
  const { brandId } = params;

  try {
    const args = convertFormDataToObjectUnsafe(
      BrandFormSchema,
      await request.formData()
    );
    const { success, error } = BrandFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Brand validation failed", {
        adminId,
        brandId,
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

    const updatedBrand = await db
      .update(schema.brands)
      .set({ name: args.name })
      .where(eq(schema.brands.id, brandId))
      .returning()
      .then((result) => result[0]);

    logger.info("Brand updated", {
      adminId,
      brandId,
      brandName: updatedBrand?.name,
    });

    return data(
      {
        success: true,
        brand: updatedBrand,
        error: null,
        message: "Marka została zaktualizowana",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to update brand", { error, adminId, brandId });
    return data(
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

export default function AdminBrandsEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { brand } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isUpdating = fetcher.state === "submitting";

  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: brand.name,
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
    if (fetcher.data?.success) {
      navigate("/admin/brands");
    }
  }, [fetcher.data, navigate]);

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
            </FieldGroup>
          </FieldSet>
        </form>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/brands"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={BRAND_FORM_ID}
          disabled={isUpdating}
        >
          {isUpdating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz markę</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}

// ========================== ERRORS ==========================

export function ErrorBoundary({ error }: { error: Error }) {
  if (
    isRouteErrorResponse(error) &&
    error instanceof Response &&
    error.status === 404
  )
    return (
      // TODO: Add a error component
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
      </div>
    );

  return null;
}
