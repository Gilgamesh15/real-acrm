import * as schema from "db/schema";
import { asc, eq } from "drizzle-orm";
import { ChevronLeftIcon, PlusIcon } from "lucide-react";
import { Link, data, redirect, useFetcher } from "react-router";
import { toast } from "sonner";

import { buttonVariants } from "~/components/ui/button";

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
import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
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

  const brands = await db.query.brands.findMany({
    orderBy: asc(schema.brands.createdAt),
    with: {
      group: true,
    },
  });

  return data({ brands }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();

    const brandId = formData.get("brandId") as string | undefined;

    if (!brandId) {
      logger.warn("Brand delete failed - missing brandId", { adminId });
      throw data(
        {
          success: false,
          error: "ID marki jest wymagane",
          brand: null,
          message: "ID marki jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingBrand = await db.query.brands.findFirst({
      where: eq(schema.brands.id, brandId),
    });

    if (!existingBrand) {
      logger.warn("Brand delete failed - brand not found", {
        adminId,
        brandId,
      });
      throw data(
        {
          success: false,
          error: "Marka nie została znaleziona",
          brand: null,
          message: "Marka nie została znaleziona",
        },
        { status: 404 }
      );
    }

    const deletedBrand = await db
      .delete(schema.brands)
      .where(eq(schema.brands.id, brandId))
      .returning()
      .then((result) => result[0]);

    logger.info("Brand deleted", {
      adminId,
      brandId,
      brandName: deletedBrand?.name,
    });

    return data(
      {
        success: true,
        error: null,
        brand: deletedBrand,
        message: "Marka została usunięta",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to delete brand", { error, adminId });
    throw data(
      {
        success: false,
        error,
        brand: null,
        message: "Wystąpił nieoczekiwany błąd",
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
export type AdminBrandsDataTableMeta = {
  deleteBrand: (brandId: string) => void;
  isDeleting: boolean;
};

export default function AdminBrandsListPage({
  loaderData,
}: Route.ComponentProps) {
  const { brands } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isDeleting = fetcher.state === "submitting";

  const handleDeleteBrand = (brandId: string) => {
    if (isDeleting) return;

    fetcher.submit({
      brandId,
    });
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
