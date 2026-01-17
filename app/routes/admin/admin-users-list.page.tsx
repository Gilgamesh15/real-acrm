import * as schema from "db/schema";
import { asc } from "drizzle-orm";
import { ChevronLeftIcon } from "lucide-react";
import { Link, redirect } from "react-router";

import { buttonVariants } from "~/components/ui/button";

import {
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
import { db } from "~/lib/db";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-users-list.page";
import { columns, columnsConfig } from "./admin-users.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    return redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    return redirect("/");
  }

  const users = await db.query.users.findMany({
    orderBy: asc(schema.users.createdAt),
  });

  return { users };
}

export const HydrateFallback = () => {
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
};

// ========================== PAGE ==========================

export default function AdminUsersListPage({
  loaderData,
}: Route.ComponentProps) {
  const { users } = loaderData;

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={users}
    >
      <AdminPageContainer>
        <AdminPageHeader></AdminPageHeader>
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
            to="/admin"
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
