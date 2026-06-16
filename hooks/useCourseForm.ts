import apiClient from "@/services/apiClient";
import { Course } from "@/types";
import { useEffect, useState } from "react";

type CourseForm = Omit<Course, "id" | "updatedAt" | "createdAt">;

const useCourseForm = (course: Course | null, close: () => void) => {
  const initialFormData: CourseForm = {
    title: "",
    category: "",
    link: "",
    code: "",
    duration: "",
    description: "",
    subCategory: "",
    level: "",
  };

  const [formData, setFormData] = useState<Partial<Course>>(initialFormData);

  const [errors, setErrors] = useState<Record<keyof CourseForm, string>>({
    title: "",
    category: "",
    link: "",
    code: "",
    duration: "",
    description: "",
    subCategory: "",
    level: "",
  });

  const [courses, setCourses] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(course ?? initialFormData);
  }, [course]);

  const addCourse = async (formData: Partial<Course>) => {
    setLoading(true);

    try {
      const { data } = await apiClient.post("/admin/courses", formData);

      console.log(data);

      if (data.success) {
        alert(data.message);
        close();
      } else {
        if (data.errors) {
          setErrors({ ...data.errors });
        } else if (data.error) {
          alert(data.error);
        }
      }
    } catch (e: any) {
      console.log(e);
      alert(e);
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (id: number, formData: Partial<Course>) => {
    setLoading(true);

    try {
      const { data } = await apiClient.put("/admin/courses", formData);

      console.log(data);

      if (data.success) {
        alert(data.message);
        close();
      } else {
        if (data.errors) {
          setErrors({ ...data.errors });
        } else if (data.error) {
          alert(data.error);
        }
      }
    } catch (e: any) {
      console.log(e);
      alert(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.code ||
      !formData.category ||
      !formData.duration
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (course) {
      updateCourse(course.id, formData);
    } else {
      addCourse(formData);
    }
  };

  return {
    courses,
    handleSubmit,
    formData,
    setFormData,
    loading,
    errors,
  };
};

export default useCourseForm;
