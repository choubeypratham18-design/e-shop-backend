import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Package, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: cartItems } = useCart();
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-heading text-2xl font-bold text-primary">
          Ember
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders">
                  <Package className="mr-1 h-4 w-4" />
                  Orders
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/wishlist">
                  <Heart className="mr-1 h-4 w-4" />
                  Wishlist
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
