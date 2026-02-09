import * as schema from "db/schema";
import { asc, desc } from "drizzle-orm";
import {
  AlertCircleIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import React from "react";
import { Await, Link } from "react-router";
import { A11y, FreeMode, Keyboard, Mousewheel } from "swiper/modules";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";

import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
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
import { db } from "~/lib/db";
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

const PAGE_TITLE = "ACRM | Fashion Projects";

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

export async function loader() {
  const categoriesPromise = api.categories.get
    .all({
      query: {
        scope: "featured",
        orderBy: "featuredOrder",
        sortOrder: "asc",
        // 1 hour
        cache: 60 * 60,
      },
    })
    .then((res) => res.body.categories);

  const tagsPromise = db.query.tags
    .findMany({
      with: {
        image: true,
        piecesToTags: {
          orderBy: desc(schema.piecesToTags.createdAt),
          limit: 4,
          with: {
            piece: {
              with: {
                discount: true,
                brand: true,
                size: true,
                category: true,
                images: {
                  limit: 1,
                  orderBy: asc(schema.images.displayOrder),
                },
              },
            },
          },
          where: (piecesToTags, { exists, and, eq, lte, or, isNull }) =>
            exists(
              db
                .select()
                .from(schema.pieces)
                .where(
                  and(
                    eq(schema.pieces.id, piecesToTags.pieceId),
                    eq(schema.pieces.status, "published"),
                    or(
                      isNull(schema.pieces.reservedUntil),
                      lte(schema.pieces.reservedUntil, new Date())
                    )
                  )
                )
            ),
        },
      },
      orderBy: asc(schema.tags.featuredOrder),
    })
    .then((res) => res);

  const featuredProductsPromise = api.products.get
    .all({
      query: {
        limit: 30,
        scope: "featured",
        orderBy: "featuredOrder",
        sortOrder: "desc",
        // 5 minutes
        cache: 60 * 5,
        description: false,
        images: "primary",
        piecesImages: "primary",
      },
    })
    .then((res) => res.body.products);

  const topProductsPromise = api.products.get
    .all({
      query: {
        limit: 16,
        scope: "all",
        orderBy: "homeFeaturedOrder",
        sortOrder: "desc",
        // 5 minutes
        cache: 60 * 5,
        description: false,
        images: "primary",
        piecesImages: "primary",
      },
    })
    .then((res) =>
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
      query: {
        limit: 16,
        scope: "featured",
        orderBy: "homeFeaturedOrder",
        sortOrder: "desc",
        images: "primary",
        // 5 minutes
        cache: 60 * 5,
      },
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

  return {
    categoriesPromise,
    topPiecesPromise,
    topProductsPromise,
    tagsPromise,
    featuredProductsPromise,
  };
}

export const meta: Route.MetaFunction = () => [
  { title: PAGE_TITLE },
  {
    name: "description",
    content:
      "Sklep z projektami mody z second-handu. Unikalne zestawy w topowych stylach. Marki premium jak Dickies, Nike, Carhartt w przystępnych cenach. Darmowa dostawa, wysyłka w 24h, zwroty do 14 dni.",
  },
  { name: "robots", content: "index, follow" },
  { property: "og:title", content: PAGE_TITLE },
  { property: "og:type", content: "website" },
  { property: "og:image", content: "https://acrm.pl/logo-light.png" },
  { property: "og:url", content: "https://acrm.pl/" },
  {
    property: "og:description",
    content:
      "Sklep z projektami mody z second-handu. Unikalne zestawy w topowych stylach. Marki premium jak Dickies, Nike, Carhartt w przystępnych cenach. Darmowa dostawa, wysyłka w 24h, zwroty do 14 dni.",
  },
  { property: "og:url", content: "https://acrm.pl" },
  { property: "og:image:url", content: "https://acrm.pl/logo-light.png" },
  { property: "og:image:type", content: "image/png" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  {
    property: "og:image:alt",
    content: "ACRM Fashion Projects - Sklep z odzieżą używaną",
  },
  { name: "twitter:card", content: "summary_large_image" },
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    categoriesPromise,
    tagsPromise,
    featuredProductsPromise,
    topPiecesPromise,
    topProductsPromise,
  } = loaderData;

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

      <TagsSection tagsPromise={tagsPromise} />

      {/* Featured products */}
      <FeaturedProductsSection
        featuredProductsPromise={featuredProductsPromise}
      />
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
            <SwiperComponent
              style={
                {
                  "--swiper-horizontal-padding": "8",
                } as React.CSSProperties
              }
              slidesPerView="auto"
              spaceBetween={32}
              modules={[FreeMode, Keyboard, Mousewheel]}
              mousewheel={{
                forceToAxis: true,
              }}
              keyboard
              className="size-full"
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <SwiperSlide
                  key={`skeleton-${index}`}
                  className="max-w-40 min-w-[160px] h-[584px]"
                >
                  <div className="flex flex-col gap-4">
                    <div>
                      <Skeleton className="mb-3 aspect-3/4" />

                      <div className={cn("flex flex-col gap-1 items-start")}>
                        <Skeleton className="h-[20px] w-1/2" />
                        <Skeleton className="h-[16px] w-1/3" />
                      </div>
                    </div>{" "}
                    <div>
                      <Skeleton className="mb-3 aspect-3/4" />

                      <div className={cn("flex flex-col gap-1 items-start")}>
                        <Skeleton className="h-[20px] w-1/2" />
                        <Skeleton className="h-[16px] w-1/3" />
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </SwiperComponent>
          }
        >
          <Await
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
                <SwiperComponent
                  style={
                    {
                      "--swiper-horizontal-padding": "8",
                    } as React.CSSProperties
                  }
                  slidesPerView="auto"
                  spaceBetween={32}
                  modules={[FreeMode, Keyboard, Mousewheel]}
                  mousewheel={{
                    forceToAxis: true,
                  }}
                  keyboard
                  className="size-full"
                >
                  {chunkedItems.map((chunk, chunkIndex) => (
                    <SwiperSlide
                      key={`chunk-${chunkIndex}`}
                      className="max-w-40 min-w-[160px] h-fit space-y-8"
                    >
                      {chunk.map((item) => {
                        const [primaryImage] = item.images;

                        return (
                          <article
                            key={item.id}
                            className={cn(
                              "group cursor-pointer w-[160px] h-fit !p-0",
                              className
                            )}
                          >
                            <Link
                              to={item.href || "#"}
                              className="block h-[308px]"
                            >
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
                                    {formatCurrency(item.pricing.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </article>
                        );
                      })}
                    </SwiperSlide>
                  ))}
                </SwiperComponent>
              );
            }}
          </Await>
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
        <Await
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
                        srcSet=""
                        aspectRatio={1}
                        width={240}
                        height={240}
                        resize="fill"
                        className="size-full absolute object-cover"
                        responsive
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
        </Await>
      </React.Suspense>

      <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent w-full mt-4" />
    </section>
  );
}

