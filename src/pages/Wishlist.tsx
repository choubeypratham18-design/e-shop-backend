import { Link } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useAddToCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Wishlist = () => {
  const { user } = useAuth();
  const { data: wishlistItems, isLoading } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const addToCart = useAddToCart();

  if (!user) {
    return (
      <div className="container max-w-2xl py-20 text-center">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Please sign in to view your wishlist</p>
        <Button asChild className="mt-4"><Link to="/login">Sign In</Link></Button>
      </div>
    );
  }

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container max-w-2xl py-8 animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Back to Shop</Link>
      </Button>
      <h1 className="mb-6 text-3xl font-bold">My Wishlist</h1>

      {!wishlistItems?.length ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your wishlist is empty</p>
          <Button asChild className="mt-4"><Link to="/">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlistItems.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-card">
              <Link to={`/product/${item.product_id}`} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                {item.products?.image_url && (
                  <img src={item.products.image_url} alt={item.products?.name} className="h-full w-full object-cover" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`}>
                  <h3 className="font-heading font-semibold truncate">{item.products?.name}</h3>
                </Link>
                <p className="text-sm font-medium text-primary">${Number(item.products?.price).toFixed(2)}</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  addToCart.mutate({ productId: item.product_id }, {
                    onSuccess: () => toast.success("Added to cart!"),
                  });
                }}
                disabled={item.products?.stock === 0}
              >
                <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => toggleWishlist.mutate({ productId: item.product_id, isWishlisted: true })}
              >
                <Heart className="h-4 w-4 fill-current" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
