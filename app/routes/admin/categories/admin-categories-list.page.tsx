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
import { db } from "~/lib/db";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-categories-list.page";
import { columns, columnsConfig } from "./admin-categories-list.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const { session } = context;

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
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
  const { logger } = context;
  const { session } = context;
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();

    const categoryId = formData.get("categoryId") as string | undefined;

    if (!categoryId) {
      logger.warn("Category delete failed - missing categoryId", { adminId });
      throw data(
        {
          success: false,
          error: "ID kategorii jest wymagane",
          category: null,
          message: "ID kategorii jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingCategory = await db.query.categories.findFirst({
      where: eq(schema.categories.id, categoryId),
    });
    if (!existingCategory) {
      logger.warn("Category delete failed - not found", {
        adminId,
        categoryId,
      });
      throw data(
        {
          success: false,
          error: "Kategoria nie została znaleziona",
          category: null,
          message: "Kategoria nie została znaleziona",
        },
        { status: 404 }
      );
    }

    const deletedCategory = await db
      .delete(schema.categories)
      .where(eq(schema.categories.id, categoryId))
      .returning()
      .then((result) => result[0]);

    logger.info("Category deleted", {
      adminId,
      categoryId,
      categoryName: deletedCategory?.name,
    });

    return data(
      {
        success: true,
        error: null,
        category: deletedCategory,
        message: "Kategoria została usunięta",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to delete category", { error, adminId });
    throw data(
      {
        success: false,
        error,
        category: null,
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
export type AdminCategoriesDataTableMeta = {
  deleteCategory: (categoryId: string) => void;
  isDeleting: boolean;
};

export default function AdminCategoriesListPage({
  loaderData,
}: Route.ComponentProps) {
  const { categories } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isDeleting = fetcher.state === "submitting";

  const handleDeleteCategory = (categoryId: string) => {
    if (isDeleting) return;

    fetcher.submit({
      categoryId,
    });
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={categories}
      meta={{
        deleteCategory: handleDeleteCategory,
        isDeleting,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/categories/create"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Dodaj nową kategorię
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
            to="/admin/categories"
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