function TagsSection({
  tagsPromise,
}: {
  tagsPromise: Promise<
    DBQueryResult<
      "tags",
      {
        with: {
          image: true;
          piecesToTags: {
            with: {
              piece: {
                with: {
                  images: true;
                  brand: true;
                  size: true;
                  category: true;
                  discount: true;
                };
              };
            };
          };
        };
      }
    >[]
  >;
}) {
  const { isInCart, addPiece, removePiece } = useCart();
  return (
    <React.Suspense
      fallback={Array.from({ length: 4 }).map((_, index) => (
        <section key={index} className="flex flex-col gap-6 py-12">
          <Skeleton className="h-28 md:h-32 lg:h-48" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SwiperComponent
              modules={[A11y, Keyboard, Mousewheel, FreeMode]}
              mousewheel={{
                forceToAxis: true,
              }}
              keyboard
              spaceBetween={10}
              freeMode
              slidesPerView={2}
              breakpoints={{
                0: {
                  slidesPerView: 2,
                },
                640: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
                1280: {
                  slidesPerView: 5,
                },
              }}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <SwiperSlide key={index}>
                  <Skeleton className="aspect-5/8" />
                </SwiperSlide>
              ))}

              <SwiperSlide className="aspect-5/8">
                <Link
                  to="/kategorie"
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
              </SwiperSlide>
            </SwiperComponent>
          </div>
        </section>
      ))}
    >
      <Await
        resolve={tagsPromise}
        errorElement={
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
        }
      >
        {(tags) =>
          tags.map((tag, index) => (
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
                  className="mx-4 sm:mx-6 lg:mx-8 pb-18"
                  aria-label={`Produkty z kategorii ${tag.name}`}
                >
                  <SwiperComponent
                    className="w-full h-fit max-w-7xl "
                    modules={[A11y, Keyboard, FreeMode]}
                    keyboard
                    slidesPerView="auto"
                    spaceBetween={10}
                    breakpoints={{
                      0: {
                        slidesPerView: 2,
                      },
                      768: {
                        slidesPerView: 3,
                      },
                      1024: {
                        slidesPerView: 4,
                      },
                      1280: {
                        slidesPerView: 5,
                      },
                    }}
                    freeMode
                  >
                    {tag.piecesToTags.map(({ piece }, pieceIndex) => (
                      <SwiperSlide key={piece.id}>
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
                      </SwiperSlide>
                    ))}

                    <SwiperSlide className="aspect-5/8">
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
                    </SwiperSlide>
                  </SwiperComponent>
                </nav>
              </section>
              {index < tags.length - 1 && (
                <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent w-full mt-2.5" />
              )}
            </React.Fragment>
          ))
        }
      </Await>
    </React.Suspense>
  );
}

