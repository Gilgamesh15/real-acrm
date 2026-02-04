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
import { TagFormSchema, type TagFormSchemaType } from "~/lib/schemas";
import { cn, convertFormDataToObjectUnsafe, generateSlug } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-tags-edit.page";

// ========================== LOADING ==========================

export async function loader({ params, context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const { tagId } = params;

  const tag = await db.query.tags.findFirst({
    where: eq(schema.tags.id, tagId),
    with: {
      image: true,
    },
  });

  if (!tag) {
    throw data({}, { status: 404 });
  }

  return data({ tag }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, params, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const { tagId } = params;

  try {
    const args = convertFormDataToObjectUnsafe(
      TagFormSchema,
      await request.formData()
    );
    const { success, error } = TagFormSchema.safeParse(args);
    if (!success) {
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          tag: null,
        },
        { status: 400 }
      );
    }

    const existingSlugs = await db.query.tags.findMany({
      columns: { slug: true },
    });
    const slugs = existingSlugs.map((tag) => tag.slug);
    const slug = generateSlug(args.name, slugs);

    const updatedTag = await db.transaction(async (tx) => {
      const updatedTag = await tx
        .update(schema.tags)
        .set({
          name: args.name,
          slug,
          featuredOrder: args.featuredOrder ?? -1,
        })
        .where(eq(schema.tags.id, tagId))
        .returning()
        .then((result) => result[0]);

      if (args.image) {
        await tx.delete(schema.images).where(eq(schema.images.tagId, tagId));

        await tx.insert(schema.images).values({
          url: args.image.url,
          width: args.image.width,
          height: args.image.height,
          alt: args.image.alt,
          filename: args.image.filename,
          mimeType: args.image.mimeType,
          filesize: args.image.filesize,
          tagId,
        });
      }

      return updatedTag;
    });

    return data(
      {
        success: true,
        tag: updatedTag,
        error: null,
        message: "Tag został zaktualizowany",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Unexpected error in tag edit action:", { error });
    return data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        tag: null,
      },
      { status: 500 }
    );
  }
}

// ========================== PAGE ==========================

const TAG_FORM_ID = "tag-form";

export default function AdminTagsEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { tag } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isUpdating = fetcher.state === "submitting";

  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: tag.name,
      image: tag.image,
      featuredOrder: tag.featuredOrder,
    } as TagFormSchemaType,
    validators: {
      onSubmit: TagFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(TagFormSchema, value), {
        method: "post",
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate("/admin/tagi");
    }
  }, [fetcher.data, navigate]);

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={TAG_FORM_ID} type="reset">
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
          id={TAG_FORM_ID}
        >
          <FieldSet>
            <FieldLegend>Informacje o tagu</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa"
                    description="Unikalwa nazwa tagu, która będzie wyświetlana w sklepie"
                  />
                )}
              </form.AppField>

              <form.AppField name="featuredOrder">
                {(field) => (
                  <field.NumberField
                    label="Kolejność wyświetlania na stronie głównej  "
                    description="Określa kolejność wyświetlania tagu w interfejsie użytkownika. Niższa wartość oznacza wyższą pozycję"
                    min={0}
                    stepper={1}
                    decimalScale={0}
                    placeholder="0"
                  />
                )}
              </form.AppField>

              <FieldSeparator>Grafika tagu</FieldSeparator>

              <form.AppField name="image">
                {(field) => (
                  <field.ImageField
                    label="Obraz"
                    description="Wybierz obraz reprezentujący ten tag. Preferowane rozmiary: 400x400px lub wyższe"
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
          to="/admin/tagi"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={TAG_FORM_ID}
          disabled={isUpdating}
        >
          {isUpdating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz tag</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
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

// ========================== ERRORS ==========================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (
    isRouteErrorResponse(error) &&
    error instanceof Response &&
    error.status === 404
  )
    return (
      // TODO: Add a error component
      <div>
        <h1>Error</h1>
      </div>
    );

  return null;
}
