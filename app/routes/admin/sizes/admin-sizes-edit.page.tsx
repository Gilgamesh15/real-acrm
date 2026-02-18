import { SizeUpdateSchema } from "db/models/sizes.model";
import { CheckCircleIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { data, redirect } from "react-router";
import { toast } from "sonner";
import type z from "zod";

import { Button, buttonVariants } from "~/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";

import { api } from "~/api/api";
import {
  AdminPageActions,
  AdminPageContainer,
  AdminPageContent,
  AdminPageFooter,
  AdminPageHeader,
} from "~/components/features/admin-page-layout/admin-page-layout";
import { useAppForm } from "~/components/shared/form";
import {
  getPersistedDefaultValue,
  useFormPersistence,
} from "~/hooks/use-form-persistance";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-sizes-edit.page";

// ========================== LOADING ==========================

export async function loader({ params, context }: Route.LoaderArgs) {
  const { session } = context;

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const { slug } = params;

  const response = await api.sizes.bySlug.get({
    params: {
      slug,
    },
  });

  if (response.status !== 200) {
    throw data(response.body, { status: response.status });
  }

  const size = response.body.size;

  return data({ size }, { status: 200 });
}

// ========================== PAGE ==========================

export default function AdminSizesEditPage({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { slug } = params;
  const { size } = loaderData;

  const navigate = useNavigate();

  const formId = `size-form-${size.slug}`;
  const defaultValues = {
    name: size.name,
  } as z.infer<typeof SizeUpdateSchema>;

  const form = useAppForm({
    defaultValues: getPersistedDefaultValue(formId, defaultValues),
    validators: {
      onSubmit: SizeUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        api.sizes.bySlug.update({
          params: {
            slug,
          },
          body: {
            name: value.name,
          },
        }),
        {
          loading: "Trwa aktualizacja rozmiaru...",
          success: () => {
            navigate(`/admin/sizes`);
            return `Rozmiar została aktualizowana`;
          },
          error: "Wystąpił błąd podczas aktualizacji rozmiaru",
        }
      );
    },
  });

  useFormPersistence(formId, form, defaultValues);

  const isUpdating = form.state.isSubmitting;

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={formId} type="reset">
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
          id={formId}
        >
          <FieldSet>
            <FieldLegend>Informacje o rozmiarze</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa rozmiaru"
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
          to="/admin/sizes"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button size="sm" type="submit" form={formId} disabled={isUpdating}>
          {isUpdating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz rozmiar</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
