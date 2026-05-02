import { Navbar } from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ShoppingBag, ArrowRight, Loader2, Copy, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Cart = () => {
  const { items, setQty, setDays, remove, total } = useCart();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [redirectBase, setRedirectBase] = useState<string>("");
  const [generatedUrl, setGeneratedUrl] = useState<string>("");

  useEffect(() => {
    supabase.from("app_settings").select("value").eq("key", "checkout_redirect_url").maybeSingle()
      .then(({ data }) => { if (data?.value) setRedirectBase(data.value); });
  }, []);

  const itemsBase64 = useMemo(() => {
    if (items.length === 0) return "";
    const payload = items.map((i) => ({ code: i.code, quantity: i.qty, days: i.days, codeType: i.codeType }));
    try {
      return btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch { return ""; }
  }, [items]);

  const handleGenerate = async () => {
    if (items.length === 0) return;
    if (!user || !session) { navigate("/login?next=/cart"); return; }
    if (!redirectBase) { toast.error("Checkout redirect URL is not configured"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-token", {
        body: { cart: items.map((i) => ({ id: i.id, qty: i.qty, days: i.days })) },
      });
      if (error || !data?.token) throw new Error(error?.message || "Failed to generate token");
      const rd = `/externalorder/createappointment?items=${itemsBase64}`;
      const url = `${redirectBase}?code=${data.token}&rd=${rd}`;
      setGeneratedUrl(url);
      toast.success("Checkout link generated");
    } catch (e: any) {
      toast.error(e?.message || "Could not generate checkout link");
    } finally { setLoading(false); }
  };

  const buildEncodedUrl = (urlString: string): string => {
    try {
      // Split by "&rd=" to separate base URL from rd value
      const rdIndex = urlString.indexOf("&rd=");
      if (rdIndex === -1) return urlString;

      const basePart = urlString.substring(0, rdIndex); // includes code parameter
      const rdValuePart = urlString.substring(rdIndex + 4); // everything after "&rd="

      // URL-encode the rd value (this will encode & as %26, ? as %3F, = as %3D, etc.)
      const encodedRd = encodeURIComponent(rdValuePart);

      return `${basePart}&rd=${encodedRd}`;
    } catch {
      return urlString;
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    const encodedUrl = buildEncodedUrl(generatedUrl);
    await navigator.clipboard.writeText(encodedUrl);
    toast.success("URL copied");
  };

  const handleNavigate = () => {
    if (generatedUrl) {
      const encodedUrl = buildEncodedUrl(generatedUrl);
      window.location.href = encodedUrl;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-5xl py-16 md:py-20">
        <div className="mb-12">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Checkout</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Your cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Link to="/"><Button variant="outline" className="rounded-full">Browse catalog</Button></Link>
          </div>
        ) : (
          <div className="grid gap-16 lg:grid-cols-[1fr_360px]">
            <div className="divide-y divide-border/60">
              {items.map((i) => (
                <div key={i.id} className="py-6 first:pt-0">
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-medium">{i.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                        {i.codeType} · {i.code}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">${i.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold">${(i.price * i.qty).toFixed(2)}</div>
                      <button
                        onClick={() => remove(i.id)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 max-w-sm">
                    <div>
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Quantity</Label>
                      <Input
                        type="number" min={1} value={i.qty}
                        onChange={(e) => setQty(i.id, parseInt(e.target.value) || 1)}
                        className="mt-1.5 h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Days</Label>
                      <Input
                        type="number" min={1} value={i.days}
                        onChange={(e) => setDays(i.id, parseInt(e.target.value) || 1)}
                        className="mt-1.5 h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-2xl bg-secondary/50 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Summary</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-accent-foreground">Free</span>
                  </div>
                </div>
                <div className="my-5 h-px bg-border" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="mt-6 w-full rounded-full h-11 gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>Generate checkout link <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
                {!user && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">You'll sign in before checkout.</p>
                )}
              </div>
            </aside>
          </div>
        )}

        {items.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border/60">
            <div className="max-w-2xl">
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Redirect</div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Checkout URL</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Edit freely to add extra parameters before navigating.
              </p>
              <Textarea
                value={generatedUrl}
                onChange={(e) => setGeneratedUrl(e.target.value)}
                placeholder='Click "Generate checkout link" to populate this field.'
                className="mt-6 min-h-[140px] rounded-xl font-mono text-xs leading-relaxed bg-secondary/40 border-border/60"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={handleNavigate} disabled={!generatedUrl} className="rounded-full gap-2">
                  <ExternalLink className="h-4 w-4" /> Navigate
                </Button>
                <Button onClick={handleCopy} variant="outline" disabled={!generatedUrl} className="rounded-full gap-2">
                  <Copy className="h-4 w-4" /> Copy
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Cart;