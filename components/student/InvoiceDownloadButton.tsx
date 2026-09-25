"use client";

import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { downloadApiFile } from "./download";
import { getErrorMessage } from "./errors";
import { useToast } from "./Toast";

/** Downloads the student's invoice & receipt PDF (GET /api/student/invoice-pdf). */
const InvoiceDownloadButton = ({ className = "" }: { className?: string }) => {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const download = async () => {
    setBusy(true);
    try {
      await downloadApiFile("/student/invoice-pdf", "invoice-receipt.pdf");
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't generate your invoice. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-700 disabled:opacity-60 ${className}`}
    >
      {busy ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Download className="h-4 w-4" aria-hidden />
      )}
      {busy ? "Preparing PDF..." : "Download invoice & receipt (PDF)"}
    </button>
  );
};

export default InvoiceDownloadButton;
