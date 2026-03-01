import {
  EyeIcon,
  PackageIcon,
  ShoppingCartIcon,
  SparklesIcon,
} from "lucide-react";
import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";
import { Separator } from "~/components/ui/separator";

import type { DBQueryResult } from "~/lib/types";
import {
  calculatePiecePriceDisplayData,
  cn,
  formatCurrency,
  formatDiscountLabel,
  formatViewerCount,
} from "~/lib/utils";

export interface MainPieceCardProps {
  piece: DBQueryResult<
    "pieces",
    {
      columns: {
        description: false;
      };
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
  viewerCount?: number;
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

function isNewPiece(createdAt: Date | string): boolean {
  const created =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return Date.now() - created.getTime() < FOURTEEN_DAYS_MS;
}

const MainPieceCard = ({
  piece,
  href,
  isInCart = false,
  onToggleCart,
  onClick,
  className,
  viewerCount,
}: MainPieceCardProps) => {
  const [primaryImage] = piece.images;
  const pricing = calculatePiecePriceDisplayData(piece);
  const isNew = isNewPiece(piece.createdAt);

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "group flex w-full max-w-[400px] flex-col overflow-hidden bg-background border",
        className
      )}
    >
      <div className="relative aspect-4/5 w-full overflow-hidden">
        <Image
          src={primaryImage?.url || ""}
          alt={primaryImage?.alt || ""}
          width={400}
          aspectRatio={4 / 5}
          resize="fill"
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {isNew && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm">
            <SparklesIcon className="size-3" />
            Nowe
          </span>
        )}
        {viewerCount != null && viewerCount > 0 && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-1 rounded-sm">
            <EyeIcon className="size-3" />
            {formatViewerCount(viewerCount)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4 min-h-[184px] justify-between flex-1">
        <div className="flex items-start flex-1 justify-between">
          <div>
            <p className="text-xs text-nowrap whitespace-nowrap uppercase tracking-[0.3em] text-muted-foreground">
              {piece.brand?.name || "N/A"}
            </p>
            <h3 className="mt-1 text-sm font-light tracking-wide text-foreground">
              {piece.name}
            </h3>
          </div>
          {piece.size?.name && (
            <span className="text-xs text-nowrap whitespace-nowrap uppercase tracking-[0.2em] text-muted-foreground">
              {piece.size?.name || "N/A"}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 h-fit">
          <Separator />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {pricing.hasDiscount ? (
                  <>
                    <span className="text-base text-success-foreground">
                      {formatCurrency(pricing.finalPrice)}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-through">
                      {formatCurrency(pricing.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-base text-foreground">
                    {formatCurrency(pricing.finalPrice)}
                  </span>
                )}
              </div>
              {pricing.hasDiscount && (
                <Badge
                  variant="outline"
                  className="text-[9px] text-muted-foreground"
                >
                  {formatDiscountLabel(pricing.discount)}
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground tracking-wider">
              Darmowa dostawa
            </span>
          </div>
          <Button
            variant={isInCart ? "default" : "secondary"}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              onToggleCart?.();
            }}
          >
            <ShoppingCartIcon className="size-3.5" />
            {isInCart ? "W koszyku" : "Dodaj do koszyka"}
          </Button>
        </div>
      </div>
    </Link>
  );
};

export { MainPieceCard };
