import { Company } from "@/types";
import SearchSelect from "./SearchSelect";

type CompanyOption = Pick<Company, "id" | "companyId" | "name">;

export default function CompanySelector({
  value,
  onChange,
  error,
  disabled,
  label = "Select Company",
}: {
  value: number | undefined;
  onChange: (id: number) => void;
  error?: string | null;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <SearchSelect<CompanyOption>
      resource="companies"
      label={label}
      placeholder="Search by company name or ID"
      value={value}
      disabled={disabled}
      error={error}
      onSelect={(c) => onChange(c.id)}
      renderOption={(c) => (
        <>
          <span className="font-semibold">{c.companyId}</span> - {c.name}
        </>
      )}
    />
  );
}
