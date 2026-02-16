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
import { SizeFormSchema, type SizeFormSchemaType } from "~/lib/schemas";
import { cn, convertFormDataToObjectUnsafe, generateSlug } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-sizes-edit.page";

// ========================== LOADING ==========================

export async function loader({ params, context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const { sizeId } = params;

  const size = await db.query.sizes.findFirst({
    where: eq(schema.sizes.id, sizeId),
  });

  if (!size) {
    throw data({}, { status: 404 });
  }

  return data({ size }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, params, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;
  const { sizeId } = params;

  try {
    const args = convertFormDataToObjectUnsafe(
      SizeFormSchema,
      await request.formData()
    );
    const { success, error } = SizeFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Size validation failed", {
        adminId,
        sizeId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          size: null,
        },
        { status: 400 }
      );
    }

    const existingSlugs = await db.query.sizes.findMany({
      columns: { slug: true },
    });
    const slugs = existingSlugs.map((size) => size.slug);
    const newSlug = generateSlug(args.name, slugs);

    const updatedSize = await db
      .update(schema.sizes)
      .set({ name: args.name, slug: newSlug })
      .where(eq(schema.sizes.id, sizeId))
      .returning()
      .then((result) => result[0]);

    logger.info("Size updated", {
      adminId,
      sizeId,
      sizeName: updatedSize?.name,
    });

    return data(
      {
        success: true,
        size: updatedSize,
        error: null,
        message: "Rozmiar został zaktualizowany",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to update size", { error, adminId, sizeId });
    return data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        size: null,
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

const SIZE_FORM_ID = "size-form";

export default function AdminSizesEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { size } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isUpdating = fetcher.state === "submitting";

  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: size.name,
    } as SizeFormSchemaType,
    validators: {
      onSubmit: SizeFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(SizeFormSchema, value), {
        method: "post",
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate("/admin/sizes");
    }
  }, [fetcher.data, navigate]);

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={SIZE_FORM_ID} type="reset">
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
          id={SIZE_FORM_ID}
        >
          <FieldSet>
            <FieldLegend>Informacje o rozmiarze</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa rozmiaru"
                    description="Unikalwa nazwa rozmiaru, która będzie wyświetlana w sklepie"
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </form>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/sizes"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={SIZE_FORM_ID}
          disabled={isUpdating}
        >
          {isUpdating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz rozmiar</span>
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
