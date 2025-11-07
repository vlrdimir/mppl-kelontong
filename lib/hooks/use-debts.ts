import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Fetch debts
export function useDebts() {
  return useQuery({
    queryKey: ["debts"],
    queryFn: async () => {
      const response = await fetch("/api/debts")
      if (!response.ok) throw new Error("Failed to fetch debts")
      return response.json()
    },
  })
}

// Create debt
export function useCreateDebt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      customerId: string
      transactionId: string
      totalDebt: string
      paidAmount?: string
      remainingDebt: string
      status: string
    }) => {
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create debt")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] })
    },
  })
}

// Update debt
export function useUpdateDebt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/debts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update debt")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] })
    },
  })
}

// Create debt payment
export function useCreateDebtPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { debtId: string; amount: string; notes?: string }) => {
      const response = await fetch("/api/debt-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create debt payment")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] })
    },
  })
}
