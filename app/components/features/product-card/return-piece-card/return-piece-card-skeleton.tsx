import {
  ProductCardContent,
  ProductCardImageSkeleton,
  ProductCardInfoSkeleton,
  ProductCardMedia,
  ProductCardPriceSkeleton,
  ProductCardRoot,
  ProductCardToggleSkeleton,
} from "../product-card-primitives";

const ReturnPieceCardSkeleton = () => {
  return (
    <ProductCardRoot size="sm">
      <ProductCardMedia size="sm">
        <ProductCardToggleSkeleton />
        <ProductCardImageSkeleton />
      </ProductCardMedia>
      <ProductCardContent orientation="horizontal">
        <ProductCardInfoSkeleton
          orientation="vertical"
          showBrandAndSize={true}
        />
        <ProductCardPriceSkeleton />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { ReturnPieceCardSkeleton };
