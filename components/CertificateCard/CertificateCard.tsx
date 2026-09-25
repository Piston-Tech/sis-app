"use client";

import CredentialDownloadButton from "@/components/student/CredentialDownloadButton";
import { formatDate } from "@/components/student/format";
import type { Credential } from "@/components/student/types";

const CertificateCard = (credential: Credential) => {
  const { courseTitle, issueDate, preview } = credential;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
      {/* Backend-generated data: URL preview, so a plain <img> is appropriate. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={preview}
        alt={`Certificate preview for ${courseTitle}`}
        className="aspect-[1.414] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold text-slate-900">{courseTitle}</h3>
        <p className="text-sm text-slate-600">
          Issue date: <span className="font-semibold text-slate-800">{formatDate(issueDate)}</span>
        </p>
        <div className="mt-auto pt-2">
          <CredentialDownloadButton
            credential={credential}
            label="Download certificate (PDF)"
            filename={`${courseTitle} Certificate.pdf`}
          />
        </div>
      </div>
    </article>
  );
};

export default CertificateCard;
