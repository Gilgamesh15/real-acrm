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
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaInvalid?: boolean;
  id?: string;
  name?: string;
}) => {
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

export { ReturnPieceCard };
