import {
  accounts,
  brands,
  categories,
  consentRecords,
  coupons,
  couponsToPieces,
  couponsToProducts,
  deliveryMethodEnum,
  discounts,
  genderEnum,
  images,
  measurements,
  orderItems,
  orderStatusEnum,
  orderTimelineEvents,
  orders,
  pieces,
  piecesToTags,
  productStatusEnum,
  products,
  promotionCodes,
  returnItems,
  returnStatusEnum,
  returnTimelineEvents,
  returns,
  roleEnum,
  sessions,
  sizes,
  tags,
  users,
  verifications,
} from "db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

// Account
export const SAccount = createSelectSchema(accounts);
export type Account = z.infer<typeof SAccount>;
export const SAccountInsert = createInsertSchema(accounts);
export type AccountInsert = z.infer<typeof SAccountInsert>;
export const SAccountUpdate = createUpdateSchema(accounts);
export type AccountUpdate = z.infer<typeof SAccountUpdate>;

// Brand
export const SBrand = createSelectSchema(brands);
export type Brand = z.infer<typeof SBrand>;
export const SBrandInsert = createInsertSchema(brands);
export type BrandInsert = z.infer<typeof SBrandInsert>;
export const SBrandUpdate = createUpdateSchema(brands);
export type BrandUpdate = z.infer<typeof SBrandUpdate>;

// Category
export const SCategory = createSelectSchema(categories);
export type Category = z.infer<typeof SCategory>;
export const SCategoryInsert = createInsertSchema(categories);
export type CategoryInsert = z.infer<typeof SCategoryInsert>;
export const SCategoryUpdate = createUpdateSchema(categories);
export type CategoryUpdate = z.infer<typeof SCategoryUpdate>;

// Consent Record
export const SConsentRecord = createSelectSchema(consentRecords);
export type ConsentRecord = z.infer<typeof SConsentRecord>;
export const SConsentRecordInsert = createInsertSchema(consentRecords);
export type ConsentRecordInsert = z.infer<typeof SConsentRecordInsert>;
export const SConsentRecordUpdate = createUpdateSchema(consentRecords);
export type ConsentRecordUpdate = z.infer<typeof SConsentRecordUpdate>;

// Coupon
export const SCoupon = createSelectSchema(coupons);
export type Coupon = z.infer<typeof SCoupon>;
export const SCouponInsert = createInsertSchema(coupons);
export type CouponInsert = z.infer<typeof SCouponInsert>;
export const SCouponUpdate = createUpdateSchema(coupons);
export type CouponUpdate = z.infer<typeof SCouponUpdate>;

// Coupon to Piece
export const SCouponToPiece = createSelectSchema(couponsToPieces);
export type CouponToPiece = z.infer<typeof SCouponToPiece>;
export const SCouponToPieceInsert = createInsertSchema(couponsToPieces);
export type CouponToPieceInsert = z.infer<typeof SCouponToPieceInsert>;
export const SCouponToPieceUpdate = createUpdateSchema(couponsToPieces);
export type CouponToPieceUpdate = z.infer<typeof SCouponToPieceUpdate>;

// Coupon to Product
export const SCouponToProduct = createSelectSchema(couponsToProducts);
export type CouponToProduct = z.infer<typeof SCouponToProduct>;
export const SCouponToProductInsert = createInsertSchema(couponsToProducts);
export type CouponToProductInsert = z.infer<typeof SCouponToProductInsert>;
export const SCouponToProductUpdate = createUpdateSchema(couponsToProducts);
export type CouponToProductUpdate = z.infer<typeof SCouponToProductUpdate>;

// Delivery Method
export const SDeliveryMethod = createSelectSchema(deliveryMethodEnum);
export type DeliveryMethod = z.infer<typeof SDeliveryMethod>;

// Discount
export const SDiscount = createSelectSchema(discounts);
export type Discount = z.infer<typeof SDiscount>;
export const SDiscountInsert = createInsertSchema(discounts);
export type DiscountInsert = z.infer<typeof SDiscountInsert>;
export const SDiscountUpdate = createUpdateSchema(discounts);
export type DiscountUpdate = z.infer<typeof SDiscountUpdate>;

