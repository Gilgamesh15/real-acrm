import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, HashIcon } from "lucide-react";
import { Link } from "react-router";

import { createColumnConfigHelper } from "~/components/shared/data-table-filter/core/filters";
import type { DBQueryResult } from "~/lib/types";
import { formatDate } from "~/lib/utils";

type Return = DBQueryResult<"returns", {}>;

const dtf = createColumnConfigHelper<Return>();

export const columnsConfig = [
  dtf
    .text()
    .id("returnNumber")
    .accessor((row) => row.returnNumber)
    .displayName("Numer zwrotu")
    .icon(HashIcon)
    .build(),
  dtf
    .number()
    .id("createdAt")
    .accessor((row) => row.createdAt)
    .displayName("Data utworzenia")
    .icon(CalendarIcon)
    .build(),
] as const;

export const columns: ColumnDef<Return>[] = [
  {
    id: "returnNumber",
    accessorKey: "returnNumber",
    header: "Numer zwrotu",
    cell: ({ row }) => {
      const returnItem = row.original;
      return (
        <Link
          to={`/admin/returns/${returnItem.id}`}
          className="font-medium text-primary hover:underline"
        >
          #{returnItem.returnNumber}
        </Link>
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
];
