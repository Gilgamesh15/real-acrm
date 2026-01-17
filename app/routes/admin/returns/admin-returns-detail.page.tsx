import * as schema from "db/schema";
import { returnService } from "db/services/return.service";
import { asc, desc } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { Link, data, redirect, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";

import {
  AdminPageContainer,
  AdminPageContent,
  AdminPageFooter,
  AdminPageHeader,
} from "~/components/features/admin-page-layout/admin-page-layout";
import { PersonalData } from "~/components/features/personal-data/personal-data";
import {
  ActionDialog,
  ConfirmActionDialogContent,
} from "~/components/shared/action-dialog/action-dialog";
import { useDialogState } from "~/hooks/use-dialog-state";
import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { auth } from "~/lib/auth";
import { formatDate, returnDetailsFromReturn } from "~/lib/utils";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/admin-returns-detail.page";

// ========================== LOADING ==========================

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    return redirect("/");
  }

  const returnReq = await returnService.findById(params.returnId, {
    with: {
      items: {
        with: {
          events: {
            orderBy: desc(schema.returnTimelineEvents.timestamp),
          },
          orderItem: {
            with: {
              piece: {
                with: {
                  images: {
                    limit: 1,
                    orderBy: asc(schema.images.displayOrder),
                  },
                  brand: true,
                  size: true,
                  measurements: true,
                },
              },
              product: {
                with: {
                  images: {
                    limit: 1,
                    orderBy: asc(schema.images.displayOrder),
                  },
                  pieces: {
                    with: {
                      images: {
                        limit: 1,
                        orderBy: asc(schema.images.displayOrder),
                      },
                      brand: true,
                      size: true,
                      measurements: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!returnReq) {
    throw new Response("Return ticket not found", { status: 404 });
  }

  return { returnReq };
}

export const HydrateFallback = () => {
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
};

// ========================== ACTIONS ==========================

enum Intent {
  INITIAL_ACCEPT = "initialAccept",
  INITIAL_REJECT = "initialReject",
  AFTER_INSPECTION_ACCEPT = "afterInspectionAccept",
  AFTER_INSPECTION_REJECT = "afterInspectionReject",
}

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const returnId = formData.get("returnId") as string;

    // For now, using available service methods - these would need item IDs in full implementation
    const itemId = (formData.get("itemId") as string) || "placeholder";

    switch (intent) {
      case Intent.INITIAL_ACCEPT:
      case Intent.AFTER_INSPECTION_ACCEPT:
        const acceptResult = await returnService.markItemAsAccepted({
          returnId,
          itemId,
        });

        if (acceptResult.success) {
          logger.info("Return item accepted", { adminId, returnId, itemId });
          return data(
            {
              success: true,
              error: null,
              return: acceptResult.data,
            },
            { status: 200 }
          );
        } else {
          logger.warn("Return item accept failed", {
            adminId,
            returnId,
            itemId,
            error: acceptResult.message,
          });
          return data(
            {
              success: false,
              error:
                acceptResult.message ||
                "Wystąpił błąd podczas akceptowania zwrotu",
              return: null,
            },
            { status: acceptResult.status || 400 }
          );
        }
      case Intent.INITIAL_REJECT:
      case Intent.AFTER_INSPECTION_REJECT:
        const rejectResult = await returnService.markItemAsRejected({
          returnId,
          itemId,
        });

        if (rejectResult.success) {
          logger.info("Return item rejected", { adminId, returnId, itemId });
          return data(
            {
              success: true,
              error: null,
              return: rejectResult.data,
            },
            { status: 200 }
          );
        } else {
          logger.warn("Return item reject failed", {
            adminId,
            returnId,
            itemId,
            error: rejectResult.message,
          });
          return data(
            {
              success: false,
              error:
                rejectResult.message ||
                "Wystąpił błąd podczas odrzucania zwrotu",
              return: null,
            },
            { status: rejectResult.status || 400 }
          );
        }
      default:
        logger.warn("Return action failed - unknown intent", { adminId, returnId, intent });
        return data(
          {
            success: false,
            error: "Nieznana akcja",
            return: null,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Return action failed", { error, adminId });
    return data(
      {
        success: false,
        error: "Wystąpił nieoczekiwany błąd",
        return: null,
      },
      { status: 500 }
    );
  }
}

// ========================== PAGE ==========================

type ActionType = "accept" | "reject";

export default function ReturnDetailPage({ loaderData }: Route.ComponentProps) {
  const { returnReq } = loaderData;
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [open, setOpen] = useDialogState<ActionType>(null);

  const fetcher = useFetcher<typeof action>();
  const isLoading = fetcher.state === "submitting";
  const navigate = useNavigate();

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate("/admin/zwroty");
    }
  }, [fetcher.data?.success, navigate]);

  const handleAccept = (itemId: string | null) => {
    if (isLoading || !itemId) return;

    const formData = new FormData();
    formData.append("returnId", returnReq.id);
    formData.append("intent", "accept");
    formData.append("itemId", itemId);

    fetcher.submit(formData, { method: "post" });
    setOpen(null);
  };

  const handleReject = (itemId: string | null) => {
    if (isLoading || !itemId) return;

    const formData = new FormData();
    formData.append("returnId", returnReq.id);
    formData.append("intent", "reject");
    formData.append("itemId", itemId);

    fetcher.submit(formData, { method: "post" });
    setOpen(null);
  };

  const products = returnReq.items
    .map((item) => item.orderItem.product)
    .filter((product) => product !== null);
  const pieces = returnReq.items
    .map((item) => item.orderItem.piece)
    .filter((piece) => piece !== null);

  return (
    <ActionDialog
      open={open}
      setOpen={setOpen}
      loading={isLoading ? open : null}
    >
      <AdminPageContainer>
        <AdminPageHeader></AdminPageHeader>
        <AdminPageContent>
          <main className={cn("space-y-6")}>
            {/* Header Section with Status Badge */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    Zwrot
                    <br />#{returnReq.returnNumber}
                  </h1>
                  <p className="text-muted-foreground">
                    Złożone dnia {formatDate(returnReq.createdAt)}
                  </p>
                </div>
                <Badge variant="default">Aktywny</Badge>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Timeline and Summary Section */}
              <div className="lg:col-span-2 space-y-6">
                <Item variant="outline">
                  <ItemHeader>
                    <ItemTitle className="text-base">Status zwrotu</ItemTitle>
                  </ItemHeader>
                  <ItemContent>
                    <div className="text-sm text-muted-foreground">
                      Status: Aktywny
                    </div>
                  </ItemContent>
                </Item>

                <PersonalData
                  personalData={
                    returnDetailsFromReturn(returnReq).personalDetails
                  }
                />
              </div>

              <div className="lg:col-span-3">
                <Item variant="outline">
                  <ItemHeader>
                    <ItemTitle className="text-base">
                      Zwracane przedmioty
                    </ItemTitle>
                  </ItemHeader>
                  <ItemContent>
                    <ItemGroup>
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="border rounded p-4"
                          onClick={() => {
                            setSelectedItem(product.id);
                            setOpen("accept");
                          }}
                        >
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.name}
                          </p>
                        </div>
                      ))}
                      {pieces.map((piece) => (
                        <div
                          key={piece.id}
                          className="border rounded p-4"
                          onClick={() => {
                            setSelectedItem(piece.id);
                            setOpen("accept");
                          }}
                        >
                          <h4 className="font-medium">{piece.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {piece.name}
                          </p>
                        </div>
                      ))}
                    </ItemGroup>
                  </ItemContent>
                </Item>
              </div>
            </div>
          </main>
        </AdminPageContent>

        <AdminPageFooter>
          <Link
            to="/admin/zwroty"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ChevronLeft />
            Powrót
          </Link>
        </AdminPageFooter>
      </AdminPageContainer>

      <ConfirmActionDialogContent
        action="accept"
        title="Zaakceptuj zwrot"
        description="Czy na pewno chcesz zaakceptować ten zwrot?"
        confirmText="Zaakceptuj"
        cancelText="Anuluj"
        onConfirm={() => handleAccept(selectedItem)}
      />
      <ConfirmActionDialogContent
        action="reject"
        title="Odrzuć zwrot"
        description="Czy na pewno chcesz odrzucić ten zwrot?"
        confirmText="Odrzuć"
        cancelText="Anuluj"
        onConfirm={() => handleReject(selectedItem)}
      />
    </ActionDialog>
  );
}

export async function clientAction({
  request,
  serverAction,
}: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  let loadingMessage = "Przetwarzanie zwrotu...";
  let successMessage = "Zwrot został przetworzony";

  if (intent === "accept") {
    loadingMessage = "Akceptacja zwracanego przedmiotu...";
    successMessage = "Zwrot został zaakceptowany";
  } else if (intent === "reject") {
    loadingMessage = "Odrzucanie zwracanego przedmiotu...";
    successMessage = "Zwrot został odrzucony";
  }

  toast.promise(serverAction(), {
    loading: loadingMessage,
    success: () => {
      return successMessage;
    },
    error: (error) => {
      console.error("Wystąpił błąd podczas przetwarzania zwrotu", error);
      return "Wystąpił błąd podczas przetwarzania zwrotu";
    },
  });
}
