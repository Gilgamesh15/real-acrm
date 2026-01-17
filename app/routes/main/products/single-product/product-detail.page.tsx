import * as schema from "db/schema";
import { and, asc, eq, exists, inArray } from "drizzle-orm";
import { EyeIcon, ShoppingCartIcon, ZapIcon } from "lucide-react";
import React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Container, Section } from "~/components/ui/layout";
import { Separator } from "~/components/ui/separator";

import { ImagesDrawerCarousel } from "~/components/features/images-dialog-carousel/images-dialog-carousel";
import { useCart } from "~/components/features/providers/cart-provider";
import { useCheckoutDialog } from "~/components/features/providers/checkout-dialog-provider";
import { RichText } from "~/components/shared/rich-text/rich-text";
import { db } from "~/lib/db";
import { generateProductGroupStructuredData } from "~/lib/seo";
import type { DBQueryArgs, DBQueryResult } from "~/lib/types";
import {
  calculateProductPrice,
  formatCurrency,
  priceFromGrosz,
} from "~/lib/utils";

import type { Route } from "./+types/product-detail.page";
import ProductImagesCarouselSection from "./product-images-carousel";

const BASE_URL = import.meta.env.VITE_APP_URL || "https://acrm.pl";

const productSelect = {
  with: {
    images: true,
    pieces: {
      where: inArray(schema.pieces.status, ["published", "in_checkout"]),
      with: {
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

  const productPrice = calculateProductPrice(product).lineTotalInGrosz / 100;
  const pageTitle = `${product.name} | ACRM`;
  const pageDescription = `${product.name} - kompletny zestaw. ${product.pieces.length} dostępnych ubrań z projektu. Wysyłka w 24h.`;
  const pageUrl = `${BASE_URL}/projekty/${product.slug}`;
  const pageImage = product.images[0]?.url || `${BASE_URL}/logo-dark.png`;
  const availability = product.pieces.some((p) => p.status === "published")
    ? "in stock"
    : "out of stock";

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

      <meta property="product:price:amount" content={productPrice.toFixed(2)} />
      <meta property="product:price:currency" content="PLN" />
      <meta property="product:availability" content={availability} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      <link rel="canonical" href={pageUrl} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductGroupStructuredData(product)),
        }}
      />

      <main>
        <Container max="xs">
          <ProductImagesCarouselSection
            images={product.images.map((image) => image.url)}
          />
        </Container>

        <Container max="xs">
          <Section padding="xs" gap="xs" centered>
            <p className="text-3xl font-bold" aria-label="Cena produktu">
              {formatCurrency(
                priceFromGrosz(calculateProductPrice(product).lineTotalInGrosz)
              )}
            </p>

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
                    removeCartProduct(product.id);
                  } else {
                    addCartProduct(product);
                  }
                }}
              >
                <ShoppingCartIcon />
              </Button>
            </div>
          </Section>
        </Container>

        <Section padding="xs" gap="none">
          <Separator />
          <h1 className="w-full text-center h-9 sm:h-10 md:h-11 lg:h-12 xl:h-13 2xl:h-14 flex items-center justify-center transition-all hover:bg-primary/10 lg:text-xl xl:text-2xl">
            {product.name}
          </h1>
          <Separator />
        </Section>

        <section className="flex flex-wrap gap-4 w-full justify-center container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {product.pieces.map((piece) => {
            const [primaryImage] = piece.images;

            return (
              <Card
                className="py-2 gap-1.5 w-full lg:w-[calc(50%-8px)]"
                onClick={() => {
                  setSelectedPiece(piece);
                  setIsDialogOpen(true);
                }}
              >
                <CardHeader className="px-2 text-sm flex justify-between items-center">
                  <CardTitle>{piece.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Badge>{piece.size.name}</Badge>
                    <Badge>{piece.brand.name}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-2 flex flex-row gap-3">
                  <div className="size-20 relative">
                    <img
                      src={primaryImage?.url || ""}
                      alt={primaryImage?.alt || ""}
                      className="object-cover absolute h-full w-full"
                    />

                    <EyeIcon className="absolute top-0 right-0 text-muted-foreground rounded-full p-1 size-6 bg-muted/50" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 h-fit flex-1">
                    {piece.measurements.map((measurement) => (
                      <Badge
                        variant="secondary"
                        key={measurement.id}
                        className="w-full justify-between rounded-none"
                      >
                        <span className="font-bold">{measurement.name}</span>
                        <span>{measurement.value} mm</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <Container max="sm">
          <Section>
            <RichText content={product.description} />
          </Section>
        </Container>
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
