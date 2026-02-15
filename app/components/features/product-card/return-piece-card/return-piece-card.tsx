import type { DBQueryResult } from "~/lib/types";
import { calculatePiecePriceDisplayData } from "~/lib/utils";

import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardRoot,
  ProductCardToggle,
} from "../product-card-primitives";

const ReturnPieceCard = ({
  piece,
  checked,
  onCheckedChange,
  ariaInvalid,
  id,
  name,
}: {
  piece: DBQueryResult<
    "pieces",
    { with: { discount: true; images: true; brand: true; size: true } }
  >;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaInvalid?: boolean;
  id?: string;
  name?: string;
}) => {
  const [primaryImage] = piece.images;
  return (
    <ProductCardRoot size="sm">
      <ProductCardMedia size="sm">
        <ProductCardToggle
          checked={checked}
          onCheckedChange={onCheckedChange}
          ariaInvalid={ariaInvalid}
          id={id}
          name={name}
        />
        <ProductCardImage
          size="sm"
          url={primaryImage?.url || ""}
          alt={primaryImage?.alt || ""}
        />
      </ProductCardMedia>
      <ProductCardContent orientation="horizontal">
        <ProductCardInfo
          orientation="vertical"
          name={piece.name}
          brand={piece.brand?.name}
          size={piece.size?.name}
        />
        <ProductCardPrice pricing={calculatePiecePriceDisplayData(piece)} />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { ReturnPieceCard };
