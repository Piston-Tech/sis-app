import apiClient from "@/services/apiClient";
import { Class, Course, SelectedClassSearch } from "@/types";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

const useClasseselector = (value: number | undefined) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<SelectedClassSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SelectedClassSearch>();

  // This value will only update 300ms after the user stops typing
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchClasses();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (value && !selectedClass) fetchSelectedClass();
  }, [value]);

  const fetchSelectedClass = async () => {
    setIsSearching(true);

    try {
      const response = await apiClient.get(`/admin/classes/search?id=${value}`);
      console.log("Fetched classes:", response.data);
      setSelectedClass(response.data.data);
    } catch (error) {
      console.error("Error fetching selected class:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchClasses = async () => {
    if (debouncedSearchTerm.length < 2) {
      setOptions([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await apiClient.get(
        `/admin/classes/search?q=${debouncedSearchTerm}`,
      );
      console.log("Fetched classes:", response.data);
      setOptions(response.data.data);
    } catch (error) {
      console.error("Error searching classes:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSelected = (option: SelectedClassSearch) => {
    setSelectedClass(option);
    setSearchTerm(""); // Update input to show selection
    setOptions([]); // Clear list
  };

  return {
    searchTerm,
    setSearchTerm,
    options,
    onSelected,
    isSearching,
    selectedClass,
  };
};

export default useClasseselector;
