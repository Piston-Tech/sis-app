import apiClient from "@/services/apiClient";
import { Student } from "@/types";
import createSlug from "@/utils/createSlug";
import { MouseEventHandler, useEffect, useState } from "react";
import useCompany from "./useCompany";

type StudentForm = Omit<
  Student,
  | "id"
  | "studentId"
  | "passwordHash"
  | "linkedinData"
  | "updatedAt"
  | "createdAt"
>;

const useStudentForm = (student: Student | null, close: () => void) => {
  const initialFormData: StudentForm = {
    prefix: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: undefined,
    membershipTier: "",
    persona: "",
  };

  const { companies } = useCompany();

  const [formData, setFormData] = useState<Partial<Student>>(initialFormData);

  const [errors, setErrors] = useState<Record<keyof StudentForm, string>>({
    prefix: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: "",
    membershipTier: "",
    persona: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(student ?? initialFormData);
  }, [student]);

  const addStudent = async (formData: Partial<Student>) => {
    setLoading(true);

    try {
      const { data } = await apiClient.post("/admin/students", formData);

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

  const updateStudent = async (id: number, formData: Partial<Student>) => {
    setLoading(true);

    try {
      const { data } = await apiClient.put("/students", formData);

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

    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all required fields.");
      return;
    }

    if (student) {
      updateStudent(student.id, formData);
    } else {
      addStudent(formData);
    }
  };

  return {
    companies,
    handleSubmit,
    formData,
    setFormData,
    loading,
    errors,
  };
};

export default useStudentForm;
