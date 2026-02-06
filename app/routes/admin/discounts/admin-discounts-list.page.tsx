import * as schema from "db/schema";
import { desc, eq } from "drizzle-orm";
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

import type { Route } from "./+types/admin-discounts-list.page";
import { columns, columnsConfig } from "./admin-discounts.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin/rabaty");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const discounts = await db.query.discounts.findMany({
    orderBy: desc(schema.discounts.createdAt),
  });

  return data({ discounts }, { status: 200 });
}

// ========================== ACTIONS ==========================

enum Intent {
  DELETE = "delete",
}

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();
    const intent = formData.get("intent") as Intent | undefined;
    const discountId = formData.get("discountId") as string | undefined;

    if (!intent) {
      logger.warn("Discount action failed - missing intent", { adminId });
      throw data(
        {
          success: false,
          error: "Intent jest wymagany",
          discount: null,
          message: "Intent jest wymagany",
        },
        { status: 400 }
      );
    }

    if (!discountId) {
      logger.warn("Discount action failed - missing discountId", {
        adminId,
        intent,
      });
      throw data(
        {
          success: false,
          error: "ID zniżki jest wymagane",
          discount: null,
          message: "ID zniżki jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingDiscount = await db.query.discounts.findFirst({
      where: eq(schema.discounts.id, discountId),
    });

    if (!existingDiscount) {
      logger.warn("Discount action failed - not found", {
        adminId,
        discountId,
        intent,
      });
      throw data(
        {
          success: false,
          error: "Zniżka nie została znaleziona",
          discount: null,
          message: "Zniżka nie została znaleziona",
        },
        { status: 404 }
      );
    }

    switch (intent) {
      case Intent.DELETE: {
        try {
          const deletedDiscount = await db
            .delete(schema.discounts)
            .where(eq(schema.discounts.id, discountId))
            .returning()
            .then((result) => result[0]);

          logger.info("Discount deleted", {
            adminId,
            discountId,
            discountName: deletedDiscount?.name,
          });

          return data(
            {
              success: true,
              error: null,
              discount: deletedDiscount,
              message: "Zniżka została usunięta",
            },
            { status: 200 }
          );
        } catch (error) {
          // Check for foreign key constraint violation
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "23503"
          ) {
            logger.warn("Discount deletion failed - foreign key constraint", {
              adminId,
              discountId,
            });
            return data(
              {
                success: false,
                error: "foreign_key_constraint",
                discount: null,
                message:
                  "Nie można usunąć zniżki - jest używana przez produkty lub części",
              },
              { status: 400 }
            );
          }
          throw error;
        }
      }
      default: {
        logger.warn("Discount action failed - unknown intent", {
          adminId,
          discountId,
          intent,
        });
        throw data(
          {
            success: false,
            error: "Nieznana akcja",
            discount: null,
            message: "Nieznana akcja",
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    logger.error("Discount action failed", { error, adminId });
    throw data(
      {
        success: false,
        error: "Wystąpił nieoczekiwany błąd",
        discount: null,
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

  return result;
}

// ========================== PAGE ==========================

export default function AdminDiscountsListPage({
  loaderData,
}: Route.ComponentProps) {
  const { discounts } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isDeleting =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === Intent.DELETE;

  const handleDeleteDiscount = (discountId: string) => {
    if (isDeleting) return;

    toast.promise(
      fetcher.submit(
        {
          intent: Intent.DELETE,
          discountId,
        },
        { method: "post" }
      )
    );
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={discounts}
      meta={{
        deleteDiscount: handleDeleteDiscount,
        isDeleting,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/rabaty/utworz"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Utwórz zniżkę
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
          </DataTableRoot>
        </AdminPageContent>

        <AdminPageFooter>
          <Link
            to="/admin/rabaty"
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
