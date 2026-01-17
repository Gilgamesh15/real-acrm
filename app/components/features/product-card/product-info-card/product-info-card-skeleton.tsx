import {
  ProductCardContent,
  ProductCardImageSkeleton,
  ProductCardInfoSkeleton,
  ProductCardMedia,
  ProductCardPriceSkeleton,
  ProductCardRoot,
} from "../product-card-primitives";

const ProductInfoCardSkeleton = () => {
  return (
    <ProductCardRoot size="sm">
      <ProductCardMedia size="sm">
        <ProductCardImageSkeleton />
      </ProductCardMedia>
      <ProductCardContent>
        <ProductCardInfoSkeleton showBrandAndSize={false} />
        <ProductCardPriceSkeleton />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { ProductInfoCardSkeleton };
