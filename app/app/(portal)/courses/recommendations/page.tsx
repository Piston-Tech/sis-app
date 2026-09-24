"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import CourseCard from "@/components/student/CourseCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/student/States";
import { useRecommendations } from "@/components/student/queries";

const RecommendationsPage = () => {
  const { data, isPending, isError, error, refetch } = useRecommendations();

  if (isPending) return <LoadingState label="Finding courses for you..." />;
  if (isError) {
    return <ErrorState title="We couldn't load recommendations" error={error} onRetry={() => refetch()} />;
  }
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No recommendations yet"
        description="Add your current and goal profession to your profile to get personalised course suggestions."
        action={
          <Link href="/profile" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            Update profile
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="sr-only">Recommended courses</h1>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        {data.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPage;
