import { AlertCircle, List } from "lucide-react";
import React from "react";
import { Await, Link, useNavigate } from "react-router";

import { buttonVariants } from "~/components/ui/button";
import {
  Error,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { Skeleton } from "~/components/ui/skeleton";

import type { DBQueryResult } from "~/lib/types";
import { cn, getSlugPath } from "~/lib/utils";

import type { NavItem } from "./navbar";

interface MainMenuProps {
  mainItems: NavItem[];
  categoriesPromise: Promise<
    DBQueryResult<"categories", { with: { image: true } }>[]
  >;
  className?: string;
}

const MainMenu = ({
  mainItems,
  categoriesPromise,
  className,
}: MainMenuProps) => {
  const navigate = useNavigate();
  return (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        {mainItems.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink asChild>
              <Link
                to={item.href}
                className="flex-row items-center gap-2  text-sm text-nowrap"
              >
                {item.icon}
                <span className="text-xs"> {item.label}</span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className="h-8 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              navigate("/kategorie");
            }}
          >
            <List className="size-4" />
            <span className="text-xs ml-2"> Kategorie</span>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="md:w-[400px] lg:w-[500px]">
            <React.Suspense
              fallback={
                <ul className="grid gap-2 lg:grid-cols-[.75fr_1fr]">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton className="size-full aspect-square" key={idx} />
                  ))}
                </ul>
              }
            >
              <Await
                resolve={categoriesPromise}
                errorElement={
                  <div className="p-4">
                    <Error>
                      <ErrorMedia>
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      </ErrorMedia>
                      <ErrorTitle>Wystąpił błąd</ErrorTitle>
                      <ErrorDescription>
                        Nie udało się załadować kategorii.
                      </ErrorDescription>
                    </Error>
                  </div>
                }
              >
                {(categories) => (
                  <ul className="w-full grid gap-2 grid-cols-3 auto-rows-fr">
                    {categories.map((cat) => (
                      <li key={cat.id} className="aspect-square size-full">
                        <Link
                          to={`/kategorie/${getSlugPath(cat)}`}
                          className={cn(
                            buttonVariants({
                              variant: "outline",
                            }),
                            "aspect-square relative p-0 m-0 block size-full z-30"
                          )}
                        >
                          <div className="absolute inset-0 bg-linear-to-l from-background/50 via-background/20 to-background/50 z-20" />
                          <img
                            src={cat.image?.url}
                            alt={cat.name}
                            className="absolute inset-0 size-full object-cover z-10"
                          />
                          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-lg text-shadow-2xs font-secondary tracking-wide">
                            {cat.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Await>
            </React.Suspense>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export { MainMenu };
