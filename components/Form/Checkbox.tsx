import { ChangeEventHandler, InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  data: Record<string, any>;
  name: string;
  label: string;
  setData: (data: any) => void;
  checked?: boolean;
}

const Checkbox = ({
  label,
  name,
  data,
  setData,
  className,
  ...props
}: CheckboxProps) => {
  const onChange: ChangeEventHandler<HTMLInputElement, HTMLInputElement> = (
    e,
  ) => {
    const newData: Record<string, any> = {};

    newData[name] = e.target.checked;

    setData({
      ...data,
      ...newData,
    });
  };

  return (
    <div className="flex gap-2 items-center space-y-1">
      {/* <div> */}
      <input
        {...props}
        type="checkbox"
        checked={data[name]}
        id={name}
        className={`bg-zinc-50 border border-zinc-100 rounded-xl text-sm ${className}`}
        onChange={onChange}
      />
      {/* </div> */}
      <label
        className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
        htmlFor={name}
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
