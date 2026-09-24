import cn from "@/utils/cn";
import { ChangeEventHandler, InputHTMLAttributes } from "react";
import ErrorMsg from "./ErrorMsg";
import { fieldClass, labelClass, useFieldIds } from "./fieldProps";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  data?: Record<string, any>;
  name?: string;
  label?: string;
  setData?: (data: any) => void;
  error?: string | null;
}

/** yyyy-mm-dd for a date-ish value; "" when empty or invalid (never throws). */
const toDateInputValue = (raw: unknown) => {
  if (raw === null || raw === undefined || raw === "") return "";
  const date = raw instanceof Date ? raw : new Date(String(raw));
  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const Input = ({
  label,
  name,
  data,
  setData,
  className,
  type,
  error,
  id,
  ...props
}: InputProps) => {
  const { inputId, errorId, aria } = useFieldIds(id, error);
  const bound = !!(data && name);

  let value: InputHTMLAttributes<HTMLInputElement>["value"] = props.value;
  if (bound) {
    const raw = data![name!];
    if (type === "date") value = toDateInputValue(raw);
    else if (type === "number")
      value = raw === null || raw === undefined || Number.isNaN(raw) ? "" : raw;
    else value = raw ?? "";
  }

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!bound || !setData) return;
    const input = e.target.value;
    let next: unknown = input;
    if (type === "date") next = input ? new Date(input) : null;
    else if (type === "number") {
      const parsed = parseFloat(input);
      next = input === "" || Number.isNaN(parsed) ? null : parsed;
    }
    setData({ ...data, [name!]: next });
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        className={cn(fieldClass, className)}
        {...aria}
        {...props}
        {...(bound ? { value, onChange } : {})}
      />
      <ErrorMsg id={errorId} message={error} />
    </div>
  );
};

export default Input;
