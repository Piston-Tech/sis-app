import cn from "@/utils/cn";

const Card = ({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div
    className={cn(
      "bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden",
      className,
    )}
  >
    {(title || action) && (
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div>
          {title && <h3 className="font-semibold text-zinc-900">{title}</h3>}
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export default Card;
