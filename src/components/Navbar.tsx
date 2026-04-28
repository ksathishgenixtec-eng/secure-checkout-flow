import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Navbar = () => {
  const { count } = useCart();
  const { user, displayName, signOut } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();

  const linkCls = (active: boolean) =>
    `text-sm font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`;

  const initials = (displayName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "U";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
            <span className="text-[11px] font-bold text-background tracking-tight">M</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">MediMart</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkCls(loc.pathname === "/")}>Shop</Link>
          <Link to="/cart" className={linkCls(loc.pathname === "/cart")}>Cart</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 pl-1 pr-3 py-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                  {initials}
                </div>
                <span className="text-xs font-medium text-foreground max-w-[140px] truncate">
                  {displayName}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 rounded-full" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="rounded-full px-5">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};