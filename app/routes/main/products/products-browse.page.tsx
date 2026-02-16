import * as schema from "db/schema";
import { filterService } from "db/services/filter.service";
import { asc } from "drizzle-orm";
import { FilterIcon } from "lucide-react";
import React from "react";
import { Await } from "react-router";

import { Accordion } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
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
import { MainProductCard } from "~/components/features/product-card/main-product-card";
import { useCart } from "~/components/features/providers/cart-provider";
import { useCheckoutDialog } from "~/components/features/providers/checkout-dialog-provider";
import type { CatalogSortBy, CatalogSortOrder } from "~/lib/types";
import { productToGoogleAnalyticsItem, sortFilterOptions } from "~/lib/utils";
import { filterSearchParamsCache } from "~/lib/utils.server";

import type { Route } from "./+types/products-browse.page";

const PRODUCTS_PER_PAGE = 10;

const PAGE_TITLE =
  "Komplety ubrań z second-handu – gotowe stylizacje | ACRM";
const PAGE_DESCRIPTION =
  "Gotowe zestawy odzieży używanej w topowych stylach. Marki premium w przystępnych cenach. Darmowa dostawa InPost, realizacja w 24h.";

export const meta: Route.MetaFunction = () => [
  { title: PAGE_TITLE },
  { name: "description", content: PAGE_DESCRIPTION },
  { name: "robots", content: "index, follow" },
  { property: "og:title", content: PAGE_TITLE },
  { property: "og:type", content: "website" },
  { property: "og:image", content: "https://www.acrm.pl/logo-light.png" },
  { property: "og:url", content: "https://www.acrm.pl/projekty" },
  { property: "og:description", content: PAGE_DESCRIPTION },
  {
    property: "og:image:url",
    content: "https://www.acrm.pl/logo-light.png",
  },
  { property: "og:image:type", content: "image/png" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  {
    property: "og:image:alt",
    content: "ACRM Fashion Projects - Sklep z odzieżą używaną",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { tagName: "link", rel: "canonical", href: "https://www.acrm.pl/projekty" },
];

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

  console.log("sortBy", sortBy);
  console.log("sortOrder", sortOrder);
  const filterData = await filterService.getProductFilterData();
  const productsPromise = filterService
    .findFilteredProducts(
      {
        columns: {
          description: false,
        },
        with: {
          discount: true,
          images: {
            limit: 1,
            orderBy: asc(schema.images.displayOrder),
          },
          pieces: {
            with: {
              discount: true,
              images: {
                limit: 1,
                orderBy: asc(schema.images.displayOrder),
              },
              category: true,
              brand: true,
              size: true,
            },
          },
        },
      },
      {
        ...parsed,
        limit,
        offset,
        gender: parsed.gender ?? undefined,
        sortBy,
        sortOrder,
      }
    )
    .then((res) => res);

  return {
    productsPromise,
    filterData,
  };
}

export default function ProductsBrowsePage({
  loaderData,
}: Route.ComponentProps) {
  const {
    filterData: { brands, sizes, tags, priceRange },
    productsPromise,
  } = loaderData;

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
          <Await resolve={productsPromise}>
            {({ products, total }) => (
              <ProductsList products={products} total={total} />
            )}
          </Await>
        </React.Suspense>
      </div>
    </FiltersProvider>
  );
}

function ProductsList({
  products,
  total,
}: Awaited<Route.ComponentProps["loaderData"]["productsPromise"]>) {
  const { isInCart, addProduct, removeProduct } = useCart();
  const { onProductBuyNow } = useCheckoutDialog();

  React.useEffect(() => {
    window.gtag?.("event", "view_item_list", {
      currency: "PLN",
      item_list_name: "Projekty",
      item_list_id: "projekty",
      items: products.flatMap((product) =>
        productToGoogleAnalyticsItem(product, {
          item_list_id: "projekty",
          item_list_name: "Projekty",
        })
      ),
    });
  }, [products, total]);

  return (
    <Container>
      <section className="flex flex-row flex-wrap gap-3 sm:gap-4 flex-1 h-full w-full justify-center items-center">
        {products.map((product, index) => (
          <MainProductCard
            product={product}
            href={`/projekty/${product.slug}`}
            key={product.id}
            isInCart={isInCart(product.id)}
            onClick={() => {
              window.gtag?.("event", "select_item", {
                item_list_id: "projekty",
                item_list_name: "Projekty",
                items: productToGoogleAnalyticsItem(product, {
                  item_list_id: "projekty",
                  item_list_name: "Projekty",
                  index,
                }),
              });
            }}
            onBuyNow={() =>
              onProductBuyNow(product, {
                item_list_id: `projekty`,
                item_list_name: "Projekty",
                index: index,
              })
            }
            onToggleCart={() => {
              if (isInCart(product.id)) {
                removeProduct(product.id, true, {
                  item_list_id: `projekty`,
                  item_list_name: "Projekty",
                  index: index,
                });
              } else {
                addProduct(product, true, {
                  item_list_id: `projekty`,
                  item_list_name: "Projekty",
                  index: index,
                });
              }
            }}
          />
        ))}
      </section>
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
