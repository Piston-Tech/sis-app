import { useEffect, useState } from "react";
import { SelectedClassSearch, Tier, Transaction } from "@/types";
import apiClient from "@/services/apiClient";

type TransactionForm = Omit<
  Transaction,
  "id" | "transactionId" | "createdAt" | "updatedAt"
>;

interface EnrollmentData {
  studentId: number;
  classId: number;
  cba: string;
  delivery: string;
  planId: number;
}

const useTransactionForm = (
  transaction: Transaction | null,
  close: () => void,
) => {
  const initialFormData: TransactionForm = {
    payerId: 0,
    payerType: "B2C",
    discount: 0,
    nextPaymentDate: null,
  };

  const initEnrollmentData: EnrollmentData = {
    studentId: 0,
    classId: 0,
    cba: "PA",
    delivery: "Hybrid",
    planId: 1,
  };

  const [formData, setFormData] =
    useState<Partial<Transaction>>(initialFormData);

  const [errors, setErrors] = useState<Record<keyof TransactionForm, string>>({
    payerId: "",
    payerType: "",
    discount: "",
    nextPaymentDate: "",
  });
  const [plans, setPlans] = useState<Tier[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([
    initEnrollmentData,
  ]);
  const [selectedClasses, setSelectedClasses] = useState<SelectedClassSearch[]>(
    [],
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    setFormData(transaction ?? initialFormData);
  }, [transaction]);

  useEffect(() => {
    console.log("Selected classes updated:", selectedClasses);
    console.log(
      "total:",
      selectedClasses.reduce((sum, cls, index) => {
        const planId = enrollments[index]?.planId;
        const priceObj = cls.course.prices.find((p) => p.tierId === planId);
        const price = priceObj ? parseFloat(priceObj.price) : 0;
        return sum + price;
      }, 0),
    );
  }, [selectedClasses]);

  const fetchPlans = async () => {
    try {
      const response = await apiClient.get(`/admin/tiers`);
      console.log("Fetched plans:", response.data);
      setPlans(response.data.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      // setIsLoadingPlans(false);
    }
  };

  const addEnrollmentRow = () => {
    setEnrollments([...enrollments, initEnrollmentData]);
    // setFormData((prev) => ({ ...prev, no_students: prev.no_students + 1 }));
  };

  const addTransaction = async (formData: Partial<Transaction>) => {
    setLoading(true);

    try {
      const { data } = await apiClient.post("/admin/transactions", formData);

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

  const updateTransaction = async (
    id: number,
    formData: Partial<Transaction>,
  ) => {
    setLoading(true);

    try {
      const { data } = await apiClient.put("/admin/transactions", formData);

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

    if (!formData.payerId || !formData.payerType) {
      alert("Please fill in all required fields.");
      return;
    }

    if (transaction) {
      updateTransaction(transaction.id, formData);
    } else {
      addTransaction(formData);
    }
  };

  const totalAmount = selectedClasses.reduce((sum, cls, index) => {
    const planId = enrollments[index]?.planId;
    const priceObj = cls.course.prices.find((p) => p.tierId === planId);
    const price = priceObj ? parseFloat(priceObj.price) : 0;
    return sum + price;
  }, 0);

  console.log("Total amount calculated:", totalAmount);

  return {
    loading,
    handleSubmit,
    formData,
    setFormData,
    addEnrollmentRow,
    plans,
    enrollments,
    setEnrollments,
    selectedClasses,
    setSelectedClasses,
    totalAmount,
  };
};

export default useTransactionForm;
