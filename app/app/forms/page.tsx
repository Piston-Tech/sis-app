import AppLayout from "@/components/AppLayout";
import { Award, Calendar, ChevronRight, Clock, CreditCard, HelpCircle } from "lucide-react";

const UserFormsPage = () => {
  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            title: "Course Rescheduling",
            desc: "Move your enrollment to a future cohort.",
            icon: Calendar,
          },
          {
            title: "Refund Request",
            desc: "Submit a request for tuition refund.",
            icon: CreditCard,
          },
          {
            title: "Certificate Correction",
            desc: "Request changes to name or details.",
            icon: Award,
          },
          {
            title: "Support Ticket",
            desc: "General help with academy services.",
            icon: HelpCircle,
          },
          {
            title: "Deferment Application",
            desc: "Pause your studies for a term.",
            icon: Clock,
          },
        ].map((form) => (
          <div
            key={form.title}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-indigo-600 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl group-hover:bg-indigo-600 transition-all">
                <form.icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-all" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none">
                  {form.title}
                </h4>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                  Form-ID: PNF-{(Math.random() * 1000).toFixed(0)}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              {form.desc}
            </p>
            <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center gap-3 group-hover:bg-slate-900 dark:group-hover:bg-white text-slate-900 dark:text-white group-hover:text-white dark:group-hover:text-slate-900 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest">
                Start Application
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default UserFormsPage;
