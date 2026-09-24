export type ReceiptRecipientSource = "student" | "billing_contact";

export interface ReceiptRecipient {
  name: string;
  email: string;
  source: ReceiptRecipientSource;
}

/** GET /admin/payments/:id/receipt/preview */
export interface ReceiptPreview {
  /** Existing receipt number, or the proposed next number. */
  receiptNo: string;
  recipient: ReceiptRecipient | null;
  /** Why there is no recipient (e.g. B2B without a billing contact). */
  missingRecipientReason?: string;
}

/** POST /admin/payments/:id/receipt body */
export interface SendReceiptBody {
  receiptNo?: string;
  to?: string;
  cc?: string[];
}
