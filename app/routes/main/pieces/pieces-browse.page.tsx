import * as schema from "db/schema";
import { filterService } from "db/services/filter.service";
import { asc } from "drizzle-orm";
import { ChevronsRightIcon, FilterIcon } from "lucide-react";
import React from "react";
import { Await, Link } from "react-router";

import { Accordion } from "~/components/ui/accordion";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import Image from "~/components/ui/image";
import { Container, Section } from "~/components/ui/layout";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";

import { DrawerMultiSelectFilter } from "~/components/features/param-filters/drawer-multi-select-filter";
import { DrawerOptionalSingleSelectFilter } from "~/components/features/param-filters/drawer-optional-single-select-filter";
import { DrawerRangeFilter } from "~/components/features/param-filters/drawer-range-filter";
import { MultiSelectFilter } from "~/components/features/param-filters/dropdown-multi-select-filter";
import { OptionalSingleSelectFilter } from "~/components/features/param-filters/dropdown-optional-single-select-filter";
import { RangeFilter } from "~/components/features/param-filters/dropdown-range-filter";
import { SingleSelectFilter } from "~/components/features/param-filters/dropdown-single-select-filter";
import { FilterPagination } from "~/components/features/param-filters/filter-pagination/filter-pagination";
import { FiltersProvider } from "~/components/features/param-filters/filter-provider";
import { FilterSearchBar } from "~/components/features/param-filters/filter-search-bar";
import {
  FilterValue,
  FilterValues,
} from "~/components/features/param-filters/filter-values";
import { MainPieceCard } from "~/components/features/product-card/main-piece-card";
import { useCart } from "~/components/features/providers/cart-provider";
import { useViewerCounts } from "~/hooks/use-viewer-counts";
import { generateBreadcrumbListStructuredData } from "~/lib/seo";
import type { CatalogSortBy, CatalogSortOrder } from "~/lib/types";
import {
  cn,
  getSlugPath,
  pieceToGoogleAnalyticsItem,
  sortFilterOptions,
} from "~/lib/utils";
import { filterSearchParamsCache } from "~/lib/utils.server";

import type { Route } from "./+types/pieces-browse.page";

const PRODUCTS_PER_PAGE = 10;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  // get search params to their shape
  const searchParams = Object.fromEntries(url.searchParams);

  const parsed = filterSearchParamsCache.parse(searchParams);

  const page = parsed.page;
  const offset = (page - 1) * PRODUCTS_PER_PAGE;
  const limit = PRODUCTS_PER_PAGE;
  const sortBy = parsed.sortBy.split("-")[0] as CatalogSortBy;
  const sortOrder = parsed.sortBy.split("-")[1] as CatalogSortOrder;

  let category = url.pathname.split("/").pop();
  if (category === "kategorie") {
    category = undefined;
  }
  const filterData = await filterService.getPieceFilterData();

  const piecesPromise = filterService
    .findFilteredPieces(
      {
        with: {
          images: {
            limit: 1,
            orderBy: asc(schema.images.displayOrder),
          },
          category: true,
          brand: true,
          size: true,
          discount: true,
        },
      },
      {
        ...parsed,
        limit,
        offset,
        gender: parsed.gender ?? undefined,
        sortBy,
        sortOrder,
        category: category ?? undefined,
      }
    )
    .then((res) => res);

  return {
    piecesPromise,
    filterData,
  };
}

export const meta: Route.MetaFunction = ({ loaderData, params }) => {
  const {
    filterData: { categories },
  } = loaderData;

  const pathSegments = params["*"].split("/").filter(Boolean);
  const categorySlug = pathSegments[pathSegments.length - 1];
  const isRoot = categorySlug === "kategorie";
  const category = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : undefined;

  const categoryName = category?.name ?? "Ubrania";
  const pageTitle = isRoot
    ? "Ubrania second-hand – przeglądaj po kategorii | ACRM"
    : `${categoryName} z second-handu | ACRM`;
  const pageDescription = `Przeglądaj ${categoryName.toLowerCase()} z second-handu. Marki premium w przystępnych cenach. Darmowa dostawa, zwroty do 14 dni.`;
  const pageUrl = `https://www.acrm.pl/kategorie${category ? `/${getSlugPath(category)}` : ""}`;

  return [
    { title: pageTitle },
    { name: "description", content: pageDescription },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: pageDescription },
    { property: "og:url", content: pageUrl },
    { property: "og:site_name", content: "ACRM | Fashion Projects" },
    { property: "og:locale", content: "pl_PL" },
    { property: "og:image", content: "https://www.acrm.pl/logo-light.png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "ACRM | Fashion Projects" },
    { property: "og:image:type", content: "image/png" },
    {
      property: "og:image:url",
      content: "https://www.acrm.pl/logo-light.png",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: `https://www.acrm.pl/kategorie${category ? `/${getSlugPath(category)}` : ""}`,
    },
    ...(category
      ? [{ "script:ld+json": generateBreadcrumbListStructuredData(category) }]
      : []),
  ];
};

