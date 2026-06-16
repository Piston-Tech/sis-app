import apiClient from "@/services/apiClient";
import { Payment, Transaction } from "@/types";
import { useEffect, useState } from "react";

type PaymentKeys = keyof Payment;

export interface UsePaymentProps extends Partial<Record<PaymentKeys, any>> {
  page?: number;
  limit?: number;
  sort?: string;
}

// interface PaymentSummary {
//   id: number;
//   paymentId: string;
//   transactionId: string;
//   category: string;
//   amountPaid: number;
//   status: string;
//   receiptSent: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

const usePayment = (params: UsePaymentProps | undefined = undefined) => {
  const [payments, setPayments] = useState<
    Array<
      Payment & {
        transaction: Pick<
          Transaction,
          "id" | "transactionId" | "payerId" | "payerType"
        > & { payer: any };
      }
    >
  >([]);

  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, any>).toString()
    : "";

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await apiClient.get(`/admin/payments${queryString}`);
      console.log("Fetched payments:", response.data);
      setPayments(response.data.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  // const deletePayment = async (id: number) => {
  //   try {
  //     await apiClient.delete(`/admin/payments/${id}`);
  //     setPayments((prevPayments) =>
  //       prevPayments.filter((payment) => payment.id !== id),
  //     );
  //   } catch (error) {
  //     console.error("Error deleting payment:", error);
  //   }
  // };

  return {
    payments,
    refreshPayments: fetchPayments,
  };
};

export default usePayment;
