import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useOrders";
import { toast } from "sonner";

type Step = "details" | "processing" | "success";

const Checkout = () => {
  const { data: cartItems, isLoading } = useCart();
  const checkout = useCheckout();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const subtotal = cartItems?.reduce((s, i) => s + i.product.price * i.quantity, 0) ?? 0;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const isValid = cardNumber.replace(/\s/g, "").length === 16 && cardName.length >= 2 && expiry.length === 5 && cvv.length >= 3;

  const handlePay = async () => {
    if (!cartItems?.length || !isValid) return;
    setStep("processing");

    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 2500));

    try {
      await checkout.mutateAsync(cartItems);
      setStep("success");
    } catch {
      setStep("details");
      toast.error("Payment failed. Please try again.");
    }
  };

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;

  if (!cartItems?.length && step !== "success") {
    return (
      <div className="container max-w-lg py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-4"><Link to="/">Browse Products</Link></Button>
      </div>
    );
  }

  // Success screen
  if (step === "success") {
    return (
      <div className="container max-w-lg py-20 animate-fade-in text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Payment Successful!</h1>
        <p className="mb-1 text-muted-foreground">Your order has been placed and is being processed.</p>
        <p className="mb-8 text-sm text-muted-foreground">A confirmation has been sent to your email (simulated).</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate("/orders")}>View Orders</Button>
          <Button variant="outline" onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  // Processing screen
  if (step === "processing") {
    return (
      <div className="container max-w-lg py-20 animate-fade-in text-center">
        <Loader2 className="mx-auto mb-6 h-16 w-16 animate-spin text-primary" />
        <h2 className="mb-2 text-2xl font-bold">Processing Payment...</h2>
        <p className="text-muted-foreground">Please wait while we securely process your payment.</p>
        <div className="mx-auto mt-6 max-w-xs">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "70%", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      </div>
    );
  }

  // Payment form
  return (
    <div className="container max-w-2xl py-8 animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/cart"><ArrowLeft className="mr-1 h-4 w-4" />Back to Cart</Link>
      </Button>

      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Payment form */}
        <div className="md:col-span-3">
          <div className="rounded-lg border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Secure (Simulated)
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                />
              </div>
              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              🔒 This is a simulated payment. No real charges will be made. Use any card number.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {cartItems?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate pr-2">{item.product.name} × {item.quantity}</span>
                  <span className="flex-shrink-0 font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-primary font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <Button className="mt-6 w-full" size="lg" onClick={handlePay} disabled={!isValid}>
              <Lock className="mr-2 h-4 w-4" />
              Pay ${total.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
