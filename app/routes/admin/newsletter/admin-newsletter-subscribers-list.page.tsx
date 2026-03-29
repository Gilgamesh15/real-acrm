import { ChevronLeftIcon } from "lucide-react";
import { Link, data, redirect } from "react-router";

import { buttonVariants } from "~/components/ui/button";

import { api } from "~/api/api";
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
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-newsletter-subscribers-list.page";
import { columns, columnsConfig } from "./admin-newsletter-subscribers.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const { session } = context;

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const response = await api.newsletter.get({
    query: { limit: 1000, offset: 0, sortBy: "createdAt", sortOrder: "desc" },
  });

  if (response.status !== 200) {
    throw data(response.body, { status: response.status });
  }

  return data({ subscribers: response.body.subscribers }, { status: 200 });
}

// ========================== PAGE ==========================

export default function AdminNewsletterSubscribersListPage({
  loaderData,
}: Route.ComponentProps) {
  const { subscribers } = loaderData;

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={subscribers}
    >
      <AdminPageContainer>
        <AdminPageHeader />
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
