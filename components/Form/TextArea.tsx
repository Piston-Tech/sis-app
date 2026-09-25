import cn from "@/utils/cn";
import { ChangeEventHandler, TextareaHTMLAttributes } from "react";
import ErrorMsg from "./ErrorMsg";
import { fieldClass, labelClass, useFieldIds } from "./fieldProps";

interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> {
  data: Record<string, any>;
  name: string;
  label: string;
  setData: (data: any) => void;
  error?: string | null;
}

const TextArea = ({
  label,
  name,
  data,
  setData,
  error,
  id,
  className,
  ...props
}: TextAreaProps) => {
  const { inputId, errorId, aria } = useFieldIds(id, error);
  const value = data[name] ?? "";

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setData({ ...data, [name]: e.target.value });
  };

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <textarea
        id={inputId}
        name={name}
        className={cn(fieldClass, className)}
        value={value}
        onChange={onChange}
        {...aria}
        {...props}
      ></textarea>
      <ErrorMsg id={errorId} message={error} />
    </div>
  );
};

export default TextArea;
