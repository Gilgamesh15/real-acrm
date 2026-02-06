import type { DBQueryResult } from "~/lib/types";
import { calculatePiecePriceDisplayData } from "~/lib/utils";

import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardRoot,
} from "../product-card-primitives";

const PieceInfoCard = ({
  piece,
}: {
  piece: DBQueryResult<
    "pieces",
    {
      with: {
        images: true;
        discount: true;
      };
    }
  >;
}) => {
  const [primaryImage] = piece.images;
  return (
    <ProductCardRoot size="sm">
      <ProductCardMedia size="md">
        <ProductCardImage
          url={primaryImage?.url || ""}
          alt={primaryImage?.alt || ""}
        />
      </ProductCardMedia>
      <ProductCardContent>
        <ProductCardInfo name={piece.name} />
        <ProductCardPrice pricing={calculatePiecePriceDisplayData(piece)} />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { PieceInfoCard };
