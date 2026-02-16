import { type ColumnDef } from "@tanstack/react-table";
import {
  BadgeIcon,
  CalendarIcon,
  CoinsIcon,
  Edit,
  MoreHorizontal,
  PercentIcon,
  TextIcon,
  Trash,
} from "lucide-react";
import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  ActionDialog,
  ActionDialogTrigger,
  DeleteActionDialogContent,
} from "~/components/shared/action-dialog/action-dialog";
import { createColumnConfigHelper } from "~/components/shared/data-table-filter/core/filters";
import { useDialogState } from "~/hooks/use-dialog-state";
import type { DBQueryResult } from "~/lib/types";
import { formatCurrency, formatDate } from "~/lib/utils";

type ActionType = "delete";

type Discount = DBQueryResult<"discounts", {}>;

const dtf = createColumnConfigHelper<Discount>();

export const columnsConfig = [
  dtf
    .text()
    .id("name")
    .accessor((row) => row.name ?? "")
    .displayName("Nazwa")
    .icon(TextIcon)
    .build(),
  dtf
    .option()
    .id("type")
    .accessor((row) => (row.percentOff ? "percentage" : "fixed"))
    .displayName("Typ")
    .options([
      { label: "Procentowa", value: "percentage" },
      { label: "Kwotowa", value: "fixed" },
    ])
    .icon(BadgeIcon)
    .build(),
  dtf
    .date()
    .id("createdAt")
    .accessor((row) => row.createdAt)
    .displayName("Utworzono")
    .icon(CalendarIcon)
    .build(),
] as const;

export const columns: ColumnDef<Discount>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nazwa",
    cell: ({ row }) => row.original.name,
  },
  {
    id: "type",
    header: "Typ zniżki",
    cell: ({ row }) => {
      if (row.original.percentOff) {
        return (
          <Badge variant="default" className="gap-1">
            <PercentIcon className="size-3" />
            {row.original.percentOff}% off
          </Badge>
        );
      }
      if (row.original.amountOffInGrosz) {
        return (
          <Badge variant="secondary" className="gap-1">
            <CoinsIcon className="size-3" />
            {formatCurrency(row.original.amountOffInGrosz)} off
          </Badge>
        );
      }
      return null;
    },
  },
  {
    id: "value",
    header: "Wartość",
    cell: ({ row }) => {
      if (row.original.percentOff) {
        return `${row.original.percentOff}%`;
      }
      if (row.original.amountOffInGrosz) {
        return formatCurrency(row.original.amountOffInGrosz);
      }
      return "-";
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Utworzono",
    cell: ({ row }) => formatDate(row.original.createdAt, "short"),
  },
  {
    id: "actions",
    cell: function Render({ row, table }) {
      const [open, setOpen] = useDialogState<ActionType>(null);
      const { deleteDiscount, isDeleting } = table.options
        .meta as DiscountDataTableMeta;

      return (
        <ActionDialog
          open={open}
          setOpen={setOpen}
          loading={isDeleting ? open : null}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/admin/discounts/${row.original.id}/edit`}>
                  <Edit />
                  Edytuj
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ActionDialogTrigger
                action="delete"
                asChild
                variant="destructive"
              >
                <DropdownMenuItem variant="destructive">
                  <Trash />
                  Usuń
                </DropdownMenuItem>
              </ActionDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteActionDialogContent
            action="delete"
            title="Usuń zniżkę"
            description={`Czy na pewno chcesz usunąć zniżkę "${row.original.name}"? Ta akcja jest nieodwracalna.`}
            deleteKeyword="USUŃ"
            deleteLabel="Usuń zniżkę"
            confirmText="Usuń"
            cancelText="Anuluj"
            onConfirm={() => deleteDiscount(row.original.id)}
          />
        </ActionDialog>
      );
    },
  },
];

export type DiscountDataTableMeta = {
  deleteDiscount: (discountId: string) => void;
  isDeleting: boolean;
};
