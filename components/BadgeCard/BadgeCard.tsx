"use client";

import CredentialDownloadButton from "@/components/student/CredentialDownloadButton";
import type { Credential } from "@/components/student/types";

const BadgeCard = (credential: Credential) => {
  const { courseTitle, preview } = credential;

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-lg">
      {/* Backend-generated data: URL preview, so a plain <img> is appropriate. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt={`Digital badge for ${courseTitle}`} className="aspect-square w-full object-contain" />
      <h3 className="font-bold text-slate-900">{courseTitle}</h3>
      <div className="mt-auto">
        <CredentialDownloadButton
          credential={credential}
          label="Download badge"
          filename={`${courseTitle} Badge.png`}
        />
      </div>
    </article>
  );
};

export default BadgeCard;
