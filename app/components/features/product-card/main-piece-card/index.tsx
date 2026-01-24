import { ShoppingBasket, Zap } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import type { DBQueryResult } from "~/lib/types";
import { cn, formatCurrency, priceFromGrosz } from "~/lib/utils";

export interface MainPieceCardProps {
  piece: DBQueryResult<
    "pieces",
    {
      with: {
        images: true;
        brand: true;
        size: true;
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
          quality="auto:good"
          mode="contain"
          className="size-full z-0 absolute"
        />

        <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary-foreground/10 via-55% to-primary-foreground z-1" />
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-primary-foreground/20 via-65% to-primary-foreground/40 z-1" />

        <div className="absolute inset-0 size-full flex flex-col justify-between p-2 z-2">
          <div className="self-end text-right flex flex-col gap-1">
            <data
              value={priceFromGrosz(piece.priceInGrosz)}
              className="text-right text-2xl font-bold text-foreground"
            >
              {formatCurrency(priceFromGrosz(piece.priceInGrosz))}
            </data>
            <span className="uppercase text-md md:text-lg text-shadow-lg text-foreground font-bold tracking-wide text-balance">
              {piece.brand.name}
            </span>
            <span className="uppercase text-md md:text-lg text-shadow-lg text-foreground font-bold tracking-wide text-balance">
              {piece.size.name}
            </span>
          </div>

          <div className="flex flex-col gap-2 justify-between h-fit">
            <div className="flex flex-col gap-2.5">
              <h3 className="font-secondary uppercase text-left text-xl md:text-2xl text-shadow-lg text-foreground font-bold tracking-wide w-full">
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
