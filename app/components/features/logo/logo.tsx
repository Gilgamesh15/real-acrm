import { Link } from "react-router";

import { cn } from "~/lib/utils";

import LogoPng from "/logo-dark.png";
import LogoSmallPng from "/logo-small-dark.png";

interface LogoProps {
  withHeadline?: boolean;
  withSlogan?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo = ({
  withHeadline,
  withSlogan,
  size = "md",
  className,
}: LogoProps) => {
  return (
    <Link
      to="/"
      className={cn(
        "flex flex-col items-center justify-center min-w-max",
        className
      )}
    >
      {withHeadline ? (
        <img
          src={LogoPng}
          alt="Logo"
          className={cn(
            "w-auto",
            size === "sm" ? "h-8" : size === "md" ? "h-10" : "h-12"
          )}
        />
      ) : (
        <img
          src={LogoSmallPng}
          alt="Logo"
          className={cn(
            "w-auto",
            size === "sm" ? "h-8" : size === "md" ? "h-10" : "h-12"
          )}
        />
      )}

      {withSlogan && (
        <h2 className="tracking-wide  text-xs text-muted-foreground">
          Z wiary do czynu
        </h2>
      )}
    </Link>
  );
};

export { Logo };
