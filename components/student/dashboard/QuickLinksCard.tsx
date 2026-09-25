import Link from "next/link";
import { Award, BookOpen, CreditCard, Mail, UserRound } from "lucide-react";
import { SUPPORT_EMAIL } from "@/constants/links";

const linkClass =
  "flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-left text-sm font-bold text-slate-800 transition-colors hover:bg-slate-100";

/** Shortcuts to real portal pages (no placeholder actions). */
const QuickLinksCard = () => (
  <nav
    aria-labelledby="quick-links-heading"
    className="space-y-4 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
  >
    <h2 id="quick-links-heading" className="text-base font-black uppercase text-slate-900">
      Quick links
    </h2>
    <ul className="space-y-3">
      <li>
        <Link href="/courses/enrollments" className={linkClass}>
          My enrollments <BookOpen className="h-4 w-4 text-slate-500" aria-hidden />
        </Link>
      </li>
      <li>
        <Link href="/certificates" className={linkClass}>
          Certificates &amp; badges <Award className="h-4 w-4 text-slate-500" aria-hidden />
        </Link>
      </li>
      <li>
        <Link href="/payments" className={linkClass}>
          Payments <CreditCard className="h-4 w-4 text-slate-500" aria-hidden />
        </Link>
      </li>
      <li>
        <Link href="/profile" className={linkClass}>
          Update my profile <UserRound className="h-4 w-4 text-slate-500" aria-hidden />
        </Link>
      </li>
      {SUPPORT_EMAIL && (
        <li>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
            <span className="text-blue-700">Email student support</span>
            <Mail className="h-4 w-4 text-blue-700" aria-hidden />
          </a>
        </li>
      )}
    </ul>
  </nav>
);

export default QuickLinksCard;
