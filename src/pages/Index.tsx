import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

type Product = { id: string; name: string; description: string; price: number; code: string; code_type: string };

const Index = () => {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    document.title = "MediMart — Medical supplies online";
    supabase.from("products").select("*").order("created_at").then(({ data }) => {
      setProducts((data as Product[]) || []);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-dark text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary-glow)/0.25),transparent_60%)]" />
        <div className="container relative py-20 md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Trusted medical essentials
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Healthcare supplies, <span className="bg-gradient-to-r from-primary-glow to-primary-foreground bg-clip-text text-transparent">delivered fast.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-primary-foreground/70 md:text-lg">
            Browse trusted medical products and check out securely with one-time encrypted tokens.
          </p>
        </div>
      </section>

      <main className="container py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured products</h2>
            <p className="text-sm text-muted-foreground">Hand-picked essentials for everyday care.</p>
          </div>
        </div>
        {!products ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">No products yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
