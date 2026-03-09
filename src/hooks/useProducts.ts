import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
  created_at: string;
}

export type SortOption = "newest" | "price_asc" | "price_desc" | "rating";

export const PRODUCTS_PER_PAGE = 12;

export const useProducts = (
  search?: string,
  category?: string,
  sort: SortOption = "newest",
  page: number = 1
) => {
  return useQuery({
    queryKey: ["products", search, category, sort, page],
    queryFn: async () => {
      let query = supabase.from("products").select("*", { count: "exact" });

      if (search) query = query.ilike("name", `%${search}%`);
      if (category && category !== "all") query = query.eq("category", category);

      // Sorting
      if (sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sort === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "price_desc") {
        query = query.order("price", { ascending: false });
      } else if (sort === "rating") {
        query = query.order("created_at", { ascending: false }); // fallback, rating sorted client-side
      }

      // Pagination
      const from = (page - 1) * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { products: data as Product[], totalCount: count ?? 0 };
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Product;
    },
  });
};
