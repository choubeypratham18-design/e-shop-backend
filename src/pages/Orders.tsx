import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

const OrderBill = ({ order }: { order: any }) => {
  const [expanded, setExpanded] = useState(false);
  const items = order.order_items ?? [];
  const subtotal = items.reduce((s: number, i: any) => s + Number(i.price) * i.quantity, 0);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.created_at), "MMM d, yyyy · h:mm a")}
          </p>
          <p className="mt-1 text-lg font-bold text-primary">
            ${Number(order.total_amount).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-foreground">
            {order.payment_status}
          </span>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {order.order_status}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-4">
          <Separator className="mb-4" />
          {/* Invoice header */}
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Order Invoice</p>
          <div className="space-y-3">
            {items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                  {item.products?.image_url && (
                    <img src={item.products.image_url} alt={item.products?.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <span className="flex-1">{item.products?.name}</span>
                <span className="text-muted-foreground">×{item.quantity}</span>
                <span className="w-20 text-right text-muted-foreground">${Number(item.price).toFixed(2)} ea</span>
                <span className="w-20 text-right font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Bill summary */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>$0.00</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Order ID: {order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container max-w-2xl py-8 animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Back to Shop</Link>
      </Button>
      <h1 className="mb-6 text-3xl font-bold">Order History</h1>

      {!orders?.length ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No orders yet</p>
          <Button asChild className="mt-4"><Link to="/">Start Shopping</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <OrderBill key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
