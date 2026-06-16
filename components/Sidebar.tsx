import React from "react";
import { User, UserDetails, UserRole } from "../types";
import Image from "next/image";
import {
  BookMarked,
  CreditCard,
  FileBadge,
  Form,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  LucideIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import logo48 from "@/public/logo-48.png";

interface SidebarProps {
  user: UserDetails | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onLogout,
}) => {
  const commonLinks: Array<{ name: string; icon: LucideIcon; href: string }> = [
    {
      name: "Home",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      name: "Courses",
      icon: BookMarked,
      href: "/courses",
    },
    {
      name: "My Program",
      icon: GraduationCap,
      href: "/my-program",
    },
    // {
    //   name: "Path",
    //   icon: GraduationCap,
    // },
    {
      name: "Certificates",
      icon: FileBadge,
      href: "/certificates",
    },
    {
      name: "Payments",
      icon: CreditCard,
      href: "/payments",
    },
    {
      name: "Community",
      icon: Users,
      href: "/community",
    },
    {
      name: "Forms",
      icon: Form,
      href: "/forms",
    },
  ];

  const menuItems = commonLinks;

  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col h-screen z-50 transition-transform duration-300 lg:sticky lg:translate-x-0 overflow-scroll ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-48.png"
              alt="Piston & Fusion Logo"
              width={40}
              height={40}
              className="rounded-xs"
            />
            {/* <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">PF</span>
            </div> */}
            <div>
              <h2 className="font-extrabold text-slate-900 leading-tight">
                Piston & Fusion
              </h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                Business Academy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col flex-1 px-4 py-6 gap-y-2">
          {menuItems.map(({ name, icon: Icon, href }) => (
            <Link href={href} key={name}>
              <button
                key={name}
                // onClick={() => {
                //   setActiveTab(name);
                //   onClose();
                // }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                  (href === "/" ? pathname === href : pathname.startsWith(href))
                    ? "bg-primary-900 text-white shadow-primary-200 shadow-lg"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={20} />
                {name}
              </button>
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-bold text-blue-400 mb-1">PRO TIP</p>
              <p className="text-[11px] text-slate-300 mb-4 leading-relaxed">
                Upgrade to Elite for 1-on-1 mentorship and job referrals.
              </p>
              <button className="text-[10px] font-bold bg-white text-slate-900 px-3 py-1.5 rounded-lg uppercase">
                Upgrade
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-600 rounded-full blur-2xl opacity-50"></div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-6 text-slate-500 hover:text-red-600 font-semibold"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
