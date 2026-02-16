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

import type { Route } from "./+types/admin-sizes-list.page";
import { columns, columnsConfig } from "./admin-sizes-list.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const sizes = await db.query.sizes.findMany({
    orderBy: asc(schema.sizes.createdAt),
  });

  return data({ sizes }, { status: 200 });
}

export const HydrateFallback = () => {
  // TODO: Add a loading skeleton
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
};

// ========================== ACTIONS ==========================

enum Intent {
  DELETE = "delete",
}

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();
    const sizeId = formData.get("sizeId") as string | undefined;

    if (!sizeId) {
      logger.warn("Size delete failed - missing sizeId", { adminId });
      throw data(
        {
          success: false,
          error: "ID rozmiaru jest wymagane",
          size: null,
          message: "ID rozmiaru jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingSize = await db.query.sizes.findFirst({
      where: eq(schema.sizes.id, sizeId),
    });

    if (!existingSize) {
      logger.warn("Size delete failed - not found", { adminId, sizeId });
      throw data(
        {
          success: false,
          error: "Rozmiar nie został znaleziony",
          size: null,
          message: "Rozmiar nie został znaleziony",
        },
        { status: 404 }
      );
    }

    const deletedSize = await db
      .delete(schema.sizes)
      .where(eq(schema.sizes.id, sizeId))
      .returning()
      .then((result) => result[0]);

    logger.info("Size deleted", {
      adminId,
      sizeId,
      sizeName: deletedSize?.name,
    });

    return data(
      {
        success: true,
        error: null,
        size: deletedSize,
        message: "Rozmiar został usunięty",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to delete size", { error, adminId });
    return data(
      {
        success: false,
        error: "Wystąpił nieoczekiwany błąd",
        size: null,
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
export type AdminSizesDataTableMeta = {
  deleteSize: (sizeId: string) => void;
  isDeleting: boolean;
};

export default function AdminSizesListPage({
  loaderData,
}: Route.ComponentProps) {
  const { sizes } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isDeleting = fetcher.state === "submitting";

  const handleDeleteSize = (sizeId: string) => {
    if (isDeleting) return;

    toast.promise(
      fetcher.submit(
        {
          intent: Intent.DELETE,
          sizeId,
        },
        { method: "post" }
      )
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
