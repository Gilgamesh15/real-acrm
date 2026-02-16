import { SizeCreateSchema } from "db/models/sizes.model";
import { CheckCircleIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { redirect } from "react-router";
import { data } from "react-router";
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
import { auth } from "~/lib/auth.server";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-sizes-create.page";

// ========================== LOADING ==========================

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.isAnonymous) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  return data({}, { status: 200 });
}

// ========================== PAGE ==========================

const formId = "size-form";

const defaultValues = {
  name: "",
  groupId: undefined,
} as z.infer<typeof SizeCreateSchema>;

export default function AdminSizesCreatePage() {
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: getPersistedDefaultValue(formId, defaultValues),
    validators: {
      onSubmit: SizeCreateSchema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        api.sizes.create({
          body: {
            name: value.name,
          },
        }),
        {
          loading: "Trwa tworzenie rozmiaru...",
          success: () => {
            localStorage.removeItem(formId);
            navigate(`/admin/sizes`);
            return `Rozmiar został utworzony`;
          },
          error: (error) => {
            return error.message;
          },
        }
      );
    },
  });

  useFormPersistence(formId, form, defaultValues);

  const isCreating = form.state.isSubmitting;

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

        <Button size="sm" type="submit" form={formId} disabled={isCreating}>
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz rozmiar</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
