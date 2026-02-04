import type { JSONContent, Node } from "@tiptap/core";
import type * as schema from "db/schema";
import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import { data } from "react-router";

import type { Auth } from "./auth";
import type { AuthClient } from "./auth-client";

export type RichText = Node | JSONContent;

export type TablesWithRelations = ExtractTablesWithRelations<typeof schema>;

export type DBQueryArgs<
  TTable extends keyof TablesWithRelations,
  TMode extends "many" | "one" = "many",
  TIsRoot extends boolean = true,
> = DBQueryConfig<
  TMode,
  TIsRoot,
  ExtractTablesWithRelations<typeof schema>,
  ExtractTablesWithRelations<typeof schema>[TTable]
>;

export type DBQueryResult<
  TTable extends keyof TablesWithRelations,
  TConfig extends DBQueryArgs<TTable>,
> = BuildQueryResult<
  ExtractTablesWithRelations<typeof schema>,
  ExtractTablesWithRelations<typeof schema>[TTable],
  TConfig
>;

export type TreeNode = {
  id: string;
  parentId?: string | null | undefined;
  name: string;
  slug: string;
};

export type TreeNodePathSegment = {
  name: string;
  slug: string;
};

export type TreeNodeWithPath = TreeNode & {
  path: Array<TreeNodePathSegment>;
};

export type Session = ReturnType<AuthClient["useSession"]["get"]>;

export type ServerSession = NonNullable<
  Awaited<ReturnType<Auth["api"]["getSession"]>>
>;

export type CatalogSortBy = "relevance" | "price" | "date" | "alphabetical";

export type CatalogSortOrder = "asc" | "desc";

export type DataWithResponseInit<D> = ReturnType<typeof data<D>>;

export interface InpostApiLocker {
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: {
    line1: string;
    line2?: string;
  };
  opening_hours: string;
  address_details: {
    city: string;
    post_code: string;
    street?: string;
    building_number?: string;
  };
  image_url: string;
  location_description: string;
  operating_hours_extended: {
    customer: {
      monday: { start: number; end: number }[];
      tuesday: { start: number; end: number }[];
      wednesday: { start: number; end: number }[];
      thursday: { start: number; end: number }[];
      friday: { start: number; end: number }[];
      saturday: { start: number; end: number }[];
      sunday: { start: number; end: number }[];
    };
  };
}

export interface OpenStreetMapResult {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
}

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type PersonalDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type ReturnRequestDetails = {
  personalDetails: PersonalDetails;
};

// Order Data Types

export type Address = {
  city: string;
  line1: string;
  line2?: string;
  country: string;
  postalCode: string;
};

export type OrderDetails = {
  billingName: string;
  billingAddress: Address;
  deliveryName: string;
  phoneNumber: string;
  email: string;
} & (
  | {
      deliveryMethod: "locker";
      lockerCode: string;
      deliveryAddress?: undefined;
    }
  | {
      deliveryMethod: "courier";
      lockerCode?: undefined;
      deliveryAddress: Address;
    }
);

// ========================== DATABASE PRIMITIVE TYPES ==========================

// enums
export type Gender = (typeof schema.genderEnum.enumValues)[number];
export type DeliveryMethod =
  (typeof schema.deliveryMethodEnum.enumValues)[number];
export type OrderStatus = (typeof schema.orderStatusEnum.enumValues)[number];
export type ProductStatus =
  (typeof schema.productStatusEnum.enumValues)[number];
export type ReturnStatus = (typeof schema.returnStatusEnum.enumValues)[number];
export type Role = (typeof schema.roleEnum.enumValues)[number];

export type CloudinaryResult = {
  secure_url: string;
  width: number;
  height: number;
  original_filename: string;
  public_id: string;
  format: string;
  bytes: number;
};

export type LocalStorageCart = Array<{
  pieceId: string;
  productId?: string;
}>;
