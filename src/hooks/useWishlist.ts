import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useWishlist = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*, products(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useIsWishlisted = (productId: string) => {
  const { data: wishlist } = useWishlist();
  return wishlist?.some((item) => item.product_id === productId) ?? false;
};

export const useToggleWishlist = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isWishlisted }: { productId: string; isWishlisted: boolean }) => {
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", user!.id)
          .eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wishlist_items")
          .insert({ user_id: user!.id, product_id: productId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};
