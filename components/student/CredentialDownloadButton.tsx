"use client";

import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { downloadApiFile } from "./download";
import { getErrorMessage } from "./errors";
import { useToast } from "./Toast";
import type { Credential } from "./types";

interface Props {
  credential: Credential;
  label: string;
  filename: string;
}

/** Why a credential can't be downloaded yet, if it can't. */
export const credentialBlocker = ({ issued, owing }: Credential) =>
  !issued
    ? "Available once your class has finished."
    : owing
      ? "Available once your fees are fully paid."
      : null;

const CredentialDownloadButton = ({ credential, label, filename }: Props) => {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const blocker = credentialBlocker(credential);
  const hintId = `credential-hint-${credential.enrollmentId}-${label.replace(/\W+/g, "-")}`;

  const download = async () => {
    setBusy(true);
    try {
      await downloadApiFile(credential.download, filename);
    } catch (error) {
      toast.error(getErrorMessage(error, "The download failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={download}
        disabled={busy || Boolean(blocker)}
        aria-describedby={blocker ? hintId : undefined}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Download className="h-4 w-4" aria-hidden />
        )}
        {busy ? "Downloading..." : label}
      </button>
      {blocker && (
        <p id={hintId} className="text-center text-sm text-slate-600">
          {blocker}
        </p>
      )}
    </div>
  );
};

export default CredentialDownloadButton;
