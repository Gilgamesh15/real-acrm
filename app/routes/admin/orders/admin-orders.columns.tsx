import type { ColumnDef } from "@tanstack/react-table";
import { orderStatusEnum } from "db/schema";
import {
  BadgeIcon,
  CalendarIcon,
  Check,
  DollarSignIcon,
  Eye,
  HashIcon,
  MoreHorizontal,
  Truck,
} from "lucide-react";
import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  ActionDialog,
  ActionDialogTrigger,
  ConfirmActionDialogContent,
} from "~/components/shared/action-dialog/action-dialog";
import { createColumnConfigHelper } from "~/components/shared/data-table-filter/core/filters";
import { useDialogState } from "~/hooks/use-dialog-state";
import type { DBQueryResult } from "~/lib/types";
import {
  ORDER_STATUS_BADGE_TEXT_MAP,
  ORDER_STATUS_BADGE_VARIANT_MAP,
  formatCurrency,
  formatDate,
  orderStatusFromOrder,
  priceFromGrosz,
} from "~/lib/utils";

import type { AdminOrdersDataTableMeta } from "./admin-orders-list.page";

type ActionType = "markInTransit" | "markDelivered";

type Order = DBQueryResult<
  "orders",
  {
    with: {
      events: true;
    };
  }
>;

const dtf = createColumnConfigHelper<Order>();

export const columnsConfig = [
  dtf
    .text()
    .id("orderNumber")
    .accessor((row) => row.orderNumber)
    .displayName("Numer zamówienia")
    .icon(HashIcon)
    .build(),
  dtf
    .number()
    .id("total")
    .accessor((row) => priceFromGrosz(row.totalInGrosz))
    .displayName("Kwota")
    .icon(DollarSignIcon)
    .build(),
  dtf
    .option()
    .id("status")
    .accessor((row) => orderStatusFromOrder(row))
    .displayName("Status")
    .options(
      Object.values(orderStatusEnum.enumValues).map((status) => ({
        value: status,
        label: ORDER_STATUS_BADGE_TEXT_MAP[status],
        icon: (
          <Badge
            className="min-w-3 min-h-3 max-h-3 max-w-3 aspect-square p-0 m-0"
            variant={ORDER_STATUS_BADGE_VARIANT_MAP[status]}
          ></Badge>
        ),
      }))
    )
    .icon(BadgeIcon)
    .build(),
  dtf
    .number()
    .id("createdAt")
    .accessor((row) => row.createdAt)
    .displayName("Data utworzenia")
    .icon(CalendarIcon)
    .build(),
] as const;

export const columns: ColumnDef<Order>[] = [
  {
    id: "orderNumber",
    accessorKey: "orderNumber",
    header: "Numer zamówienia",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <Link
          to={`/admin/orders/${order.id}`}
          className="font-medium text-primary hover:underline"
        >
          #{order?.orderNumber}
        </Link>
      );
    },
  },
  {
    id: "total",
    accessorKey: "totalInGrosz",
    header: "Kwota",
    cell: ({ row }) => {
      return formatCurrency(priceFromGrosz(row.original.totalInGrosz));
    },
  },
  {
    id: "status",
    accessorFn: (row) => orderStatusFromOrder(row),
    header: "Status",
    cell: ({ row }) => {
      const status = orderStatusFromOrder(row.original);
      return (
        <Badge variant={ORDER_STATUS_BADGE_VARIANT_MAP[status]}>
          {ORDER_STATUS_BADGE_TEXT_MAP[status]}
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Data utworzenia",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return formatDate(date);
    },
  },
  {
    id: "actions",
    header: "Akcje",
    cell: function Render({ row, table }) {
      const order = row.original;
      const meta = table.options.meta as AdminOrdersDataTableMeta;
      const [open, setOpen] = useDialogState<ActionType>(null);

      const isLoading =
        open === "markInTransit"
          ? meta.isMarkingInTransit
          : meta.isMarkingDelivered;

      return (
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
              <DropdownMenuItem asChild>
                <Link to={`/admin/orders/${order.id}`}>
                  <Eye />
                  Zobacz szczegóły
                </Link>
              </DropdownMenuItem>
              {orderStatusFromOrder(order) === "processing" && (
                <ActionDialogTrigger action="markInTransit" asChild>
                  <DropdownMenuItem>
                    <Truck />
                    Oznacz jako w transporcie
                  </DropdownMenuItem>
                </ActionDialogTrigger>
              )}
              {orderStatusFromOrder(order) === "in_transit" && (
                <ActionDialogTrigger action="markDelivered" asChild>
                  <DropdownMenuItem>
                    <Check />
                    Oznacz jako dostarczone
                  </DropdownMenuItem>
                </ActionDialogTrigger>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmActionDialogContent
            action="markInTransit"
            title="Oznacz jako w transporcie"
            description="Czy na pewno chcesz oznaczyć to zamówienie jako w transporcie? Oznacza to, że zamówienie zostało wysłane do klienta."
            confirmText="Potwierdź"
            cancelText="Anuluj"
            onConfirm={() => meta.markInTransit(order.id)}
          />

          <ConfirmActionDialogContent
            action="markDelivered"
            title="Oznacz jako dostarczone"
            description="Czy na pewno chcesz oznaczyć to zamówienie jako dostarczone? Oznacza to, że zamówienie dotarło do klienta."
            confirmText="Potwierdź"
            cancelText="Anuluj"
            onConfirm={() => meta.markDelivered(order.id)}
          />
        </ActionDialog>
      );
    },
  },
];
