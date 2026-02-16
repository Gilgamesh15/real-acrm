import { BrandUpdateSchema } from "db/models/brands.model";
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
import { sessionContext } from "~/context/session-context.server";
import {
  getPersistedDefaultValue,
  useFormPersistence,
} from "~/hooks/use-form-persistance";
import { cn } from "~/lib/utils";

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

  const { slug } = params;

  const response = await api.brands.bySlug.get({
    params: {
      slug,
    },
  });

  if (response.status !== 200) {
    throw data(response.body, { status: response.status });
  }

  const brand = response.body.brand;

  return data({ brand }, { status: 200 });
}

// ========================== PAGE ==========================

export default function AdminBrandsEditPage({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { slug } = params;
  const { brand } = loaderData;

  const navigate = useNavigate();

  const formId = `brand-form-${brand.slug}`;
  const defaultValues = {
    name: brand.name,
  } as z.infer<typeof BrandUpdateSchema>;

  const form = useAppForm({
    defaultValues: getPersistedDefaultValue(formId, defaultValues),
    validators: {
      onSubmit: BrandUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        api.brands.bySlug.update({
          params: {
            slug,
          },
          body: {
            name: value.name,
          },
        }),
        {
          loading: "Trwa aktualizacja marki...",
          success: () => {
            navigate(`/admin/brands`);
            return `Marka została aktualizowana`;
          },
          error: "Wystąpił błąd podczas aktualizacji marki",
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

        <Button size="sm" type="submit" form={formId} disabled={isUpdating}>
          {isUpdating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz markę</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
