import apiClient from "@/services/apiClient";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

const useCourseSelector = (value: number | undefined) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<CourseOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>();

  interface CourseOption {
    id: number;
    code: string;
    title: string;
  }

  // This value will only update 300ms after the user stops typing
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchCourses();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (value && !selectedCourse) fetchSelectedCourse();
  }, [value]);

  const fetchSelectedCourse = async () => {
    setIsSearching(true);

    try {
      const response = await apiClient.get(`/courses/search?id=${value}`);
      console.log("Fetched courses:", response.data);
      setSelectedCourse(response.data.data);
    } catch (error) {
      console.error("Error fetching selected course:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchCourses = async () => {
    if (debouncedSearchTerm.length < 2) {
      setOptions([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await apiClient.get(
        `/courses/search?q=${debouncedSearchTerm}`,
      );
      console.log("Fetched courses:", response.data);
      setOptions(response.data.data);
    } catch (error) {
      console.error("Error searching courses:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSelected = (option: CourseOption) => {
    setSelectedCourse(option);
    setSearchTerm(""); // Update input to show selection
    setOptions([]); // Clear list
  };

  return {
    searchTerm,
    setSearchTerm,
    options,
    onSelected,
    isSearching,
    selectedCourse,
  };
};

export default useCourseSelector;
