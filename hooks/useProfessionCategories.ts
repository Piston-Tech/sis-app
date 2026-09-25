"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import professionCategoryService from "@/services/professionCategoryService";
import { ProfessionCategory } from "@/types/ProfessionCategory";
import { getErrorMessage } from "@/components/student/errors";

const EMPTY: ProfessionCategory[] = [];

const useProfessionCategories = () => {
  const query = useQuery({
    queryKey: ["student", "profession-categories"],
    queryFn: () => professionCategoryService.getProfessionCategories(),
    // The category tree rarely changes.
    staleTime: 10 * 60_000,
  });

  const categoryTree = query.data ?? EMPTY;

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
    (categoryName: string): string[] => subcategoryMap.get(categoryName) || [],
    [subcategoryMap],
  );

  const getProfessionsBySubcategory = useCallback(
    (categoryName: string, subcategoryName: string): string[] => {
      const category = categoryTree.find((item) => item.name === categoryName);
      const subcategory = category?.subCategories.find(
        (item) => item.name === subcategoryName,
      );
      return subcategory?.professions || [];
    },
    [categoryTree],
  );

  return {
    categories,
    categoryTree,
    loading: query.isPending,
    error: query.isError
      ? getErrorMessage(query.error, "Could not load profession categories")
      : "",
    refresh: query.refetch,
    getSubcategoriesByCategory,
    getProfessionsBySubcategory,
  };
};

export default useProfessionCategories;
