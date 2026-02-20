import {
  convertFormDataToObject,
  convertObjectToFormData,
} from "@abyrd9/zod-form-data";
import type { VariantProps } from "class-variance-authority";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import type { GTagItem } from "global";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import baseSlugify from "slugify";
import { twMerge } from "tailwind-merge";
import * as z4 from "zod/v4/core";

import type { badgeVariants } from "~/components/ui/badge";

import type {
  Address,
  CatalogSortBy,
  CatalogSortOrder,
  DBQueryResult,
  DiscountInfo,
  Gender,
  OrderDetails,
  OrderStatus,
  PriceData,
  PriceDisplayData,
  ProductStatus,
  TreeNode,
  TreeNodePathSegment,
  TreeNodeWithPath,
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

// Construct slug path from node
export function getSlugPath(node: TreeNodeWithPath): string {
  return node.path.map((p) => p.slug).join("/");
}

export function getIsLeaf<T extends TreeNode>(
  nodes: T[],
  nodeId: string
): boolean {
  return !nodes.some((n) => n.parentId === nodeId);
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

export type FilterArgs = {
  brands: string[];
  sizes: string[];
  tags: string[];
  priceMin: number;
  priceMax: number;
  limit: number;
  offset: number;
  sortBy: "date" | "relevance" | "price" | "alphabetical";
  sortOrder: "asc" | "desc";
  search?: string | undefined;
  category?: string | undefined;
  gender?: "male" | "female" | "unisex" | undefined;
};

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
// ─── Internal helpers ────────────────────────────────────────────────────────

function normalizeDiscount(
  dbDiscount:
    | DBQueryResult<
        "discounts",
        {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        }
      >
    | null
    | undefined
): DiscountInfo {
  if (!dbDiscount) return { type: "none" };

  if (dbDiscount.amountOffInGrosz && dbDiscount.amountOffInGrosz > 0)
    return { type: "fixed", amountOffInGrosz: dbDiscount.amountOffInGrosz };

  if (dbDiscount.percentOff && dbDiscount.percentOff > 0)
    return {
      type: "percentage",
      percentOff: Math.min(dbDiscount.percentOff, 100),
    };

  return { type: "none" };
}

function calculateDiscountAmount(
  bruttoInGrosz: number,
  discount: DiscountInfo
): number {
  switch (discount.type) {
    case "percentage":
      return Math.round(bruttoInGrosz * (discount.percentOff / 100));
    case "fixed":
      return Math.min(discount.amountOffInGrosz, bruttoInGrosz);
    case "none":
      return 0;
  }
}

// Takes a brutto price, applies a single discount, returns full breakdown.
// Tax is extracted from the final brutto — not added on top.
function applyDiscountAndBreakdown(
  bruttoInGrosz: number,
  discount: DiscountInfo
): PriceData {
  const discountAmountInGrosz = calculateDiscountAmount(
    bruttoInGrosz,
    discount
  );
  const lineTotalInGrosz = bruttoInGrosz - discountAmountInGrosz;
  const taxInGrosz = Math.round(lineTotalInGrosz * (23 / 123));
  const unitPriceInGrosz = lineTotalInGrosz - taxInGrosz;

  return {
    discountAmountInGrosz,
    lineTotalInGrosz,
    taxInGrosz,
    unitPriceInGrosz,
  };
}

// ─── Backend exports ─────────────────────────────────────────────────────────
// Piece with product: piece discount first, then product discount on the result.
// Tax extracted once at the end from the final brutto.

export function calculatePiecePrice(
  piece: DBQueryResult<
    "pieces",
    {
      columns: {
        priceInGrosz: true;
      };
      with: {
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
        product: {
          columns: {};
          with: {
            discount: {
              columns: {
                amountOffInGrosz: true;
                percentOff: true;
              };
            };
          };
        };
      };
    }
  >
): PriceData {
  const pieceDiscount = normalizeDiscount(piece.discount);
  const pieceDiscountAmount = calculateDiscountAmount(
    piece.priceInGrosz,
    pieceDiscount
  );
  const afterPieceDiscount = piece.priceInGrosz - pieceDiscountAmount;

  // Product discount applies to the already-discounted brutto
  const productDiscount = normalizeDiscount(piece.product?.discount);
  const final = applyDiscountAndBreakdown(afterPieceDiscount, productDiscount);

  return {
    discountAmountInGrosz: pieceDiscountAmount + final.discountAmountInGrosz,
    lineTotalInGrosz: final.lineTotalInGrosz,
    taxInGrosz: final.taxInGrosz,
    unitPriceInGrosz: final.unitPriceInGrosz,
  };
}

// Product: sum pieces after their individual discounts, apply product discount
// to that sum, extract tax once from the final total.

export function calculateProductPrice(
  product: DBQueryResult<
    "products",
    {
      columns: {};
      with: {
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
        pieces: {
          columns: {
            priceInGrosz: true;
          };
          with: {
            discount: {
              columns: {
                amountOffInGrosz: true;
                percentOff: true;
              };
            };
          };
        };
      };
    }
  >
): PriceData {
  let totalPieceDiscountsInGrosz = 0;
  let totalAfterPieceDiscounts = 0;

  for (const piece of product.pieces) {
    const pieceDiscount = normalizeDiscount(piece.discount);
    const pieceDiscountAmount = calculateDiscountAmount(
      piece.priceInGrosz,
      pieceDiscount
    );
    totalPieceDiscountsInGrosz += pieceDiscountAmount;
    totalAfterPieceDiscounts += piece.priceInGrosz - pieceDiscountAmount;
  }

  // Product discount on the summed post-piece-discount brutto
  const productDiscount = normalizeDiscount(product.discount);
  const final = applyDiscountAndBreakdown(
    totalAfterPieceDiscounts,
    productDiscount
  );

  return {
    discountAmountInGrosz:
      totalPieceDiscountsInGrosz + final.discountAmountInGrosz,
    lineTotalInGrosz: final.lineTotalInGrosz,
    taxInGrosz: final.taxInGrosz,
    unitPriceInGrosz: final.unitPriceInGrosz,
  };
}

// ─── Frontend exports ────────────────────────────────────────────────────────
// Display data only — no tax breakdown needed here.
// Piece: shows its own discount only (product discount is shown at bundle level).
// Product: "original price" is the sum of pieces after their own discounts,
//          then the product discount is shown as the savings on top of that.

export function calculatePiecePriceDisplayData(
  piece: DBQueryResult<
    "pieces",
    {
      columns: {
        priceInGrosz: true;
      };
      with: {
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
      };
    }
  >
): PriceDisplayData {
  const discount = normalizeDiscount(piece.discount);
  const savingsInGrosz = calculateDiscountAmount(piece.priceInGrosz, discount);
  const finalPriceInGrosz = piece.priceInGrosz - savingsInGrosz;

  return {
    originalPrice: priceFromGrosz(piece.priceInGrosz),
    finalPrice: priceFromGrosz(finalPriceInGrosz),
    savings: priceFromGrosz(savingsInGrosz),
    discount,
    hasDiscount: savingsInGrosz > 0,
  };
}

export function calculateProductPriceDisplayData(
  product: DBQueryResult<
    "products",
    {
      columns: {};
      with: {
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
        pieces: {
          columns: {
            priceInGrosz: true;
          };
          with: {
            discount: {
              columns: {
                amountOffInGrosz: true;
                percentOff: true;
              };
            };
          };
        };
      };
    }
  >
): PriceDisplayData {
  // Base = sum of each piece after its own discount
  let originalPriceInGrosz = 0;
  for (const piece of product.pieces) {
    const pieceDiscount = normalizeDiscount(piece.discount);
    const pieceDiscountAmount = calculateDiscountAmount(
      piece.priceInGrosz,
      pieceDiscount
    );
    originalPriceInGrosz += piece.priceInGrosz - pieceDiscountAmount;
  }

  // Product discount applies to that sum
  const discount = normalizeDiscount(product.discount);
  const savingsInGrosz = calculateDiscountAmount(
    originalPriceInGrosz,
    discount
  );
  const finalPriceInGrosz = originalPriceInGrosz - savingsInGrosz;

  return {
    originalPrice: priceFromGrosz(originalPriceInGrosz),
    finalPrice: priceFromGrosz(finalPriceInGrosz),
    savings: priceFromGrosz(savingsInGrosz),
    discount,
    hasDiscount: savingsInGrosz > 0,
  };
}

export function calculateProductPiecePriceDisplayData(
  piece: DBQueryResult<
    "pieces",
    {
      columns: { priceInGrosz: true };
      with: {
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
      };
    }
  >,
  product: DBQueryResult<
    "products",
    {
      columns: {};
      with: {
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
      };
    }
  >
): PriceDisplayData {
  const pieceDiscount = normalizeDiscount(piece.discount);
  const pieceDiscountAmount = calculateDiscountAmount(
    piece.priceInGrosz,
    pieceDiscount
  );
  const afterPieceDiscount = piece.priceInGrosz - pieceDiscountAmount;

  // Product discount applies to the already-discounted brutto
  const productDiscount = normalizeDiscount(product.discount);
  const productDiscountAmount = calculateDiscountAmount(
    afterPieceDiscount,
    productDiscount
  );

  const afterProductDiscount = afterPieceDiscount - productDiscountAmount;
  const savingsInGrosz = pieceDiscountAmount + productDiscountAmount;

  let discount: DiscountInfo = { type: "none" };
  if (pieceDiscount.type !== "none" && productDiscount.type !== "none") {
    discount = {
      type: "fixed",
      amountOffInGrosz: pieceDiscountAmount + productDiscountAmount,
    };
  } else if (pieceDiscount.type !== "none") {
    discount = pieceDiscount;
  } else if (productDiscount.type !== "none") {
    discount = productDiscount;
  }

  return {
    originalPrice: priceFromGrosz(piece.priceInGrosz),
    finalPrice: priceFromGrosz(afterProductDiscount),
    savings: priceFromGrosz(savingsInGrosz),
    discount,
    hasDiscount: savingsInGrosz > 0,
  };
}

export function formatDiscountLabel(
  discount: DiscountInfo
): string | undefined {
  switch (discount.type) {
    case "percentage":
      return `-${discount.percentOff}%`;
    case "fixed":
      return `-${new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(priceFromGrosz(discount.amountOffInGrosz))}`;
    case "none":
    default:
      return undefined;
  }
}
export function priceDataToDisplayData(pricing: PriceData): PriceDisplayData {
  const hasDiscount = pricing.discountAmountInGrosz > 0;
  const originalBrutto =
    pricing.lineTotalInGrosz + pricing.discountAmountInGrosz;
  return {
    originalPrice: priceFromGrosz(originalBrutto),
    finalPrice: priceFromGrosz(pricing.lineTotalInGrosz),
    savings: priceFromGrosz(pricing.discountAmountInGrosz),
    discount: hasDiscount
      ? {
          type: "fixed",
          amountOffInGrosz: pricing.discountAmountInGrosz,
        }
      : {
          type: "none",
        },
    hasDiscount,
  };
}
export function groupOrderItems<
  TProduct extends { id: string },
  TPiece extends { id: string },
>(
  items: ({
    product?: TProduct | null | undefined;
    productId?: string | null | undefined;
    piece: TPiece;
  } & PriceData)[]
): {
  products: (Omit<TProduct, "discountId" | "discount"> & {
    pieces: (Omit<TPiece, "priceInGrosz" | "discountId" | "discount"> &
      PriceData)[];
  } & PriceData)[];
  pieces: (Omit<TPiece, "priceInGrosz" | "discountId" | "discount"> &
    PriceData)[];
} {
  const { products, pieces } = groupPurchasableItems<
    Omit<TProduct, "discountId" | "discount"> & PriceData,
    Omit<TPiece, "priceInGrosz" | "discountId" | "discount"> & PriceData
  >(
    items.map((item) => ({
      product: item.product
        ? {
            ...item.product,
            discount: undefined,
            discountId: undefined,
            taxInGrosz: item.taxInGrosz,
            lineTotalInGrosz: item.lineTotalInGrosz,
            discountAmountInGrosz: item.discountAmountInGrosz,
            unitPriceInGrosz: item.unitPriceInGrosz,
          }
        : undefined,
      productId: item.productId,
      piece: {
        ...item.piece,
        discount: undefined,
        discountId: undefined,
        priceInGrosz: undefined,
        taxInGrosz: item.taxInGrosz,
        lineTotalInGrosz: item.lineTotalInGrosz,
        discountAmountInGrosz: item.discountAmountInGrosz,
        unitPriceInGrosz: item.unitPriceInGrosz,
      },
    }))
  );

  return {
    products,
    pieces,
  };
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
  products: (TProduct & {
    pieces: TPiece[];
  })[];
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

export function productToGoogleAnalyticsItem(
  product: DBQueryResult<
    "products",
    {
      columns: {
        id: true;
        name: true;
      };
      with: {
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
        pieces: {
          columns: {
            id: true;
            name: true;
            priceInGrosz: true;
          };
          with: {
            discount: {
              columns: {
                amountOffInGrosz: true;
                percentOff: true;
              };
            };
            brand: {
              columns: {
                name: true;
              };
            };
            category: {
              columns: {
                path: true;
                name: true;
              };
            };
          };
        };
      };
    }
  >,
  details: Partial<{
    item_list_id: string;
    item_list_name: string;
    index: number;
  }> = {}
): GTagItem[] {
  // from last to first
  return product.pieces.map((piece) => {
    const sortedCategoryPath = piece.category?.path.reverse() ?? [];
    const pricing = calculateProductPiecePriceDisplayData(piece, product);
    return {
      item_id: piece.id,
      item_name: piece.name,
      ...(piece.brand ? { item_brand: piece.brand.name } : {}),
      price: pricing.finalPrice,
      ...(pricing.hasDiscount
        ? {
            discount: pricing.savings,
          }
        : {}),
      ...(sortedCategoryPath[0]?.name
        ? { item_category: sortedCategoryPath[0]?.name }
        : {}),
      ...(sortedCategoryPath[1]?.name
        ? { item_category_2: sortedCategoryPath[1]?.name }
        : {}),
      ...(sortedCategoryPath[2]?.name
        ? { item_category_3: sortedCategoryPath[2]?.name }
        : {}),
      ...(sortedCategoryPath[3]?.name
        ? { item_category_4: sortedCategoryPath[3]?.name }
        : {}),
      ...(sortedCategoryPath[4]?.name
        ? { item_category_5: sortedCategoryPath[4]?.name }
        : {}),
      ...details,
    };
  });
}

export function pieceToGoogleAnalyticsItem(
  piece: DBQueryResult<
    "pieces",
    {
      columns: {
        id: true;
        name: true;
        priceInGrosz: true;
      };
      with: {
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
        brand: {
          columns: {
            name: true;
          };
        };
        category: {
          columns: {
            path: true;
            name: true;
          };
        };
      };
    }
  >,
  details: Partial<{
    item_list_id: string;
    item_list_name: string;
    index: number;
  }> = {}
): GTagItem {
  // from last to first
  const sortedCategoryPath = piece.category?.path.reverse() ?? [];
  const pricing = calculatePiecePriceDisplayData(piece);
  return {
    item_id: piece.id,
    item_name: piece.name,
    ...(piece.brand ? { item_brand: piece.brand.name } : {}),
    price: pricing.finalPrice,
    ...(pricing.hasDiscount
      ? {
          discount: pricing.savings,
        }
      : {}),
    ...(sortedCategoryPath[0]?.name
      ? { item_category: sortedCategoryPath[0]?.name }
      : {}),
    ...(sortedCategoryPath[1]?.name
      ? { item_category_2: sortedCategoryPath[1]?.name }
      : {}),
    ...(sortedCategoryPath[2]?.name
      ? { item_category_3: sortedCategoryPath[2]?.name }
      : {}),
    ...(sortedCategoryPath[3]?.name
      ? { item_category_4: sortedCategoryPath[3]?.name }
      : {}),
    ...(sortedCategoryPath[4]?.name
      ? { item_category_5: sortedCategoryPath[4]?.name }
      : {}),
    ...details,
  };
}

export function orderItemsToGoogleAnalyticsItems(
  item: DBQueryResult<
    "orderItems",
    {
      with: {
        piece: {
          columns: {
            id: true;
            name: true;
          };
          with: {
            brand: {
              columns: {
                name: true;
              };
            };
            category: {
              columns: {
                path: true;
                name: true;
              };
            };
          };
        };
      };
    }
  >
): GTagItem {
  // from last to first
  const sortedCategoryPath = item.piece.category?.path.reverse() ?? [];
  const pricing = priceDataToDisplayData(item);
  return {
    item_id: item.piece.id,
    item_name: item.piece.name,
    ...(item.piece.brand ? { item_brand: item.piece.brand.name } : {}),
    price: pricing.finalPrice,
    ...(pricing.hasDiscount
      ? {
          discount: pricing.savings,
        }
      : {}),
    ...(sortedCategoryPath[0]?.name
      ? { item_category: sortedCategoryPath[0]?.name }
      : {}),
    ...(sortedCategoryPath[1]?.name
      ? { item_category_2: sortedCategoryPath[1]?.name }
      : {}),
    ...(sortedCategoryPath[2]?.name
      ? { item_category_3: sortedCategoryPath[2]?.name }
      : {}),
    ...(sortedCategoryPath[3]?.name
      ? { item_category_4: sortedCategoryPath[3]?.name }
      : {}),
    ...(sortedCategoryPath[4]?.name
      ? { item_category_5: sortedCategoryPath[4]?.name }
      : {}),
  };
}
