import apiClient from "@/services/apiClient";
import { Class, Session } from "@/types";
import { useEffect, useState } from "react";

type ClassKeys = keyof Class;

export interface UseClassProps extends Partial<Record<ClassKeys, any>> {
  page?: number;
  limit?: number;
  sort?: string;
}

const useClass = (params: UseClassProps | undefined = undefined) => {
  const [classes, setClasses] = useState<
    Array<
      Class & { sessions: Array<Session> } & { noOfEnrollments: number } & {
        course: { id: number; code: string; title: string };
      }
    >
  >([]);

  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, any>).toString()
    : "";

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await apiClient.get(`/admin/classes${queryString}`);
      console.log("Fetched classes:", response.data);
      setClasses(response.data.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const deleteClass = async (id: number) => {
    try {
      await apiClient.delete(`/admin/classes/${id}`);
      setClasses((prevClasses) => prevClasses.filter((data) => data.id !== id));
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  return {
    classes,
    refreshClasses: fetchClasses,
    deleteClass,
  };
};

export default useClass;
