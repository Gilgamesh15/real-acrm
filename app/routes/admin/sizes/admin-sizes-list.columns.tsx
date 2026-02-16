import type { ColumnDef } from "@tanstack/react-table";
import type { Size } from "db/models/sizes.model";
import { CalendarIcon, Edit, MoreHorizontal, TextIcon, X } from "lucide-react";
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
import { formatDate } from "~/lib/utils";

import type { AdminSizesDataTableMeta } from "./admin-sizes-list.page";

const dtf = createColumnConfigHelper<Size>();

export const columnsConfig = [
  dtf
    .text()
    .id("name")
    .accessor((row) => row.name)
    .displayName("Nazwa")
    .icon(TextIcon)
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

export const columns: ColumnDef<Size>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nazwa",
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Utworzono",
    cell: ({ row }) => formatDate(row.original.createdAt, "short"),
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: "Zaktualizowano",
    cell: ({ row }) => formatDate(row.original.updatedAt, "short"),
  },
  {
    id: "actions",
    size: 52,
    cell: function Render({ row, table }) {
      const size = row.original;

      const { deleteSize, isDeleting } = table.options
        .meta as AdminSizesDataTableMeta;

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
                <Link to={`/admin/sizes/${size.slug}/edit`}>
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
                Czy na pewno chcesz usunąć ten rozmiar?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja jest nieodwracalna i spowoduje usunięcie rozmiaru
                &quot;
                {size.name}&quot;. Nie można usunąć rozmiaru który jest używany
                przez produkty.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Anuluj</Button>
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => deleteSize(size.slug)}
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
