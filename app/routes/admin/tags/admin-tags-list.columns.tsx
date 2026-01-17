import type { ColumnDef } from "@tanstack/react-table";
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
import type { DBQueryResult } from "~/lib/types";
import { formatDate } from "~/lib/utils";

import type { AdminTagsDataTableMeta } from "./admin-tags-list.page";

type Tag = DBQueryResult<"tags", {}>;

const dtf = createColumnConfigHelper<Tag>();

export const columnsConfig = [
  dtf
    .text()
    .id("name")
    .accessor((row) => row.name)
    .displayName("Nazwa")
    .icon(TextIcon)
    .build(),
  dtf
    .text()
    .id("slug")
    .accessor((row) => row.slug)
    .displayName("Slug")
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

export const columns: ColumnDef<Tag>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nazwa",
  },
  {
    id: "slug",
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => {
      return (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {row.original.slug}
        </code>
      );
    },
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
      const tag = row.original;

      const { deleteTag, isDeleting } = table.options
        .meta as AdminTagsDataTableMeta;

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
                <Link to={`/admin/tagi/${tag.id}/edytuj`}>
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
                Czy na pewno chcesz usunąć ten tag?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja jest nieodwracalna i spowoduje usunięcie tagu &quot;
                {tag.name}&quot;. Nie można usunąć tagu który jest używany przez
                produkty.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Anuluj</Button>
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => deleteTag(tag.id)}
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
