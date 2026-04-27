import { Navbar } from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ShoppingBag, ArrowRight, Loader2, Link as LinkIcon, Copy, ExternalLink } from "lucide-react";
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

  // Load the configured redirect URL once
  useEffect(() => {
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "checkout_redirect_url")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setRedirectBase(data.value);
      });
  }, []);

  // Build the base64-encoded items payload
  const itemsBase64 = useMemo(() => {
    if (items.length === 0) return "";
    const payload = items.map((i) => ({
      code: i.code,
      quantity: i.qty,
      days: i.days,
      codeType: i.codeType,
    }));
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch {
      return "";
    }
  }, [items]);

  const handleGenerate = async () => {
    if (items.length === 0) return;
    if (!user || !session) {
      navigate("/login?next=/cart");
      return;
    }
    if (!redirectBase) {
      toast.error("Checkout redirect URL is not configured");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-token", {
        body: { cart: items.map((i) => ({ id: i.id, qty: i.qty, days: i.days })) },
      });
      if (error || !data?.token) throw new Error(error?.message || "Failed to generate token");

      // Build the rd (redirect destination) value: /externalorder/createappointment?items=<base64>
      const rd = `/externalorder/createappointment?items=${itemsBase64}`;
      const url = new URL(redirectBase);
      url.searchParams.set("code", data.token);
      url.searchParams.set("rd", rd);
      setGeneratedUrl(url.toString());
      toast.success("Checkout link generated");
    } catch (e: any) {
      console.error("Generate failed:", e);
      toast.error(e?.message || "Could not generate checkout link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    toast.success("URL copied");
  };

  const handleNavigate = () => {
    if (!generatedUrl) return;
    window.location.href = generatedUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review your items before checkout.</p>

        {items.length === 0 ? (
          <Card className="mt-8 flex flex-col items-center justify-center gap-3 p-12 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/"><Button>Browse products</Button></Link>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {items.map((i) => (
                <Card key={i.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-semibold">{i.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {i.codeType} · {i.code}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">${i.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right font-semibold">${(i.price * i.qty).toFixed(2)}</div>
                    <Button variant="ghost" size="icon" onClick={() => remove(i.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <Input
                        type="number" min={1} value={i.qty}
                        onChange={(e) => setQty(i.id, parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Days</Label>
                      <Input
                        type="number" min={1} value={i.days}
                        onChange={(e) => setDays(i.id, parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="h-fit p-6 bg-gradient-card">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
              </div>
              <div className="my-4 h-px bg-border" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
              <Button onClick={handleGenerate} disabled={loading} className="mt-6 w-full rounded-xl" size="lg">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>Generate Checkout URL <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
              {!user && (
                <p className="mt-3 text-center text-xs text-muted-foreground">You'll sign in before checkout.</p>
              )}
            </Card>
          </div>
        )}

        {items.length > 0 && (
          <Card className="mt-8 overflow-hidden border-primary/20 bg-gradient-card p-6 shadow-elegant">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LinkIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold leading-tight">Checkout redirect URL</h3>
                <p className="text-xs text-muted-foreground">
                  Edit this URL freely to add extra parameters before navigating.
                </p>
              </div>
            </div>
            <Textarea
              value={generatedUrl}
              onChange={(e) => setGeneratedUrl(e.target.value)}
              placeholder='Click "Generate Checkout URL" above to populate this field.'
              className="mt-4 min-h-[120px] font-mono text-xs"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={handleNavigate} disabled={!generatedUrl} className="rounded-xl">
                <ExternalLink className="h-4 w-4" /> Navigate
              </Button>
              <Button onClick={handleCopy} variant="outline" disabled={!generatedUrl} className="rounded-xl">
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Cart;
