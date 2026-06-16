import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
}

const Button = ({
  loading,
  type = "submit",
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`w-full py-3 bg-black text-white rounded-xl font-bold mt-4 ${className}`}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
