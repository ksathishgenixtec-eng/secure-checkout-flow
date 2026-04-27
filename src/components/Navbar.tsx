import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, LogOut, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-elegant group-hover:scale-105 transition-smooth">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">MediMart</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/">
            <Button variant={loc.pathname === "/" ? "secondary" : "ghost"} size="sm">Shop</Button>
          </Link>
          <Link to="/cart">
            <Button variant={loc.pathname === "/cart" ? "secondary" : "ghost"} size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Cart</span>
              {count > 0 && (
                <Badge className="ml-2 h-5 min-w-5 px-1.5 bg-primary text-primary-foreground">
                  {count}
                </Badge>
              )}
            </Button>
          </Link>
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Link to="/login"><Button variant="default" size="sm">Sign in</Button></Link>
          )}
        </nav>
      </div>
    </header>
  );
};
