import * as schema from "db/schema";
import { filterService } from "db/services/filter.service";
import { and, asc, eq, isNull, lte, or } from "drizzle-orm";
import { exists } from "drizzle-orm";
import { ChevronsRightIcon, ShoppingCartIcon, ZapIcon } from "lucide-react";
import React from "react";
import { Await, Link } from "react-router";
import {
  A11y,
  FreeMode,
  Keyboard,
  Mousewheel,
  Navigation,
  Thumbs,
} from "swiper/modules";
import { SwiperSlide } from "swiper/react";
import { Swiper as SwiperComponent } from "swiper/react";
import type { Swiper } from "swiper/types";

import { Button, buttonVariants } from "~/components/ui/button";
import { Container, Section } from "~/components/ui/layout";

import { ImagesDrawerCarousel } from "~/components/features/images-dialog-carousel/images-dialog-carousel";
import { MainPieceCard } from "~/components/features/product-card/main-piece-card";
import { useCart } from "~/components/features/providers/cart-provider";
import { useCheckoutDialog } from "~/components/features/providers/checkout-dialog-provider";
import { db } from "~/lib/db";
import { generateProductStructuredData } from "~/lib/seo";
import { cn, formatCurrency, priceFromGrosz } from "~/lib/utils";

import type { Route } from "./+types/piece-detail.page";

const BASE_URL = import.meta.env.VITE_APP_URL || "https://acrm.pl";

