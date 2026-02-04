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
import { db } from "~/lib/db";
import { SizeFormSchema, type SizeFormSchemaType } from "~/lib/schemas";
import { cn, convertFormDataToObjectUnsafe } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-sizes-create.page";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const sizeGroups = await db.query.sizeGroups.findMany({});

  return data({ sizeGroups }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const args = convertFormDataToObjectUnsafe(
      SizeFormSchema,
      await request.formData()
    );

    const { success, error } = SizeFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Size validation failed", {
        adminId,
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

    const createdSize = await db
      .insert(schema.sizes)
      .values(args)
      .returning()
      .then((result) => result[0]);

    logger.info("Size created", {
      adminId,
      sizeId: createdSize?.id,
      sizeName: createdSize?.name,
    });

    return data(
      {
        success: true,
        size: createdSize,
        error: null,
        message: "Rozmiar został utworzony",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create size", { error, adminId });
    throw data(
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

export default function AdminSizesCreatePage({
  loaderData,
}: Route.ComponentProps) {
  const { sizeGroups } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      groupId: undefined,
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
      navigate(`/admin/rozmiary`);
    }
  }, [fetcher.data, navigate]);

  const isCreating = fetcher.state === "submitting";

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
              <form.AppField name="groupId">
                {(field) => (
                  <field.ComboboxField
                    label="Grupa rozmiarów"
                    description="Przypisanie rozmiaru do grupy ułatwi organizację i filtrowanie"
                    placeholder="Wybierz grupę rozmiarów"
                    searchPlaceholder="Wyszukaj grupę rozmiarów"
                    emptyStateMessage="Brak grup rozmiarów"
                    options={sizeGroups.map((sizeGroup) => ({
                      value: sizeGroup.id,
                      label: sizeGroup.name,
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
          to="/admin/rozmiary"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={SIZE_FORM_ID}
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz rozmiar</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
