import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ProductsResponse,
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/types";

// Fetch products
export function useProducts() {
  return useQuery<ProductsResponse>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateProductInput>({
    mutationFn: async (data) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const dataResponse = await response.json();
      if (!response.ok)
        throw new Error(dataResponse.error || "Failed to create product");
      return dataResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: number; data: UpdateProductInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const dataResponse = await response.json();
      if (!response.ok)
        throw new Error(dataResponse.error || "Failed to update product");
      return dataResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const dataResponse = await response.json();
      if (!response.ok)
        throw new Error(dataResponse.error || "Failed to delete product");
      return dataResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
