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
import { TagFormSchema, type TagFormSchemaType } from "~/lib/schemas";
import { cn, convertFormDataToObjectUnsafe, generateSlug } from "~/lib/utils";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";

import type { Route } from "./+types/admin-tags-create.page";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
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
      TagFormSchema,
      await request.formData()
    );

    const { success, error } = TagFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Tag validation failed", {
        adminId,
        errors: error.issues.map((i) => i.message),
      });
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

    const createdTag = await db.transaction(async (tx) => {
      const createdTag = await tx
        .insert(schema.tags)
        .values({
          ...args,
          featuredOrder: args.featuredOrder ?? -1,
          slug,
        })
        .returning()
        .then((result) => result[0]);

      if (args.image) {
        await tx.insert(schema.images).values({
          url: args.image.url,
          width: args.image.width,
          height: args.image.height,
          alt: args.image.alt,
          filename: args.image.filename,
          mimeType: args.image.mimeType,
          filesize: args.image.filesize,
          tagId: createdTag!.id,
          displayOrder: -1,
        });
      }

      return createdTag;
    });

    logger.info("Tag created", {
      adminId,
      tagId: createdTag?.id,
      tagName: createdTag?.name,
    });

    return data(
      {
        success: true,
        tag: createdTag,
        error: null,
        message: "Tag został utworzony",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create tag", { error, adminId });
    throw data(
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

export default function AdminTagsCreatePage() {
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      image: undefined,
      featuredOrder: -1,
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
      navigate(`/admin/tags`);
    }
  }, [fetcher.data, navigate]);

  const isCreating = fetcher.state === "submitting";

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
                    label="Nazwa tagu"
                    description="Unikalwa nazwa tagu, która będzie wyświetlana w sklepie"
                  />
                )}
              </form.AppField>

              <FieldSeparator>Grafika tagu</FieldSeparator>

              <form.AppField name="image">
                {(field) => (
                  <field.ImageField
                    label="Obraz tagu"
                    description="Opcjonalny obraz reprezentujący tag. Obsługiwane formaty: JPG, PNG, WebP (maksymalnie 2MB)"
                    uploadPreset="categories"
                  />
                )}
              </form.AppField>

              <form.AppField name="featuredOrder">
                {(field) => (
                  <field.NumberField
                    label="Kolejność wyświetlania na stronie głównej"
                    description="Określa kolejność wyświetlania tagu w interfejsie użytkownika. Niższa wartość oznacza wyższą pozycję"
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
          to="/admin/tags"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={TAG_FORM_ID}
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
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
