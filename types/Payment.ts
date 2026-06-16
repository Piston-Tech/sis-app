export default interface Payment {
  id: number;
  paymentId: string;
  transactionId: number;
  category: string;
  amountPaid: number;
  status: string;
  receiptSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}


