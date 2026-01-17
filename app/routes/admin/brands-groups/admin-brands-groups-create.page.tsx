import { CheckCircleIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react";
import React from "react";
import { Link, useFetcher, useNavigate } from "react-router";
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

import type { Route } from "./+types/admin-brands-groups-create.page";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  return data({}, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const args = convertFormDataToObjectUnsafe(
      BrandGroupFormSchema,
      await request.formData()
    );

    const { success, error } = BrandGroupFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Brand group validation failed", {
        adminId,
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

    const createdBrandGroup = await db
      .insert(schema.brandGroups)
      .values({
        ...args,
        slug,
      })
      .returning()
      .then((result) => result[0]);

    logger.info("Brand group created", {
      adminId,
      brandGroupId: createdBrandGroup?.id,
      brandGroupName: createdBrandGroup?.name,
    });

    return data(
      {
        success: true,
        brandGroup: createdBrandGroup,
        error: null,
        message: "Grupa marki została utworzona",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create brand group", { error, adminId });
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

export default function AdminBrandGroupsCreatePage() {
  const fetcher = useFetcher<typeof action>();

  const isCreating = fetcher.state === "submitting";

  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      displayOrder: 0,
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
                    label="Nazwa grupy"
                    description="Nazwa grupy marek, która pomoże w organizacji i kategoryzacji"
                  />
                )}
              </form.AppField>

              <FieldSeparator>Ustawienia wyświetlania</FieldSeparator>

              <form.AppField name="displayOrder">
                {(field) => (
                  <field.NumberField
                    label="Kolejność wyświetlania"
                    description="Niższe wartości będą wyświetlane wyżej w liście (0 = pierwsza pozycja)"
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
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz grupę marki</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
