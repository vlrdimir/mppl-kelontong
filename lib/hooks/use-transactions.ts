import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetch transactions
export function useTransactions(type?: string) {
  return useQuery({
    queryKey: ["transactions", type],
    queryFn: async () => {
      const url = type ? `/api/transactions?type=${type}` : "/api/transactions";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });
}

// Create transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: string;
      customerId?: string;
      totalAmount: string;
      paymentStatus: string;
      paidAmount?: string;
      notes?: string;
      items: Array<{
        productId: string;
        quantity: number;
        price: string;
        subtotal: string;
      }>;
    }) => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create transaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Update transaction
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        paymentStatus?: string;
        paidAmount?: string;
        notes?: string;
        customerId?: string;
      };
    }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const dataResponse = await response.json();
      if (!response.ok) throw new Error(dataResponse.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["debtStats"] });
    },
  });
}

// Delete transaction
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete transaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
