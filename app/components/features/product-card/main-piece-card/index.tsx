import { ShoppingCartIcon } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";

import type { DBQueryResult } from "~/lib/types";
import {
  calculatePiecePriceDisplayData,
  cn,
  formatCurrency,
  formatDiscountLabel,
} from "~/lib/utils";

export interface MainPieceCardProps {
  piece: DBQueryResult<
    "pieces",
    {
      with: {
        images: true;
        brand: true;
        size: true;
        discount: true;
      };
    }
  >;
  href: string;
  isInCart?: boolean;
  onToggleCart?: () => void;
  onClick?: () => void;
  className?: string;
}

const MainPieceCard = ({
  piece,
  href,
  isInCart = false,
  onToggleCart,
  onClick,
  className,
}: MainPieceCardProps) => {
  const [primaryImage] = piece.images;
  const pricing = calculatePiecePriceDisplayData(piece);

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "block max-w-[280px] bg-background pb-4 relative backdrop-blur-md",
        className
      )}
    >
      <Image
        src={primaryImage?.url || "/placeholder.png"}
        alt={primaryImage?.alt || "Piece image"}
        aspectRatio={7 / 8}
        quality="auto:good"
        resize="limitPad"
        width={280}
      />
      <div className="w-full h-px bg-linear-to-r from-transparent via-foreground/50 to-transparent rounded-full my-6 relative">
        <Button
          variant={isInCart ? "default" : "secondary"}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleCart?.();
          }}
          aria-label={isInCart ? "Remove from cart" : "Add to cart"}
        >
          <ShoppingCartIcon />
        </Button>
      </div>
      <div className="px-1 flex flex-col items-center gap-0.5 tracking-wider min-h-[96px]">
        <h3 className="text-lg font-secondary font-medium text-center">
          {piece.name}
        </h3>
        <p className="text-xs font-secondary text-muted-foreground font-normal">
          {piece.brand?.name}
        </p>
        <p
          className={cn(
            "text-base",
            pricing.hasDiscount ? "text-success-foreground" : "text-foreground"
          )}
        >
          {formatCurrency(pricing.finalPrice)}
        </p>
        {pricing.hasDiscount && (
          <div className="flex items-baseline gap-1.5">
            <p className="text-xs text-foreground/50 font-normal line-through">
              {formatCurrency(pricing.originalPrice)}
            </p>
            <Badge variant="outline" className="text-xs">
              {formatDiscountLabel(pricing.discount)}
            </Badge>
          </div>
        )}
      </div>
    </Link>
  );
};

export { MainPieceCard };
