import type { SQL } from "drizzle-orm";
import {
  BuildingIcon,
  LayoutDashboardIcon,
  ListCheckIcon,
  SettingsIcon,
  SparkleIcon,
  StarIcon,
  TruckIcon,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

import { authClient } from "~/lib/auth-client";
import type { DBQueryResult, User } from "~/lib/types";

import { Logo } from "../logo/logo";
import { AuthDropdown } from "./auth-dropdown";
import { MainMenu } from "./main-menu";
import { MobileSidebar } from "./mobile-sidebar";
import { NavCartButton } from "./nav-cart-button";
import { NavSearch } from "./nav-search";

const NAVBAR_HEIGHT = 54;
const BOTTOM_NAVBAR_HEIGHT = 32;

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  access?: (user?: User | null | undefined) => boolean;
}

export const MAIN_ITEMS: NavItem[] = [
  {
    label: "Strona główna",
    icon: <SparkleIcon />,
    href: "/",
  },
  {
    label: "Projekty",
    icon: <StarIcon />,
    href: "/projekty",
  },
  {
    label: "O nas",
    icon: <BuildingIcon />,
    href: "/o-nas",
  },
];

export const ACCOUNT_ITEMS: NavItem[] = [
  {
    label: "Moje konto",
    icon: <SettingsIcon />,
    href: "/konto",
    access: (user) => !!user,
  },
  {
    label: "Moje zamówienia",
    icon: <ListCheckIcon />,
    href: "/konto/zamowienia",
    access: (user) => !!user,
  },
  {
    label: "Panel administracyjny",
    icon: <LayoutDashboardIcon />,
    href: "/admin",
    access: (user) => user?.role === "admin",
  },
];

const Navbar = ({
  categoriesPromise,
  tagsPromise,
  children,
}: {
  categoriesPromise: Promise<
    DBQueryResult<
      "categories",
      { with: { image: true }; extras: { piecesCount: SQL.Aliased<number> } }
    >[]
  >;
  tagsPromise: Promise<DBQueryResult<"tags", { with: { image: true } }>[]>;
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const session = authClient.useSession.get();

  return (
    <>
      <div
        style={{
          height: NAVBAR_HEIGHT + BOTTOM_NAVBAR_HEIGHT,
        }}
      />
      <div className="fixed top-0 left-0 w-screen z-50 divide-y">
        <div
          style={{ height: BOTTOM_NAVBAR_HEIGHT }}
          className="bg-background text-foreground border-t shadow-xs shadow-foreground/50 flex items-center justify-center max-w-sm overflow-hidden"
        >
          <div className="w-fit mx-auto">
            <div className="flex items-center gap-2">
              <TruckIcon className="size-4 inline-block" />
              <span>
                Darmowa dostawa na{" "}
                <strong className="text-foreground font-bold">wszystkie</strong>{" "}
                zamówienia
              </span>
            </div>
          </div>
        </div>
        <div style={{ height: NAVBAR_HEIGHT }}>
          <nav
            style={{ height: NAVBAR_HEIGHT }}
            className="border-b shadow-xs shadow-foreground/50 bg-background/90 backdrop-blur-xs flex items-center justify-between p-2"
          >
            <div className="flex-1 flex items-center gap-1">
              <Logo size="sm" className="hidden lg:block" />
              <MobileSidebar
                categoriesPromise={categoriesPromise}
                session={session}
                onNavigate={(href) => navigate(href)}
                tagsPromise={tagsPromise}
              />
              <NavSearch className="inline-flex lg:hidden" />
            </div>
            <Logo size="sm" className="block lg:hidden" />

            <div className="items-center gap-2 flex-4 hidden lg:flex">
              <MainMenu
                categoriesPromise={categoriesPromise}
                mainItems={MAIN_ITEMS}
              />
            </div>

            <div className="flex items-center flex-1 justify-end">
              <div className="flex items-center gap-2">
                <NavSearch className="hidden lg:inline-flex" />
                <NavCartButton />

                <AuthDropdown accountItems={ACCOUNT_ITEMS} session={session} />
              </div>
            </div>
          </nav>
        </div>
      </div>
      {children}
    </>
  );
};

export { Navbar };
