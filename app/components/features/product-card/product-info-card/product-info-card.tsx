import type { DBQueryResult } from "~/lib/types";
import { calculateProductPrice, priceFromGrosz } from "~/lib/utils";

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
        pieces: true;
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
        <ProductCardPrice
          price={priceFromGrosz(
            calculateProductPrice(product).lineTotalInGrosz
          )}
        />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { ProductInfoCard };
