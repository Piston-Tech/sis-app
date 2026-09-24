import { Plus } from "lucide-react";
import { ReactNode } from "react";

const PageHeader = ({
  title,
  description,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  /** Omit (e.g. for viewers) to hide the add button. */
  addLabel?: string;
  onAdd?: () => void;
  children?: ReactNode;
}) => (
  <header className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
        {title}
      </h1>
      <p className="text-zinc-500 mt-1">{description}</p>
    </div>
    <div className="flex items-center gap-3">
      {children}
      {addLabel && onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
        >
          <Plus size={18} aria-hidden="true" />
          {addLabel}
        </button>
      )}
    </div>
  </header>
);

export default PageHeader;
