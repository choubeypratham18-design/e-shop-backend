import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCart, useUpdateCartQuantity, useRemoveFromCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Cart = () => {
  const { data: cartItems, isLoading } = useCart();
  const updateQty = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();
  const checkout = useCheckout();
  const navigate = useNavigate();

  const total = cartItems?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;

  const handleCheckout = () => {
    if (!cartItems?.length) return;
    checkout.mutate(cartItems, {
      onSuccess: () => {
        toast.success("Order placed successfully!");
        navigate("/orders");
      },
      onError: () => toast.error("Checkout failed"),
    });
  };

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container max-w-2xl py-8 animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Continue Shopping</Link>
      </Button>
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>

      {!cartItems?.length ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Your cart is empty</p>
          <Button asChild className="mt-4"><Link to="/">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-card">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                {item.product.image_url && (
                  <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold truncate">{item.product.name}</h3>
                <p className="text-sm font-medium text-primary">${Number(item.product.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => updateQty.mutate({ itemId: item.id, quantity: item.quantity - 1 })}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => updateQty.mutate({ itemId: item.id, quantity: item.quantity + 1 })}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                onClick={() => removeItem.mutate(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="mt-6 rounded-lg border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <Button className="mt-4 w-full" size="lg" onClick={handleCheckout} disabled={checkout.isPending}>
              {checkout.isPending ? "Processing..." : "Checkout (Simulated Payment)"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
