import apiClient from "@/services/apiClient";
import { Transaction } from "@/types";
import { useEffect, useState } from "react";

type TransactionKeys = keyof Transaction;

export interface UseTransactionProps extends Partial<
  Record<TransactionKeys, any>
> {
  page?: number;
  limit?: number;
  sort?: string;
}

interface TransactionSummary {
  id: number;
  transactionId: string;
  payerType: string;
  payerId: number;
  discount: number;
  noOfEnrollments: number;
  subTotal: number;
  totalPaid: number;
  totalDue: number;
  payer: {
    id: number;
    studentId?: string;
    companyId?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  balance: number;
  status: string;
  createdAt: string;
}

const useTransaction = (
  params: UseTransactionProps | undefined = undefined,
) => {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);

  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, any>).toString()
    : "";

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await apiClient.get(`/admin/transactions${queryString}`);
      console.log("Fetched transactions:", response.data);
      setTransactions(response.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // const deleteTransaction = async (id: number) => {
  //   try {
  //     await apiClient.delete(`/admin/transactions/${id}`);
  //     setTransactions((prevTransactions) =>
  //       prevTransactions.filter((transaction) => transaction.id !== id),
  //     );
  //   } catch (error) {
  //     console.error("Error deleting transaction:", error);
  //   }
  // };

  return {
    transactions,
    refreshTransactions: fetchTransactions,
  };
};

export default useTransaction;
