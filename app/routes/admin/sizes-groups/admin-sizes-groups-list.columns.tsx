import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarIcon,
  Edit,
  ListOrderedIcon,
  MoreHorizontal,
  TextIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Spinner } from "~/components/ui/spinner";

import { createColumnConfigHelper } from "~/components/shared/data-table-filter/core/filters";
import type { DBQueryResult } from "~/lib/types";
import { formatDate } from "~/lib/utils";

import type { AdminSizeGroupsDataTableMeta } from "./admin-sizes-groups-list.page";

type SizeGroup = DBQueryResult<"sizeGroups", {}>;

const dtf = createColumnConfigHelper<SizeGroup>();

export const columnsConfig = [
  dtf
    .text()
    .id("name")
    .accessor((row) => row.name)
    .displayName("Nazwa")
    .icon(TextIcon)
    .build(),
  dtf
    .number()
    .id("displayOrder")
    .accessor((row) => row.displayOrder)
    .displayName("Kolejność wyświetlania")
    .icon(ListOrderedIcon)
    .build(),
  dtf
    .date()
    .id("createdAt")
    .accessor((row) => row.createdAt)
    .displayName("Data utworzenia")
    .icon(CalendarIcon)
    .build(),
  dtf
    .date()
    .id("updatedAt")
    .accessor((row) => row.updatedAt)
    .displayName("Data aktualizacji")
    .icon(CalendarIcon)
    .build(),
] as const;

export const columns: ColumnDef<SizeGroup>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nazwa",
  },
  {
    id: "displayOrder",
    accessorKey: "displayOrder",
    header: "Kolejność",
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Utworzono",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return formatDate(date, "short");
    },
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: "Zaktualizowano",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      return formatDate(date, "short");
    },
  },
  {
    id: "actions",
    size: 52,
    cell: function Render({ row, table }) {
      const sizeGroup = row.original;

      const { deleteSizeGroup, isDeleting } = table.options
        .meta as AdminSizeGroupsDataTableMeta;

      const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

      return (
        <AlertDialog
          open={isAlertDialogOpen}
          onOpenChange={setIsAlertDialogOpen}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to={`/admin/sizes-groups/${sizeGroup.id}/edit`}>
                  <Edit />
                  Edytuj
                </Link>
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem variant="destructive">
                  <X />
                  Usuń
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Czy na pewno chcesz usunąć tę grupę rozmiarów?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja jest nieodwracalna i spowoduje usunięcie grupy
                rozmiarów &quot;{sizeGroup.name}&quot;. Nie można usunąć grupy
                rozmiarów która jest używana przez rozmiary.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Anuluj</Button>
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => deleteSizeGroup(sizeGroup.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Spinner />
                    Usuwanie...
                  </>
                ) : (
                  <>
                    <X />
                    Usuń
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
