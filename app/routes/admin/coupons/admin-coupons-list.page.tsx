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

import type { Route } from "./+types/admin-coupons-list.page";
import { columns, columnsConfig } from "./admin-coupons.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin/kupony");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const coupons = await db.query.coupons.findMany({
    orderBy: desc(schema.coupons.createdAt),
  });

  return data({ coupons }, { status: 200 });
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
    const couponId = formData.get("couponId") as string | undefined;

    if (!intent) {
      logger.warn("Coupon action failed - missing intent", { adminId });
      throw data(
        {
          success: false,
          error: "Intent jest wymagany",
          coupon: null,
          message: "Intent jest wymagany",
        },
        { status: 400 }
      );
    }

    if (!couponId) {
      logger.warn("Coupon action failed - missing couponId", {
        adminId,
        intent,
      });
      throw data(
        {
          success: false,
          error: "ID kuponu jest wymagane",
          coupon: null,
          message: "ID kuponu jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(schema.coupons.id, couponId),
    });

    if (!existingCoupon) {
      logger.warn("Coupon action failed - not found", {
        adminId,
        couponId,
        intent,
      });
      throw data(
        {
          success: false,
          error: "Kupon nie została znaleziona",
          coupon: null,
          message: "Kupon nie została znaleziona",
        },
        { status: 404 }
      );
    }

    switch (intent) {
      case Intent.DELETE: {
        try {
          const deletedCoupon = await db
            .delete(schema.coupons)
            .where(eq(schema.coupons.id, couponId))
            .returning()
            .then((result) => result[0]);

          logger.info("Coupon deleted", {
            adminId,
            couponId,
            couponName: deletedCoupon?.name,
          });

          return data(
            {
              success: true,
              error: null,
              coupon: deletedCoupon,
              message: "Kupon został usunięty",
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
            logger.warn("Coupon deletion failed - foreign key constraint", {
              adminId,
              couponId,
            });
            return data(
              {
                success: false,
                error: "foreign_key_constraint",
                coupon: null,
                message:
                  "Nie można usunąć kuponu - jest używana przez produkty lub części",
              },
              { status: 400 }
            );
          }
          throw error;
        }
      }
      default: {
        logger.warn("Coupon action failed - unknown intent", {
          adminId,
          couponId,
          intent,
        });
        throw data(
          {
            success: false,
            error: "Nieznana akcja",
            coupon: null,
            message: "Nieznana akcja",
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    logger.error("Coupon action failed", { error, adminId });
    throw data(
      {
        success: false,
        error: "Wystąpił nieoczekiwany błąd",
        coupon: null,
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

export default function AdminCouponsListPage({
  loaderData,
}: Route.ComponentProps) {
  const { coupons } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isDeleting =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === Intent.DELETE;

  const handleDeleteCoupon = (couponId: string) => {
    if (isDeleting) return;

    toast.promise(
      fetcher.submit(
        {
          intent: Intent.DELETE,
          couponId,
        },
        { method: "post" }
      )
    );
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={coupons}
      meta={{
        deleteCoupon: handleDeleteCoupon,
        isDeleting,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/kupony/utworz"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Utwórz kupon
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
            to="/admin/kupony"
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
