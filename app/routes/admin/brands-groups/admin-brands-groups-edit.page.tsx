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
import {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "~/components/ui/field";
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
import {
  BrandGroupFormSchema,
  type BrandGroupFormSchemaType,
} from "~/lib/schemas";
import { cn, convertFormDataToObjectUnsafe, generateSlug } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-brands-groups-edit.page";

// ========================== LOADING ==========================

export async function loader({ context, params }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const { brandGroupId } = params;

  const brandGroup = await db.query.brandGroups.findFirst({
    where: eq(schema.brandGroups.id, brandGroupId),
  });

  if (!brandGroup) {
    throw data({}, { status: 404 });
  }

  return data({ brandGroup }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, params, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;
  const { brandGroupId } = params;

  try {
    const args = convertFormDataToObjectUnsafe(
      BrandGroupFormSchema,
      await request.formData()
    );
    const { success, error } = BrandGroupFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Brand group validation failed", {
        adminId,
        brandGroupId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          brandGroup: null,
        },
        { status: 400 }
      );
    }

    const existingSlugs = await db.query.brandGroups.findMany({
      columns: { slug: true },
    });
    const slugs = existingSlugs.map((brandGroup) => brandGroup.slug);
    const slug = generateSlug(args.name, slugs);

    const updatedBrandGroup = await db
      .update(schema.brandGroups)
      .set({
        ...args,
        slug,
      })
      .where(eq(schema.brandGroups.id, brandGroupId))
      .returning()
      .then((result) => result[0]);

    logger.info("Brand group updated", {
      adminId,
      brandGroupId,
      brandGroupName: updatedBrandGroup?.name,
    });

    return data(
      {
        success: true,
        brandGroup: updatedBrandGroup,
        error: null,
        message: "Grupa marki została zaktualizowana",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to update brand group", { error, adminId, brandGroupId });
    throw data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        brandGroup: null,
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

const BRAND_GROUP_FORM_ID = "brand-group-form";

export default function AdminBrandGroupsEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { brandGroup } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isUpdating = fetcher.state === "submitting";

  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: brandGroup.name,
      displayOrder: brandGroup.displayOrder,
    } as BrandGroupFormSchemaType,
    validators: {
      onSubmit: BrandGroupFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(
        convertObjectToFormDataUnsafe(BrandGroupFormSchema, value),
        {
          method: "post",
        }
      );
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate(`/admin/marki-grupy`);
    }
  }, [fetcher.data, navigate]);

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={BRAND_GROUP_FORM_ID} type="reset">
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
          id={BRAND_GROUP_FORM_ID}
        >
          <FieldSet>
            <FieldLegend>Konfiguracja grupy marek</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa"
                    description="Nazwa grupy marek używana do organizacji i kategoryzacji marek w systemie"
                  />
                )}
              </form.AppField>

              <FieldSeparator>
                <p className="text-sm text-muted-foreground">
                  Ustawienia wyświetlania
                </p>
              </FieldSeparator>

              <form.AppField name="displayOrder">
                {(field) => (
                  <field.NumberField
                    label="Kolejność wyświetlania"
                    description="Określa kolejność wyświetlania tej grupy marek w interfejsie użytkownika. Niższa wartość oznacza wyższą pozycję"
                    min={0}
                    stepper={1}
                    decimalScale={0}
                    placeholder="0"
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </form>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/marki-grupy"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={BRAND_GROUP_FORM_ID}
          disabled={isUpdating}
        >
          {isUpdating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz grupę marki</span>
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
