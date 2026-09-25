import { Student } from "@/types";
import SearchSelect from "./SearchSelect";

export type StudentOption = Pick<
  Student,
  | "id"
  | "studentId"
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "phone"
>;

export default function StudentSelector({
  value,
  onChange,
  error,
  disabled,
  label = "Select Student",
}: {
  value: number | undefined;
  onChange: (id: number) => void;
  error?: string | null;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <SearchSelect<StudentOption>
      resource="students"
      label={label}
      placeholder="Search by name, email or student ID"
      value={value}
      disabled={disabled}
      error={error}
      onSelect={(s) => onChange(s.id)}
      renderOption={(s) => (
        <>
          <span className="font-semibold">{s.studentId}</span> - {s.firstName}{" "}
          {s.middleName ? `${s.middleName} ` : ""}
          {s.lastName}
        </>
      )}
    />
  );
}
