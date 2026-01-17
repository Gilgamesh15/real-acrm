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
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaInvalid?: boolean;
  name?: string;
  id?: string;
}) => {
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

export { ReturnProductCard };
