import type { ManagedAdmin } from "@/types/AdminDetails";
import { ACCESS_LEVEL_LABELS, normaliseAccessLevel } from "@/utils/adminAccess";
import cn from "@/utils/cn";

const LEVEL_BADGE: Record<string, string> = {
  superadmin: "bg-black text-white",
  admin: "bg-zinc-100 text-zinc-800",
  viewer: "bg-blue-50 text-blue-800",
};

export const StatusBadge = ({ admin }: { admin: ManagedAdmin }) =>
  admin.isActive === false ? (
    <span className="inline-flex whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
      Deactivated
    </span>
  ) : admin.mustChangePassword ? (
    <span className="inline-flex whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
      Temporary password
    </span>
  ) : (
    <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
      Active
    </span>
  );

export const AccessBadge = ({ level }: { level: unknown }) => {
  const normalised = normaliseAccessLevel(level);
  return (
    <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold", LEVEL_BADGE[normalised])}>
      {ACCESS_LEVEL_LABELS[normalised]}
    </span>
  );
};
