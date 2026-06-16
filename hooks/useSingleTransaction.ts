import apiClient from "@/services/apiClient";
import {
  CreateEnrollmentData,
  Enrollment,
  Payment,
  Student,
  Tier,
  Transaction,
} from "@/types";
import { useEffect, useState } from "react";

interface SingleTransactionData {
  id: number;
  transactionId: string;
  payerType: string;
  payerId: number;
  discount: number;
  createdAt: string;
  noOfEnrollments: number;
  totalPaid: number;
  totalDue: number;
  payments: Array<Payment>;
  enrollments: Array<{
    id: number;
    enrollmentId: string;
    transactionId: number;
    studentId: number;
    classId: number;
    cba: string;
    delivery: string;
    tierId: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    student: Pick<
      Student,
      "studentId" | "firstName" | "middleName" | "lastName" | "email" | "phone"
    >;
    tier: Pick<
      Tier,
      | "id"
      | "name"
      | "shortName"
      | "subTitle"
      | "description"
      | "createdAt"
      | "updatedAt"
    >;
    class: {
      id: number;
      classId: string;
      courseId: number;
      plannedStartDate: string;
      schedule: string;
      isCustom: boolean;
      createdAt: string;
      updatedAt: string;
      course: {
        title: string;
        code: string;
        levelId: number;
        duration: number;
        prices: Array<{
          tierId: number;
          price: string;
          currency: string;
        }>;
      };
    };
  }>;
  payer: {
    id: number;
    studentId?: string;
    companyId?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  subTotal: number;
  balance: number;
  status: string;
}

// type SingleTransactionData = Transaction & {
//   enrollments: Enrollment[];
//   //   payments: Payment[];
//   subTotal: number;
//   totalPaid: number;
//   totalDue: number;
//   payer: {
//     id: number;
//     studentId?: string;
//     companyId?: string;
//     name?: string;
//     firstName?: string;
//     lastName?: string;
//     email: string;
//   };
//   balance: number;
//   status: string;
//   createdAt: string;
// };

const useSingleTransaction = (transactionId: string) => {
  const [transaction, setTransaction] = useState<SingleTransactionData>();

  const [addPaymentFormData, setAddPaymentFormData] = useState<
    Omit<Payment, "id" | "paymentId" | "createdAt" | "updatedAt">
  >({
    transactionId: 0,
    category: "",
    amountPaid: 0,
    status: "PENDING",
    receiptSent: false,
  });
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState<
    Record<
      keyof Omit<Payment, "id" | "paymentId" | "createdAt" | "updatedAt">,
      string
    >
  >({
    transactionId: "",
    category: "",
    amountPaid: "",
    status: "",
    receiptSent: "",
  });

  const [showAddEnrollment, setShowAddEnrollment] = useState(false);

  useEffect(() => {
    // Fetch transaction data here and set it to state
    apiClient.get(`/admin/transactions/${transactionId}`).then((response) => {
      setTransaction(response.data.data);
      setAddPaymentFormData({
        ...addPaymentFormData,
        transactionId: response.data.data.id,
        category: response.data.data.payerType,
      });
    });
  }, []);

  const handleAddPayment = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addPayment(addPaymentFormData);
  };

  const addPayment = async (
    formData: Omit<Payment, "id" | "paymentId" | "createdAt" | "updatedAt">
  ) => {
    setLoadingPayment(true);

    try {
      const { data } = await apiClient.post("/admin/payments", formData);

      console.log(data);

      if (data.success) {
        alert(data.message);
        close();
      } else {
        if (data.errors) {
          setPaymentErrors({ ...data.errors });
        } else if (data.error) {
          alert(data.error);
        }
      }
    } catch (e: any) {
      console.log(e);
      alert(e);
    } finally {
      setLoadingPayment(false);
    }
  };

  return {
    transaction,
    addPaymentFormData,
    setAddPaymentFormData,
    paymentErrors,
    loadingPayment,
    handleAddPayment,
    showAddEnrollment,
    setShowAddEnrollment,
  };
};

export default useSingleTransaction;
