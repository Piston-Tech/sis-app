"use client";

import { Award, FileBadge } from "lucide-react";
import CertificateCard from "@/components/CertificateCard";
import BadgeCard from "@/components/BadgeCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/student/States";
import { useBadges, useCertificates } from "@/components/student/queries";

const gridClass = "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

const UserCertificatesPage = () => {
  const certificates = useCertificates();
  const badges = useBadges();

  return (
    <div className="flex flex-col gap-12">
      <h1 className="sr-only">Certificates and badges</h1>

      <section aria-labelledby="certificates-heading">
        <h2 id="certificates-heading" className="mb-6 text-2xl font-black text-slate-900">
          Certificates
        </h2>
        {certificates.isPending ? (
          <LoadingState label="Loading certificates..." />
        ) : certificates.isError ? (
          <ErrorState
            title="We couldn't load your certificates"
            error={certificates.error}
            onRetry={() => certificates.refetch()}
          />
        ) : certificates.data.length === 0 ? (
          <EmptyState
            icon={FileBadge}
            title="No certificates yet"
            description="Certificates for the courses you take with us will appear here."
          />
        ) : (
          <div className={gridClass}>
            {certificates.data.map((certificate) => (
              <CertificateCard key={certificate.enrollmentId} {...certificate} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="mb-6 text-2xl font-black text-slate-900">
          Badges
        </h2>
        {badges.isPending ? (
          <LoadingState label="Loading badges..." />
        ) : badges.isError ? (
          <ErrorState
            title="We couldn't load your badges"
            error={badges.error}
            onRetry={() => badges.refetch()}
          />
        ) : badges.data.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No badges yet"
            description="Digital badges for the courses you take with us will appear here."
          />
        ) : (
          <div className={gridClass}>
            {badges.data.map((badge) => (
              <BadgeCard key={badge.enrollmentId} {...badge} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserCertificatesPage;