function FeaturedProductsSection({
  featuredProductsPromise,
}: {
  featuredProductsPromise: Promise<
    DBQueryResult<
      "products",
      {
        columns: {
          description: false;
        };
        with: {
          images: true;
          discount: true;
          pieces: {
            with: {
              images: true;
              brand: true;
              size: true;
              category: true;
              discount: true;
            };
          };
        };
      }
    >[]
  >;
}) {
  const { isInCart, addProduct, removeProduct } = useCart();
  const { onProductBuyNow } = useCheckoutDialog();

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

      <React.Suspense
        fallback={
          <SwiperComponent
            className="w-full"
            modules={[A11y, Keyboard, Mousewheel]}
            keyboard
            mousewheel={{
              forceToAxis: true,
            }}
            slidesPerView="auto"
            spaceBetween={10}
            freeMode
            initialSlide={1}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <SwiperSlide key={index} className="basis-[280px]">
                <Skeleton className="w-[280px] aspect-6/8  cursor-pointer" />
              </SwiperSlide>
            ))}
            <SwiperSlide className="basis-[280px] aspect-6/8">
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
            </SwiperSlide>
          </SwiperComponent>
        }
      >
        <Await
          resolve={featuredProductsPromise}
          errorElement={
            <Error>
              <ErrorMedia>
                <AlertCircleIcon />
              </ErrorMedia>
              <ErrorContent>
                <ErrorTitle>
                  Wystąpił błąd podczas ładowania projektów
                </ErrorTitle>
                <ErrorDescription>
                  Spróbuj odświeżyć stronę lub wrócić później.
                </ErrorDescription>
              </ErrorContent>
            </Error>
          }
        >
          {(products) => (
            <SwiperComponent
              className="w-full"
              modules={[A11y, Keyboard, Mousewheel]}
              keyboard
              mousewheel={{
                forceToAxis: true,
              }}
              slidesPerView="auto"
              spaceBetween={10}
              freeMode
              initialSlide={1}
            >
              {products.map((product, index) => (
                <SwiperSlide key={product.id} className="basis-[280px]">
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
                </SwiperSlide>
              ))}
              <SwiperSlide className="basis-[280px] aspect-6/8">
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
              </SwiperSlide>
            </SwiperComponent>
          )}
        </Await>
      </React.Suspense>
    </section>
  );
}
