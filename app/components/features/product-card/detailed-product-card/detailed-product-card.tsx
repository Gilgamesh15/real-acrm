import type { DBQueryResult } from "~/lib/types";
import { calculateProductPrice, priceFromGrosz } from "~/lib/utils";

import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMeasurements,
  ProductCardMedia,
  ProductCardPieces,
  ProductCardPrice,
  ProductCardRoot,
} from "../product-card-primitives";

const DetailedProductCard = ({
  product,
}: {
  product: DBQueryResult<
    "products",
    {
      with: {
        images: true;
        pieces: {
          with: {
            images: true;
            brand: true;
            size: true;
            measurements: true;
          };
        };
      };
    }
  >;
}) => {
  const [primaryImage] = product.images;
  return (
    <ProductCardRoot>
      <ProductCardMedia size="lg">
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

      <ProductCardPieces>
        {product.pieces.map((piece) => {
          const [primaryImage] = piece.images;

          return (
            <ProductCardRoot key={piece.id} size="sm">
              <ProductCardMedia size="sm">
                <ProductCardImage
                  url={primaryImage?.url || ""}
                  alt={primaryImage?.alt || ""}
                />
              </ProductCardMedia>
              <ProductCardContent orientation="vertical">
                <ProductCardInfo
                  name={piece.name}
                  brand={piece.brand.name}
                  size={piece.size.name}
                  orientation="horizontal"
                  textSize="sm"
                />
                <ProductCardMeasurements measurements={piece.measurements} />
              </ProductCardContent>
            </ProductCardRoot>
          );
        })}
      </ProductCardPieces>
    </ProductCardRoot>
  );
};

export { DetailedProductCard };
