import type { DBQueryResult } from "~/lib/types";
import { priceFromGrosz } from "~/lib/utils";

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
        <ProductCardPrice price={priceFromGrosz(piece.priceInGrosz)} />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { PieceInfoCard };
