import * as schema from "db/schema";
import { desc, eq } from "drizzle-orm";
import { CheckIcon, MoreHorizontal, Truck } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Link, data, redirect, useFetcher } from "react-router";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";

import {
  AdminPageActions,
  AdminPageContainer,
  AdminPageContent,
  AdminPageFooter,
  AdminPageHeader,
} from "~/components/features/admin-page-layout/admin-page-layout";
import { OrderData } from "~/components/features/order-data/order-data";
import { PriceSummary } from "~/components/features/price-summary/price-summary";
import { OrderTimeline } from "~/components/features/timeline/order-timeline";
import {
  ActionDialog,
  ActionDialogTrigger,
  ConfirmActionDialogContent,
} from "~/components/shared/action-dialog/action-dialog";
import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { useDialogState } from "~/hooks/use-dialog-state";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { calculateProductPrice, formatDate, priceFromGrosz } from "~/lib/utils";
import { cn } from "~/lib/utils";
import { orderDetailsFromOrder, orderStatusFromOrder } from "~/lib/utils";

import type { Route } from "./+types/admin-orders-detail.page";

// ========================== LOADING ==========================

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    return redirect("/");
  }

  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, params.orderId),
    with: {
      events: {
        orderBy: desc(schema.orderTimelineEvents.timestamp),
      },
      items: {
        with: {
          product: {
            with: {
              images: true,
              pieces: {
                with: {
                  images: true,
                },
              },
            },
          },
          piece: {
            with: {
              images: true,
              brand: true,
              size: true,
              measurements: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw data(null, { status: 404 });
  }

  return { order };
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
          { success: true, message: "Zamówienie oznaczone jako w transporcie" },
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
          { success: true, message: "Zamówienie oznaczone jako dostarczone" },
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
    return data({ success: false, message: "Wystąpił błąd" }, { status: 500 });
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

export default function OrderDetailPage({ loaderData }: Route.ComponentProps) {
  const { order } = loaderData;
  const [open, setOpen] = useDialogState<Intent>(null);

  const fetcher = useFetcher<typeof action>();
  const isLoading = fetcher.state === "submitting";

  const handleMarkInTransit = () => {
    const formData = new FormData();
    formData.append("orderId", order.id);
    formData.append("intent", Intent.MARK_IN_TRANSIT);

    toast.promise(
      async () => {
        fetcher.submit(formData, { method: "post" });
      },
      {
        loading: "Oznaczanie jako w transporcie...",
        success: () => {
          setOpen(null);
          return "Oznaczono jako w transporcie";
        },
        error: (error) => {
          console.error("Wystąpił błąd", error);
          return "Wystąpił błąd";
        },
      }
    );
  };

  const handleMarkDelivered = () => {
    const formData = new FormData();
    formData.append("orderId", order.id);
    formData.append("intent", Intent.MARK_DELIVERED);

    toast.promise(
      async () => {
        fetcher.submit(formData, { method: "post" });
      },
      {
        loading: "Oznaczanie jako dostarczone...",
        success: () => {
          setOpen(null);
          return "Oznaczono jako dostarczone";
        },
        error: (error) => {
          console.error("Wystąpił błąd", error);
          return "Wystąpił błąd";
        },
      }
    );
  };

  const products = order.items
    .map((item) => item.product)
    .filter((product) => product !== null);
  const pieces = order.items
    .map((item) => item.piece)
    .filter((piece) => piece !== null);

  const priceSummary = {
    subtotal: priceFromGrosz(order.subtotalInGrosz),
    total: priceFromGrosz(order.totalInGrosz),
    items: [
      ...products.map((product) => ({
        id: product.id,
        name: product.name,
        price: priceFromGrosz(calculateProductPrice(product).lineTotalInGrosz),
      })),
      ...pieces.map((piece) => ({
        id: piece.id,
        name: piece.name,
        price: priceFromGrosz(piece.priceInGrosz),
      })),
    ],
  };

  const orderDetails = orderDetailsFromOrder(order);
  const orderStatus = orderStatusFromOrder(order);

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <ActionDialog
            open={open}
            setOpen={setOpen}
            loading={isLoading ? open : null}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {orderStatus === "processing" && (
                  <ActionDialogTrigger action={Intent.MARK_IN_TRANSIT} asChild>
                    <DropdownMenuItem>
                      <Truck />
                      Oznacz jako w transporcie
                    </DropdownMenuItem>
                  </ActionDialogTrigger>
                )}
                {orderStatus === "in_transit" && (
                  <ActionDialogTrigger action={Intent.MARK_DELIVERED} asChild>
                    <DropdownMenuItem>
                      <CheckIcon />
                      Oznacz jako dostarczone
                    </DropdownMenuItem>
                  </ActionDialogTrigger>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmActionDialogContent
              action={Intent.MARK_IN_TRANSIT}
              title="Oznacz jako w transporcie"
              description="Czy na pewno chcesz oznaczyć to zamówienie jako w transporcie? Oznacza to, że zamówienie zostało wysłane do klienta."
              confirmText="Potwierdź"
              cancelText="Anuluj"
              onConfirm={handleMarkInTransit}
            />

            <ConfirmActionDialogContent
              action={Intent.MARK_DELIVERED}
              title="Oznacz jako dostarczone"
              description="Czy na pewno chcesz oznaczyć to zamówienie jako dostarczone? Oznacza to, że zamówienie dotarło do klienta."
              confirmText="Potwierdź"
              cancelText="Anuluj"
              onConfirm={handleMarkDelivered}
            />
          </ActionDialog>
        </AdminPageActions>
      </AdminPageHeader>
      <AdminPageContent>
        <main className={cn("space-y-6")}>
          {/* Header Section with Status Badge */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Zamówienie
                  <br />#{order.orderNumber}
                </h1>
                <p className="text-muted-foreground">
                  Złożone dnia {formatDate(order.createdAt)}
                </p>
              </div>
              <Badge variant="default">{orderStatus}</Badge>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Timeline and Summary Section */}
            <div className="lg:col-span-2 space-y-6">
              <Item variant="outline">
                <ItemHeader>
                  <ItemTitle className="text-base">Status zamówienia</ItemTitle>
                </ItemHeader>
                <ItemContent>
                  <OrderTimeline events={order.events || []} />
                </ItemContent>
              </Item>

              <OrderData orderData={orderDetails} />
              <PriceSummary {...priceSummary} />
            </div>

            <div className="lg:col-span-3">
              <Item variant="outline">
                <ItemHeader>
                  <ItemTitle className="text-base">
                    Zamówione przedmioty
                  </ItemTitle>
                </ItemHeader>
                <ItemContent>
                  <ItemGroup>
                    {products.map((product) => (
                      <div key={product.id} className="border rounded p-4">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.name}
                        </p>
                      </div>
                    ))}
                    {pieces.map((piece) => (
                      <div key={piece.id} className="border rounded p-4">
                        <h4 className="font-medium">{piece.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {piece.name}
                        </p>
                      </div>
                    ))}
                  </ItemGroup>
                </ItemContent>
              </Item>
            </div>
          </div>
        </main>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/zamowienia"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeft />
          Powrót
        </Link>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
