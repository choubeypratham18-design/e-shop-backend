import { useState } from "react";
import { Star } from "lucide-react";
import { useReviews, useAverageRating, useAddReview } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn(
          "h-5 w-5 transition-colors",
          star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
          interactive && "cursor-pointer hover:text-amber-400"
        )}
        onClick={() => interactive && onRate?.(star)}
      />
    ))}
  </div>
);

const ProductReviews = ({ productId }: { productId: string }) => {
  const { data: reviews, isLoading } = useReviews(productId);
  const { average, count } = useAverageRating(productId);
  const addReview = useAddReview();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const userHasReviewed = reviews?.some((r) => r.user_id === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to leave a review"); return; }
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (!title.trim()) { toast.error("Please add a title"); return; }

    addReview.mutate(
      { productId, userId: user.id, rating, title: title.trim(), comment: comment.trim() },
      {
        onSuccess: () => {
          toast.success("Review submitted!");
          setShowForm(false);
          setRating(0);
          setTitle("");
          setComment("");
        },
        onError: () => toast.error("Failed to submit review"),
      }
    );
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
          {count > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={Math.round(average)} />
              <span className="text-sm text-muted-foreground">
                {average.toFixed(1)} out of 5 · {count} review{count !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        {user && !userHasReviewed && !showForm && (
          <Button variant="outline" onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Your Rating</label>
            <StarRating rating={rating} onRate={setRating} interactive />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Summarize your experience" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Comment</label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="Tell others what you think..." rows={4} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={addReview.isPending}>
              {addReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading reviews...</p>
      ) : !reviews?.length ? (
        <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StarRating rating={review.rating} />
                  <span className="font-semibold">{review.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
              <p className="mt-2 text-xs text-muted-foreground">by {review.profile_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
