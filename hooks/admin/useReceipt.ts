import { useQuery } from "@tanstack/react-query";
import { Payment } from "@/types";
import { ReceiptPreview, SendReceiptBody } from "@/types/Receipt";
import { ApiError, adminKeys, adminRequest, buildQuery } from "./api";
import { useAdminMutation } from "./useResourceMutation";

const paymentPath = (paymentId: number | string) =>
  `/admin/payments/${encodeURIComponent(String(paymentId))}`;

/** Same-origin URL of the receipt PDF (DRAFT watermark until sent). */
export const receiptPdfUrl = (paymentId: number | string) =>
  `/api${paymentPath(paymentId)}/receipt.pdf`;

/** GET /admin/payments/:id/receipt/preview[?receiptNo=] */
export function useReceiptPreview(
  paymentId: number | null | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const query = useQuery<ReceiptPreview, ApiError>({
    queryKey: adminKeys.receiptPreview(paymentId ?? "none"),
    enabled: enabled && !!paymentId,
    // Always fresh: the proposed number / billing contact may have changed.
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      const body = await adminRequest<ReceiptPreview>(
        "get",
        `${paymentPath(paymentId!)}/receipt/preview${buildQuery({})}`,
      );
      return body.data;
    },
  });
  return {
    preview: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * POST /admin/payments/:id/receipt { receiptNo?, to?, cc? } — emails the PDF.
 * 409: not RECEIVED / number already used / no recipient; 502: email failed.
 */
export function useSendReceipt() {
  return useAdminMutation<
    { paymentId: number; body: SendReceiptBody },
    Payment
  >(
    ({ paymentId, body }) => ({
      method: "post",
      url: `${paymentPath(paymentId)}/receipt`,
      body,
    }),
    { invalidate: ["payments", "transactions"] },
  );
}
