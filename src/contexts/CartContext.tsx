import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  days: number;
  code: string;
  codeType: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty" | "days">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setDays: (id: string, days: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "medi_cart_v1";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add: CartCtx["add"] = (item) =>
    setItems((p) => {
      const ex = p.find((i) => i.id === item.id);
      if (ex) return p.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...p, { ...item, qty: 1, days: 30 }];
    });
  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((p) => qty <= 0 ? p.filter((i) => i.id !== id) : p.map((i) => i.id === id ? { ...i, qty } : i));
  const setDays = (id: string, days: number) =>
    setItems((p) => p.map((i) => i.id === id ? { ...i, days: Math.max(1, days) } : i));
  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, setDays, clear, total, count }}>
      {children}
    </Ctx.Provider>
  );
};

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
};
