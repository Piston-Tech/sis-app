import apiClient from "@/services/apiClient";
import { Student } from "@/types";
import { useEffect, useState } from "react";

type StudentKeys = keyof Student;

export interface UseStudentProps extends Partial<Record<StudentKeys, any>> {
  page?: number;
  limit?: number;
  sort?: string;
}

const useStudent = (params: UseStudentProps | undefined = undefined) => {
  const [students, setStudents] = useState<Student[]>([]);

  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, any>).toString()
    : "";

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get(`/admin/students${queryString}`);
      console.log("Fetched students:", response.data);
      setStudents(response.data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      await apiClient.delete(`/admin/students/${id}`);
      setStudents((prevStudents) =>
        prevStudents.filter((student) => student.id !== id),
      );
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  return {
    students,
    refreshStudents: fetchStudents,
  };
};

export default useStudent;
