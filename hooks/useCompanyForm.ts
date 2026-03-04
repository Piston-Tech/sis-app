import apiClient from "@/services/apiClient";
import { Company } from "@/types";
import { useEffect, useState } from "react";

type CompanyForm = Omit<
  Company,
  "id" | "companyId" | "updatedAt" | "createdAt"
>;

const useCompanyForm = (company: Company | null, close: () => void) => {
  const initialFormData: CompanyForm = {
    name: "",
    industry: "",
  };

  const [formData, setFormData] = useState<Partial<Company>>(initialFormData);

  const [errors, setErrors] = useState<Record<keyof CompanyForm, string>>({
    name: "",
    industry: "",
  });

  const [companies, setCompanies] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(company ?? initialFormData);
  }, [company]);

  const addCompany = async (formData: Partial<Company>) => {
    setLoading(true);

    try {
      const { data } = await apiClient.post("/admin/companies", formData);

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

  const updateCompany = async (id: number, formData: Partial<Company>) => {
    setLoading(true);

    try {
      const { data } = await apiClient.put("/companies", formData);

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

    if (!formData.name || !formData.industry) {
      alert("Please fill in all required fields.");
      return;
    }

    if (company) {
      updateCompany(company.id, formData);
    } else {
      addCompany(formData);
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

export default useCompanyForm;
