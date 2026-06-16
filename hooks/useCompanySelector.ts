import apiClient from "@/services/apiClient";
import { Company } from "@/types";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

const useCompanySelector = (value: number | undefined) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<CompanyOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption>();

  type CompanyOption = Pick<Company, "id" | "companyId" | "name">;

  // This value will only update 300ms after the user stops typing
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchCompanies();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (value && !selectedCompany) fetchSelectedCompany();
  }, [value]);

  const fetchSelectedCompany = async () => {
    setIsSearching(true);

    try {
      const response = await apiClient.get(
        `/admin/companies/search?id=${value}`,
      );
      console.log("Fetched companies:", response.data);
      setSelectedCompany(response.data.data);
    } catch (error) {
      console.error("Error fetching selected company:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchCompanies = async () => {
    if (debouncedSearchTerm.length < 2) {
      setOptions([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await apiClient.get(
        `/admin/companies/search?q=${debouncedSearchTerm}`,
      );
      console.log("Fetched companies:", response.data);
      setOptions(response.data.data);
    } catch (error) {
      console.error("Error searching companies:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSelected = (option: CompanyOption) => {
    setSelectedCompany(option);
    setSearchTerm(""); // Update input to show selection
    setOptions([]); // Clear list
  };

  return {
    searchTerm,
    setSearchTerm,
    options,
    onSelected,
    isSearching,
    selectedCompany,
  };
};

export default useCompanySelector;
