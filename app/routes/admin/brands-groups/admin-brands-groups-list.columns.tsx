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

import type { AdminBrandGroupsDataTableMeta } from "./admin-brands-groups-list.page";

type BrandGroup = DBQueryResult<"brandGroups", {}>;

const dtf = createColumnConfigHelper<BrandGroup>();

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

export const columns: ColumnDef<BrandGroup>[] = [
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
      const brandGroup = row.original;

      const { deleteBrandGroup, isDeleting } = table.options
        .meta as AdminBrandGroupsDataTableMeta;

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
                <Link to={`/admin/marki-grupy/${brandGroup.id}/edytuj`}>
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
                Czy na pewno chcesz usunąć tę grupę marki?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja jest nieodwracalna i spowoduje usunięcie grupy marki
                &quot;{brandGroup.name}&quot;. Nie można usunąć grupy marki
                która jest używana przez marki.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Anuluj</Button>
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => deleteBrandGroup(brandGroup.id)}
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
