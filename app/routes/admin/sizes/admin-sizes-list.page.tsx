import { ChevronLeftIcon, PlusIcon } from "lucide-react";
import React from "react";
import { Link, data, redirect, useRevalidator } from "react-router";
import { toast } from "sonner";

import { buttonVariants } from "~/components/ui/button";

import { api } from "~/api/api";
import {
  AdminPageActions,
  AdminPageContainer,
  AdminPageContent,
  AdminPageFooter,
  AdminPageHeader,
} from "~/components/features/admin-page-layout/admin-page-layout";
import {
  DataTableColumnToggle,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableProvider,
  DataTableRoot,
} from "~/components/shared/data-table";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-sizes-list.page";
import { columns, columnsConfig } from "./admin-sizes-list.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const { session } = context;

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const response = await api.sizes.get({
    query: {
      sortOrder: "asc",
      sortBy: "createdAt",
    },
  });

  if (response.status !== 200) {
    throw data(response.body, { status: response.status });
  }

  const sizes = response.body.sizes;

  return data({ sizes }, { status: 200 });
}

// ========================== PAGE ==========================
export type AdminSizesDataTableMeta = {
  deleteSize: (slug: string) => void;
  isDeleting: boolean;
};

export default function AdminSizesListPage({
  loaderData,
}: Route.ComponentProps) {
  const { sizes } = loaderData;
  const [isDeleting, setIsDeleting] = React.useState(false);
  const revalidator = useRevalidator();

  const handleDeleteSize = (slug: string) => {
    if (isDeleting) return;

    setIsDeleting(true);

    toast.promise(
      api.sizes.bySlug.delete({
        params: {
          slug,
        },
      }),
      {
        loading: "Trwa usuwanie rozmiaru...",
        success: () => {
          revalidator.revalidate();
          return "Rozmiar został usunięty";
        },
        error: "Wystąpił błąd podczas usuwania rozmiaru",
        finally: () => {
          setIsDeleting(false);
        },
      }
    );
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={sizes}
      meta={{
        deleteSize: handleDeleteSize,
        isDeleting,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/sizes/create"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Dodaj nowy rozmiar
            </Link>
          </AdminPageActions>
        </AdminPageHeader>
        <AdminPageContent>
          <DataTableRoot>
            <div className="flex items-center justify-between gap-2">
              <DataTableFilter />
              <DataTableColumnToggle />
            </div>
            <DataTableContent className="min-w-full" />
            <div className="flex justify-end"></div>
          </DataTableRoot>
        </AdminPageContent>

        <AdminPageFooter>
          <Link
            to="/admin/sizes"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ChevronLeftIcon />
            Powrót
          </Link>
          <DataTablePagination />
        </AdminPageFooter>
      </AdminPageContainer>
    </DataTableProvider>
  );
}