export async function loader({ params }: Route.LoaderArgs) {
  const { pieceSlug } = params;
  const piece = await db.query.pieces.findFirst({
    where: and(
      eq(schema.pieces.slug, pieceSlug),
      eq(schema.pieces.status, "published"),
      or(
        isNull(schema.pieces.reservedUntil),
        lte(schema.pieces.reservedUntil, new Date())
      ),
      or(
        isNull(schema.pieces.productId),
        exists(
          db
            .select({ id: schema.products.id })
            .from(schema.products)
            .where(
              and(
                eq(schema.products.id, schema.pieces.productId),
                eq(schema.products.status, "published")
              )
            )
        )
      )
    ),
    with: {
      product: {
        columns: {
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: asc(schema.images.displayOrder),
      },
      brand: true,
      size: true,
      category: true,
      measurements: true,
      piecesToTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!piece) {
    throw new Response("Piece not found", { status: 404 });
  }

  const similarPiecesPromise = filterService.findSimilarPieces(
    piece.id,
    {
      with: {
        images: {
          limit: 1,
          orderBy: asc(schema.images.displayOrder),
        },
        brand: true,
        size: true,
        category: true,
        measurements: true,
      },
    },
    8
  );

  return { piece, similarPiecesPromise };
}

export default function PieceDetailPage({ loaderData }: Route.ComponentProps) {
  const { piece, similarPiecesPromise } = loaderData;

  const { isInCart, addPiece, removePiece } = useCart();
  const { onPieceBuyNow } = useCheckoutDialog();
  const [thumbsSwiper, setThumbsSwiper] = React.useState<Swiper | null>(null);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const thumbsImages = piece.images.concat(piece.images);

  const pageTitle = `${piece.name} | ${piece.brand.name} | ACRM`;
  const pageDescription = `${piece.brand.name} ${piece.name}, rozmiar ${piece.size.name}. ${piece.category?.name || ""}. Cena: ${(piece.priceInGrosz / 100).toFixed(2)} zł. Darmowa dostawa InPost.`;
  const pageUrl = `${BASE_URL}/ubrania/${piece.slug}`;
  const pageImage = piece.images[0]?.url || `${BASE_URL}/logo-dark.png`;
  const price = (piece.priceInGrosz / 100).toFixed(2);
  const availability =
    piece.status === "published" ? "in stock" : "out of stock";

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="robots" content="index, follow" />

      <meta property="og:type" content="product" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content="ACRM | Fashion Projects" />
      <meta property="og:locale" content="pl_PL" />

      <meta property="product:price:amount" content={price} />
      <meta property="product:price:currency" content="PLN" />
      <meta property="product:availability" content={availability} />
      <meta property="product:brand" content={piece.brand.name} />
      <meta property="product:condition" content="used" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      <link rel="canonical" href={pageUrl} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductStructuredData(piece)),
        }}
      />

      <Container>
        <Section>
          <div className="relative grid w-full grid-cols-1 md:grid-cols-2 gap-4.5 md:gap-8">
            <div className="max-w-full h-full space-y-2">
              <SwiperComponent
                onSlideChangeTransitionStart={(swiper) => {
                  setActiveIndex(swiper.realIndex % piece.images.length);
                }}
                loop={true}
                spaceBetween={10}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Thumbs, A11y, Keyboard, Mousewheel]}
                keyboard
                mousewheel
              >
                {piece.images.map((image) => (
                  <SwiperSlide
                    key={image.id}
                    className="cursor-zoom-in"
                    onClick={() => {
                      setIsDialogOpen(true);
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="aspect-6/5 object-contain"
                    />
                  </SwiperSlide>
                ))}
              </SwiperComponent>
              <SwiperComponent
                onSwiper={setThumbsSwiper}
                loop={true}
                breakpoints={{
                  0: {
                    slidesPerView: 5,
                  },
                  1024: {
                    slidesPerView: 6,
                  },
                  1536: {
                    slidesPerView: 7,
                  },
                }}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs, Mousewheel]}
                mousewheel={{
                  forceToAxis: true,
                }}
              >
                {thumbsImages.map((image, index) => (
                  <SwiperSlide key={image.id} className="p-1">
                    <div
                      className={cn(
                        "aspect-square border transition-all duration-300",
                        index % piece.images.length === activeIndex
                          ? "border-primary scale-105"
                          : " border-primary/50 scale-100"
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="object-cover size-full aspect-square"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </SwiperComponent>
            </div>

            <div className="pt-4.5 flex flex-col h-full justify-between">
              <div className="flex flex-col">
                <div className="flex flex-row gap-4 md:flex-col items-center md:items-start justify-between">
                  <h1 className="text-4xl leading-none font-normal lg:text-7xl">
                    {piece.name}
                  </h1>
                  <p className="text-3xl font-bold">
                    {formatCurrency(priceFromGrosz(piece.priceInGrosz))}
                  </p>
                </div>
                <div className="flex flex-row gap-4 md:flex-col items-center md:items-start justify-between mt-4">
                  <div className="flex items-center gap-2 text-lg font-secondary">
                    <span className="">Marka:</span>
                    <span className="font-bold">{piece.brand.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-secondary">
                    <span className="">Rozmiar:</span>
                    <span className="font-bold">{piece.size.name}</span>
                  </div>
                </div>
                <div className="font-secondary grid grid-cols-2 border border-primary border-1.5 divide-x divide-primary divide-1.5 divide-y mt-6 text-sm">
                  {piece.measurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className="flex justify-between  p-1 md:p-2"
                    >
                      <span className="font-bold">{measurement.name}</span>
                      <span>
                        {measurement.value} {measurement.unit}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 w-full mt-8 md:mt-16">
                  <Button
                    onClick={() => onPieceBuyNow(piece)}
                    className="flex-1"
                  >
                    <ZapIcon /> Kup teraz
                  </Button>
                  <Button
                    variant={isInCart(piece.id) ? "default" : "secondary"}
                    onClick={() => {
                      if (isInCart(piece.id)) {
                        removePiece(piece.id);
                      } else {
                        addPiece(piece);
                      }
                    }}
                  >
                    <ShoppingCartIcon />
                  </Button>
                </div>
                {piece.product && (
                  <Link
                    to={`/projekty/${piece.product.slug}`}
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                        className: "mt-4 h-fit whitespace-normal",
                      })
                    )}
                  >
                    Dostępne też w projekcie {piece.product.name}
                    <ChevronsRightIcon />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Section>
      </Container>

      <section
        className="py-18 flex flex-col gap-4"
        aria-labelledby="categories-heading"
      >
        <h2
          id="categories-heading"
          className="text-3xl uppercase tracking-[0.2em] font-light text-center font-secondary"
        >
          Polecane
        </h2>

        <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent w-full mt-2.5" />

        <React.Suspense fallback={<div>Loading...</div>}>
          <Await resolve={similarPiecesPromise}>
            {(similarPieces) => (
              <nav
                className="mx-4 sm:mx-6 lg:mx-8"
                aria-label={`Polecane produkty`}
              >
                <SwiperComponent
                  style={
                    {
                      "--swiper-horizontal-padding": "8",
                    } as React.CSSProperties
                  }
                  className="w-full h-fit mx-auto"
                  modules={[A11y, Keyboard, FreeMode, Mousewheel]}
                  mousewheel={{
                    forceToAxis: true,
                  }}
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
                  keyboard
                  spaceBetween={10}
                  freeMode
                >
                  {similarPieces.map((piece) => (
                    <SwiperSlide key={piece.id}>
                      <MainPieceCard
                        piece={piece}
                        href={`/ubrania/${piece.slug}`}
                        isInCart={isInCart(piece.id)}
                        onBuyNow={() => onPieceBuyNow(piece)}
                        onToggleCart={() => {
                          if (isInCart(piece.id)) {
                            removePiece(piece.id);
                          } else {
                            addPiece(piece);
                          }
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </SwiperComponent>
              </nav>
            )}
          </Await>
        </React.Suspense>
      </section>

      <ImagesDrawerCarousel
        images={piece.images.map((image) => image.url)}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        defaultActiveIndex={activeIndex}
      />
    </>
  );
}
