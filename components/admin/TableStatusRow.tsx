import { ApiError } from "@/hooks/admin/api";

export const StatusContent = ({
  isLoading,
  error,
  emptyText,
  onRetry,
}: {
  isLoading: boolean;
  error: ApiError | null;
  emptyText: string;
  onRetry?: () => void;
}) => {
  if (isLoading)
    return (
      <p role="status" className="text-zinc-500">
        Loading...
      </p>
    );
  if (error)
    return (
      <div role="alert" className="space-y-2">
        <p className="text-rose-600">{error.message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold"
          >
            Retry
          </button>
        )}
      </div>
    );
  return <p className="text-zinc-500">{emptyText}</p>;
};

/**
 * Loading / error / empty row for admin tables. Renders nothing when there
 * are rows to show.
 */
const TableStatusRow = ({
  colSpan,
  isLoading,
  error,
  isEmpty,
  emptyText,
  onRetry,
}: {
  colSpan: number;
  isLoading: boolean;
  error: ApiError | null;
  isEmpty: boolean;
  emptyText: string;
  onRetry?: () => void;
}) => {
  if (!isLoading && !error && !isEmpty) return null;
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-sm">
        <StatusContent
          isLoading={isLoading}
          error={error}
          emptyText={emptyText}
          onRetry={onRetry}
        />
      </td>
    </tr>
  );
};

export default TableStatusRow;
