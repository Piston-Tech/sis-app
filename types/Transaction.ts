export default interface Transaction {
  id: number;
  transactionId: string;
  payerId: number;
  payerType: string;
  total: number;
  discount: number;
  nextPaymentDate: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateTransactionData = Omit<
  Transaction,
  | "id"
  | "transactionId"
  | "nextPaymentDate"
  | "createdAt"
  | "updatedAt"
>;
