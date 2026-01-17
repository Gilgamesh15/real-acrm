import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";

import { buttonVariants } from "~/components/ui/button";

import { cn } from "~/lib/utils";

interface AccountNavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
}

const AccountNavItem = ({ href, icon: Icon, label }: AccountNavItemProps) => {
  const pathname = useLocation().pathname;

  const isActive = pathname === href;

  return (
    <Link
      to={href}
      key={href}
      className={cn(
        buttonVariants({ variant: isActive ? "default" : "outline" }),
        "flex flex-1 rounded-full p-0.5 lg:justify-start"
      )}
    >
      {Icon}
      <span className="text-nowrap">{label}</span>
    </Link>
  );
};

export { AccountNavItem };
