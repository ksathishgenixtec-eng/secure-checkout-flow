import { Card } from "@/components/ui/card";
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

  return (
    <Card className="group relative overflow-hidden border border-border/60 bg-gradient-card p-5 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-hero opacity-10 blur-2xl transition-smooth group-hover:opacity-20" />
      <div className="relative">
        <div className="mb-3 inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
          In stock
        </div>
        <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Price</div>
            <div className="text-2xl font-bold tracking-tight">${product.price.toFixed(2)}</div>
          </div>
          <Button onClick={handleAdd} size="sm" className="rounded-xl">
            {added ? (<><Check className="h-4 w-4" /> Added</>) : (<><Plus className="h-4 w-4" /> Add</>)}
          </Button>
        </div>
      </div>
    </Card>
  );
};
