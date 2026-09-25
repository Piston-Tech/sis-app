import cn from "@/utils/cn";
import { ChangeEventHandler, SelectHTMLAttributes } from "react";
import ErrorMsg from "./ErrorMsg";
import { fieldClass, labelClass, useFieldIds } from "./fieldProps";

export type SelectOption = string | { value: string | number; title: string };

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange"
> {
  label: string;
  name: string;
  options: SelectOption[];
  data: Record<string, any>;
  setData: (data: any) => void;
  error?: string | null;
  placeholder?: string;
}

const Select = ({
  label,
  name,
  options,
  data,
  setData,
  error,
  id,
  className,
  placeholder = "- None -",
  ...props
}: SelectProps) => {
  const { inputId, errorId, aria } = useFieldIds(id, error);
  const value = data[name] ?? "";

  const onChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setData({ ...data, [name]: e.target.value });
  };

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <select
        id={inputId}
        name={name}
        className={cn(fieldClass, className)}
        value={value}
        onChange={onChange}
        {...aria}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={String(o.value)} value={o.value}>
              {o.title}
            </option>
          ),
        )}
      </select>
      <ErrorMsg id={errorId} message={error} />
    </div>
  );
};

export default Select;
