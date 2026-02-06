import type { DBQueryResult } from "~/lib/types";
import { calculateProductPriceDisplayData } from "~/lib/utils";

import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPieces,
  ProductCardPrice,
  ProductCardRoot,
  ProductCardToggle,
} from "../product-card-primitives";

const ReturnProductCard = ({
  product,
  checked,
  onCheckedChange,
  ariaInvalid,
  name,
  id,
}: {
  product: DBQueryResult<
    "products",
    {
      with: {
        discount: true;
        images: true;
        pieces: {
          with: { discount: true; images: true; brand: true; size: true };
        };
      };
    }
  >;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaInvalid?: boolean;
  name?: string;
  id?: string;
}) => {
  const [primaryImage] = product.images;
  return (
    <ProductCardRoot>
      <ProductCardMedia>
        <ProductCardToggle
          checked={checked}
          onCheckedChange={onCheckedChange}
          ariaInvalid={ariaInvalid}
          id={id}
          name={name}
        />
        <ProductCardImage
          url={primaryImage?.url || ""}
          alt={primaryImage?.alt || ""}
        />
      </ProductCardMedia>
      <ProductCardContent>
        <ProductCardInfo name={product.name} />
        <ProductCardPrice pricing={calculateProductPriceDisplayData(product)} />
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
              <ProductCardContent>
                <ProductCardInfo
                  name={piece.name}
                  textSize="sm"
                  brand={piece.brand.name}
                  size={piece.size.name}
                />
              </ProductCardContent>
            </ProductCardRoot>
          );
        })}
      </ProductCardPieces>
    </ProductCardRoot>
  );
};

export { ReturnProductCard };
