import type { DBQueryResult } from "~/lib/types";
import { calculateProductPriceDisplayData } from "~/lib/utils";

import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardRoot,
} from "../product-card-primitives";

const ProductInfoCard = ({
  product,
}: {
  product: DBQueryResult<
    "products",
    {
      with: {
        images: true;
        pieces: { with: { discount: true } };
        discount: true;
      };
    }
  >;
}) => {
  const [primaryImage] = product.images;
  return (
    <ProductCardRoot size="sm">
      <ProductCardMedia size="md">
        <ProductCardImage
          url={primaryImage?.url || ""}
          alt={primaryImage?.alt || ""}
        />
      </ProductCardMedia>
      <ProductCardContent>
        <ProductCardInfo name={product.name} />
        <ProductCardPrice pricing={calculateProductPriceDisplayData(product)} />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { ProductInfoCard };
