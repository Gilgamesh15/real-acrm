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
import { MainPieceCard } from "~/components/features/product-card/main-piece-card";
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

import type { Route } from "./+types/top-featured-pieces-edit.page";

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const pieces = await db.query.pieces.findMany({
    orderBy: asc(schema.pieces.homeFeaturedOrder),
    with: {
      images: {
        limit: 1,
        orderBy: asc(schema.images.displayOrder),
      },
      brand: true,
      size: true,
    },
  });

  return data({ pieces }, { status: 200 });
}

const UpdateFeaturedSchema = z.array(
  z.object({
    id: z
      .string({ message: "ID elementu musi być tekstem" })
      .min(1, "ID elementu jest wymagane"),
    homeFeaturedOrder: z
      .number({ message: "Kolejność wyróżnienia musi być liczbą" })
      .int("Kolejność wyróżnienia musi być liczbą całkowitą"),
  }),
  { message: "Wyróżnione elementy muszą być tablicą" }
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
      await tx.update(schema.pieces).set({ homeFeaturedOrder: -1 });

      // Update featured products
      if (args.length > 0) {
        await Promise.all(
          args.map(({ id, homeFeaturedOrder }) =>
            tx
              .update(schema.pieces)
              .set({ homeFeaturedOrder })
              .where(eq(schema.pieces.id, id))
          )
        );
      }
    });

    logger.info("Home featured pieces updated", {
      adminId,
      count: args.length,
    });

    return data(
      {
        success: true,
        error: null,
        message: "Elementy wyróżnione zostały zaktualizowane",
        pieces: [],
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to update home featured pieces", { error, adminId });
    throw data(
      {
        success: false,
        error: error,
        message: "Wystąpił nieoczekiwany błąd",
        pieces: null,
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

export default function TopFeaturedPiecesEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { pieces } = loaderData;
  const submit = useSubmit();
  const navigation = useNavigation();

  const [pieceIds, setPieceIds] = React.useState<string[]>(
    pieces
      .filter(
        (piece) =>
          piece.homeFeaturedOrder !== undefined && piece.homeFeaturedOrder >= 0
      )
      .map((piece) => piece.id)
  );

  const isUpdating = navigation.formAction === "/admin/wyr-ubrania";

  const onSave = (pieceIds: string[]) => {
    if (isUpdating) {
      return;
    }

    const data = pieceIds.map((id) => ({
      id,
      homeFeaturedOrder: pieceIds.indexOf(id),
    }));

    submit(convertObjectToFormDataUnsafe(UpdateFeaturedSchema, data), {
      method: "post",
    });
  };

  const onReset = () => {
    setPieceIds(pieces.map((piece) => piece.id));
  };

  const onRemove = (id: string) => {
    setPieceIds(pieceIds.filter((i) => i !== id));
  };

  const onAdd = (id: string) => {
    if (pieceIds.includes(id)) return;
    setPieceIds([...pieceIds, id]);
  };

  const onMoveLeft = (id: string) => {
    const index = pieceIds.indexOf(id);
    if (index === 0) return;
    const newPieceIds = [...pieceIds];
    newPieceIds[index] = newPieceIds[index - 1];
    newPieceIds[index - 1] = id;
    setPieceIds(newPieceIds);
  };

  const onMoveRight = (id: string) => {
    const index = pieceIds.indexOf(id);
    if (index === pieceIds.length - 1) return;
    const newPieceIds = [...pieceIds];
    newPieceIds[index] = newPieceIds[index + 1];
    newPieceIds[index + 1] = id;
    setPieceIds(newPieceIds);
  };

  const featuredPieces = React.useMemo(() => {
    return pieceIds.map((id) => pieces.find((piece) => piece.id === id)!);
  }, [pieceIds, pieces]);

  const nonFeaturedPieces = React.useMemo(() => {
    return pieces.filter((piece) => !pieceIds.includes(piece.id));
  }, [pieceIds, pieces]);

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
          <FieldLegend>Wyróżnione elementy</FieldLegend>
          <FieldDescription>
            Przeciągnij i upuść elementy, aby zmienić kolejność. Użyj przycisków
            strzałek lub przeciągania, aby uporządkować wyróżnione elementy.
          </FieldDescription>
          <Item variant="outline">
            <ItemActions>
              <DragSwapContainer
                values={pieceIds}
                onReorder={setPieceIds}
                className="flex flex-wrap gap-2 justify-center"
              >
                {featuredPieces.map((piece) => (
                  <DragSwapItem
                    key={piece.id}
                    id={piece.id}
                    className="relative"
                  >
                    <div className="absolute top-0 left-0 flex z-10 pt-0.25 pl-1.25">
                      <Button
                        variant="secondary"
                        onClick={() => onMoveLeft(piece.id)}
                        size="icon"
                        className="cursor-pointer"
                      >
                        <ChevronLeftIcon />
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => onMoveRight(piece.id)}
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
                        {pieceIds.indexOf(piece.id) + 1}
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 flex z-10 pt-0.25 pr-1.25">
                      <Button
                        variant="destructive"
                        onClick={() => onRemove(piece.id)}
                        size="icon"
                        className="cursor-pointer"
                      >
                        <XIcon />
                      </Button>
                      <DragSwapDragHandle />
                    </div>
                    <MainPieceCard
                      href="#"
                      piece={piece}
                      className="aspect-5/8 w-[280px] h-auto"
                    />
                  </DragSwapItem>
                ))}
              </DragSwapContainer>
            </ItemActions>
          </Item>
        </FieldSet>

        <Item variant="outline" className="w-full">
          <ItemContent className="flex flex-row flex-wrap gap-2 justify-center items-center w-full">
            {nonFeaturedPieces.map((piece) => (
              <div
                key={piece.id}
                className="relative w-[280px] h-auto"
                onClick={() => onAdd(piece.id)}
              >
                <div
                  className={cn(
                    "absolute top-0 right-0 mt-1 mr-1 z-10",
                    buttonVariants({ size: "icon" })
                  )}
                >
                  <PlusIcon />
                </div>
                <MainPieceCard href="#" key={piece.id} piece={piece} />
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
          onClick={() => onSave(pieceIds)}
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
