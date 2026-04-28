import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

type Props = {
  product: { id: string; name: string; description: string; price: number; code: string; code_type: string };
};

export const ProductCard = ({ product }: Props) => {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add({ id: product.id, name: product.name, price: product.price, code: product.code, codeType: product.code_type });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  // Soft pastel tile backdrop varies by code hash for subtle visual rhythm
  const palettes = [
    "from-[hsl(212,40%,96%)] to-[hsl(212,30%,92%)]",
    "from-[hsl(158,30%,95%)] to-[hsl(158,25%,90%)]",
    "from-[hsl(220,16%,97%)] to-[hsl(220,14%,93%)]",
    "from-[hsl(38,40%,96%)] to-[hsl(38,30%,92%)]",
  ];
  const idx = (product.code?.charCodeAt(0) || 0) % palettes.length;

  return (
    <div className="group cursor-default">
      <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br ${palettes[idx]} transition-smooth`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl font-light tracking-tight text-foreground/15 select-none">
            {product.name.charAt(0)}
          </div>
        </div>
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
            {product.code_type}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-smooth">
          <Button onClick={handleAdd} size="sm" className="rounded-full h-9 w-9 p-0 shadow-elegant">
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-medium leading-tight truncate">{product.name}</h3>
          <p className="mt-1 text-[13px] text-muted-foreground line-clamp-1">{product.description}</p>
        </div>
        <div className="text-[15px] font-semibold whitespace-nowrap">${product.price.toFixed(2)}</div>
      </div>
    </div>
  );
};