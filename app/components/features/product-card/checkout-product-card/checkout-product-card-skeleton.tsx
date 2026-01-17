import {
  ProductCardContent,
  ProductCardImageSkeleton,
  ProductCardInfoSkeleton,
  ProductCardMedia,
  ProductCardPiecesSkeleton,
  ProductCardPriceSkeleton,
  ProductCardRoot,
} from "../product-card-primitives";

const CheckoutProductCardSkeleton = () => {
  return (
    <ProductCardRoot>
      <ProductCardMedia>
        <ProductCardImageSkeleton />
      </ProductCardMedia>
      <ProductCardContent>
        <ProductCardInfoSkeleton />
        <ProductCardPriceSkeleton />
      </ProductCardContent>

      <ProductCardPiecesSkeleton />
    </ProductCardRoot>
  );
};

export { CheckoutProductCardSkeleton };
