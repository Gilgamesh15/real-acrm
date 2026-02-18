import {
  AlertCircleIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import React from "react";
import { Await, type AwaitProps, Link, useAsyncError } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import {
  Error,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";
import Image from "~/components/ui/image";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

import { api } from "~/api/api.server";
import { MainPieceCard } from "~/components/features/product-card/main-piece-card";
import { MainProductCard } from "~/components/features/product-card/main-product-card";
import { useCart } from "~/components/features/providers/cart-provider";
import { useCheckoutDialog } from "~/components/features/providers/checkout-dialog-provider";
import { loggerContext } from "~/context/logger-context.server";
import { useFeaturedProducts } from "~/hooks/use-featured-products";
import { useHomeTags } from "~/hooks/use-home-tags";
import type { DBQueryResult, PriceDisplayData } from "~/lib/types";
import {
  calculatePiecePriceDisplayData,
  calculateProductPriceDisplayData,
  cn,
  formatCurrency,
  formatDiscountLabel,
  getSlugPath,
  pieceToGoogleAnalyticsItem,
  productToGoogleAnalyticsItem,
} from "~/lib/utils";

import type { Route } from "./+types/home.page";

const PAGE_TITLE = "ACRM | Markowe ubrania z second-handu w dobrych cenach";

const WOMEN_HERO_SRC_SET = [
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_320/women-hero_mykywe_icxbew?_a=DAJHqpDbZAAB",
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_384/women-hero_mykywe_icxbew?_a=DAJHqpDbZAAB",
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_512/women-hero_mykywe_icxbew?_a=DAJHqpDbZAAB",
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_640/women-hero_mykywe_icxbew?_a=DAJHqpDbZAAB",
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_768/women-hero_mykywe_icxbew?_a=DAJHqpDbZAAB",
];
const MEN_HERO_SRC_SET = [
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_320/men-hero_d1pnxe_pe5eso?_a=DAJHqpDbZAAB",
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_384/men-hero_d1pnxe_pe5eso?_a=DAJHqpDbZAAB",
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_512/men-hero_d1pnxe_pe5eso?_a=DAJHqpDbZAAB",
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_640/men-hero_d1pnxe_pe5eso?_a=DAJHqpDbZAAB",
  "https://res.cloudinary.com/dk8cu84v7/image/upload/c_fill/q_auto:best/f_auto/dpr_auto/c_scale,w_768/men-hero_d1pnxe_pe5eso?_a=DAJHqpDbZAAB",
];

// sizes html property in tailwind breakpoints
const SIZES = `
  (min-width: 1536px) 50vw,
  (min-width: 1280px) 50vw,
  (min-width: 1024px) 50vw,
  (min-width: 768px) 50vw,
  100vw
`;

export async function loader({ context }: Route.LoaderArgs) {
  const logger = context.get(loggerContext);

  const start = performance.now();
  logger.debug("Loading home page loader", {
    start,
  });
  const categoriesPromise = api.categories.get
    .all({
      query: {},
    })
    .then((res) => res.body.categories);

  const topProductsPromise = api.products.get.all({ query: {} }).then((res) =>
    res.body.products.map((item) => ({
      id: item.id,
      images: item.images,
      name: item.name,
      pricing: calculateProductPriceDisplayData(item),
      href: `/projekty/${item.slug}`,
    }))
  );

  const topPiecesPromise = api.pieces.get
    .all({
      query: {},
    })
    .then((res) =>
      res.body.pieces.map((item) => ({
        id: item.id,
        images: item.images,
        name: item.name,
        pricing: calculatePiecePriceDisplayData(item),
        href: `/ubrania/${item.slug}`,
      }))
    );

  logger.debug("Home page loader completed", {
    end: performance.now(),
    duration: performance.now() - start,
  });

  return {
    categoriesPromise,
    topPiecesPromise,
    topProductsPromise,
  };
}

export const meta: Route.MetaFunction = () => [
  { title: PAGE_TITLE },
  {
    name: "description",
    content:
      "Sklep z odzieżą second-hand od marek premium: Dickies, Nike, Carhartt. Komplety i pojedyncze sztuki. Darmowa dostawa, realizacja w 24h, zwroty 14 dni.",
  },
  { name: "robots", content: "index, follow" },
  { property: "og:title", content: PAGE_TITLE },
  { property: "og:type", content: "website" },
  { property: "og:image", content: "https://www.acrm.pl/logo-light.png" },
  { property: "og:url", content: "https://www.acrm.pl/" },
  {
    property: "og:description",
    content:
      "Sklep z odzieżą second-hand od marek premium: Dickies, Nike, Carhartt. Komplety i pojedyncze sztuki. Darmowa dostawa, realizacja w 24h, zwroty 14 dni.",
  },
  { property: "og:image:url", content: "https://www.acrm.pl/logo-light.png" },
  { property: "og:image:type", content: "image/png" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  {
    property: "og:image:alt",
    content: "ACRM Fashion Projects - Sklep z odzieżą używaną",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { tagName: "link", rel: "canonical", href: "https://www.acrm.pl" },
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const { categoriesPromise, topPiecesPromise, topProductsPromise } =
    loaderData;

  return (
    <main>
      <HeroSection />

      <TopFeaturedSection
        title="Nowe ubrania"
        href="/kategorie"
        promise={topPiecesPromise}
        className="pt-14 pb-8"
      />

      <CategoriesSection categoriesPromise={categoriesPromise} />
      <TopFeaturedSection
        title="Nowe projekty"
        href="/projekty"
        promise={topProductsPromise}
        className="pt-8 pb-16"
      />

      <TagsSection />

      {/* Featured products */}
      <FeaturedProductsSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="flex flex-col" aria-label="Kolekcje główne">
      <h1 className="sr-only">
        Sklep z odzieżą używaną - Kolekcje męskie i damskie
      </h1>

      <div className="flex h-[45svh] md:h-[55svh] xl:h-[70svh]">
        <article className="group relative h-full flex-1 overflow-hidden">
          <Link to="/kategorie?gender=male" className="absolute inset-0">
            <span className="sr-only">Zobacz kolekcję męską</span>
            <Image
              src={MEN_HERO_SRC_SET[0]}
              srcSet={`
                ${MEN_HERO_SRC_SET[0]} 320w,
                ${MEN_HERO_SRC_SET[1]} 384w,
                ${MEN_HERO_SRC_SET[2]} 512w,
                ${MEN_HERO_SRC_SET[3]} 640w,
                ${MEN_HERO_SRC_SET[4]} 768w
              `}
              sizes={SIZES}
              alt="Men's Collection"
              fetchPriority="high"
              quality="auto:best"
              resize="fill"
              className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:scale-105 group-hover:brightness-100"
            />

            <div className="absolute inset-0 bg-background/30 transition-colors group-hover:bg-background/20" />

            <div className="absolute left-1/2 top-10/16 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="flex flex-col items-center justify-center gap-5">
                <div>
                  <p className="text-5xl font-bold font-secondary text-primary md:text-7xl lg:text-8xl">
                    MEN
                  </p>
                </div>
                <Button className="rounded-full">Zobacz więcej</Button>
              </div>
            </div>
          </Link>
        </article>

        <Separator orientation="vertical" />

        {/* Women's Section - Right */}
        <article className="group relative h-full flex-1 overflow-hidden">
          <Link to="/kategorie?gender=female" className="absolute inset-0">
            <span className="sr-only">Zobacz kolekcję damską</span>
            <Image
              src={WOMEN_HERO_SRC_SET[0]}
              srcSet={`
                ${WOMEN_HERO_SRC_SET[0]} 320w,
                ${WOMEN_HERO_SRC_SET[1]} 384w,
                ${WOMEN_HERO_SRC_SET[2]} 512w,
                ${WOMEN_HERO_SRC_SET[3]} 640w,
                ${WOMEN_HERO_SRC_SET[4]} 768w
              `}
              sizes={SIZES}
              fetchPriority="high"
              alt="Women's Collection"
              quality="auto:best"
              resize="fill"
              className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:scale-105 group-hover:brightness-100"
            />

            <div className="absolute inset-0 bg-background/30 transition-colors group-hover:bg-background/20" />

            <div className="absolute left-1/2 top-10/16 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="flex flex-col items-center justify-center gap-5">
                <div>
                  <p className="text-5xl font-bold font-secondary text-primary md:text-7xl lg:text-8xl">
                    WOMEN
                  </p>
                </div>
                <Button className="rounded-full">Odkryj kolekcję</Button>
              </div>
            </div>
          </Link>
        </article>
      </div>

      {/* Vertical center divider */}
      <div className="flex">
        <Link
          to="/projekty"
          className={cn(
            buttonVariants({
              variant: "default",
            }),
            "flex-1 h-16 text-lg  bg-emerald-400/80 text-primary hover:bg-emerald-400"
          )}
        >
          <ChevronLeft className="size-5" />
          Projekty
        </Link>
        <Link
          to="/kategorie"
          className={cn(
            buttonVariants({
              variant: "default",
            }),
            "flex-1 h-16 text-lg bg-purple-600/80 text-primary hover:bg-purple-700"
          )}
        >
          Ubrania
          <ChevronRight className="size-5" />
        </Link>
      </div>
    </section>
  );
}

function TopFeaturedSection({
  href,
  promise,
  title,
  className,
}: {
  title: string;
  href: string;
  promise: Promise<
    Array<{
      id: string;
      images: {
        url: string;
        alt: string;
      }[];
      name: string;
      pricing: PriceDisplayData;
      href: string;
    }>
  >;
  className?: string;
}) {
  return (
    <section
      className={cn("space-y-4 py-24", className)}
      aria-labelledby="featured"
    >
      <div className="flex flex-col gap-4 mr-auto justify-start">
        <div className="flex flex-col justify-start">
          <h2
            id="featured"
            className="text-3xl uppercase tracking-[0.2em] text-primary font-light px-4 sm:px-6 lg:px-8 font-secondary text-left"
          >
            {title}
          </h2>

          <Link
            to={href}
            className={cn(
              buttonVariants({
                variant: "link",
                size: "lg",
              }),
              "size-fit m-0 p-0  gap-1 text-sm font-secondary tracking-wide font-light mr-auto self-end sm:ml-2 lg:ml-4"
            )}
          >
            Zobacz więcej
            <ChevronsRight />
          </Link>
        </div>
        <div className="h-px from-primary/50 to-transparent w-full mb-2 bg-linear-to-r" />

        <React.Suspense
          fallback={
            <Carousel
              opts={{
                dragFree: true,
              }}
            >
              <CarouselContent className="-ml-0">
                {Array.from({ length: 8 }).map((_, index) => (
                  <CarouselItem
                    key={`chunk-${index}`}
                    className="basis-48 pl-8 grid grid-rows-2 grid-cols-1 gap-8"
                  >
                    <Skeleton className="h-[303.83px] w-[160px]" />
                    <Skeleton className="h-[303.83px] w-[160px]" />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          }
        >
          <AsyncError
            resolve={promise}
            errorElement={
              <Error>
                <ErrorMedia>
                  <AlertCircleIcon />
                </ErrorMedia>
                <ErrorContent>
                  <ErrorTitle>Wystąpił błąd podczas ładowania</ErrorTitle>
                  <ErrorDescription>
                    Spróbuj odświeżyć stronę lub wrócić później.
                  </ErrorDescription>
                </ErrorContent>
              </Error>
            }
          >
            {(items) => {
              // Chunk items into pairs
              const chunkedItems = [];
              for (let i = 0; i < items.length; i += 2) {
                chunkedItems.push(items.slice(i, i + 2));
              }

              return (
                <Carousel
                  opts={{
                    dragFree: true,
                  }}
                >
                  <CarouselContent className="-ml-0">
                    {chunkedItems.map((chunk, chunkIndex) => (
                      <CarouselItem
                        key={`chunk-${chunkIndex}`}
                        className="basis-48 pl-8 grid grid-rows-2 grid-cols-1 gap-8"
                      >
                        {chunk.map((item) => {
                          const [primaryImage] = item.images;

                          return (
                            <article
                              key={item.id}
                              className={cn(
                                "group cursor-pointer w-full h-full !p-0",
                                className
                              )}
                            >
                              <Link to={item.href || "#"} className="block">
                                <div className="mb-3 overflow-hidden relative aspect-3/4">
                                  <Image
                                    width={160}
                                    aspectRatio={3 / 4}
                                    src={primaryImage?.url || ""}
                                    alt={primaryImage?.alt || ""}
                                    resize="autoPad"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>

                                <div className="flex flex-col">
                                  <h3 className="text-sm text-foreground leading-snug line-clamp-2 mb-0.5">
                                    {item.name}
                                  </h3>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-foreground">
                                      {formatCurrency(item.pricing.finalPrice)}
                                    </span>
                                    {item.pricing.hasDiscount && (
                                      <Badge variant="success">
                                        {formatDiscountLabel(
                                          item.pricing.discount
                                        )}
                                      </Badge>
                                    )}
                                  </div>
                                  {item.pricing.hasDiscount && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      {formatCurrency(
                                        item.pricing.originalPrice
                                      )}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </article>
                          );
                        })}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              );
            }}
          </AsyncError>
        </React.Suspense>

        <div className="h-px from-primary/50 to-transparent w-full bg-linear-to-r" />
      </div>
    </section>
  );
}

function CategoriesSection({
  categoriesPromise,
}: {
  categoriesPromise: Promise<
    DBQueryResult<"categories", { with: { image: true } }>[]
  >;
}) {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col"
      aria-labelledby="categories-heading"
    >
      <h2
        id="categories-heading"
        className="text-3xl uppercase tracking-[0.2em] font-light text-center font-secondary"
      >
        Kategorie
      </h2>

      <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent w-full mt-2.5" />

      <React.Suspense
        fallback={Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className="aspect-square block w-1/3 md:w-1/4 lg:w-1/5"
          />
        ))}
      >
        <AsyncError
          resolve={categoriesPromise}
          errorElement={
            <Error>
              <ErrorMedia>
                <AlertCircleIcon />
              </ErrorMedia>
              <ErrorContent>
                <ErrorTitle>Wystąpił błąd podczas ładowania</ErrorTitle>
                <ErrorDescription>
                  Spróbuj odświeżyć stronę lub wrócić później.
                </ErrorDescription>
              </ErrorContent>
            </Error>
          }
        >
          {(categories) => (
            <nav className="w-full mt-4">
              <ul
                role="list"
                className="flex flex-wrap gap-4 justify-center items-center"
              >
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="relative border aspect-square group size-full block w-[calc(33.333%-0.75rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.75rem)] text-center font-secondary tracking-wide"
                  >
                    <Link to={`/kategorie/${getSlugPath(category)}`}>
                      <Image
                        src={category.image?.url || ""}
                        alt={`Kategoria ${category.name}`}
                        aspectRatio={1}
                        width={240}
                        height={240}
                        resize="fill"
                        className="size-full absolute object-cover"
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

                      <h3 className="text-primary font-light leading-tight tracking-tight shrink-0 overflow-hidden absolute bottom-0 left-0 right-0 p-4 text-xl md:text-3xl lg:text-3xl">
                        {category.name}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </AsyncError>
      </React.Suspense>

      <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent w-full mt-4" />
    </section>
  );
}

function TagsSection() {
  const { isInCart, addPiece, removePiece } = useCart();
  const { data: tags, isPending, isError } = useHomeTags();

  if (isPending) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, index) => (
          <React.Fragment key={index}>
            <section className="flex flex-col relative">
              <Skeleton className="absolute inset-0 size-full" />

              <nav className="pb-18">
                <Carousel
                  opts={{
                    dragFree: true,
                    align: "start",
                  }}
                  className="w-full h-fit"
                >
                  <CarouselContent className="max-w-7xl mx-auto">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <CarouselItem key={index} className="basis-[248px]">
                        <Skeleton className="w-[248px] h-[417.98px]" />
                        <Skeleton className="w-[248px] h-[417.98px]" />
                        <Skeleton className="w-[248px] h-[417.98px]" />
                        <Skeleton className="w-[248px] h-[417.98px]" />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </nav>
            </section>
            {index < 4 - 1 && (
              <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent w-full mt-2.5" />
            )}
          </React.Fragment>
        ))}
      </>
    );
  }

  if (isError) {
    return (
      <Error>
        <ErrorMedia>
          <AlertCircleIcon />
        </ErrorMedia>
        <ErrorContent>
          <ErrorTitle>Wystąpił błąd podczas ładowania tagów</ErrorTitle>
          <ErrorDescription>
            Spróbuj odświeżyć stronę lub wrócić później.
          </ErrorDescription>
        </ErrorContent>
      </Error>
    );
  }

  return (
    <>
      {tags.map((tag, index) => (
        <React.Fragment key={tag.id}>
          <section
            className="flex flex-col relative"
            aria-labelledby={`tag-${tag.id}`}
          >
            <div className="absolute inset-0 size-full bg-linear-to-t from-background/90 via-background/20 via-80% to-background/90 z-0" />
            <Image
              src={tag.image?.url || ""}
              alt={tag.name}
              lazyload
              resize="fill"
              responsive
              className="size-full absolute -z-10 object-cover"
            />

            <Link
              to={`/kategorie?tags=${tag.slug}`}
              className="h-36 md:h-44 lg:h-60"
            >
              <div className="size-full flex items-center justify-center p-12 font-secondary">
                <h2 className="text-4xl leading-tight font-medium text-foreground sm:text-5xl md:text-6xl lg:text-7xl relative z-10">
                  {tag.name}
                </h2>
              </div>
            </Link>
            <nav
              className="pb-18"
              aria-label={`Produkty z kategorii ${tag.name}`}
            >
              <Carousel
                opts={{
                  dragFree: true,
                  align: "start",
                }}
                className="w-full h-fit"
              >
                <CarouselContent className="max-w-7xl mx-auto">
                  {tag.piecesToTags.map(({ piece }, pieceIndex) => (
                    <CarouselItem key={piece.id} className="basis-[248px]">
                      <MainPieceCard
                        piece={piece}
                        href={`/ubrania/${piece.slug}`}
                        isInCart={isInCart(piece.id)}
                        onClick={() => {
                          window.gtag?.("event", "select_item", {
                            item_list_id: `tag_${tag.id}`,
                            item_list_name: tag.name,
                            items: [
                              pieceToGoogleAnalyticsItem(piece, {
                                item_list_id: `tag_${tag.id}`,
                                item_list_name: tag.name,
                                index: pieceIndex,
                              }),
                            ],
                          });
                        }}
                        onToggleCart={() => {
                          if (isInCart(piece.id)) {
                            removePiece(piece.id, true, {
                              item_list_id: `tag_${tag.id}`,
                              item_list_name: tag.name,
                              index: pieceIndex,
                            });
                          } else {
                            addPiece(piece, true, {
                              item_list_id: `tag_${tag.id}`,
                              item_list_name: tag.name,
                              index: pieceIndex,
                            });
                          }
                        }}
                      />
                    </CarouselItem>
                  ))}
                  <CarouselItem className="basis-[248px]">
                    <Link
                      to={`/kategorie?tags=${tag.slug}`}
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                        }),
                        "min-w-full min-h-full"
                      )}
                    >
                      Zobacz więcej
                      <ChevronRight />
                    </Link>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
            </nav>
          </section>
          {index < tags.length - 1 && (
            <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent w-full mt-2.5" />
          )}
        </React.Fragment>
      ))}
    </>
  );
}

function FeaturedProductsSection() {
  const { isInCart, addProduct, removeProduct } = useCart();
  const { onProductBuyNow } = useCheckoutDialog();
  const { data: products, isPending, isError } = useFeaturedProducts();

  return (
    <section
      className="mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4"
      aria-labelledby="featured-products-heading"
    >
      <h2
        id="featured-products-heading"
        className="text-3xl uppercase tracking-[0.2em] text-primary font-light text-center pb-4 font-secondary"
      >
        Projekty
      </h2>

      <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent w-full mb-4" />

      {isPending ? (
        <Carousel
          opts={{
            dragFree: true,
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {Array.from({ length: 8 }).map((_, index) => (
              <CarouselItem key={index} className="basis-[312px] pl-8">
                <Skeleton className="w-[280px] h-[373.3px]" />
              </CarouselItem>
            ))}
            <CarouselItem className="basis-[280px]">
              <Link
                to="/projekty"
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "min-w-full min-h-full"
                )}
              >
                Zobacz więcej
                <ChevronRight />
              </Link>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      ) : isError ? (
        <Error>
          <ErrorMedia>
            <AlertCircleIcon />
          </ErrorMedia>
          <ErrorContent>
            <ErrorTitle>Wystąpił błąd podczas ładowania projektów</ErrorTitle>
            <ErrorDescription>
              Spróbuj odświeżyć stronę lub wrócić później.
            </ErrorDescription>
          </ErrorContent>
        </Error>
      ) : (
        <Carousel
          opts={{
            dragFree: true,
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product, index) => (
              <CarouselItem key={product.id} className="basis-[312px] pl-8">
                <MainProductCard
                  product={product}
                  href={`/projekty/${product.slug}`}
                  onClick={() => {
                    window.gtag?.("event", "select_item", {
                      item_list_id: "featured_products",
                      item_list_name: "Polecane projekty",
                      items: productToGoogleAnalyticsItem(product, {
                        item_list_id: "featured_products",
                        item_list_name: "Polecane projekty",
                        index,
                      }),
                    });
                  }}
                  onToggleCart={() => {
                    if (isInCart(product.id)) {
                      removeProduct(product.id, true, {
                        item_list_id: `featured_products`,
                        item_list_name: "Polecane projekty",
                        index: index,
                      });
                    } else {
                      addProduct(product, true, {
                        item_list_id: `featured_products`,
                        item_list_name: "Polecane projekty",
                        index: index,
                      });
                    }
                  }}
                  isInCart={isInCart(product.id)}
                  onBuyNow={() =>
                    onProductBuyNow(product, {
                      item_list_id: `featured_products`,
                      item_list_name: "Polecane projekty",
                      index: index,
                    })
                  }
                />
              </CarouselItem>
            ))}
            <CarouselItem className="basis-[280px]">
              <Link
                to="/projekty"
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "min-w-full min-h-full"
                )}
              >
                Zobacz więcej
                <ChevronRight />
              </Link>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
}

function AsyncError<Resolve>({
  errorElement,
  ...props
}: {
  errorElement: ((error: unknown) => React.ReactNode) | React.ReactNode;
} & Omit<AwaitProps<Resolve>, "errorElement">) {
  const error = useAsyncError();

  if (error !== undefined) {
    console.error(error);
  }

  return (
    <Await
      errorElement={
        typeof errorElement === "function" ? errorElement(error) : errorElement
      }
      {...props}
    />
  );
}
