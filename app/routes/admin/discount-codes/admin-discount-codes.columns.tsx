import { type ColumnDef } from "@tanstack/react-table";
import { BadgeIcon, Edit, MoreHorizontal, TextIcon } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { createColumnConfigHelper } from "~/components/shared/data-table-filter/core/filters";
import type { DBQueryResult } from "~/lib/types";
import { formatDate } from "~/lib/utils";

type DiscountCode = DBQueryResult<"promotionCodes", {}>;

const dtf = createColumnConfigHelper<DiscountCode>();

export const columnsConfig = [
  dtf
    .text()
    .id("code")
    .accessor((row) => row.code ?? "")
    .displayName("Kod")
    .icon(TextIcon)
    .build(),
  dtf
    .option()
    .id("firstTimeTransaction")
    .accessor((row) => row.firstTimeTransaction)
    .displayName("Transakcja pierwsza")
    .options([
      { label: "Tak", value: "true" },
      { label: "Nie", value: "false" },
    ])
    .icon(BadgeIcon)
    .build(),
] as const;

export const columns: ColumnDef<DiscountCode>[] = [
  {
    id: "code",
    accessorKey: "code",
    header: "Kod",
    cell: ({ row }) => row.original.code,
  },
  {
    id: "firstTimeTransaction",
    header: "Transakcja pierwsza",
    cell: ({ row }) => (row.original.firstTimeTransaction ? "Tak" : "Nie"),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Utworzono",
    cell: ({ row }) => formatDate(row.original.createdAt, "short"),
  },
  {
    id: "actions",
    cell: function Render({ row }) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/admin/discount-codes/${row.original.code}/edit`}>
                <Edit />
                Edytuj
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
