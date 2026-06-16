import { useEffect, useState } from "react";
import {
  CreateEnrollmentData,
  CreateTransactionData,
  Transaction,
} from "@/types";
import apiClient from "@/services/apiClient";
import checkTransaction from "@/utils/checks/checkTransaction";
import checkEnrollment from "@/utils/checks/checkEnrollment";

type TransactionAndEnrollmentData = CreateTransactionData & {
  enrollments: CreateEnrollmentData[];
};

const useTransactionForm = (
  transaction: Transaction | null,
  close: () => void,
) => {
  const initEnrollmentData: CreateEnrollmentData = {
    studentId: 0,
    classId: 0,
    cba: "",
    delivery: "Hybrid",
    tierId: 1,
    status: "PROCESSING",
  };

  const initialFormData: TransactionAndEnrollmentData = {
    total: 0,
    discount: 0,
    payerId: 0,
    payerType: "B2C",
    enrollments: [initEnrollmentData],
  };

  const [formData, setFormData] =
    useState<TransactionAndEnrollmentData>(initialFormData);

  const [errors, setErrors] = useState<
    Record<keyof CreateTransactionData, string> & {
      enrollments: Record<keyof CreateEnrollmentData, string>[];
    }
  >({
    total: "",
    discount: "",
    payerId: "",
    payerType: "",
    enrollments: [
      {
        transactionId: "",
        studentId: "",
        classId: "",
        cba: "",
        delivery: "",
        tierId: "",
        status: "",
      },
    ],
  });

  const [loading, setLoading] = useState(false);

  // const [enrollments, setEnrollments] = useState<CreateEnrollmentData[]>([
  //   initEnrollmentData,
  // ]);

  const [subTotals, setSubTotals] = useState<number[]>([]);

  useEffect(() => {
    if (formData.payerType === "B2C") {
      setFormData({
        ...formData,
        enrollments: formData.enrollments.map((enrollment) => ({
          ...enrollment,
          studentId: formData.payerId,
        })),
      });
    } else if (formData.payerType === "B2B") {
      setFormData({
        ...formData,
        enrollments: formData.enrollments.map((enrollment) => ({
          ...enrollment,
          studentId: 0,
        })),
      });
    }
  }, [formData.payerId, formData.payerType]);

  useEffect(() => {
    setFormData(initialFormData);
  }, [transaction]);

  useEffect(() => {
    setFormData({
      ...formData,
      total: subTotals.reduce((acc, curr) => acc + curr, 0),
    });
  }, [subTotals]);

  // const total = subTotals.reduce((acc, curr) => acc + curr, 0);

  const addEnrollmentRow = () => {
    setFormData({
      ...formData,
      enrollments: [...formData.enrollments, initEnrollmentData],
    });

    setErrors({
      ...errors,
      enrollments: [
        ...errors.enrollments,
        {
          transactionId: "",
          studentId: "",
          classId: "",
          cba: "",
          delivery: "",
          tierId: "",
          status: "",
        },
      ],
    });

    setSubTotals([...subTotals, 0]);
  };

  const removeEnrollmentRow = (index: number) => {
    const newEnrollments = [...formData.enrollments];
    newEnrollments.splice(index, 1);
    setFormData({ ...formData, enrollments: newEnrollments });

    const newErrors = [...errors.enrollments];
    newErrors.splice(index, 1);
    setErrors({ ...errors, enrollments: newErrors });

    const newSubTotals = [...subTotals];
    newSubTotals.splice(index, 1);
    setSubTotals(newSubTotals);
  };

  const setEnrollment = (
    newEnrollment: CreateEnrollmentData,
    index: number,
  ) => {
    const newEnrollments = [...formData.enrollments];
    newEnrollments[index] = newEnrollment;
    setFormData({ ...formData, enrollments: newEnrollments });

    const newErrors = [...errors.enrollments];
    newErrors[index] = {
      transactionId: "",
      studentId: "",
      classId: "",
      cba: "",
      delivery: "",
      tierId: "",
      status: "",
    };
    setErrors({ ...errors, enrollments: newErrors });
  };

  const setSubTotal = (newSubTotal: number, index: number) => {
    const newSubTotals = [...subTotals];
    newSubTotals[index] = newSubTotal;
    setSubTotals(newSubTotals);
  };

  const addTransaction = async (formData: CreateTransactionData) => {
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
    formData: Partial<CreateTransactionData>,
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

    // if (!formData.payerId || !formData.payerType) {
    //   alert("Please fill in all required fields.");
    //   return;
    // }

    const transactionErrors = checkTransaction(formData);
    const enrollmentErrors = formData.enrollments.map((data) =>
      checkEnrollment(data, formData.payerType),
    );

    console.log("Transaction Errors:", transactionErrors);
    console.log("Enrollment Errors:", enrollmentErrors);

    setErrors({ ...transactionErrors, enrollments: enrollmentErrors });

    const hasTransactionErrors = Object.values(transactionErrors).some(
      (v) => !!v,
    );
    const hasEnrollmentErrors = enrollmentErrors.some((enrollmentError) =>
      Object.values(enrollmentError).some((v) => !!v),
    );

    if (hasTransactionErrors || hasEnrollmentErrors) {
      alert("Please fix the errors in the form.");
      return;
    }

    if (transaction) {
      updateTransaction(transaction.id, formData);
    } else {
      addTransaction(formData);
    }
  };

  return {
    addEnrollmentRow,
    removeEnrollmentRow,
    subTotals,
    setSubTotal,
    // total,
    loading,
    handleSubmit,
    formData,
    setFormData,
    setEnrollment,
    errors,
  };
};

export default useTransactionForm;
