import apiClient from "@/services/apiClient";
import { Course } from "@/types";
import { useEffect, useState } from "react";

type CourseKeys = keyof Course;

export interface UseCourseProps extends Partial<Record<CourseKeys, any>> {
  page?: number;
  limit?: number;
  sort?: string;
}

const useCourse = (params: UseCourseProps | undefined = undefined) => {
  const [courses, setCourses] = useState<Course[]>([]);

  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, any>).toString()
    : "";

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get(`/admin/courses${queryString}`);
      console.log("Fetched courses:", response.data);
      setCourses(response.data.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const deleteCourse = async (id: number) => {
    try {
      await apiClient.delete(`/admin/courses/${id}`);
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== id),
      );
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return {
    courses,
    refreshCourses: fetchCourses,
  };
};

export default useCourse;
