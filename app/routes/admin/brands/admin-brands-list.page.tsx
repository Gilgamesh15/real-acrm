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
import { sessionContext } from "~/context/session-context.server";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-brands-list.page";
import { columns, columnsConfig } from "./admin-brands-list.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const response = await api.brands.get({
    query: {
      sortOrder: "asc",
      sortBy: "createdAt",
    },
  });

  if (response.status !== 200) {
    throw data(response.body, { status: response.status });
  }

  const brands = response.body.brands;

  return data({ brands }, { status: 200 });
}

// ========================== PAGE ==========================
export type AdminBrandsDataTableMeta = {
  deleteBrand: (slug: string) => void;
  isDeleting: boolean;
};

export default function AdminBrandsListPage({
  loaderData,
}: Route.ComponentProps) {
  const { brands } = loaderData;
  const [isDeleting, setIsDeleting] = React.useState(false);
  const revalidator = useRevalidator();

  const handleDeleteBrand = (slug: string) => {
    if (isDeleting) return;

    setIsDeleting(true);

    toast.promise(
      api.brands.bySlug.delete({
        params: {
          slug,
        },
      }),
      {
        loading: "Trwa usuwanie marki...",
        success: () => {
          revalidator.revalidate();
          return "Marka została usunięta";
        },
        error: "Wystąpił błąd podczas usuwania marki",
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
      data={brands}
      meta={{
        deleteBrand: handleDeleteBrand,
        isDeleting,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/brands/create"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Dodaj nową markę
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
            to="/admin/brands"
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
