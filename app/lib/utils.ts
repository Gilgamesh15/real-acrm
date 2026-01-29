import {
  convertFormDataToObject,
  convertObjectToFormData,
} from "@abyrd9/zod-form-data";
import type { VariantProps } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import baseSlugify from "slugify";
import { twMerge } from "tailwind-merge";
import z from "zod";
import * as z4 from "zod/v4/core";

import type { badgeVariants } from "~/components/ui/badge";

import {
  type Address,
  type CatalogSortBy,
  type CatalogSortOrder,
  type DBQueryResult,
  type Gender,
  type OrderDetails,
  type OrderStatus,
  type ProductStatus,
  type ReturnRequestDetails,
  type ReturnStatus,
  type TreeNode,
  type TreeNodePathSegment,
  type TreeNodeWithPath,
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertObjectToFormDataUnsafe = <Schema extends z4.$ZodType>(
  schema: Schema,
  object: z4.output<Schema>
): FormData => convertObjectToFormData(schema, object as any);

export const convertFormDataToObjectUnsafe = <Schema extends z4.$ZodType>(
  schema: Schema,
  form: FormData
): z4.output<Schema> =>
  convertFormDataToObject(schema, form) as z4.output<Schema>;

export const slugify = (name: string) =>
  baseSlugify(name, { lower: true, strict: true, locale: "pl" });

export const generateSlug = (name: string, existingSlugs: string[]): string => {
  let candidateSlug = slugify(name);

  let i = 1;

  while (existingSlugs.includes(candidateSlug)) {
    candidateSlug = `${slugify(name)}-${i}`;
    i++;
  }

  return candidateSlug;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);
};

