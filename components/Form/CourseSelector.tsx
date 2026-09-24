import { Course } from "@/types";
import SearchSelect from "./SearchSelect";

type CourseOption = Pick<Course, "id" | "code" | "title">;

export default function CourseSelector({
  value,
  onChange,
  error,
  disabled,
}: {
  value: number | undefined;
  onChange: (id: number) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <SearchSelect<CourseOption>
      resource="courses"
      label="Select Course"
      placeholder="Search by code or title (e.g. CS101)"
      value={value}
      disabled={disabled}
      error={error}
      onSelect={(c) => onChange(c.id)}
      renderOption={(c) => (
        <>
          <span className="font-semibold">{c.code}</span> - {c.title}
        </>
      )}
    />
  );
}
