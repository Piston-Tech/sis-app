import { Download, Search } from "lucide-react";
import { ReactNode, useId } from "react";

/** Search box + optional filters + CSV download for admin tables. */
const TableToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder,
  onDownload,
  downloadDisabled,
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  onDownload?: () => void;
  downloadDisabled?: boolean;
  /** Extra filter controls. */
  children?: ReactNode;
}) => {
  const id = useId();
  return (
    <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-48">
        <label htmlFor={id} className="sr-only">
          {searchPlaceholder}
        </label>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          size={18}
          aria-hidden="true"
        />
        <input
          id={id}
          type="search"
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {children}
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          disabled={downloadDisabled}
          aria-label="Download current page as CSV"
          title="Download current page as CSV"
          className="p-2 border border-zinc-100 rounded-xl hover:bg-zinc-50 text-zinc-600 disabled:opacity-40"
        >
          <Download size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default TableToolbar;
