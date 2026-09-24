"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  CreditCard,
  FileBadge,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  UserRound,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface NavLink {
  name: string;
  icon: LucideIcon;
  href: string;
  /** Path prefix used to highlight the link. */
  match: string;
}

// Only pages backed by real data are listed. "My Program", "Community" and
// "Forms" were placeholders and have been removed.
const NAV_LINKS: NavLink[] = [
  { name: "Home", icon: LayoutDashboard, href: "/", match: "/" },
  { name: "Courses", icon: BookMarked, href: "/courses/recommendations", match: "/courses" },
  { name: "Certificates", icon: FileBadge, href: "/certificates", match: "/certificates" },
  { name: "Payments", icon: CreditCard, href: "/payments", match: "/payments" },
  { name: "Profile", icon: UserRound, href: "/profile", match: "/profile" },
];

const Sidebar = ({ isOpen, onClose, onLogout }: SidebarProps) => {
  const pathname = usePathname() ?? "/";

  const isActive = (link: NavLink) =>
    link.match === "/" ? pathname === "/" : pathname.startsWith(link.match);

  return (
    <>
      {isOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="student-sidebar"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "invisible -translate-x-full lg:visible"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <Image
              src="/logo-48.png"
              alt=""
              width={40}
              height={40}
              className="rounded-xs"
            />
            <span>
              <span className="block font-extrabold leading-tight text-slate-900">
                Piston &amp; Fusion
              </span>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Business Academy
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 text-slate-500 hover:text-slate-900 lg:hidden"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-y-2 px-4 py-6">
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all ${
                  active
                    ? "bg-primary-900 text-white shadow-lg shadow-primary-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={20} aria-hidden />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-4 py-3 font-semibold text-slate-600 hover:text-red-700"
          >
            <LogOut className="h-5 w-5" aria-hidden />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
