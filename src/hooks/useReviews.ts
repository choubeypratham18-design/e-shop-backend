import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  profile_name?: string;
}

export const useReviews = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((data as any[]).map((r) => r.user_id))];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("user_id, name").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p.name]));

      return (data as any[]).map((r) => ({
        ...r,
        profile_name: profileMap.get(r.user_id) ?? "Anonymous",
      })) as Review[];
    },
  });
};

export const useAverageRating = (productId: string) => {
  const { data: reviews } = useReviews(productId);
  if (!reviews || reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
};

export const useAddReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { productId: string; userId: string; rating: number; title: string; comment: string }) => {
      const { error } = await supabase.from("product_reviews").insert({
        product_id: input.productId,
        user_id: input.userId,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", vars.productId] });
    },
  });
};
