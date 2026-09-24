"use client";

import { useMemo } from "react";
import { useGlobal } from "@/app/GlobalProvider";
import Loading from "@/app/app/loading";
import ReferralPanel from "@/components/ReferralPanel";
import { ErrorState } from "@/components/student/States";
import { useDashboard } from "@/components/student/queries";
import { buildDashboardModel } from "@/components/student/dashboard/model";
import NextSessionHero from "@/components/student/dashboard/NextSessionHero";
import WelcomeHero from "@/components/student/dashboard/WelcomeHero";
import ActiveCourseCard from "@/components/student/dashboard/ActiveCourseCard";
import AccountSummaryCard from "@/components/student/dashboard/AccountSummaryCard";
import RecommendationsCard from "@/components/student/dashboard/RecommendationsCard";
import QuickLinksCard from "@/components/student/dashboard/QuickLinksCard";

const UserDashboardPage = () => {
  const { currentUser: user } = useGlobal();
  const { data, isPending, isError, error, refetch } = useDashboard();

  const model = useMemo(() => (data ? buildDashboardModel(data) : null), [data]);

  if (isPending) return <Loading />;

  if (isError || !model) {
    return (
      <ErrorState
        title="We couldn't load your dashboard"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  const { activeEnrollment } = model;

  return (
    <div className="space-y-8">
      {activeEnrollment ? (
        <NextSessionHero enrollment={activeEnrollment} session={model.nextSession} />
      ) : (
        <WelcomeHero
          firstName={user?.firstName}
          enrollmentCount={model.enrollmentCount}
          completedCount={model.completedCount}
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {activeEnrollment && (
            <ActiveCourseCard enrollment={activeEnrollment} sessions={model.activeSessions} />
          )}
          <RecommendationsCard />
          <ReferralPanel />
        </div>

        <div className="space-y-8 lg:col-span-4">
          <AccountSummaryCard totals={model.totals} billingEntity={model.billingEntity} />
          <QuickLinksCard />
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
