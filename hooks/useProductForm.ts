import apiClient from "@/services/apiClient";
import { generateProductDescription } from "@/services/geminiService";
import { Product, Category, Gender, ShippingClass, Status } from "@/types";
import createSlug from "@/utils/createSlug";
import { MouseEventHandler, useEffect, useState } from "react";

const useProduct = (product: Product | null, close: () => void) => {
  const initialFormData: Partial<Product> = {
    name: "",
    slug: "",
    sku: "",
    brand: "D&S Signature",
    categoryId: Category.SHOES,
    subcategory: "",
    gender: Gender.MEN,
    sizes: "",
    colors: "",
    colorImages: "",
    material: "",
    price: 0,
    salePrice: undefined,
    stockQuantity: 0,
    shippingClass: ShippingClass.STANDARD,
    rating: 5,
    ratingCount: 0,
    tags: "",
    returnPolicy: "48-hour return window after delivery.",
    status: Status.ACTIVE,
    images: "",
    description: "",
    featured: false,
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormData);

  useEffect(() => {
    // if (product) {
    setFormData(product ?? initialFormData);
    // }
  }, [product]);

  const [errors, setErrors] = useState({
    name: "",
    slug: "",
    sku: "",
    brand: "",
    categoryId: "",
    subcategory: "",
    gender: "",
    sizes: "",
    colors: "",
    colorImages: "",
    material: "",
    price: "",
    salePrice: "",
    stockQuantity: "",
    shippingClass: "",
    rating: "",
    ratingCount: "",
    tags: "",
    returnPolicy: "",
    status: "",
    images: "",
    description: "",
    featured: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const addProduct = async (formData: Partial<Product>) => {
    try {
      const { data } = await apiClient.post("/products", formData);

      console.log(data);

      if (data.success) {
        alert(data.message);
        close();
      } else {
        if (data.errors) {
          setErrors({ ...data.errors });
        } else if (data.error) {
          alert(data.error);
        }
      }
    } catch (e: any) {
      console.log(e);
      alert(e);
    }
  };

  const updateProduct = async (id: number, formData: Partial<Product>) => {
    try {
      const { data } = await apiClient.put("/products", formData);

      console.log(data);

      if (data.success) {
        alert(data.message);
        close();
      } else {
        if (data.errors) {
          setErrors({ ...data.errors });
        } else if (data.error) {
          alert(data.error);
        }
      }
    } catch (e: any) {
      console.log(e);
      alert(e);
    }
  };

  const getProducts = async () => {
    const { data } = await apiClient.get("/products");
    console.log(data);
    return data?.products ?? [];
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // return console.log(formData);

    if (
      !formData.name ||
      //   !formData.sku ||
      !formData.price ||
      formData.stockQuantity === undefined
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    formData.sku =
      "DS-" +
      (formData.categoryId === Category.SHOES ? "SHO" : "CLO") +
      "-" +
      Math.ceil(Math.random() * 999)
        .toString()
        .padStart(3, "0");

    // const processedData = {
    //   ...formData,
    //   sizes:
    //     typeof formData.sizes === "string"
    //       ? (formData.sizes as string)
    //           .split(",")
    //           .map((s) => s.trim())
    //           .filter((s) => s)
    //       : formData.sizes,
    //   colors:
    //     typeof formData.colors === "string"
    //       ? (formData.colors as string)
    //           .split(",")
    //           .map((s) => s.trim())
    //           .filter((s) => s)
    //       : formData.colors,
    //   tags:
    //     typeof formData.tags === "string"
    //       ? (formData.tags as string)
    //           .split(",")
    //           .map((s) => s.trim())
    //           .filter((s) => s)
    //       : formData.tags,
    //   images: (formData.images || []).filter((img) => img && img.trim() !== ""),
    // } as Product;

    // const processedData = formData;

    // if (processedData.images.length === 0) {
    //   processedData.images = [
    //     "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
    //   ];
    // }

    if (product) {
      updateProduct(product.id, formData);
    } else {
      addProduct(formData);
    }

    close();
  };

  const generateSlug: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    const slug = createSlug(formData.name ?? "");

    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return alert("Enter a product name first.");
    setIsGenerating(true);
    const desc = await generateProductDescription(
      formData.name,
      formData.categoryId || "Luxury Item",
      formData.brand || "D&S Signature",
    );
    setFormData((prev) => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  return {
    handleSaveProduct,
    addProduct,
    updateProduct,
    formData,
    setFormData,
    errors,
    generateSlug,
    isGenerating,
    handleGenerateDescription,
    getProducts,
  };
};

export default useProduct;
