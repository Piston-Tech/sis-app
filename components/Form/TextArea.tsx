import { ChangeEventHandler, TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  data: Record<string, any>;
  name: string;
  label: string;
  setData: (data: any) => void;
}

const TextArea = ({ label, name, data, setData }: TextAreaProps) => {
  const value = data[name];
  const onChange: ChangeEventHandler<
    HTMLTextAreaElement,
    HTMLTextAreaElement
  > = (e) => {
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
      <textarea
        className="w-full px-4 py-2 bg-white border border-zinc-100 rounded-xl text-sm"
        value={value}
        onChange={onChange}
      ></textarea>
    </div>
  );
};

export default TextArea;
