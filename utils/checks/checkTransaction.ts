import { CreateTransactionData } from "@/types";

const checkTransaction = (transaction: CreateTransactionData) => {
  const errors: Record<keyof CreateTransactionData, string> = {
    discount: "",
    payerId: "",
    payerType: "",
  };

  if (transaction.discount < 0) {
    errors.discount = "Discount must be a positive value";
  }

  if (!transaction.payerId) {
    errors.payerId = "Payer is required";
  }

  if (!transaction.payerType) {
    errors.payerType = "Payer type is required";
  }

  return errors;
};

export default checkTransaction;
