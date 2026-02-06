import { PlusIcon, ShoppingBasket, Zap } from "lucide-react";
import React from "react";
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
  calculateProductPriceDisplayData,
  cn,
  formatCurrency,
  formatDiscountLabel,
} from "~/lib/utils";

export interface MainProductCardProps {
  product: DBQueryResult<
    "products",
    {
      columns: {
        description: false;
      };
      with: {
        images: true;
        discount: true;
        pieces: {
          with: {
            images: true;
            discount: true;
            brand: true;
            size: true;
          };
        };
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

const MainProductCard = ({
  product,
  href,
  isInCart = false,
  onBuyNow,
  onToggleCart,
  onClick,
  className,
}: MainProductCardProps) => {
  const [primaryImage] = product.images;

  const pricing = calculateProductPriceDisplayData(product);

  return (
    <article className="w-[280px] aspect-6/8  cursor-pointer">
      <Link
        to={href}
        onClick={onClick}
        className={cn("flex flex-col gap-2 size-full relative", className)}
      >
        <Image
          src={primaryImage?.url || "/placeholder.png"}
          alt={primaryImage?.alt || `${product.name} - projekt`}
          aspectRatio={6 / 8}
          mode="cover"
          width={280}
          quality="auto:best"
          className="-z-2 absolute h-full w-full"
        />

        <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary-foreground/10 via-55% to-primary-foreground -z-1" />
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-primary-foreground/20 via-65% to-primary-foreground/40 -z-1" />

        <aside
          aria-label="Elementy projektu"
          className="backdrop-blur-[2px] absolute top-0 left-0 h-full bg-linear-to-b from-black via-black/80 to-transparent w-fit p-1.5"
        >
          <ul className="w-20 flex flex-col gap-2 items-center">
            {product.pieces.map((piece, index) => {
              const [primaryImage] = piece.images;

              return (
                <React.Fragment key={piece.id}>
                  <li className="relative w-full aspect-square">
                    <Image
                      src={primaryImage?.url || "/placeholder.png"}
                      alt={`${piece.name} - element projektu`}
                      aspectRatio={1}
                      width={80}
                      height={80}
                      mode="contain"
                      quality="auto:best"
                      className="min-w-full min-h-full absolute"
                    />
                  </li>
                  {index !== product.pieces.length - 1 && (
                    <PlusIcon size={14} />
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        </aside>

        <div className="absolute inset-0 size-full flex flex-col justify-between p-2">
          <div className="self-end">
            <div className="text-right flex flex-col items-end gap-1 absolute top-2 right-2 z-20">
              <data
                value={pricing.finalPrice}
                className="text-2xl font-extrabold text-foreground"
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
          </div>

          <div className="flex flex-col gap-2 justify-between min-h-20">
            <div className="flex flex-col gap-2.5">
              <h3 className="uppercase text-2xl text-shadow-lg text-foreground font-secondary font-bold tracking-wide text-left">
                {product.name}
              </h3>
            </div>

            <div
              role="group"
              aria-label="Akcje produktu"
              className="h-fit flex flex-row items-center gap-2 w-full"
            >
              <Button
                className="flex-1"
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

export { MainProductCard };
