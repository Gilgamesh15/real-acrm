import { AdvancedVideo } from "@cloudinary/react";
import { videoCodec } from "@cloudinary/url-gen/actions/transcode";
import { auto } from "@cloudinary/url-gen/qualifiers/videoCodec";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import {
  AlertCircleIcon,
  ArrowRight,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  EyeIcon,
  MailIcon,
  PackageCheck,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import React from "react";
import { Await, Link, useAsyncError } from "react-router";
import type { AwaitProps } from "react-router";

import { Button, buttonVariants } from "~/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "~/components/ui/button-group";
import {
  Error,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";
import Image from "~/components/ui/image";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { Skeleton } from "~/components/ui/skeleton";

import { api } from "~/api/api.server";
import { MainPieceCard } from "~/components/features/product-card/main-piece-card";
import { useCart } from "~/components/features/providers/cart-provider";
import { useCheckoutDialog } from "~/components/features/providers/checkout-dialog-provider";
import { useWelcomePopup } from "~/components/features/welcome-popup/welcome-popup-provider";
import { useViewerCounts } from "~/hooks/use-viewer-counts";
import { cld } from "~/lib/claudinary";
import type { DBQueryResult } from "~/lib/types";
import {
  calculatePiecePriceDisplayData,
  calculateProductPriceDisplayData,
  cn,
  formatCurrency,
  getSlugPath,
} from "~/lib/utils";

import type { Route } from "./+types/home.page";

const PAGE_TITLE = "ACRM | Markowe ubrania z second-handu w dobrych cenach";

//const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL!;
//const TIKTOK_URL = import.meta.env.VITE_TIKTOK_URL!;
//const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL!;

export async function loader() {
  const categoriesPromise = api.categories.get
    .all({ query: {} })
    .then((res) => res.body.categories);

  const newPiecesPromise = api.pieces.get
    .all({ query: { limit: 6 } })
    .then((res) => res.body.pieces);

  const featuredPiecesPromise = api.pieces.get
    .all({ query: { limit: 6, offset: 6 } })
    .then((res) => res.body.pieces);

  const bundle1Promise = api.featuredProducts.get
    .all({ query: { limit: 1, offset: 0 } })
    .then((res) => res.body.products?.[0]);

  const bundle2Promise = api.featuredProducts.get
    .all({ query: { limit: 1, offset: 1 } })
    .then((res) => res.body.products?.[0]);

  return {
    categoriesPromise,
    newPiecesPromise,
    featuredPiecesPromise,
    bundle1Promise,
    bundle2Promise,
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
  const {
    categoriesPromise,
    newPiecesPromise,
    featuredPiecesPromise,
    bundle1Promise,
    bundle2Promise,
  } = loaderData;

  return (
    <main>
      <HeroSection />

      <TrustStrip />

      <PieceGridSection
        title="Nowości"
        subtitle="Właśnie dodane"
        href="/kategorie?sort=newest"
        promise={newPiecesPromise}
      />

      <CategoriesSection categoriesPromise={categoriesPromise} />

      <BundleSection index={0} promise={bundle1Promise} />

      <PieceGridSection
        title="Polecane"
        subtitle="Nasze typy"
        href="/kategorie"
        promise={featuredPiecesPromise}
      />

      <BundleSection index={1} promise={bundle2Promise} />

      <NewsletterSection />

      {/*
      <SocialMediaSection />
      */}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Hero Section
// ---------------------------------------------------------------------------
function HeroSection() {
  const vid = cld.video("v1776013261/Trim_video_project_ojngrn_fm0afk");
  vid.transcode(videoCodec(auto()));

  return (
    <section className="relative w-full h-[85svh] min-h-[520px] overflow-hidden">
      {/**GIF */}

      <AdvancedVideo
        cldVid={vid}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="object-cover size-full z-0 absolute inset-0"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col justify-end h-full max-w-7xl mx-auto px-6 lg:px-8 pb-16 md:pb-24">
        <div className="flex flex-col gap-6 max-w-xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-foreground tracking-wide leading-[1.1] text-balance">
            Markowy second-hand, ręcznie wybrany.
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
            Nike, Carhartt, Dickies i inne — każda sztuka sprawdzona i dobrana z
            głową.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/projekty"
              className={cn(
                buttonVariants({
                  variant: "secondary",
                  size: "lg",
                })
              )}
            >
              Odkryj zestawy
              <ArrowRight />
            </Link>

            <Link
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                })
              )}
              to="/kategorie"
            >
              Wszystkie ubrania
              <ArrowRight />
            </Link>
          </div>
        </div>
      </div>

      <p className="sr-only">
        ACRM - Sklep z odzieżą second-hand - Markowe ubrania w dobrych cenach
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Trust Strip
// ---------------------------------------------------------------------------
const TRUST_ITEMS = [
  { icon: RotateCcw, label: "Zwroty bez podania przyczyny do 14 dni" },
  { icon: PackageCheck, label: "Każda sztuka sprawdzona ręcznie" },
  { icon: Clock, label: "Wysyłka w 24h" },
  { icon: CheckCircle2, label: "Tylko oryginały" },
];

function TrustStrip() {
  return (
    <section
      aria-label="Gwarancje zakupowe"
      className="border-y border-border/50 bg-secondary/30"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <item.icon className="size-4 text-accent shrink-0" />
              <span className="text-xs font-sans tracking-wider">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Piece Grid Section (reusable for "Nowości" and "Polecane")
// ---------------------------------------------------------------------------
type PieceGridPiece = DBQueryResult<
  "pieces",
  {
    columns: { description: false };
    with: {
      images: true;
      brand: true;
      size: true;
      discount: true;
      category: true;
    };
  }
>;

function PieceGridSection({
  title,
  subtitle,
  href,
  promise,
}: {
  title: string;
  subtitle: string;
  href: string;
  promise: Promise<PieceGridPiece[]>;
}) {
  const headingId = `piece-grid-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section
      className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24"
      aria-labelledby={headingId}
    >
      <div className="flex flex-col gap-3 mb-12">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground font-secondary tracking-[0.2em] uppercase">
              {subtitle}
            </span>
            <h2
              id={headingId}
              className="text-3xl md:text-4xl lg:text-5xl font-secondary text-foreground tracking-wide"
            >
              {title}
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground font-sans text-xs tracking-wider uppercase gap-2"
            asChild
          >
            <Link to={href}>
              Zobacz wszystko
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        <div className="h-px bg-linear-to-r from-accent/50 via-border to-transparent" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <React.Suspense
          fallback={Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/5 w-full" />
          ))}
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
            {(pieces) => <PieceGridWithViewers pieces={pieces} />}
          </AsyncError>
        </React.Suspense>
      </div>

      <div className="flex justify-center mt-12">
        <Button
          variant="outline"
          size="lg"
          className="border-border/50 text-foreground hover:bg-foreground/10 font-sans text-xs tracking-[0.15em] uppercase px-10 rounded-sm"
          asChild
        >
          <Link to="/kategorie">
            Wszystkie ubrania
            <ArrowRight className="size-4 ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function PieceGridWithViewers({ pieces }: { pieces: PieceGridPiece[] }) {
  const viewerCounts = useViewerCounts(pieces.map((p) => p.id));
  const { addPiece, removePiece, isInCart } = useCart();

  return (
    <>
      {pieces.map((piece) => (
        <MainPieceCard
          key={piece.id}
          piece={piece}
          href={`/ubrania/${piece.slug}`}
          viewerCount={viewerCounts?.[piece.id]}
          onToggleCart={() => {
            if (isInCart(piece.id)) {
              removePiece(piece.id, true);
            } else {
              addPiece(piece, true);
            }
          }}
          isInCart={isInCart(piece.id)}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Categories Section
// ---------------------------------------------------------------------------
function CategoriesSection({
  categoriesPromise,
}: {
  categoriesPromise: Promise<
    DBQueryResult<"categories", { with: { image: true } }>[]
  >;
}) {
  return (
    <section
      className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24 flex flex-col"
      aria-labelledby="categories-heading"
    >
      <h2
        id="categories-heading"
        className="text-3xl uppercase tracking-[0.2em] font-light text-center font-secondary"
      >
        Czego szukasz?
      </h2>

      <div className="h-px bg-linear-to-r from-transparent via-border to-transparent w-full mt-3" />

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
            <nav className="w-full mt-8">
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

                      <h3 className="text-primary font-light leading-tight tracking-tight shrink-0 overflow-hidden absolute bottom-0 left-0 right-0 p-4 text-xl md:text-2xl lg:text-3xl">
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

      <div className="h-px bg-linear-to-r from-transparent via-border to-transparent w-full mt-8" />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Bundle Section (reusable, alternating layout)
// ---------------------------------------------------------------------------
function BundleSection({
  index: bundleIndex,
  promise,
}: {
  index: number;
  promise: Promise<
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
            columns: {
              description: false;
            };
            with: {
              images: true;
              brand: true;
              size: true;
              discount: true;
              category: true;
            };
          };
        };
      }
    >
  >;
}) {
  const { onProductBuyNow } = useCheckoutDialog();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const isReversed = bundleIndex % 2 === 1;

  return (
    <React.Suspense fallback={<Skeleton className="aspect-square w-full" />}>
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
        {(bundle) => {
          const pricing = calculateProductPriceDisplayData(bundle);
          const piecesSum = bundle.pieces.reduce((sum, piece) => {
            const p = calculatePiecePriceDisplayData(piece);
            return sum + p.finalPrice;
          }, 0);

          return (
            <section
              className="bg-secondary/10 py-16 md:py-24"
              aria-label={bundle.name}
            >
              {/* Header */}
              <div className="flex flex-col">
                <div className="font-secondary flex items-end justify-between">
                  <div className="flex flex-col px-6 py-3 border-r border-t">
                    <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
                      Gotowy zestaw
                    </span>
                    <h3 className="text-2xl font-light tracking-tight">
                      {bundle.name}
                    </h3>
                  </div>
                  <ButtonGroup className="border-l border-t">
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      onClick={() => emblaApi?.scrollPrev()}
                    >
                      <ChevronsLeft />
                    </Button>
                    <ButtonGroupSeparator />
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      onClick={() => emblaApi?.scrollNext()}
                    >
                      <ChevronsRight />
                    </Button>
                  </ButtonGroup>
                </div>
                <div className="w-full flex items-center h-1.75 gap-0.5 border-y">
                  {Array.from({ length: bundle.images.length }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex-1 h-full transition-colors duration-300",
                          index <= selectedIndex ? "bg-primary" : "bg-border"
                        )}
                      />
                    )
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 md:divide-x 2xl:grid-cols-5",
                  isReversed && "md:[direction:rtl] md:*:[direction:ltr]"
                )}
              >
                {/* Image carousel */}
                <div className="embla-wrapper aspect-square overflow-hidden col-span-1 2xl:col-span-2">
                  <div className="embla" ref={emblaRef}>
                    <div className="embla__container flex">
                      {bundle.images.map((image, i) => (
                        <div
                          className="embla__slide flex-[0_0_100%] min-w-0"
                          key={i}
                        >
                          <Image
                            src={image.url}
                            alt={bundle.name}
                            aspectRatio={1}
                            responsive
                            resize="fill"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info panel */}
                <div className="flex flex-col gap-6 md:flex-col-reverse md:justify-end col-span-1 md:col-span-1 2xl:col-span-3">
                  {/* Price & CTA */}
                  <div className="p-6 md:p-8">
                    <Item variant="outline" className="gap-0">
                      <ItemContent className="gap-1">
                        <ItemTitle className="text-2xl font-medium">
                          {formatCurrency(pricing.finalPrice)}
                        </ItemTitle>
                        {piecesSum > pricing.finalPrice && (
                          <ItemDescription className="text-sm text-muted-foreground">
                            <span className="line-through">
                              {formatCurrency(piecesSum)}
                            </span>
                            <span className="ml-2 text-success-foreground text-xs">
                              Oszczędzasz{" "}
                              {formatCurrency(piecesSum - pricing.finalPrice)}
                            </span>
                          </ItemDescription>
                        )}
                      </ItemContent>
                      <ItemActions className="flex-col sm:flex-row mt-3">
                        <Button
                          onClick={() =>
                            onProductBuyNow(bundle as any, {
                              item_list_id: "home-bundle",
                              item_list_name: bundle.name,
                              index: bundleIndex,
                            })
                          }
                        >
                          Kup cały zestaw
                          <ShoppingCart className="size-4" />
                        </Button>
                        <Button variant="outline" asChild>
                          <Link to={`/projekty/${bundle.slug}`}>
                            Zobacz szczegóły
                            <EyeIcon className="size-4" />
                          </Link>
                        </Button>
                      </ItemActions>
                    </Item>
                  </div>

                  {/* Piece list */}
                  <div className="grid grid-cols-2 md:grid-cols-1 md:divide-y md:border-b 2xl:col-span-2">
                    {bundle.pieces.map((piece) => {
                      const piecePricing =
                        calculatePiecePriceDisplayData(piece);
                      return (
                        <Link
                          to={`/ubrania/${piece.slug}`}
                          key={piece.id}
                          className="flex items-center gap-4 p-4 md:px-6 group hover:bg-secondary/30 transition-colors"
                        >
                          <div className="w-16 h-20 md:w-20 md:h-24 shrink-0 overflow-hidden rounded-sm border border-border/30">
                            <img
                              src={piece.images[0]?.url || "/placeholder.svg"}
                              alt={piece.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                              {piece.brand?.name}
                            </p>
                            <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                              {piece.name}
                            </p>
                            {piece.size && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                                Rozmiar: {piece.size.name}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">
                              {formatCurrency(piecePricing.finalPrice)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        }}
      </AsyncError>
    </React.Suspense>
  );
}

// ---------------------------------------------------------------------------
// Newsletter Section
// ---------------------------------------------------------------------------
function NewsletterSection() {
  const { handleForceOpen, isSubscribed } = useWelcomePopup();

  return (
    <section className="bg-secondary/20 border-y" aria-label="Newsletter">
      <div className="max-w-xl mx-auto px-6 py-16 md:py-24 text-center">
        <MailIcon className="size-8 mx-auto mb-6 text-muted-foreground" />
        <h2 className="text-2xl md:text-3xl font-secondary tracking-wide text-foreground">
          Bądź na bieżąco
        </h2>
        <p className="text-sm text-muted-foreground mt-3 mb-10">
          Zapisz się do newslettera i odbierz kod rabatowy na pierwsze
          zamówienie
        </p>

        {isSubscribed ? (
          <div className="flex items-center justify-center gap-2 text-success-foreground">
            <CheckCircle2 className="size-5" />
            <span className="text-sm font-medium">Jesteś już zapisany!</span>
          </div>
        ) : (
          <>
            <Button onClick={handleForceOpen} className="h-10 px-6">
              Zapisz się i odbierz -10%
            </Button>
            <p className="text-[11px] text-muted-foreground mt-2">
              Oferta jednorazowa – tylko dla nowych subskrybentów.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Social Media Section
// ---------------------------------------------------------------------------
//const SOCIAL_PLATFORMS = [
//  {
//    name: "Instagram",
//    href: INSTAGRAM_URL,
//    icon: "https://res.cloudinary.com/dqz9vgiko/image/upload/v1772914298/Instagram_Glyph_Gradient_jis95v_hsrejt.png",
//    gradient: "from-purple-500 via-pink-500 to-orange-400",
//  },
//  {
//    name: "TikTok",
//    href: TIKTOK_URL,
//    icon: "https://res.cloudinary.com/dqz9vgiko/image/upload/v1772914295/TikTok_Icon_Black_Circle_zs74uw_kyehcr.png",
//    gradient: "from-cyan-400 via-black to-pink-500",
//  },
//  {
//    name: "YouTube",
//    href: YOUTUBE_URL,
//    icon: "https://res.cloudinary.com/dqz9vgiko/image/upload/v1772914295/yt_icon_red_digital_jnen7h_uzgxlb.png",
//    gradient: "from-red-600 via-red-500 to-red-400",
//  },
//];
//
//function SocialMediaSection() {
//  return (
//    <section
//      className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24"
//      aria-label="Social media"
//    >
//      <div className="text-center mb-12">
//        <h2 className="text-2xl md:text-3xl font-secondary tracking-wide text-foreground">
//          Obserwuj nas
//        </h2>
//        <p className="text-sm text-muted-foreground mt-3">Jesteśmy też tutaj</p>
//        <div className="h-px bg-linear-to-r from-transparent via-border to-transparent mt-6 max-w-xs mx-auto" />
//      </div>
//
//      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
//        {SOCIAL_PLATFORMS.map((platform) => (
//          <a
//            key={platform.name}
//            href={platform.href}
//            target="_blank"
//            rel="noopener noreferrer"
//            className="group flex flex-col items-center rounded-sm border border-border/50 overflow-hidden hover:border-border transition-colors"
//          >
//            {/* Gradient placeholder for video */}
//            <div
//              className={cn(
//                "w-full aspect-9/16 max-h-[320px] bg-linear-to-br flex items-center justify-center",
//                platform.gradient
//              )}
//            >
//              <Image
//                src={platform.icon}
//                alt={platform.name}
//                width={64}
//                height={64}
//                aspectRatio={1}
//                resize="fill"
//                className="size-16 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-lg invert dark:invert-0"
//              />
//            </div>
//            <div className="w-full px-4 py-5 text-center bg-background">
//              <p className="text-sm font-medium text-foreground">
//                {platform.name}
//              </p>
//              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
//                Zobacz więcej
//                <ArrowRight className="size-3" />
//              </span>
//            </div>
//          </a>
//        ))}
//      </div>
//    </section>
//  );
//}

// ---------------------------------------------------------------------------
// Async Error Boundary
// ---------------------------------------------------------------------------
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
