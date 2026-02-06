import { ShoppingBasket, Zap } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

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
  onBuyNow?: () => void;
  onToggleCart?: () => void;
  onClick?: () => void;
  className?: string;
}

const MainPieceCard = ({
  piece,
  href,
  isInCart = false,
  onBuyNow,
  onToggleCart,
  onClick,
  className,
}: MainPieceCardProps) => {
  const [primaryImage] = piece.images;
  const pricing = calculatePiecePriceDisplayData(piece);

  return (
    <article className={cn("aspect-5/8 relative bg-background", className)}>
      <Link
        to={href}
        onClick={onClick}
        className="flex flex-col gap-2 relative w-full h-full size-full"
      >
        <Image
          src={primaryImage?.url || "/placeholder.png"}
          alt={primaryImage?.alt || `${piece.name} - ${piece.brand.name}`}
          aspectRatio={5 / 8}
          mode="contain"
          quality="auto:good"
          className="size-full z-0 absolute"
          responsive
        />

        <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary-foreground/10 via-55% to-primary-foreground z-1" />
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-primary-foreground/20 via-65% to-primary-foreground/40 z-1" />

        <div className="absolute inset-0 size-full flex flex-col justify-between p-2 z-2">
          <div className="self-end text-right flex flex-col gap-1">
            <data
              value={pricing.finalPrice}
              className="text-right text-2xl font-extrabold text-foreground"
            >
              {formatCurrency(pricing.finalPrice)}
            </data>
            {pricing.hasDiscount && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-muted-foreground line-through">
                  {formatCurrency(pricing.originalPrice)}
                </span>
                <Badge variant="secondary">
                  {formatDiscountLabel(pricing.discount)}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 justify-between h-fit">
            <div className="flex flex-col gap-2.5">
              <h3 className="font-secondary uppercase text-left text-xl text-shadow-lg text-foreground font-bold tracking-wide w-full">
                {piece.name}
              </h3>
            </div>

            <div
              role="group"
              aria-label="Akcje elementu"
              className="h-fit flex flex-row items-center gap-2 w-full"
            >
              <Button
                className="flex-1"
                size="sm"
                aria-label="Kup teraz"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBuyNow?.();
                }}
              >
                <Zap aria-hidden="true" />
                Kup teraz
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    aria-label={
                      isInCart ? "Usuń z koszyka" : "Dodaj do koszyka"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleCart?.();
                    }}
                    variant={isInCart ? "default" : "secondary"}
                  >
                    <ShoppingBasket aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isInCart ? "Usuń z koszyka" : "Dodaj do koszyka"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export { MainPieceCard };
