import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";

import type { CartPiece, CartProduct } from "~/api/cart";
import { useLocalStorage } from "~/hooks/use-local-storage";
import type { LocalStorageCart } from "~/lib/types";

type CartContextType = {
  items: {
    products: CartProduct[];
    pieces: CartPiece[];
  };
  isLoading: boolean;
  error?: string;
  refetch: () => void;
  addPiece: (piece: CartPiece) => void;
  addProduct: (product: CartProduct) => void;
  removePiece: (id: string) => void;
  removeProduct: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  cartCount: number;
};

const CartContext = React.createContext<CartContextType | null>(null);

function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

function CartProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const [localCart, setLocalCart, removeLocalCart] =
    useLocalStorage<LocalStorageCart>("cart", []);

  const [items, setItems] = React.useState<{
    products: CartProduct[];
    pieces: CartPiece[];
  }>({
    products: [],
    pieces: [],
  });

  const {
    data: fetchedItems,
    isLoading: _isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cart", location.pathname],
    queryFn: async () => {
      const response = await fetch("/api/cart", {
        method: "POST",
        body: JSON.stringify(localCart),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      return (await response.json()) as {
        products: CartProduct[];
        pieces: CartPiece[];
        missingProductIds: string[];
        missingPieceIds: string[];
        error: string | null;
        success: boolean;
        message: string;
      };
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
    initialData: {
      products: [] as CartProduct[],
      pieces: [] as CartPiece[],
      missingProductIds: [] as string[],
      missingPieceIds: [] as string[],
      error: null,
      success: true,
      message: "Cart is empty",
    },
  });

  React.useEffect(() => {
    refetch({ cancelRefetch: true });
  }, [localCart, refetch]);

  React.useEffect(() => {
    const { products, pieces, missingProductIds, missingPieceIds } =
      fetchedItems;

    const totalMissing = missingProductIds.length + missingPieceIds.length;

    // Remove missing items from localStorage using functional update
    if (totalMissing > 0) {
      setLocalCart((prev) =>
        prev.filter(
          (item) =>
            (!item.productId || !missingProductIds.includes(item.productId)) &&
            !missingPieceIds.includes(item.pieceId)
        )
      );

      toast.info(
        `${totalMissing} ${totalMissing === 1 ? "produkt" : totalMissing < 5 ? "produkty" : "produktów"} usunięto z koszyka`,
        {
          duration: 2000,
        }
      );
    }
    // Update items state
    setItems({ products, pieces });
  }, [fetchedItems]);

  const isLoading = _isLoading || isRefetching;

  React.useEffect(() => {
    if (!isLoading && error) {
      toast.error("Nie udało się załadować koszyka", {
        duration: 2000,
      });
    }
  }, [isLoading, error]);

  const addPiece = React.useCallback(
    (piece: CartPiece) => {
      if (localCart.some((item) => item.pieceId === piece.id)) {
        return;
      }

      setLocalCart((prev) => [...prev, { pieceId: piece.id }]);

      // Optimistically add to items
      setItems((prev) => ({
        ...prev,
        pieces: [...prev.pieces, piece],
      }));

      toast.success("Dodano do koszyka", {
        duration: 2000,
      });
    },
    [localCart, setLocalCart]
  );

  const addProduct = React.useCallback(
    (product: CartProduct) => {
      const productPieceIds = new Set(product.pieces.map((p) => p.id));

      // Remove any existing pieces that reference this product or are part of it, then add fresh
      setLocalCart((prev) => [
        ...prev.filter(
          (item) =>
            item.productId !== product.id && !productPieceIds.has(item.pieceId)
        ),
        ...product.pieces.map((piece) => ({
          pieceId: piece.id,
          productId: product.id,
        })),
      ]);

      // Optimistically update items - remove any standalone pieces that are now part of product
      setItems((prev) => ({
        ...prev,
        products: [
          ...prev.products.filter((p) => p.id !== product.id),
          product,
        ],
        pieces: prev.pieces.filter((piece) => !productPieceIds.has(piece.id)),
      }));

      toast.success("Dodano do koszyka", {
        duration: 2000,
      });
    },
    [setLocalCart]
  );

  const removePiece = React.useCallback(
    (id: string) => {
      setLocalCart((prev) => prev.filter((item) => item.pieceId !== id));

      // Optimistically remove from items
      setItems((prev) => ({
        ...prev,
        pieces: prev.pieces.filter((piece) => piece.id !== id),
      }));
    },
    [setLocalCart]
  );

  const removeProduct = React.useCallback(
    (id: string) => {
      setLocalCart((prev) => prev.filter((item) => item.productId !== id));

      // Optimistically remove from items
      setItems((prev) => ({
        ...prev,
        products: prev.products.filter((product) => product.id !== id),
      }));
    },
    [setLocalCart]
  );

  const clearCart = React.useCallback(() => {
    removeLocalCart();
    setItems({ products: [], pieces: [] });
    toast.success("Koszyk wyczyszczony", {
      duration: 2000,
    });
  }, [removeLocalCart]);

  const isInCart = React.useCallback(
    (id: string) => {
      return (
        localCart.some((item) => item.productId === id) ||
        localCart.some((item) => item.pieceId === id)
      );
    },
    [localCart]
  );

  const cartCount = React.useMemo(() => {
    return items.products.length + items.pieces.length;
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        error: error?.message,
        refetch,
        addPiece,
        addProduct,
        removePiece,
        removeProduct,
        clearCart,
        isInCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export { CartProvider, useCart };
