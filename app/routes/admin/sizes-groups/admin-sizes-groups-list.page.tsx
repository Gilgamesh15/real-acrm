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

import type { Route } from "./+types/admin-sizes-groups-list.page";
import { columns, columnsConfig } from "./admin-sizes-groups-list.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const sizeGroups = await db.query.sizeGroups.findMany({
    orderBy: asc(schema.sizeGroups.createdAt),
  });

  return data({ sizeGroups }, { status: 200 });
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
    const sizeGroupId = formData.get("sizeGroupId") as string | undefined;

    if (!sizeGroupId) {
      logger.warn("Size group delete failed - missing sizeGroupId", { adminId });
      throw data(
        {
          success: false,
          error: "ID grupy rozmiarów jest wymagane",
          sizeGroup: null,
          message: "ID grupy rozmiarów jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingSizeGroup = await db.query.sizeGroups.findFirst({
      where: eq(schema.sizeGroups.id, sizeGroupId),
    });
    if (!existingSizeGroup) {
      logger.warn("Size group delete failed - not found", { adminId, sizeGroupId });
      throw data(
        {
          success: false,
          error: "Grupa rozmiarów nie została znaleziona",
          sizeGroup: null,
          message: "Grupa rozmiarów nie została znaleziona",
        },
        { status: 404 }
      );
    }

    const deletedSizeGroup = await db
      .delete(schema.sizeGroups)
      .where(eq(schema.sizeGroups.id, sizeGroupId))
      .returning()
      .then((result) => result[0]);

    logger.info("Size group deleted", {
      adminId,
      sizeGroupId,
      sizeGroupName: deletedSizeGroup?.name,
    });

    return data(
      {
        success: true,
        error: null,
        sizeGroup: deletedSizeGroup,
        message: "Grupa rozmiarów została usunięta",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to delete size group", { error, adminId });
    throw data(
      {
        success: false,
        error,
        sizeGroup: null,
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
export type AdminSizeGroupsDataTableMeta = {
  deleteSizeGroup: (sizeGroupId: string) => void;
  isDeleting: boolean;
};

export default function AdminSizeGroupsListPage({
  loaderData,
}: Route.ComponentProps) {
  const { sizeGroups } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isDeleting = fetcher.state === "submitting";

  const handleDeleteSizeGroup = (sizeGroupId: string) => {
    if (isDeleting) return;

    fetcher.submit({
      intent: Intent.DELETE,
      sizeGroupId,
    });
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={sizeGroups}
      meta={{
        deleteSizeGroup: handleDeleteSizeGroup,
        isDeleting,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/rozmiary-grupy/utworz"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Dodaj nową grupę rozmiarów
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
            to="/admin/rozmiary-grupy"
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
