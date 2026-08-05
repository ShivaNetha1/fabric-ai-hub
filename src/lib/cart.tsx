import * as React from "react";
import { products, type Product } from "@/lib/data";
import { useAuth } from "./auth-context";
import { dbService } from "./db-service";

export interface CartLine {
  productId: string;
  metres: number;
  colour: string;
}

interface CartState {
  lines: CartLine[];
  add: (productId: string, metres: number, colour: string) => void;
  remove: (productId: string, colour?: string) => void;
  setMetres: (productId: string, metres: number, colour?: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  detailed: { line: CartLine; product: Product }[];
}

const CartContext = React.createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [dbProducts, setDbProducts] = React.useState<Product[]>([]);

  const linesKey = lines.map((l) => l.productId).join(",");

  // Load products to fetch details
  React.useEffect(() => {
    dbService.getProducts().then((res) => {
      setDbProducts(res);
    });
  }, [linesKey]);

  // Sync cart when user signs in or out
  React.useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Fetch from Supabase
        const dbCart = await dbService.getCartItems(user.id);
        
        // Merge guest cart if it exists
        const guestCartStr = localStorage.getItem("loomly_guest_cart");
        if (guestCartStr) {
          try {
            const guestCart = JSON.parse(guestCartStr) as CartLine[];
            for (const item of guestCart) {
              const duplicateIndex = dbCart.findIndex(
                (d) => d.productId === item.productId && d.colour === item.colour
              );
              const duplicateItem = dbCart[duplicateIndex];
              if (duplicateIndex > -1 && duplicateItem) {
                duplicateItem.metres += item.metres;
                await dbService.syncCartItem(
                  user.id,
                  item.productId,
                  duplicateItem.metres,
                  item.colour
                );
              } else {
                dbCart.push(item);
                await dbService.syncCartItem(user.id, item.productId, item.metres, item.colour);
              }
            }
            localStorage.removeItem("loomly_guest_cart");
          } catch (e) {
            console.error("Failed to merge guest cart:", e);
          }
        }
        setLines(dbCart);
      } else {
        // Load guest cart
        const guestCartStr = localStorage.getItem("loomly_guest_cart");
        if (guestCartStr) {
          setLines(JSON.parse(guestCartStr));
        } else {
          setLines([]);
        }
      }
    };

    loadCart();
  }, [user]);

  const add = React.useCallback(
    async (productId: string, metres: number, colour: string) => {
      let finalMetres = metres;

      setLines((prev) => {
        let updated: CartLine[];
        const existing = prev.find((l) => l.productId === productId && l.colour === colour);
        if (existing) {
          finalMetres = existing.metres + metres;
          updated = prev.map((l) =>
            l.productId === productId && l.colour === colour
              ? { ...l, metres: finalMetres }
              : l
          );
        } else {
          finalMetres = metres;
          updated = [...prev, { productId, metres, colour }];
        }

        if (!user) {
          localStorage.setItem("loomly_guest_cart", JSON.stringify(updated));
        }
        return updated;
      });

      if (user) {
        await dbService.syncCartItem(user.id, productId, finalMetres, colour);
      }
    },
    [user]
  );

  const remove = React.useCallback(
    async (productId: string, colour?: string) => {
      setLines((prev) => {
        const updated = prev.filter(
          (l) => !(l.productId === productId && (!colour || l.colour === colour))
        );
        if (!user) {
          localStorage.setItem("loomly_guest_cart", JSON.stringify(updated));
        }
        return updated;
      });

      if (user) {
        await dbService.removeCartItem(user.id, productId, colour);
      }
    },
    [user]
  );

  const setMetres = React.useCallback(
    async (productId: string, metres: number, colour?: string) => {
      const targetMetres = Math.max(0, metres);
      setLines((prev) => {
        const updated = prev.map((l) =>
          l.productId === productId && (!colour || l.colour === colour)
            ? { ...l, metres: targetMetres }
            : l
        );
        if (!user) {
          localStorage.setItem("loomly_guest_cart", JSON.stringify(updated));
        }
        return updated;
      });

      if (user && colour) {
        if (targetMetres === 0) {
          await dbService.removeCartItem(user.id, productId, colour);
        } else {
          await dbService.syncCartItem(user.id, productId, targetMetres, colour);
        }
      }
    },
    [user]
  );

  const clear = React.useCallback(async () => {
    setLines([]);
    if (user) {
      await dbService.clearCart(user.id);
    } else {
      localStorage.removeItem("loomly_guest_cart");
    }
  }, [user]);

  const detailed = React.useMemo(() => {
    return lines
      .map((line) => {
        const product = dbProducts.find((p) => p.id === line.productId) ||
          products.find((p) => p.id === line.productId);
        return { line, product: product! };
      })
      .filter((d) => Boolean(d.product));
  }, [lines, dbProducts]);

  const value: CartState = {
    lines,
    add,
    remove,
    setMetres,
    clear,
    count: lines.length,
    subtotal: detailed.reduce((sum, d) => sum + d.product.pricePerMetre * d.line.metres, 0),
    detailed,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
