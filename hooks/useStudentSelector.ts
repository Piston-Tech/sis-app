import apiClient from "@/services/apiClient";
import { Student } from "@/types";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

const useStudentSelector = (value: number | undefined) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<StudentOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption>();

  type StudentOption = Pick<
    Student,
    | "id"
    | "studentId"
    | "firstName"
    | "middleName"
    | "lastName"
    | "email"
    | "phone"
  >;
  // interface StudentOption {
  //   id: number;
  //   code: string;
  //   title: string;
  // }

  // This value will only update 300ms after the user stops typing
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchStudents();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (value && !selectedStudent) fetchSelectedStudent();
  }, [value]);

  const fetchSelectedStudent = async () => {
    setIsSearching(true);

    try {
      const response = await apiClient.get(
        `/admin/students/search?id=${value}`,
      );
      console.log("Fetched students:", response.data);
      setSelectedStudent(response.data.data);
    } catch (error) {
      console.error("Error fetching selected student:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchStudents = async () => {
    if (debouncedSearchTerm.length < 2) {
      setOptions([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await apiClient.get(
        `/admin/students/search?q=${debouncedSearchTerm}`,
      );
      console.log("Fetched students:", response.data);
      setOptions(response.data.data);
    } catch (error) {
      console.error("Error searching students:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSelected = (option: StudentOption) => {
    setSelectedStudent(option);
    setSearchTerm(""); // Update input to show selection
    setOptions([]); // Clear list
  };

  return {
    searchTerm,
    setSearchTerm,
    options,
    onSelected,
    isSearching,
    selectedStudent,
  };
};

export default useStudentSelector;