// Gender
export const SGender = createSelectSchema(genderEnum);
export type Gender = z.infer<typeof SGender>;

// Image
export const SImage = createSelectSchema(images);
export type Image = z.infer<typeof SImage>;
export const SImageInsert = createInsertSchema(images);
export type ImageInsert = z.infer<typeof SImageInsert>;
export const SImageUpdate = createUpdateSchema(images);
export type ImageUpdate = z.infer<typeof SImageUpdate>;

// Measurement
export const SMeasurement = createSelectSchema(measurements);
export type Measurement = z.infer<typeof SMeasurement>;
export const SMeasurementInsert = createInsertSchema(measurements);
export type MeasurementInsert = z.infer<typeof SMeasurementInsert>;
export const SMeasurementUpdate = createUpdateSchema(measurements);
export type MeasurementUpdate = z.infer<typeof SMeasurementUpdate>;

// Order Item
export const SOrderItem = createSelectSchema(orderItems);
export type OrderItem = z.infer<typeof SOrderItem>;
export const SOrderItemInsert = createInsertSchema(orderItems);
export type OrderItemInsert = z.infer<typeof SOrderItemInsert>;
export const SOrderItemUpdate = createUpdateSchema(orderItems);
export type OrderItemUpdate = z.infer<typeof SOrderItemUpdate>;

// Order Status
export const SOrderStatus = createSelectSchema(orderStatusEnum);
export type OrderStatus = z.infer<typeof SOrderStatus>;

// Order Timeline Event
export const SOrderTimelineEvent = createSelectSchema(orderTimelineEvents);
export type OrderTimelineEvent = z.infer<typeof SOrderTimelineEvent>;
export const SOrderTimelineEventInsert =
  createInsertSchema(orderTimelineEvents);
export type OrderTimelineEventInsert = z.infer<
  typeof SOrderTimelineEventInsert
>;
export const SOrderTimelineEventUpdate =
  createUpdateSchema(orderTimelineEvents);
export type OrderTimelineEventUpdate = z.infer<
  typeof SOrderTimelineEventUpdate
>;

// Order
export const SOrder = createSelectSchema(orders);
export type Order = z.infer<typeof SOrder>;
export const SOrderInsert = createInsertSchema(orders);
export type OrderInsert = z.infer<typeof SOrderInsert>;
export const SOrderUpdate = createUpdateSchema(orders);
export type OrderUpdate = z.infer<typeof SOrderUpdate>;

// Piece
export const SPiece = createSelectSchema(pieces);
export type Piece = z.infer<typeof SPiece>;
export const SPieceInsert = createInsertSchema(pieces);
export type PieceInsert = z.infer<typeof SPieceInsert>;
export const SPieceUpdate = createUpdateSchema(pieces);
export type PieceUpdate = z.infer<typeof SPieceUpdate>;

// Piece to Tag
export const SPieceToTag = createSelectSchema(piecesToTags);
export type PieceToTag = z.infer<typeof SPieceToTag>;
export const SPieceToTagInsert = createInsertSchema(piecesToTags);
export type PieceToTagInsert = z.infer<typeof SPieceToTagInsert>;
export const SPieceToTagUpdate = createUpdateSchema(piecesToTags);
export type PieceToTagUpdate = z.infer<typeof SPieceToTagUpdate>;

// Product Status
export const SProductStatus = createSelectSchema(productStatusEnum);
export type ProductStatus = z.infer<typeof SProductStatus>;

// Product
export const SProduct = createSelectSchema(products);
export type Product = z.infer<typeof SProduct>;
export const SProductInsert = createInsertSchema(products);
export type ProductInsert = z.infer<typeof SProductInsert>;
export const SProductUpdate = createUpdateSchema(products);
export type ProductUpdate = z.infer<typeof SProductUpdate>;

