import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id!);
  const addToCart = useAddToCart();
  const { user } = useAuth();

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  if (!product) return <div className="container py-20 text-center text-muted-foreground">Product not found</div>;

  const handleAdd = () => {
    if (!user) { toast.error("Please sign in"); return; }
    addToCart.mutate({ productId: product.id }, {
      onSuccess: () => toast.success("Added to cart!"),
    });
  };

  return (
    <div className="container max-w-4xl py-8 animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
      </Button>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{product.category}</p>
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-lg text-muted-foreground">{product.description}</p>
          <p className="text-3xl font-bold text-primary">${Number(product.price).toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <Button size="lg" onClick={handleAdd} disabled={product.stock === 0}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock === 0 ? "Sold Out" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
