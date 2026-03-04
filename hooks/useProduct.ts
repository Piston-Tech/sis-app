import apiClient from "@/services/apiClient";
import { generateProductDescription } from "@/services/geminiService";
import { Product, Category, Gender, ShippingClass, Status } from "@/types";
import createSlug from "@/utils/createSlug";
import { MouseEventHandler, useEffect, useState } from "react";

type ProductKeys = keyof Product;

export interface UseProductProps extends Partial<Record<ProductKeys, any>> {
  page?: number;
  limit?: number;
  sort?: string;
}

const useProduct = (params: UseProductProps | undefined = undefined) => {
  const [products, setProducts] = useState<Product[]>([]);

  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, any>).toString()
    : "";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(`/products${queryString}`);
      console.log("Fetched products:", response.data);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id),
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return {
    products,
    refreshProducts: fetchProducts,
  };
};

export default useProduct;
