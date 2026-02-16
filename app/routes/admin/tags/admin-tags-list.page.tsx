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

import type { Route } from "./+types/admin-tags-list.page";
import { columns, columnsConfig } from "./admin-tags-list.columns";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  const tags = await db.query.tags.findMany({
    orderBy: asc(schema.tags.createdAt),
  });

  return data({ tags }, { status: 200 });
}

export const HydrateFallback = () => {
  // TODO: Add a loading skeleton
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
};

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

    const tagId = formData.get("tagId") as string | undefined;

    if (!tagId) {
      logger.warn("Tag delete failed - missing tagId", { adminId });
      throw data(
        {
          success: false,
          error: "ID tagu jest wymagane",
          tag: null,
          message: "ID tagu jest wymagane",
        },
        { status: 400 }
      );
    }

    const existingTag = await db.query.tags.findFirst({
      where: eq(schema.tags.id, tagId),
    });
    if (!existingTag) {
      logger.warn("Tag delete failed - not found", { adminId, tagId });
      throw data(
        {
          success: false,
          error: "Tag nie został znaleziony",
          tag: null,
          message: "Tag nie został znaleziony",
        },
        { status: 404 }
      );
    }

    const deletedTag = await db
      .delete(schema.tags)
      .where(eq(schema.tags.id, tagId))
      .returning()
      .then((result) => result[0]);

    logger.info("Tag deleted", {
      adminId,
      tagId,
      tagName: deletedTag?.name,
    });

    return data(
      {
        success: true,
        error: null,
        tag: deletedTag,
        message: "Tag został usunięty",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to delete tag", { error, adminId });
    throw data(
      {
        success: false,
        error,
        tag: null,
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
export type AdminTagsDataTableMeta = {
  deleteTag: (tagId: string) => void;
  isDeleting: boolean;
};

export default function AdminTagsListPage({
  loaderData,
}: Route.ComponentProps) {
  const { tags } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isDeleting = fetcher.state === "submitting";

  const handleDeleteTag = (tagId: string) => {
    if (isDeleting) return;

    fetcher.submit({
      intent: Intent.DELETE,
      tagId,
    });
  };

  return (
    <DataTableProvider
      columns={columns}
      columnsConfig={columnsConfig}
      data={tags}
      meta={{
        deleteTag: handleDeleteTag,
        isDeleting,
      }}
    >
      <AdminPageContainer>
        <AdminPageHeader>
          <AdminPageActions>
            <Link
              to="/admin/tags/create"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <PlusIcon />
              Dodaj nowy tag
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
            to="/admin/tags"
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
