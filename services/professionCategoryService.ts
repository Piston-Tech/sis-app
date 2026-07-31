import { ProfessionCategory } from "@/types/ProfessionCategory";
import apiClient from "./apiClient";

class ProfessionCategoryService {
  async getProfessionCategories(): Promise<ProfessionCategory[]> {
    const response = await apiClient.get("/students/profession-categories");

    if (!response.data?.success) {
      throw new Error(
        response.data?.error || "Failed to fetch profession categories",
      );
    }

    return response.data.data || [];
  }
}

const professionCategoryService = new ProfessionCategoryService();

export default professionCategoryService;
