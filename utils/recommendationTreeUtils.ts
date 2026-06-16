import recommendationTree from "./recommendation_tree.json";

export interface RecommendationTree {
  categories: Category[];
}

export interface Category {
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  name: string;
  professions: string[];
  interests: string[];
}

const tree = recommendationTree as RecommendationTree;

// Get all category names
export const getCategories = (): string[] => {
  return tree.categories.map((cat) => cat.name);
};

// Get subcategories for a selected category
export const getSubcategoriesByCategory = (categoryName: string): string[] => {
  console.log("🔍 Looking for category:", categoryName);
  console.log("📊 Available categories:", tree.categories.map((c) => c.name));
  const category = tree.categories.find((cat) => cat.name === categoryName);
  console.log("✅ Found category:", category);
  const result = category
    ? category.subcategories.map((sub) => sub.name)
    : [];
  console.log("📋 Subcategories:", result);
  return result;
};

// Get professions for a selected subcategory
export const getProfessionsBySubcategory = (
  categoryName: string,
  subcategoryName: string
): string[] => {
  const category = tree.categories.find((cat) => cat.name === categoryName);
  if (!category) return [];

  const subcategory = category.subcategories.find(
    (sub) => sub.name === subcategoryName
  );
  return subcategory ? [...subcategory.professions] : [];
};

// Get interests for a selected subcategory
export const getInterestsBySubcategory = (
  categoryName: string,
  subcategoryName: string
): string[] => {
  const category = tree.categories.find((cat) => cat.name === categoryName);
  if (!category) return [];

  const subcategory = category.subcategories.find(
    (sub) => sub.name === subcategoryName
  );
  return subcategory ? [...subcategory.interests] : [];
};

// Get all professions across all categories (for next profession dropdown)
export const getAllProfessions = (): string[] => {
  const professions = new Set<string>();
  tree.categories.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      subcategory.professions.forEach((prof) => professions.add(prof));
    });
  });
  return Array.from(professions).sort();
};

// Get all interests across all subcategories (for autocomplete)
export const getAllInterests = (): string[] => {
  const interests = new Set<string>();
  tree.categories.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      subcategory.interests.forEach((interest) => interests.add(interest));
    });
  });
  return Array.from(interests).sort();
};

// Search interests by query (for autocomplete filtering)
export const searchInterests = (query: string, availableInterests: string[]): string[] => {
  if (!query.trim()) {
    return availableInterests;
  }

  const lowerQuery = query.toLowerCase();
  return availableInterests.filter((interest) =>
    interest.toLowerCase().includes(lowerQuery)
  );
};
