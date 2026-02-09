import type { DBQueryResult } from "~/lib/types";
import { calculatePiecePriceDisplayData } from "~/lib/utils";

import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMeasurements,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardRoot,
} from "../product-card-primitives";

const DetailedPieceCard = ({
  piece,
}: {
  piece: DBQueryResult<
    "pieces",
    {
      with: {
        images: true;
        brand: true;
        size: true;
        measurements: true;
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
          size="md"
          url={primaryImage?.url || ""}
          alt={primaryImage?.alt || ""}
        />
      </ProductCardMedia>
      <ProductCardContent orientation="vertical">
        <ProductCardContent>
          <ProductCardInfo
            name={piece.name}
            brand={piece.brand.name}
            size={piece.size.name}
            orientation="vertical"
          />
          <ProductCardPrice pricing={calculatePiecePriceDisplayData(piece)} />
        </ProductCardContent>
        <ProductCardMeasurements measurements={piece.measurements} />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { DetailedPieceCard };
