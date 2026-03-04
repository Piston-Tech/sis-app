import cn from "@/utils/cn";
import Link from "next/link";

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: any;
  label: string;
  active?: boolean;
}) => (
  <Link
    href={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
      active
        ? "bg-black text-white shadow-lg shadow-black/10"
        : "text-zinc-500 hover:bg-zinc-100 hover:text-black",
    )}
  >
    <Icon
      size={20}
      className={cn(
        "transition-transform duration-200 group-hover:scale-110",
        active ? "text-white" : "text-zinc-400",
      )}
    />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default SidebarItem;
