import { asc, eq } from "drizzle-orm";
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
import { CategoryFormSchema, type CategoryFormSchemaType } from "~/lib/schemas";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";
import {
  cn,
  convertFormDataToObjectUnsafe,
  enrichWithPath,
  generateSlug,
} from "~/lib/utils";

import type { Route } from "./+types/admin-categories-create.page";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const categories = await db.query.categories.findMany({
    with: {
      image: true,
    },
    orderBy: asc(schema.categories.createdAt),
  });

  return data({ categories }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const args = convertFormDataToObjectUnsafe(
      CategoryFormSchema,
      await request.formData()
    );

    const { success, error } = CategoryFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Category validation failed", {
        adminId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          category: null,
        },
        { status: 400 }
      );
    }

    // Validate parent exists if provided
    if (args.parentId) {
      const parentCategory = await db.query.categories.findFirst({
        where: eq(schema.categories.id, args.parentId),
      });

      if (!parentCategory) {
        throw data(
          {
            success: false,
            message: "Kategoria nadrzędna nie została znaleziona",
            error: "Kategoria nadrzędna nie została znaleziona",
            category: null,
          },
          { status: 404 }
        );
      }
    }

    const existingSlugs = await db.query.categories.findMany({
      columns: { slug: true },
    });
    const slugs = existingSlugs.map((cat) => cat.slug);
    const slug = generateSlug(args.name, slugs);

    const category = await db.transaction(async (tx) => {
      const category = await tx
        .insert(schema.categories)
        .values({
          name: args.name,
          slug,
          path: [],
          parentId: args.parentId ?? undefined,
          featuredOrder: args.featuredOrder ?? -1,
        })
        .returning()
        .then((result) => result[0]!);

      if (args.image) {
        await tx.insert(schema.images).values({
          url: args.image.url,
          width: args.image.width,
          height: args.image.height,
          alt: args.image.alt,
          filename: args.image.filename,
          mimeType: args.image.mimeType,
          filesize: args.image.filesize,
          categoryId: category.id,
        });
      }

      // Fetch all categories
      const categories = await tx.query.categories.findMany({
        columns: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      });

      // Enrich with paths
      const enriched = enrichWithPath(categories);

      // Update each category with its computed path
      await Promise.all(
        enriched.map((category) =>
          tx
            .update(schema.categories)
            .set({ path: category.path })
            .where(eq(schema.categories.id, category.id))
        )
      );

      return category;
    });

    logger.info("Category created", {
      adminId,
      categoryId: category?.id,
      categoryName: category?.name,
    });

    return data(
      {
        success: true,
        category,
        error: null,
        message: "Kategoria została utworzona",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create category", { error, adminId });
    throw data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        category: null,
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

const CATEGORY_FORM_ID = "category-form";

export default function AdminCategoriesCreatePage({
  loaderData,
}: Route.ComponentProps) {
  const { categories } = loaderData;

  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      parentId: undefined,
      image: undefined,
      featuredOrder: -1,
    } as CategoryFormSchemaType,
    validators: {
      onSubmit: CategoryFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(CategoryFormSchema, value), {
        method: "post",
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate(`/admin/categories`);
    }
  }, [fetcher.data, navigate]);

  const isCreating = fetcher.state === "submitting";

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={CATEGORY_FORM_ID} type="reset">
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
          id={CATEGORY_FORM_ID}
        >
          <FieldSet>
            <FieldLegend>Informacje o kategorii</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa kategorii"
                    description="Nazwa kategorii, która będzie wyświetlana w sklepie i menu nawigacji"
                  />
                )}
              </form.AppField>

              <FieldSeparator>Struktura hierarchiczna</FieldSeparator>

              <form.AppField name="parentId">
                {(field) => (
                  <field.ComboboxField
                    label="Kategoria nadrzędna"
                    description="Opcjonalne przypisanie do kategorii nadrzędnej dla utworzenia hierarchii"
                    placeholder="Wybierz kategorię nadrzędną"
                    searchPlaceholder="Wyszukaj kategorię"
                    emptyStateMessage="Brak dostępnych kategorii"
                    options={categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                  />
                )}
              </form.AppField>

              <FieldSeparator>Pozycjonowanie</FieldSeparator>

              <form.AppField name="featuredOrder">
                {(field) => (
                  <field.NumberField
                    label="Kolejność wyróżnienia"
                    description="Ustaw kolejność wyświetlania kategorii w sekcji wyróżnionych. -1 oznacza brak wyróżnienia."
                    placeholder="-1"
                  />
                )}
              </form.AppField>

              <FieldSeparator>Grafika kategorii</FieldSeparator>

              <form.AppField name="image">
                {(field) => (
                  <field.ImageField
                    label="Obraz kategorii"
                    description="Reprezentacyjny obraz kategorii. Zalecane rozmiary: 400x400px lub większe (JPG, PNG, WebP)"
                    uploadPreset="categories"
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </form>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/categories"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={CATEGORY_FORM_ID}
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz kategorię</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
