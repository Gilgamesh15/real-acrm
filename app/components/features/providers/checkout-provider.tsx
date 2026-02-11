import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";

import type { action as createOrderAction } from "~/api/create-order";
import type {
  OrderPiece,
  OrderProduct,
  loader as pendingOrderLoader,
} from "~/api/pending-order";
import type { CreateOrderSchemaType } from "~/lib/schemas";
import {
  groupPurchasableItems,
  orderItemsToGoogleAnalyticsItems,
  priceDataToDisplayData,
} from "~/lib/utils";

type CheckoutContextType = {
  items: {
    products: OrderProduct[];
    pieces: OrderPiece[];
  };
  hasPendingOrder: boolean;
  isLoading: boolean;
  stripeCheckoutUrl: string | null;
  orderId: string | null;
  initiateCheckout: (args: CreateOrderSchemaType) => Promise<void>;
  resumeCheckout: () => void;
  cancelOrder: () => Promise<void>;
  refetch: () => Promise<unknown>;
};

const CheckoutContext = React.createContext<CheckoutContextType | null>(null);

function useCheckout() {
  const context = React.useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}

function CheckoutProvider({ children }: React.PropsWithChildren) {
  const location = useLocation();

  const [stripeCheckoutUrl, setStripeCheckoutUrl] = React.useState<
    string | null
  >(null);
  const [items, setItems] = React.useState<{
    products: OrderProduct[];
    pieces: OrderPiece[];
  }>({
    products: [],
    pieces: [],
  });

  // Fetch pending order on mount and on route change
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pending-order", location.pathname],
    queryFn: async () => {
      const response = await fetch("/api/pending-order");
      if (!response.ok) {
        throw new Error("Failed to fetch pending order");
      }
      return (await response.json()) as Awaited<
        ReturnType<typeof pendingOrderLoader>
      >["data"];
    },
  });

  // Update state when pending order is fetched
  React.useEffect(() => {
    if (data?.order) {
      const { products, pieces } = groupPurchasableItems(data.order.items);
      setItems({ products, pieces });
      setStripeCheckoutUrl(data.stripeCheckoutUrl ?? null);
    } else {
      setItems({ products: [], pieces: [] });
      setStripeCheckoutUrl(null);
    }
  }, [data]);

  const initiateCheckout = React.useCallback(
    async (args: CreateOrderSchemaType) => {
      toast.promise(
        async () => {
          const response = await fetch("/api/create-order", {
            method: "POST",
            body: JSON.stringify(args),
          });

          if (!response.ok) {
            throw new Error("Nie udało się utworzyć zamówienia");
          }

          const result = (await response.json()) as Awaited<
            ReturnType<typeof createOrderAction>
          >["data"];

          if (!result.stripeSession.url) {
            throw new Error("Nie udało się utworzyć sesji płatności");
          }

          return { url: result.stripeSession.url, order: result.order };
        },
        {
          loading: "Trwa utworzenie zamówienia...",
          error: (err) => {
            return err instanceof Error
              ? {
                  message: "Nie udało się utworzyć zamówienia",
                  description: err.message,
                }
              : {
                  message: "Nie udało się utworzyć zamówienia",
                  description: "Odśwież stronę i spróbuj ponownie.",
                };
          },
          success: ({ url, order }) => {
            const itemsPrices = order.items.map((item) =>
              priceDataToDisplayData(item)
            );
            const totalPrice = itemsPrices.reduce(
              (acc, item) => acc + item.finalPrice,
              0
            );

            window.gtag?.("event", "begin_checkout", {
              currency: "PLN",
              value: totalPrice,
              items: order.items.map((item) =>
                orderItemsToGoogleAnalyticsItems(item)
              ),
            });

            setStripeCheckoutUrl(url);
            window.location.href = url;
            return "Zamówienie utworzone";
          },
        }
      );
    },
    []
  );

  const resumeCheckout = React.useCallback(() => {
    if (stripeCheckoutUrl) {
      window.location.href = stripeCheckoutUrl;
    }
  }, [stripeCheckoutUrl]);

  const cancelOrder = React.useCallback(async () => {
    if (!data?.order?.id) return;

    try {
      const response = await fetch("/api/cancel-order", {
        method: "POST",
        body: JSON.stringify({ orderId: data.order.id }),
      });

      if (response.ok) {
        await refetch();
        toast.success("Zamówienie anulowane");
      } else {
        toast.error("Nie udało się anulować zamówienia");
      }
    } catch {
      toast.error("Nie udało się anulować zamówienia");
    }
  }, [data?.order?.id, refetch]);

  return (
    <CheckoutContext.Provider
      value={{
        items,
        hasPendingOrder: Boolean(data?.order),
        isLoading,
        stripeCheckoutUrl,
        orderId: data?.order?.id ?? null,
        initiateCheckout,
        resumeCheckout,
        cancelOrder,
        refetch,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export { CheckoutProvider, useCheckout };
