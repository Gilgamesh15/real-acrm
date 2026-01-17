import {
  ProductCardContent,
  ProductCardImageSkeleton,
  ProductCardInfoSkeleton,
  ProductCardMeasurementsSkeleton,
  ProductCardMedia,
  ProductCardPriceSkeleton,
  ProductCardRoot,
} from "../product-card-primitives";

const DetailedPieceCardSkeleton = () => {
  return (
    <ProductCardRoot size="sm">
      <ProductCardMedia size="md">
        <ProductCardImageSkeleton />
      </ProductCardMedia>
      <ProductCardContent orientation="vertical">
        <ProductCardContent>
          <ProductCardInfoSkeleton
            orientation="vertical"
            showBrandAndSize={true}
          />
          <ProductCardPriceSkeleton />
        </ProductCardContent>
        <ProductCardMeasurementsSkeleton />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { DetailedPieceCardSkeleton };
