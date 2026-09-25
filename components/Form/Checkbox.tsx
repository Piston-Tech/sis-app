import cn from "@/utils/cn";
import { ChangeEventHandler, InputHTMLAttributes } from "react";
import { labelClass, useFieldIds } from "./fieldProps";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "onChange"
> {
  data: Record<string, any>;
  name: string;
  label: string;
  setData: (data: any) => void;
}

const Checkbox = ({
  label,
  name,
  data,
  setData,
  className,
  id,
  ...props
}: CheckboxProps) => {
  const { inputId } = useFieldIds(id);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setData({ ...data, [name]: e.target.checked });
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        {...props}
        type="checkbox"
        name={name}
        checked={!!data[name]}
        id={inputId}
        className={cn(
          "bg-zinc-50 border border-zinc-100 rounded-xl text-sm",
          className,
        )}
        onChange={onChange}
      />
      <label className={labelClass} htmlFor={inputId}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
