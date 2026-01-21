import * as schema from "db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { ChevronLeftIcon } from "lucide-react";
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
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { cn, orderStatusFromOrder } from "~/lib/utils";

import type { Route } from "./+types/admin-orders-list.page";
import { columns, columnsConfig } from "./admin-orders.columns";

// ========================== LOADING ==========================

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.isAnonymous) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin", {
      status: 302,
    });
  }

  if (session.user.role !== "admin") {
    throw redirect("/", {
      status: 302,
    });
  }

  const orders = await db.query.orders.findMany({
    with: {
      events: {
        orderBy: desc(schema.orderTimelineEvents.timestamp),
      },
    },
    orderBy: asc(schema.orders.createdAt),
  });

  return { orders };
}
// ========================== ACTIONS ==========================

enum Intent {
  MARK_IN_TRANSIT = "markInTransit",
  MARK_DELIVERED = "markDelivered",
}

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const orderId = formData.get("orderId") as string;

    switch (intent) {
      case Intent.MARK_IN_TRANSIT: {
        const order = await db.query.orders.findFirst({
          where: eq(schema.orders.id, orderId),
          with: {
            events: {
              orderBy: desc(schema.orderTimelineEvents.timestamp),
              limit: 1,
            },
          },
        });

        if (!order) {
          logger.warn("Order status update failed - not found", {
            adminId,
            orderId,
          });
          return data(
            { success: false, message: "Zamówienie nie znalezione" },
            { status: 404 }
          );
        }

        if (orderStatusFromOrder(order) !== "processing") {
          logger.warn("Order status update failed - invalid status", {
            adminId,
            orderId,
            currentStatus: orderStatusFromOrder(order),
          });
          return data(
            {
              success: false,
              message: "Zamówienie nie jest w stanie do przetworzenia",
            },
            { status: 400 }
          );
        }

        await db.insert(schema.orderTimelineEvents).values({
          orderId,
          status: "in_transit",
        });

        logger.info("Order marked as in transit", { adminId, orderId });

        return data(
          {
            success: true,
            message: "Zamówienie zostało oznaczone jako w transporcie",
          },
          { status: 200 }
        );
      }
      case Intent.MARK_DELIVERED: {
        const order = await db.query.orders.findFirst({
          where: eq(schema.orders.id, orderId),
          with: {
            events: {
              orderBy: desc(schema.orderTimelineEvents.timestamp),
              limit: 1,
            },
          },
        });

        if (!order) {
          logger.warn("Order status update failed - not found", {
            adminId,
            orderId,
          });
          return data(
            { success: false, message: "Zamówienie nie znalezione" },
            { status: 404 }
          );
        }

        if (orderStatusFromOrder(order) !== "in_transit") {
          logger.warn("Order status update failed - invalid status", {
            adminId,
            orderId,
            currentStatus: orderStatusFromOrder(order),
          });
          return data(
            {
              success: false,
              message: "Zamówienie nie jest w stanie do przetworzenia",
            },
            { status: 400 }
          );
        }

        await db.insert(schema.orderTimelineEvents).values({
          orderId,
          status: "delivered",
        });

        logger.info("Order marked as delivered", { adminId, orderId });

        return data(
          {
            success: true,
            message: "Zamówienie zostało oznaczone jako dostarczone",
          },
          { status: 200 }
        );
      }
      default:
        logger.warn("Order action failed - unknown intent", {
          adminId,
          orderId,
          intent,
        });
        return data(
          { success: false, message: "Nieznana akcja" },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Order action failed", { error, adminId });
    return data(
      { success: false, message: "Wystąpił nieoczekiwany błąd" },
      { status: 500 }
    );
  }
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const result = await serverAction();

  if (!result.success) {
    toast.error(result.message);
  } else {
    toast.success(result.message);
  }

  return result;
}

// ========================== PAGE ==========================

export type AdminOrdersDataTableMeta = {
  markInTransit: (orderId: string) => void;
  markDelivered: (orderId: string) => void;
  isMarkingInTransit: boolean;
  isMarkingDelivered: boolean;
};

export default function AdminOrdersListPage({
  loaderData,
}: Route.ComponentProps) {
  const { orders } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isMarkingInTransit =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === Intent.MARK_IN_TRANSIT;
  const isMarkingDelivered =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === Intent.MARK_DELIVERED;

  const handleMarkInTransit = (orderId: string) => {
    if (isMarkingInTransit) return;

    fetcher.submit(
      {
        intent: Intent.MARK_IN_TRANSIT,
        orderId,
      },
      { method: "post" }
    );
  };

  const handleMarkDelivered = (orderId: string) => {
    if (isMarkingDelivered) return;

    fetcher.submit(
      {
        intent: Intent.MARK_DELIVERED,
        orderId,
      },
      { method: "post" }
    );
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={orders}
      meta={{
        markInTransit: handleMarkInTransit,
        markDelivered: handleMarkDelivered,
        isMarkingInTransit,
        isMarkingDelivered,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions></AdminPageActions>
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
