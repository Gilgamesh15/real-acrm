import * as schema from "db/schema";
import { returnService } from "db/services/return.service";
import { asc } from "drizzle-orm";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";

import { PersonalData } from "~/components/features/personal-data/personal-data";
import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardRoot,
} from "~/components/features/product-card/product-card-primitives";
import {
  cn,
  formatDate,
  groupOrderItems,
  priceDataToDisplayData,
  returnDetailsFromReturn,
} from "~/lib/utils";

import type { Route } from "./+types/return-success.page";

const PAGE_TITLE = "Zwrot zamówienia - sukces | ACRM";

export async function loader({ params }: Route.LoaderArgs) {
  const { returnReqNumber } = params;

  const returnRequest = await returnService.findByReturnNumber(
    returnReqNumber,
    {
      with: {
        items: {
          with: {
            orderItem: {
              with: {
                product: {
                  with: {
                    pieces: true,
                    images: {
                      limit: 1,
                      orderBy: asc(schema.images.displayOrder),
                    },
                  },
                },
                piece: {
                  with: {
                    images: {
                      limit: 1,
                      orderBy: asc(schema.images.displayOrder),
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  );

  if (!returnRequest) {
    throw new Response("Return request not found", { status: 404 });
  }

  return { returnRequest };
}

export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

export default function ReturnSuccessPage({
  loaderData,
}: Route.ComponentProps) {
  const { returnRequest } = loaderData;

  const { products, pieces } = groupOrderItems(
    returnRequest.items.map((item) => item.orderItem)
  );

  return (
    <main>
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-success text-success-foreground dark:bg-success dark:text-success-foreground rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-success-foreground dark:text-success-foreground" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Dziękujemy za zgłoszenie zwrotu!
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Twoja prośba o zwrot została pomyślnie przesłana
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Numer zwrotu</span>
          </p>
          <p className="text-lg font-semibold text-foreground">
            #{returnRequest.returnNumber}
          </p>
          <p className="text-sm text-muted-foreground">
            Zgłoszono dnia {formatDate(returnRequest.createdAt)}
          </p>
          <Badge
            variant="default"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          >
            Oczekuje na weryfikację
          </Badge>
        </div>
      </div>

      {/* Main Content Grid - Same layout as order success */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Sidebar - Contact Data and Summary */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalData
            personalData={
              returnDetailsFromReturn(returnRequest).personalDetails
            }
          />

          <Item variant="outline">
            <ItemHeader>
              <ItemTitle>Podsumowanie zwrotu</ItemTitle>
            </ItemHeader>
            <ItemContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Numer zwrotu
                  </span>
                  <span className="font-semibold">
                    #{returnRequest.returnNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Data zgłoszenia
                  </span>
                  <span className="font-medium">
                    {formatDate(returnRequest.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Przedmioty
                  </span>
                  <span className="font-medium">
                    {returnRequest.items.length} przedmiotów
                  </span>
                </div>
              </div>
            </ItemContent>
          </Item>

          {/* Return Actions */}
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle>Co dalej?</ItemTitle>
            </ItemHeader>
            <ItemContent>
              <p className="text-sm text-muted-foreground mb-4">
                Otrzymasz email z potwierdzeniem zgłoszenia zwrotu oraz
                informacjami o dalszych krokach.
              </p>
            </ItemContent>
            <ItemContent>
              <Link
                to="/kategorie"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "w-full"
                )}
              >
                Kontynuuj zakupy
              </Link>
            </ItemContent>
          </Item>
        </div>

        {/* Right Content - Return Items */}
        <div className="lg:col-span-3">
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle className="text-base">
                Zwracane przedmioty ({returnRequest.items.length})
              </ItemTitle>
            </ItemHeader>
            <ItemContent>
              <ItemGroup>
                {products.map((product) => (
                  <ProductCardRoot size="sm" key={product.id}>
                    <ProductCardMedia size="md">
                      <ProductCardImage
                        url={product.images[0]?.url || ""}
                        alt={product.images[0]?.alt || ""}
                      />
                    </ProductCardMedia>
                    <ProductCardContent>
                      <ProductCardInfo name={product.name} />
                      <ProductCardPrice
                        pricing={priceDataToDisplayData(product)}
                      />
                    </ProductCardContent>
                  </ProductCardRoot>
                ))}
                {pieces.map((piece) => (
                  <ProductCardRoot size="sm" key={piece.id}>
                    <ProductCardMedia size="md">
                      <ProductCardImage
                        url={piece.images[0]?.url || ""}
                        alt={piece.images[0]?.alt || ""}
                      />
                    </ProductCardMedia>
                    <ProductCardContent>
                      <ProductCardInfo name={piece.name} />
                      <ProductCardPrice
                        pricing={priceDataToDisplayData(piece)}
                      />
                    </ProductCardContent>
                  </ProductCardRoot>
                ))}
              </ItemGroup>
            </ItemContent>
          </Item>
        </div>
      </div>
    </main>
  );
}
