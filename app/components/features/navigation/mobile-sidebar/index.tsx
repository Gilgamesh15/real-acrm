import type { SQL } from "drizzle-orm";
import { AlertCircleIcon, ChevronsRightIcon, Menu } from "lucide-react";
import React from "react";
import { Await } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Error,
  ErrorCode,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";
import { Image } from "~/components/ui/image";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";

import type { DBQueryResult, Session } from "~/lib/types";

import { Logo } from "../../logo/logo";
import { MobileSidebarCategories } from "./mobile-sidebar-categories";
import { MobileSidebarUserMenu } from "./mobile-sidebar-user-menu";

interface MobileSidebarProps {
  categoriesPromise: Promise<
    DBQueryResult<
      "categories",
      { with: { image: true }; extras: { piecesCount: SQL.Aliased<number> } }
    >[]
  >;
  tagsPromise: Promise<DBQueryResult<"tags", { with: { image: true } }>[]>;
  session: Session;
  onNavigate: (href: string) => void;
}

const MobileSidebar = ({
  categoriesPromise,
  tagsPromise,
  session,
  onNavigate,
}: MobileSidebarProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    onNavigate?.(href);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Otwórz menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-80 divide-y gap-0 overflow-x-hidden"
      >
        <SheetHeader>
          <SheetTitle asChild className="w-fit">
            <Logo size="sm" />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto flex flex-col justify-between gap-3">
          <div>
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start h-14 relative font-secondary text-xl tracking-wide"
              onClick={() => handleNavigate("/projekty")}
            >
              <div className="absolute inset-0 bg-linear-to-l from-background/90 via-background/40 to-background/90 z-10" />
              <span className="relative z-20">Projekty</span>
              <span className="font-primary text-xs font-medium ml-auto relative z-20">
                Zobacz wszystkie
              </span>
              <ChevronsRightIcon className="size-4 relative z-20" />
            </Button>
            <React.Suspense
              fallback={
                <>
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </>
              }
            >
              <Await
                resolve={categoriesPromise}
                errorElement={
                  <div className="flex-1 size-full flex items-center justify-center">
                    <Error>
                      <ErrorMedia>
                        <AlertCircleIcon />
                      </ErrorMedia>
                      <ErrorContent>
                        <ErrorTitle>
                          Nie udało się załadować kategorii.
                        </ErrorTitle>
                        <ErrorDescription>
                          Spróbuj ponownie później.
                        </ErrorDescription>
                        <ErrorCode>500</ErrorCode>
                      </ErrorContent>
                    </Error>
                  </div>
                }
                children={(categories) => (
                  <MobileSidebarCategories
                    categories={categories}
                    onNavigate={(href) => handleNavigate(href)}
                  />
                )}
              />
            </React.Suspense>
          </div>

          <div className="px-3 pb-3 h-fit">
            <React.Suspense
              fallback={
                <>
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </>
              }
            >
              <Await
                resolve={tagsPromise}
                errorElement={
                  <div className="flex-1 size-full flex items-center justify-center">
                    <Error>
                      <ErrorMedia>
                        <AlertCircleIcon />
                      </ErrorMedia>
                    </Error>
                  </div>
                }
                children={(tags) => (
                  <ul className="grid grid-cols-2 gap-3">
                    {tags.map((tag) => (
                      <li key={tag.id} className="aspect-square size-full">
                        <Button
                          variant="outline"
                          className="aspect-square relative p-0 m-0 block size-full"
                          onClick={() =>
                            handleNavigate(`/kategorie?tags=${tag.slug}`)
                          }
                        >
                          <div className="absolute inset-0 bg-linear-to-l from-background/50 via-background/20 to-background/50 z-0" />
                          <Image
                            src={tag.image?.url || ""}
                            alt={tag.name}
                            aspectRatio={1}
                            className="absolute inset-0 size-full -z-10"
                          />
                          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-lg text-shadow-2xs font-secondary tracking-wide">
                            {tag.name}
                          </span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              />
            </React.Suspense>
          </div>
        </div>

        <SheetFooter>
          <MobileSidebarUserMenu
            session={session}
            onNavigate={(href) => handleNavigate(href)}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export { MobileSidebar };
