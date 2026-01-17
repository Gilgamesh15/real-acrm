import { differenceInSeconds } from "date-fns";
import { ChevronDown, InfoIcon, XIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { useCountdown } from "~/hooks/use-countdown";
import { cn, formatCurrency } from "~/lib/utils";

const ProductCardRoot = ({
  size = "default",
  children,
}: {
  size?: "sm" | "default";
  children: React.ReactNode;
}) => {
  return (
    <div
      data-size={size}
      className={cn(
        "group flex items-center border text-sm flex-wrap outline-none relative",
        {
          "py-3 px-4 gap-2.5": size === "sm",
          "p-4 gap-4": size === "default",
        }
      )}
    >
      {children}
    </div>
  );
};
const ProductCardImage = ({
  url,
  alt,
  to,
  onClick,
}: {
  url: string;
  alt: string;
  to?: string;
  onClick?: () => void;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <div
      className={cn(
        "relative h-full aspect-square",
        onClick || to ? "cursor-pointer" : ""
      )}
      onClick={handleClick}
    >
      <img
        src={url}
        alt={alt}
        className="object-cover size-full h-full w-full"
      />
    </div>
  );
};

const ProductCardImageSkeleton = () => {
  return <Skeleton className="h-full aspect-square" />;
};
const ProductCardMedia = ({
  size = "md",
  children,
}: {
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn("flex items-center justify-center gap-2 w-fit", {
        "h-10": size === "sm",
        "h-20": size === "md",
        "h-24": size === "lg",
      })}
    >
      {children}
    </div>
  );
};
const ProductCardInfo = ({
  name,
  brand,
  size,
  orientation = "horizontal",
  textSize = "default",
  to,
  onClick,
}: {
  name: string;
  brand?: string;
  size?: string;
  orientation?: "horizontal" | "vertical";
  textSize?: "sm" | "default";
  to?: string;
  onClick?: () => void;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-1 gap-1",
        orientation === "horizontal"
          ? "w-full flex-row justify-between"
          : "flex-col"
      )}
    >
      <span
        onClick={handleClick}
        className={cn(
          "flex w-fit items-center gap-2 leading-snug font-medium",
          textSize === "default" ? "text-base font-semibold" : "text-sm",
          onClick || to ? "cursor-pointer" : ""
        )}
      >
        {name}
      </span>
      {brand && size && (
        <p
          className={cn(
            "text-muted-foreground line-clamp-2 leading-normal font-normal text-balance",
            textSize === "default" ? "text-sm" : "text-xs"
          )}
        >
          {brand} {" • "} {size}
        </p>
      )}
    </div>
  );
};
const ProductCardInfoSkeleton = ({
  orientation = "horizontal",
  textSize = "default",
  showBrandAndSize = true,
}: {
  orientation?: "horizontal" | "vertical";
  textSize?: "sm" | "default";
  showBrandAndSize?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex flex-1 gap-1",
        orientation === "horizontal"
          ? "w-full flex-row justify-between"
          : "flex-col"
      )}
    >
      <Skeleton
        className={cn(
          "w-fit",
          textSize === "default" ? "h-6 w-18" : "h-[47px] w-24"
        )}
      />
      {showBrandAndSize && (
        <Skeleton
          className={cn(
            "w-fit",
            textSize === "default" ? "h-4 w-14" : "h-[20px] w-12"
          )}
        />
      )}
    </div>
  );
};
const ProductCardRemoveButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Button variant="ghost" size="icon" onClick={onClick}>
      <XIcon />
    </Button>
  );
};
const ProductCardRemoveButtonSkeleton = () => {
  return <Skeleton className="size-9" />;
};
const ProductCardContent = ({
  children,
  orientation = "horizontal",
}: {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
}) => {
  return (
    <div
      className={cn(
        "flex flex-1 gap-1",
        orientation === "horizontal"
          ? "w-full flex-row justify-between"
          : "flex-col"
      )}
    >
      {children}
    </div>
  );
};
const ProductCardMeasurements = ({
  measurements,
}: {
  measurements: Array<{
    id: string;
    name: string;
    value: number;
    unit?: string | null;
  }>;
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 h-fit flex-1">
      {measurements.map((measurement) => (
        <Badge
          variant="secondary"
          key={measurement.id}
          className="w-full justify-between rounded-none"
        >
          <span className="font-bold">{measurement.name}</span>
          <span>{measurement.value} mm</span>
        </Badge>
      ))}
    </div>
  );
};
const ProductCardMeasurementsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 h-fit flex-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="w-full h-[16px]" />
      ))}
    </div>
  );
};
const ProductCardPieces = ({
  children,
  title = "Zawartość projektu",
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <div className="flex basis-full items-center justify-between gap-2">
      <Collapsible className="w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between"
          >
            <span className="text-sm font-medium">{title}</span>
            <ChevronDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="w-full flex flex-col">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const ProductCardPiecesSkeleton = () => {
  return (
    <div className="flex basis-full items-center justify-between gap-2">
      <Skeleton className="h-8 w-full" />
    </div>
  );
};

const ProductCardPrice = ({ price }: { price: number }) => {
  return (
    <div className="flex flex-1 flex-col gap-1 items-end text-right">
      <p className="w-fit leading-snug text-base font-medium">
        {formatCurrency(price)}
      </p>
    </div>
  );
};
const ProductCardPriceSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col gap-1 items-end text-right">
      <Skeleton className="h-[22px] w-20" />
    </div>
  );
};

const ProductCardCountdown = ({ expiresAt }: { expiresAt: Date }) => {
  const [count, { startCountdown }] = useCountdown({
    countStart: differenceInSeconds(expiresAt, new Date()),
  });

  React.useEffect(() => {
    startCountdown();
  }, [expiresAt, startCountdown]);

  // we only care about seconds and minutes
  const seconds = count % 60;
  const minutes = Math.floor(count / 60);

  return (
    <Badge className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2">
      <Tooltip>
        <TooltipTrigger>
          <InfoIcon />
        </TooltipTrigger>
        <TooltipContent>Ten przedmiot jest zarezerwowany</TooltipContent>
      </Tooltip>
      <span>
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </span>
    </Badge>
  );
};

const ProductCardToggle = ({
  checked,
  onCheckedChange,
  ariaInvalid,
  id,
  name,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaInvalid?: boolean;
  id?: string;
  name?: string;
}) => {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-invalid={ariaInvalid}
      id={id}
      name={name}
    />
  );
};

const ProductCardToggleSkeleton = () => {
  return <Skeleton className="size-4" />;
};

export {
  ProductCardCountdown,
  ProductCardContent,
  ProductCardImage,
  ProductCardImageSkeleton,
  ProductCardInfo,
  ProductCardInfoSkeleton,
  ProductCardMeasurements,
  ProductCardMeasurementsSkeleton,
  ProductCardMedia,
  ProductCardPieces,
  ProductCardPiecesSkeleton,
  ProductCardPrice,
  ProductCardPriceSkeleton,
  ProductCardRemoveButton,
  ProductCardRemoveButtonSkeleton,
  ProductCardRoot,
  ProductCardToggle,
  ProductCardToggleSkeleton,
};
