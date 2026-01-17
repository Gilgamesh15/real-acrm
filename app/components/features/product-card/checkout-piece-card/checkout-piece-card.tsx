import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardRoot,
} from "../product-card-primitives";

const CheckoutPieceCard = ({
  piece,
}: {
  piece: {
    id: string;
    name: string;
    price: number;
    primaryImage: {
      url: string;
      alt: string;
    };
    brand: { name: string };
    size: { name: string };
  };
}) => {
  return (
    <ProductCardRoot size="sm">
      <ProductCardMedia size="sm">
        <ProductCardImage
          url={piece.primaryImage.url}
          alt={piece.primaryImage.alt}
        />
      </ProductCardMedia>
      <ProductCardContent orientation="horizontal">
        <ProductCardInfo
          orientation="vertical"
          name={piece.name}
          brand={piece.brand.name}
          size={piece.size.name}
        />
        <ProductCardPrice price={piece.price} />
      </ProductCardContent>
    </ProductCardRoot>
  );
};

export { CheckoutPieceCard };
