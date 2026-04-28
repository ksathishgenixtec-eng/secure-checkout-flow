import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ShieldCheck, Truck, HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Product = { id: string; name: string; description: string; price: number; code: string; code_type: string };

const Index = () => {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    document.title = "MediMart — Premium medical essentials";
    supabase.from("products").select("*").order("created_at").then(({ data }) => {
      setProducts((data as Product[]) || []);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — soft, asymmetric */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-soft)" }} />
        <div className="container relative grid gap-12 py-24 md:py-32 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Pharmacist-verified essentials
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-balance md:text-7xl">
              Healthcare,<br />
              <span className="text-muted-foreground">refined for everyday life.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Curated medical supplies and prescriptions, delivered with the care
              and precision your wellbeing deserves.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="#catalog">
                <Button size="lg" className="rounded-full px-7 h-12 gap-2">
                  Browse catalog <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#trust" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Why MediMart →
              </a>
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/40 blur-2xl" />
              <div className="absolute inset-8 rounded-full border border-border/60 bg-background/40 backdrop-blur-sm" />
              <div className="absolute inset-20 rounded-full bg-card shadow-elegant flex items-center justify-center">
                <HeartPulse className="h-20 w-20 text-primary/60" strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section id="trust" className="border-y border-border/60">
        <div className="container grid grid-cols-1 divide-y divide-border/60 md:grid-cols-3 md:divide-y-0 md:divide-x">
          {[
            { icon: ShieldCheck, label: "Verified pharmacy", sub: "Licensed & accredited" },
            { icon: Truck, label: "Discreet delivery", sub: "Fast, tracked shipping" },
            { icon: HeartPulse, label: "Clinician support", sub: "Real humans, on-call" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-2 py-8 md:px-8">
              <item.icon className="h-5 w-5 text-primary" strokeWidth={1.6} />
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <main id="catalog" className="container py-20 md:py-28">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Catalog</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Featured this week</h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            A curated selection from our pharmacists — essentials chosen for quality, efficacy, and value.
          </p>
        </div>

        {!products ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">No products yet.</p>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>

      <footer className="border-t border-border/60">
        <div className="container py-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MediMart. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">For licensed use only. Consult your healthcare provider.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;