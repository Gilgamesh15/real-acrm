import * as schema from "db/schema";
import { and, asc, eq, exists, inArray } from "drizzle-orm";
import {
  CreditCard,
  Package,
  PackageIcon,
  RotateCcw,
  ShieldCheck,
  ShoppingCartIcon,
  Truck,
  ZapIcon,
} from "lucide-react";
import React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DirectionAwareTabs } from "~/components/ui/direction-aware-tabs";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { Container, Section } from "~/components/ui/layout";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";

import { ImagesDrawerCarousel } from "~/components/features/images-dialog-carousel/images-dialog-carousel";
import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMeasurements,
  ProductCardMedia,
  ProductCardRoot,
} from "~/components/features/product-card/product-card-primitives";
import { useCart } from "~/components/features/providers/cart-provider";
import { useCheckoutDialog } from "~/components/features/providers/checkout-dialog-provider";
import { db } from "~/lib/db";
import {
  extractTextFromRichText,
  generateProductStructuredData,
} from "~/lib/seo";
import type { DBQueryArgs, DBQueryResult } from "~/lib/types";
import {
  calculateProductPriceDisplayData,
  formatCurrency,
  formatDiscountLabel,
  pieceToGoogleAnalyticsItem,
} from "~/lib/utils";

import type { Route } from "./+types/product-detail.page";
import ProductImagesCarouselSection from "./product-images-carousel";

const productSelect = {
  with: {
    images: true,
    discount: true,
    pieces: {
      where: inArray(schema.pieces.status, ["published", "in_checkout"]),
      with: {
        discount: true,
        images: true,
        measurements: true,
        size: true,
        category: true,
        brand: true,
      },
      orderBy: asc(schema.pieces.productDisplayOrder),
    },
  },
} as const satisfies DBQueryArgs<"products", "one", true>;

export type SingleProductPageProduct = DBQueryResult<
  "products",
  typeof productSelect
>;

const RichText = React.lazy(() =>
  import("~/components/shared/rich-text/rich-text").then((mod) => ({
    default: mod.RichText,
  }))
);

function pluralizeElementy(count: number): string {
  if (count === 1) return "element";
  const lastTwo = count % 100;
  const lastOne = count % 10;
  if (lastTwo >= 12 && lastTwo <= 14) return "elementów";
  if (lastOne >= 2 && lastOne <= 4) return "elementy";
  return "elementów";
}

export async function loader({ params }: Route.LoaderArgs) {
  const { productSlug } = params;

  const product = await db.query.products.findFirst({
    where: and(
      eq(schema.products.slug, productSlug),
      inArray(schema.products.status, ["published", "in_checkout"]),
      exists(
        db
          .select({ id: schema.pieces.id })
          .from(schema.pieces)
          .where(
            and(
              eq(schema.pieces.productId, schema.products.id),
              inArray(schema.pieces.status, ["published", "in_checkout"])
            )
          )
      )
    ),
    ...productSelect,
  });

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return { product };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const { product } = loaderData;
  const productPrice = calculateProductPriceDisplayData(product).finalPrice;
  const pageTitle = `${product.name} – zestaw ubrań second-hand | ACRM`;
  const richTextDescription = extractTextFromRichText(product.description);
  const fallbackDescription = `Kompletny zestaw: ${product.pieces.map((p) => p.name).join(", ")}. Cena: ${formatCurrency(productPrice)}. Darmowa dostawa InPost.`;
  const pageDescription = richTextDescription
    ? richTextDescription.slice(0, 155)
    : fallbackDescription;
  const pageUrl = `https://www.acrm.pl/projekty/${product.slug}`;
  const pageImage =
    product.images[0]?.url || "https://www.acrm.pl/logo-dark.png";
  const availability = product.pieces.some((p) => p.status === "published")
    ? "in stock"
    : "out of stock";

  return [
    { title: pageTitle },
    { name: "description", content: pageDescription },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "product" },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: pageDescription },
    { property: "og:url", content: pageUrl },
    { property: "og:image", content: pageImage },
    { property: "og:site_name", content: "ACRM | Fashion Projects" },
    { property: "og:locale", content: "pl_PL" },
    { property: "product:price:amount", content: productPrice.toFixed(2) },
    { property: "product:price:currency", content: "PLN" },
    { property: "product:availability", content: availability },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: pageDescription },
    { name: "twitter:image", content: pageImage },
    { tagName: "link", rel: "canonical", href: pageUrl },
    { property: "product:condition", content: "used" },
    { "script:ld+json": generateProductStructuredData(product) },
  ];
};

