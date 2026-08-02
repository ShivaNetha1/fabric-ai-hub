import * as React from "react";
import { products, type Product } from "@/lib/data";

export interface CartLine {
  productId: string;
  metres: number;
  colour: string;
}

interface CartState {
  lines: CartLine[];
  add: (productId: string, metres: number, colour: string) => void;
  remove: (productId: string) => void;
  setMetres: (productId: string, metres: number) => void;
  count: number;
  subtotal: number;
  detailed: { line: CartLine; product: Product }[];
}

const CartContext = React.createContext<CartState | null>(null);

const initialLines: CartLine[] = [
  { productId: "organic-cotton-poplin", metres: 1200, colour: "Ivory" },
  { productId: "european-flax-linen", metres: 400, colour: "Sage" },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>(initialLines);

  const add = React.useCallback((productId: string, metres: number, colour: string) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, metres: l.metres + metres, colour } : l,
        );
      }
      return [...prev, { productId, metres, colour }];
    });
  }, []);

  const remove = React.useCallback(
    (productId: string) => setLines((prev) => prev.filter((l) => l.productId !== productId)),
    [],
  );

  const setMetres = React.useCallback(
    (productId: string, metres: number) =>
      setLines((prev) =>
        prev.map((l) => (l.productId === productId ? { ...l, metres: Math.max(0, metres) } : l)),
      ),
    [],
  );

  const detailed = React.useMemo(
    () =>
      lines
        .map((line) => ({ line, product: products.find((p) => p.id === line.productId)! }))
        .filter((d) => Boolean(d.product)),
    [lines],
  );

  const value: CartState = {
    lines,
    add,
    remove,
    setMetres,
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
