import * as schema from "db/schema";
import { asc, eq } from "drizzle-orm";
import { CheckCircleIcon, RotateCcwIcon } from "lucide-react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import React from "react";
import { data, redirect, useNavigation, useSubmit } from "react-router";
import { Link } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { Button } from "~/components/ui/button";
import { buttonVariants } from "~/components/ui/button";
import { FieldDescription, FieldLegend, FieldSet } from "~/components/ui/field";
import { Item, ItemActions, ItemContent } from "~/components/ui/item";
import { Spinner } from "~/components/ui/spinner";

import {
  AdminPageActions,
  AdminPageContainer,
  AdminPageContent,
  AdminPageFooter,
  AdminPageHeader,
} from "~/components/features/admin-page-layout/admin-page-layout";
import { MainProductCard } from "~/components/features/product-card/main-product-card";
import {
  DragSwapContainer,
  DragSwapDragHandle,
  DragSwapItem,
} from "~/components/shared/drag-swap/drag-swap";
import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
import {
  convertFormDataToObjectUnsafe,
  convertObjectToFormDataUnsafe,
} from "~/lib/utils";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/featured-products-edit.page";

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const products = await db.query.products.findMany({
    orderBy: asc(schema.products.featuredOrder),
    with: {
      images: {
        limit: 1,
        orderBy: asc(schema.images.displayOrder),
      },
      pieces: {
        orderBy: asc(schema.pieces.productDisplayOrder),
        with: {
          images: {
            limit: 1,
            orderBy: asc(schema.images.displayOrder),
          },
          brand: true,
          size: true,
        },
      },
    },
  });

  return data({ products }, { status: 200 });
}

const UpdateFeaturedSchema = z.array(
  z.object({
    id: z
      .string({ message: "ID produktu musi być tekstem" })
      .min(1, "ID produktu jest wymagane"),
    featuredOrder: z
      .number({ message: "Kolejność wyróżnienia musi być liczbą" })
      .int("Kolejność wyróżnienia musi być liczbą całkowitą"),
  }),
  { message: "Wyróżnione produkty muszą być tablicą" }
);

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();
    const args = convertFormDataToObjectUnsafe(UpdateFeaturedSchema, formData);

    await db.transaction(async (tx) => {
      // Reset all products to unfeatured
      await tx.update(schema.products).set({ featuredOrder: -1 });

      // Update featured products
      if (args.length > 0) {
        await Promise.all(
          args.map(({ id, featuredOrder }) =>
            tx
              .update(schema.products)
              .set({ featuredOrder })
              .where(eq(schema.products.id, id))
          )
        );
      }
    });

    logger.info("Featured products updated", { adminId, count: args.length });

    return data(
      {
        success: true,
        error: null,
        message: "Produkty wyróżnione zostały zaktualizowane",
        products: [],
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to update featured products", { error, adminId });
    throw data(
      {
        success: false,
        error: error,
        message: "Wystąpił nieoczekiwany błąd",
        products: null,
      },
      { status: 500 }
    );
  }
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const result = await serverAction();
  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }
  return result;
}

