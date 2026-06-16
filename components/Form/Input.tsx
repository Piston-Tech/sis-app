import { ChangeEventHandler, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  data?: Record<string, any>;
  name?: string;
  label?: string;
  setData?: (data: any) => void;
}

const Input = ({
  label,
  name,
  data,
  setData,
  className,
  type,
  ...props
}: InputProps) => {
  const value =
    data && name
      ? type === "date"
        ? new Date(data[name]).toISOString().slice(0, 10)
        : data[name]
      : props.value;

  const onChange: ChangeEventHandler<HTMLInputElement, HTMLInputElement> = (
    e,
  ) => {
    const newData: Record<string, any> = {};

    if (name && type === "date") {
      newData[name] = new Date(e.target.value);
    } else if (name && type === "number") {
      newData[name] = parseFloat(e.target.value);
    } else if (name && setData) {
      newData[name] = e.target.value;
    }

    if (setData) {
      setData({
        ...data,
        ...newData,
      });
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        {label}
      </label>
      <input
        type={type}
        className={`w-full px-4 py-2 bg-white border border-zinc-100 rounded-xl text-sm ${className}`}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

export default Input;
