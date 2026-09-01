"use client";

import { useEffect, useState } from "react";
import { Clock, Download, LoaderCircle } from "lucide-react";
import apiClient from "@/services/apiClient";
import AppLayout from "@/components/AppLayout";
import CertificateCard from "@/components/CertificateCard";
import Certificate from "@/types/Certificate";
import Badge from "@/types/Badge";
import BadgeCard from "@/components/BadgeCard";

const UserCertificatesPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [certificates, setCertificates] = useState<Array<Certificate>>([]);

  const [isLoadingBadges, setIsLoadingBadges] = useState<boolean>(true);
  const [badges, setBadges] = useState<Array<Badge>>([]);

  useEffect(() => {
    apiClient
      .get("/students/certificates")
      .then((res) => {
        console.log(res.data.data);
        setCertificates(res.data.data);
      })
      .finally(() => setIsLoading(false));

    apiClient
      .get("/students/badges")
      .then((res) => {
        console.log(res.data.data);
        setBadges(res.data.data);
      })
      .finally(() => setIsLoadingBadges(false));
  }, []);

  return (
    <AppLayout>
      {/* <div className="space-y-8">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Certificates are coming soon
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your verified certificates will appear here when this feature
            launches.
          </p>
        </div>
      </div> */}
      <>
        <div className="flex flex-col gap-8 space-y-8">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10">
              Certificates
            </h3>
            {isLoading ? (
              <div className="">
                <div className="mx-auto flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                    <LoaderCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Loading certificates...
                  </h1>
                </div>
              </div>
            ) : certificates.length < 1 ? (
              <div className="">
                <div className="mx-auto flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900">
                    No certificates
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    You have not earned a certificate with us yet. Your verified
                    certificates will appear here when you take a course with
                    us.
                  </p>
                </div>
              </div>
            ) : (
              <div className="">
                <div className="grid grid-cols-4">
                  {certificates.map(({ ...props }, i) => (
                    <CertificateCard key={i} {...props} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10">
              Badges
            </h3>
            {isLoadingBadges ? (
              <div className="">
                <div className="mx-auto flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                    <LoaderCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Loading badges...
                  </h1>
                </div>
              </div>
            ) : badges.length < 1 ? (
              <div className="">
                <div className="mx-auto flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900">
                    No badges
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    You have not earned a badge with us yet. Your verified
                    badges will appear here when you take a course with us.
                  </p>
                </div>
              </div>
            ) : (
              <div className="">
                <div className="grid grid-cols-4">
                  {badges.map(({ ...props }, i) => (
                    <BadgeCard key={i} {...props} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    </AppLayout>
  );
};

export default UserCertificatesPage;