export const formatDate = (date: Date, variant: "long" | "short" = "long") => {
  if (variant === "short") {
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatFileSize = (bytes: number) => {
  const units = ["byte", "kilobyte", "megabyte", "gigabyte"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return new Intl.NumberFormat("pl-PL", {
    style: "unit",
    unit: units[unitIndex],
    maximumFractionDigits: 2,
  }).format(value);
};

export const priceFromGrosz = (grosz: number): number => {
  return grosz / 100;
};

export const priceToGrosz = (zl: number): number => {
  return Math.round(zl * 100);
};

export function enrichWithPath<T extends TreeNode>(
  nodes: T[]
): (T & { path: Array<TreeNodePathSegment> })[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function buildPath(nodeId: string): Array<TreeNodePathSegment> {
    const node = nodeMap.get(nodeId);
    if (!node) return [];

    if (!node.parentId) {
      return [{ name: node.name, slug: node.slug }];
    }

    return [...buildPath(node.parentId), { name: node.name, slug: node.slug }];
  }

  return nodes.map((node) => ({
    ...node,
    path: buildPath(node.id),
  }));
}

// Get ancestor nodes (root to immediate parent)
// If nodeId is undefined/null, returns all root nodes (nodes without parents)
export function getAncestors<T extends TreeNode>(
  nodes: T[],
  nodeId?: string | null | undefined
): T[] {
  // If no nodeId provided, return root nodes
  if (!nodeId) {
    return nodes.filter((n) => !n.parentId);
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const ancestors: T[] = [];

  let current = nodeMap.get(nodeId);

  while (current?.parentId) {
    const parent = nodeMap.get(current.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
}

// Construct slug path from node
export function getSlugPath(node: TreeNodeWithPath): string {
  return node.path.map((p) => p.slug).join("/");
}

export function getIsRoot(node: TreeNode): boolean {
  return !node.parentId;
}

export function getIsLeaf<T extends TreeNode>(
  nodes: T[],
  nodeId: string
): boolean {
  return !nodes.some((n) => n.parentId === nodeId);
}

export function getNodeDepth<T extends TreeNode>(
  nodes: T[],
  nodeId: string
): number {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  let depth = 0;
  let currentId = nodeMap.get(nodeId)?.parentId;

  while (currentId) {
    const node = nodeMap.get(currentId);
    if (!node) break;
    depth++;
    currentId = node.parentId;
  }

  return depth;
}

export function getChildren<T extends TreeNode>(
  nodes: T[],
  nodeId?: string | null | undefined
): T[] {
  // If no nodeId provided, return root nodes
  if (!nodeId) {
    return nodes.filter((n) => !n.parentId);
  }

  return nodes.filter((n) => n.parentId === nodeId);
}

export const getFilterSearchParams = ({
  priceMin = 0,
  priceMax = 100000,
}: {
  priceMin?: number;
  priceMax?: number;
}) => ({
  search: parseAsString.withDefault("").withOptions({
    shallow: false,
    limitUrlUpdates: {
      method: "debounce",
      timeMs: 500,
    },
  }),
  priceMin: parseAsInteger.withDefault(priceMin),
  priceMax: parseAsInteger.withDefault(priceMax),
  gender: parseAsStringEnum(["male", "female", "unisex"] satisfies Gender[]),
  brands: parseAsArrayOf(parseAsString).withDefault([]),
  sizes: parseAsArrayOf(parseAsString).withDefault([]),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  page: parseAsInteger.withDefault(1),
  sortBy: parseAsStringEnum([
    "relevance-asc",
    "relevance-desc",
    "price-asc",
    "price-desc",
    "date-asc",
    "date-desc",
    "alphabetical-asc",
    "alphabetical-desc",
  ] satisfies `${CatalogSortBy}-${CatalogSortOrder}`[]).withDefault(
    "date-desc"
  ),
});

export const sortFilterOptions = [
  {
    value: "alphabetical-asc",
    label: "alfabet rosnąco",
  },
  {
    value: "alphabetical-desc",
    label: "alfabet malejąco",
  },
  {
    value: "price-asc",
    label: "cena rosnąco",
  },
  {
    value: "price-desc",
    label: "cena malejąco",
  },
  {
    value: "date-asc",
    label: "data rosnąco",
  },
  {
    value: "date-desc",
    label: "data malejąco",
  },
] as const satisfies Array<{ value: string; label: string }>;

export const FilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brands: z.array(z.string()),
  sizes: z.array(z.string()),
  tags: z.array(z.string()),
  gender: z.enum(["male", "female", "unisex"] satisfies Gender[]).optional(),
  priceMin: z.number(),
  priceMax: z.number(),
  limit: z.number(),
  offset: z.number(),
  sortBy: z.enum([
    "price",
    "date",
    "alphabetical",
    "relevance",
  ] satisfies CatalogSortBy[]),
  sortOrder: z.enum(["asc", "desc"] satisfies CatalogSortOrder[]),
});

export type FilterArgs = z.infer<typeof FilterSchema>;

/**
 * Creates a unique identification number (typically for orders, returns, etc.)
 * Format: Random alphanumeric string
 */
export function createIdentificationNumber(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const PRODUCT_STATUS_BADGE_VARIANT_MAP: Record<
  ProductStatus,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  draft: "secondary",
  published: "default",
  in_checkout: "warning",
  returned: "destructive",
  return_requested: "warning",
  sold: "success",
};

export const PRODUCT_STATUS_BADGE_TEXT_MAP: Record<ProductStatus, string> = {
  draft: "Szkic",
  published: "Opublikowany",
  in_checkout: "W trakcie realizacji",
  returned: "Zwrócony",
  return_requested: "Prośba o zwrot",
  sold: "Sprzedany",
};

export const ORDER_STATUS_BADGE_VARIANT_MAP: Record<
  OrderStatus,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  pending: "warning",
  cancelled: "destructive",
  processing: "info",
  in_transit: "info",
  delivered: "success",
};

export const ORDER_STATUS_BADGE_TEXT_MAP: Record<OrderStatus, string> = {
  pending: "Oczekuje na weryfikację",
  cancelled: "Anulowane",
  processing: "W trakcie realizacji",
  in_transit: "W drodze do odbiorcy",
  delivered: "Dostarczone",
};

export const RETURN_STATUS_BADGE_VARIANT_MAP: Record<
  ReturnStatus,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  pending: "warning",
  accepted: "success",
  rejected: "destructive",
};

export const RETURN_STATUS_BADGE_TEXT_MAP: Record<ReturnStatus, string> = {
  pending: "Oczekuje na weryfikację",
  accepted: "Zaakceptowany",
  rejected: "Odrzucony",
};

export const returnStatusFromReturnItem = (
  returnItem: DBQueryResult<"returnItems", { with: { events: true } }>
): ReturnStatus => {
  const events = returnItem.events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastEvent = events[events.length - 1];
  return lastEvent?.status ?? "pending";
};

export const returnDetailsFromReturn = (
  returnReq: DBQueryResult<"returns", {}>
): ReturnRequestDetails => {
  if (
    !returnReq.firstName ||
    !returnReq.lastName ||
    !returnReq.email ||
    !returnReq.phoneNumber
  ) {
    throw new Error("Personal details are required");
  }
  const personalDetails: ReturnRequestDetails["personalDetails"] = {
    firstName: returnReq.firstName,
    lastName: returnReq.lastName,
    email: returnReq.email,
    phoneNumber: returnReq.phoneNumber,
  };
  return { personalDetails };
};

export const orderDetailsFromOrder = (
  order: DBQueryResult<"orders", {}>
): OrderDetails => {
  // Validate required fields
  if (
    !order.billingName ||
    !order.deliveryName ||
    !order.email ||
    !order.phoneNumber
  ) {
    throw new Error(
      "Billing name, delivery name, email, and phone number are required"
    );
  }

  if (
    !order.billingAddressCity ||
    !order.billingAddressCountry ||
    !order.billingAddressLine1 ||
    !order.billingAddressPostalCode
  ) {
    throw new Error("Billing address is required");
  }

  const billingAddress: Address = {
    city: order.billingAddressCity,
    country: order.billingAddressCountry,
    line1: order.billingAddressLine1,
    line2: order.billingAddressLine2 ?? undefined,
    postalCode: order.billingAddressPostalCode,
  };

  const baseDetails = {
    billingName: order.billingName,
    billingAddress,
    deliveryName: order.deliveryName,
    phoneNumber: order.phoneNumber,
    email: order.email,
  };

  if (order.deliveryMethod === "courier") {
    if (
      !order.shippingAddressCity ||
      !order.shippingAddressCountry ||
      !order.shippingAddressLine1 ||
      !order.shippingAddressPostalCode
    ) {
      throw new Error("Shipping address is required for courier delivery");
    }

    const deliveryAddress: Address = {
      city: order.shippingAddressCity,
      country: order.shippingAddressCountry,
      line1: order.shippingAddressLine1,
      line2: order.shippingAddressLine2 ?? undefined,
      postalCode: order.shippingAddressPostalCode,
    };

    return {
      ...baseDetails,
      deliveryMethod: "courier",
      deliveryAddress,
    };
  } else if (order.deliveryMethod === "locker") {
    if (!order.lockerCode) {
      throw new Error("Locker code is required for locker delivery");
    }

    return {
      ...baseDetails,
      deliveryMethod: "locker",
      lockerCode: order.lockerCode,
    };
  } else {
    throw new Error("Invalid delivery method");
  }
};

export const orderStatusFromOrder = (
  order: DBQueryResult<
    "orders",
    {
      with: { events: true };
    }
  >
): OrderStatus => {
  const events = order.events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastEvent = events[0];
  return lastEvent?.status ?? "pending";
};

export const calculatePriceData = (
  priceInGrosz: number,
  discount?:
    | {
        amountOffInGrosz: number;
      }
    | {
        percentOff: number;
      }
): {
  taxInGrosz: number;
  lineTotalInGrosz: number;
  discountAmountInGrosz: number;
  unitPriceInGrosz: number; // net after discount
} => {
  const TAX_RATE = 0.23;

  // 1. Extract net price from gross
  const netPriceInGrosz = Math.round(priceInGrosz / (1 + TAX_RATE));

  // 2. Calculate discount on NET price
  let discountAmountInGrosz = 0;

  if (discount) {
    if ("amountOffInGrosz" in discount) {
      discountAmountInGrosz = Math.min(
        discount.amountOffInGrosz,
        netPriceInGrosz
      );
    }

    if ("percentOff" in discount) {
      discountAmountInGrosz = Math.round(
        netPriceInGrosz * (discount.percentOff / 100)
      );
    }
  }

  const discountedNetInGrosz = netPriceInGrosz - discountAmountInGrosz;

  // 3. Recalculate tax from discounted net
  const taxInGrosz = Math.round(discountedNetInGrosz * TAX_RATE);

  // 4. Final gross total
  const lineTotalInGrosz = discountedNetInGrosz + taxInGrosz;

  return {
    taxInGrosz,
    lineTotalInGrosz,
    unitPriceInGrosz: discountedNetInGrosz,
    discountAmountInGrosz,
  };
};

export const calculateProductPrice = (
  product: DBQueryResult<
    "products",
    {
      columns: {
        pricePercentageSkew: true;
      };
      with: {
        pieces: {
          columns: {
            priceInGrosz: true;
          };
        };
      };
    }
  >
): {
  taxInGrosz: number;
  discountAmountInGrosz: number;
  lineTotalInGrosz: number;
  unitPriceInGrosz: number;
} => {
  // iterate over all pieces add their price to the total price and then multiply by (100 - pricePercentageSkew) / 100
  let priceInGrosz = 0;
  for (const piece of product.pieces) {
    priceInGrosz += piece.priceInGrosz;
  }
  priceInGrosz = Math.round(
    (priceInGrosz * (100 - product.pricePercentageSkew)) / 100
  );

  const {
    taxInGrosz,
    lineTotalInGrosz,
    unitPriceInGrosz,
    discountAmountInGrosz,
  } = calculatePriceData(priceInGrosz);

  return {
    taxInGrosz,
    lineTotalInGrosz,
    unitPriceInGrosz,
    discountAmountInGrosz,
  };
};

export function getReservationData(
  piece: DBQueryResult<"pieces", {}>,
  currentUserId?: string
):
  | {
      isReserved: false;
      expiresAt: null;
      isOwnedByCurrentUser: false;
    }
  | {
      isReserved: true;
      expiresAt: Date;
      isOwnedByCurrentUser: boolean;
    } {
  const now = new Date();
  const reservationExpiresAt = piece.reservedUntil;
  const isReserved =
    reservationExpiresAt && reservationExpiresAt > now ? true : false;
  if (isReserved && reservationExpiresAt) {
    return {
      isReserved: true,
      expiresAt: reservationExpiresAt,
      isOwnedByCurrentUser: piece.reservedByUserId === currentUserId,
    };
  } else {
    return {
      isReserved: false,
      expiresAt: null,
      isOwnedByCurrentUser: false,
    };
  }
}

export function ungroupPurchasableItems<
  TProduct extends { id: string },
  TPiece extends { id: string },
>(
  products: (TProduct & { pieces: TPiece[] })[],
  pieces: TPiece[]
): {
  items: Array<{
    product?: TProduct | null | undefined;
    productId?: string | null | undefined;
    piece: TPiece;
  }>;
} {
  const items: {
    product?: TProduct | null | undefined;
    productId?: string | null | undefined;
    piece: TPiece;
  }[] = [];
  for (const product of products) {
    for (const piece of product.pieces) {
      items.push({ product, productId: product.id, piece });
    }
  }
  for (const piece of pieces) {
    items.push({ piece });
  }
  return { items };
}

export function groupPurchasableItems<
  TProduct extends { id: string },
  TPiece extends { id: string },
>(
  items: {
    product?: TProduct | null | undefined;
    productId?: string | null | undefined;
    piece: TPiece;
  }[]
): {
  products: (TProduct & { pieces: TPiece[] })[];
  pieces: TPiece[];
} {
  const products: (TProduct & {
    pieces: TPiece[];
  })[] = [];
  const pieces: TPiece[] = [];

  for (const item of items) {
    if (item.productId && item.product) {
      const existingProductIndex = products.findIndex(
        (p) => p.id === item.productId
      );
      if (existingProductIndex !== -1) {
        products[existingProductIndex].pieces.push(item.piece);
      } else {
        products.push({ ...item.product, pieces: [item.piece] });
      }
    } else {
      pieces.push(item.piece);
    }
  }

  return {
    products,
    pieces,
  };
}
