import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetch debts
export function useDebts(status?: "paid" | "unpaid") {
  return useQuery({
    queryKey: ["debts", status],
    queryFn: async () => {
      const url = status ? `/api/debts?status=${status}` : "/api/debts";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch debts");
      return response.json();
    },
  });
}

// Fetch debt stats
export function useDebtStats() {
  return useQuery({
    queryKey: ["debtStats"],
    queryFn: async () => {
      const response = await fetch("/api/debts/stats");
      if (!response.ok) throw new Error("Failed to fetch debt stats");
      return response.json();
    },
  });
}

// Create debt payment (Pay debt)
export function useCreateDebtPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      debtId,
      amount,
      notes,
    }: {
      debtId: string;
      amount: string;
      notes?: string;
    }) => {
      const response = await fetch("/api/debt-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debtId, amount, notes }),
      });
      if (!response.ok) throw new Error("Failed to pay debt");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["debtStats"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["debtPayments"] });
    },
  });
}

// Fetch debt payments history
export function useDebtPayments(debtId: string) {
  return useQuery({
    queryKey: ["debtPayments", debtId],
    queryFn: async () => {
      const response = await fetch(`/api/debts/${debtId}/payments`);
      if (!response.ok) throw new Error("Failed to fetch debt payments");
      return response.json();
    },
    enabled: !!debtId, // Only fetch if debtId is provided
  });
}
