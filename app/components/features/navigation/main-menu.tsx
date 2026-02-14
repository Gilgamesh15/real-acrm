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
import Image from "~/components/ui/image";
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
        {mainItems.slice(0, 3).map((item) => (
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
                            "aspect-square relative p-0 m-0 block size-full z-30 overflow-hidden whitespace-normal"
                          )}
                        >
                          <div className="absolute inset-0 bg-linear-to-l from-background/50 via-background/20 to-background/50 z-20" />
                          <Image
                            src={cat.image?.url || ""}
                            alt={cat.name}
                            width={154}
                            height={154}
                            aspectRatio={1}
                            resize="fill"
                            className="absolute inset-0 size-full z-10"
                          />
                          <span className="absolute inset-0 flex items-center justify-center pt-[50%] z-20 px-2">
                            <span className="text-lg text-shadow-2xs font-secondary tracking-wide text-center wrap-break-word">
                              {cat.name}
                            </span>
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
        {mainItems.slice(3).map((item) => (
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
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export { MainMenu };
