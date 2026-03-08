import { Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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
            <div key={order.id} className="rounded-lg border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "MMM d, yyyy · h:mm a")}
                  </p>
                  <p className="mt-1 text-lg font-bold text-primary">
                    ${Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {order.payment_status}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {order.order_status}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                      {item.products?.image_url && (
                        <img src={item.products.image_url} alt={item.products?.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span className="flex-1">{item.products?.name}</span>
                    <span className="text-muted-foreground">×{item.quantity}</span>
                    <span className="font-medium">${Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