export default function PiecesBrowsePage({
  loaderData,
  params,
}: Route.ComponentProps) {
  const {
    filterData: { brands, sizes, categories, tags, priceRange },
    piecesPromise,
  } = loaderData;

  const pathSegments = params["*"].split("/").filter(Boolean);
  const categorySlug = pathSegments[pathSegments.length - 1];

  const category = categories.find(
    (category) => category.slug === categorySlug
  );

  return (
    <FiltersProvider
      priceMin={priceRange.min}
      priceMax={priceRange.max}
      tags={tags}
      sizes={sizes}
      brands={brands}
    >
      <div className="flex flex-col gap-4">
        <Drawer>
          <Section padding="xs" className="flex flex-col gap-2">
            <div className="px-2">
              <FilterSearchBar />
            </div>

            <div className="w-full overflow-x-auto flex items-center">
              <div className="w-fit mx-auto flex gap-2 px-2">
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon-sm">
                    <FilterIcon />
                  </Button>
                </DrawerTrigger>
                <MultiSelectFilter
                  label="Style"
                  options={tags.map((tag) => ({
                    value: tag.slug,
                    label: tag.name,
                  }))}
                  param="tags"
                />
                <MultiSelectFilter
                  label="Rozmiary"
                  options={sizes.map((size) => ({
                    value: size.slug,
                    label: size.name,
                  }))}
                  param="sizes"
                />
                <MultiSelectFilter
                  label="Marki"
                  options={brands.map((brand) => ({
                    value: brand.slug,
                    label: brand.name,
                  }))}
                  param="brands"
                />
                <RangeFilter
                  label="Cena"
                  min={0}
                  max={500}
                  paramMin="priceMin"
                  paramMax="priceMax"
                />
                <OptionalSingleSelectFilter
                  label="Płeć"
                  options={[
                    { value: "male", label: "Men" },
                    { value: "female", label: "Women" },
                    { value: "unisex", label: "Unisex" },
                  ]}
                  param="gender"
                />
                <SingleSelectFilter
                  label="Sortuj według"
                  options={sortFilterOptions}
                  param="sortBy"
                />
              </div>
            </div>

            <div className="w-full flex flex-wrap items-center justify-center gap-2">
              <FilterValues>
                {(filterValues) =>
                  filterValues.map((filter, i) => (
                    <FilterValue
                      key={i}
                      label={filter.label}
                      param={filter.param}
                      value={filter.value}
                    />
                  ))
                }
              </FilterValues>
            </div>
          </Section>

          <DrawerContent className="font-secondary">
            <DrawerHeader className="border-b pb-4">
              <DrawerTitle>Filtry</DrawerTitle>
              <DrawerDescription>
                Dostosuj wyszukiwanie za pomocą filtrów
              </DrawerDescription>
            </DrawerHeader>
            <ScrollArea className="h-[60vh] px-4 py-2">
              <div
                style={{
                  display: "table",
                  minWidth: "100%",
                }}
              >
                <Accordion type="single" collapsible className="w-full">
                  <DrawerMultiSelectFilter
                    label="Style"
                    options={tags.map((tag) => ({
                      value: tag.slug,
                      label: tag.name,
                    }))}
                    param="tags"
                  />
                  <DrawerMultiSelectFilter
                    label="Rozmiary"
                    options={sizes.map((size) => ({
                      value: size.slug,
                      label: size.name,
                    }))}
                    param="sizes"
                  />
                  <DrawerMultiSelectFilter
                    label="Marki"
                    options={brands.map((brand) => ({
                      value: brand.slug,
                      label: brand.name,
                    }))}
                    param="brands"
                  />
                  <DrawerOptionalSingleSelectFilter
                    label="Płeć"
                    options={[
                      { value: "male", label: "Mężczyzna" },
                      { value: "female", label: "Kobieta" },
                      { value: "unisex", label: "Unisex" },
                    ]}
                    param="gender"
                  />
                  <DrawerRangeFilter
                    label="Cena"
                    min={0}
                    max={500}
                    paramMin="priceMin"
                    paramMax="priceMax"
                  />
                </Accordion>
              </div>
            </ScrollArea>
            <DrawerFooter className="border-t pt-4">
              <div className="flex w-full items-center justify-between">
                <Button variant="outline" size="sm">
                  Wyczyść filtry
                </Button>
                <DrawerClose asChild>
                  <Button size="sm" variant="default">
                    Zastosuj filtry
                  </Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-x-4 gap-y-6 w-full px-4 md:px-6 lg:px-8">
          {categories.map((category) => {
            return (
              <Link
                to={`/kategorie/${getSlugPath(category)}`}
                key={category.id}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "relative h-14 w-full"
                )}
              >
                <Image
                  src={category.image || ""}
                  alt={category.name}
                  height={56}
                  width={408}
                  resize="fill"
                  className="absolute inset-0 size-full -z-10 object-cover"
                />
                <h2 className="text-lg text-shadow-2xs font-secondary tracking-wide">
                  {category.name}
                </h2>
                <ChevronsRightIcon />
              </Link>
            );
          })}
        </div>

        <React.Suspense
          fallback={
            <Container>
              <Section className="flex flex-row flex-wrap gap-3 sm:gap-4 flex-1 h-full w-full justify-center items-center">
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="w-[calc(50%-0.75rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)] aspect-5/8"
                  />
                ))}
              </Section>
            </Container>
          }
        >
          <Await resolve={piecesPromise}>
            {({ pieces, total }) => (
              <PiecesList
                pieces={pieces}
                total={total}
                categoryName={category?.name ?? "Kategorie"}
                categorySlug={category?.slug ?? "kategorie"}
              />
            )}
          </Await>
        </React.Suspense>
      </div>
    </FiltersProvider>
  );
}

