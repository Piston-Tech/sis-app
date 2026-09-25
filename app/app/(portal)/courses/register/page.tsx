"use client";

import { BookOpen } from "lucide-react";
import CourseCard from "@/components/student/CourseCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/student/States";
import { useCourses } from "@/components/student/queries";

const CourseCataloguePage = () => {
  const { data, isPending, isError, error, refetch } = useCourses();

  if (isPending) return <LoadingState label="Loading courses..." />;
  if (isError) {
    return <ErrorState title="We couldn't load the course catalogue" error={error} onRetry={() => refetch()} />;
  }
  if (data.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses available"
        description="There are no courses open for enrolment right now. Please check back soon."
      />
    );
  }

  return (
    <div>
      <h1 className="sr-only">Course catalogue</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 2xl:grid-cols-3">
        {data.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default CourseCataloguePage;
