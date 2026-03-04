import apiClient from "@/services/apiClient";
import { Company } from "@/types";
import { useEffect, useState } from "react";

type CompanyKeys = keyof Company;

export interface UseCompanyProps extends Partial<Record<CompanyKeys, any>> {
  page?: number;
  limit?: number;
  sort?: string;
}

const useCompany = (params: UseCompanyProps | undefined = undefined) => {
  const [companies, setCompanies] = useState<Company[]>([]);

  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, any>).toString()
    : "";

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get(`/admin/companies${queryString}`);
      console.log("Fetched companies:", response.data);
      setCompanies(response.data.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      await apiClient.delete(`/admin/companies/${id}`);
      setCompanies((prevCompanies) =>
        prevCompanies.filter((company) => company.id !== id),
      );
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  return {
    companies,
    refreshCompanies: fetchCompanies,
  };
};

export default useCompany;
