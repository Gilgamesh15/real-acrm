import * as schema from "db/schema";
import { asc, eq } from "drizzle-orm";
import { ChevronLeftIcon, PlusIcon } from "lucide-react";
import { Link, data, redirect, useFetcher } from "react-router";
import { toast } from "sonner";

import { buttonVariants } from "~/components/ui/button";

import {
  AdminPageActions,
  AdminPageContainer,
  AdminPageContent,
  AdminPageFooter,
  AdminPageHeader,
} from "~/components/features/admin-page-layout/admin-page-layout";
import {
  DataTableColumnToggle,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableProvider,
  DataTableRoot,
} from "~/components/shared/data-table";
import { db } from "~/lib/db";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-pieces-list.page";
import { columns, columnsConfig } from "./admin-pieces.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const { session } = context;

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const pieces = await db.query.pieces.findMany({
    with: {
      images: {
        orderBy: asc(schema.images.displayOrder),
        limit: 1,
      },
      brand: true,
      size: true,
    },
    orderBy: asc(schema.pieces.createdAt),
  });

  return data({ pieces }, { status: 200 });
}

// ========================== ACTIONS ==========================

enum Intent {
  DELETE = "delete",
  PUBLISH = "publish",
  UNPUBLISH = "unpublish",
}

export async function action({ request, context }: Route.ActionArgs) {
  const { logger } = context;
  const { session } = context;
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();
    const intent = formData.get("intent") as Intent | undefined;
    const pieceId = formData.get("pieceId") as string | undefined;

    if (!intent) {
      logger.warn("Piece action failed - missing intent", { adminId });
      throw data(
        {
          success: false,
          error: "Intent jest wymagany",
          piece: null,
          message: "Intent jest wymagany",
        },
        { status: 400 }
      );
    }

    if (!pieceId) {
      logger.warn("Piece action failed - missing pieceId", { adminId, intent });
      throw data(
        {
          success: false,
          error: "ID ubrania jest wymagane",
          piece: null,
          message: "ID ubrania jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingPiece = await db.query.pieces.findFirst({
      where: eq(schema.pieces.id, pieceId),
    });

    if (!existingPiece) {
      logger.warn("Piece action failed - not found", {
        adminId,
        pieceId,
        intent,
      });
      throw data(
        {
          success: false,
          error: "Ubranie nie zostało znalezione",
          piece: null,
          message: "Ubranie nie zostało znalezione",
        },
        { status: 404 }
      );
    }

    switch (intent) {
      case Intent.DELETE: {
        const deletedPiece = await db
          .delete(schema.pieces)
          .where(eq(schema.pieces.id, pieceId))
          .returning()
          .then((result) => result[0]);

        logger.info("Piece deleted", {
          adminId,
          pieceId,
          pieceName: deletedPiece?.name,
        });

        return data(
          {
            success: true,
            error: null,
            piece: deletedPiece,
            message: "Ubranie zostało usunięte",
          },
          { status: 200 }
        );
      }
      case Intent.PUBLISH: {
        const publishedPiece = await db
          .update(schema.pieces)
          .set({ status: "published" })
          .where(eq(schema.pieces.id, pieceId))
          .returning()
          .then((result) => result[0]);

        logger.info("Piece published", {
          adminId,
          pieceId,
          pieceName: publishedPiece?.name,
        });

        return data(
          {
            success: true,
            error: null,
            piece: publishedPiece,
            message: "Ubranie zostało opublikowane",
          },
          { status: 200 }
        );
      }
      case Intent.UNPUBLISH: {
        const unpublishedPiece = await db
          .update(schema.pieces)
          .set({ status: "draft" })
          .where(eq(schema.pieces.id, pieceId))
          .returning()
          .then((result) => result[0]);

        logger.info("Piece unpublished", {
          adminId,
          pieceId,
          pieceName: unpublishedPiece?.name,
        });

        return data(
          {
            success: true,
            error: null,
            piece: unpublishedPiece,
            message: "Publikacja ubrania została cofnięta",
          },
          { status: 200 }
        );
      }
      default:
        logger.warn("Piece action failed - unknown intent", {
          adminId,
          pieceId,
          intent,
        });
        throw data(
          {
            success: false,
            error: "Nieznana akcja",
            piece: null,
            message: "Nieznana akcja",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Piece action failed", { error, adminId });
    throw data(
      {
        success: false,
        error: "Wystąpił nieoczekiwany błąd",
        piece: null,
        message: "Wystąpił nieoczekiwany błąd",
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
}

// ========================== PAGE ==========================

export type AdminPiecesDataTableMeta = {
  deletePiece: (pieceId: string) => void;
  publishPiece: (pieceId: string) => void;
  unpublishPiece: (pieceId: string) => void;
  isDeleting: boolean;
  isPublishing: boolean;
  isUnpublishing: boolean;
};

export default function AdminClothesListPage({
  loaderData,
}: Route.ComponentProps) {
  const { pieces } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isDeleting =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === Intent.DELETE;
  const isPublishing =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === Intent.PUBLISH;
  const isUnpublishing =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === Intent.UNPUBLISH;

  const handleDeletePiece = (pieceId: string) => {
    if (isDeleting) return;

    toast.promise(
      fetcher.submit(
        {
          intent: Intent.DELETE,
          pieceId,
        },
        { method: "post" }
      )
    );
  };

  const handlePublishPiece = (pieceId: string) => {
    if (isPublishing) return;

    toast.promise(
      fetcher.submit(
        {
          intent: Intent.PUBLISH,
          pieceId,
        },
        { method: "post" }
      )
    );
  };

  const handleUnpublishPiece = (pieceId: string) => {
    if (isUnpublishing) return;

    toast.promise(
      fetcher.submit(
        {
          intent: Intent.UNPUBLISH,
          pieceId,
        },
        { method: "post" }
      )
    );
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={pieces}
      meta={{
        deletePiece: handleDeletePiece,
        publishPiece: handlePublishPiece,
        unpublishPiece: handleUnpublishPiece,
        isDeleting,
        isPublishing,
        isUnpublishing,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/pieces/create"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Dodaj nowe ubranie
            </Link>
          </AdminPageActions>
        </AdminPageHeader>
        <AdminPageContent>
          <DataTableRoot>
            <div className="flex items-center justify-between gap-2">
              <DataTableFilter />
              <DataTableColumnToggle />
            </div>
            <DataTableContent className="min-w-full" />
            <div className="flex justify-end"></div>
          </DataTableRoot>
        </AdminPageContent>

        <AdminPageFooter>
          <Link
            to="/admin/pieces"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ChevronLeftIcon />
            Powrót
          </Link>
          <DataTablePagination />
        </AdminPageFooter>
      </AdminPageContainer>
    </DataTableProvider>
  );
}
