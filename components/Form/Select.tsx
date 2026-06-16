import { ChangeEventHandler, SelectHTMLAttributes } from "react";
import ErrorMsg from "./ErrorMsg";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: Array<string | { value: string | number; title: string }>;
  data: Record<string, any>;
  setData: (data: any) => void;
  error: string | undefined;
}

const Select = ({ label, name, options, data, setData }: SelectProps) => {
  const value = data[name];

  const onChange: ChangeEventHandler<HTMLSelectElement, HTMLSelectElement> = (
    e,
  ) => {
    const newData: Record<string, any> = {};
    newData[name] = e.target.value;

    setData({
      ...data,
      ...newData,
    });
  };

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        {label}
      </label>
      <select
        className="w-full px-4 py-2 bg-white border border-zinc-100 rounded-xl text-sm"
        value={value}
        onChange={onChange}
      >
        <option value="">- None -</option>
        {options.map((o, i) => {
          return typeof o === "string" ? (
            <option key={i} value={o}>
              {o}
            </option>
          ) : (
            <option key={i} value={o.value}>
              {o.title}
            </option>
          );
        })}
      </select>
      {data.error && <ErrorMsg message={data.error} />}
    </div>
  );
};

export default Select;
