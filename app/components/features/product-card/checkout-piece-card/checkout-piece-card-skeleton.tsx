import {
  ProductCardContent,
  ProductCardImageSkeleton,
  ProductCardInfoSkeleton,
  ProductCardMedia,
  ProductCardPriceSkeleton,
  ProductCardRoot,
} from "../product-card-primitives";

const CheckoutPieceCardSkeleton = () => {
  return (
    <ProductCardRoot size="sm">
      <ProductCardMedia size="sm">
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

export { CheckoutPieceCardSkeleton };