// Promotion Code
export const SPromotionCode = createSelectSchema(promotionCodes);
export type PromotionCode = z.infer<typeof SPromotionCode>;
export const SPromotionCodeInsert = createInsertSchema(promotionCodes);
export type PromotionCodeInsert = z.infer<typeof SPromotionCodeInsert>;
export const SPromotionCodeUpdate = createUpdateSchema(promotionCodes);
export type PromotionCodeUpdate = z.infer<typeof SPromotionCodeUpdate>;

// Return Item
export const SReturnItem = createSelectSchema(returnItems);
export type ReturnItem = z.infer<typeof SReturnItem>;
export const SReturnItemInsert = createInsertSchema(returnItems);
export type ReturnItemInsert = z.infer<typeof SReturnItemInsert>;
export const SReturnItemUpdate = createUpdateSchema(returnItems);
export type ReturnItemUpdate = z.infer<typeof SReturnItemUpdate>;

// Return Status
export const SReturnStatus = createSelectSchema(returnStatusEnum);
export type ReturnStatus = z.infer<typeof SReturnStatus>;

// Return Timeline Event
export const SReturnTimelineEvent = createSelectSchema(returnTimelineEvents);
export type ReturnTimelineEvent = z.infer<typeof SReturnTimelineEvent>;
export const SReturnTimelineEventInsert =
  createInsertSchema(returnTimelineEvents);
export type ReturnTimelineEventInsert = z.infer<
  typeof SReturnTimelineEventInsert
>;
export const SReturnTimelineEventUpdate =
  createUpdateSchema(returnTimelineEvents);
export type ReturnTimelineEventUpdate = z.infer<
  typeof SReturnTimelineEventUpdate
>;

// Return
export const SReturn = createSelectSchema(returns);
export type Return = z.infer<typeof SReturn>;
export const SReturnInsert = createInsertSchema(returns);
export type ReturnInsert = z.infer<typeof SReturnInsert>;
export const SReturnUpdate = createUpdateSchema(returns);
export type ReturnUpdate = z.infer<typeof SReturnUpdate>;

// Role
export const SRole = createSelectSchema(roleEnum);
export type Role = z.infer<typeof SRole>;

// Session
export const SSession = createSelectSchema(sessions);
export type Session = z.infer<typeof SSession>;
export const SSessionInsert = createInsertSchema(sessions);
export type SessionInsert = z.infer<typeof SSessionInsert>;
export const SSessionUpdate = createUpdateSchema(sessions);
export type SessionUpdate = z.infer<typeof SSessionUpdate>;

// Size
export const SSize = createSelectSchema(sizes);
export type Size = z.infer<typeof SSize>;
export const SSizeInsert = createInsertSchema(sizes);
export type SizeInsert = z.infer<typeof SSizeInsert>;
export const SSizeUpdate = createUpdateSchema(sizes);
export type SizeUpdate = z.infer<typeof SSizeUpdate>;

// Tag
export const STag = createSelectSchema(tags);
export type Tag = z.infer<typeof STag>;
export const STagInsert = createInsertSchema(tags);
export type TagInsert = z.infer<typeof STagInsert>;
export const STagUpdate = createUpdateSchema(tags);
export type TagUpdate = z.infer<typeof STagUpdate>;

// User
export const SUser = createSelectSchema(users);
export type User = z.infer<typeof SUser>;
export const SUserInsert = createInsertSchema(users);
export type UserInsert = z.infer<typeof SUserInsert>;
export const SUserUpdate = createUpdateSchema(users);
export type UserUpdate = z.infer<typeof SUserUpdate>;

// Verification
export const SVerification = createSelectSchema(verifications);
export type Verification = z.infer<typeof SVerification>;
export const SVerificationInsert = createInsertSchema(verifications);
export type VerificationInsert = z.infer<typeof SVerificationInsert>;
export const SVerificationUpdate = createUpdateSchema(verifications);
export type VerificationUpdate = z.infer<typeof SVerificationUpdate>;
