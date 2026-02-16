import * as schema from "db/schema";
import { returnService } from "db/services/return.service";
import { asc } from "drizzle-orm";
import { ChevronLeftIcon } from "lucide-react";
import { Link, redirect } from "react-router";

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
import { auth } from "~/lib/auth.server";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-returns-list.page";
import { columns, columnsConfig } from "./admin-returns.columns";

// ========================== LOADING ==========================

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    return redirect("/");
  }

  const returns = await returnService.findMany({
    orderBy: asc(schema.returns.createdAt),
  });

  return { returns };
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

// ========================== PAGE ==========================

export default function AdminReturnsListPage({
  loaderData,
}: Route.ComponentProps) {
  const { returns } = loaderData;

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={returns}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            {/* Returns don't have a create page, so no create action needed */}
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
            to="/admin/returns"
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
