import {
  ProductCardContent,
  ProductCardImageSkeleton,
  ProductCardInfoSkeleton,
  ProductCardMedia,
  ProductCardPiecesSkeleton,
  ProductCardPriceSkeleton,
  ProductCardRoot,
  ProductCardToggleSkeleton,
} from "../product-card-primitives";

const ReturnProductCardSkeleton = () => {
  return (
    <ProductCardRoot>
      <ProductCardMedia>
        <ProductCardToggleSkeleton />
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

export { ReturnProductCardSkeleton };
