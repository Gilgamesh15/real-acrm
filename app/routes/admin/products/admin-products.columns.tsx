import { type ColumnDef } from "@tanstack/react-table";
import { productStatusEnum } from "db/schema";
import {
  BadgeIcon,
  CalendarIcon,
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
import Image from "~/components/ui/image";

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
  calculateProductPriceDisplayData,
  formatCurrency,
  formatDate,
} from "~/lib/utils";

import type { AdminProductsDataTableMeta } from "./admin-products-list.page";

type ActionType =
  | "publish"
  | "unpublish"
  | "add-discount"
  | "delete-discount"
  | "delete";

type Product = DBQueryResult<
  "products",
  {
    with: {
      images: true;
      pieces: {
        with: {
          discount: true;
        };
      };
      discount: {
        columns: {
          amountOffInGrosz: true;
          percentOff: true;
        };
      };
    };
  }
>;

const dtf = createColumnConfigHelper<Product>();

// Helper functions to get computed properties
const getPrimaryImage = (product: Product) => {
  return product.images?.[0] || { url: "/placeholder.png", alt: product.name };
};

const getPiecesCount = (product: Product) => {
  return product.pieces?.length || 0;
};

// Permission helper functions
const canEditProduct = (product: Product) =>
  product.status === "draft" || product.status === "published";

const canDeleteProduct = (product: Product) =>
  product.status === "draft" &&
  (product.pieces?.every((piece) => piece.status === "draft") ?? true);

const canPublishProduct = (product: Product) => product.status === "draft";

const canUnpublishProduct = (product: Product) =>
  product.status === "published";

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
    .id("piecesCount")
    .accessor((row) => getPiecesCount(row))
    .displayName("Ubrania")
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
        label:
          PRODUCT_STATUS_BADGE_TEXT_MAP[
            status.toUpperCase() as keyof typeof PRODUCT_STATUS_BADGE_TEXT_MAP
          ],
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
] as const;

export const columns: ColumnDef<Product>[] = [
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
    id: "piecesCount",
    accessorKey: "piecesCount",
    header: "Ubrania",
    cell: ({ row }) => {
      return getPiecesCount(row.original);
    },
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Cena",
    cell: ({ row }) => {
      const product = row.original;
      const price = calculateProductPriceDisplayData(product);
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {formatCurrency(price.finalPrice)}
          </span>
          {price.hasDiscount && (
            <span className="text-sm text-gray-500">
              {formatCurrency(price.originalPrice)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status =
        row.original.status.toUpperCase() as keyof typeof PRODUCT_STATUS_BADGE_TEXT_MAP;

      return (
        <Badge variant={PRODUCT_STATUS_BADGE_VARIANT_MAP[status]}>
          {PRODUCT_STATUS_BADGE_TEXT_MAP[status]}
        </Badge>
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
    cell: function Render({ row, table }) {
      const [open, setOpen] = useDialogState<ActionType>(null);
      const product = row.original;

      const {
        deleteProduct,
        publishProduct,
        unpublishProduct,
        isDeleting,
        isPublishing,
        isUnpublishing,
      } = table.options.meta as AdminProductsDataTableMeta;

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
              <DropdownMenuItem asChild disabled={!canEditProduct(product)}>
                <Link
                  to={
                    canEditProduct(product)
                      ? `/admin/projekty/${product.id}/edytuj`
                      : "#"
                  }
                  onClick={(e) => {
                    if (!canEditProduct(product)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Edit />
                  Edytuj
                </Link>
              </DropdownMenuItem>
              {/* TODO: Re-enable discount management when discount service is available */}
              {/* {product.discount ? (
                <ActionDialogTrigger
                  action="delete-discount"
                  asChild
                  disabled={!canManageDiscount(product)}
                >
                  <DropdownMenuItem>
                    <XIcon />
                    Usuń rabat
                  </DropdownMenuItem>
                </ActionDialogTrigger>
              ) : (
                <ActionDialogTrigger
                  action="add-discount"
                  asChild
                  disabled={!canManageDiscount(product)}
                >
                  <DropdownMenuItem>
                    <DollarSignIcon />
                    Dodaj rabat
                  </DropdownMenuItem>
                </ActionDialogTrigger>
              )} */}
              <ActionDialogTrigger
                action="publish"
                asChild
                disabled={!canPublishProduct(product)}
              >
                <DropdownMenuItem>
                  <Eye />
                  Opublikuj
                </DropdownMenuItem>
              </ActionDialogTrigger>
              <ActionDialogTrigger
                action="unpublish"
                asChild
                disabled={!canUnpublishProduct(product)}
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
                disabled={!canDeleteProduct(product)}
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
            title="Opublikuj projekt"
            description="Czy na pewno chcesz opublikować ten projekt? Projekt stanie się widoczny dla klientów w sklepie."
            confirmText="Opublikuj"
            cancelText="Anuluj"
            onConfirm={() => publishProduct(product.id)}
          />

          <ConfirmActionDialogContent
            action="unpublish"
            title="Cofnij publikację projektu"
            description="Czy na pewno chcesz cofnąć publikację tego projektu? Projekt przestanie być widoczny dla klientów w sklepie."
            confirmText="Cofnij publikację"
            cancelText="Anuluj"
            onConfirm={() => unpublishProduct(product.id)}
          />

          <DeleteActionDialogContent
            action="delete"
            title="Usuń projekt"
            description="Ta akcja jest nieodwracalna i spowoduje usunięcie projektu. Można usuwać tylko projekty w statusie szkicu."
            deleteKeyword="USUŃ"
            deleteLabel="Usuń projekt"
            confirmText="Usuń"
            cancelText="Anuluj"
            onConfirm={() => deleteProduct(product.id)}
          />

          {/* TODO: Re-enable discount dialogs when discount service is available */}
          {/* <DeleteActionDialogContent
            action="delete-discount"
            title="Usuń rabat"
            description="Ta akcja jest nieodwracalna i spowoduje usunięcie rabatu z projektu."
            deleteKeyword="USUŃ"
            deleteLabel="Usuń rabat"
            confirmText="Usuń"
            cancelText="Anuluj"
            onConfirm={() => deleteDiscount(product.id)}
          /> */}
        </ActionDialog>
      );
    },
  },
];
