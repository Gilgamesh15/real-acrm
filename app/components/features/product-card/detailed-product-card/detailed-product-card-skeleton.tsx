import {
  ProductCardContent,
  ProductCardImageSkeleton,
  ProductCardInfoSkeleton,
  ProductCardMedia,
  ProductCardPiecesSkeleton,
  ProductCardPriceSkeleton,
  ProductCardRoot,
} from "../product-card-primitives";

const DetailedProductCardSkeleton = () => {
  return (
    <ProductCardRoot>
      <ProductCardMedia size="lg">
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

export { DetailedProductCardSkeleton };
