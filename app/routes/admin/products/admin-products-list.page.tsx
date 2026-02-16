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
import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-products-list.page";
import { columns, columnsConfig } from "./admin-products.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const products = await db.query.products.findMany({
    with: {
      images: {
        orderBy: asc(schema.images.displayOrder),
      },
      discount: true,
      pieces: {
        orderBy: asc(schema.pieces.productDisplayOrder),
        with: {
          discount: true,
          images: {
            orderBy: asc(schema.images.displayOrder),
          },
        },
      },
    },
    orderBy: asc(schema.products.createdAt),
  });

  return data({ products }, { status: 200 });
}

// ========================== ACTIONS ==========================

enum Intent {
  DELETE = "delete",
  PUBLISH = "publish",
  UNPUBLISH = "unpublish",
}

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();
    const intent = formData.get("intent") as Intent | undefined;
    const productId = formData.get("productId") as string | undefined;

    if (!intent) {
      logger.warn("Product action failed - missing intent", { adminId });
      throw data(
        {
          success: false,
          error: "Intent jest wymagany",
          product: null,
          message: "Intent jest wymagany",
        },
        { status: 400 }
      );
    }

    if (!productId) {
      logger.warn("Product action failed - missing productId", {
        adminId,
        intent,
      });
      throw data(
        {
          success: false,
          error: "ID produktu jest wymagane",
          product: null,
          message: "ID produktu jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingProduct = await db.query.products.findFirst({
      where: eq(schema.products.id, productId),
    });

    if (!existingProduct) {
      logger.warn("Product action failed - not found", {
        adminId,
        productId,
        intent,
      });
      throw data(
        {
          success: false,
          error: "Produkt nie został znaleziony",
          product: null,
          message: "Produkt nie został znaleziony",
        },
        { status: 404 }
      );
    }

    switch (intent) {
      case Intent.DELETE: {
        const deletedProduct = await db
          .delete(schema.products)
          .where(eq(schema.products.id, productId))
          .returning()
          .then((result) => result[0]);

        logger.info("Product deleted", {
          adminId,
          productId,
          productName: deletedProduct?.name,
        });

        return data(
          {
            success: true,
            error: null,
            product: deletedProduct,
            message: "Produkt został usunięty",
          },
          { status: 200 }
        );
      }
      case Intent.PUBLISH: {
        const publishedProduct = await db
          .update(schema.products)
          .set({ status: "published" })
          .where(eq(schema.products.id, productId))
          .returning()
          .then((result) => result[0]);

        logger.info("Product published", {
          adminId,
          productId,
          productName: publishedProduct?.name,
        });

        return data(
          {
            success: true,
            error: null,
            product: publishedProduct,
            message: "Produkt został opublikowany",
          },
          { status: 200 }
        );
      }
      case Intent.UNPUBLISH: {
        const unpublishedProduct = await db
          .update(schema.products)
          .set({ status: "draft" })
          .where(eq(schema.products.id, productId))
          .returning()
          .then((result) => result[0]);

        logger.info("Product unpublished", {
          adminId,
          productId,
          productName: unpublishedProduct?.name,
        });

        return data(
          {
            success: true,
            error: null,
            product: unpublishedProduct,
            message: "Produkt został wycofany z publikacji",
          },
          { status: 200 }
        );
      }
      default: {
        logger.warn("Product action failed - unknown intent", {
          adminId,
          productId,
          intent,
        });
        throw data(
          {
            success: false,
            error: "Nieznana akcja",
            product: null,
            message: "Nieznana akcja",
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    logger.error("Product action failed", { error, adminId });
    throw data(
      {
        success: false,
        error: "Wystąpił nieoczekiwany błąd",
        product: null,
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

export type AdminProductsDataTableMeta = {
  deleteProduct: (productId: string) => void;
  publishProduct: (productId: string) => void;
  unpublishProduct: (productId: string) => void;
  isDeleting: boolean;
  isPublishing: boolean;
  isUnpublishing: boolean;
};

export default function AdminProductsListPage({
  loaderData,
}: Route.ComponentProps) {
  const { products } = loaderData;

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

  const handleDeleteProduct = (productId: string) => {
    if (isDeleting) return;

    toast.promise(
      fetcher.submit(
        {
          intent: Intent.DELETE,
          productId,
        },
        { method: "post" }
      )
    );
  };

  const handlePublishProduct = (productId: string) => {
    if (isPublishing) return;

    toast.promise(
      fetcher.submit(
        {
          intent: Intent.PUBLISH,
          productId,
        },
        { method: "post" }
      )
    );
  };

  const handleUnpublishProduct = (productId: string) => {
    if (isUnpublishing) return;

    toast.promise(
      fetcher.submit(
        {
          intent: Intent.UNPUBLISH,
          productId,
        },
        { method: "post" }
      )
    );
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={products}
      meta={{
        deleteProduct: handleDeleteProduct,
        publishProduct: handlePublishProduct,
        unpublishProduct: handleUnpublishProduct,
        isDeleting,
        isPublishing,
        isUnpublishing,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/products/create"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Dodaj nowy projekt
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
            to="/admin/products"
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
