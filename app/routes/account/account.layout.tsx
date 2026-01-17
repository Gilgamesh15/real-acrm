import {
  ChevronLeftIcon,
  LockIcon,
  ShoppingBagIcon,
  UserIcon,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";

import { buttonVariants } from "~/components/ui/button";

import { cn } from "~/lib/utils";

const TOP_BAR_HEIGHT = 48;
const NAV_SECTION_HEIGHT = 58;

const NAV_ITEMS = [
  {
    href: "/konto",
    icon: <UserIcon />,
    label: "Profil",
  },
  {
    href: "/konto/zamowienia",
    icon: <ShoppingBagIcon />,
    label: "Zamowienia",
  },
  {
    href: "/konto/prywatnosc",
    icon: <LockIcon />,
    label: "Prywatnosc",
  },
];

export default function AccountLayoutWrapper() {
  const pathname = useLocation().pathname;

  return (
    <>
      {/* Mobile Header */}
      <div
        style={{ height: TOP_BAR_HEIGHT }}
        className="border-b lg:hidden flex items-center px-2"
      >
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ChevronLeftIcon className="size-6" />
          </Link>
          <h1 className="text-lg font-semibold">Konto</h1>
        </div>
      </div>

      <div className="lg:flex lg:max-w-7xl lg:mx-auto lg:gap-8 lg:p-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-8">
            <Link
              to="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "mb-6"
              )}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Powrót
            </Link>

            <h1 className="text-2xl font-bold mb-6">Konto</h1>

            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  to={item.href}
                  key={item.href}
                  className={cn(
                    buttonVariants({
                      variant: item.href === pathname ? "default" : "outline",
                    }),
                    "flex flex-1 p-0.5 lg:justify-start"
                  )}
                >
                  {item.icon}
                  <span className="text-nowrap">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div
          style={{ height: NAV_SECTION_HEIGHT }}
          className="lg:hidden border-b flex items-center"
        >
          <div className="overflow-x-auto">
            <div className="mx-auto w-fit px-4">
              <nav className="flex gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      buttonVariants({
                        variant: item.href === pathname ? "default" : "outline",
                      }),
                      "flex flex-1 p-0.5 lg:justify-start"
                    )}
                  >
                    {item.icon}
                    <span className="text-nowrap">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className={cn("flex-1 lg:min-w-0 p-4 min-h-full")}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
