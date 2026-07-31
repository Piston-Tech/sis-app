import { useCallback, useEffect, useMemo, useState } from "react";
import professionCategoryService from "@/services/professionCategoryService";
import { ProfessionCategory } from "@/types/ProfessionCategory";

const useProfessionCategories = () => {
  const [categoryTree, setCategoryTree] = useState<ProfessionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await professionCategoryService.getProfessionCategories();
      setCategoryTree(data);
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "Could not load profession categories";
      setError(message);
      setCategoryTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const categories = useMemo(
    () => categoryTree.map((category) => category.name),
    [categoryTree],
  );

  const subcategoryMap = useMemo(() => {
    const map = new Map<string, string[]>();

    categoryTree.forEach((category) => {
      map.set(
        category.name,
        category.subCategories.map((subcategory) => subcategory.name),
      );
    });

    return map;
  }, [categoryTree]);

  const getSubcategoriesByCategory = useCallback(
    (categoryName: string): string[] => {
      return subcategoryMap.get(categoryName) || [];
    },
    [subcategoryMap],
  );

  const getProfessionsBySubcategory = useCallback(
    (categoryName: string, subcategoryName: string): string[] => {
      const category = categoryTree.find((item) => item.name === categoryName);
      if (!category) return [];

      const subcategory = category.subCategories.find(
        (item) => item.name === subcategoryName,
      );

      return subcategory?.professions || [];
    },
    [categoryTree],
  );

  return {
    categories,
    categoryTree,
    loading,
    error,
    refresh: loadCategories,
    getSubcategoriesByCategory,
    getProfessionsBySubcategory,
  };
};

export default useProfessionCategories;
