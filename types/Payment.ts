export default interface Payment {
  id: number;
  paymentId: string;
  transactionId: number;
  category: string;
  amountPaid: number;
  status: string;
  receiptSent: boolean;
  /** e.g. "RC-2608-026"; null until a receipt number is issued. */
  receiptNo?: string | null;
  receiptSentAt?: string | Date | null;
  receiptSentTo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