export default function ProductDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { product } = loaderData;

  const {
    isInCart,
    addProduct: addCartProduct,
    removeProduct: removeCartProduct,
  } = useCart();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedPiece, setSelectedPiece] = React.useState<
    SingleProductPageProduct["pieces"][number] | null
  >(null);

  const { onProductBuyNow } = useCheckoutDialog();

  const pricingData = React.useMemo(() => {
    return calculateProductPriceDisplayData(product);
  }, [product]);

  React.useEffect(() => {
    window.gtag?.("event", "view_item", {
      currency: "PLN",
      value: pricingData.finalPrice,
      items: product.pieces.map((piece) => pieceToGoogleAnalyticsItem(piece)),
    });
  }, [pricingData.finalPrice, product]);

  return (
    <>
      <main>
        <Container max="xs">
          <ProductImagesCarouselSection
            images={product.images.map((image) => image.url)}
          />
        </Container>

        <Container max="xs">
          <Section padding="xs" gap="xs" centered>
            <div className="flex flex-col items-center gap-2">
              {pricingData.hasDiscount && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(pricingData.originalPrice)}
                  </span>
                  <Badge variant="success">
                    {formatDiscountLabel(pricingData.discount)}
                  </Badge>
                </div>
              )}
              <p className="text-3xl font-bold" aria-label="Cena produktu">
                {formatCurrency(pricingData.finalPrice)}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {"Cena zawiera VAT · Darmowa dostawa InPost"}
              </p>
            </div>

            <div className="flex gap-2 w-full">
              <Button
                onClick={() => onProductBuyNow(product)}
                className="flex-1"
              >
                <ZapIcon /> Kup teraz
              </Button>
              <Button
                variant={isInCart(product.id) ? "default" : "secondary"}
                onClick={() => {
                  if (isInCart(product.id)) {
                    removeCartProduct(product.id, true);
                  } else {
                    addCartProduct(product, true);
                  }
                }}
              >
                <ShoppingCartIcon />
              </Button>
            </div>
          </Section>
        </Container>

        <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground uppercase tracking-wider">
          <PackageIcon className="size-3.5" />
          <span>
            {"Zestaw — "}
            {product.pieces.length} {pluralizeElementy(product.pieces.length)}
          </span>
        </div>

        <Section padding="xs" className="pb-0" gap="none">
          <Separator />
          <h1 className="w-full text-center h-9 sm:h-10 md:h-11 lg:h-12 xl:h-13 2xl:h-14 flex items-center justify-center transition-all hover:bg-primary/10 lg:text-xl xl:text-2xl">
            {product.name}
          </h1>
          <Separator />
        </Section>

        <section className="">
          <DirectionAwareTabs
            tabs={[
              {
                id: 0,
                label: "Opis",
                content: product.description ? (
                  <React.Suspense fallback={<Spinner />}>
                    <RichText
                      className="px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-6 max-w-7xl mx-auto"
                      content={product.description}
                    />
                  </React.Suspense>
                ) : (
                  <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
                    <p className="text-muted-foreground">Brak opisu</p>
                  </div>
                ),
              },
              {
                id: 1,
                label: "Zawartość zestawu",
                content: (
                  <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 flex flex-col gap-2">
                    {product.pieces.map((piece) => {
                      const [primaryImage] = piece.images;
                      return (
                        <div
                          key={piece.id}
                          onClick={() => {
                            setSelectedPiece(piece);
                            setIsDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <ProductCardRoot size="sm">
                            <ProductCardMedia size="md">
                              <ProductCardImage
                                size="md"
                                url={primaryImage?.url || ""}
                                alt={primaryImage?.alt || ""}
                              />
                            </ProductCardMedia>
                            <ProductCardContent orientation="vertical">
                              <ProductCardInfo
                                name={piece.name}
                                brand={piece.brand?.name}
                                size={piece.size?.name}
                                orientation="horizontal"
                              />
                              <ProductCardMeasurements
                                measurements={piece.measurements}
                              />
                            </ProductCardContent>
                          </ProductCardRoot>
                        </div>
                      );
                    })}
                  </div>
                ),
              },
              {
                id: 2,
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
                          Darmowa dostawa kurierem InPost prosto pod Twoje
                          drzwi. Wysyłamy w ciągu 24h od zaksięgowania
                          płatności.
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
                id: 3,
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
                          acrm.pl/zwroty — odpowiemy w ciągu 14 dni. Dbamy o
                          to, żeby każdy zakup był zgodny z opisem.
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
            ]}
          />
        </section>
      </main>

      <ImagesDrawerCarousel
        images={selectedPiece?.images.map((image) => image.url) || []}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        defaultActiveIndex={0}
      />
    </>
  );
}