export default function FeaturedProductsEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { products } = loaderData;
  const submit = useSubmit();
  const navigation = useNavigation();

  const [productIds, setProductIds] = React.useState<string[]>(
    products
      .filter((p) => p.featuredOrder !== undefined && p.featuredOrder >= 0)
      .map((p) => p.id)
  );

  const isUpdating = navigation.formAction === "/admin/polecane-produkty";

  const onSave = (productIds: string[]) => {
    if (isUpdating) {
      return;
    }

    const data = productIds.map((id) => ({
      id,
      featuredOrder: productIds.indexOf(id),
    }));

    submit(convertObjectToFormDataUnsafe(UpdateFeaturedSchema, data), {
      method: "post",
    });
  };

  const onReset = () => {
    setProductIds(products.map((p) => p.id));
  };

  const onRemove = (id: string) => {
    setProductIds(productIds.filter((i) => i !== id));
  };

  const onAdd = (id: string) => {
    if (productIds.includes(id)) return;
    setProductIds([...productIds, id]);
  };

  const onMoveLeft = (id: string) => {
    const index = productIds.indexOf(id);
    if (index === 0) return;
    const newProductIds = [...productIds];
    newProductIds[index] = newProductIds[index - 1];
    newProductIds[index - 1] = id;
    setProductIds(newProductIds);
  };

  const onMoveRight = (id: string) => {
    const index = productIds.indexOf(id);
    if (index === productIds.length - 1) return;
    const newProductIds = [...productIds];
    newProductIds[index] = newProductIds[index + 1];
    newProductIds[index + 1] = id;
    setProductIds(newProductIds);
  };

  const featuredProducts = React.useMemo(() => {
    return productIds.map((id) => products.find((p) => p.id === id)!);
  }, [productIds, products]);

  const nonFeaturedProducts = React.useMemo(() => {
    return products.filter((p) => !productIds.includes(p.id));
  }, [productIds, products]);

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" type="button" onClick={onReset}>
            <RotateCcwIcon />
          </Button>
        </AdminPageActions>
      </AdminPageHeader>
      <AdminPageContent>
        <FieldSet>
          <FieldLegend>Polecane produkty</FieldLegend>
          <FieldDescription>
            Przeciągnij i upuść produkty, aby zmienić kolejność. Użyj przycisków
            strzałek lub przeciągania, aby uporządkować polecane produkty.
          </FieldDescription>
          <Item variant="outline">
            <ItemActions>
              <DragSwapContainer
                values={productIds}
                onReorder={setProductIds}
                className="flex flex-wrap gap-2 justify-center"
              >
                {featuredProducts.map((product) => (
                  <DragSwapItem
                    key={product.id}
                    id={product.id}
                    className="relative"
                  >
                    <div className="absolute top-0 left-0 flex z-10 pt-0.25 pl-1.25">
                      <Button
                        variant="secondary"
                        onClick={() => onMoveLeft(product.id)}
                        size="icon"
                        className="cursor-pointer"
                      >
                        <ChevronLeftIcon />
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => onMoveRight(product.id)}
                        size="icon"
                        className="cursor-pointer"
                      >
                        <ChevronRightIcon />
                      </Button>
                      <div
                        className={buttonVariants({
                          size: "icon",
                          variant: "outline",
                        })}
                      >
                        {productIds.indexOf(product.id) + 1}
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 flex z-10 pt-0.25 pr-1.25">
                      <Button
                        variant="destructive"
                        onClick={() => onRemove(product.id)}
                        size="icon"
                        className="cursor-pointer"
                      >
                        <XIcon />
                      </Button>
                      <DragSwapDragHandle />
                    </div>
                    <MainProductCard href="#" product={product} />
                  </DragSwapItem>
                ))}
              </DragSwapContainer>
            </ItemActions>
          </Item>
        </FieldSet>

        <Item variant="outline" className="w-full">
          <ItemContent className="flex flex-row flex-wrap gap-2 justify-center items-center w-full">
            {nonFeaturedProducts.map((p) => (
              <div
                key={p.id}
                className="relative size-fit"
                onClick={() => onAdd(p.id)}
              >
                <div
                  className={cn(
                    "absolute top-0 right-0 mt-1 mr-1 z-10",
                    buttonVariants({ size: "icon" })
                  )}
                >
                  <PlusIcon />
                </div>
                <MainProductCard href="#" key={p.id} product={p} />
              </div>
            ))}
          </ItemContent>
        </Item>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          disabled={isUpdating}
          onClick={() => onSave(productIds)}
          type="button"
        >
          {isUpdating ? (
            <>
              <Spinner />
              <span>Zapisywanie...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon />
              <span>Zapisz zmiany</span>
            </>
          )}
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
