import { SelectedClassSearch } from "@/types";
import SearchSelect from "./SearchSelect";

export default function ClassSelector({
  value,
  onChange,
  error,
  disabled,
}: {
  value: number | undefined;
  onChange: (data: SelectedClassSearch) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <SearchSelect<SelectedClassSearch>
      resource="classes"
      label="Select Class"
      placeholder="Search by course code or title (e.g. CS101)"
      value={value}
      disabled={disabled}
      error={error}
      onSelect={onChange}
      renderOption={(c) => (
        <>
          <span className="font-semibold">
            {new Date(c.plannedStartDate).toDateString()}
          </span>{" "}
          - {c.course?.title} ({c.course?.code})
        </>
      )}
    />
  );
}
