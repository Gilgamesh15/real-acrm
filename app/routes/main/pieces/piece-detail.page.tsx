import * as schema from "db/schema";
import { filterService } from "db/services/filter.service";
import { and, asc, eq, isNull, lte, or } from "drizzle-orm";
import { exists } from "drizzle-orm";
import {
  InfoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  CreditCard,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingCartIcon,
  Truck,
  ZapIcon,
} from "lucide-react";
import React from "react";
import { Await, Link } from "react-router";
import type { MetaDescriptor } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import type { CarouselApi } from "~/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { DirectionAwareTabs } from "~/components/ui/direction-aware-tabs";
import Image from "~/components/ui/image";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

import { ImagesDrawerCarousel } from "~/components/features/images-dialog-carousel/images-dialog-carousel";
import { MainPieceCard } from "~/components/features/product-card/main-piece-card";
import { useCart } from "~/components/features/providers/cart-provider";
import { useCheckoutDialog } from "~/components/features/providers/checkout-dialog-provider";
import { RichText } from "~/components/shared/rich-text/rich-text";
import { db } from "~/lib/db";
import { generatePieceStructuredData } from "~/lib/seo";
import {
  calculatePiecePriceDisplayData,
  cn,
  formatCurrency,
  formatDiscountLabel,
  pieceToGoogleAnalyticsItem,
} from "~/lib/utils";

import type { Route } from "./+types/piece-detail.page";

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
      discount: true,
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
        discount: true,
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

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const { piece } = loaderData;
  const pricingData = calculatePiecePriceDisplayData(piece);

  const pageUrl = `https://www.acrm.pl/ubrania/${piece.slug}`;
  const pageImage = piece.images[0]?.url || "https://www.acrm.pl/logo-dark.png";

  const metaTags: MetaDescriptor[] = [
    { title: piece.metaTitle },
    { name: "description", content: piece.metaDescription },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "product" },
    { property: "og:title", content: piece.metaTitle },
    { property: "og:description", content: piece.metaDescription },
    { property: "og:url", content: pageUrl },
    { property: "og:image", content: pageImage },
    { property: "og:site_name", content: "ACRM | Fashion Projects" },
    { property: "og:locale", content: "pl_PL" },
    { property: "product:price:amount", content: pricingData.finalPrice },
    { property: "product:price:currency", content: "PLN" },
    {
      property: "product:availability",
      content: piece.status === "published" ? "in stock" : "out of stock",
    },
    { property: "product:condition", content: "used" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: piece.metaTitle },
    { name: "twitter:description", content: piece.ogDescription },
    { name: "twitter:image", content: pageImage },
    { tagName: "link", rel: "canonical", href: pageUrl },
    { "script:ld+json": generatePieceStructuredData(piece) },
  ];
  if (piece.brand) {
    metaTags.push({ property: "product:brand", content: piece.brand.name });
  }
  if (piece.size) {
    metaTags.push({ property: "product:size", content: piece.size.name });
  }
  return metaTags;
};