function PiecesList({
  pieces,
  total,
  categoryName,
  categorySlug,
}: {
  categoryName: string;
  categorySlug: string;
} & Awaited<Route.ComponentProps["loaderData"]["piecesPromise"]>) {
  const { isInCart, addPiece, removePiece } = useCart();
  const viewerCounts = useViewerCounts(pieces.map((p) => p.id));

  React.useEffect(() => {
    window.gtag?.("event", "view_item_list", {
      currency: "PLN",
      item_list_name: categoryName,
      item_list_id: `category_${categorySlug}`,
      items: pieces.map((piece, index) =>
        pieceToGoogleAnalyticsItem(piece, {
          item_list_id: `category_${categorySlug}`,
          item_list_name: categoryName,
          index: index,
        })
      ),
    });
  }, [categoryName, categorySlug, pieces]);

  return (
    <Container>
      <Section className="flex flex-row flex-wrap gap-3 sm:gap-4 flex-1 h-full w-full justify-center items-stretch">
        {pieces.map((piece, index) => (
          <MainPieceCard
            className="w-[calc(50%-0.75rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)]"
            key={piece.id}
            piece={piece}
            href={`/ubrania/${piece.slug}`}
            isInCart={isInCart(piece.id)}
            viewerCount={viewerCounts?.[piece.id]}
            onClick={() => {
              window.gtag?.("event", "select_item", {
                item_list_id: `category_${categorySlug}`,
                item_list_name: categoryName,
                items: [
                  pieceToGoogleAnalyticsItem(piece, {
                    item_list_id: `category_${categorySlug}`,
                    item_list_name: categoryName,
                    index,
                  }),
                ],
              });
            }}
            onToggleCart={() => {
              if (isInCart(piece.id)) {
                removePiece(piece.id, true, {
                  item_list_id: `category_${categorySlug}`,
                  item_list_name: categoryName,
                  index: index,
                });
              } else {
                addPiece(piece, true, {
                  item_list_id: `category_${categorySlug}`,
                  item_list_name: categoryName,
                  index: index,
                });
              }
            }}
          />
        ))}
      </Section>
      <div className="mt-8">
        <FilterPagination
          totalPages={Math.ceil(
            Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE))
          )}
        />
      </div>
    </Container>
  );
}
