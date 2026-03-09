import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Heart, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts, PRODUCTS_PER_PAGE, type SortOption } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const CATEGORIES = ["all", "electronics", "accessories", "footwear", "food", "home", "fitness"];

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProducts(search, category, sort, page);
  const products = data?.products;
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const addToCart = useAddToCart();
  const { user } = useAuth();
  const { data: wishlist } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  const isWishlisted = (productId: string) =>
    wishlist?.some((item) => item.product_id === productId) ?? false;

  const handleToggleWishlist = (productId: string) => {
    if (!user) { toast.error("Please sign in to save items"); return; }
    toggleWishlist.mutate(
      { productId, isWishlisted: isWishlisted(productId) },
      { onSuccess: () => toast.success(isWishlisted(productId) ? "Removed from wishlist" : "Added to wishlist!") }
    );
  };

  const handleAddToCart = (productId: string) => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    addToCart.mutate({ productId }, {
      onSuccess: () => toast.success("Added to cart!"),
      onError: () => toast.error("Failed to add to cart"),
    });
  };

  return (
    <div className="container py-8 animate-fade-in">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="mb-3 text-5xl font-bold tracking-tight">Curated for You</h1>
        <p className="mx-auto max-w-lg text-lg text-muted-foreground">
          Discover handpicked products that blend quality, style, and value.
        </p>
      </section>

      {/* Search, Filter & Sort */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sort} onValueChange={(v) => { setSort(v as SortOption); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "secondary"}
              size="sm"
              onClick={() => { setCategory(cat); setPage(1); }}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : products?.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products?.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-lg border bg-card shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="relative">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden bg-muted">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                  </div>
                </Link>
                <button
                  onClick={() => handleToggleWishlist(product.id)}
                  className="absolute right-2 top-2 rounded-full bg-card/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-card"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                </button>
              </div>
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {product.category}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-semibold leading-tight">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                    {product.stock === 0 ? "Sold Out" : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Index;
