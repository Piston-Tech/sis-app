import cn from "@/utils/cn";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** While true the button is disabled and announces aria-busy. */
  loading?: boolean;
  loadingText?: string;
}

const Button = ({
  loading = false,
  loadingText = "Saving...",
  disabled,
  type = "submit",
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "w-full py-3 bg-black text-white rounded-xl font-bold mt-4 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
};

export default Button;
