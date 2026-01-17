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

import type { Route } from "./+types/admin-brands-groups-list.page";
import { columns, columnsConfig } from "./admin-brands-groups-list.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const brandGroups = await db.query.brandGroups.findMany({
    orderBy: asc(schema.brandGroups.createdAt),
  });

  return data({ brandGroups }, { status: 200 });
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

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();
    const brandGroupId = formData.get("brandGroupId") as string | undefined;

    if (!brandGroupId) {
      logger.warn("Brand group delete failed - missing brandGroupId", { adminId });
      throw data(
        {
          success: false,
          error: "ID grupy marki jest wymagane",
          brandGroup: null,
          message: "ID grupy marki jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingBrandGroup = await db.query.brandGroups.findFirst({
      where: eq(schema.brandGroups.id, brandGroupId),
    });
    if (!existingBrandGroup) {
      logger.warn("Brand group delete failed - not found", { adminId, brandGroupId });
      throw data(
        {
          success: false,
          error: "Grupa marki nie została znaleziona",
          brandGroup: null,
          message: "Grupa marki nie została znaleziona",
        },
        { status: 404 }
      );
    }

    const deletedBrandGroup = await db
      .delete(schema.brandGroups)
      .where(eq(schema.brandGroups.id, brandGroupId))
      .returning()
      .then((result) => result[0]);

    logger.info("Brand group deleted", {
      adminId,
      brandGroupId,
      brandGroupName: deletedBrandGroup?.name,
    });

    return data(
      {
        success: true,
        error: null,
        brandGroup: deletedBrandGroup,
        message: "Grupa marki została usunięta",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to delete brand group", { error, adminId });
    throw data(
      {
        success: false,
        error,
        brandGroup: null,
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
export type AdminBrandGroupsDataTableMeta = {
  deleteBrandGroup: (brandGroupId: string) => void;
  isDeleting: boolean;
};

export default function AdminBrandGroupsListPage({
  loaderData,
}: Route.ComponentProps) {
  const { brandGroups } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isDeleting = fetcher.state === "submitting";

  const handleDeleteBrandGroup = (brandGroupId: string) => {
    if (isDeleting) return;

    fetcher.submit({
      brandGroupId,
    });
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={brandGroups}
      meta={{
        deleteBrandGroup: handleDeleteBrandGroup,
        isDeleting,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/marki-grupy/utworz"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Dodaj nową grupę marki
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
            to="/admin/marki-grupy"
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
