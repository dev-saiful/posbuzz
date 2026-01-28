import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";

interface SaleItem {
  productId: string;
  quantity: number;
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: SaleItem[]) => api.post("/sales", { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useSales(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["sales", page, limit],
    queryFn: () =>
      api.get(`/sales?page=${page}&limit=${limit}`).then((res) => res.data),
  });
}