export default function PieceDetailPage({ loaderData }: Route.ComponentProps) {
  const { piece, similarPiecesPromise } = loaderData;

  const loopedImages = React.useMemo(() => {
    if (piece.images.length <= 1) return piece.images;
    const images: typeof piece.images = [];
    let counter = 0;
    while (images.length < 12) {
      images.push(
        ...piece.images.map((image) => ({
          ...image,
          id: `${image.id}-${counter++}`,
        }))
      );
    }
    return images;
  }, [piece]);

  const pricingData = React.useMemo(() => {
    return calculatePiecePriceDisplayData(piece);
  }, [piece]);

  React.useEffect(() => {
    window.gtag?.("event", "view_item", {
      currency: "PLN",
      value: pricingData.finalPrice,
      items: [pieceToGoogleAnalyticsItem(piece)],
    });
  }, [piece, pricingData]);

  const { isInCart, addPiece, removePiece } = useCart();
  const { onPieceBuyNow } = useCheckoutDialog();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Main carousel
  const [mainApi, setMainApi] = React.useState<CarouselApi>();

  // Thumbs carousel
  const [thumbsApi, setThumbsApi] = React.useState<CarouselApi>();

  const onThumbClick = React.useCallback(
    (index: number) => {
      if (!mainApi || !thumbsApi) return;
      mainApi.scrollTo(index); // v8
    },
    [mainApi, thumbsApi]
  );

  const onSelect = React.useCallback(() => {
    if (!mainApi || !thumbsApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
    thumbsApi.scrollTo(mainApi.selectedScrollSnap());
  }, [mainApi, thumbsApi]);

  React.useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect).on("reInit", onSelect);
  }, [mainApi, onSelect]);

  return (
    <main>
      <section className="mx-auto max-w-7xl md:pt-8 md:pb-4 md:px-4">
        <div className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-14">
          {/* LEFT — Image gallery */}
          <div className="md:flex md:gap-3 md:flex-6">
            {/* Vertical thumbnail strip (desktop) */}
            <Carousel
              opts={{
                loop: true,
                dragFree: true,
              }}
              setApi={setThumbsApi}
              orientation="vertical"
              className="hidden md:block"
            >
              <CarouselContent className="w-18 max-h-[600px]">
                {loopedImages.map((img, index) => (
                  <CarouselItem key={img.id} className="md:max-h-[600px]">
                    <button
                      onClick={() => onThumbClick(index)}
                      className={cn(
                        "border transition-all",
                        index === selectedIndex
                          ? "border-foreground"
                          : "border-transparent opacity-75 hover:opacity-100"
                      )}
                    >
                      <Image
                        aspectRatio={1}
                        width={72}
                        height={72}
                        resize="fill"
                        className="aspect-square object-cover"
                        src={img.url}
                        alt={img.alt}
                      />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Main image */}
            <Carousel
              opts={{
                loop: true,
              }}
              setApi={setMainApi}
            >
              <CarouselContent>
                {loopedImages.map((image) => (
                  <CarouselItem
                    key={image.id}
                    className="cursor-zoom-in aspect-4/5 sm:aspect-square md:aspect-auto md:max-h-[600px]"
                    onClick={() => {
                      setIsDialogOpen(true);
                    }}
                  >
                    <Image
                      responsive
                      resize="autoPad"
                      src={image.url}
                      alt={image.alt}
                      className="object-contain size-full"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 backdrop-blur-sm">
                <ChevronLeftIcon className="size-4" />
              </CarouselPrevious>
              <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 backdrop-blur-sm">
                <ChevronRightIcon className="size-4" />
              </CarouselNext>

              {/* mobile thumbnails */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                {piece.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onThumbClick(i)}
                    className={cn(
                      "size-2 transition-colors",
                      i === selectedIndex % piece.images.length
                        ? "bg-foreground"
                        : "bg-foreground/30"
                    )}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            </Carousel>
          </div>

          {/* RIGHT — Purchase info (compact) */}
          <div
            className="flex flex-col px-4 sm:px-6 lg:px-8 md:flex-5 md:justify-center"
            //className="flex flex-col md:flex-5 justify-center"
          >
            <div className="flex flex-row justify-between items-end md:flex-col md:items-start">
              <div>
                <Badge variant="outline" className="mb-4">
                  Produkt używany
                </Badge>

                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {piece.brand?.name || "N/A"}
                </p>
                <h1 className="mt-1.5 font-heading text-3xl font-semibold leading-tight text-balance md:text-5xl">
                  {piece.name}
                </h1>
              </div>

              <div>
                {pricingData.hasDiscount ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold line-through">
                        {formatCurrency(pricingData.originalPrice)}
                      </span>
                      <Badge variant="success">
                        {formatDiscountLabel(pricingData.discount)}
                      </Badge>
                    </div>
                    <span className="text-3xl font-bold">
                      {formatCurrency(pricingData.finalPrice)}
                    </span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold">
                    {formatCurrency(pricingData.finalPrice)}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {"Cena zawiera VAT · Darmowa dostawa InPost"}
                </p>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Rozmiar</span>{" "}
                <span className="ml-2 font-medium">
                  {piece.size?.name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Stan</span>{" "}
                <span className="ml-2 font-medium">{piece.condition}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Kategoria</span>{" "}
                <span className="ml-2 font-medium">{piece.category?.name}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={() => onPieceBuyNow(piece)} className="flex-1">
                <ZapIcon /> Kup teraz
              </Button>
              <Button
                variant={isInCart(piece.id) ? "default" : "secondary"}
                onClick={() => {
                  if (isInCart(piece.id)) {
                    removePiece(piece.id, true);
                  } else {
                    addPiece(piece, true);
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

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              <InfoIcon className="mr-1.5 inline size-3" />
              Produkt oryginalny, z drugiego obiegu. ACRM nie jest powiązane z
              marką <strong>{piece.brand?.name || "tą marką"}</strong> —
              działamy jako niezależny sklep second-hand.
            </p>
          </div>
        </div>
      </section>

      {/* ========== FULL-WIDTH TABS ========== */}
      <section className="mt-6">
        <DirectionAwareTabs
          tabs={[
            {
              id: 0,
              label: "Opis",
              content: piece.description ? (
                <RichText
                  className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-6 max-w-7xl mx-auto"
                  content={piece.description}
                />
              ) : (
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
                  <p className="text-muted-foreground">Brak opisu</p>
                  <p className="text-muted-foreground">
                    Opis zostanie dodany wkrótce.
                  </p>
                </div>
              ),
            },
            {
              id: 1,
              label: "Dostawa i płatność",
              content: (
                <ItemGroup className="flex flex-col gap-4 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 md:flex-row md:flex-wrap">
                  <Item>
                    <ItemMedia variant="icon">
                      <Truck className="size-6 text-muted-foreground" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-base font-medium">
                        Kurier InPost
                      </ItemTitle>
                      <ItemDescription className="line-clamp-none">
                        Darmowa dostawa kurierem InPost prosto pod Twoje drzwi.
                        Wysyłamy w ciągu 24h od zaksięgowania płatności.
                      </ItemDescription>
                    </ItemContent>
                  </Item>

                  <Item>
                    <ItemMedia variant="icon">
                      <Package className="size-6 text-muted-foreground" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-base font-medium">
                        Paczkomat InPost 24/7
                      </ItemTitle>
                      <ItemDescription className="line-clamp-none">
                        Darmowa dostawa do wybranego paczkomatu InPost —
                        odbierz, kiedy Ci wygodnie. Wysyłamy w ciągu 24h od
                        zaksięgowania płatności.
                      </ItemDescription>
                    </ItemContent>
                  </Item>

                  <Item>
                    <ItemMedia variant="icon">
                      <CreditCard className="size-6 text-muted-foreground" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-base font-medium">
                        Płatność
                      </ItemTitle>
                      <ItemDescription className="line-clamp-none">
                        Płać wygodnie: karta, BLIK lub Apple Pay. Płatności
                        obsługuje Stripe. Wszystkie ceny zawierają VAT.
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </ItemGroup>
              ),
            },
            {
              id: 2,
              label: "Zwroty i reklamacje",
              content: (
                <ItemGroup className="flex flex-col gap-4 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 md:flex-row md:flex-wrap">
                  <Item>
                    <ItemMedia variant="icon">
                      <RotateCcw className="size-6 text-muted-foreground" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Zwroty</ItemTitle>
                      <ItemDescription className="line-clamp-none">
                        Masz 14 dni na zwrot — bez podawania przyczyny.
                        Wystarczy napisać na kontakt@acrm.pl lub wypełnić
                        formularz na acrm.pl/zwroty. Koszt przesyłki zwrotnej
                        po stronie kupującego.
                      </ItemDescription>
                    </ItemContent>
                  </Item>

                  <Item>
                    <ItemMedia variant="icon">
                      <ShieldCheck className="size-6 text-muted-foreground" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Reklamacje</ItemTitle>
                      <ItemDescription className="line-clamp-none">
                        Coś nie tak z zamówieniem? Napisz do nas na
                        kontakt@acrm.pl lub zgłoś przez formularz na
                        acrm.pl/zwroty — odpowiemy w ciągu 14 dni. Dbamy o to,
                        żeby każdy zakup był zgodny z opisem.
                      </ItemDescription>
                      <ItemDescription className="line-clamp-none">
                        Możesz też skorzystać z pozasądowego rozwiązywania
                        sporów — szczegóły na polubowne.uokik.gov.pl.
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </ItemGroup>
              ),
            },
            {
              id: 3,
              label: "Dane produktu",
              content: (
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
                  <div className="grid grid-cols-2 gap-px border border-border bg-border w-full">
                    {piece.measurements.map((m) => (
                      <div
                        key={m.id}
                        className="flex justify-between bg-background px-4 py-3 text-sm"
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {m.value} {m.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/**TODO ADD STYLE GUIDE LINK */}
                  {/* <p className="mt-4 text-xs text-muted-foreground leading-relaxed max-w-md">
                  Zobacz nasz
                </p>*/}
                </div>
              ),
            },
          ]}
        />
      </section>

      {/* ---- Similar items placeholder ---- */}
      <section className="space-y-4 mt-10">
        <h2
          id="categories-heading"
          className="text-3xl uppercase tracking-[0.2em] font-light text-center font-secondary"
        >
          Polecane
        </h2>

        <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent w-full mt-2.5" />

        <React.Suspense
          fallback={
            <Carousel
              opts={{
                dragFree: true,
                align: "start",
              }}
            >
              <CarouselContent>
                {Array.from({ length: 8 }).map((_, index) => (
                  <CarouselItem className="basis-[248px]" key={index}>
                    <Skeleton className="w-[248px] h-[373.3px]" />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          }
        >
          <Await resolve={similarPiecesPromise}>
            {(similarPieces) => (
              <Carousel
                opts={{
                  dragFree: true,
                  align: "start",
                }}
              >
                <CarouselContent>
                  {similarPieces.map((similarPiece, index) => (
                    <CarouselItem
                      key={similarPiece.id}
                      className="basis-[248px]"
                    >
                      <MainPieceCard
                        piece={similarPiece}
                        href={`/ubrania/${similarPiece.slug}`}
                        isInCart={isInCart(similarPiece.id)}
                        onClick={() => {
                          window.gtag?.("event", "select_item", {
                            item_list_id: `similar_${piece.id}`,
                            item_list_name: `Podobne do ${piece.name}`,
                            items: [
                              pieceToGoogleAnalyticsItem(similarPiece, {
                                item_list_id: `similar_${piece.id}`,
                                item_list_name: `Podobne do ${piece.name}`,
                                index,
                              }),
                            ],
                          });
                        }}
                        onToggleCart={() => {
                          if (isInCart(similarPiece.id)) {
                            removePiece(similarPiece.id, true, {
                              item_list_id: `similar_${piece.id}`,
                              item_list_name: `Podobne do ${piece.name}`,
                              index: index,
                            });
                          } else {
                            addPiece(similarPiece, true, {
                              item_list_id: `similar_${piece.id}`,
                              item_list_name: `Podobne do ${piece.name}`,
                              index: index,
                            });
                          }
                        }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
          </Await>
        </React.Suspense>
      </section>

      <ImagesDrawerCarousel
        images={piece.images.map((image) => image.url)}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        defaultActiveIndex={selectedIndex}
      />
    </main>
  );
}
