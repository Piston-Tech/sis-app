import { Pagination as PaginationInfo } from "@/hooks/admin/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  pagination,
  page,
  onPageChange,
  isFetching,
  itemCount,
  isSearch,
}: {
  pagination: PaginationInfo | undefined;
  page: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
  itemCount: number;
  /** Search results are a single, capped page. */
  isSearch?: boolean;
}) => {
  if (isSearch) {
    return (
      <div className="px-6 py-3 border-t border-zinc-100 text-xs text-zinc-500">
        Showing {itemCount} best match{itemCount === 1 ? "" : "es"} (search
        results are limited to 15).
      </div>
    );
  }

  const totalPages = Math.max(1, pagination?.totalPages ?? page);
  const total =
    pagination && pagination.total >= 0 ? pagination.total : undefined;
  const limit = pagination?.limit ?? itemCount;
  const from = itemCount ? (page - 1) * limit + 1 : 0;
  const to = itemCount ? from + itemCount - 1 : 0;

  return (
    <nav
      aria-label="Pagination"
      className="px-6 py-3 border-t border-zinc-100 flex items-center justify-between gap-4 text-xs text-zinc-500"
    >
      <p aria-live="polite">
        {itemCount
          ? `Showing ${from}-${to}${total !== undefined ? ` of ${total}` : ""}`
          : "No results"}
        {isFetching ? " (updating...)" : ""}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="p-2 rounded-lg border border-zinc-100 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="p-2 rounded-lg border border-zinc-100 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
