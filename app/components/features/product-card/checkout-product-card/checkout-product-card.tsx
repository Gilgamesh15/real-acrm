import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPieces,
  ProductCardPrice,
  ProductCardRoot,
} from "../product-card-primitives";

const CheckoutProductCard = ({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    primaryImage: {
      url: string;
      alt: string;
    };
    pieces: Array<{
      id: string;
      name: string;
      brand: { name: string };
      size: { name: string };
      primaryImage: {
        url: string;
        alt: string;
      };
    }>;
  };
}) => {
  return (
    <ProductCardRoot>
      <ProductCardMedia>
        <ProductCardImage
          url={product.primaryImage.url}
          alt={product.primaryImage.alt}
        />
      </ProductCardMedia>
      <ProductCardContent>
        <ProductCardInfo name={product.name} />
        <ProductCardPrice price={product.price} />
      </ProductCardContent>

      <ProductCardPieces>
        {product.pieces.map((piece) => (
          <ProductCardRoot key={piece.id} size="sm">
            <ProductCardMedia size="sm">
              <ProductCardImage
                url={piece.primaryImage.url}
                alt={piece.primaryImage.alt}
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
        ))}
      </ProductCardPieces>
    </ProductCardRoot>
  );
};

export { CheckoutProductCard };
