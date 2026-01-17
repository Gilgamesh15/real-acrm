import type React from "react";
import { Link } from "react-router";

import { buttonVariants } from "~/components/ui/button";

import { cn } from "~/lib/utils";

interface MobileSidebarNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const MobileSidebarNavItem = ({
  href,
  icon,
  label,
  isActive = false,
  onClick,
}: MobileSidebarNavItemProps) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        buttonVariants({
          variant: isActive ? "secondary" : "ghost",
        }),
        "w-full justify-start text-base font-medium"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};
export { MobileSidebarNavItem };
