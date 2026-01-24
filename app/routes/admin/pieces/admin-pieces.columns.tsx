import type { ColumnDef } from "@tanstack/react-table";
import { productStatusEnum } from "db/schema";
import {
  BadgeIcon,
  CalendarIcon,
  DollarSignIcon,
  Edit,
  Eye,
  EyeOff,
  MoreHorizontal,
  ShirtIcon,
  TextIcon,
  X,
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
import { Image } from "~/components/ui/image";

import {
  ActionDialog,
  ActionDialogTrigger,
  ConfirmActionDialogContent,
  DeleteActionDialogContent,
} from "~/components/shared/action-dialog/action-dialog";
import { createColumnConfigHelper } from "~/components/shared/data-table-filter/core/filters";
import { useDialogState } from "~/hooks/use-dialog-state";
import type { DBQueryResult } from "~/lib/types";
import {
  PRODUCT_STATUS_BADGE_TEXT_MAP,
  PRODUCT_STATUS_BADGE_VARIANT_MAP,
  formatCurrency,
  formatDate,
} from "~/lib/utils";

import type { AdminPiecesDataTableMeta } from "./admin-pieces-list.page";

type ActionType = "publish" | "unpublish" | "delete";

type Piece = DBQueryResult<
  "pieces",
  {
    with: {
      images: true;
      brand: true;
      size: true;
    };
  }
>;

const dtf = createColumnConfigHelper<Piece>();

// Helper functions to get computed properties
const getPrimaryImage = (piece: Piece) => {
  return piece.images?.[0] || { url: "/placeholder.png", alt: piece.name };
};

const getPrice = (piece: Piece) => {
  return piece.priceInGrosz / 100;
};

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
    .id("price")
    .accessor((row) => getPrice(row))
    .displayName("Cena")
    .icon(DollarSignIcon)
    .build(),
  dtf
    .text()
    .id("brand")
    .accessor((row) => row.brand?.name || "")
    .displayName("Marka")
    .icon(ShirtIcon)
    .build(),
  dtf
    .text()
    .id("size")
    .accessor((row) => row.size?.name || "")
    .displayName("Rozmiar")
    .icon(ShirtIcon)
    .build(),
  dtf
    .option()
    .id("status")
    .accessor((row) => row.status)
    .displayName("Status")
    .options(
      Object.values(productStatusEnum.enumValues).map((status) => ({
        value: status,
        label: PRODUCT_STATUS_BADGE_TEXT_MAP[status],
        icon: (
          <Badge
            className="min-w-3 min-h-3 max-h-3 max-w-3 aspect-square p-0 m-0"
            variant={
              PRODUCT_STATUS_BADGE_VARIANT_MAP[
                status.toUpperCase() as keyof typeof PRODUCT_STATUS_BADGE_VARIANT_MAP
              ]
            }
          ></Badge>
        ),
      }))
    )
    .icon(BadgeIcon)
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
  dtf
    .date()
    .id("reservedUntil")
    .accessor((row) => row.reservedUntil)
    .displayName("Rezerwacja do")
    .icon(CalendarIcon)
    .build(),
] as const;

// Permission helper functions
const canEditPiece = (piece: Piece) =>
  piece.status === "draft" || piece.status === "published";

const canDeletePiece = (piece: Piece) => piece.status === "draft";

const canPublishPiece = (piece: Piece) => piece.status === "draft";

const canUnpublishPiece = (piece: Piece) => piece.status === "published";

export const columns: ColumnDef<Piece>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nazwa",
    cell: ({ row }) => {
      const primaryImage = getPrimaryImage(row.original);
      return (
        <div className="flex items-center gap-3">
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            width={24}
            height={24}
            className="size-6"
          />
          <span>{row.original.name}</span>
        </div>
      );
    },
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Cena",
    cell: ({ row }) => {
      const price = getPrice(row.original);
      return formatCurrency(price);
    },
  },
  {
    id: "brand",
    accessorKey: "brand",
    header: "Marka",
    cell: ({ row }) => row.original.brand?.name || "Brak",
  },
  {
    id: "size",
    accessorKey: "size",
    header: "Rozmiar",
    cell: ({ row }) => row.original.size?.name || "Brak",
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge variant={PRODUCT_STATUS_BADGE_VARIANT_MAP[status]}>
          {PRODUCT_STATUS_BADGE_TEXT_MAP[status]}
        </Badge>
      );
    },
  },
  {
    id: "reservedUntil",
    accessorKey: "reservedUntil",
    header: "Rezerwacja do",
    cell: ({ row }) => {
      const date = row.getValue("reservedUntil") as Date;
      return formatDate(date, "short");
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
    cell: function Render({ row, table }) {
      const [open, setOpen] = useDialogState<ActionType>(null);
      const piece = row.original;

      const {
        deletePiece,
        publishPiece,
        unpublishPiece,
        isDeleting,
        isPublishing,
        isUnpublishing,
      } = table.options.meta as AdminPiecesDataTableMeta;

      const isLoading = isDeleting || isPublishing || isUnpublishing;

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
              <DropdownMenuItem asChild disabled={!canEditPiece(piece)}>
                <Link
                  to={
                    canEditPiece(piece)
                      ? `/admin/ubrania/${piece.id}/edytuj`
                      : "#"
                  }
                  onClick={(e) => {
                    if (!canEditPiece(piece)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Edit />
                  Edytuj
                </Link>
              </DropdownMenuItem>
              <ActionDialogTrigger
                action="publish"
                asChild
                disabled={!canPublishPiece(piece)}
              >
                <DropdownMenuItem>
                  <Eye />
                  Opublikuj
                </DropdownMenuItem>
              </ActionDialogTrigger>
              <ActionDialogTrigger
                action="unpublish"
                asChild
                disabled={!canUnpublishPiece(piece)}
              >
                <DropdownMenuItem>
                  <EyeOff />
                  Cofnij publikację
                </DropdownMenuItem>
              </ActionDialogTrigger>
              <ActionDialogTrigger
                action="delete"
                asChild
                variant="destructive"
                disabled={!canDeletePiece(piece)}
              >
                <DropdownMenuItem variant="destructive">
                  <X />
                  Usuń
                </DropdownMenuItem>
              </ActionDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmActionDialogContent
            action="publish"
            title="Opublikuj ubranie"
            description="Czy na pewno chcesz opublikować to ubranie? Ubranie stanie się widoczne dla klientów w sklepie."
            confirmText="Opublikuj"
            cancelText="Anuluj"
            onConfirm={() => publishPiece(piece.id)}
          />

          <ConfirmActionDialogContent
            action="unpublish"
            title="Cofnij publikację ubrania"
            description="Czy na pewno chcesz cofnąć publikację tego ubrania? Ubranie przestanie być widoczne dla klientów w sklepie."
            confirmText="Cofnij publikację"
            cancelText="Anuluj"
            onConfirm={() => unpublishPiece(piece.id)}
          />

          <DeleteActionDialogContent
            action="delete"
            title="Usuń ubranie"
            description="Ta akcja jest nieodwracalna i spowoduje usunięcie ubrania. Można usuwać tylko ubrania w statusie szkicu."
            deleteKeyword="USUŃ"
            deleteLabel="Usuń ubranie"
            confirmText="Usuń"
            cancelText="Anuluj"
            onConfirm={() => deletePiece(piece.id)}
          />
        </ActionDialog>
      );
    },
  },
];
