import * as schema from "db/schema";
import { desc } from "drizzle-orm";
import { ChevronLeftIcon, PlusIcon } from "lucide-react";
import { Link, data, redirect } from "react-router";

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
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-discount-codes-list.page";
import { columns, columnsConfig } from "./admin-discount-codes.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const discountCodes = await db.query.promotionCodes.findMany({
    orderBy: desc(schema.promotionCodes.createdAt),
  });

  return data({ discountCodes }, { status: 200 });
}

// ========================== ACTIONS ==========================

// ========================== PAGE ==========================

export default function AdminDiscountCodesListPage({
  loaderData,
}: Route.ComponentProps) {
  const { discountCodes } = loaderData;

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={discountCodes}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/discount-codes/create"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Utwórz kod promocyjny
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
          </DataTableRoot>
        </AdminPageContent>

        <AdminPageFooter>
          <Link
            to="/admin/discount-codes"
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
